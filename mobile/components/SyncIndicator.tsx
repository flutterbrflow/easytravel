import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNetwork } from '../contexts/NetworkContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const SyncIndicator = () => {
    const { isConnected, isSyncing } = useNetwork();

    if (!isConnected) {
        return (
            <View style={styles.containerOffline}>
                <MaterialCommunityIcons name="wifi-off" size={14} color="#fff" />
                <Text style={styles.textOffline}>Offline</Text>
            </View>
        );
    }

    if (isSyncing) {
        return (
            <View style={styles.containerSync}>
                <ActivityIndicator size="small" color="#137fec" />
                <Text style={styles.textSync}>Sincronizando...</Text>
            </View>
        );
    }

    return null;
};

const styles = StyleSheet.create({
    containerOffline: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EF4444',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
        gap: 4
    },
    textOffline: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    containerSync: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginRight: 8
    },
    textSync: {
        color: '#137fec',
        fontSize: 12,
    }
});
