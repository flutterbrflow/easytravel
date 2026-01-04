import React, { createContext, useContext, useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { SyncService } from '../services/syncService';
import { initDB } from '../services/localDb';

interface NetworkContextType {
    isConnected: boolean | null;
    syncNow: () => Promise<void>;
    checkConnectivity: () => Promise<boolean>;
    isSyncing: boolean;
}

const NetworkContext = createContext<NetworkContextType>({
    isConnected: true,
    syncNow: async () => { },
    checkConnectivity: async () => false,
    isSyncing: false,
});

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isConnected, setIsConnected] = useState<boolean | null>(true);
    const [isSyncing, setIsSyncing] = useState(false);

    // Initialize DB on mount and initial Sync
    useEffect(() => {
        const init = async () => {
            try {
                await initDB();
                // Tentativa de sync inicial se estiver online (não bloqueante)
                const state = await NetInfo.fetch();
                if (state.isConnected) {
                    // Fire and forget - não aguarda para não bloquear
                    performSync().catch(e => {
                        console.log('Sync inicial falhou (ignorado):', e.message);
                    });
                }
            } catch (e) {
                console.error('Erro na inicialização do NetworkContext:', e);
            }
        };
        init();
    }, []);

    // Monitor Network
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            const wasOffline = isConnected === false;
            const nowOnline = state.isConnected === true;

            setIsConnected(!!state.isConnected);

            // Auto-sync when coming back online
            if (wasOffline && nowOnline) {
                performSync();
            }
        });

        return () => unsubscribe();
    }, [isConnected]);

    const performSync = async () => {
        if (isSyncing) return;

        // Force check connectivity before syncing
        const online = await checkConnectivity();
        if (!online) return;

        setIsSyncing(true);
        try {
            // 1. Push local changes
            await SyncService.push();
            // 2. Pull remote changes
            await SyncService.pull();
        } catch (error) {
            console.error('Falha na sincronização:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    const checkConnectivity = async () => {
        try {
            // Tenta fetch leve (Google ou Supabase Health)
            // Usamos NetInfo primeiro para evitar requests se o hardware diz que está offline
            const netState = await NetInfo.fetch();
            if (!netState.isConnected) {
                setIsConnected(false);
                return false;
            }

            // Se o hardware diz que tem rede, validamos com um ping real (útil para "sem internet" wifi)
            // Timeout curto de 3s
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 3000);

            try {
                const response = await fetch('https://www.google.com', { method: 'HEAD', signal: controller.signal });
                clearTimeout(id);

                const isOnline = response.ok || response.status > 0; // status > 0 significa que conectou
                setIsConnected(isOnline);
                return isOnline;
            } catch (fetchError) {
                // Fetch falhou (timeout, abort, ou rede offline)
                clearTimeout(id);
                setIsConnected(false);
                return false;
            }
        } catch (e) {
            // NetInfo falhou ou outro erro
            setIsConnected(false);
            return false;
        }
    };

    return (
        <NetworkContext.Provider value={{ isConnected, syncNow: performSync, isSyncing, checkConnectivity }}>
            {children}
        </NetworkContext.Provider>
    );
};

export const useNetwork = () => useContext(NetworkContext);
