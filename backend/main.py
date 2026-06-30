from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import habits, records, goals

app = FastAPI(title="Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(habits.router, prefix="/api/habits", tags=["habits"])
app.include_router(records.router, prefix="/api/records", tags=["records"])
app.include_router(goals.router, prefix="/api/goals", tags=["goals"])


@app.get("/")
def read_root():
    return {"status": "online", "message": "API de Seguimiento de Hábitos funcionando"}