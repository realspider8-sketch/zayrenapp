"""
Development-only API router for ZAYREN.
Provides endpoints for the frontend Dev Tools panel.
DO NOT expose in production.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List

from database import get_db
from models import (
    User, Shop, Product, DeliveryOffice, Order, DeliveryRequest,
    Post, PostLike, PostComment, Follow
)

router = APIRouter()


@router.get("/summary")
async def dev_summary(db: AsyncSession = Depends(get_db)):
    """Returns a full summary of all dev/test data for the Dev Tools panel."""

    # Users
    result = await db.execute(select(User).order_by(User.username))
    all_users = result.scalars().all()
    users_out = []
    for u in all_users:
        # Get follower/following counts
        fc = await db.execute(select(func.count(Follow.id)).where(Follow.following_id == u.id))
        fg = await db.execute(select(func.count(Follow.id)).where(Follow.follower_id == u.id))
        pc = await db.execute(select(func.count(Post.id)).where(Post.user_id == u.id))
        users_out.append({
            "id": str(u.id),
            "username": u.username,
            "name": u.name,
            "email": u.email,
            "bio": u.bio,
            "location": u.location,
            "profile_pic": u.profile_pic,
            "followers_count": fc.scalar() or 0,
            "following_count": fg.scalar() or 0,
            "posts_count": pc.scalar() or 0,
        })

    # Shops
    result = await db.execute(select(Shop).order_by(Shop.name))
    all_shops = result.scalars().all()
    shops_out = []
    for s in all_shops:
        pc = await db.execute(select(func.count(Product.id)).where(Product.shop_id == s.id))
        shops_out.append({
            "id": str(s.id),
            "name": s.name,
            "owner_id": str(s.owner_id) if s.owner_id else None,
            "logo_url": s.logo_url,
            "phone": s.phone,
            "address": s.address,
            "products_count": pc.scalar() or 0,
        })

    # Products
    result = await db.execute(
        select(Product, Shop.name.label("shop_name"))
        .join(Shop, Product.shop_id == Shop.id)
        .order_by(Shop.name, Product.name)
    )
    rows = result.all()
    products_out = []
    for product, shop_name in rows:
        products_out.append({
            "id": str(product.id),
            "name": product.name,
            "price": product.price,
            "category": product.category,
            "stock_quantity": product.stock_quantity,
            "image_url": product.image_url,
            "shop_name": shop_name,
            "status": product.status,
        })

    # Delivery Offices
    result = await db.execute(select(DeliveryOffice).order_by(DeliveryOffice.name))
    all_offices = result.scalars().all()
    offices_out = []
    for o in all_offices:
        offices_out.append({
            "id": str(o.id),
            "name": o.name,
            "owner_id": str(o.owner_id) if o.owner_id else None,
            "phone": o.phone,
            "address": o.address,
            "base_fee": o.base_fee,
            "rating": o.rating,
            "tag": o.tag,
            "is_verified": o.is_verified,
            "is_available": o.is_available,
        })

    # Counts
    total_orders = await db.execute(select(func.count(Order.id)))
    total_deliveries = await db.execute(select(func.count(DeliveryRequest.id)))

    return {
        "users": users_out,
        "shops": shops_out,
        "products": products_out,
        "delivery_offices": offices_out,
        "stats": {
            "total_users": len(users_out),
            "total_shops": len(shops_out),
            "total_products": len(products_out),
            "total_delivery_offices": len(offices_out),
            "total_orders": total_orders.scalar() or 0,
            "total_deliveries": total_deliveries.scalar() or 0,
        }
    }
