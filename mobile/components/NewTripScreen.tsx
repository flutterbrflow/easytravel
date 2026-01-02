
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    useColorScheme,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { IMAGES, COLORS } from '../constants';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'NewTrip'>;

const NewTripScreen: React.FC<Props> = ({ navigation }) => {
    const { user } = useAuth();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [destination, setDestination] = useState('');
    const [loading, setLoading] = useState(false);

    // Calendar State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Helper to handle date selection logic
    const handleDateSelect = (date: string) => {
        if (!startDate || (startDate && endDate)) {
            setStartDate(date);
            setEndDate('');
        } else {
            // Logic to ensure start before end
            if (new Date(date) < new Date(startDate)) {
                setEndDate(startDate);
                setStartDate(date);
            } else {
                setEndDate(date);
            }
        }
    };

    const clearDates = () => {
        setStartDate('');
        setEndDate('');
    };

    const handleSave = async () => {
        if (!destination) {
            Alert.alert('Atenção', 'Por favor, informe o destino.');
            return;
        }

        if (!user) {
            Alert.alert('Erro', 'Você precisa estar logado para salvar.');
            return;
        }

        if (!startDate || !endDate) {
            Alert.alert('Atenção', 'Por favor, selecione as datas de ida e volta.');
            return;
        }

        setLoading(true);
        try {
            await api.trips.create({
                destination,
                start_date: startDate,
                end_date: endDate,
                user_id: user.id || 'unknown',
                status: 'planning',
                image_url: IMAGES.genericMap // Default image
            });
            // Close the modal properly
            navigation.goBack();
        } catch (error: any) {
            console.error('Error saving trip', error);
            Alert.alert('Erro', 'Não foi possível salvar a viagem: ' + error.message);
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
            <View style={[styles.header, { borderBottomColor: isDark ? '#22303e' : '#e5e7eb' }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelButton}>Cancelar</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDark ? COLORS.textLight : COLORS.textDark }]}>
                    Nova Viagem
                </Text>
                <TouchableOpacity onPress={handleSave} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                        <Text style={styles.saveButton}>Salvar</Text>
                    )}
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Headline */}
                    <Text style={[styles.headline, { color: isDark ? COLORS.textLight : COLORS.textDark }]}>
                        Vamos planejar sua{'\n'}próxima aventura?
                    </Text>

                    {/* Destination Input */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: isDark ? '#e5e7eb' : COLORS.textDark }]}>
                            Para onde você vai?
                        </Text>
                        <View style={[styles.inputContainer, { backgroundColor: isDark ? '#1e2a36' : '#ffffff' }]}>
                            <MaterialCommunityIcons name="map-marker" size={24} color={COLORS.primary} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: isDark ? COLORS.textLight : COLORS.textDark }]}
                                placeholder="Ex: Paris, França"
                                placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                                value={destination}
                                onChangeText={setDestination}
                            />
                        </View>
                    </View>

                    {/* Date Selection */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.label, { color: isDark ? '#e5e7eb' : COLORS.textDark }]}>
                                Quando?
                            </Text>
                            <TouchableOpacity onPress={clearDates}>
                                <Text style={styles.clearButton}>Limpar</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Selected Dates Display */}
                        <View style={styles.dateDisplayRow}>
                            <View style={[styles.dateDisplayBox, { backgroundColor: isDark ? '#1e2a36' : '#ffffff' }]}>
                                <Text style={styles.dateDisplayLabel}>IDA</Text>
                                <Text style={[styles.dateDisplayValue, { color: isDark ? COLORS.textLight : COLORS.textDark }]}>
                                    {startDate ? startDate.split('-').reverse().join('/') : '-'}
                                </Text>
                            </View>
                            <View style={[styles.dateDisplayBox, { backgroundColor: isDark ? '#1e2a36' : '#ffffff' }]}>
                                <Text style={styles.dateDisplayLabel}>VOLTA</Text>
                                <Text style={[styles.dateDisplayValue, { color: isDark ? COLORS.textLight : COLORS.textDark }]}>
                                    {endDate ? endDate.split('-').reverse().join('/') : '-'}
                                </Text>
                            </View>
                        </View>

                        {/* Custom Calendar Component */}
                        <CustomCalendar
                            startDate={startDate}
                            endDate={endDate}
                            onSelectDate={handleDateSelect}
                            isDark={isDark}
                        />
                    </View>

                    {/* Participants */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.labelBig, { color: isDark ? '#e5e7eb' : COLORS.textDark }]}>
                                Quem vai com você?
                            </Text>
                            <TouchableOpacity style={styles.inviteButton}>
                                <MaterialCommunityIcons name="share-variant" size={18} color={COLORS.primary} />
                                <Text style={styles.inviteText}>Convidar</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.participantsScroll}>
                            <Participant avatar={user?.user_metadata?.avatar_url || IMAGES.userAvatar} name="Você" isUser />
                            <Participant avatar={IMAGES.friend1} name="André" />
                            <Participant avatar={IMAGES.friend2} name="Sofia" />
                            <TouchableOpacity style={styles.addParticipant}>
                                <View style={[styles.addParticipantCircle, { borderColor: isDark ? '#64748b' : '#cbd5e1' }]}>
                                    <MaterialCommunityIcons name="plus" size={24} color={isDark ? '#64748b' : '#94a3b8'} />
                                </View>
                                <Text style={[styles.addParticipantText, { color: isDark ? '#64748b' : '#94a3b8' }]}>
                                    Adicionar
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>

                    {/* Notes */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: isDark ? '#e5e7eb' : COLORS.textDark }]}>
                            Notas ou Descrição
                        </Text>
                        <View style={[styles.textAreaContainer, { backgroundColor: isDark ? '#1e2a36' : '#ffffff' }]}>
                            <TextInput
                                style={[styles.textArea, { color: isDark ? COLORS.textLight : COLORS.textDark }]}
                                placeholder="Escreva algo sobre a viagem..."
                                placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Sticky Footer CTA */}
            <View style={[styles.footer, { backgroundColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight }]}>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={handleSave}
                    activeOpacity={0.8}
                    disabled={loading}
                >
                    <MaterialCommunityIcons name="airplane-takeoff" size={24} color="#ffffff" />
                    <Text style={styles.createButtonText}>{loading ? 'Salvando...' : 'Criar Viagem'}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

// Custom Calendar Component for Mobile
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
                    // Manual date construction to avoid timezone issues
                    const year = currentDate.getFullYear();
                    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                    const dayStr = String(d).padStart(2, '0');
                    const dateStr = `${year}-${month}-${dayStr}`;

                    const selected = isSelected(d, dateStr);
                    const inRange = isInRange(d, dateStr);

                    return (
                        <View key={d} style={styles.dayCell}>
                            {inRange && <View style={[styles.rangeBackground, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#eff6ff' }]} />}

                            {/* Connector Lines for visually connecting range to selected ends */}
                            {selected && startDate && endDate && startDate !== endDate && (
                                <View style={[
                                    styles.rangeBackground,
                                    {
                                        backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#eff6ff',
                                        width: '50%',
                                        left: new Date(startDate).getDate() === d ? '50%' : 0
                                    }
                                ]} />
                            )}

                            <TouchableOpacity
                                onPress={() => onSelectDate(dateStr)}
                                style={[
                                    styles.dayButton,
                                    selected && styles.dayButtonSelected,
                                    !selected && inRange && styles.dayButtonInRange
                                ]}
                            >
                                <Text style={[
                                    styles.dayText,
                                    { color: isDark ? '#ffffff' : '#111418' },
                                    selected && styles.dayTextSelected,
                                    inRange && !selected && { color: '#2563eb' }
                                ]}>
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


const Participant: React.FC<{ avatar: string; name: string; isUser?: boolean }> = ({ avatar, name, isUser }) => (
    <View style={styles.participant}>
        <View style={styles.participantImageContainer}>
            <Image source={{ uri: avatar }} style={styles.participantImage} />
            {isUser && (
                <View style={styles.userBadge}>
                    <Text style={styles.userBadgeText}>Eu</Text>
                </View>
            )}
        </View>
        <Text style={styles.participantName}>{name}</Text>
    </View>
);

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
        borderBottomWidth: 1,
    },
    cancelButton: {
        fontSize: 16,
        color: '#64748b',
        width: 80,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    saveButton: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: 'bold',
        width: 80,
        textAlign: 'right',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    headline: {
        fontSize: 28,
        fontWeight: '800',
        lineHeight: 34,
        marginBottom: 24,
    },
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
    },
    labelBig: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        height: 56,
        paddingHorizontal: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    dateDisplayRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    dateDisplayBox: {
        flex: 1,
        borderRadius: 12,
        padding: 12,
        alignItems: 'flex-start',
    },
    dateDisplayLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#94a3b8',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    dateDisplayValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    clearButton: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '500',
    },

    // Calendar Styles
    calendarContainer: {
        borderRadius: 16,
        padding: 16,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    monthTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    monthButton: {
        padding: 4,
    },
    weekDaysRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 8,
    },
    weekDayText: {
        width: 40,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 'bold',
        color: '#94a3b8',
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: '14.28%', // 100% / 7 days
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 2,
        position: 'relative',
    },
    rangeBackground: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        height: 40,
    },
    dayButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    dayButtonSelected: {
        backgroundColor: COLORS.primary,
    },
    dayButtonInRange: {
        borderRadius: 0,
    },
    dayText: {
        fontSize: 14,
        fontWeight: '500',
    },
    dayTextSelected: {
        color: '#ffffff',
        fontWeight: 'bold',
    },

    participantsScroll: {
        marginTop: 8,
    },
    participant: {
        alignItems: 'center',
        marginRight: 16,
    },
    participantImageContainer: {
        position: 'relative',
    },
    participantImage: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    userBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderWidth: 1,
        borderColor: '#ffffff',
    },
    userBadgeText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    participantName: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 4,
    },
    addParticipant: {
        alignItems: 'center',
    },
    addParticipantCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 2,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addParticipantText: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 4,
    },
    inviteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    inviteText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    textAreaContainer: {
        borderRadius: 12,
        minHeight: 100,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    textArea: {
        padding: 16,
        fontSize: 16,
        fontWeight: '500',
        minHeight: 100,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        height: 56,
        borderRadius: 28,
        elevation: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
    },
    createButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default NewTripScreen;
