import React, { createContext, useContext, useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { SyncService } from '../services/syncService';
import { initDB } from '../services/localDb';

interface NetworkContextType {
    isConnected: boolean | null;
    syncNow: () => Promise<void>;
    isSyncing: boolean;
}

const NetworkContext = createContext<NetworkContextType>({
    isConnected: true,
    syncNow: async () => { },
    isSyncing: false,
});

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isConnected, setIsConnected] = useState<boolean | null>(true);
    const [isSyncing, setIsSyncing] = useState(false);

    // Initialize DB on mount and initial Sync
    useEffect(() => {
        const init = async () => {
            await initDB();
            // Tentativa de sync inicial se estiver online
            const state = await NetInfo.fetch();
            if (state.isConnected) {
                performSync();
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

    return (
        <NetworkContext.Provider value={{ isConnected, syncNow: performSync, isSyncing }}>
            {children}
        </NetworkContext.Provider>
    );
};

export const useNetwork = () => useContext(NetworkContext);
