'use client';

import { useEffect, useState } from 'react';
import { getHabits } from '../lib/api';
import { HabitDefinition } from '../types/habit';
import CreateHabitModal from '../components/CreateHabitModal';
import Header from '../components/Header';
import WelcomeBanner from '../components/WelcomeBanner';
import HabitCard from '../components/HabitCard';
import RightPanel from '../components/RightPanel';

export default function DashboardPremium() {
  const [habits, setHabits] = useState<HabitDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string>('');
  
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [futureGoal, setFutureGoal] = useState<any>(null);
  const [goalRefreshTrigger, setGoalRefreshTrigger] = useState(0);

  const getTodayStr = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const isFutureDate = selectedDate > getTodayStr();

  const loadData = async () => {
    setLoading(true);
    const data = await getHabits();
    setHabits(data);
    if (data && data.length > 0) setSelectedHabitId(data[0].id);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (isFutureDate) {
      fetch(`http://localhost:8000/api/goals/${selectedDate}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.name) setFutureGoal(data);
          else setFutureGoal(null);
        })
        .catch(() => setFutureGoal(null));
    }
  }, [selectedDate, isFutureDate, goalRefreshTrigger]);

  const activeHabitsCount = habits.length;

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto w-full space-y-10">
      <Header onOpenCreateModal={() => setIsModalOpen(true)} />

      <div className="flex flex-col xl:flex-row gap-10">
        <div className="flex-1 space-y-10">
          <WelcomeBanner 
            userName="Ignacio" 
            activeCount={activeHabitsCount} 
            completedCount={0} 
          />

          <section className="space-y-6">
            <div className="flex justify-between items-end border-b border-white/5 pb-3">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  {isFutureDate ? 'Planificación de Metas' : 'Tus Registros'}
                </h2>
                <p className="text-[#8A2BE2] font-semibold text-sm mt-1">
                  Viendo datos de: {selectedDate} {isFutureDate && '(Futuro)'}
                </p>
              </div>
              {!isFutureDate && (
                <span className="text-xs font-semibold text-textSecondary tracking-wide uppercase">
                  {activeHabitsCount} en curso
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64 bg-surface/30 rounded-3xl border border-surface">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#8A2BE2]" />
              </div>
            ) : isFutureDate ? (
              
              <div className="bg-[#0F0F13]/50 rounded-3xl p-10 border border-surface flex flex-col items-center justify-center space-y-8 min-h-[400px] relative overflow-hidden animate-fade-in">
                <div className="absolute top-10 left-10 w-48 h-48 bg-[#4B208C]/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-10 right-10 w-48 h-48 bg-[#8A2BE2]/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="text-center relative z-10">
                  <div className="text-5xl mb-4">🎯</div>
                  <h3 className="text-xl font-bold text-white mb-2">Modo Planificación</h3>
                </div>

                {futureGoal ? (
                  <div className="bg-[#14141A] border border-[#4B208C]/60 p-7 rounded-2xl w-full max-w-lg shadow-[0_0_20px_rgba(138,43,226,0.1)] relative z-10 transition-all">
                    <h4 className="text-xl font-black text-white">{futureGoal.name}</h4>
                    {futureGoal.description && (
                      <p className="text-sm text-textSecondary mt-2 leading-relaxed">{futureGoal.description}</p>
                    )}
                    {futureGoal.target_value && (
                      <div className="mt-6 inline-flex items-center gap-3 bg-[#4B208C]/30 border border-[#8A2BE2]/40 px-4 py-2.5 rounded-xl">
                        <span className="text-[10px] font-bold text-[#B030B0] uppercase tracking-widest">Target</span>
                        <span className="text-white font-black text-lg">${futureGoal.target_value}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-[#14141A] border border-dashed border-surface p-8 rounded-2xl w-full max-w-lg text-center relative z-10">
                    <p className="text-textSecondary font-medium">Aún no hay objetivos para el {selectedDate}</p>
                    <p className="text-xs text-[#8A2BE2] font-semibold mt-2">Usa el panel lateral para crear uno 👉</p>
                  </div>
                )}
              </div>

            ) : habits.length === 0 ? (
              <div className="bg-surface/30 rounded-3xl p-16 text-center border border-dashed border-surface flex flex-col items-center justify-center space-y-4">
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {habits.map((habit) => (
                  <HabitCard 
                    key={habit.id} 
                    habit={habit} 
                    selectedDate={selectedDate} 
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <RightPanel 
          selectedDate={selectedDate} 
          onSelectDate={setSelectedDate} 
          habitId={selectedHabitId}
          onGoalUpdate={() => setGoalRefreshTrigger(prev => prev + 1)} 
        />
      </div>

      <CreateHabitModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          setIsModalOpen(false);
          loadData(); 
        }} 
      />
    </div>
  );
}