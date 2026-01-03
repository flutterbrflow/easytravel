
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IMAGES } from '../constants';
import { AppRoute } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { api, TripRow } from '../services/api';
import { supabase } from '../lib/supabase';

const TripListScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [trips, setTrips] = useState<TripRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      // Force session refresh to get latest user metadata (avatar)
      await supabase.auth.refreshSession();

      const data = await api.trips.list();
      setTrips(data);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm('Tem certeza que deseja excluir esta viagem?')) {
      try {
        await api.trips.delete(id);
        setTrips(prev => prev.filter(t => t.id !== id));
      } catch (error) {
        console.error('Error deleting trip:', error);
        alert('Erro ao excluir viagem.');
      }
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

      // Upload image
      const { error: uploadError } = await api.storage.upload('avatars', filePath, file, {
        upsert: true
      });

      if (uploadError) {
        throw uploadError;
      }

      // Get Public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update Profile
      if (user?.id) {
        const { error: updateError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            avatar_url: publicUrl,
            updated_at: new Date().toISOString(),
          });

        if (updateError) {
          throw updateError;
        }

        // Update Auth Metadata so the UI updates automatically via AuthContext
        const { error: authUpdateError } = await supabase.auth.updateUser({
          data: { avatar_url: publicUrl }
        });

        if (authUpdateError) {
          throw authUpdateError;
        }

        // Visual feedback
        const avatarElement = document.getElementById('user-avatar');
        if (avatarElement) {
          avatarElement.style.backgroundImage = `url("${publicUrl}?t=${new Date().getTime()}")`;
        }
      }

    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Erro ao atualizar avatar. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col bg-background-light dark:bg-background-dark shadow-xl overflow-hidden">
      {/* Cabeçalho */}
      <header className="sticky top-0 z-10 bg-background-light dark:bg-background-dark pb-2">
        <div className="flex flex-col gap-2 p-4 pb-2">
          <div className="flex items-center h-12 relative">
            {/* Esquerda: Avatar */}
            <div className="flex size-12 shrink-0 items-center justify-center z-20">
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={uploadAvatar}
                className="hidden"
                disabled={uploading}
              />
              <label
                htmlFor="avatar-upload"
                id="user-avatar"
                className={`bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-white dark:border-[#22303e] shadow-sm cursor-pointer hover:opacity-80 transition-opacity ${uploading ? 'opacity-50' : ''}`}
                style={{ backgroundImage: `url("${user?.user_metadata?.avatar_url ? `${user.user_metadata.avatar_url}?t=${new Date().getTime()}` : IMAGES.userAvatar}")` }}
              >
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  </div>
                )}
              </label>
            </div>

            {/* Centro: Título */}
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <h1 className="text-[#111418] dark:text-white text-lg font-bold">Minhas Viagens</h1>
            </div>

            {/* Direita: Configurações */}
            <div className="flex w-12 items-center justify-end ml-auto z-20">
              <button
                onClick={() => navigate(AppRoute.PROFILE)}
                className="flex items-center justify-center rounded-full size-10 bg-transparent text-[#111418] dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                title="Configurações de Perfil"
              >
                <span className="material-symbols-outlined text-[24px]">settings</span>
              </button>
            </div>
          </div>

          <div className="flex justify-start items-center mb-2 mt-1">
            <p className="text-[#111418] dark:text-white text-xl font-bold leading-tight">
              Olá, {user?.user_metadata?.display_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Viajante'}!
            </p>
          </div>

        </div>
        {/* Segmented Control */}
        <div className="px-4 pb-2">
          {/* ... (keep existing segmented control) */}
          <div className="flex h-10 w-full items-center rounded-xl bg-[#f0f2f4] dark:bg-[#1e2a36] p-1 relative">
            <div
              className={`absolute left-1 h-8 bg-white dark:bg-[#2c3b4a] rounded-lg shadow-sm transition-all duration-300 ease-in-out w-[calc(50%-4px)] ${activeTab === 'past' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'
                }`}
            ></div>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`relative z-10 flex-1 h-full flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${activeTab === 'upcoming'
                ? 'text-[#111418] dark:text-white'
                : 'text-[#617589] dark:text-[#9ba8b8] hover:text-[#111418] dark:hover:text-white'
                }`}
            >
              Próximas
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`relative z-10 flex-1 h-full flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${activeTab === 'past'
                ? 'text-[#111418] dark:text-white'
                : 'text-[#617589] dark:text-[#9ba8b8] hover:text-[#111418] dark:hover:text-white'
                }`}
            >
              Passadas
            </button>
          </div>
        </div>
      </header>

      {/* Lista Principal */}
      <main className="flex-1 overflow-y-auto pb-28 px-4 space-y-4 no-scrollbar">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {trips.filter(t => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const tripEnd = new Date(t.end_date);
              if (activeTab === 'upcoming') {
                return tripEnd >= today;
              } else {
                return tripEnd < today;
              }
            }).length > 0 ? (
              trips
                .filter(t => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const tripEnd = new Date(t.end_date);
                  if (activeTab === 'upcoming') {
                    return tripEnd >= today;
                  } else {
                    return tripEnd < today;
                  }
                })
                .map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    onDelete={(e) => handleDeleteTrip(e, trip.id)}
                    onClick={() => navigate(AppRoute.TRIP_DETAIL.replace(':id', trip.id))}
                  />
                ))
            ) : (
              <div className="text-center py-10 text-gray-500">
                <span className="material-symbols-outlined text-4xl mb-2">
                  {activeTab === 'upcoming' ? 'map_search' : 'history'}
                </span>
                <p>
                  {activeTab === 'upcoming'
                    ? 'Nenhuma viagem planejada.'
                    : 'Nenhuma viagem passada recente.'}
                </p>
              </div>
            )}

            {/* Botão Nova Viagem (Inline) - Apenas para Próximas */}
            {activeTab === 'upcoming' && (
              <button
                onClick={() => navigate(AppRoute.NEW_TRIP)}
                className="w-full border-2 border-dashed border-[#e5e7eb] dark:border-[#2c3b4a] rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center hover:bg-gray-50 dark:hover:bg-[#1a232e] transition-colors group"
              >
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[28px]">add_location_alt</span>
                </div>
                <div>
                  <p className="text-[#111418] dark:text-white font-semibold">Planejar nova aventura</p>
                  <p className="text-[#617589] dark:text-[#9ba8b8] text-xs">Descubra novos destinos</p>
                </div>
              </button>
            )}
          </>
        )}
      </main>

      {/* Botão Flutuante (FAB) */}
      <div className="absolute bottom-24 right-4 z-20">
        <button
          onClick={() => navigate(AppRoute.NEW_TRIP)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[28px]">add</span>
        </button>
      </div>

      {/* Navegação Inferior */}
      <nav className="absolute bottom-0 left-0 w-full bg-white dark:bg-[#101922] border-t border-gray-100 dark:border-[#22303e] pb-safe pt-2 px-2 z-30">
        <div className="flex justify-around items-center h-16 pb-2">
          <NavItem icon="airplane_ticket" label="Viagens" active />
          <NavItem icon="explore" label="Explorar" />
          <NavItem icon="bookmark" label="Salvos" />
          <NavItem icon="person" label="Perfil" onClick={() => navigate(AppRoute.PROFILE)} />
        </div>
      </nav>
    </div>
  );
};

const formatDateRange = (start: string, end: string) => {
  if (!start) return '';
  const startDate = new Date(start);

  // Format day/month
  const formatPart = (date: Date) => {
    return `${String(date.getDate() + 1).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  // Correção simples de fuso horário (datas são YYYY-MM-DD)
  // Na verdade, split é melhor
  const sParts = start.split('-');
  const eParts = end.split('-');

  const sDay = sParts[2];
  const sMonth = sParts[1];
  const sYear = sParts[0];

  const eDay = eParts[2];
  const eMonth = eParts[1];

  return `${sDay}/${sMonth} - ${eDay}/${eMonth} de ${sYear}`;
};

const TripCard: React.FC<{ trip: TripRow; onDelete: (e: React.MouseEvent) => void; onClick: () => void }> = ({ trip, onDelete, onClick }) => (
  <div
    onClick={onClick}
    className="group relative flex flex-col items-stretch justify-start rounded-2xl bg-white dark:bg-[#1e2a36] shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden transition-all hover:shadow-lg cursor-pointer"
  >
    <div
      className="w-full h-40 bg-center bg-no-repeat bg-cover relative"
      style={{ backgroundImage: `url("${trip.image_url || IMAGES.genericMap}")` }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      <div className="absolute bottom-3 left-4">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm bg-primary/90`}
        >
          {(() => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const [y, m, d] = trip.end_date.split('-').map(Number);
            const end = new Date(y, m - 1, d);

            if (end < today) return 'Realizada';
            return trip.status === 'planning' ? 'Planejando' : 'Em breve';
          })()}
        </span>
      </div>
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(e);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-red-500 transition-colors backdrop-blur-md"
          title="Excluir viagem"
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    </div>
    <div className="flex flex-col gap-1 p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-[#111418] dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">
            {trip.destination}
          </h3>
          <p className="text-[#617589] dark:text-[#9ba8b8] text-sm font-medium mt-1">
            {formatDateRange(trip.start_date, trip.end_date)}
          </p>
          {trip.description && (
            <p className="text-[#4b5563] dark:text-[#cbd5e1] text-sm mt-2 line-clamp-2">
              {trip.description}
            </p>
          )}
        </div>
        <button className="size-8 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors shrink-0 ml-2">
          <span className="material-symbols-outlined text-[20px]">chevron_right</span>
        </button>
      </div>
    </div>
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

export default TripListScreen;
