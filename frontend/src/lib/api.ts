import router from 'next/router';
import { HabitDefinition, HabitRecord } from '../types/habit';

const API_BASE_URL = 'http://localhost:8000';

export async function getHabits(): Promise<HabitDefinition[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/habits`);
    if (!response.ok) {
      throw new Error('Error al obtener los hábitos del servidor');
    }
    return await response.json();
  } catch (error) {
    console.error('API Client Error:', error);
    return [];
  }
}

export async function createHabit(habitData: Omit<HabitDefinition, 'id' | 'createdAt'>): Promise<HabitDefinition | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/habits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(habitData),
    });
    
    if (!response.ok) {
      const errorDetail = await response.json().catch(() => ({ detail: 'Respuesta vacía del servidor' }));
      console.error('🛑 Error exacto del Backend (Objeto):', errorDetail);
      
      throw new Error(`Error al crear el hábito: ${JSON.stringify(errorDetail)}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Client Catched Error:', error);
    return null;
  }
}

const handleDelete = async () => {
  if (confirm("¿Estás seguro de que quieres eliminar este hábito? Se borrarán todos los registros asociados permanentemente.")) {
    try {
      const res = await fetch(`http://localhost:8000/api/habits/${params.id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        alert("Hábito eliminado correctamente");
        router.push('/');
      } else {
        alert("Error al intentar eliminar el hábito");
      }
    } catch (error) {
      console.error("Error de red:", error);
    }
  }
};