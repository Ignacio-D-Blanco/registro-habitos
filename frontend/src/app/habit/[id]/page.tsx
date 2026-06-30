'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { HabitDefinition, HabitRecord } from '../../../types/habit';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';

type ViewMode = 'table' | 'line' | 'pie';

export default function HabitDetail() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [habit, setHabit] = useState<HabitDefinition | null>(null);
  const [record, setRecord] = useState<HabitRecord | null>(null);
  const [history, setHistory] = useState<HabitRecord[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const realToday = new Date().toISOString().split('T')[0];
  const urlDate = searchParams.get('date');
  const targetDate = urlDate || realToday; 
  const isToday = targetDate === realToday;

  useEffect(() => {
    async function loadHabitData() {
      if (!params.id) return;
      
      setLoading(true);
      try {
        const url = `http://localhost:8000/api/habits/${params.id}`;
        const resDef = await fetch(url);
        if (!resDef.ok) throw new Error('Hábito no encontrado');
        const habitData = await resDef.json();
        setHabit(habitData);

        const resRec = await fetch(`http://localhost:8000/api/records/${params.id}?date=${targetDate}`);
        if (resRec.ok) {
          const recordData = await resRec.json();
          if (recordData) {
            setRecord(recordData);
            setFormData(recordData.data || {});
          } else {
            setRecord(null);
            setFormData({});
          }
        }
        const resHist = await fetch(`http://localhost:8000/api/records/${params.id}`);
        if (resHist.ok) {
          const histData = await resHist.json();
          if (Array.isArray(histData)) {
            const sortedHist = histData.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
            setHistory(sortedHist);
          }
        }

      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    }

    loadHabitData();
  }, [params.id, targetDate]);

  const handleDeleteHabit = async () => {
    if (!confirm("¿Estás seguro? Esta acción eliminará el hábito y todo su historial permanentemente.")) return;

    try {
      const res = await fetch(`http://localhost:8000/api/habits/${params.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/');
      } else {
        alert("Error al eliminar el hábito");
      }
    } catch (error) {
      console.error("Error de red:", error);
    }
  };

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
        date: targetDate, 
        data: formData,
      };

      const response = await fetch('http://localhost:8000/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(`¡Registro guardado para el ${targetDate}!`);
        const updatedRecord = await response.json();
        setRecord(updatedRecord);
        
        const resHist = await fetch(`http://localhost:8000/api/records/${habit.id}`);
        if (resHist.ok) {
          const histData = await resHist.json();
          if (Array.isArray(histData)) {
             setHistory(histData.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()));
          }
        }
      } else {
        alert('Error al guardar el registro');
      }
    } catch (err) {
      console.error('Error de red:', err);
    } finally {
      setSaving(false);
    }
  };

  const lineChartData = history.map(item => {
    const dataPoint: Record<string, any> = { date: item.date };
    if (habit?.fields) {
      habit.fields.forEach(f => {
        if (f.type === 'number') dataPoint[f.label] = Number(item.data[f.name]) || 0;
        else if (f.type === 'boolean') dataPoint[f.label] = item.data[f.name] ? 1 : 0; 
      });
    }
    return dataPoint;
  });

  let completedCount = 0;
  let uncompletedCount = 0;
  history.forEach(item => {
    if (!habit?.fields || habit.fields.length === 0) completedCount++;
    else {
      const values = Object.values(item.data);
      const hasSuccess = values.some(v => v === true || (typeof v === 'number' && v > 0));
      if (hasSuccess) completedCount++;
      else uncompletedCount++;
    }
  });

  const pieChartData = [
    { name: 'Completados', value: completedCount || 1 },
    { name: 'Incompletos', value: uncompletedCount }
  ];
  const PIE_COLORS = ['#8A2BE2', '#313142']; 

  if (loading) return (
    <div className="min-h-screen bg-[#0F0F13] flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A2BE2]"></div>
    </div>
  );

  if (!habit) return (
    <div className="min-h-screen bg-[#0F0F13] text-[#FFFFFF] flex flex-col justify-center items-center p-4">
      <h2 className="text-2xl font-bold mb-4">Hábito no encontrado</h2>
      <button onClick={() => router.push('/')} className="px-4 py-2 bg-surface rounded-xl text-textSecondary hover:text-white border border-surface transition-colors">Volver al inicio</button>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#0F0F13] text-[#FFFFFF] p-8 md:p-16 antialiased font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        
        <header className="flex justify-between items-start border-b border-surface pb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">{habit.name}</h1>
            <p className="text-textSecondary mt-2">{habit.description || 'Registro de actividad'}</p>
            <span className="inline-block mt-3 px-3 py-1 bg-[#B030B0]/10 text-[#B030B0] rounded-full text-xs font-semibold uppercase tracking-wider">
              {isToday ? 'Hoy:' : 'Fecha:'} {targetDate} 
            </span>
          </div>
          
          <div className="flex gap-3">
             <button 
                onClick={handleDeleteHabit} 
                className="px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all font-semibold text-sm"
              >
                Eliminar
              </button>
             <button 
                onClick={() => router.push('/')} 
                className="px-5 py-2.5 rounded-xl bg-surface border border-surface text-textSecondary hover:text-white hover:border-[#8A2BE2] transition-all font-semibold text-sm"
              >
                ← Volver
              </button>
          </div>
        </header>

        <section className="bg-surface/40 backdrop-blur-sm border border-surface rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-white border-b border-white/10 pb-4">
            Datos del {targetDate} 
          </h2>
          <form onSubmit={handleSaveRecord} className="space-y-6">
            {(!habit.fields || habit.fields.length === 0) ? (
              <div className="text-center py-8">
                <p className="text-textSecondary mb-4">Solo registra el marcaje diario.</p>
                <div className="p-4 bg-[#0F0F13]/40 rounded-xl border border-[#8A2BE2]/30 inline-block text-[#8A2BE2] font-semibold">
                  {record ? '✓ Completado en esta fecha' : 'Sin registro en esta fecha'}
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {habit.fields.map((field, index) => (
                  <div key={index} className="space-y-2">
                    <label className="block text-sm font-semibold text-white">{field.label}</label>
                    {field.type === 'number' && (
                      <input type="number" required={field.required} value={formData[field.name] ?? ''} onChange={(e) => handleInputChange(field.name, Number(e.target.value))} className="w-full bg-[#0F0F13] border border-surface rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#8A2BE2]" />
                    )}
                    {field.type === 'text' && (
                      <input type="text" required={field.required} value={formData[field.name] ?? ''} onChange={(e) => handleInputChange(field.name, e.target.value)} className="w-full bg-[#0F0F13] border border-surface rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#8A2BE2]" />
                    )}
                    {field.type === 'boolean' && (
                      <label className="flex items-center gap-3 cursor-pointer select-none py-2">
                        <input type="checkbox" checked={!!formData[field.name]} onChange={(e) => handleInputChange(field.name, e.target.checked)} className="w-6 h-6 rounded accent-[#8A2BE2] cursor-pointer" />
                        <span className="text-textSecondary font-medium">Marcar como realizado</span>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="pt-6 border-t border-white/5 flex justify-end">
              <button type="submit" disabled={saving} className="px-8 py-3.5 rounded-xl bg-gradient-brand text-white font-bold text-base hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar Registro'}
              </button>
            </div>
          </form>
        </section>

        <section className="bg-surface/40 backdrop-blur-sm border border-surface rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4 gap-4">
            <h2 className="text-2xl font-bold text-white">Historial</h2>
            <div className="bg-[#0F0F13] p-1 rounded-xl border border-surface flex gap-1 self-start">
              <button onClick={() => setViewMode('table')} className={`px-4 py-1.5 rounded-lg text-xs font-bold ${viewMode === 'table' ? 'bg-surface text-white' : 'text-textSecondary'}`}>📊 Tabla</button>
              <button onClick={() => setViewMode('line')} className={`px-4 py-1.5 rounded-lg text-xs font-bold ${viewMode === 'line' ? 'bg-surface text-white' : 'text-textSecondary'}`}>📈 Tendencia</button>
              <button onClick={() => setViewMode('pie')} className={`px-4 py-1.5 rounded-lg text-xs font-bold ${viewMode === 'pie' ? 'bg-surface text-white' : 'text-textSecondary'}`}>🍕 Distribución</button>
            </div>
          </div>
          
          {history.length === 0 ? (
            <p className="text-textSecondary text-center py-8 italic border border-dashed border-surface rounded-xl">Aún no hay registros.</p>
          ) : (
            <>
              {viewMode === 'table' && (
                <div className="overflow-x-auto rounded-xl border border-surface">
                  <table className="w-full text-left border-collapse bg-[#0F0F13]/30">
                    <thead className="text-textSecondary border-b border-white/10 text-sm bg-surface/30">
                      <tr><th className="py-4 px-6">Fecha</th>{habit.fields?.map((f, i) => <th key={i} className="py-4 px-6">{f.label}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-white text-sm">
                      {history.map((hItem) => (
                        <tr key={hItem.id} className="hover:bg-[#4B208C]/5">
                          <td className="py-4 px-6 text-textSecondary">{hItem.date}</td>
                          {habit.fields?.map((f: any, idx: any) => (
                            <td key={idx} className="py-4 px-6">{String(hItem.data[f.name] ?? '-')}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {viewMode === 'line' && (
                <div className="w-full h-80 p-4 rounded-xl border border-surface bg-[#0F0F13]/40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1A1A24" />
                      <XAxis dataKey="date" stroke="#A0A0AB" fontSize={11} />
                      <YAxis stroke="#A0A0AB" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#1A1A24', borderColor: '#313142' }} />
                      {habit.fields?.map((f, i) => <Line key={i} type="monotone" dataKey={f.label} stroke={i % 2 === 0 ? '#8A2BE2' : '#B030B0'} strokeWidth={3} />)}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              {viewMode === 'pie' && (
                <div className="w-full h-80 p-4 rounded-xl border border-surface bg-[#0F0F13]/40 flex flex-col items-center justify-center">
                  <ResponsiveContainer width="100%" height="90%">
                    <PieChart>
                      <Pie data={pieChartData} innerRadius={60} outerRadius={90} dataKey="value">
                        {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}