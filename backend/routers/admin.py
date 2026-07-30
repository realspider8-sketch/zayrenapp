from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Dict

try:
    from ..database import get_db
    from ..models import User, Shop, DeliveryOffice, Order, AuditLog, Complaint
    from ..schemas import UserProfileResponse, ShopSchema, DeliveryOfficeSchema, AuditLogSchema, ComplaintSchema
    from ..dependencies import require_permission, get_current_admin
except ImportError:
    from database import get_db
    from models import User, Shop, DeliveryOffice, Order, AuditLog, Complaint
    from schemas import UserProfileResponse, ShopSchema, DeliveryOfficeSchema, AuditLogSchema, ComplaintSchema
    from dependencies import require_permission, get_current_admin

router = APIRouter()

@router.get("/dashboard/stats", response_model=Dict)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Get high-level dashboard metrics for the Admin UI."""
    # Count totals
    total_users = await db.scalar(select(func.count(User.id)))
    active_users = await db.scalar(select(func.count(User.id)).where(User.status == "Active"))
    
    total_shops = await db.scalar(select(func.count(Shop.id)))
    pending_shops = await db.scalar(select(func.count(Shop.id)).where(Shop.status == "Pending"))
    
    total_deliveries = await db.scalar(select(func.count(DeliveryOffice.id)))
    pending_deliveries = await db.scalar(select(func.count(DeliveryOffice.id)).where(DeliveryOffice.status == "Pending"))
    
    total_orders = await db.scalar(select(func.count(Order.id)))
    
    open_complaints = await db.scalar(select(func.count(Complaint.id)).where(Complaint.status == "Open"))
    
    # Can expand this later with more metrics (revenue, etc.)
    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_shops": total_shops,
        "pending_shops": pending_shops,
        "total_delivery_offices": total_deliveries,
        "pending_delivery_offices": pending_deliveries,
        "total_orders": total_orders,
        "open_complaints": open_complaints,
    }

@router.get("/users", response_model=List[UserProfileResponse])
async def list_users(
    skip: int = 0, limit: int = 50,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_permission("users.view"))
):
    """List users for admin management."""
    result = await db.execute(select(User).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/shops", response_model=List[ShopSchema])
async def list_shops(
    skip: int = 0, limit: int = 50,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_permission("shops.view"))
):
    """List shops for admin management."""
    result = await db.execute(select(Shop).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/audit-logs", response_model=List[AuditLogSchema])
async def list_audit_logs(
    skip: int = 0, limit: int = 50,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_permission("settings.manage"))
):
    """List audit logs."""
    result = await db.execute(select(AuditLog).order_by(AuditLog.created_at.desc()).offset(skip).limit(limit))
    return result.scalars().all()
