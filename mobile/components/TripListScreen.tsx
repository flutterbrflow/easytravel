import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    useColorScheme,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { IMAGES, COLORS } from '../constants';
import { api, TripRow } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'TripList'>;

const TripListScreen: React.FC<Props> = ({ navigation }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [trips, setTrips] = useState<TripRow[]>([]);
    const [loading, setLoading] = useState(true);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    useFocusEffect(
        useCallback(() => {
            loadTrips();
        }, [])
    );

    const loadTrips = async () => {
        try {
            // setLoading(true); // Optional: if we want to show spinner every time
            const data = await api.trips.list();
            setTrips(data);
        } catch (error) {
            console.error('Error loading trips', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight }]}
            edges={['top', 'left', 'right']}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <TouchableOpacity>
                        <Image
                            source={{ uri: user?.user_metadata?.avatar_url || IMAGES.userAvatar }}
                            style={styles.avatar}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconButton, { backgroundColor: isDark ? '#1e2a36' : '#f3f4f6' }]}>
                        <MaterialCommunityIcons name="cog" size={24} color={isDark ? COLORS.textLight : COLORS.textDark} />
                    </TouchableOpacity>
                </View>
                <Text style={[styles.headerTitle, { color: isDark ? COLORS.textLight : COLORS.textDark }]}>
                    Olá, {user?.user_metadata?.display_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Viajante'}!
                </Text>

                {/* Segmented Control */}
                <View style={[styles.segmentedControl, { backgroundColor: isDark ? '#1e2a36' : '#f0f2f4' }]}>
                    <View style={[
                        styles.segmentedIndicator,
                        { backgroundColor: isDark ? '#2c3b4a' : '#ffffff' },
                        activeTab === 'past' && styles.segmentedIndicatorRight
                    ]} />
                    <TouchableOpacity
                        style={styles.segmentButton}
                        onPress={() => setActiveTab('upcoming')}
                    >
                        <Text style={[
                            styles.segmentText,
                            {
                                color: activeTab === 'upcoming'
                                    ? (isDark ? COLORS.textLight : COLORS.textDark)
                                    : (isDark ? '#9ba8b8' : '#617589')
                            }
                        ]}>
                            Próximas
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.segmentButton}
                        onPress={() => setActiveTab('past')}
                    >
                        <Text style={[
                            styles.segmentText,
                            {
                                color: activeTab === 'past'
                                    ? (isDark ? COLORS.textLight : COLORS.textDark)
                                    : (isDark ? '#9ba8b8' : '#617589')
                            }
                        ]}>
                            Passadas
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Main List */}
            {loading ? (
                <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={[
                        ...trips.filter(t => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const tripEnd = new Date(t.end_date);
                            if (activeTab === 'upcoming') {
                                return tripEnd >= today;
                            } else {
                                return tripEnd < today;
                            }
                        }),
                        ...(activeTab === 'upcoming' ? [{ id: 'add-new' }] : [])
                    ] as any}
                    renderItem={({ item }) =>
                        item.id === 'add-new' ? (
                            <TouchableOpacity
                                style={[styles.addButton, { borderColor: isDark ? '#2c3b4a' : '#e5e7eb' }]}
                                onPress={() => navigation.navigate('NewTrip', {})}
                            >
                                <View style={styles.addIconContainer}>
                                    <MaterialCommunityIcons name="map-marker-plus" size={28} color={COLORS.primary} />
                                </View>
                                <Text style={[styles.addTitle, { color: isDark ? COLORS.textLight : COLORS.textDark }]}>
                                    Planejar nova aventura
                                </Text>
                                <Text style={[styles.addSubtitle, { color: isDark ? '#9ba8b8' : '#617589' }]}>
                                    Descubra novos destinos
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <TripCard trip={item} isDark={isDark} />
                        )
                    }
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name={activeTab === 'upcoming' ? "map-search" : "history"} size={48} color="#9ca3af" />
                            <Text style={styles.emptyText}>
                                {activeTab === 'upcoming' ? 'Nenhuma viagem próxima.' : 'Nenhuma viagem passada recente.'}
                            </Text>
                        </View>
                    }
                />
            )}

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('NewTrip', {})}
                activeOpacity={0.8}
            >
                <MaterialCommunityIcons name="plus" size={28} color="#ffffff" />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const TripCard: React.FC<{ trip: TripRow; isDark: boolean }> = ({ trip, isDark }) => (
    <TouchableOpacity
        style={[styles.card, { backgroundColor: isDark ? '#1e2a36' : '#ffffff' }]}
        activeOpacity={0.7}
    >
        <View style={styles.cardImageWrapper}>
            <Image
                source={{ uri: trip.image_url || IMAGES.genericMap }}
                style={styles.cardImage}
                resizeMode="cover"
            />
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.6)']}
                style={styles.cardGradient}
            />
            <View style={styles.badgeContainer}>
                <View style={[
                    styles.badge,
                    { backgroundColor: 'rgba(19, 127, 236, 0.9)' }
                ]}>
                    <Text style={styles.badgeText}>{trip.status === 'planning' ? 'Planejando' : 'Em breve'}</Text>
                </View>
            </View>
        </View>
        <View style={styles.cardContent}>
            <View style={styles.cardInfo}>
                <Text style={[styles.cardTitle, { color: isDark ? COLORS.textLight : COLORS.textDark }]}>
                    {trip.destination}
                </Text>
                <Text style={[styles.cardDates, { color: isDark ? '#9ba8b8' : '#617589' }]}>
                    {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                </Text>
            </View>
            <TouchableOpacity style={styles.cardButton}>
                <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.primary} />
            </TouchableOpacity>
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 48,
        marginBottom: 8,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    segmentedControl: {
        height: 40,
        borderRadius: 12,
        padding: 4,
        flexDirection: 'row',
        position: 'relative',
    },
    segmentedIndicator: {
        position: 'absolute',
        left: 4,
        top: 4,
        bottom: 4,
        width: '48%',
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    segmentedIndicatorRight: {
        transform: [{ translateX: Dimensions.get('window').width * 0.44 }],
    },
    segmentButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    segmentText: {
        fontSize: 14,
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    card: {
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    cardImageWrapper: {
        width: '100%',
        height: 160,
        position: 'relative',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    cardGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    badgeContainer: {
        position: 'absolute',
        bottom: 12,
        left: 16,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 16,
    },
    cardInfo: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cardDates: {
        fontSize: 14,
        fontWeight: '500',
    },
    cardButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(19, 127, 236, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButton: {
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginBottom: 16,
    },
    addIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(19, 127, 236, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    addTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    addSubtitle: {
        fontSize: 12,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 40,
    },
    emptyText: {
        marginTop: 8,
        fontSize: 14,
        color: '#9ca3af',
    },
    fab: {
        position: 'absolute',
        bottom: 96,
        right: 16,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
});

export default TripListScreen;
