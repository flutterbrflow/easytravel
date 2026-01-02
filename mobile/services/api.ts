
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

export type TripRow = Database['public']['Tables']['trips']['Row'];
export type TripInsert = Database['public']['Tables']['trips']['Insert'];

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

        async get(id: string) {
            const { data, error } = await supabase
                .from('trips')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        }
    },
};
