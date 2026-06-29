'use client';

import { useEffect, useState } from 'react';
import { getHabits } from '../lib/api';
import { HabitDefinition } from '../types/habit';

export default function Dashboard() {
  const [habits, setHabits] = useState<HabitDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getHabits();
      setHabits(data);
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <main className="min-h-screen bg-background text-textPrimary p-8 md:p-16">
      <div className="max-w-6xl mx-auto">
        {/* Header / Barra de navegación superior */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-surface pb-6 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-brand bg-clip-text text-transparent">
              Generic Habit Tracker
            </h1>
            <p className="text-textSecondary mt-2">
              Sistema dinámico de registro y visualización
            </p>
          </div>
          <button className="px-6 py-3 rounded-xl bg-gradient-brand text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-brand-purple/20">
            + Nuevo Hábito
          </button>
        </header>

        {/* Sección de listado de hábitos */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-textPrimary">Tus Registros Activos</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-electric"></div>
            </div>
          ) : habits.length === 0 ? (
            <div className="bg-surface rounded-2xl p-12 text-center border border-dashed border-textSecondary/30">
              <p className="text-textSecondary text-lg">Aún no tienes hábitos configurados.</p>
              <button className="mt-4 px-5 py-2.5 rounded-lg bg-surface border border-brand-electric text-textPrimary hover:bg-brand-electric/10 transition-colors">
                Crear mi primer hábito
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {habits.map((habit) => (
                <article key={habit.id} className="bg-surface border border-surface rounded-2xl p-6 hover:border-brand-magenta transition-colors flex flex-col justify-between h-48">
                  <div>
                    <h3 className="text-xl font-bold text-white">{habit.name}</h3>
                    <p className="text-textSecondary text-sm mt-2 line-clamp-2">
                      {habit.description || 'Sin descripción'}
                    </p>
                  </div>
                  <div className="flex justify-between items-center text-xs text-textSecondary pt-4 border-t border-background/50">
                    <span className="px-3 py-1 rounded-full bg-background border border-surface">
                      Visualización: {habit.visualizationType}
                    </span>
                    <span>Campos: {habit.fields.length}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}