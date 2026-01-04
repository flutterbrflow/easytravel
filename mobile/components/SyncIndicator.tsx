import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNetwork } from '../contexts/NetworkContext';
import { COLORS } from '../constants';

export const SyncIndicator: React.FC = () => {
    const { isConnected, isSyncing } = useNetwork();
    const spinValue = React.useRef(new Animated.Value(0)).current;

    // Animação de rotação para o sync
    React.useEffect(() => {
        if (isSyncing) {
            Animated.loop(
                Animated.timing(spinValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                })
            ).start();
        } else {
            spinValue.setValue(0);
        }
    }, [isSyncing]);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    // Não mostra nada quando online e não sincronizando
    if (isConnected && !isSyncing) {
        return null;
    }

    return (
        <View style={styles.container}>
            {!isConnected && (
                <View style={styles.badge}>
                    <MaterialCommunityIcons name="wifi-off" size={18} color="#fff" />
                    <Text style={styles.text}>Offline</Text>
                </View>
            )}
            {isSyncing && (
                <View style={[styles.badge, styles.syncBadge]}>
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                        <MaterialCommunityIcons name="sync" size={18} color="#fff" />
                    </Animated.View>
                    <Text style={styles.text}>Sync</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        // Removido absolute positioning para permitir uso inline
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ef4444',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    syncBadge: {
        backgroundColor: COLORS.primary,
    },
    text: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
});
