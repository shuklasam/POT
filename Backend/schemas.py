from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from decimal import Decimal
from datetime import datetime
from models import UserRole



# Auth Schemas
class UserRegister(BaseModel):
    username: str = Field(min_length=3, max_length=50) 
    email: EmailStr
    password: str = Field(min_length=8, max_length=50) # if password will come below 8 characters it will show 422 Unprocessable Entity
    #role: UserRole = UserRole.buyer


class UserLogin(BaseModel):
    email: EmailStr     
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    role: UserRole
    is_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# Product Schemas
class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    cost_price: Decimal
    selling_price: Decimal
    category: Optional[str] = None
    stock_available: int = 0
    units_sold: int = 0
    customer_rating: Optional[Decimal] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    cost_price: Optional[Decimal] = None
    selling_price: Optional[Decimal] = None
    category: Optional[str] = None
    stock_available: Optional[int] = None
    units_sold: Optional[int] = None
    customer_rating: Optional[Decimal] = None


class ProductOut(BaseModel):
    product_id: int
    name: str
    description: Optional[str]
    cost_price: Decimal
    selling_price: Decimal
    category: Optional[str]
    stock_available: int
    units_sold: int
    customer_rating: Optional[Decimal]
    demand_forecast: Optional[Decimal]
    optimized_price: Optional[Decimal]
    created_by: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]
    
    model_config = {"from_attributes": True}


# Forecast & Optimization Schemas 
class ForecastItem(BaseModel):
    product_id: int
    name: str
    category: Optional[str]
    selling_price: Decimal
    demand_forecast: Optional[Decimal]

    model_config = {"from_attributes": True}


class OptimizedItem(BaseModel):
    product_id: int
    name: str
    description: Optional[str]
    category: Optional[str]
    cost_price: Decimal
    selling_price: Decimal
    optimized_price: Optional[Decimal]

    model_config = {"from_attributes": True}