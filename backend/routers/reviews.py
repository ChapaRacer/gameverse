from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from db.database import get_db
from models.models import Review, Game, User
from schemas.schemas import ReviewCreate, ReviewUpdate, ReviewOut
from core.security import get_current_user, require_admin

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])


@router.post("/", response_model=ReviewOut, status_code=201)
def create_review(data: ReviewCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    game = db.query(Game).filter(Game.id == data.game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Juego no encontrado en la base de datos local")
    existing = db.query(Review).filter_by(user_id=current_user.id, game_id=data.game_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya escribiste una reseña para este juego")
    review = Review(user_id=current_user.id, **data.model_dump())
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.get("/", response_model=List[ReviewOut])
def list_reviews(db: Session = Depends(get_db)):
    return db.query(Review).all()


@router.get("/game/{game_id}", response_model=List[ReviewOut])
def reviews_by_game(game_id: int, db: Session = Depends(get_db)):
    return db.query(Review).filter(Review.game_id == game_id).all()


@router.get("/me", response_model=List[ReviewOut])
def my_reviews(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Review).filter(Review.user_id == current_user.id).all()


@router.put("/{review_id}", response_model=ReviewOut)
def update_review(review_id: int, data: ReviewUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Reseña no encontrada")
    if review.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="No tienes permiso para editar esta reseña")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(review, field, value)
    db.commit()
    db.refresh(review)
    return review


@router.delete("/{review_id}", status_code=204)
def delete_review(review_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Reseña no encontrada")
    if review.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar esta reseña")
    db.delete(review)
    db.commit()
