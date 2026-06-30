'use client';

import { useState } from 'react';

interface HeaderProps {
  onOpenCreateModal: () => void;
}

export default function Header({ onOpenCreateModal }: HeaderProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header className="h-20 border border-surface bg-[#0F0F13]/60 backdrop-blur-md px-6 flex justify-between items-center rounded-2xl w-full">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center text-lg shadow-lg shadow-[#8A2BE2]/20">
            ⚡
          </div>
          <span className="font-bold text-lg tracking-wide text-white hidden sm:block">Pulse Habits</span>
        </div>

        <div className="relative w-64 md:w-96">
          <input 
            type="text" 
            placeholder="Buscar hábitos, estadísticas... ⌘K" 
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={`w-full bg-[#1A1A24] border rounded-xl px-4 py-2.5 pl-10 text-sm text-white focus:outline-none transition-all duration-300 placeholder:text-textSecondary ${
              isSearchFocused ? 'border-[#8A2BE2]' : 'border-surface'
            }`}
          />
          <span className="absolute left-3 top-2.5 text-xs text-textSecondary">🔍</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="w-10 h-10 rounded-xl bg-surface border border-surface flex items-center justify-center hover:border-[#8A2BE2] transition-colors relative">
          🔔<span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#B030B0] animate-pulse"></span>
        </button>
        <button 
          onClick={onOpenCreateModal}
          className="px-5 py-2.5 rounded-xl bg-gradient-brand text-white text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-[#4B208C]/30 hover:scale-[1.02]"
        >
          + Agregar hábito
        </button>
      </div>
    </header>
  );
}