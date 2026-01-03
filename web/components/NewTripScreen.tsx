
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IMAGES } from '../constants';
import { AppRoute } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { supabase } from '../lib/supabase';
import CustomCalendar from './CustomCalendar';

const NewTripScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Refresh session to get latest user metadata (avatar)
    api.trips.list().then(() => { }).catch(() => { }); // Dummy call or just explicit refresh
    // Better:
    const refresh = async () => {
      const { error } = await supabase.auth.refreshSession();
      if (error) console.error(error);
    };
    refresh();
  }, []);

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

  const handleBack = () => navigate(-1);

  const handleInvite = async () => {
    try {
      await navigator.clipboard.writeText(window.location.host); // Just copying host for now
      alert('Link copiado para a área de transferência!');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleAddParticipant = () => {
    const email = prompt("Digite o email do participante:");
    if (email) {
      alert(`Convite enviado para ${email} (simulação)`);
    }
  };

  const handleSave = async () => {
    if (!destination) {
      alert('Por favor, informe o destino.');
      return;
    }
    if (!user) {
      alert('Você precisa estar logado.');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = IMAGES.genericMap;

      if (coverImage) {
        // ... (upload logic same as before)
        const fileExt = coverImage.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await api.storage.upload('trip-images', filePath, coverImage, {
          upsert: true
        });

        if (uploadError) {
          console.error('Error uploading cover image:', uploadError);
          // Proceed without custom image if upload fails
        } else {
          const { data: { publicUrl } } = api.storage.getPublicUrl('trip-images', filePath);
          imageUrl = publicUrl;
        }
      }

      await api.trips.create({
        destination,
        start_date: startDate,
        end_date: endDate,
        user_id: user.id,
        status: 'planning',
        image_url: imageUrl,
        description: description
      });
      navigate(AppRoute.LIST);
    } catch (error: any) {
      console.error('Error saving trip', error);
      alert('Erro ao salvar viagem: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden font-display transition-colors duration-200">
      {/* Header same as before */}
      <div className="sticky top-0 z-10 flex items-center bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md p-4 pb-2 justify-between border-b border-gray-200/50 dark:border-gray-800/50">
        <button
          onClick={handleBack}
          className="flex w-20 items-center justify-start text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          <span className="text-base font-medium leading-normal">Cancelar</span>
        </button>
        <h2 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          Nova Viagem
        </h2>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex w-20 items-center justify-end disabled:opacity-50"
        >
          <p className="text-primary text-base font-bold leading-normal tracking-[0.015em]">{loading ? '...' : 'Salvar'}</p>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 flex flex-col px-4 pb-32 pt-4 gap-6 no-scrollbar overflow-y-auto">

        {/* Destination Input */}
        <div className="flex flex-col gap-2">
          <label className="text-[#111418] dark:text-slate-200 text-base font-bold leading-normal">
            Para onde você vai?
          </label>
          <div className="group flex w-full items-center rounded-xl bg-white dark:bg-surface-dark border border-transparent focus-within:border-primary/50 shadow-sm transition-all overflow-hidden">
            <div className="flex items-center justify-center pl-4 pr-2">
              <span className="material-symbols-outlined text-primary text-[24px]">location_on</span>
            </div>
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="flex w-full min-w-0 flex-1 resize-none bg-transparent text-[#111418] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 p-4 h-14 text-base font-medium leading-normal border-none focus:ring-0 outline-none"
              placeholder="Ex: Paris, França"
            />
          </div>
        </div>

        {/* Cover Image Input */}
        <div className="flex flex-col gap-2">
          <label className="text-[#111418] dark:text-slate-200 text-base font-bold leading-normal">
            Imagem de Capa
          </label>
          <div className="relative w-full h-40 rounded-xl overflow-hidden bg-gray-100 dark:bg-surface-dark border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-colors group cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setCoverImage(e.target.files[0]);
                }
              }}
            />
            {coverImage ? (
              <img
                src={URL.createObjectURL(coverImage)}
                alt="Cover Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 gap-2">
                <span className="material-symbols-outlined text-4xl">add_photo_alternate</span>
                <span className="text-sm font-medium">Adicionar foto de capa</span>
              </div>
            )}
            {coverImage && (
              <div className="absolute top-2 right-2 z-20">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCoverImage(null);
                  }}
                  className="bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Date Selection */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <label className="text-[#111418] dark:text-slate-200 text-base font-bold leading-normal">
              Quando?
            </label>
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="text-primary text-sm font-medium hover:text-blue-700 transition-colors"
            >
              Limpar
            </button>
          </div>
          {/* Selected Dates Summary (Optional visual aid) */}
          <div className="flex gap-4 mb-2">
            <div className="flex-1 p-3 bg-white dark:bg-surface-dark rounded-xl border border-transparent">
              <span className="block text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Ida</span>
              <span className="block text-base font-bold text-[#111418] dark:text-white">
                {startDate ? startDate.split('-').reverse().join('/') : '-'}
              </span>
            </div>
            <div className="flex-1 p-3 bg-white dark:bg-surface-dark rounded-xl border border-transparent">
              <span className="block text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Volta</span>
              <span className="block text-base font-bold text-[#111418] dark:text-white">
                {endDate ? endDate.split('-').reverse().join('/') : '-'}
              </span>
            </div>
          </div>

          <CustomCalendar
            startDate={startDate}
            endDate={endDate}
            onSelectDate={handleDateSelect}
          />
        </div>

        {/* Participants (Mock for now) */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-[#111418] dark:text-slate-200 text-lg font-bold leading-tight tracking-[-0.015em]">
              Quem vai com você?
            </h3>
            <button
              onClick={handleInvite}
              className="text-primary text-sm font-bold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[18px]">share</span> Convidar
            </button>
          </div>
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
            {/* Current User */}
            <Participant
              avatar={user?.user_metadata?.avatar_url ? `${user.user_metadata.avatar_url}?t=${new Date().getTime()}` : IMAGES.userAvatar}
              name="Você"
              isUser
            />
            {/* Mock friends */}
            <Participant avatar={IMAGES.friend1} name="André" />
            <Participant avatar={IMAGES.friend2} name="Sofia" />
            {/* Add Button */}
            <button
              onClick={handleAddParticipant}
              className="flex flex-col items-center gap-1 shrink-0 group"
            >
              <div className="w-14 h-14 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400 dark:text-slate-500 bg-white dark:bg-surface-dark group-hover:border-primary group-hover:text-primary transition-all">
                <span className="material-symbols-outlined text-[24px]">add</span>
              </div>
              <span className="text-xs font-medium text-slate-400 group-hover:text-primary transition-colors">
                Adicionar
              </span>
            </button>
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-2">
          <label className="text-[#111418] dark:text-slate-200 text-base font-bold leading-normal">
            Notas ou Descrição
          </label>
          <div className="w-full rounded-xl bg-white dark:bg-surface-dark border border-transparent focus-within:border-primary/50 shadow-sm transition-all">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-transparent text-[#111418] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 p-4 min-h-[100px] resize-none text-base font-medium leading-normal border-none focus:ring-0 outline-none rounded-xl"
              placeholder="Escreva algo sobre a viagem..."
            ></textarea>
          </div>
        </div>
      </div>

      {/* Sticky Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 z-20 md:max-w-md md:mx-auto">
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-primary hover:bg-blue-600 active:scale-[0.98] transition-all text-white font-bold text-lg h-14 rounded-full shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-70"
        >
          <span className="material-symbols-outlined">flight_takeoff</span>
          {loading ? 'Salvando...' : 'Criar Viagem'}
        </button>
      </div>
    </div>
  );
};

// Sub-components for NewTripScreen
const Participant: React.FC<{ avatar: string; name: string; isUser?: boolean }> = ({ avatar, name, isUser }) => (
  <div className="flex flex-col items-center gap-1 shrink-0">
    <div className="relative">
      <img
        alt={`Profile of ${name}`}
        className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-surface-dark shadow-sm"
        src={avatar}
      />
      {isUser && (
        <div className="absolute bottom-0 right-0 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white dark:border-surface-dark">
          Eu
        </div>
      )}
    </div>
    <span className="text-xs font-medium text-[#111418] dark:text-slate-300">{name}</span>
  </div>
);

export default NewTripScreen;
