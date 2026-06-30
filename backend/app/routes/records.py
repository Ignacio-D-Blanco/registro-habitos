from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
from ..database import get_supabase_client
from ..models import HabitRecordCreate

router = APIRouter(tags=["records"])

@router.post("", status_code=201)
def create_habit_record(record: HabitRecordCreate, supabase: Client = Depends(get_supabase_client)):
    try:
        record_data = record.model_dump()
        response = supabase.table("habit_records").insert(record_data).execute()
        return response.data[0]
    except Exception as e:
        if "duplicate key" in str(e).lower():
            raise HTTPException(status_code=400, detail="Ya existe un registro para este hábito en la fecha seleccionada")
        raise HTTPException(status_code=500, detail=f"Error al guardar el registro: {str(e)}")

@router.get("/{habit_id}")
def get_records_by_habit(habit_id: str, supabase: Client = Depends(get_supabase_client)):
    try:
        response = supabase.table("habit_records").select("*").eq("habit_id", habit_id).order("date", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener los registros: {str(e)}")