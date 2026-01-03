export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "14.1"
    }
    public: {
        Tables: {
            expenses: {
                Row: {
                    amount: number
                    category: string
                    created_at: string
                    date: string
                    description: string
                    id: string
                    trip_id: string
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    amount: number
                    category: string
                    created_at?: string
                    date: string
                    description: string
                    id?: string
                    trip_id: string
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    amount?: number
                    category?: string
                    created_at?: string
                    date?: string
                    description?: string
                    id?: string
                    trip_id?: string
                    updated_at?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "expenses_trip_id_fkey"
                        columns: ["trip_id"]
                        isOneToOne: false
                        referencedRelation: "trips"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "expenses_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            memories: {
                Row: {
                    caption: string | null
                    created_at: string
                    id: string
                    image_url: string
                    location: string | null
                    taken_at: string | null
                    trip_id: string
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    caption?: string | null
                    created_at?: string
                    id?: string
                    image_url: string
                    location?: string | null
                    taken_at?: string | null
                    trip_id: string
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    caption?: string | null
                    created_at?: string
                    id?: string
                    image_url?: string
                    location?: string | null
                    taken_at?: string | null
                    trip_id: string
                    updated_at?: string
                    user_id: string
                }
                Relationships: [
                    {
                        foreignKeyName: "memories_trip_id_fkey"
                        columns: ["trip_id"]
                        isOneToOne: false
                        referencedRelation: "trips"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "memories_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    created_at: string
                    id: string
                    name: string | null
                    updated_at: string
                }
                Insert: {
                    avatar_url?: string | null
                    created_at?: string
                    id: string
                    name?: string | null
                    updated_at?: string
                }
                Update: {
                    avatar_url?: string | null
                    created_at?: string
                    id?: string
                    name?: string | null
                    updated_at?: string
                }
                Relationships: []
            }
            trips: {
                Row: {
                    created_at: string
                    destination: string
                    end_date: string
                    id: string
                    image_url: string | null
                    start_date: string
                    status: string
                    description: string | null
                    budget: number | null
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    created_at?: string
                    destination: string
                    end_date: string
                    id?: string
                    image_url?: string | null
                    start_date: string
                    status: string
                    description?: string | null
                    budget?: number | null
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    created_at?: string
                    destination?: string
                    end_date?: string
                    id?: string
                    image_url?: string | null
                    start_date?: string
                    status?: string
                    description?: string | null
                    budget?: number | null
                    updated_at?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "trips_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
