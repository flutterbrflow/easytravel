import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IMAGES } from '../constants';
import { AppRoute } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { supabase } from '../lib/supabase';

const ProfileScreen: React.FC = () => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();

    // Estado de Estatísticas e Perfil
    const [stats, setStats] = useState({
        trips: 0,
        countries: 0,
        photos: 0
    });
    const [profileData, setProfileData] = useState<any>(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Estado das Preferências (Mock)
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkModeEnabled, setDarkModeEnabled] = useState(false); // Idealmente sincronizar com context/sistema

    const loadData = async () => {
        try {
            if (!user?.id) return;

            // Carregar estatísticas básicas
            const trips = await api.trips.list();
            const uniqueCountries = new Set(trips.map(t => {
                const parts = t.destination.split(',');
                return parts[parts.length - 1].trim();
            })).size;

            setStats(prev => ({
                ...prev,
                trips: trips.length,
                countries: uniqueCountries
            }));

            // Carregar Perfil
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profile) {
                setProfileData(profile);
            }
        } catch (error) {
            // Erro ao carregar dados
        } finally {
            setLoadingStats(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user]);

    const handleLogout = async () => {
        if (window.confirm("Tem certeza que deseja sair da conta?")) {
            try {
                await signOut();
                navigate(AppRoute.LOGIN);
            } catch (error) {
                alert('Erro ao sair da conta.');
            }
        }
    };

    const toggleDarkMode = () => {
        const newMode = !darkModeEnabled;
        setDarkModeEnabled(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                return;
            }
            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${user?.id || 'unknown'}/avatar.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await api.storage.upload('avatars', filePath, file, {
                upsert: true
            });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

            if (user?.id) {
                const now = new Date().toISOString();
                const { error: updateError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: user.id,
                        avatar_url: publicUrl,
                        updated_at: now,
                    });

                if (updateError) throw updateError;

                if (updateError) throw updateError;

                // Atualizar estado local imediatamente
                setProfileData({ ...profileData, avatar_url: publicUrl, updated_at: now });

                const { error: authError } = await supabase.auth.updateUser({
                    data: { avatar_url: publicUrl }
                });

                if (authError) throw authError;
            }
        } catch (error) {
            alert('Falha ao atualizar foto de perfil.');
        } finally {
            setUploading(false);
        }
    };

    // Determinar URL do Avatar
    // Prioridade: profileData.avatar_url -> user.user_metadata.avatar_url -> Placeholder
    // Busting de cache: profileData.updated_at -> Date.now()
    const avatarUrl = profileData?.avatar_url || user?.user_metadata?.avatar_url;
    const cacheBuster = profileData?.updated_at ? new Date(profileData.updated_at).getTime() : Date.now();
    const finalAvatarUrl = avatarUrl ? `${avatarUrl}?t=${cacheBuster}` : IMAGES.userAvatar;

    // Estado da Edição de Perfil
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editName, setEditName] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);

    useEffect(() => {
        if (user?.user_metadata?.full_name || user?.user_metadata?.display_name) {
            setEditName(user.user_metadata.full_name || user.user_metadata.display_name);
        }
    }, [user]);

    // ... (existing loadData)

    const handleOpenEditModal = () => {
        setEditName(user?.user_metadata?.full_name || user?.user_metadata?.display_name || '');
        setIsEditModalOpen(true);
    };

    const handleSaveProfile = async () => {
        if (!editName.trim()) {
            alert('Por favor, insira um nome.');
            return;
        }

        try {
            setSavingProfile(true);
            const now = new Date().toISOString();

            if (user?.id) {
                // Atualizar Tabela de Perfil
                const { error: updateError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: user.id,
                        name: editName.trim(), // Assumindo que a coluna é 'name' ou estenda se necessário
                        updated_at: now,
                    });

                if (updateError) throw updateError;

                // Atualizar Metadados de Autenticação
                const { error: authError } = await supabase.auth.updateUser({
                    data: { full_name: editName.trim() }
                });

                if (authError) throw authError;

                // Atualizar estado local
                setProfileData(prev => ({ ...prev, name: editName.trim(), updated_at: now }));
                setIsEditModalOpen(false);
            }
        } catch (error) {
            alert('Erro ao atualizar perfil.');
        } finally {
            setSavingProfile(false);
        }
    };

    // ... (existing helper functions)

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col bg-[#f8fafc] dark:bg-[#101922]">
            {/* Cabeçalho */}
            <header className="flex items-center justify-between p-4 bg-[#f8fafc] dark:bg-[#101922] z-10 sticky top-0">
                <button onClick={() => navigate(AppRoute.LIST)} className="size-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-[#1e2a36]">
                    <span className="material-symbols-outlined text-[#111418] dark:text-white">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold text-[#111418] dark:text-white">Meu Perfil</h1>
                <button
                    onClick={handleOpenEditModal}
                    className="size-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-[#1e2a36]"
                >
                    <span className="material-symbols-outlined text-[#111418] dark:text-white">settings</span>
                </button>
            </header>

            <main className="flex-1 overflow-y-auto pb-24 px-4 space-y-6 no-scrollbar">
                {/* Informações do Usuário */}
                <div className="flex flex-col items-center mt-4">
                    <div className="relative mb-4">
                        <div
                            className="size-28 rounded-full border-4 border-[#e2e8f0] bg-cover bg-center"
                            style={{ backgroundImage: `url("${finalAvatarUrl}")` }}
                        />
                        {/* ... existing avatar upload label ... */}
                        <label
                            htmlFor="web-avatar-upload"
                            className={`absolute bottom-0 right-0 size-8 bg-[#137fec] rounded-full flex items-center justify-center border-2 border-white cursor-pointer hover:bg-blue-600 transition-colors ${uploading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {uploading ? (
                                <div className="animate-spin size-4 border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                                <span className="material-symbols-outlined text-white text-[16px]">edit</span>
                            )}
                            <input
                                type="file"
                                id="web-avatar-upload"
                                accept="image/*"
                                className="hidden"
                                onChange={uploadAvatar}
                                disabled={uploading}
                            />
                        </label>
                    </div>
                    <h2 className="text-2xl font-bold text-[#111418] dark:text-white mb-1">
                        {profileData?.name || user?.user_metadata?.full_name || user?.user_metadata?.display_name || 'Viajante'}
                    </h2>
                    <p className="text-xs font-bold text-[#617589] dark:text-[#9ba8b8] tracking-widest uppercase">
                        Viajante Enthusiasta • @{user?.email?.split('@')[0].toUpperCase()}
                    </p>
                </div>

                {/* ... existing sections ... */}
                <div className="flex gap-4">
                    <StatCard icon="explore" value={stats.trips} label="Viagens" />
                    <StatCard icon="public" value={stats.countries} label="Países" />
                    <StatCard icon="photo_library" value={stats.photos} label="Fotos" />
                </div>

                {/* Preferências */}
                <div>
                    <h3 className="text-xs font-bold text-[#9ca3af] dark:text-[#9ba8b8] tracking-widest uppercase mb-3 ml-4">
                        Preferências
                    </h3>
                    <div className="bg-white dark:bg-[#1e2a36] rounded-2xl overflow-hidden shadow-sm">
                        <PreferenceItem
                            icon="notifications"
                            label="Notificações"
                            rightElement={
                                <div
                                    className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors ${notificationsEnabled ? 'bg-[#137fec]' : 'bg-gray-200'}`}
                                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                                >
                                    <div className={`size-4 bg-white rounded-full shadow-sm transition-transform ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                </div>
                            }
                        />
                        <PreferenceItem
                            icon="dark_mode"
                            label="Modo Escuro"
                            rightElement={
                                <div
                                    className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors ${darkModeEnabled ? 'bg-[#137fec]' : 'bg-gray-200'}`}
                                    onClick={toggleDarkMode}
                                >
                                    <div className={`size-4 bg-white rounded-full shadow-sm transition-transform ${darkModeEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                </div>
                            }
                        />
                        <PreferenceItem icon="lock" label="Privacidade" />
                        <PreferenceItem
                            icon="language"
                            label="Idioma"
                            rightElement={<span className="text-[#137fec] font-bold text-xs uppercase">Português</span>}
                        />
                    </div>
                </div>

                {/* Sair */}
                <button
                    onClick={handleLogout}
                    className="w-full h-14 bg-[#fef2f2] dark:bg-red-500/10 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-500/20 transition-colors"
                >
                    <span className="material-symbols-outlined text-[#ef4444]">logout</span>
                    <span className="font-bold text-[#ef4444]">Sair da Conta</span>
                </button>
            </main>

            {/* Modal de Edição de Perfil */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1e2a36] rounded-2xl w-full max-w-sm p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-[#111418] dark:text-white mb-4">Editar Perfil</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Nome Completo
                                </label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full rounded-xl bg-gray-50 dark:bg-[#2c3b4a] border border-gray-200 dark:border-gray-700 p-3 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#137fec]"
                                    placeholder="Seu nome"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="flex-1 h-12 rounded-xl bg-gray-100 dark:bg-[#2c3b4a] text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-[#37495b] transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveProfile}
                                disabled={savingProfile}
                                className="flex-1 h-12 rounded-xl bg-[#137fec] text-white font-bold hover:bg-blue-600 transition-colors disabled:opacity-70 flex items-center justify-center"
                            >
                                {savingProfile ? (
                                    <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    'Salvar'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Navegação Inferior */}
            <nav className="absolute bottom-0 left-0 w-full bg-white dark:bg-[#101922] border-t border-gray-100 dark:border-[#22303e] pb-safe pt-2 px-2 z-30">
                <div className="flex justify-around items-center h-16 pb-2">
                    <NavItem icon="airplane_ticket" label="Viagens" onClick={() => navigate(AppRoute.LIST)} />
                    <NavItem icon="explore" label="Explorar" onClick={() => navigate(AppRoute.LIST)} />
                    <NavItem icon="bookmark" label="Salvos" onClick={() => navigate(AppRoute.LIST)} />
                    <NavItem icon="person" label="Perfil" active />
                </div>
            </nav>
        </div>
    );
};

const StatCard = ({ icon, value, label }: { icon: string, value: number | string, label: string }) => (
    <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-[#1e2a36] rounded-2xl p-4 shadow-sm">
        <span className="material-symbols-outlined text-[#137fec] text-3xl mb-2">{icon}</span>
        <span className="text-xl font-bold text-[#111418] dark:text-white">{value}</span>
        <span className="text-[10px] font-bold text-[#617589] dark:text-[#9ba8b8] tracking-wider uppercase">{label}</span>
    </div>
);

const PreferenceItem = ({ icon, label, rightElement, onClick }: any) => (
    <div
        className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-[#2c3b4a] last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2c3b4a]/50 transition-colors"
        onClick={onClick}
    >
        <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#617589] dark:text-[#9ba8b8]">{icon}</span>
            <span className="text-[#111418] dark:text-white font-medium">{label}</span>
        </div>
        {rightElement || <span className="material-symbols-outlined text-[#cbd5e1]">chevron_right</span>}
    </div>
);

const NavItem: React.FC<{ icon: string; label: string; active?: boolean; onClick?: () => void }> = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-1 w-16 ${active ? 'text-primary' : 'text-[#9ba8b8] hover:text-[#617589]'}`}
    >
        <span className={`material-symbols-outlined text-[26px] ${active ? 'font-variation-fill' : ''}`} style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>{icon}</span>
        <span className={`text-[10px] ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
    </button>
);

export default ProfileScreen;
