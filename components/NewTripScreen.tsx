import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IMAGES } from '../constants';
import { AppRoute } from '../types';

const NewTripScreen: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => navigate(-1);

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
          onClick={() => navigate(AppRoute.LIST)}
          className="flex w-20 items-center justify-end"
        >
          <p className="text-primary text-base font-bold leading-normal tracking-[0.015em]">Salvar</p>
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
            <button className="text-primary text-sm font-medium">Limpar</button>
          </div>
          {/* Date Range Display */}
          <div className="flex gap-3 mb-2">
            <div className="flex-1 bg-white dark:bg-surface-dark rounded-xl p-3 border-2 border-primary shadow-sm flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Ida
              </span>
              <span className="text-base font-bold text-[#111418] dark:text-white">5 Jul, 2024</span>
            </div>
            <div className="flex-1 bg-white dark:bg-surface-dark rounded-xl p-3 border border-transparent shadow-sm flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Volta
              </span>
              <span className="text-base font-medium text-slate-400 dark:text-slate-500">Selecione</span>
            </div>
          </div>
          
          {/* Calendar Visual Component */}
          <CalendarMock />
        </div>

        {/* Participants */}
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
            <Participant avatar={IMAGES.userAvatar} name="Você" isUser />
            {/* Friend 1 */}
            <Participant avatar={IMAGES.friend1} name="André" />
            {/* Friend 2 */}
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
          onClick={() => navigate(AppRoute.LIST)}
          className="w-full bg-primary hover:bg-blue-600 active:scale-[0.98] transition-all text-white font-bold text-lg h-14 rounded-full shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">flight_takeoff</span>
          Criar Viagem
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

const CalendarMock: React.FC = () => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  return (
    <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm w-full">
      <div className="flex items-center justify-between mb-4 px-2">
        <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <span className="material-symbols-outlined text-[#111418] dark:text-white text-[20px]">chevron_left</span>
        </button>
        <p className="text-[#111418] dark:text-white text-base font-bold leading-tight">Julho 2024</p>
        <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <span className="material-symbols-outlined text-[#111418] dark:text-white text-[20px]">chevron_right</span>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-2">
        {weekDays.map((d, i) => (
          <p key={i} className="text-slate-400 dark:text-slate-500 text-[13px] font-bold text-center pb-2">
            {d}
          </p>
        ))}
        {/* Padding for first day starts on Monday */}
        <div className="col-start-2"></div> 
        {days.map((d) => {
           let classes = "h-10 w-full text-[#111418] dark:text-white text-sm font-medium rounded-full hover:bg-slate-100 dark:hover:bg-slate-700";
           // Mock logic for the range shown in screenshot (5 to 12)
           if (d === 5) {
             classes = "h-10 w-full bg-primary text-white text-sm font-bold rounded-l-full shadow-md relative z-10";
           } else if (d > 5 && d < 12) {
             classes = "h-10 w-full bg-primary/10 dark:bg-primary/20 text-[#111418] dark:text-white text-sm font-medium";
           } else if (d === 12) {
             classes = "h-10 w-full bg-primary/10 dark:bg-primary/20 hover:bg-primary/30 text-[#111418] dark:text-white text-sm font-medium rounded-r-full transition-colors";
           }
           
           return (
            <button key={d} className={classes}>{d}</button>
           )
        })}
      </div>
    </div>
  );
};

export default NewTripScreen;
