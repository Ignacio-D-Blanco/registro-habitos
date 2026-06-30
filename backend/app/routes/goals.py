from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
from ..database import get_supabase_client
from ..models import GoalCreate

router = APIRouter(tags=["goals"])

@router.get("/{target_date}")
def get_goal_by_date(target_date: str, supabase: Client = Depends(get_supabase_client)):
    try:
        response = supabase.table("goals").select("*").eq("deadline", target_date).execute()
        if not response.data:
            return{}
        return response.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error al obtener la meta: {str(e)}")

@router.post("", status_code=201)
def create_or_update_goal(goal: GoalCreate, supabase: Client = Depends(get_supabase_client)):
    try:
        goal_data = goal.model_dump()
        existing = supabase.table("goals").select("*").eq("deadline", goal.deadline).execute()
        if existing.data:
            response = supabase.table("goals").update(goal_data).eq("deadline", goal.deadline).execute()
        else:
            response = supabase.table("goals").insert(goal_data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar la meta: {str(e)}")