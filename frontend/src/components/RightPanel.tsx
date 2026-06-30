'use client';

import { useState, useEffect } from 'react';
import GoalModal from './GoalModal';

interface RightPanelProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  habitId: string;
}

interface RightPanelProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  habitId: string;
  onGoalUpdate?: () => void; 
}

export default function RightPanel({ selectedDate, onSelectDate, habitId }: RightPanelProps) {
  const [completedDates, setCompletedDates] = useState<string[]>([]);
  const [stats, setStats] = useState({ streak: 0, percentage: 0 });
  const [goalData, setGoalData] = useState<any>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const [displayedDate, setDisplayedDate] = useState(new Date());
  const displayYear = displayedDate.getFullYear();
  const displayMonth = displayedDate.getMonth();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDateObj = new Date(selectedDate + 'T00:00:00');
  const isFutureDate = selectedDateObj > today;

  const daysInMonthCount = new Date(displayYear, displayMonth + 1, 0).getDate();
  const daysInMonth = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);
  
  const firstDayOfMonth = new Date(displayYear, displayMonth, 1).getDay();
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const monthName = monthNames[displayMonth];

  async function loadGoalDetails() {
    if (!isFutureDate) return;
    try {
      const res = await fetch(`http://localhost:8000/api/goals/${selectedDate}`);
      if (res.ok) {
        const data = await res.json();
        setGoalData(data);
      } else {
        setGoalData(null);
      }
    } catch (err) {
      setGoalData(null);
    }
  }

  useEffect(() => {
    async function loadAllRecords() {
      try {
        const resHabits = await fetch('http://localhost:8000/api/habits');
        if (!resHabits.ok) return;
        const habits = await resHabits.json();

        const allRecordsPromises = habits.map((h: any) => 
          fetch(`http://localhost:8000/api/records/${h.id}`).then(res => res.json())
        );
        
        const responses = await Promise.all(allRecordsPromises);
        const flatRecords = responses.flat().filter(Boolean);

        const datesWithActivity = Array.from(new Set(flatRecords.map((r: any) => r.date)));
        setCompletedDates(datesWithActivity as string[]);

        const currentYearReal = today.getFullYear();
        const currentMonthReal = today.getMonth();
        const daysInMonthRealCount = new Date(currentYearReal, currentMonthReal + 1, 0).getDate();

        const daysWithRecordsInMonth = (datesWithActivity as string[]).filter(date => {
          const d = new Date(date);
          return d.getFullYear() === currentYearReal && d.getMonth() === currentMonthReal;
        }).length;
        
        const calculatedPercentage = Math.round((daysWithRecordsInMonth / daysInMonthRealCount) * 100);

        let currentStreak = 0;
        
        for (let i = 0; i < 365; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() - i);
          const dateStr = checkDate.toISOString().split('T')[0];

          if (datesWithActivity.includes(dateStr)) {
            currentStreak++;
          } else {
            if (i > 0) break;
          }
        }

        setStats({
          streak: currentStreak,
          percentage: isNaN(calculatedPercentage) ? 0 : Math.min(calculatedPercentage, 100)
        });

      } catch (error) {
        console.error('Error cargando datos para el panel lateral:', error);
      }
    }

    loadAllRecords();
  }, [displayMonth, displayYear]);

  useEffect(() => {
    if (isFutureDate) {
      loadGoalDetails();
    }
  }, [selectedDate, isFutureDate]);

  const handlePrevMonth = () => {
    setDisplayedDate(new Date(displayYear, displayMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setDisplayedDate(new Date(displayYear, displayMonth + 1, 1));
  };

  return (
    <aside className="w-full xl:w-80 space-y-6">
      
      <div className="bg-surface/40 backdrop-blur-sm border border-surface rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#8A2BE2]/10 rounded-full blur-2xl" />
        
        {isFutureDate ? (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] bg-amber-500/10 text-amber-500 font-extrabold px-2 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-wider">
                Modo Planificación
              </span>
              <h3 className="text-sm font-bold text-white tracking-wider mt-2">
                Meta establecida para el {selectedDate}
              </h3>
            </div>
            
            <div className="bg-[#0F0F13]/60 p-4 rounded-xl border border-surface/80 space-y-2">
              <p className="text-xs text-textSecondary">Objetivo para este día:</p>
              <p className="text-sm font-semibold text-amber-300 italic break-words">
                {goalData ? goalData.title : '"Aún sin objetivo configurado..."'}
              </p>
              {goalData?.target_amount && (
                <p className="text-xs font-bold text-white pt-1">
                  Monto objetivo: <span className="text-[#B030B0]">${goalData.target_amount}</span>
                </p>
              )}
            </div>

            <button 
              onClick={() => setIsGoalModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-gradient-brand text-xs font-bold text-white hover:opacity-90 transition-opacity"
            >
              {goalData ? 'Editar meta para esta fecha' : '+ Configurar meta para esta fecha'}
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-sm font-bold text-textSecondary uppercase tracking-wider mb-4">
              Tu Consistencia
            </h3>
            <div className="flex items-center gap-4">
              <div className="text-4xl">🔥</div>
              <div>
                <p className="text-2xl font-black text-white">{stats.streak} {stats.streak === 1 ? 'Día' : 'Días'}</p>
                <p className="text-xs text-textSecondary">Racha actual consecutiva</p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/5 grid grid-cols-2 gap-4 text-center">
              <div className="bg-[#0F0F13]/60 p-3 rounded-xl border border-surface">
                <p className="text-xs text-textSecondary">Mes Activo</p>
                <p className="text-lg font-bold text-[#B030B0]">{stats.percentage}%</p>
              </div>
              <div className="bg-[#0F0F13]/60 p-3 rounded-xl border border-surface">
                <p className="text-xs text-textSecondary">Días Registrados</p>
                <p className="text-lg font-bold text-white">{completedDates.length}</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="bg-surface/40 backdrop-blur-sm border border-surface rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-textSecondary uppercase tracking-wider">
            {monthName} {displayYear}
          </h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrevMonth}
              className="h-6 w-6 rounded-lg bg-[#0F0F13] border border-surface text-textSecondary flex items-center justify-center hover:text-white hover:border-white/30 transition-all text-xs font-bold"
            >
              &lt;
            </button>
            <button 
              onClick={handleNextMonth}
              className="h-6 w-6 rounded-lg bg-[#0F0F13] border border-surface text-textSecondary flex items-center justify-center hover:text-white hover:border-white/30 transition-all text-xs font-bold"
            >
              &gt;
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-textSecondary mb-2">
          <span>D</span><span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {emptyDays.map(i => <div key={`empty-${i}`} className="h-7 w-7" />)}

          {daysInMonth.map((day) => {
            const dateStr = `${displayYear}-${String(displayMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isCompleted = completedDates.includes(dateStr);
            const isSelected = selectedDate === dateStr;
            const dateObj = new Date(displayYear, displayMonth, day);
            const isDayFuture = dateObj > today;

            return (
              <div
                key={day}
                onClick={() => onSelectDate(dateStr)}
                className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-semibold transition-all duration-300 relative group cursor-pointer
                  ${isSelected ? 'ring-2 ring-white scale-110 z-10' : ''} 
                  ${isCompleted && !isDayFuture ? 'bg-gradient-brand text-white shadow-md shadow-[#8A2BE2]/20 font-bold' : ''}
                  ${!isCompleted && !isDayFuture ? 'bg-[#0F0F13] border border-surface text-textSecondary hover:border-white/20 hover:text-white' : ''}
                  ${isDayFuture ? 'bg-[#1A1A24] border border-surface/50 text-amber-500/60 hover:border-amber-500/30' : ''}
                `}
              >
                {day}
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-surface border border-surface text-[9px] text-white px-1.5 py-0.5 rounded shadow-xl whitespace-nowrap z-20">
                  {dateStr} {isDayFuture && '(A futuro)'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <GoalModal 
          isOpen={isGoalModalOpen}
          onClose={() => setIsGoalModalOpen(false)}
          selectedDate={selectedDate}
          onSaveSuccess={loadGoalDetails} 
          habitId={habitId} 
      />
    </aside>
  );
}