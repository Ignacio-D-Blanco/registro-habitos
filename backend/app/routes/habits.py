from typing import List
from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
from ..database import get_supabase_client
from ..models import HabitDefinitionCreate

router = APIRouter(tags=["habits"])

@router.post("", status_code=201)
def create_habit_definition(habit: HabitDefinitionCreate, supabase: Client = Depends(get_supabase_client)):
    try:
        habit_data = habit.model_dump()
        response = supabase.table("habit_definitions").insert(habit_data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear el hábito: {str(e)}")

@router.get("")
def get_all_habit_definitions(supabase: Client = Depends(get_supabase_client)):
    try:
        response = supabase.table("habit_definitions").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener los hábitos: {str(e)}")

@router.get("/{habit_id}")
def get_habit_definition(habit_id: str, supabase: Client = Depends(get_supabase_client)):
    try:
        response = supabase.table("habit_definitions").select("*").eq("id", habit_id).execute()
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Hábito no encontrado en la base de datos")
        return response.data[0]
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener el hábito: {str(e)}")

@router.delete("/{habit_id}")
def delete_habit(habit_id: str, supabase: Client = Depends(get_supabase_client)):
    try:
        supabase.table("habit_records").delete().eq("habit_id", habit_id).execute()
        supabase.table("habit_definitions").delete().eq("id", habit_id).execute()
        return {"message": "Hábito eliminado correctamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar: {str(e)}")