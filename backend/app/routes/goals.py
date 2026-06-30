from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
from ..database import get_supabase_client
from ..models import GoalCreate

router = APIRouter(tags=["goals"])


@router.post("", status_code=201)
def create_goal(goal: GoalCreate, supabase: Client = Depends(get_supabase_client)):
    response = supabase.table("goals").insert(goal.model_dump()).execute()
    return response.data[0]

@router.get("/{target_date}")
def get_goals_by_date(target_date: str, supabase: Client = Depends(get_supabase_client)):
    response = supabase.table("goals").select("*").eq("deadline", target_date).execute()
    return response.data 