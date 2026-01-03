import CustomCalendar from './CustomCalendar';
import React, { useState, useEffect } from 'react';
import { ExpenseInsert, ExpenseRow } from '../services/api';

interface ExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (expense: Partial<ExpenseInsert>) => Promise<void>;
    initialData?: ExpenseRow | null;
    tripId: string;
    userId: string;
}

const CATEGORIES = [
    { id: 'Alimentação', icon: 'restaurant' },
    { id: 'Transporte', icon: 'directions_bus' },
    { id: 'Hospedagem', icon: 'hotel' },
    { id: 'Atividades', icon: 'local_activity' },
    { id: 'Compras', icon: 'shopping_bag' },
    { id: 'Outros', icon: 'payments' },
];

const ExpenseModal: React.FC<ExpenseModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
    tripId,
    userId
}) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState(CATEGORIES[0].id);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setDescription(initialData.description);
                setAmount(initialData.amount.toString());
                setCategory(initialData.category);
                setDate(initialData.date.split('T')[0]);
            } else {
                setDescription('');
                setAmount('');
                setCategory(CATEGORIES[0].id);
                setDate(new Date().toISOString().split('T')[0]);
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount || !date) return;

        try {
            setLoading(true);
            await onSave({
                trip_id: tripId,
                user_id: userId,
                description,
                amount: parseFloat(amount),
                category,
                date,
            });
            onClose();
        } catch (error) {
            console.error('Error saving expense:', error);
            alert('Erro ao salvar despesa. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1e2a36] rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                        {initialData ? 'Editar Despesa' : 'Nova Despesa'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Valor */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor (R$)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">R$</span>
                            <input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-[#15202b] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white font-bold text-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400"
                                placeholder="0,00"
                                required
                            />
                        </div>
                    </div>

                    {/* Descrição */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#15202b] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Ex: Jantar, Táxi, Hotel..."
                            required
                        />
                    </div>

                    {/* Categoria */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categoria</label>
                        <div className="grid grid-cols-3 gap-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setCategory(cat.id)}
                                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${category === cat.id
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'bg-white dark:bg-[#253341] border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-300'
                                        }`}
                                >
                                    <span className="material-symbols-outlined mb-1">{cat.icon}</span>
                                    <span className="text-xs font-medium">{cat.id}</span>
                                </button>
                            ))}
                        </div>
                    </div>


                    {/* Data */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data</label>
                        <CustomCalendar
                            startDate={date}
                            endDate=""
                            onSelectDate={(d) => setDate(d)}
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Salvar Despesa'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExpenseModal;
