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

            console.log('Sincronização (Pull) completa');
        } catch (e) {
            console.error('Falha na sincronização (Pull):', e);
        }
    },

    async uploadFileToStorage(localUri: string, bucket: string, path: string): Promise<string | null> {
        try {
            const response = await fetch(localUri);
            const arrayBuffer = await response.arrayBuffer();

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(path, arrayBuffer, {
                    contentType: 'image/jpeg',
                    upsert: true,
                });

            if (uploadError) {
                console.error(`Erro upload storage (${bucket}):`, uploadError);
                return null;
            }

            const { data } = supabase.storage.from(bucket).getPublicUrl(path);
            return data.publicUrl;
        } catch (e) {
            console.error('Falha ao ler/enviar arquivo local:', e);
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
        // Nota: expo-sqlite não suporta Upsert complexo facilmente de uma só vez para todas as colunas, 
        // então iteramos ou usamos uma transação.
        await db.withTransactionAsync(async () => {
            for (const row of data) {
                const columns = Object.keys(row).join(', ');
                const placeholders = Object.keys(row).map(() => '?').join(', ');
                const values = Object.values(row);

                // SQLite UPSERT syntax
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

        console.log(`Processando ${mutations.length} alterações...`);

        // 2. Processar fila
        for (const mutation of mutations) {
            try {
                let payload = JSON.parse(mutation.data);
                const { table_name, action, record_id } = mutation;

                // 2a. Interceptar Imagens Locais (file://) e Fazer Upload
                if (payload.image_url && payload.image_url.startsWith('file://')) {
                    console.log(`Detectada imagem local na tabela ${table_name}. Tentando upload...`);
                    const fileExt = payload.image_url.split('.').pop() || 'jpg';
                    const bucket = table_name === 'memories' ? 'memories' : 'trip-images';
                    // Usar uma estratégia de caminho simples ou tentar extrair user_id se disponível, fallback para 'unsorted'
                    const userId = payload.user_id || 'unsorted';
                    const fileName = `${userId}/${Date.now()}_sync.${fileExt}`;

                    const publicUrl = await this.uploadFileToStorage(payload.image_url, bucket, fileName);

                    if (publicUrl) {
                        payload.image_url = publicUrl;
                        console.log('Imagem enviada com sucesso. URL atualizada:', publicUrl);

                        // Opcional: Atualizar também no banco local para corrigir o caminho antigo?
                        // await db.runAsync(`UPDATE ${table_name} SET image_url = ? WHERE id = ?`, [publicUrl, record_id]);
                    } else {
                        console.warn('Falha no upload da imagem. Tentando enviar mutation com URL local mesmo (pode falhar no web).');
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
            } catch (e) {
                console.error(`Falha ao enviar alteração ${mutation.id}:`, e);
                // Opcional: Implementar contagem de tentativas ou pular
            }
        }
    },

    async pullDeletions(tableName: string) {
        try {
            // 1. Buscar IDs Remotos
            const { data: remoteData, error } = await supabase
                .from(tableName as any)
                .select('id');

            if (error) throw error;
            const remoteIds = new Set((remoteData as any[] || []).map(r => r.id));

            // 2. Buscar IDs Locais
            const localRows = await db.getAllAsync<{ id: string }>(`SELECT id FROM ${tableName}`);
            const localIds = localRows.map(r => r.id);

            // 3. Buscar Inserções Pendentes (criações locais ainda não enviadas)
            const pendingInserts = await db.getAllAsync<{ record_id: string }>(
                'SELECT record_id FROM mutation_queue WHERE table_name = ? AND action = ?',
                [tableName, 'INSERT']
            );
            const pendingInsertIds = new Set(pendingInserts.map(r => r.record_id));

            // 4. Determinar IDs para Excluir (Local existe, Remoto faltando, Não é inserção pendente)
            const toDelete = localIds.filter(id => !remoteIds.has(id) && !pendingInsertIds.has(id));

            if (toDelete.length > 0) {
                console.log(`Sincronizando remoções: Excluindo ${toDelete.length} itens de ${tableName} locais.`);
                // Exclusão em lote
                const placeholders = toDelete.map(() => '?').join(',');
                await db.runAsync(`DELETE FROM ${tableName} WHERE id IN (${placeholders})`, toDelete);
            }
        } catch (e) {
            console.error(`Falha ao sincronizar remoções de ${tableName}:`, e);
        }
    }
};
