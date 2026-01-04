import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Switch,
    useColorScheme,
    Alert,
    ActivityIndicator,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as ExpoFileSystem from 'expo-file-system';

import { useAuth } from '../contexts/AuthContext';
import { COLORS, IMAGES } from '../constants';
import { api } from '../services/api';

import { supabase } from '../lib/supabase';
import { getDB } from '../services/localDb';
import { SyncService } from '../services/syncService';
import { CachedImage } from './CachedImage';

const db = getDB();

const StatCard = ({ icon, value, label }: { icon: any, value: number | string, label: string }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View style={[styles.statCard, { backgroundColor: isDark ? '#1e2a36' : '#ffffff' }]}>
            <MaterialCommunityIcons name={icon} size={28} color={COLORS.primary} style={{ marginBottom: 8 }} />
            <Text style={[styles.statValue, { color: isDark ? COLORS.textLight : COLORS.textDark }]}>
                {value}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#9ba8b8' : '#617589' }]}>
                {label.toUpperCase()}
            </Text>
        </View>
    );
};

const PreferenceItem = ({ icon, label, rightElement, onPress }: any) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <TouchableOpacity
            style={[styles.prefItem, { borderBottomColor: isDark ? '#2c3b4a' : '#f3f4f6' }]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            disabled={!onPress}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name={icon} size={24} color={isDark ? '#9ba8b8' : '#617589'} />
                <Text style={[styles.prefLabel, { color: isDark ? COLORS.textLight : COLORS.textDark }]}>
                    {label}
                </Text>
            </View>
            {rightElement || <MaterialCommunityIcons name="chevron-right" size={24} color={isDark ? '#9ba8b8' : '#cbd5e1'} />}
        </TouchableOpacity>
    );
};

const ProfileScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const { user, signOut } = useAuth();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Stats
    const [stats, setStats] = useState({
        trips: 0,
        countries: 0,
        photos: 0
    });
    const [profileData, setProfileData] = useState<any>(null); // To store name/avatar locally
    const [loadingStats, setLoadingStats] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Edit Modal State
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editName, setEditName] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);

    // Preferences functionality (Mocked for now)
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkModeEnabled, setDarkModeEnabled] = useState(isDark); // Syncs with system initially

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    // Initialize editName when user loads
    useEffect(() => {
        if (user) {
            setEditName(user.user_metadata?.full_name || user.user_metadata?.display_name || '');
        }
    }, [user]);

    const loadData = async () => {
        try {
            const trips = await api.trips.list();
            const uniqueCountries = new Set(trips.map(t => t.destination.split(',').pop()?.trim()).filter(Boolean));

            setStats({
                trips: trips.length,
                countries: uniqueCountries.size,
                photos: 0
            });

            if (user?.id) {
                // Try Local DB First
                try {
                    const profile = await db.getFirstAsync<any>(
                        'SELECT * FROM profiles WHERE id = ?',
                        [user.id]
                    );

                    if (profile) {
                        setProfileData(profile);
                        setEditName(profile.name || user.user_metadata?.full_name || '');
                    } else {
                        // Fallback/Sync check if needed
                    }
                } catch (e) {
                    console.log('Erro ao ler perfil local:', e);
                }
            }
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!editName.trim()) {
            Alert.alert('Erro', 'Por favor, insira um nome.');
            return;
        }

        try {
            setSavingProfile(true);
            const now = new Date().toISOString();

            if (user?.id) {
                // Update Local & Queue Sync (Offline First)
                await api.profiles.update(user.id, {
                    name: editName.trim(),
                    updated_at: now
                });

                // Update Auth User Metadata (Best effort if online)
                try {
                    await supabase.auth.updateUser({
                        data: { full_name: editName.trim() }
                    });
                } catch (e) {
                    console.log('Update auth metadata failed (offline?), ignoring:', e);
                }

                // Update local state
                setProfileData({ ...profileData, name: editName.trim(), updated_at: now });
                setIsEditModalVisible(false);
                Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
            }
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            Alert.alert('Erro', 'Falha ao atualizar perfil.');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            "Sair da Conta",
            "Tem certeza que deseja sair?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Sair",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await signOut();
                            // Navigation is handled automatically by AuthContext/App.tsx
                        } catch (error) {
                            Alert.alert('Erro', 'Erro ao sair da conta.');
                        }
                    }
                }
            ]
        );
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];

                // 1. Mover para diretório permanente
                const fileName = `avatar_${user?.id}_${Date.now()}.jpg`;
                const docDir = (ExpoFileSystem as any).documentDirectory || (ExpoFileSystem as any).cacheDirectory;

                if (docDir) {
                    const newPath = docDir + fileName;
                    await ExpoFileSystem.copyAsync({ from: asset.uri, to: newPath });
                    await updateAvatar(newPath);
                } else {
                    await updateAvatar(asset.uri);
                }
            }
        } catch (error) {
            console.error('Erro ao selecionar imagem de perfil:', error);
            Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
        }
    };

    const updateAvatar = async (uri: string) => {
        try {
            setUploading(true);
            const now = new Date().toISOString();

            if (user?.id) {
                // Offline First: Salva caminho local e fila upload
                // SyncService vai interceptar 'file://' no campo 'avatar_url' do profile e fazer upload
                await api.profiles.update(user.id, {
                    avatar_url: uri,
                    updated_at: now
                });

                setProfileData((prev: any) => ({ ...prev, avatar_url: uri, updated_at: now }));
            }
        } catch (error) {
            console.error('Erro ao salvar avatar:', error);
            Alert.alert('Erro', 'Falha ao salvar foto de perfil.');
        } finally {
            setUploading(false);
        }
    };

    const handleForceSync = async () => {
        Alert.alert(
            'Forçar Sincronização',
            'Isso irá baixar todos os dados do servidor novamente. Útil se houver imagens faltando.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sincronizar',
                    onPress: async () => {
                        try {
                            setUploading(true);
                            await SyncService.resetSync();
                            Alert.alert('Sucesso', 'Sincronização completa realizada!');
                            loadData(); // Recarregar perfil
                        } catch (e) {
                            Alert.alert('Erro', 'Falha na sincronização.');
                        } finally {
                            setUploading(false);
                        }
                    }
                }
            ]
        );
    };

    // Determine Avatar & Name to Display
    const avatarUrl = profileData?.avatar_url || user?.user_metadata?.avatar_url;
    const finalAvatarUrl = avatarUrl || IMAGES.userAvatar;

    // Display Name Logic: Profile Name -> Meta Full Name -> Meta Display Name -> Default
    const displayName = profileData?.name || user?.user_metadata?.full_name || user?.user_metadata?.display_name || 'Viajante';

    const [imageError, setImageError] = useState(false);

    // Reset error when url changes
    useEffect(() => {
        setImageError(false);
    }, [finalAvatarUrl]);

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: isDark ? COLORS.backgroundDark : '#f8fafc' }]}
            edges={['top', 'left', 'right']}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={isDark ? COLORS.textLight : COLORS.textDark} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDark ? COLORS.textLight : COLORS.textDark }]}>
                    Meu Perfil
                </Text>
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => setIsEditModalVisible(true)}
                >
                    <MaterialCommunityIcons name="cog" size={24} color={isDark ? COLORS.textLight : COLORS.textDark} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* User Info */}
                <View style={styles.userInfoSection}>
                    <View style={styles.avatarContainer}>
                        <CachedImage
                            uri={finalAvatarUrl}
                            style={styles.avatar}
                            placeholder={IMAGES.userAvatar}
                        />
                        <TouchableOpacity
                            style={styles.editAvatarButton}
                            onPress={pickImage}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <MaterialCommunityIcons name="pencil" size={16} color="#ffffff" />
                            )}
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.userName, { color: isDark ? COLORS.textLight : COLORS.textDark }]}>
                        {displayName}
                    </Text>
                    <Text style={[styles.userHandle, { color: isDark ? '#9ba8b8' : '#617589' }]}>
                        VIAJANTE ENTHUSIASTA • @{user?.email?.split('@')[0].toUpperCase()}
                    </Text>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <StatCard icon="compass" value={stats.trips} label="Viagens" />
                    <StatCard icon="earth" value={stats.countries} label="Países" />
                    <StatCard icon="image-multiple" value={stats.photos} label="Fotos" />
                </View>

                {/* Preferences */}
                <Text style={[styles.sectionTitle, { color: isDark ? '#9ba8b8' : '#9ca3af' }]}>
                    PREFERÊNCIAS
                </Text>
                <View style={[styles.preferencesContainer, { backgroundColor: isDark ? '#1e2a36' : '#ffffff' }]}>
                    <PreferenceItem
                        icon="bell-outline"
                        label="Notificações"
                        rightElement={
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={setNotificationsEnabled}
                                trackColor={{ false: '#e2e8f0', true: COLORS.primary }}
                                thumbColor={'#ffffff'}
                            />
                        }
                    />
                    <PreferenceItem
                        icon="theme-light-dark"
                        label="Modo Escuro"
                        rightElement={
                            <Switch
                                value={darkModeEnabled}
                                onValueChange={setDarkModeEnabled}
                                trackColor={{ false: '#e2e8f0', true: '#94a3b8' }}
                                thumbColor={'#ffffff'}
                            />
                        }
                    />
                    <PreferenceItem icon="lock-outline" label="Privacidade" onPress={() => { }} />
                    <PreferenceItem
                        icon="web"
                        label="Idioma"
                        rightElement={
                            <Text style={{ color: COLORS.primary, fontWeight: '600', fontSize: 13 }}>PORTUGUÊS</Text>
                        }
                        onPress={() => { }}
                    />
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={[styles.logoutButton, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2' }]}
                    onPress={handleLogout}
                >
                    <MaterialCommunityIcons name="logout" size={20} color="#ef4444" style={{ marginRight: 8 }} />
                    <Text style={styles.logoutText}>Sair da Conta</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Edit Profile Modal */}
            <Modal
                visible={isEditModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsEditModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
                >
                    <View style={{
                        backgroundColor: isDark ? '#1e2a36' : 'white',
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        padding: 24,
                        minHeight: 300
                    }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: isDark ? COLORS.textLight : COLORS.textDark }}>
                                Editar Perfil
                            </Text>
                            <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={isDark ? COLORS.textLight : COLORS.textDark} />
                            </TouchableOpacity>
                        </View>

                        <Text style={{ fontSize: 14, fontWeight: '500', color: isDark ? '#9ba8b8' : '#64748b', marginBottom: 8 }}>
                            Nome Completo
                        </Text>
                        <TextInput
                            value={editName}
                            onChangeText={setEditName}
                            style={{
                                backgroundColor: isDark ? '#2c3b4a' : '#f1f5f9',
                                borderRadius: 12,
                                padding: 16,
                                fontSize: 16,
                                color: isDark ? COLORS.textLight : COLORS.textDark,
                                marginBottom: 24
                            }}
                            placeholder="Seu nome"
                            placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                        />

                        <TouchableOpacity
                            style={{
                                backgroundColor: COLORS.primary,
                                height: 56,
                                borderRadius: 16,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: 12
                            }}
                            onPress={handleSaveProfile}
                            disabled={savingProfile}
                        >
                            {savingProfile ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Salvar Alterações</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    iconButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingTop: 16,
        paddingBottom: 24,
    },
    userInfoSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#e2e8f0', // Light gray border like design
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    userHandle: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 32,
    },
    statCard: {
        width: '31%',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    sectionTitle: {
        paddingHorizontal: 16,
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 8,
        letterSpacing: 1,
    },
    preferencesContainer: {
        borderRadius: 16,
        marginHorizontal: 16,
        overflow: 'hidden',
        paddingHorizontal: 8, // Optional internal padding
        marginBottom: 32,
    },
    prefItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
    },
    prefLabel: {
        fontSize: 16,
        marginLeft: 12,
        fontWeight: '500',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        height: 56,
        borderRadius: 16,
    },
    logoutText: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: '600',
    }
});

export default ProfileScreen;
