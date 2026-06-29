import os
from typing import Dict, List, Optional, Any
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Generic Tracker API",
    description="Backend de nivel producción para el tracking dinámico de hábitos",
    version="1.0.0"
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Faltan las variables de entorno SUPABASE_URL o SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ==========================================
# ESQUEMAS DE VALIDACIÓN (Pydantic Models)
# ==========================================

class FieldDefinition(BaseModel):
    name: str
    label: str
    type: str  
    required: bool

class HabitDefinitionCreate(BaseModel):
    name: str
    description: Optional[str] = None
    visualization_type: str  
    fields: List[FieldDefinition]

class HabitRecordCreate(BaseModel):
    habit_id: str
    date: str
    data: Dict[str, Any]

# ==========================================
# ENDPOINTS / RUTAS DE LA API
# ==========================================

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}

@app.post("/api/habits", status_code=201)
def create_habit_definition(habit: HabitDefinitionCreate):
    try:
        # Convertimos el modelo Pydantic a diccionario para Supabase
        habit_data = habit.model_dump()
        response = supabase.table("habit_definitions").insert(habit_data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear el hábito: {str(e)}")

@app.get("/api/habits")
def get_all_habit_definitions():
    try:
        response = supabase.table("habit_definitions").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener los hábitos: {str(e)}")

@app.post("/api/records", status_code=201)
def create_habit_record(record: HabitRecordCreate):
    try:
        record_data = record.model_dump()
        response = supabase.table("habit_records").insert(record_data).execute()
        return response.data[0]
    except Exception as e:
        # Capturar el error de índice único si ya existe registro para esa fecha
        if "duplicate key" in str(e).lower():
            raise HTTPException(status_code=400, detail="Ya existe un registro para este hábito en la fecha seleccionada")
        raise HTTPException(status_code=500, detail=f"Error al guardar el registro: {str(e)}")

@app.get("/api/records/{habit_id}")
def get_records_by_habit(habit_id: str):
    try:
        response = supabase.table("habit_records").select("*").eq("habit_id", habit_id).order("date", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener los registros: {str(e)}")
