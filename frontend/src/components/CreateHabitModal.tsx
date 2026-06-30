import { useState } from 'react';
import { HabitDefinition, FieldDefinition, FieldType, VisualizationType } from '../types/habit';
import { createHabit } from '../lib/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateHabitModal({ isOpen, onClose, onSuccess }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visualizationType, setVisualizationType] = useState<VisualizationType>('table');
  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddField = () => {
    setFields([...fields, { name: '', label: '', type: 'number', required: false }]);
  };

  const handleUpdateField = (index: number, key: keyof FieldDefinition, value: any) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [key]: value };
    
    if (key === 'label') {
      newFields[index].name = value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    }
    setFields(newFields);
  };

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const newHabit = {
      name,
      description,
      visualization_type: visualizationType, 
      fields,
    };

    const result = await createHabit(newHabit as any);
    setIsSubmitting(false);
    
    if (result) {
      setName('');
      setDescription('');
      setFields([]);
      onSuccess();
    } else {
      alert('Error al crear el hábito. Revisa la consola.');
    }
  };
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
      <div className="bg-[#1A1A24] border border-[#313142] rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50 relative">
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
          <h2 className="text-2xl font-bold text-[#FFFFFF]">Configurar Nuevo Hábito</h2>
          <button onClick={onClose} className="text-[#A0A0AB] hover:text-[#FFFFFF] text-xl font-bold">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#A0A0AB] mb-1">Nombre del Hábito</label>
              <input required type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0F0F13] border border-[#313142] rounded-xl px-4 py-3 text-[#FFFFFF] focus:outline-none focus:border-[#8A2BE2]"
                placeholder="Ej. Lectura Diaria, Finanzas, Gym" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A0A0AB] mb-1">Descripción (Opcional)</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#0F0F13] border border-[#313142] rounded-xl px-4 py-3 text-[#FFFFFF] focus:outline-none focus:border-[#8A2BE2] resize-none h-20"
                placeholder="¿Cuál es el objetivo de este registro?" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A0A0AB] mb-1">Tipo de Visualización Principal</label>
              <select value={visualizationType} onChange={(e) => setVisualizationType(e.target.value as VisualizationType)}
                className="w-full bg-[#0F0F13] border border-[#313142] rounded-xl px-4 py-3 text-[#FFFFFF] focus:outline-none focus:border-[#8A2BE2]">
                <option value="table">Tabla de Datos</option>
                <option value="line_chart">Gráfico de Líneas (Evolución)</option>
                <option value="percentage_bar">Barra de Progreso</option>
                <option value="pie_chart">Gráfico Circular</option>
              </select>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#FFFFFF]">Campos Dinámicos</h3>
              <button type="button" onClick={handleAddField} className="text-sm px-4 py-2 bg-[#8A2BE2]/10 text-[#8A2BE2] rounded-xl hover:bg-[#8A2BE2]/20 transition-colors border border-[#8A2BE2]/20">
                + Agregar Campo
              </button>
            </div>
            
            <div className="space-y-3">
              {fields.length === 0 && <p className="text-sm text-[#A0A0AB] italic py-2">No has agregado campos. Solo se registrará la fecha.</p>}
              
              {fields.map((field, index) => (
                <div key={index} className="flex gap-3 items-start bg-[#0F0F13] p-4 rounded-xl border border-[#313142]">
                  <div className="flex-1 space-y-3">
                    <input required type="text" placeholder="Nombre visible (Ej. Páginas leídas)" value={field.label} onChange={(e) => handleUpdateField(index, 'label', e.target.value)}
                      className="w-full bg-[#1A1A24] border border-[#313142] rounded-xl px-4 py-2.5 text-sm text-[#FFFFFF] focus:outline-none focus:border-[#8A2BE2]" />
                    
                    <div className="flex gap-4 items-center">
                      <select value={field.type} onChange={(e) => handleUpdateField(index, 'type', e.target.value as FieldType)}
                        className="flex-1 bg-[#1A1A24] border border-[#313142] rounded-xl px-4 py-2.5 text-sm text-[#FFFFFF] focus:outline-none focus:border-[#8A2BE2]">
                        <option value="number">Número</option>
                        <option value="text">Texto</option>
                        <option value="boolean">Casilla (Sí/No)</option>
                      </select>
                      <label className="flex items-center gap-2 text-sm text-[#A0A0AB] cursor-pointer select-none">
                        <input type="checkbox" checked={field.required} onChange={(e) => handleUpdateField(index, 'required', e.target.checked)} className="w-4 h-4 rounded accent-[#8A2BE2] cursor-pointer" />
                        Requerido
                      </label>
                    </div>
                  </div>
                  <button type="button" onClick={() => handleRemoveField(index)} className="text-red-400 hover:text-red-300 p-2 font-bold self-center">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl text-[#A0A0AB] hover:text-[#FFFFFF] hover:bg-white/5 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-3 rounded-xl bg-gradient-brand text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-[#4B208C]/20">
              {isSubmitting ? 'Guardando...' : 'Crear Hábito'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}