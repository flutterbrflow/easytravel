import React, { useState, useMemo } from 'react';
import { TripRow, ExpenseRow, api } from '../services/api';

interface BudgetTabProps {
    expenses: ExpenseRow[];
    trip: TripRow;
    onAddExpense: () => void;
    onEditExpense: (expense: ExpenseRow) => void;
    onDeleteExpense: (id: string) => void;
}

type TimeFilter = 'period' | 'today' | 'week' | 'month';

const BudgetTab: React.FC<BudgetTabProps> = ({ expenses, trip, onAddExpense, onEditExpense, onDeleteExpense }) => {
    const [filter, setFilter] = useState<TimeFilter>('period');

    // State for Budget Config
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [newBudget, setNewBudget] = useState(trip.budget?.toString() || '');
    const [loadingBudget, setLoadingBudget] = useState(false);

    // Update Budget Handler
    const handleUpdateBudget = async () => {
        try {
            setLoadingBudget(true);
            const budgetValue = parseFloat(newBudget.replace(',', '.'));

            if (isNaN(budgetValue)) {
                alert('Por favor, insira um valor válido.');
                return;
            }

            await api.trips.update(trip.id, { budget: budgetValue });
            window.location.reload();
        } catch (error: any) {
            console.error(error);
            alert(`Erro ao atualizar orçamento: ${error.message || 'Tente novamente.'}`);
        } finally {
            setLoadingBudget(false);
        }
    };

    // Temporary Seed Data
    const handleSeedData = async () => {
        if (!confirm('Deseja adicionar dados de exemplo?')) return;
        try {
            const categories = ['Alimentação', 'Transporte', 'Lazer', 'Hospedagem', 'Compras'];
            const descs = ['Jantar', 'Uber', 'Ingresso', 'Hotel', 'Souvenir'];
            const today = new Date();
            const dates = [
                today.toISOString().split('T')[0],
                new Date(today.setDate(today.getDate() - 1)).toISOString().split('T')[0],
                new Date(today.setDate(today.getDate() - 5)).toISOString().split('T')[0]
            ];

            for (let i = 0; i < 5; i++) {
                const cat = categories[i % categories.length];
                await api.expenses.create({
                    trip_id: trip.id,
                    user_id: trip.user_id,
                    description: `${descs[i % descs.length]} Teste`,
                    amount: Math.floor(Math.random() * 200) + 20,
                    category: cat,
                    date: dates[i % dates.length]
                });
            }
            alert('Dados inseridos! Atualize a página.');
            window.location.reload();
        } catch (e) {
            console.error(e);
            alert('Erro ao semear dados.');
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
    const budget = (trip as any).budget || 0; // Use DB budget or 0
    const available = budget - totalSpent;
    const progress = budget > 0 ? Math.min(totalSpent / budget, 1) : 0; // Handle division by zero

    // Group by Category
    const categoryStats = useMemo(() => {
        const stats: Record<string, number> = {};
        filteredExpenses.forEach(e => {
            stats[e.category] = (stats[e.category] || 0) + Number(e.amount);
        });
        return Object.entries(stats)
            .map(([name, total]) => ({ name, total, percent: totalSpent > 0 ? total / totalSpent : 0 }))
            .sort((a, b) => b.total - a.total);
    }, [filteredExpenses, totalSpent]);

    // Group by Date for Transactions
    const groupedTransactions = useMemo(() => {
        const groups: Record<string, ExpenseRow[]> = {};
        filteredExpenses.forEach(e => {
            const dateStr = new Date(e.date).toLocaleDateString('pt-BR');
            if (!groups[dateStr]) groups[dateStr] = [];
            groups[dateStr].push(e);
        });
        return groups;
    }, [filteredExpenses]);

    // Helpers
    const getCategoryIcon = (cat: string) => {
        switch (cat.toLowerCase()) {
            case 'alimentação': return 'restaurant';
            case 'transporte': return 'directions_car'; // Material Icon name
            case 'lazer': return 'local_activity'; // Material Icon name
            case 'hospedagem': return 'hotel';
            default: return 'shopping_cart';
        }
    };

    const getCategoryColorClass = (cat: string) => {
        // Returning Tailwind classes for colors
        switch (cat.toLowerCase()) {
            case 'alimentação': return 'text-orange-500 bg-orange-100';
            case 'transporte': return 'text-blue-500 bg-blue-100';
            case 'lazer': return 'text-purple-500 bg-purple-100';
            case 'hospedagem': return 'text-red-500 bg-red-100';
            default: return 'text-emerald-500 bg-emerald-100';
        }
    };
    const getCategoryBgColor = (cat: string) => {
        // Inline style fallback for width/color specific logic if needed
        switch (cat.toLowerCase()) {
            case 'alimentação': return '#F97316';
            case 'transporte': return '#3B82F6';
            case 'lazer': return '#A855F7';
            case 'hospedagem': return '#EF4444';
            default: return '#10B981';
        }
    }

    return (
        <div className="space-y-8 animate-fade-in pb-24 relative">
            {/* 1. Header & Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-wrap bg-white dark:bg-[#1e2a36] p-1 rounded-2xl sm:rounded-full border border-gray-200 dark:border-gray-800 shadow-sm w-full sm:w-auto">
                    {(['period', 'today', 'week', 'month'] as TimeFilter[]).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl sm:rounded-full text-sm font-bold transition-all whitespace-nowrap ${filter === f
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                                }`}
                        >
                            {f === 'period' ? 'Todo o Período' :
                                f === 'today' ? 'Hoje' :
                                    f === 'week' ? 'Semana' : 'Mês'}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Balance Card */}
            <div className="bg-white dark:bg-[#1e2a36] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <span className="material-symbols-outlined text-9xl">account_balance_wallet</span>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2 opacity-60">
                        <span className="text-xs font-black tracking-widest uppercase">Saldo Disponível (Global)</span>
                    </div>
                    <div className="text-5xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">
                        R$ {available.toFixed(2).replace('.', ',')}
                    </div>

                    <div className="flex justify-between items-end mb-3 text-sm">
                        <div className="text-gray-500 dark:text-gray-400">
                            Utilizado (Vista): <strong className="text-gray-900 dark:text-white">R$ {totalSpent.toFixed(2)}</strong>
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                            Total: <strong className="text-gray-900 dark:text-white">R$ {budget.toFixed(2)}</strong>
                        </div>
                    </div>

                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
                        <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${progress * 100}%` }}
                        />
                    </div>
                    <div className="text-right text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        {Math.round(progress * 100)}% do orçamento total
                    </div>
                </div>
            </div>

            {/* 3. Category Breakdown (Now Stacked) */}
            <div className="space-y-8">
                {/* Categories */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Categorias</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryStats.slice(0, 4).map(stat => (
                            <div key={stat.name} className="bg-white dark:bg-[#1e2a36] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${getCategoryColorClass(stat.name).split(' ')[1]}`}>
                                    <span className={`material-symbols-outlined ${getCategoryColorClass(stat.name).split(' ')[0]}`}>
                                        {getCategoryIcon(stat.name)}
                                    </span>
                                </div>
                                <div className="text-xs font-bold text-gray-400 uppercase mb-1 truncate" title={stat.name}>{stat.name}</div>
                                <div className="text-lg font-bold text-gray-900 dark:text-white">R$ {stat.total.toFixed(0)}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Distribution List */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Distribuição</h3>
                        <button
                            onClick={() => { setNewBudget(trip.budget?.toString() || ''); setIsBudgetModalOpen(true); }}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase"
                        >
                            Configurar
                        </button>
                    </div>
                    <div className="bg-white dark:bg-[#1e2a36] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6 w-full">
                        {categoryStats.map(stat => (
                            <div key={stat.name} className="w-full">
                                <div className="flex justify-between items-center mb-2 w-full">
                                    <div className="flex items-center gap-2 flex-1">
                                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getCategoryBgColor(stat.name) }} />
                                        <span className="font-semibold text-gray-700 dark:text-gray-300 truncate">{stat.name}</span>
                                    </div>
                                    <span className="font-bold text-gray-900 dark:text-white ml-4 whitespace-nowrap">{Math.round(stat.percent * 100)}%</span>
                                </div>
                                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden w-full">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{ width: `${stat.percent * 100}%`, backgroundColor: getCategoryBgColor(stat.name) }}
                                    />
                                </div>
                            </div>
                        ))}
                        {categoryStats.length === 0 && (
                            <p className="text-center text-gray-400 py-4">Nenhuma despesa para exibir.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* 4. Transactions List */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Transações</h3>
                    <button onClick={handleSeedData} className="text-xs text-gray-400 hover:text-gray-600 underline">Add Mock Data</button>
                </div>

                {Object.entries(groupedTransactions).map(([date, list]: [string, ExpenseRow[]]) => (
                    <div key={date} className="animate-slide-up">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">{date}</h4>
                        <div className="bg-white dark:bg-[#1e2a36] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                            {list.map((expense, index) => (
                                <div
                                    key={expense.id}
                                    onClick={() => onEditExpense(expense)}
                                    className={`
                                        group flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors
                                        ${index !== list.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}
                                    `}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-500 group-hover:scale-110 transition-transform`}>
                                            <span className="material-symbols-outlined text-xl">
                                                {getCategoryIcon(expense.category)}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white">{expense.description}</div>
                                            <div className="text-xs font-medium text-gray-400 uppercase">{expense.category}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="font-bold text-red-500">
                                            - R$ {Number(expense.amount).toFixed(2).replace('.', ',')}
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDeleteExpense(expense.id); }}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* FAB Button */}
            <div className="fixed bottom-10 right-10 z-50">
                <button
                    onClick={onAddExpense}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95 transform hover:-translate-y-1"
                    title="Nova Despesa"
                >
                    <span className="material-symbols-outlined text-[28px]">add</span>
                </button>
            </div>

            {/* Budget Modal */}
            {isBudgetModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-[#1e2a36] rounded-3xl w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-800">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Configurar Orçamento</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Limite Total (R$)</label>
                                    <input
                                        type="number"
                                        value={newBudget}
                                        onChange={(e) => setNewBudget(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#15202b] border border-gray-200 dark:border-gray-700 text-lg font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Alertas</label>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#15202b]">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Avisar quando atingir 80%</span>
                                        <div className="w-11 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button
                                    onClick={() => setIsBudgetModalOpen(false)}
                                    className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleUpdateBudget}
                                    disabled={loadingBudget}
                                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all flex justify-center"
                                >
                                    {loadingBudget ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="h-20"></div>
        </div>
    );
};

export default BudgetTab;
