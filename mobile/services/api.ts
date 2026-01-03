
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

export type TripRow = Database['public']['Tables']['trips']['Row'];
export type TripInsert = Database['public']['Tables']['trips']['Insert'];
export type ExpenseRow = Database['public']['Tables']['expenses']['Row'];
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];
export type MemoryRow = Database['public']['Tables']['memories']['Row'];
export type MemoryInsert = Database['public']['Tables']['memories']['Insert'];

export const api = {
    trips: {
        async list() {
            const { data, error } = await supabase
                .from('trips')
                .select('*')
                .order('start_date', { ascending: true });

            if (error) throw error;
            return data;
        },

        async create(trip: TripInsert) {
            const { data, error } = await supabase
                .from('trips')
                .insert(trip)
                .select()
                .single();

            if (error) throw error;
            return data;
        },

        async update(id: string, updates: Partial<TripInsert>) {
            const { data, error } = await supabase
                .from('trips')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },

        async get(id: string) {
            const { data, error } = await supabase
                .from('trips')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        },

        async delete(id: string) {
            const { error } = await supabase
                .from('trips')
                .delete()
                .eq('id', id);

            if (error) throw error;
        }
    },

    expenses: {
        async list(tripId: string) {
            const { data, error } = await supabase
                .from('expenses')
                .select('*')
                .eq('trip_id', tripId)
                .order('date', { ascending: false });

            if (error) throw error;
            return data;
        },

        async create(expense: ExpenseInsert) {
            const { data, error } = await supabase
                .from('expenses')
                .insert(expense)
                .select()
                .single();

            if (error) throw error;
            return data;
        },

        async update(id: string, updates: Partial<ExpenseInsert>) {
            const { data, error } = await supabase
                .from('expenses')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },

        async delete(id: string) {
            const { error } = await supabase
                .from('expenses')
                .delete()
                .eq('id', id);

            if (error) throw error;
        }
    },

    memories: {
        async list(tripId: string) {
            const { data, error } = await supabase
                .from('memories')
                .select('*')
                .eq('trip_id', tripId)
                .order('taken_at', { ascending: false });

            if (error) throw error;
            return data;
        },

        async create(memory: MemoryInsert) {
            const { data, error } = await supabase
                .from('memories')
                .insert(memory)
                .select()
                .single();

            if (error) throw error;
            return data;
        },

        async delete(id: string) {
            const { error } = await supabase
                .from('memories')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },

        uploadImage: async (uri: string, userId: string): Promise<string> => {
            const fileExt = uri.split('.').pop();
            const fileName = `${userId}/${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Helper to get array buffer from URI (React Native specific)
            const response = await fetch(uri);
            const fileData = await response.arrayBuffer();

            const { error: uploadError } = await supabase.storage
                .from('memories') // Bucket name
                .upload(filePath, fileData, {
                    contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('memories').getPublicUrl(filePath);
            return data.publicUrl;
        }
    },
};
