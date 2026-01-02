export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            expenses: {
                Row: {
                    amount: number
                    category: string | null
                    created_at: string
                    currency: string | null
                    date: string
                    description: string | null
                    id: string
                    payer_id: string | null
                    trip_id: string
                }
                Insert: {
                    amount: number
                    category?: string | null
                    created_at?: string
                    currency?: string | null
                    date: string
                    description?: string | null
                    id?: string
                    payer_id?: string | null
                    trip_id: string
                }
                Update: {
                    amount?: number
                    category?: string | null
                    created_at?: string
                    currency?: string | null
                    date?: string
                    description?: string | null
                    id?: string
                    payer_id?: string | null
                    trip_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "expenses_payer_id_fkey"
                        columns: ["payer_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "expenses_trip_id_fkey"
                        columns: ["trip_id"]
                        isOneToOne: false
                        referencedRelation: "trips"
                        referencedColumns: ["id"]
                    },
                ]
            }
            memories: {
                Row: {
                    caption: string | null
                    created_at: string
                    id: string
                    location: string | null
                    media_type: string | null
                    media_url: string
                    trip_id: string
                    user_id: string
                }
                Insert: {
                    caption?: string | null
                    created_at?: string
                    id?: string
                    location?: string | null
                    media_type?: string | null
                    media_url: string
                    trip_id: string
                    user_id: string
                }
                Update: {
                    caption?: string | null
                    created_at?: string
                    id?: string
                    location?: string | null
                    media_type?: string | null
                    media_url?: string
                    trip_id?: string
                    user_id?: string
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
                    display_name: string | null
                    email: string
                    id: string
                    updated_at: string | null
                }
                Insert: {
                    avatar_url?: string | null
                    created_at?: string
                    display_name?: string | null
                    email: string
                    id: string
                    updated_at?: string | null
                }
                Update: {
                    avatar_url?: string | null
                    created_at?: string
                    display_name?: string | null
                    email?: string
                    id?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
            trip_participants: {
                Row: {
                    joined_at: string
                    role: string | null
                    trip_id: string
                    user_id: string
                }
                Insert: {
                    joined_at?: string
                    role?: string | null
                    trip_id: string
                    user_id: string
                }
                Update: {
                    joined_at?: string
                    role?: string | null
                    trip_id?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "trip_participants_trip_id_fkey"
                        columns: ["trip_id"]
                        isOneToOne: false
                        referencedRelation: "trips"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "trip_participants_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            trips: {
                Row: {
                    created_at: string
                    destination: string
                    end_date: string
                    id: string
                    image_url: string | null
                    owner_id: string
                    start_date: string
                    status: string | null
                }
                Insert: {
                    created_at?: string
                    destination: string
                    end_date: string
                    id?: string
                    image_url?: string | null
                    owner_id: string
                    start_date: string
                    status?: string | null
                }
                Update: {
                    created_at?: string
                    destination?: string
                    end_date?: string
                    id?: string
                    image_url?: string | null
                    owner_id?: string
                    start_date?: string
                    status?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "trips_owner_id_fkey"
                        columns: ["owner_id"]
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
