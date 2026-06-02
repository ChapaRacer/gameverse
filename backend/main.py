from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

from db.database import engine, Base
from models import models 
from routers import auth, games

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="GameVerse API",
    description="API para la plataforma de videojuegos GameVerse — Turing IA Prueba Técnica",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_process_time(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    response.headers["X-Process-Time"] = str(round(time.time() - start, 4))
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Error interno del servidor: {str(exc)}"}
    )


app.include_router(auth.router)
app.include_router(games.router)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "GameVerse API funcionando correctamente"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy", "version": "1.0.0"}
