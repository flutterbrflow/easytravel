import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { ExpenseRow, ExpenseInsert } from '../services/api';
import CustomCalendar from './CustomCalendar';

interface ExpenseModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (expense: Partial<ExpenseInsert>) => Promise<void>;
    initialData?: ExpenseRow | null;
    tripId: string;
    userId: string;
    isDark: boolean;
}

const CATEGORIES = [
    { id: 'Alimentação', icon: 'food', label: 'Alimentação' },
    { id: 'Transporte', icon: 'bus', label: 'Transporte' },
    { id: 'Hospedagem', icon: 'bed', label: 'Hospedagem' },
    { id: 'Atividades', icon: 'hiking', label: 'Atividades' },
    { id: 'Compras', icon: 'shopping', label: 'Compras' },
    { id: 'Outros', icon: 'cash', label: 'Outros' },
];

const ExpenseModal: React.FC<ExpenseModalProps> = ({
    visible,
    onClose,
    onSave,
    initialData,
    tripId,
    userId,
    isDark
}) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState(CATEGORIES[0].id);
    const [date, setDate] = useState(new Date());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            if (initialData) {
                setDescription(initialData.description);
                setAmount(initialData.amount.toString());
                setCategory(initialData.category);
                setDate(new Date(initialData.date));
            } else {
                setDescription('');
                setAmount('');
                setCategory(CATEGORIES[0].id);
                setDate(new Date());
            }
        }
    }, [visible, initialData]);

    const handleSubmit = async () => {
        if (!description || !amount) {
            Alert.alert('Erro', 'Preencha a descrição e o valor.');
            return;
        }

        try {
            setLoading(true);
            await onSave({
                trip_id: tripId,
                user_id: userId,
                description,
                amount: parseFloat(amount),
                category,
                date: date.toISOString().split('T')[0],
            });
            onClose();
        } catch (error) {
            console.error('Error saving expense:', error);
            Alert.alert('Erro', 'Não foi possível salvar a despesa.');
        } finally {
            setLoading(false);
        }
    };

    // handleDateChange removed because CustomCalendar uses onSelectDate directly

    const styles = StyleSheet.create({
        centeredView: {
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.5)',
        },
        modalView: {
            backgroundColor: isDark ? COLORS.surfaceDark : COLORS.surfaceLight,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
            maxHeight: '90%',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
        },
        title: {
            fontSize: 20,
            fontWeight: 'bold',
            color: isDark ? '#fff' : '#111418',
        },
        label: {
            fontSize: 14,
            fontWeight: '600',
            color: isDark ? '#9ca3af' : '#4b5563',
            marginBottom: 8,
        },
        input: {
            backgroundColor: isDark ? COLORS.backgroundDark : '#f3f4f6',
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            color: isDark ? '#fff' : '#111418',
            marginBottom: 16,
        },
        amountContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? COLORS.backgroundDark : '#f3f4f6',
            borderRadius: 12,
            paddingHorizontal: 16,
            marginBottom: 16,
        },
        currency: {
            fontSize: 18,
            fontWeight: 'bold',
            color: isDark ? '#9ca3af' : '#6b7280',
            marginRight: 8,
        },
        amountInput: {
            flex: 1,
            paddingVertical: 16,
            fontSize: 16,
            color: isDark ? '#fff' : '#111418',
        },
        categoriesGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 16,
        },
        categoryButton: {
            width: '31%',
            padding: 12,
            borderRadius: 12,
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },
        categoryIcon: {
            marginBottom: 4,
        },
        categoryLabel: {
            fontSize: 10,
            fontWeight: '600',
        },
        dateButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? COLORS.backgroundDark : '#f3f4f6',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
        },
        dateText: {
            fontSize: 16,
            color: isDark ? '#fff' : '#111418',
            marginLeft: 8,
        },
        saveButton: {
            backgroundColor: COLORS.primary,
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
        },
        saveButtonText: {
            color: '#fff',
            fontSize: 16,
            fontWeight: 'bold',
        },
    });

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ width: '100%' }}
                >
                    <View style={styles.modalView}>
                        <View style={styles.header}>
                            <Text style={styles.title}>
                                {initialData ? 'Editar Despesa' : 'Nova Despesa'}
                            </Text>
                            <TouchableOpacity onPress={onClose}>
                                <MaterialCommunityIcons name="close" size={24} color={isDark ? '#fff' : '#000'} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Valor */}
                            <Text style={styles.label}>Valor</Text>
                            <View style={styles.amountContainer}>
                                <Text style={styles.currency}>R$</Text>
                                <TextInput
                                    style={styles.amountInput}
                                    value={amount}
                                    onChangeText={setAmount}
                                    keyboardType="numeric"
                                    placeholder="0.00"
                                    placeholderTextColor={isDark ? '#4b5563' : '#9ca3af'}
                                />
                            </View>

                            {/* Descrição */}
                            <Text style={styles.label}>Descrição</Text>
                            <TextInput
                                style={styles.input}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Ex: Jantar, Táxi..."
                                placeholderTextColor={isDark ? '#4b5563' : '#9ca3af'}
                            />

                            {/* Categoria */}
                            <Text style={styles.label}>Categoria</Text>
                            <View style={styles.categoriesGrid}>
                                {CATEGORIES.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[
                                            styles.categoryButton,
                                            {
                                                borderColor: category === cat.id ? COLORS.primary : (isDark ? '#374151' : '#e5e7eb'),
                                                backgroundColor: category === cat.id
                                                    ? (isDark ? 'rgba(37,99,235,0.2)' : '#eff6ff')
                                                    : (isDark ? COLORS.backgroundDark : '#fff'),
                                            }
                                        ]}
                                        onPress={() => setCategory(cat.id)}
                                    >
                                        <MaterialCommunityIcons
                                            name={cat.icon as any}
                                            size={24}
                                            color={category === cat.id ? COLORS.primary : (isDark ? '#9ca3af' : '#6b7280')}
                                            style={styles.categoryIcon}
                                        />
                                        <Text style={[
                                            styles.categoryLabel,
                                            { color: category === cat.id ? COLORS.primary : (isDark ? '#9ca3af' : '#6b7280') }
                                        ]}>
                                            {cat.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Data */}
                            <Text style={styles.label}>Data</Text>
                            <CustomCalendar
                                startDate={date.toISOString().split('T')[0]}
                                endDate=""
                                onSelectDate={(selectedDate) => setDate(new Date(selectedDate))}
                                isDark={isDark}
                            />

                            {/* Salvar */}
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Salvar Despesa</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

export default ExpenseModal;
