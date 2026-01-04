import React, { useState } from 'react';

interface CustomCalendarProps {
    startDate: string;
    endDate: string;
    onSelectDate: (date: string) => void;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ startDate, endDate, onSelectDate }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Domingo

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
        // Construir YYYY-MM-DD manualmente para evitar problemas de fuso horário
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const dateStr = `${year}-${month}-${dayStr}`;
        return dateStr === startDate || dateStr === endDate;
    };

    const isInRange = (day: number) => {
        if (!startDate || !endDate) return false;
        // Para comparação, a comparação de string padrão funciona para YYYY-MM-DD
        // Mas para aceitar formatos mistos ou confiar em objetos Date com segurança:
        // Construímos strings de data locais para evitar problemas de fuso horário
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
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm w-full border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4 px-2">
                <button onClick={(e) => { e.preventDefault(); handlePrevMonth(); }} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <span className="material-symbols-outlined text-[#111418] dark:text-white text-[20px]">chevron_left</span>
                </button>
                <p className="text-[#111418] dark:text-white text-base font-bold leading-tight capitalize">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </p>
                <button onClick={(e) => { e.preventDefault(); handleNextMonth(); }} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
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

                    let baseClasses = "h-10 w-full text-sm font-medium rounded-full transition-all relative z-10 flex items-center justify-center ";

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

                    return (
                        <div key={d} className="relative p-0.5">
                            {inRange && (
                                <div className="absolute inset-y-0.5 left-0 right-0 bg-blue-50 dark:bg-blue-900/20 z-0" />
                            )}
                            {selected && startDate && endDate && startDate !== endDate && (
                                <div className={`absolute inset-y-0.5 w-[50%] bg-blue-50 dark:bg-blue-900/20 z-0 ${new Date(startDate).getDate() === d ? 'right-0' : 'left-0'}`} />
                            )}
                            <button
                                onClick={(e) => { e.preventDefault(); handleDateClick(d); }}
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

export default CustomCalendar;
