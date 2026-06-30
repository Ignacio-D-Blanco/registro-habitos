'use client';

import { Key, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { HabitDefinition, HabitRecord } from '../../../types/habit';

export default function HabitDetail() {
  const params = useParams();
  const router = useRouter();
  const [habit, setHabit] = useState<HabitDefinition | null>(null);
  const [record, setRecord] = useState<HabitRecord | null>(null);
  const [history, setHistory] = useState<HabitRecord[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    async function loadHabitData() {
      if (!params.id) return;
      
      setLoading(true);
      try {
        const url = `http://localhost:8000/api/habits/${params.id}`;
        const resDef = await fetch(url);
        
        if (!resDef.ok) {
          throw new Error(`Hábito no encontrado - Status: ${resDef.status}`);
        }

        const habitData = await resDef.json();
        setHabit(habitData);

        // 1. Obtenemos el registro de hoy
        const resRec = await fetch(`http://localhost:8000/api/records/${params.id}?date=${today}`);
        if (resRec.ok) {
          const recordData = await resRec.json();
          setRecord(recordData);
          setFormData(recordData.data || {});
        }

        // 2. Obtenemos el historial completo de registros para este hábito
        const resHist = await fetch(`http://localhost:8000/api/records/${params.id}`);
        if (resHist.ok) {
          const histData = await resHist.json();
          setHistory(histData);
        }

      } catch (error) {
        console.error('Error detallado cargando datos:', error);
      } finally {
        setLoading(false);
      }
    }

    loadHabitData();
  }, [params.id, today]);

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habit) return;
    
    setSaving(true);
    try {
      const payload = {
        habit_id: habit.id,
        date: today,
        data: formData,
      };

      const response = await fetch('http://localhost:8000/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('¡Registro guardado exitosamente!');
        const updatedRecord = await response.json();
        setRecord(updatedRecord);
        
        // Recargamos el historial tras guardar
        const resHist = await fetch(`http://localhost:8000/api/records/${habit.id}`);
        if (resHist.ok) setHistory(await resHist.json());
      } else {
        const err = await response.json();
        alert('Error al guardar: ' + JSON.stringify(err));
      }
    } catch (err) {
      console.error('Error de red:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F13] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A2BE2]"></div>
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="min-h-screen bg-[#0F0F13] text-[#FFFFFF] flex flex-col justify-center items-center p-4">
        <h2 className="text-2xl font-bold mb-4">Hábito no encontrado</h2>
        <button onClick={() => router.push('/')} className="px-4 py-2 bg-surface rounded-xl text-textSecondary hover:text-white border border-surface transition-colors">Volver al inicio</button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0F0F13] text-[#FFFFFF] p-8 md:p-16 antialiased font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Cabecera adaptada con clases semánticas */}
        <header className="flex justify-between items-center border-b border-surface pb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">{habit.name}</h1>
            <p className="text-textSecondary mt-2">{habit.description || 'Registro diario de actividad'}</p>
            <span className="inline-block mt-3 px-3 py-1 bg-[#B030B0]/10 text-[#B030B0] rounded-full text-xs font-semibold uppercase tracking-wider">
              Fecha de registro: {today}
            </span>
          </div>
          <button onClick={() => router.push('/')} className="px-5 py-2.5 rounded-xl bg-surface border border-surface text-textSecondary hover:text-white hover:border-[#8A2BE2] transition-all">
            ← Volver
          </button>
        </header>

        {/* Formulario de marcaje diario estilo Premium */}
        <section className="bg-surface/40 backdrop-blur-sm border border-surface rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-white border-b border-white/10 pb-4">Ingresar datos de hoy</h2>

          <form onSubmit={handleSaveRecord} className="space-y-6">
            {(!habit.fields || habit.fields.length === 0) ? (
              <div className="text-center py-8">
                <p className="text-textSecondary mb-4">Este hábito no tiene métricas configuradas, solo registra el marcaje diario.</p>
                <div className="p-4 bg-[#0F0F13]/40 rounded-xl border border-[#8A2BE2]/30 inline-block text-[#8A2BE2] font-semibold">✓ Hábito completado hoy</div>
              </div>
            ) : (
              <div className="space-y-5">
                {habit.fields.map((field, index) => (
                  <div key={index} className="space-y-2">
                    <label className="block text-sm font-semibold text-white">
                      {field.label} {field.required && <span className="text-[#B030B0]">*</span>}
                    </label>
                    
                    {field.type === 'number' && (
                      <input 
                        type="number" 
                        required={field.required}
                        value={formData[field.name] ?? ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-[#0F0F13] border border-surface rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#8A2BE2]"
                        placeholder={`Ingresa valor para ${field.label}`}
                      />
                    )}

                    {field.type === 'text' && (
                      <input 
                        type="text" 
                        required={field.required}
                        value={formData[field.name] ?? ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className="w-full bg-[#0F0F13] border border-surface rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#8A2BE2]"
                        placeholder={`Escribe texto para ${field.label}`}
                      />
                    )}

                    {field.type === 'boolean' && (
                      <label className="flex items-center gap-3 cursor-pointer select-none py-2">
                        <input 
                          type="checkbox" 
                          checked={!!formData[field.name]}
                          onChange={(e) => handleInputChange(field.name, e.target.checked)}
                          className="w-6 h-6 rounded accent-[#8A2BE2] cursor-pointer"
                        />
                        <span className="text-textSecondary font-medium">Marcar como realizado</span>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="pt-6 border-t border-white/5 flex justify-end">
              <button type="submit" disabled={saving} className="px-8 py-3.5 rounded-xl bg-gradient-brand text-white font-bold text-base hover:opacity-90 transition-opacity shadow-lg shadow-[#4B208C]/20 disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar Registro Diario'}
              </button>
            </div>
          </form>
        </section>

        {/* Sección dinámica de historial / visualización de datos */}
        <section className="bg-surface/40 backdrop-blur-sm border border-surface rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-white border-b border-white/10 pb-4">Historial de registros</h2>
          
          {history.length === 0 ? (
            <p className="text-textSecondary text-center py-8 italic bg-[#0F0F13]/20 rounded-xl border border-dashed border-surface">Aún no hay registros históricos para este hábito.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-surface">
              <table className="w-full text-left border-collapse bg-[#0F0F13]/30">
                <thead>
                  <tr className="text-textSecondary border-b border-white/10 text-sm bg-surface/30">
                    <th className="py-4 px-6 font-semibold tracking-wider uppercase text-xs">Fecha</th>
                    {habit.fields.map((f, i) => (
                      <th key={i} className="py-4 px-6 font-semibold tracking-wider uppercase text-xs">{f.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white text-sm">
                  {history.map((hItem) => (
                    <tr key={hItem.id} className="hover:bg-[#4B208C]/5 transition-colors">
                      <td className="py-4 px-6 font-medium text-textSecondary">{hItem.date}</td>
                      {habit.fields.map((f: any, idx: Key | null | undefined) => {
                        const val = hItem.data[f.name];
                        const displayVal = typeof val === 'boolean' ? (val ? '✓' : '✗') : (val ?? '-');
                        return (
                          <td key={idx} className="py-4 px-6 font-medium">
                            {typeof val === 'boolean' ? (
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${val ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {displayVal}
                              </span>
                            ) : (
                              displayVal
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}