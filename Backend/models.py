from sqlalchemy import Column, Integer, String, Text, Numeric, Boolean, TIMESTAMP, ForeignKey, Enum, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base


# ── Enums
class UserRole(str, enum.Enum):
    admin    = "admin"
    buyer    = "buyer"
    supplier = "supplier"
    custom   = "custom"


class PermissionAction(str, enum.Enum):
    """Every discrete action a user can perform in the system."""
    product_create = "product_create"
    product_read   = "product_read"
    product_update = "product_update"
    product_delete = "product_delete"
    forecast_view  = "forecast_view"
    optimize_view  = "optimize_view"
    user_manage    = "user_manage"  # admin-only: change other users' roles


# ── Tables

class RolePermission(Base):
    """
    Maps a role to an allowed action.
    One row per (role, action) pair.

    Why a table (not hardcoded)?
    - An admin can INSERT a new row to grant 'custom' role any permission
    - We can revoke permissions without a code deploy
    - Satisfies the 'dynamic role assignment' requirement in the problem statement
    """
    __tablename__ = "role_permissions"
    __table_args__ = (UniqueConstraint("role", "action", name="uq_role_action"),)

    id     = Column(Integer, primary_key=True)
    role   = Column(Enum(UserRole), nullable=False, index=True)
    action = Column(Enum(PermissionAction), nullable=False)


class User(Base):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True)
    username        = Column(String(100), nullable=False)
    email           = Column(String(150), unique=True, nullable=False, index=True)
    hashed_password = Column(Text, nullable=False)
    role            = Column(Enum(UserRole), default=UserRole.buyer, nullable=False)
    is_verified     = Column(Boolean, default=False)
    created_at      = Column(TIMESTAMP, server_default=func.now())

    products = relationship("Product", back_populates="creator")


class Product(Base):
    __tablename__ = "products"

    product_id      = Column(Integer, primary_key=True, index=True)
    name            = Column(String(200), nullable=False, index=True)
    description     = Column(Text)
    cost_price      = Column(Numeric(10, 2), nullable=False)
    selling_price   = Column(Numeric(10, 2), nullable=False)
    category        = Column(String(100), index=True)
    stock_available = Column(Integer, default=0)
    units_sold      = Column(Integer, default=0)
    customer_rating = Column(Numeric(3, 2))
    demand_forecast = Column(Numeric(12, 2))
    optimized_price = Column(Numeric(10, 2))
    created_by      = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at      = Column(TIMESTAMP, server_default=func.now())
    updated_at      = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    creator = relationship("User", back_populates="products")