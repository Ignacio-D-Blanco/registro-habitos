'use client';

import { useState, useEffect } from 'react';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  habitId: string; 
  onSaveSuccess: () => void;
}

export default function GoalModal({ isOpen, onClose, selectedDate, habitId, onSaveSuccess }: GoalModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && selectedDate) {
      async function fetchGoal() {
        try {
          const res = await fetch(`http://localhost:8000/api/goals/${selectedDate}`);
          if (res.ok) {
            const data = await res.json();
            setTitle(data.name || '');
            setDescription(data.description || '');
            setTargetAmount(data.target_value ? String(data.target_value) : '');
          } else {
            setTitle('');
            setDescription('');
            setTargetAmount('');
          }
        } catch (err) {
          console.error('Error cargando meta:', err);
        }
      }
      fetchGoal();
    }
  }, [isOpen, selectedDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: Record<string, any> = {
        habit_id: habitId,       
        deadline: selectedDate,  
        name: title,             
      };
      
      if (description) payload.description = description;
      if (targetAmount) payload.target_value = parseFloat(targetAmount); 

      const res = await fetch('http://localhost:8000/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSaveSuccess();
        onClose();
      } else {
        const errorData = await res.json();
        console.error('Error del servidor:', errorData);
        alert('Error al guardar la meta. Revisa la consola.');
      }
    } catch (err) {
      console.error('Error de red:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#14141A] border border-surface rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-textSecondary hover:text-white transition-colors"
        >
          ✕
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-black text-white tracking-tight">Configurar Meta</h2>
          <p className="text-xs text-textSecondary mt-1">Establece un objetivo claro para el día {selectedDate}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Título de la Meta</label>
            <input 
              type="text" 
              required 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Ahorrar $1000 dólares"
              className="w-full bg-[#0F0F13] border border-surface rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-[#8A2BE2] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Descripción</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles adicionales de tu objetivo..."
              rows={3}
              className="w-full bg-[#0F0F13] border border-surface rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-[#8A2BE2] text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Monto Objetivo (Opcional)</label>
            <input 
              type="number" 
              value={targetAmount} 
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-[#0F0F13] border border-surface rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-[#8A2BE2] text-sm"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl bg-surface border border-surface text-white text-xs font-bold hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 py-3.5 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Meta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}