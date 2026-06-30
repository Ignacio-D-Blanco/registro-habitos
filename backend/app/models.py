from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field

class FieldDefinition(BaseModel):
    name: str
    label: str
    type: str  
    required: bool

class HabitDefinitionCreate(BaseModel):
    name: str
    description: Optional[str] = None
    target_days: int = Field(default=4, ge=1, le=7)
    visualization_type: str  
    fields: List[FieldDefinition]

class HabitRecordCreate(BaseModel):
    habit_id: str
    date: str
    data: Dict[str, Any]

class GoalBase(BaseModel):
    habit_id: str
    deadline: str 
    name: str
    description: Optional[str] = None
    target_value: Optional[float] = None 

class GoalCreate(GoalBase):
    pass