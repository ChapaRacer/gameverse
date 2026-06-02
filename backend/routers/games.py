from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import httpx
import os
from dotenv import load_dotenv

from db.database import get_db
from models.models import Game, User
from schemas.schemas import GameCreate, GameOut
from core.security import get_current_user, require_admin

load_dotenv()

router = APIRouter(prefix="/api/games", tags=["Games"])

RAWG_API_KEY = os.getenv("RAWG_API_KEY")
RAWG_BASE = "https://api.rawg.io/api"


@router.get("/rawg/search")
async def search_rawg(
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, le=40)
):
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{RAWG_BASE}/games",
            params={"key": RAWG_API_KEY, "search": q, "page": page, "page_size": page_size}
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Error al consultar RAWG")
    return resp.json()


@router.get("/rawg/popular")
async def popular_games(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, le=40),
    genre: Optional[str] = None,
    ordering: str = "-rating"
):
    params = {
        "key": RAWG_API_KEY,
        "page": page,
        "page_size": page_size,
        "ordering": ordering,
    }
    if genre:
        params["genres"] = genre
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{RAWG_BASE}/games", params=params)
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Error al consultar RAWG")
    return resp.json()


@router.get("/rawg/{rawg_id}")
async def get_rawg_detail(rawg_id: int):
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{RAWG_BASE}/games/{rawg_id}", params={"key": RAWG_API_KEY})
    if resp.status_code != 200:
        raise HTTPException(status_code=404, detail="Juego no encontrado en RAWG")
    return resp.json()


@router.get("/rawg/genres/list")
async def list_genres():
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{RAWG_BASE}/genres", params={"key": RAWG_API_KEY})
    return resp.json()


@router.post("/save", response_model=GameOut, status_code=201)
def save_game(game_data: GameCreate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    existing = db.query(Game).filter(Game.rawg_id == game_data.rawg_id).first()
    if existing:
        return existing
    game = Game(**game_data.model_dump())
    db.add(game)
    db.commit()
    db.refresh(game)
    return game


@router.get("/saved", response_model=List[GameOut])
def list_saved_games(db: Session = Depends(get_db)):
    return db.query(Game).all()


@router.get("/saved/{game_id}", response_model=GameOut)
def get_saved_game(game_id: int, db: Session = Depends(get_db)):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Juego no encontrado")
    return game


@router.put("/saved/{game_id}", response_model=GameOut)
def update_game(game_id: int, data: GameCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Juego no encontrado")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(game, field, value)
    db.commit()
    db.refresh(game)
    return game


@router.delete("/saved/{game_id}", status_code=204)
def delete_game(game_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Juego no encontrado")
    db.delete(game)
    db.commit()