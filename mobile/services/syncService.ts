import { supabase } from '../lib/supabase';
import { getDB, MutationAction } from './localDb';
import NetInfo from '@react-native-community/netinfo';
import { Database } from '../types/database-types';

const db = getDB();

export const SyncService = {
    async pull() {
        const isConnected = (await NetInfo.fetch()).isConnected;
        if (!isConnected) return;

        try {
            await this.pullTable('trips');
            await this.pullTable('expenses');
            await this.pullTable('memories');
            await this.pullTable('profiles');

            // Sincronizar Exclusões (Tratar Remoções Remotas)
            await this.pullDeletions('trips');
            await this.pullDeletions('expenses');
            await this.pullDeletions('memories');

        } catch (e: any) {
            const msg = e.message || JSON.stringify(e);
            if (msg.includes('Network request failed') || msg.includes('network')) {
                // Sincronização pausada (Offline)
            } else {
                // Falha na sincronização (Pull)
            }
        }
    },

    async resetSync() {
        // Reseta o estado de sincronização para forçar um pull completo
        await db.runAsync('UPDATE sync_state SET last_synced_at = 0');
        await this.pull();
        return true;
    },

    async uploadFileToStorage(localUri: string, bucket: string, path: string): Promise<string | null> {
        try {
            const response = await fetch(localUri);
            if (!response.ok) {
                return null;
            }

            const arrayBuffer = await response.arrayBuffer();

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(path, arrayBuffer, {
                    contentType: 'image/jpeg',
                    upsert: true,
                });

            if (uploadError) {
                return null;
            }

            const { data } = supabase.storage.from(bucket).getPublicUrl(path);
            return data.publicUrl;
        } catch (e: any) {
            return null;
        }
    },

    async pullTable(tableName: string) {
        // 1. Obter última hora de sincronização
        const result = await db.getFirstAsync<{ last_synced_at: string }>(
            'SELECT last_synced_at FROM sync_state WHERE table_name = ?',
            [tableName]
        );
        const lastSyncedAt = result?.last_synced_at || '1970-01-01T00:00:00Z';

        // 2. Buscar do Supabase
        const { data, error } = await supabase
            .from(tableName as any)
            .select('*')
            .gt('updated_at', lastSyncedAt);

        if (error) throw error;
        if (!data || data.length === 0) return;

        // 3. Upsert no Banco Local
        await db.withTransactionAsync(async () => {
            for (const row of data) {
                const columns = Object.keys(row).join(', ');
                const placeholders = Object.keys(row).map(() => '?').join(', ');
                const values = Object.values(row);

                await db.runAsync(
                    `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) 
                ON CONFLICT(id) DO UPDATE SET 
                ${Object.keys(row).map(c => `${c}=excluded.${c}`).join(', ')}`,
                    values as any[]
                );
            }

            // 4. Atualizar estado de sincronização
            const now = new Date().toISOString();
            await db.runAsync(
                `INSERT INTO sync_state (table_name, last_synced_at) VALUES (?, ?)
             ON CONFLICT(table_name) DO UPDATE SET last_synced_at = excluded.last_synced_at`,
                [tableName, now]
            );
        });
    },

    async push() {
        const isConnected = (await NetInfo.fetch()).isConnected;
        if (!isConnected) return;

        // 1. Obter mutações
        const mutations = await db.getAllAsync<{
            id: number;
            table_name: string;
            action: MutationAction;
            data: string;
            record_id: string;
        }>('SELECT * FROM mutation_queue ORDER BY created_at ASC');

        if (mutations.length === 0) return;

        // 2. Processar fila
        for (const mutation of mutations) {
            try {
                let payload = JSON.parse(mutation.data);
                const { table_name, action, record_id } = mutation;

                // 2a. Interceptar Imagens Locais (file://) e Fazer Upload
                if (payload.image_url && payload.image_url.startsWith('file://')) {
                    const fileExt = payload.image_url.split('.').pop() || 'jpg';
                    let bucket = 'trip-images';
                    if (table_name === 'memories') bucket = 'memories';
                    if (table_name === 'profiles') bucket = 'avatars';

                    const userId = payload.user_id || 'unsorted';
                    // Usar timestamp para garantir unicidade e path limpo
                    const fileName = `${userId}/${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;

                    const publicUrl = await this.uploadFileToStorage(payload.image_url, bucket, fileName);

                    if (publicUrl) {
                        payload.image_url = publicUrl;

                        // Atualizar também no banco local para corrigir o caminho antigo e evitar re-upload desnecessário se falhar depois
                        await db.runAsync(`UPDATE ${table_name} SET image_url = ? WHERE id = ?`, [publicUrl, record_id]);
                    } else {
                        // Falha crítica no upload da imagem para ${table_name} (ID: ${record_id}).
                        // Abortando sincronização deste item para tentar novamente mais tarde. Item permanece na fila.
                        // Pula para a próxima mutação, mantendo esta na fila para retry
                        continue;
                    }
                }

                if (action === 'INSERT') {
                    await supabase.from(table_name as any).insert(payload);
                } else if (action === 'UPDATE') {
                    await supabase.from(table_name as any).update(payload).eq('id', record_id);
                } else if (action === 'DELETE') {
                    await supabase.from(table_name as any).delete().eq('id', record_id);
                }

                // 3. Remover da fila em caso de sucesso
                await db.runAsync('DELETE FROM mutation_queue WHERE id = ?', [mutation.id]);
            } catch (e: any) {
                const msg = e.message || JSON.stringify(e);
                if (msg.includes('Network request failed') || msg.includes('network')) {
                    // Push pausado para mutation ${mutation.id} (Offline)
                    break;
                } else {
                    // Falha ao enviar alteração ${mutation.id}:
                }
            }
        }
    },

    async pullDeletions(tableName: string) {
        try {
            const { data: remoteData, error } = await supabase
                .from(tableName as any)
                .select('id');

            if (error) throw error;
            const remoteIds = new Set((remoteData as any[] || []).map(r => r.id));

            const localRows = await db.getAllAsync<{ id: string }>(`SELECT id FROM ${tableName}`);
            const localIds = localRows.map(r => r.id);

            const pendingInserts = await db.getAllAsync<{ record_id: string }>(
                'SELECT record_id FROM mutation_queue WHERE table_name = ? AND action = ?',
                [tableName, 'INSERT']
            );
            const pendingInsertIds = new Set(pendingInserts.map(r => r.record_id));

            const toDelete = localIds.filter(id => !remoteIds.has(id) && !pendingInsertIds.has(id));

            if (toDelete.length > 0) {
                const placeholders = toDelete.map(() => '?').join(',');
                await db.runAsync(`DELETE FROM ${tableName} WHERE id IN (${placeholders})`, toDelete);
            }
        } catch (e: any) {
            const msg = e.message || JSON.stringify(e);
            if (!msg.includes('Network request failed')) {
                // Falha ao sincronizar remoções de ${tableName}
            }
        }
    }
};
