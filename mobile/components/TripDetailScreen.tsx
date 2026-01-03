import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Dimensions,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Share,
    useColorScheme,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import * as Contacts from 'expo-contacts';

import { RootStackParamList } from '../types';
import { api, TripRow, ExpenseRow, MemoryRow, ExpenseInsert } from '../services/api'; // Assuming ExpenseInsert is exported
import ExpenseModal from './ExpenseModal'; // Import Modal
import BudgetTab from './BudgetTab'; // Import new Budget Tab
import { COLORS, IMAGES } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'TripDetail'>;

// Custom Calendar Component (Reused/Copied for simplicity in this file)
const CustomCalendar: React.FC<{
    startDate: string;
    endDate: string;
    onSelectDate: (date: string) => void;
    isDark: boolean;
}> = ({ startDate, endDate, onSelectDate, isDark }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Sunday

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const isSelected = (day: number, preCalculatedStr?: string) => {
        let dateStr = preCalculatedStr;
        if (!dateStr) {
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const dayStr = String(day).padStart(2, '0');
            dateStr = `${year}-${month}-${dayStr}`;
        }
        return dateStr === startDate || dateStr === endDate;
    };

    const isInRange = (day: number, preCalculatedStr?: string) => {
        if (!startDate || !endDate) return false;
        let currentStr = preCalculatedStr;
        if (!currentStr) {
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const dayStr = String(day).padStart(2, '0');
            currentStr = `${year}-${month}-${dayStr}`;
        }
        return currentStr > startDate && currentStr < endDate;
    };

    return (
        <View style={[styles.calendarContainer, { backgroundColor: isDark ? '#1e2a36' : '#ffffff' }]}>
            <View style={styles.calendarHeader}>
                <TouchableOpacity onPress={handlePrevMonth} style={styles.monthButton}>
                    <MaterialCommunityIcons name="chevron-left" size={24} color={isDark ? '#ffffff' : '#111418'} />
                </TouchableOpacity>
                <Text style={[styles.monthTitle, { color: isDark ? '#ffffff' : '#111418' }]}>
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </Text>
                <TouchableOpacity onPress={handleNextMonth} style={styles.monthButton}>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={isDark ? '#ffffff' : '#111418'} />
                </TouchableOpacity>
            </View>
            <View style={styles.weekDaysRow}>
                {weekDays.map((d, i) => (
                    <Text key={i} style={styles.weekDayText}>{d}</Text>
                ))}
            </View>
            <View style={styles.daysGrid}>
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <View key={`empty-${i}`} style={styles.dayCell} />
                ))}
                {days.map((d) => {
                    const year = currentDate.getFullYear();
                    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                    const dayStr = String(d).padStart(2, '0');
                    const dateStr = `${year}-${month}-${dayStr}`;
                    const selected = isSelected(d, dateStr);
                    const inRange = isInRange(d, dateStr);
                    return (
                        <View key={d} style={styles.dayCell}>
                            {inRange && <View style={[styles.rangeBackground, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#eff6ff' }]} />}
                            {selected && startDate && endDate && startDate !== endDate && (
                                <View style={[styles.rangeBackground, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#eff6ff', width: '50%', left: new Date(startDate).getDate() === d ? '50%' : 0 }]} />
                            )}
                            <TouchableOpacity
                                onPress={() => onSelectDate(dateStr)}
                                style={[styles.dayButton, selected && styles.dayButtonSelected, !selected && inRange && styles.dayButtonInRange]}
                            >
                                <Text style={[styles.dayText, { color: isDark ? '#ffffff' : '#111418' }, selected && styles.dayTextSelected, inRange && !selected && { color: '#2563eb' }]}>
                                    {d}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

// Participant Component
const Participant: React.FC<{ avatar: any; name: string; isUser?: boolean }> = ({ avatar, name, isUser }) => {
    const imageSource = typeof avatar === 'string' ? { uri: avatar } : avatar;
    return (
        <View style={styles.participant}>
            <View style={styles.participantImageContainer}>
                <Image source={imageSource} style={styles.participantImage} />
                {isUser && <View style={styles.userBadge}><Text style={styles.userBadgeText}>Eu</Text></View>}
            </View>
            <Text style={styles.participantName}>{name}</Text>
        </View>
    );
};

const TripDetailScreen = ({ route, navigation }: { route: any, navigation: any }) => {
    const { tripId } = route.params; // Kept tripId as per original code, assuming 'id' was a typo in instruction
    const { user } = useAuth();
    const colorScheme = useColorScheme(); // Added useColorScheme
    const isDark = colorScheme === 'dark'; // Derived isDark from colorScheme
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [refreshing, setRefreshing] = useState(false); // Add refreshing state

    // Expenses State
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<ExpenseRow | null>(null);
    const [trip, setTrip] = useState<any>(null);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [memories, setMemories] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'memories'>('overview');
    // const isDark = false; // Fixed for now, can be hooked to theme - REMOVED

    // Edit State
    const [editDestination, setEditDestination] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editStartDate, setEditStartDate] = useState<string | null>(null);
    const [editEndDate, setEditEndDate] = useState<string | null>(null);
    const [editCoverImage, setEditCoverImage] = useState<string | null>(null);

    const loadData = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const [tripData, expensesData, memoriesData] = await Promise.all([
                api.trips.get(tripId),
                api.expenses.list(tripId),
                api.memories.list(tripId)
            ]);

            setTrip(tripData);
            setExpenses(expensesData || []);
            setMemories(memoriesData || []);

            // Initialize Edit State
            if (tripData) {
                setEditDestination(tripData.destination);
                setEditDescription(tripData.description || '');
                setEditStartDate(tripData.start_date);
                setEditEndDate(tripData.end_date);
                setEditCoverImage(tripData.image_url);
            }
        } catch (error) {
            console.error('Error loading trip details:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [tripId]);

    const handleInvite = async () => {
        try {
            await Share.share({ message: `Junte-se a mim em ${trip?.destination}!` });
        } catch (error: any) {
            Alert.alert(error.message);
        }
    };

    const handleAddParticipant = async () => {
        Alert.alert('Funcionalidade em breve', 'Seleção de contatos.');
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.8,
            });
            if (!result.canceled) {
                setEditCoverImage(result.assets[0].uri);
            }
        } catch (e) {
            Alert.alert('Erro', 'Não foi possível selecionar imagem.');
        }
    };

    const handleDateSelect = (date: string) => {
        if (!editStartDate || (editStartDate && editEndDate)) {
            setEditStartDate(date);
            setEditEndDate(null);
        } else {
            if (date < editStartDate) {
                setEditStartDate(date);
                setEditEndDate(null);
            } else {
                setEditEndDate(date);
            }
        }
    };

    const handleSaveOverview = async () => {
        if (!editDestination || !editStartDate || !editEndDate) {
            Alert.alert('Atenção', 'Preencha destino e datas.');
            return;
        }

        setSaving(true);
        try {
            let imageUrl = editCoverImage;

            // If image changed (checking if it's a local uri, not http)
            if (editCoverImage && !editCoverImage.startsWith('http')) {
                // Upload logic reuse
                try {
                    const response = await fetch(editCoverImage);
                    const arrayBuffer = await response.arrayBuffer();
                    const fileExt = editCoverImage.split('.').pop()?.split('?')[0] || 'jpg';
                    const fileName = `${user?.id || 'anon'}/${Date.now()}.${fileExt}`;
                    const filePath = `${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from('trip-images')
                        .upload(filePath, arrayBuffer, {
                            contentType: response.headers.get('content-type') || 'image/jpeg',
                            upsert: true,
                        });

                    if (uploadError) {
                        console.error('Upload Error', uploadError);
                    } else {
                        const { data } = supabase.storage.from('trip-images').getPublicUrl(filePath);
                        imageUrl = data.publicUrl;
                    }
                } catch (e) {
                    console.error('Image processing error', e);
                }
            }

            await api.trips.update(tripId, {
                destination: editDestination,
                description: editDescription,
                start_date: editStartDate,
                end_date: editEndDate,
                image_url: imageUrl || trip.image_url
            });

            Alert.alert('Sucesso', 'Viagem atualizada!');
            loadData(); // Reload to refresh state
        } catch (e: any) {
            Alert.alert('Erro', 'Falha ao atualizar: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    const formatDateDisplay = (dateStr: string | null) => {
        if (!dateStr) return '-';
        // Fix timezone issue by handling string directly YYYY-MM-DD
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    // --- Expense Handlers ---

    const handleOpenAddExpense = () => {
        setEditingExpense(null);
        setIsExpenseModalOpen(true);
    };

    const handleEditExpense = (expense: ExpenseRow) => {
        setEditingExpense(expense);
        setIsExpenseModalOpen(true);
    };

    const handleSaveExpense = async (expenseData: Partial<ExpenseInsert>) => {
        if (!trip || !user) return;

        try {
            if (editingExpense) {
                await api.expenses.update(editingExpense.id, expenseData);
            } else {
                await api.expenses.create({
                    ...expenseData,
                    trip_id: trip.id,
                    user_id: user.id,
                } as ExpenseInsert);
            }
            // Reload
            const updatedExpenses = await api.expenses.list(trip.id);
            setExpenses(updatedExpenses || []);
        } catch (error) {
            console.error('Error saving expense:', error);
            Alert.alert('Erro', 'Falha ao salvar despesa');
        }
    };

    const handleDeleteExpense = async (id: string) => {
        Alert.alert(
            'Confirmar Exclusão',
            'Deseja realmente excluir esta despesa?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.expenses.delete(id);
                            setExpenses(prev => prev.filter(e => e.id !== id));
                        } catch (error) {
                            console.error('Error deleting expense:', error);
                            Alert.alert('Erro', 'Falha ao excluir despesa');
                        }
                    }
                }
            ]
        );
    };

    const formatHeaderDate = (start: string | null, end: string | null) => {
        if (!start || !end) return '';
        const [y1, m1, d1] = start.split('-');
        const [y2, m2, d2] = end.split('-');
        return `${d1}/${m1} - ${d2}/${m2} de ${y1}`;
    };

    const headerDateText = (trip?.start_date && trip?.end_date)
        ? formatHeaderDate(trip.start_date, trip.end_date)
        : (editStartDate && editEndDate ? formatHeaderDate(editStartDate, editEndDate) : '');


    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!trip) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Viagem não encontrada.</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Image
                    source={{ uri: editCoverImage || trip?.image_url || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop' }}
                    style={styles.headerImage}
                />
                <View style={styles.headerOverlay} />
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>{editDestination || trip?.destination || 'Detalhes da Viagem'}</Text>
                    {headerDateText ? <Text style={styles.headerDate}>{headerDateText}</Text> : null}
                </View>
            </View>

            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
                    onPress={() => setActiveTab('overview')}
                >
                    <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Visão Geral</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'budget' && styles.activeTab]}
                    onPress={() => setActiveTab('budget')}
                >
                    <Text style={[styles.tabText, activeTab === 'budget' && styles.activeTabText]}>Gastos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'memories' && styles.activeTab]}
                    onPress={() => setActiveTab('memories')}
                >
                    <Text style={[styles.tabText, activeTab === 'memories' && styles.activeTabText]}>Memórias</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} tintColor={COLORS.primary} />
                }
            >
                {activeTab === 'overview' && (
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={{ flex: 1 }}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                    >
                        <View style={styles.overviewContainer}>

                            {/* Destino */}
                            <View style={styles.section}>
                                <Text style={styles.label}>Para onde você vai?</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        value={editDestination}
                                        onChangeText={setEditDestination}
                                        placeholder="Ex: Paris, França"
                                        placeholderTextColor="#999"
                                    />
                                </View>
                            </View>

                            {/* Imagem de Capa */}
                            <View style={styles.section}>
                                <Text style={styles.label}>Imagem de Capa</Text>
                                <TouchableOpacity style={styles.coverImageContainer} onPress={pickImage}>
                                    {editCoverImage ? (
                                        <Image source={{ uri: editCoverImage }} style={styles.coverImage} />
                                    ) : (
                                        <View style={styles.coverImagePlaceholder}>
                                            <Ionicons name="image-outline" size={40} color="#ccc" />
                                            <Text style={{ color: '#ccc', marginTop: 8 }}>Toque para alterar</Text>
                                        </View>
                                    )}
                                    <View style={styles.editImageOverlay}>
                                        <Ionicons name="camera" size={20} color="#fff" />
                                    </View>
                                </TouchableOpacity>
                            </View>

                            {/* Datas */}
                            <View style={styles.section}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <Text style={[styles.label, { marginBottom: 0 }]}>Quando?</Text>
                                    <TouchableOpacity onPress={() => { setEditStartDate(null); setEditEndDate(null); }}>
                                        <Text style={{ color: '#2563eb', fontWeight: '600', fontSize: 14 }}>Limpar</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.dateDisplayRow}>
                                    <View style={styles.dateDisplayBox}>
                                        <Text style={styles.dateDisplayLabel}>IDA</Text>
                                        <Text style={styles.dateDisplayValue}>
                                            {formatDateDisplay(editStartDate)}
                                        </Text>
                                    </View>
                                    <View style={styles.dateDisplayBox}>
                                        <Text style={styles.dateDisplayLabel}>VOLTA</Text>
                                        <Text style={styles.dateDisplayValue}>
                                            {formatDateDisplay(editEndDate)}
                                        </Text>
                                    </View>
                                </View>
                                <CustomCalendar
                                    startDate={editStartDate || ''}
                                    endDate={editEndDate || ''}
                                    onSelectDate={(date) => {
                                        // Logic to handle range selection (same as NewTripScreen)
                                        if (!editStartDate || (editStartDate && editEndDate)) {
                                            setEditStartDate(date);
                                            setEditEndDate('');
                                        } else {
                                            if (date < editStartDate) {
                                                setEditEndDate(editStartDate);
                                                setEditStartDate(date);
                                            } else {
                                                setEditEndDate(date);
                                            }
                                        }
                                    }}
                                    isDark={isDark}
                                />
                            </View>

                            {/* Seção de Participantes */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.labelBig}>Quem vai com você?</Text>
                                    <TouchableOpacity style={styles.inviteButton} onPress={() => Alert.alert('Convite', 'Link copiado!')}>
                                        <Ionicons name="share-social-outline" size={16} color={COLORS.primary} />
                                        <Text style={styles.inviteText}>Convidar</Text>
                                    </TouchableOpacity>
                                </View>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.participantsScroll}>
                                    <Participant
                                        avatar={user?.user_metadata?.avatar_url || 'https://i.pravatar.cc/150?u=me'}
                                        name="Você"
                                        isUser
                                    />
                                    {/* Mock Friends */}
                                    <Participant avatar="https://i.pravatar.cc/150?u=1" name="André" />
                                    <Participant avatar="https://i.pravatar.cc/150?u=2" name="Sofia" />

                                    <TouchableOpacity style={styles.addParticipant} onPress={() => Alert.alert('Adicionar', 'Funcionalidade em breve')}>
                                        <View style={styles.addParticipantCircle}>
                                            <Ionicons name="add" size={24} color="#666" />
                                        </View>
                                        <Text style={styles.addParticipantText}>Adicionar</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            </View>

                            {/* Descrição */}
                            <View style={styles.section}>
                                <Text style={styles.label}>Notas ou Descrição</Text>
                                <View style={styles.textAreaContainer}>
                                    <TextInput
                                        style={styles.textArea}
                                        value={editDescription}
                                        onChangeText={setEditDescription}
                                        placeholder="Sobre a viagem..."
                                        placeholderTextColor="#999"
                                        multiline
                                        textAlignVertical="top"
                                    />
                                </View>
                            </View>

                            {/* Save Button */}
                            <TouchableOpacity
                                style={[styles.saveButtonMain, saving && { opacity: 0.7 }]}
                                onPress={handleSaveOverview}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Salvar Alterações</Text>
                                )}
                            </TouchableOpacity>

                            <View style={{ height: 40 }} />
                        </View>
                    </KeyboardAvoidingView>
                )}

                {activeTab === 'budget' && (
                    <BudgetTab
                        expenses={expenses}
                        trip={trip}
                        onAddExpense={handleOpenAddExpense}
                        onEditExpense={handleEditExpense}
                        onDeleteExpense={handleDeleteExpense}
                        onRefresh={() => loadData(true)}
                    />
                )}
                {activeTab === 'memories' && (
                    <View style={styles.sectionContainer}>
                        <Text>Memories Mock</Text>
                    </View>
                )}
            </ScrollView>

            {trip && user && (
                <ExpenseModal
                    visible={isExpenseModalOpen}
                    onClose={() => setIsExpenseModalOpen(false)}
                    onSave={handleSaveExpense}
                    initialData={editingExpense}
                    tripId={trip.id}
                    userId={user.id}
                    isDark={isDark}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        height: 200,
        position: 'relative',
    },
    headerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    headerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    backButton: {
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 10,
        padding: 8,
    },
    headerContent: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    headerDate: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: COLORS.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    activeTabText: {
        color: COLORS.primary,
    },
    content: {
        flex: 1,
    },
    overviewContainer: {
        padding: 16,
    },
    sectionContainer: {
        padding: 16,
    },
    // Form Styles
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    labelBig: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        height: 50,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    textAreaContainer: {
        borderRadius: 12,
        minHeight: 100,
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 8,
    },
    textArea: {
        fontSize: 16,
        color: '#333',
        height: 100,
    },
    coverImageContainer: {
        height: 180,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
        justifyContent: 'center',
    },
    coverImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    coverImagePlaceholder: {
        alignItems: 'center',
    },
    editImageOverlay: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 6,
        borderRadius: 20,
    },
    saveButtonMain: {
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Reuse Calendar Styles
    calendarContainer: { borderRadius: 16, padding: 16, elevation: 1, backgroundColor: '#fff', marginBottom: 16 },
    calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    monthButton: { padding: 4 },
    monthTitle: { fontSize: 16, fontWeight: 'bold' },
    weekDaysRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
    weekDayText: { width: 40, textAlign: 'center', fontSize: 12, fontWeight: 'bold', color: '#94a3b8' },
    daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    dayCell: { width: '14.28%', height: 40, alignItems: 'center', justifyContent: 'center', marginVertical: 2 },
    rangeBackground: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, height: 40 },
    dayButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
    dayButtonSelected: { backgroundColor: COLORS.primary },
    dayButtonInRange: { borderRadius: 0 },
    dayText: { fontSize: 14, fontWeight: '500' },
    dayTextSelected: { color: '#ffffff', fontWeight: 'bold' },
    dateDisplayRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    dateDisplayBox: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'flex-start', backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee' },
    dateDisplayLabel: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' },
    dateDisplayValue: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    clearButton: { fontSize: 14, color: COLORS.primary, fontWeight: '500' },
    // Participant Styles
    participantsScroll: { marginTop: 8 },
    participant: { alignItems: 'center', marginRight: 16 },
    participantImageContainer: { position: 'relative' },
    participantImage: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#ffffff' },
    userBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.primary, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: '#ffffff' },
    userBadgeText: { color: '#ffffff', fontSize: 10, fontWeight: 'bold' },
    participantName: { fontSize: 12, fontWeight: '500', marginTop: 4, color: '#333' },
    addParticipant: { alignItems: 'center' },
    addParticipantCircle: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
    addParticipantText: { fontSize: 12, fontWeight: '500', marginTop: 4 },
    inviteButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    inviteText: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary },
    /* Removed duplicates */
    expenseAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111418',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111418',
        marginBottom: 16,
        marginLeft: 4,
    },
});

export default TripDetailScreen;
