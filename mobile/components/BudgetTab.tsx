import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Modal, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { ExpenseRow, TripRow, api } from '../services/api';

const { width } = Dimensions.get('window');

interface BudgetTabProps {
    expenses: ExpenseRow[];
    trip: TripRow;
    onAddExpense: () => void;
    onEditExpense: (expense: ExpenseRow) => void;
    onDeleteExpense: (id: string) => void;
    onRefresh?: () => void;
}

type TimeFilter = 'period' | 'today' | 'week' | 'month';

const BudgetTab: React.FC<BudgetTabProps> = ({ expenses, trip, onAddExpense, onEditExpense, onDeleteExpense, onRefresh }) => {
    const [filter, setFilter] = useState<TimeFilter>('period');

    // Budget Modal State
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [newBudget, setNewBudget] = useState(trip.budget?.toString() || '');
    const [loadingBudget, setLoadingBudget] = useState(false);

    const handleUpdateBudget = async () => {
        if (!newBudget) {
            Alert.alert('Erro', 'Por favor insira um valor.');
            return;
        }
        setLoadingBudget(true);
        try {
            await api.trips.update(trip.id, { budget: parseFloat(newBudget) });
            setIsBudgetModalOpen(false);
            Alert.alert('Sucesso', 'Orçamento atualizado!');
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Falha ao atualizar orçamento');
        } finally {
            setLoadingBudget(false);
        }
    };

    // 1. Filter Logic
    const filteredExpenses = useMemo(() => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        return expenses.filter(e => {
            const date = new Date(e.date);
            switch (filter) {
                case 'today': return date >= startOfDay;
                case 'week': return date >= startOfWeek;
                case 'month': return date >= startOfMonth;
                default: return true; // 'period' = all
            }
        });
    }, [expenses, filter]);

    // 2. Calculations
    const totalSpent = filteredExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const budget = (trip as any).budget || 0; // Real DB value
    const available = budget - totalSpent;
    const progress = Math.min(totalSpent / budget, 1);

    // Group by Category
    const categoryStats = useMemo(() => {
        const stats: Record<string, number> = {};
        filteredExpenses.forEach(e => {
            stats[e.category] = (stats[e.category] || 0) + Number(e.amount);
        });
        return Object.entries(stats)
            .map(([name, total]) => ({ name, total, percent: total / totalSpent }))
            .sort((a, b) => b.total - a.total);
    }, [filteredExpenses, totalSpent]);

    // Group by Date for Transactions
    const groupedTransactions = useMemo(() => {
        const groups: Record<string, ExpenseRow[]> = {};
        filteredExpenses.forEach(e => {
            const dateStr = new Date(e.date).toLocaleDateString('pt-BR'); // Simplified date key
            // Better formatting logic needed for "Hoje", "Ontem"
            // For now simple string
            if (!groups[dateStr]) groups[dateStr] = [];
            groups[dateStr].push(e);
        });
        return groups;
    }, [filteredExpenses]);

    // --- Sub Components ---

    const FilterPill = ({ label, value }: { label: string, value: TimeFilter }) => (
        <TouchableOpacity
            style={[styles.pill, filter === value && styles.pillActive]}
            onPress={() => setFilter(value)}
        >
            <Text style={[styles.pillText, filter === value && styles.pillTextActive]}>{label}</Text>
        </TouchableOpacity>
    );

    const getCategoryIcon = (cat: string) => {
        switch (cat.toLowerCase()) {
            case 'alimentação': return 'silverware-fork-knife';
            case 'transporte': return 'car'; // or 'car-hatchback'
            case 'lazer': return 'ticket'; // or 'ticket-confirmation'
            case 'hospedagem': return 'bed';
            default: return 'cart';
        }
    };

    const getCategoryColor = (cat: string) => {
        switch (cat.toLowerCase()) {
            case 'alimentação': return '#F97316'; // Orange
            case 'transporte': return '#3B82F6'; // Blue
            case 'lazer': return '#A855F7'; // Purple
            case 'hospedagem': return '#EF4444'; // Red
            default: return '#10B981'; // Green
        }
    };

    return (
        <View style={styles.container}>
            {/* 1. Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContainer}>
                <FilterPill label="Todo o Período" value="period" />
                <FilterPill label="Hoje" value="today" />
                <FilterPill label="Semana" value="week" />
                <FilterPill label="Mês" value="month" />
            </ScrollView>

            {/* 2. Balance Card */}
            <View style={styles.balanceCard}>
                <View style={styles.balanceHeader}>
                    <Text style={styles.balanceLabel}>SALDO DISPONÍVEL (GLOBAL)</Text>
                    <Ionicons name="wallet-outline" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.balanceValue}>R$ {available.toFixed(2).replace('.', ',')}</Text>

                <View style={styles.progressRow}>
                    <Text style={styles.progressLabel}>Utilizado (Vista): <Text style={{ fontWeight: 'bold' }}>R$ {totalSpent.toFixed(2)}</Text></Text>
                    <Text style={styles.progressLabel}>Total: R$ {budget / 1000}k</Text>
                </View>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                </View>
                <Text style={styles.percentageText}>{Math.round(progress * 100)}% DO ORÇAMENTO TOTAL</Text>
            </View>

            {/* 3. Category Cards */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={{ paddingHorizontal: 16 }}>
                {categoryStats.map(stat => (
                    <View key={stat.name} style={styles.categoryCard}>
                        <View style={[styles.iconCircle, { backgroundColor: getCategoryColor(stat.name) + '20' }]}>
                            <MaterialCommunityIcons name={getCategoryIcon(stat.name) as any} size={24} color={getCategoryColor(stat.name)} />
                        </View>
                        <Text style={styles.catCardName}>{stat.name}</Text>
                        <Text style={styles.catCardValue}>R$ {stat.total.toFixed(0)}</Text>
                    </View>
                ))}
            </ScrollView>

            {/* 4. Distribution */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Distribuição</Text>
                <TouchableOpacity onPress={() => { setNewBudget(trip.budget?.toString() || ''); setIsBudgetModalOpen(true); }}>
                    <Text style={styles.configureText}>CONFIGURAR</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.distributionCard}>
                {categoryStats.map(stat => (
                    <View key={stat.name} style={styles.distRow}>
                        <View style={styles.distHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={[styles.dot, { backgroundColor: getCategoryColor(stat.name) }]} />
                                <Text style={styles.distName}>{stat.name}</Text>
                            </View>
                            <Text style={styles.distPercent}>{Math.round(stat.percent * 100)}%</Text>
                        </View>
                        <View style={styles.distBarBg}>
                            <View style={[styles.distBarFill, { width: `${stat.percent * 100}%`, backgroundColor: getCategoryColor(stat.name) }]} />
                        </View>
                    </View>
                ))}
            </View>

            {/* 5. Transactions */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Transações</Text>
            </View>

            {Object.entries(groupedTransactions).map(([date, list]) => (
                <View key={date}>
                    <Text style={styles.dateHeader}>{date}</Text>
                    {list.map(expense => (
                        <TouchableOpacity
                            key={expense.id}
                            style={styles.transactionCard}
                            onPress={() => onEditExpense(expense)}
                        >
                            <View style={styles.transLeft}>
                                <View style={styles.transIconBox}>
                                    <MaterialCommunityIcons name={getCategoryIcon(expense.category) as any} size={24} color="#666" />
                                </View>
                                <View>
                                    <Text style={styles.transTitle}>{expense.description}</Text>
                                    <Text style={styles.transCat}>{expense.category}</Text>
                                </View>
                            </View>
                            <Text style={styles.transAmount}>- R$ {Number(expense.amount).toFixed(2).replace('.', ',')}</Text>
                            <TouchableOpacity onPress={() => onDeleteExpense(expense.id)} style={styles.deleteButton}>
                                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
                </View>
            ))}

            {/* Spacer for FAB */}
            <View style={{ height: 80 }} />

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={onAddExpense}
            >
                <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>
            {/* Budget Configuration Modal */}
            <Modal
                visible={isBudgetModalOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setIsBudgetModalOpen(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Configurar Orçamento</Text>
                        <Text style={styles.modalSubtitle}>Defina o limite de gastos para esta viagem.</Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.currencySymbol}>R$</Text>
                            <TextInput
                                style={styles.budgetInput}
                                value={newBudget}
                                onChangeText={setNewBudget}
                                placeholder="0.00"
                                keyboardType="numeric"
                                autoFocus
                            />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnCancel]}
                                onPress={() => setIsBudgetModalOpen(false)}
                            >
                                <Text style={styles.modalBtnTextCancel}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnSave]}
                                onPress={handleUpdateBudget}
                                disabled={loadingBudget}
                            >
                                {loadingBudget ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnTextSave}>Salvar</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        position: 'relative', // Ensure FAB positions correctly
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
    },
    // Pills
    filterScroll: { maxHeight: 60, marginBottom: 8 },
    filterContainer: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
    pill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#eee',
        marginRight: 8,
    },
    pillActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    pillText: { fontSize: 13, fontWeight: '600', color: '#333' },
    pillTextActive: { color: '#fff' },

    // Balance Card
    balanceCard: {
        marginHorizontal: 16,
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    balanceLabel: { fontSize: 10, fontWeight: '800', color: '#9CA3AF', letterSpacing: 0.5 },
    balanceValue: { fontSize: 32, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
    progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    progressLabel: { fontSize: 12, color: '#6B7280' },
    progressBarBg: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, marginBottom: 12 },
    progressBarFill: { height: 8, backgroundColor: COLORS.primary, borderRadius: 4 },
    percentageText: { fontSize: 10, fontWeight: 'bold', color: COLORS.primary, textAlign: 'right' },

    // Category Cards
    categoryScroll: { marginBottom: 24 },
    categoryCard: {
        width: 120,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginRight: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    iconCircle: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    catCardName: { fontSize: 11, fontWeight: 'bold', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 4 },
    catCardValue: { fontSize: 16, fontWeight: 'bold', color: '#111827' },

    // Distribution
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
    configureText: { fontSize: 12, fontWeight: 'bold', color: COLORS.primary },
    distributionCard: {
        marginHorizontal: 16,
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
    },
    distRow: { marginBottom: 16 },
    distHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    dot: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
    distName: { fontSize: 14, fontWeight: '600', color: '#374151' },
    distPercent: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
    distBarBg: { height: 6, backgroundColor: '#F3F4F6', borderRadius: 3 },
    distBarFill: { height: 6, borderRadius: 3 },

    // Transactions
    dateHeader: { paddingHorizontal: 16, fontSize: 11, fontWeight: 'bold', color: '#9CA3AF', marginTop: 8, marginBottom: 8, textTransform: 'uppercase' },
    transactionCard: {
        marginHorizontal: 16,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    transLeft: { flexDirection: 'row', alignItems: 'center' },
    transIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    transTitle: { fontSize: 14, fontWeight: 'bold', color: '#111827', marginBottom: 2 },
    transCat: { fontSize: 11, color: '#9CA3AF' },
    transAmount: { fontSize: 14, fontWeight: 'bold', color: '#EF4444' },
    deleteButton: { padding: 8, marginLeft: 8 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '100%', maxWidth: 400, alignItems: 'center' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
    modalSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 24, textAlign: 'center' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, height: 56, marginBottom: 24, width: '100%' },
    currencySymbol: { fontSize: 18, color: '#9CA3AF', fontWeight: 'bold', marginRight: 8 },
    budgetInput: { flex: 1, fontSize: 18, fontWeight: 'bold', color: '#111827' },
    modalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
    modalBtn: { flex: 1, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    modalBtnCancel: { backgroundColor: '#F3F4F6' },
    modalBtnSave: { backgroundColor: COLORS.primary },
    modalBtnTextCancel: { color: '#4B5563', fontWeight: '600' },
    modalBtnTextSave: { color: '#fff', fontWeight: 'bold' },
});

export default BudgetTab;
