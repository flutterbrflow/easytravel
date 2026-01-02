
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IMAGES } from '../constants';
import { AppRoute } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const NewTripScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  // const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

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
      await api.trips.create({
        destination,
        start_date: startDate,
        end_date: endDate,
        user_id: user.id,
        status: 'planning',
        image_url: IMAGES.genericMap // Default image for now
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
      {/* Header */}
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
        {/* Headline */}
        <div>
          <h2 className="text-[#111418] dark:text-white tracking-tight text-[28px] font-extrabold leading-tight text-left">
            Vamos planejar sua<br />
            próxima aventura?
          </h2>
        </div>

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

          <Calendar
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
            <button className="text-primary text-sm font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">share</span> Convidar
            </button>
          </div>
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
            {/* Current User */}
            <Participant avatar={user?.user_metadata?.avatar_url || IMAGES.userAvatar} name="Você" isUser />
            {/* Mock friends */}
            <Participant avatar={IMAGES.friend1} name="André" />
            <Participant avatar={IMAGES.friend2} name="Sofia" />
            {/* Add Button */}
            <button className="flex flex-col items-center gap-1 shrink-0 group">
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

interface CalendarProps {
  startDate: string;
  endDate: string;
  onSelectDate: (date: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ startDate, endDate, onSelectDate }) => {
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

  const isSelected = (day: number) => {
    // Construct YYYY-MM-DD manually to avoid timezone issues
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;
    return dateStr === startDate || dateStr === endDate;
  };

  const isInRange = (day: number) => {
    if (!startDate || !endDate) return false;
    // For comparison, standard string comparison works for YYYY-MM-DD
    // But to accept mixed formats or rely on Date objects safely:
    // We construct local dates at 12:00 to avoid midnight boundary issues
    const currentStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return currentStr > startDate && currentStr < endDate;
  };

  const handleDateClick = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;
    onSelectDate(dateStr);
  };

  return (
    <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm w-full">
      <div className="flex items-center justify-between mb-4 px-2">
        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <span className="material-symbols-outlined text-[#111418] dark:text-white text-[20px]">chevron_left</span>
        </button>
        <p className="text-[#111418] dark:text-white text-base font-bold leading-tight capitalize">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </p>
        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <span className="material-symbols-outlined text-[#111418] dark:text-white text-[20px]">chevron_right</span>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-2">
        {weekDays.map((d, i) => (
          <p key={i} className="text-slate-400 dark:text-slate-500 text-[13px] font-bold text-center pb-2">
            {d}
          </p>
        ))}
        {/* Padding for first day */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((d) => {
          const selected = isSelected(d);
          const inRange = isInRange(d);

          let baseClasses = "h-10 w-full text-sm font-medium rounded-full transition-all relative z-10 ";

          if (selected) {
            baseClasses += "bg-primary text-white shadow-md shadow-primary/30";
          } else if (inRange) {
            baseClasses += "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-none";
            // First in range rounding
            if (isSelected(d - 1)) baseClasses += " rounded-l-none";
            if (isSelected(d + 1)) baseClasses += " rounded-r-none";
          } else {
            baseClasses += "text-[#111418] dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700";
          }

          // Special logic for range connector visual fix (optional, simplifying for now)
          // Ideally we render a background div for range connection

          return (
            <div key={d} className="relative p-0.5">
              {inRange && (
                <div className="absolute inset-y-0.5 left-0 right-0 bg-blue-50 dark:bg-blue-900/20 z-0" />
              )}
              {selected && startDate && endDate && startDate !== endDate && (
                <div className={`absolute inset-y-0.5 w-[50%] bg-blue-50 dark:bg-blue-900/20 z-0 ${new Date(startDate).getDate() === d ? 'right-0' : 'left-0'}`} />
              )}
              <button
                onClick={() => handleDateClick(d)}
                className={baseClasses}
              >
                {d}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default NewTripScreen;
