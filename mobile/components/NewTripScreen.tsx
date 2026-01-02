import React from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { IMAGES, COLORS } from '../constants';

type Props = NativeStackScreenProps<RootStackParamList, 'NewTrip'>;

const NewTripScreen: React.FC<Props> = ({ navigation }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

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
                <TouchableOpacity onPress={() => navigation.navigate('TripList')}>
                    <Text style={styles.saveButton}>Salvar</Text>
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
                            />
                        </View>
                    </View>

                    {/* Date Selection */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.label, { color: isDark ? '#e5e7eb' : COLORS.textDark }]}>
                                Quando?
                            </Text>
                            <TouchableOpacity>
                                <Text style={styles.clearButton}>Limpar</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.dateRow}>
                            <View style={[styles.dateBox, styles.dateActive, { backgroundColor: isDark ? '#1e2a36' : '#ffffff' }]}>
                                <Text style={[styles.dateLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>IDA</Text>
                                <Text style={[styles.dateValue, { color: isDark ? COLORS.textLight : COLORS.textDark }]}>
                                    5 Jul, 2024
                                </Text>
                            </View>
                            <View style={[styles.dateBox, { backgroundColor: isDark ? '#1e2a36' : '#ffffff' }]}>
                                <Text style={[styles.dateLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>VOLTA</Text>
                                <Text style={[styles.dateValueEmpty, { color: isDark ? '#64748b' : '#94a3b8' }]}>
                                    Selecione
                                </Text>
                            </View>
                        </View>

                        {/* Calendar Placeholder */}
                        <View style={[styles.calendar, { backgroundColor: isDark ? '#1e2a36' : '#ffffff' }]}>
                            <View style={styles.calendarHeader}>
                                <TouchableOpacity>
                                    <MaterialCommunityIcons name="chevron-left" size={20} color={isDark ? COLORS.textLight : COLORS.textDark} />
                                </TouchableOpacity>
                                <Text style={[styles.calendarMonth, { color: isDark ? COLORS.textLight : COLORS.textDark }]}>
                                    Julho 2024
                                </Text>
                                <TouchableOpacity>
                                    <MaterialCommunityIcons name="chevron-right" size={20} color={isDark ? COLORS.textLight : COLORS.textDark} />
                                </TouchableOpacity>
                            </View>
                            <Text style={[styles.calendarPlaceholder, { color: isDark ? '#64748b' : '#94a3b8' }]}>
                                📅 Calendário (em desenvolvimento)
                            </Text>
                        </View>
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
                            <Participant avatar={IMAGES.userAvatar} name="Você" isUser />
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
                    onPress={() => navigation.navigate('TripList')}
                    activeOpacity={0.8}
                >
                    <MaterialCommunityIcons name="airplane-takeoff" size={24} color="#ffffff" />
                    <Text style={styles.createButtonText}>Criar Viagem</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
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
    dateRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    dateBox: {
        flex: 1,
        borderRadius: 12,
        padding: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    dateActive: {
        borderColor: COLORS.primary,
    },
    dateLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 4,
    },
    dateValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    dateValueEmpty: {
        fontSize: 16,
        fontWeight: '500',
    },
    clearButton: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '500',
    },
    calendar: {
        borderRadius: 16,
        padding: 16,
        minHeight: 100,
        elevation: 2,
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
    calendarMonth: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    calendarPlaceholder: {
        textAlign: 'center',
        fontSize: 14,
        paddingVertical: 20,
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
