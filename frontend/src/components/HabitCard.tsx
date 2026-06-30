'use client';

import { HabitDefinition } from '../types/habit';
import { useRouter } from 'next/navigation';

interface HabitCardProps {
  habit: HabitDefinition;
}

export default function HabitCard({ habit }: HabitCardProps) {
  const router = useRouter();

  return (
    <article 
      onClick={() => router.push(`/habit/${habit.id}`)}
      className="bg-surface/40 backdrop-blur-sm border border-surface hover:border-[#8A2BE2] rounded-2xl p-6 hover:shadow-2xl hover:shadow-[#8A2BE2]/10 transition-all duration-300 flex flex-col justify-between h-48 cursor-pointer group relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-brand opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        <h3 className="text-lg font-bold text-white group-hover:text-[#8A2BE2] transition-colors line-clamp-1">
          {habit.name}
        </h3>
        <p className="text-textSecondary text-xs mt-2 line-clamp-2 leading-relaxed h-8">
          {habit.description || 'Sin descripción detallada registrada'}
        </p>
      </div>

      <div className="space-y-3 pt-4 border-t border-white/5 mt-2">
        <div className="w-full bg-[#0F0F13] rounded-full h-1.5 overflow-hidden">
          <div className="bg-gradient-brand w-[15%] h-full rounded-full transition-all group-hover:w-[30%]"></div>
        </div>
        
        <div className="flex justify-between items-center text-[11px] font-medium">
          <span className="px-3 py-1 rounded-full bg-[#0F0F13] border border-surface text-textSecondary capitalize tracking-wide">
            {String(habit.visualization_type || habit.visualizationType || 'tabla').replace('_', ' ')}
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-[#B030B0] bg-[#B030B0]/10 px-2.5 py-0.5 rounded-full border border-[#B030B0]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B030B0] animate-pulse" />
            {habit.fields?.length || 0} Campos
          </span>
        </div>
      </div>
    </article>
  );
}