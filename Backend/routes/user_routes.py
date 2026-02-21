"""
Admin-only endpoints for user management.
Lets an admin view all users and change a user's role dynamically.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from database import get_db
import models, schemas, auth
from models import PermissionAction, UserRole

router = APIRouter(prefix="/api/users", tags=["Users"])


class RoleUpdate(BaseModel):
    role: UserRole


@router.get("", response_model=List[schemas.UserOut])
def list_users(
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_permission(PermissionAction.user_manage)),
):
    """Admin only: list all users."""
    return db.query(models.User).all()


@router.patch("/{user_id}/role", response_model=schemas.UserOut)
def change_user_role(
    user_id: int,
    payload: RoleUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_permission(PermissionAction.user_manage)),
):
    """Admin only: change a user's role (dynamic role assignment)."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = payload.role
    db.commit()
    db.refresh(user)
    return user


@router.get("/permissions/{role}")
def get_role_permissions(
    role: UserRole,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_permission(PermissionAction.user_manage)),
):
    """Admin only: see what a role can do."""
    perms = db.query(models.RolePermission).filter(
        models.RolePermission.role == role
    ).all()
    return {"role": role, "permissions": [p.action for p in perms]}


@router.post("/permissions/{role}/{action}")
def grant_permission(
    role: UserRole,
    action: models.PermissionAction,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_permission(PermissionAction.user_manage)),
):
    """Admin only: dynamically grant a permission to a role."""
    existing = db.query(models.RolePermission).filter(
        models.RolePermission.role == role,
        models.RolePermission.action == action,
    ).first()
    if existing:
        return {"message": "Already granted"}
    perm = models.RolePermission(role=role, action=action)
    db.add(perm)
    db.commit()
    return {"message": f"Granted '{action.value}' to role '{role.value}'"}


@router.delete("/permissions/{role}/{action}")
def revoke_permission(
    role: UserRole,
    action: models.PermissionAction,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_permission(PermissionAction.user_manage)),
):
    """Admin only: dynamically revoke a permission from a role."""
    perm = db.query(models.RolePermission).filter(
        models.RolePermission.role == role,
        models.RolePermission.action == action,
    ).first()
    if not perm:
        raise HTTPException(status_code=404, detail="Permission not found")
    db.delete(perm)
    db.commit()
    return {"message": f"Revoked '{action.value}' from role '{role.value}'"}