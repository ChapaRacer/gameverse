from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(10), default="user")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    reviews = relationship("Review", back_populates="author", cascade="all, delete")
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete")


class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    rawg_id = Column(Integer, unique=True, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, nullable=False)
    background_image = Column(String(500))
    rating = Column(Float, default=0.0)
    released = Column(String(20))
    genres = Column(String(300))
    platforms = Column(String(500))
    description = Column(Text)
    added_at = Column(DateTime, default=datetime.utcnow)
    reviews = relationship("Review", back_populates="game", cascade="all, delete")
    favorites = relationship("Favorite", back_populates="game", cascade="all, delete")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    rating = Column(Float, nullable=False)
    comment = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    author = relationship("User", back_populates="reviews")
    game = relationship("Game", back_populates="reviews")


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    added_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="favorites")
    game = relationship("Game", back_populates="favorites")