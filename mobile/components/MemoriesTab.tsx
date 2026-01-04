import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
    Modal,
    StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { MemoryRow, MemoryInsert } from '../services/api';
import { CachedImage } from './CachedImage';
import { COLORS } from '../constants';

const { width, height } = Dimensions.get('window');
const COLUMN_GAP = 12;
const IMAGE_SIZE = (width - 32 - COLUMN_GAP) / 2;

interface MemoriesTabProps {
    memories: MemoryRow[];
    tripId: string;
    userId: string;
    onAddMemory: (memory: Omit<MemoryInsert, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
    onDeleteMemory: (id: string) => Promise<void>;
    onRefresh: () => Promise<void>;
    isDark: boolean;
}

export const MemoriesTab: React.FC<MemoriesTabProps> = ({
    memories,
    tripId,
    userId,
    onAddMemory,
    onDeleteMemory,
    onRefresh,
    isDark,
}) => {
    const [saving, setSaving] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [viewerVisible, setViewerVisible] = useState(false);
    const [initialIndex, setInitialIndex] = useState(0);

    const parseExifDate = (exifDate?: string) => {
        if (!exifDate) return null;
        // EXIF format: "YYYY:MM:DD HH:MM:SS"
        const [date, time] = exifDate.split(' ');
        if (!date || !time) return null;

        const [year, month, day] = date.split(':');
        const [hour, minute, second] = time.split(':');

        // Ensure valid parts before creating date
        if (year && month && day && hour && minute && second) {
            // Create ISO string
            return new Date(
                parseInt(year),
                parseInt(month) - 1, // Month is 0-indexed in JS
                parseInt(day),
                parseInt(hour),
                parseInt(minute),
                parseInt(second)
            ).toISOString();
        }
        return null;
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsMultipleSelection: true,
                selectionLimit: 10,
                quality: 0.8,
                exif: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setSaving(true);
                let savedCount = 0;

                try {
                    for (const asset of result.assets) {
                        let finalUri = asset.uri;

                        // Try to extract date from EXIF
                        // Try to extract date from EXIF
                        const exifDate = asset.exif?.DateTimeOriginal || asset.exif?.DateTime;
                        const takenAt = parseExifDate(exifDate) || new Date().toISOString();


                        // Tentar copiar para diretório do app (para persistência offline confiável)
                        try {
                            const originalName = asset.uri.split('/').pop()?.split('.')[0] || 'memory';
                            const fileExt = asset.uri.split('/').pop()?.split('.').pop() || 'jpg';
                            const uniqueName = `${originalName}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.${fileExt}`;

                            const docDir = (FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory;

                            if (docDir) {
                                const newPath = docDir + uniqueName;
                                await FileSystem.copyAsync({ from: asset.uri, to: newPath });
                                finalUri = newPath;
                            } else {
                                // Nenhum diretório de escrita disponível. Usando URI original.
                            }
                        } catch (copyError) {
                            // Falha ao copiar imagem (usando original)
                        }

                        // Salvar memória com o URI final (seja cópia ou original)
                        try {
                            await onAddMemory({
                                trip_id: tripId,
                                user_id: userId,
                                image_url: finalUri,
                                caption: undefined,
                                location: undefined,
                                taken_at: takenAt,
                            });
                            savedCount++;
                        } catch (addError) {
                            // Erro ao salvar registro de memória
                        }
                    }
                } finally {
                    setSaving(false);
                    if (savedCount > 0) {
                        // Sucesso: memórias já foram adicionadas via atualização otimista (onAddMemory)
                    }
                }
            }
        } catch (error) {
            setSaving(false);
            Alert.alert('Erro', 'Não foi possível selecionar a imagem');
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            'Excluir Memória',
            'Tem certeza que deseja excluir esta memória?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setViewerVisible(false); // Fecha o visualizador se estiver aberto
                            await onDeleteMemory(id);
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível excluir a memória');
                        }
                    },
                },
            ]
        );
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await onRefresh();
        } catch (error) {
            // Falha ao atualizar
        } finally {
            setRefreshing(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    };

    const openViewer = (index: number) => {
        setInitialIndex(index);
        setViewerVisible(true);
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={memories}
                numColumns={2}
                columnWrapperStyle={styles.row}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={COLORS.primary}
                        colors={[COLORS.primary]}
                    />
                }
                renderItem={({ item, index }) => (
                    <TouchableOpacity
                        style={styles.card}
                        activeOpacity={0.9}
                        onPress={() => openViewer(index)}
                        onLongPress={() => handleDelete(item.id)}
                    >
                        <CachedImage
                            uri={item.image_url}
                            style={styles.image}
                            resizeMode="cover"
                        />
                        {item.caption && (
                            <View style={styles.captionOverlay}>
                                <Text style={styles.captionText} numberOfLines={2}>
                                    {item.caption}
                                </Text>
                            </View>
                        )}
                        <View style={styles.dateOverlay}>
                            <Text style={styles.dateText}>{formatDate(item.taken_at || '')}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons
                            name="camera-off"
                            size={64}
                            color={isDark ? '#4b5563' : '#9ca3af'}
                        />
                        <Text style={[styles.emptyText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
                            Nenhuma memória ainda
                        </Text>
                        <Text style={[styles.emptySubtext, { color: isDark ? '#6b7280' : '#9ca3af' }]}>
                            Toque no botão + para adicionar fotos
                        </Text>
                    </View>
                }
                contentContainerStyle={memories.length === 0 ? styles.emptyList : styles.listContent}
            />

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={pickImage}
                activeOpacity={0.8}
                disabled={saving}
            >
                {saving ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <MaterialCommunityIcons name="plus" size={28} color="#ffffff" />
                )}
            </TouchableOpacity>

            {/* Loading Overlay */}
            {saving && (
                <View style={styles.loadingOverlay}>
                    <View style={[styles.loadingBox, { backgroundColor: isDark ? '#1e2a36' : '#fff' }]}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={[styles.loadingText, { color: isDark ? '#fff' : '#000' }]}>
                            Salvando fotos...
                        </Text>
                    </View>
                </View>
            )}

            {/* Full Screen Viewer Modal */}
            <Modal
                visible={viewerVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setViewerVisible(false)}
            >
                <View style={styles.viewerContainer}>
                    <StatusBar hidden={true} />
                    <FlatList
                        data={memories}
                        horizontal
                        pagingEnabled
                        initialScrollIndex={initialIndex}
                        getItemLayout={(data, index) => (
                            { length: width, offset: width * index, index }
                        )}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
                                <CachedImage
                                    uri={item.image_url}
                                    style={{ width: '100%', height: '100%' }}
                                    resizeMode="contain"
                                />
                                {item.caption && (
                                    <View style={styles.viewerCaptionOverlay}>
                                        <Text style={styles.viewerCaptionText}>{item.caption}</Text>
                                        <Text style={styles.viewerDateText}>{formatDate(item.taken_at || '')}</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    />

                    {/* Close Button */}
                    <TouchableOpacity
                        style={styles.viewerCloseBtn}
                        onPress={() => setViewerVisible(false)}
                    >
                        <MaterialCommunityIcons name="close" size={30} color="#fff" />
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: COLUMN_GAP,
    },
    card: {
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#e5e7eb',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    captionOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 8,
    },
    captionText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    dateOverlay: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    dateText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
    },
    emptyList: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        marginTop: 8,
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
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50,
    },
    loadingBox: {
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: '600',
    },
    viewerContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
    },
    viewerCloseBtn: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 10,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
    },
    viewerCaptionOverlay: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 20,
    },
    viewerCaptionText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '500',
        marginBottom: 4,
    },
    viewerDateText: {
        color: '#ddd',
        fontSize: 12,
        textAlign: 'center',
    },
});
