import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { AppState } from 'react-native';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    signOut: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;
                setSession(session);
            } catch (e) {
                // Sessão offline ou erro de auth inicial (ignorado)
            } finally {
                setLoading(false);
            }
        };
        initSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setLoading(false);
        });

        // Observar mudanças no AppState para revalidar a sessão
        const appStateSubscription = AppState.addEventListener('change', async (nextAppState) => {
            if (nextAppState === 'active') {
                try {
                    const { data, error } = await supabase.auth.getSession();
                    if (error) {
                        // Token pode estar inválido ou expirado, apenas limpa a sessão
                        setSession(null);
                    } else if (!data.session) {
                        setSession(null);
                    } else {
                        setSession(data.session);
                    }
                } catch (e) {
                    setSession(null);
                }
            }
        });

        return () => {
            subscription.unsubscribe();
            appStateSubscription.remove();
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setSession(null); // Forçar atualização da UI
    };

    const value = {
        session,
        user: session?.user ?? null,
        loading,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};
