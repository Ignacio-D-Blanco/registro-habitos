'use client';

import { useEffect, useState } from 'react';
import { getHabits } from '../lib/api';
import { HabitDefinition } from '../types/habit';
import CreateHabitModal from '../components/CreateHabitModal';
import Header from '../components/Header';
import HabitCard from '../components/HabitCard'; 
import WelcomeBanner from '../components/WelcomeBanner'; 


export default function DashboardPremium() {
  const [habits, setHabits] = useState<HabitDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await getHabits();
    setHabits(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeHabitsCount = habits.length;

  return (
    <main className="min-h-screen bg-[#0F0F13] text-[#FFFFFF] p-6 md:p-10 font-sans antialiased">
      <div className="max-w-7xl mx-auto w-full space-y-10">
        

        <Header onOpenCreateModal={() => setIsModalOpen(true)} />

        <WelcomeBanner 
          userName="Ignacio" 
          activeCount={activeHabitsCount} 
          completedCount={0} 
        />

        <section className="space-y-6">
          <div className="flex justify-between items-end border-b border-white/5 pb-3">
            <h2 className="text-2xl font-bold tracking-tight text-white">Tus Registros</h2>
            <span className="text-xs font-semibold text-textSecondary tracking-wide uppercase">
              {activeHabitsCount} en curso
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64 bg-surface/30 rounded-3xl border border-surface">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#8A2BE2]" />
            </div>
          ) : habits.length === 0 ? (
            <div className="bg-surface/30 rounded-3xl p-16 text-center border border-dashed border-surface flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#0F0F13] flex items-center justify-center border border-surface text-2xl">📝</div>
              <div className="space-y-1">
                <p className="text-white font-bold text-xl">Sin seguimientos configurados</p>
                <p className="text-textSecondary text-sm">Comienza creando tu primer hábito personalizado.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-2 px-6 py-2.5 rounded-xl bg-surface border border-[#8A2BE2] text-white text-sm font-semibold hover:bg-[#8A2BE2]/5 transition-all">
                Configurar hábito
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {habits.map((habit) => (
                <HabitCard key={habit.id} habit={habit} />
              ))}
            </div>
          )}
        </section>

      </div>

      <CreateHabitModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          setIsModalOpen(false);
          loadData(); 
        }} 
      />
    </main>
  );
}