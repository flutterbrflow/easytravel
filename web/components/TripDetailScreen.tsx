import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, TripRow, ExpenseRow, MemoryRow, ExpenseInsert } from '../services/api';
import ExpenseModal from './ExpenseModal';
import BudgetTab from './BudgetTab'; // Dashboard Component
import { AppRoute } from '../types';
import { IMAGES } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import CustomCalendar from './CustomCalendar';

// --- Helper Components ---

interface CalendarProps {
    startDate: string;
    endDate: string;
    onSelectDate: (date: string) => void;
}

// Local Calendar component definition removed


const TripDetailScreen: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'memories'>('overview');

    // Data State
    const [trip, setTrip] = useState<TripRow | null>(null);
    const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
    const [memories, setMemories] = useState<MemoryRow[]>([]);

    // Edit State
    const [editDestination, setEditDestination] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editStartDate, setEditStartDate] = useState<string | null>(null);
    const [editEndDate, setEditEndDate] = useState<string | null>(null);
    const [editCoverImage, setEditCoverImage] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Expenses State
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<ExpenseRow | null>(null);
    const [newImageFile, setNewImageFile] = useState<File | null>(null);

    useEffect(() => {
        if (id) {
            loadData(id);
        }
    }, [id]);

    const loadData = async (tripId: string) => {
        try {
            setLoading(true);
            const [tripData, expensesData, memoriesData] = await Promise.all([
                api.trips.get(tripId),
                api.expenses.list(tripId),
                api.memories.list(tripId)
            ]);

            setTrip(tripData);
            setExpenses(expensesData || []);
            setMemories(memoriesData || []);

            // Init Edit State
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
        }
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setNewImageFile(file);
            setEditCoverImage(URL.createObjectURL(file)); // Preview
        }
    };

    const handleDateSelect = (date: string) => {
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
    };

    const handleSaveOverview = async () => {
        if (!trip || !editDestination || !editStartDate || !editEndDate) {
            alert('Preencha os campos obrigatórios.');
            return;
        }

        setSaving(true);
        try {
            let imageUrl = trip.image_url;

            if (newImageFile) {
                const fileExt = newImageFile.name.split('.').pop();
                const fileName = `${user?.id || 'anon'}/${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await api.storage.upload('trip-images', filePath, newImageFile, {
                    upsert: true
                });

                if (uploadError) {
                    console.error('Error uploading image:', uploadError);
                } else {
                    const { data: { publicUrl } } = api.storage.getPublicUrl('trip-images', filePath);
                    imageUrl = publicUrl;
                }
            }

            await api.trips.update(trip.id, {
                destination: editDestination,
                description: editDescription,
                start_date: editStartDate,
                end_date: editEndDate,
                image_url: imageUrl
            });

            await loadData(trip.id);
            alert('Viagem atualizada com sucesso!');
        } catch (error: any) {
            console.error('Error updating trip:', error);
            alert('Erro ao atualizar: ' + error.message);
        } finally {
            setSaving(false);
        }
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
                // Update
                await api.expenses.update(editingExpense.id, expenseData);
            } else {
                // Create
                await api.expenses.create({
                    ...expenseData,
                    trip_id: trip.id,
                    user_id: user.id,
                } as ExpenseInsert);
            }
            // Reload expenses list
            const updatedExpenses = await api.expenses.list(trip.id);
            setExpenses(updatedExpenses || []);
        } catch (error) {
            console.error('Error saving expense:', error);
            throw error;
        }
    };

    const handleDeleteExpense = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta despesa?')) return;

        try {
            await api.expenses.delete(id);
            setExpenses(prev => prev.filter(e => e.id !== id));
        } catch (error) {
            console.error('Error deleting expense:', error);
            alert('Erro ao excluir despesa.');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col h-full bg-white dark:bg-[#101922] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="flex flex-col h-full bg-white dark:bg-[#101922] items-center justify-center p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Viagem não encontrada</h2>
                <button
                    onClick={() => navigate(AppRoute.LIST)}
                    className="text-blue-500 hover:text-blue-600 font-medium"
                >
                    Voltar para lista
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-[#101922]">
            {/* Cabeçalho */}
            <header className="bg-white dark:bg-[#101922] border-b border-gray-200 dark:border-gray-800 px-4 py-3 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(AppRoute.LIST)}
                        className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-lg font-bold text-gray-800 dark:text-white truncate max-w-[200px]">
                        {trip.destination}
                    </h1>
                    <div className="w-10"></div>
                </div>
            </header>

            {/* Navegação de Abas */}
            <div className="flex border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#101922]">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'overview'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    Visão Geral
                    {activeTab === 'overview' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('budget')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'budget'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    Gastos
                    {activeTab === 'budget' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('memories')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'memories'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    Memórias
                    {activeTab === 'memories' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
                    )}
                </button>
            </div>

            {/* Área de Conteúdo */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Imagem de Capa */}
                        <div className="relative h-48 rounded-xl overflow-hidden shadow-sm group">
                            <img
                                src={editCoverImage || IMAGES.genericMap}
                                alt="Capa"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center cursor-pointer">
                                <label className="cursor-pointer text-white flex flex-col items-center">
                                    <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="text-sm font-medium">Alterar Capa</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Destino */}
                        <div className="space-y-2">
                            <label className="text-[#111418] dark:text-slate-200 text-base font-bold leading-normal">Para onde você vai?</label>
                            <input
                                type="text"
                                value={editDestination}
                                onChange={(e) => setEditDestination(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#1e2a36] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Ex: Paris, França"
                            />
                        </div>

                        {/* Datas */}
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <label className="text-[#111418] dark:text-slate-200 text-base font-bold leading-normal">
                                    Quando?
                                </label>
                                <button
                                    onClick={() => {
                                        setEditStartDate('');
                                        setEditEndDate('');
                                    }}
                                    className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
                                >
                                    Limpar
                                </button>
                            </div>
                            {/* Selected Dates Summary */}
                            <div className="flex gap-4">
                                <div className="flex-1 p-3 bg-white dark:bg-[#1e2a36] rounded-xl border border-gray-100 dark:border-gray-800">
                                    <span className="block text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Ida</span>
                                    <span className="block text-base font-bold text-[#111418] dark:text-white">
                                        {editStartDate ? editStartDate.split('-').reverse().join('/') : '-'}
                                    </span>
                                </div>
                                <div className="flex-1 p-3 bg-white dark:bg-[#1e2a36] rounded-xl border border-gray-100 dark:border-gray-800">
                                    <span className="block text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Volta</span>
                                    <span className="block text-base font-bold text-[#111418] dark:text-white">
                                        {editEndDate ? editEndDate.split('-').reverse().join('/') : '-'}
                                    </span>
                                </div>
                            </div>

                            <CustomCalendar
                                startDate={editStartDate || ''}
                                endDate={editEndDate || ''}
                                onSelectDate={handleDateSelect}
                            />
                        </div>

                        {/* Seção de Participantes */}
                        <div className="space-y-3 pt-2">
                            <div className="flex justify-between items-center">
                                <h3 className="text-[#111418] dark:text-slate-200 text-base font-bold leading-normal">
                                    Quem vai com você?
                                </h3>
                                <button
                                    onClick={() => alert('Convite enviado!')}
                                    className="text-sm text-blue-500 font-medium hover:text-blue-600 flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                    Convidar
                                </button>
                            </div>

                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                {/* Owner */}
                                <div className="flex flex-col items-center flex-shrink-0">
                                    <div className="relative">
                                        <img
                                            src={user?.user_metadata?.avatar_url || IMAGES.userAvatar}
                                            alt="Você"
                                            className="w-14 h-14 rounded-full border-2 border-white dark:border-gray-700 object-cover"
                                        />
                                        <span className="absolute bottom-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-white">Eu</span>
                                    </div>
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-2">Você</span>
                                </div>

                                {/* Mock Friends */}
                                <div className="flex flex-col items-center flex-shrink-0">
                                    <img src={IMAGES.friend1} alt="André" className="w-14 h-14 rounded-full border-2 border-white dark:border-gray-700 object-cover" />
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-2">André</span>
                                </div>
                                <div className="flex flex-col items-center flex-shrink-0">
                                    <img src={IMAGES.friend2} alt="Sofia" className="w-14 h-14 rounded-full border-2 border-white dark:border-gray-700 object-cover" />
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-2">Sofia</span>
                                </div>

                                {/* Add Button */}
                                <button className="flex flex-col items-center flex-shrink-0 group" onClick={() => alert('Em breve')}>
                                    <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center group-hover:border-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-all">
                                        <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 group-hover:text-blue-500 mt-2">Adicionar</span>
                                </button>
                            </div>
                        </div>

                        {/* Descrição */}
                        <div className="space-y-2">
                            <label className="text-[#111418] dark:text-slate-200 text-base font-bold leading-normal">Notas ou Descrição</label>
                            <textarea
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#1e2a36] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                placeholder="Escreva algo sobre a viagem..."
                            />
                        </div>

                        {/* Botão Salvar */}
                        <button
                            onClick={handleSaveOverview}
                            disabled={saving}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                    Salvando...
                                </>
                            ) : (
                                'Salvar Alterações'
                            )}
                        </button>

                        <div className="h-4"></div>
                    </div>
                )}

                {activeTab === 'budget' && (
                    <BudgetTab
                        expenses={expenses}
                        trip={trip}
                        onAddExpense={handleOpenAddExpense}
                        onEditExpense={handleEditExpense}
                        onDeleteExpense={handleDeleteExpense}
                    />
                )}

                {activeTab === 'memories' && (
                    <div className="space-y-6">
                        <div className="text-center py-10 text-gray-400 dark:text-gray-500">
                            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p>Galeria de Memórias</p>
                            <p className="text-sm mt-1 mb-4">(Em Breve)</p>

                            {/* Temporary list of captions just to show data integration if any */}
                            {memories.length > 0 && (
                                <div className="text-left space-y-2">
                                    {memories.map(m => (
                                        <div key={m.id} className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                                            {m.caption}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {trip && user && (
                <ExpenseModal
                    isOpen={isExpenseModalOpen}
                    onClose={() => setIsExpenseModalOpen(false)}
                    onSave={handleSaveExpense}
                    initialData={editingExpense}
                    tripId={trip.id}
                    userId={user.id}
                />
            )}
        </div>
    );
};

export default TripDetailScreen;

