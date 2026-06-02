from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# Autenticación y Usuarios
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None
    role: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


# Juegos
class GameCreate(BaseModel):
    rawg_id: int
    name: str
    slug: str
    background_image: Optional[str] = None
    rating: Optional[float] = 0.0
    released: Optional[str] = None
    genres: Optional[str] = None
    platforms: Optional[str] = None
    description: Optional[str] = None


class GameOut(BaseModel):
    id: int
    rawg_id: int
    name: str
    slug: str
    background_image: Optional[str]
    rating: float
    released: Optional[str]
    genres: Optional[str]
    platforms: Optional[str]
    description: Optional[str]
    added_at: datetime

    class Config:
        from_attributes = True