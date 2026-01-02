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
    ActivityIndicator,
    RefreshControl,
    Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
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
    const [uploading, setUploading] = useState(false);
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

    const handleDeleteTrip = (id: string) => {
        Alert.alert(
            "Excluir Viagem",
            "Tem certeza que deseja excluir esta viagem?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.trips.delete(id);
                            setTrips(prev => prev.filter(t => t.id !== id));
                        } catch (error) {
                            console.error('Error deleting trip:', error);
                            Alert.alert('Erro', 'Não foi possível excluir a viagem.');
                        }
                    }
                }
            ]
        );
    };

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            // Reload trips
            await loadTrips();

            // Refresh user session to update avatar/metadata
            const { error } = await supabase.auth.refreshSession();
            if (error) console.log('Error refreshing session:', error);

        } catch (error) {
            console.error('Error refreshing:', error);
        } finally {
            setRefreshing(false);
        }
    }, []);

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'], // Updated to use the correct enum value if checking types, but string array is standard for simpler usage or checking documentation
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                await uploadAvatar(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
        }
    };

    const uploadAvatar = async (uri: string) => {
        try {
            setUploading(true);

            // Read file as ArrayBuffer and convert to Base64 to bypass deprecated FileSystem methods and fetch().blob() issues
            const response = await fetch(uri);
            const arrayBuffer = await response.arrayBuffer();
            const fileData = arrayBuffer; // Supabase supports ArrayBuffer directly usually, or we can use Blob if it works.
            // Actually, let's send the ArrayBuffer directly if supabase-js supports it.
            // If supabase needs explicit BodyInit that is a Blob, we might need to construct one,
            // but usually ArrayBuffer works or we can just send the decoded data.

            // Wait, supabase-js upload accepts: File, Blob, Buffer, ArrayBuffer, WebSocket, FormData
            // So ArrayBuffer is fine! We don't even need to decode to Base64 if we don't want to.
            // BUT earlier I used 'decode(base64)' which creates an ArrayBuffer.
            // So 'fileData' should be ArrayBuffer. 
            // So:
            // const response = await fetch(uri);
            // const fileData = await response.arrayBuffer();

            // The logic below uses fileData. Let's try this.

            const fileExt = uri.split('.').pop();
            const fileName = `${user?.id || 'unknown'}/avatar.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, fileData, {
                contentType: 'image/jpeg',
                upsert: true,
            });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

            if (user?.id) {
                const { error: updateError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: user.id,
                        avatar_url: publicUrl,
                        updated_at: new Date().toISOString(),
                    });

                if (updateError) throw updateError;

                // Update Auth Metadata so the UI updates automatically via AuthContext
                const { error: authUpdateError } = await supabase.auth.updateUser({
                    data: { avatar_url: publicUrl }
                });

                if (authUpdateError) throw authUpdateError;

                // Force a local state update if needed, but the AuthContext subscription should handle it.
                // We can also alert success
                // alert('Avatar atualizado com sucesso!');
            }

        } catch (error) {
            console.error('Error uploading avatar:', error);
            // alert('Erro ao atualizar avatar'); 
        } finally {
            setUploading(false);
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
                    <TouchableOpacity onPress={pickImage} disabled={uploading}>
                        {(() => {
                            const avatarUrl = user?.user_metadata?.avatar_url;
                            const uri = avatarUrl ? `${avatarUrl}?t=${new Date().getTime()}` : IMAGES.userAvatar;
                            return (
                                <Image
                                    source={{ uri }}
                                    style={[styles.avatar, uploading && { opacity: 0.5 }]}
                                />
                            );
                        })()}
                        {uploading && (
                            <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
                                <ActivityIndicator size="small" color={COLORS.primary} />
                            </View>
                        )}
                    </TouchableOpacity>

                    <Text style={[styles.headerCenterTitle, { color: isDark ? COLORS.textLight : COLORS.textDark }]}>Minhas Viagens</Text>

                    <TouchableOpacity style={[styles.iconButton, { backgroundColor: isDark ? '#1e2a36' : '#f3f4f6' }]}>
                        <MaterialCommunityIcons name="cog" size={24} color={isDark ? COLORS.textLight : COLORS.textDark} />
                    </TouchableOpacity>
                </View>
                <Text style={[styles.headerGreeting, { color: isDark ? COLORS.textLight : COLORS.textDark }]}>
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
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={COLORS.primary} // iOS
                            colors={[COLORS.primary]} // Android
                        />
                    }
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
                            <TripCard trip={item} isDark={isDark} onDelete={() => handleDeleteTrip(item.id)} />
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

const TripCard: React.FC<{ trip: TripRow; isDark: boolean; onDelete: () => void }> = ({ trip, isDark, onDelete }) => (
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
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
            >
                <MaterialCommunityIcons name="trash-can-outline" size={20} color="#ffffff" />
            </TouchableOpacity>
        </View>
        <View style={styles.cardContent}>
            <View style={styles.cardInfo}>
                <Text style={[styles.cardTitle, { color: isDark ? COLORS.textLight : COLORS.textDark }]}>
                    {trip.destination}
                </Text>
                <Text style={[styles.cardDates, { color: isDark ? '#9ba8b8' : '#617589' }]}>
                    {(() => {
                        if (!trip.start_date || !trip.end_date) return '';
                        const start = new Date(trip.start_date);
                        const end = new Date(trip.end_date);
                        const sDay = String(start.getDate() + 1).padStart(2, '0');
                        const sMonth = String(start.getMonth() + 1).padStart(2, '0');
                        const sYear = start.getFullYear();
                        const eDay = String(end.getDate() + 1).padStart(2, '0');
                        const eMonth = String(end.getMonth() + 1).padStart(2, '0');
                        return `${sDay}/${sMonth} - ${eDay}/${eMonth} de ${sYear}`;
                    })()}
                </Text>
                {trip.description && (
                    <Text style={[styles.cardDescription, { color: isDark ? '#9ba8b8' : '#4b5563' }]} numberOfLines={2}>
                        {trip.description}
                    </Text>
                )}
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
    headerCenterTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerGreeting: {
        fontSize: 24, // Reduced from 32
        fontWeight: 'bold',
        marginBottom: 12, // Increased margin
    },
    cardDescription: {
        fontSize: 14,
        marginTop: 4,
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
    deleteButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.4)',
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
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
