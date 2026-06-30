'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HabitDefinition } from '../types/habit';

export default function HabitCard({ habit, selectedDate }: { habit: HabitDefinition, selectedDate: string }) {
  const router = useRouter();
  const [isCompletedToday, setIsCompletedToday] = useState(false);
  const [weeklyProgress, setWeeklyProgress] = useState(0); 
  const [loading, setLoading] = useState(true);

  const targetDays = habit.targetDays || 4;

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:8000/api/records/${habit.id}`);
        const data = await res.json();
        
        if (Array.isArray(data)) {
          const curr = new Date(selectedDate);
          const firstDayOfWeek = new Date(curr.setDate(curr.getDate() - curr.getDay() + 1)).toISOString().split('T')[0];        
          const count = data.filter((r: any) => r.date >= firstDayOfWeek).length;
          setWeeklyProgress(count);
          const targetRecord = data.find((r: any) => r.date === selectedDate);
        
          setIsCompletedToday(!!targetRecord);
        }

      } catch (error) {
        console.error('Error cargando registros del hábito:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [habit.id, selectedDate]); 


  const handleToggleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const newStatus = !isCompletedToday;
    setIsCompletedToday(newStatus);
    setWeeklyProgress(prev => newStatus ? prev + 1 : prev - 1);

    try {
      await fetch('http://localhost:8000/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          habit_id: habit.id,
          date: selectedDate, 
          data: { completed: newStatus },
        }),
      });
    } catch (error) {
      console.error('Error:', error);
      setIsCompletedToday(!newStatus);
      setWeeklyProgress(prev => newStatus ? prev - 1 : prev + 1);
    }
  };

  return (
    <div 
      onClick={() => router.push(`/habit/${habit.id}?date=${selectedDate}`)}
      className="bg-surface/40 hover:bg-surface/60 backdrop-blur-sm border border-surface hover:border-[#8A2BE2]/40 rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between h-48 relative overflow-hidden group"
    >
      <div>
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg text-white tracking-tight line-clamp-1">{habit.name}</h3>
          <button 
            onClick={handleToggleComplete}
            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${
              isCompletedToday 
                ? 'bg-gradient-brand border-transparent text-white' 
                : 'bg-[#0F0F13] border-surface text-transparent hover:border-[#8A2BE2]/50'
            }`}
          >
            ✓
          </button>
        </div>
        <p className="text-textSecondary text-xs mt-1 line-clamp-2 pr-8">{habit.description}</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold text-textSecondary">
          <span>Progreso semanal</span>
          <span className="text-white font-bold">{weeklyProgress} / {targetDays}</span>
        </div>
        <div className="w-full h-1.5 bg-[#0F0F13] rounded-full overflow-hidden border border-white/5">
          <div 
            className="h-full bg-gradient-brand transition-all duration-500 rounded-full" 
            style={{ width: `${Math.min((weeklyProgress / targetDays) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}