import { getDB, queueMutation } from './localDb';
import { SyncService } from './syncService';
import { supabase } from '../lib/supabase';
import NetInfo from '@react-native-community/netinfo';
import { Database } from '../types/database-types';

const db = getDB();

export type TripRow = Database['public']['Tables']['trips']['Row'];
export type TripInsert = Database['public']['Tables']['trips']['Insert'];
export type ExpenseRow = Database['public']['Tables']['expenses']['Row'];
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];
export type MemoryRow = Database['public']['Tables']['memories']['Row'];
export type MemoryInsert = Database['public']['Tables']['memories']['Insert'];
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

const isOnline = async () => {
    const state = await NetInfo.fetch();
    return !!state.isConnected;
};

// Polyfill Gerador de UUID
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// Auxiliar: Atualização Otimista
// 1. Escreve no BD Local
// 2. Coloca Mutação na Fila
// 3. Tenta Enviar (se online)
const optimisticWrite = async (
    table: string,
    action: 'INSERT' | 'UPDATE' | 'DELETE',
    data: any,
    recordId: string,
    sqlQuery: string,
    sqlParams: any[]
) => {
    try {
        // 1. Gravação Local
        await db.runAsync(sqlQuery, sqlParams);

        // 2. Fila
        await queueMutation(table, action, recordId, data);

        // 3. Tentar Enviar
        const online = await isOnline();
        if (online) {
            SyncService.push();
        } else {
            // Offline - push adiado
        }
    } catch (e) {
        // Gravação Otimista Falhou
        throw e;
    }
};

export const api = {
    trips: {
        async list() {
            // Ler do BD Local
            return await db.getAllAsync<TripRow>('SELECT * FROM trips ORDER BY start_date ASC');
        },

        async create(trip: TripInsert) {
            const id = trip.id || generateUUID();
            const newTrip = { ...trip, id, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), status: trip.status || 'planning' };

            await optimisticWrite(
                'trips', 'INSERT', newTrip, id,
                `INSERT INTO trips (id, destination, start_date, end_date, image_url, status, description, user_id, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, newTrip.destination, newTrip.start_date, newTrip.end_date, newTrip.image_url, newTrip.status, newTrip.description, newTrip.user_id, newTrip.created_at, newTrip.updated_at]
            );
            return newTrip;
        },

        async update(id: string, updates: Partial<TripInsert>) {
            await optimisticWrite(
                'trips', 'UPDATE', updates, id,
                `UPDATE trips SET ${Object.keys(updates).map(k => `${k} = ?`).join(', ')} WHERE id = ?`,
                [...Object.values(updates), id]
            );
            return updates; // Retornar parcial
        },

        async get(id: string) {
            return await db.getFirstAsync<TripRow>('SELECT * FROM trips WHERE id = ?', [id]);
        },

        async delete(id: string) {
            await optimisticWrite(
                'trips', 'DELETE', {}, id,
                'DELETE FROM trips WHERE id = ?',
                [id]
            );
        }
    },

    expenses: {
        async list(tripId: string) {
            return await db.getAllAsync<ExpenseRow>(
                'SELECT * FROM expenses WHERE trip_id = ? ORDER BY date DESC',
                [tripId]
            );
        },

        async create(expense: ExpenseInsert) {
            const id = expense.id || generateUUID();
            const newExpense = { ...expense, id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };

            await optimisticWrite(
                'expenses', 'INSERT', newExpense, id,
                `INSERT INTO expenses (id, trip_id, amount, category, description, date, user_id, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, newExpense.trip_id, newExpense.amount, newExpense.category, newExpense.description, newExpense.date, newExpense.user_id, newExpense.created_at, newExpense.updated_at]
            );
            return newExpense;
        },

        async update(id: string, updates: Partial<ExpenseInsert>) {
            await optimisticWrite(
                'expenses', 'UPDATE', updates, id,
                `UPDATE expenses SET ${Object.keys(updates).map(k => `${k} = ?`).join(', ')} WHERE id = ?`,
                [...Object.values(updates), id]
            );
            return updates;
        },

        async delete(id: string) {
            await optimisticWrite(
                'expenses', 'DELETE', {}, id,
                'DELETE FROM expenses WHERE id = ?',
                [id]
            );
        }
    },

    memories: {
        async list(tripId: string) {
            const result = await db.getAllAsync<MemoryRow>(
                'SELECT * FROM memories WHERE trip_id = ? ORDER BY taken_at DESC',
                [tripId]
            );
            return result;
        },

        async sync() {
            const online = await isOnline();
            if (online) {
                await SyncService.pull();
            }
        },

        async create(memory: MemoryInsert) {
            const id = memory.id || generateUUID();
            const newMemory = { ...memory, id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };

            await optimisticWrite(
                'memories', 'INSERT', newMemory, id,
                `INSERT INTO memories (id, trip_id, image_url, caption, location, taken_at, user_id, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, newMemory.trip_id, newMemory.image_url, newMemory.caption, newMemory.location, newMemory.taken_at, newMemory.user_id, newMemory.created_at, newMemory.updated_at]
            );
            return newMemory;
        },

        async delete(id: string) {
            await optimisticWrite(
                'memories', 'DELETE', {}, id,
                'DELETE FROM memories WHERE id = ?',
                [id]
            );
        },

        uploadImage: async (uri: string, userId: string): Promise<string> => {
            // Passagem direta para o Supabase por enquanto, mais simples que blobs offline
            const fileExt = uri.split('.').pop();
            const fileName = `${userId}/${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const response = await fetch(uri);
            const fileData = await response.arrayBuffer();

            const { error: uploadError } = await supabase.storage
                .from('memories')
                .upload(filePath, fileData, {
                    contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('memories').getPublicUrl(filePath);
            return data.publicUrl;
        }
    },

    profiles: {
        async get(id: string) {
            return await db.getFirstAsync<ProfileRow>('SELECT * FROM profiles WHERE id = ?', [id]);
        },

        async update(id: string, updates: Partial<ProfileInsert>) {
            await optimisticWrite(
                'profiles', 'UPDATE', updates, id,
                `UPDATE profiles SET ${Object.keys(updates).map(k => `${k} = ?`).join(', ')} WHERE id = ?`,
                [...Object.values(updates), id]
            );
            return updates;
        }
    }
};
