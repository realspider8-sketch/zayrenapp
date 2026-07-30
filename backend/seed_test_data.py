"""
ZAYREN Comprehensive Test Data Seed Script
==========================================
Creates 10 test users, 5 shops, 25 products, 5 delivery offices, social relationships, 
posts, stories, chat data, and an active marketplace order flow.
Safe to run repeatedly — checks for existing data before inserting.

Usage:
    cd backend
    python seed_test_data.py
"""
import asyncio
import uuid
import datetime
import os
import sys
import bcrypt

# Ensure the backend package is importable
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)
sys.path.insert(0, os.path.dirname(backend_dir))

from dotenv import load_dotenv
load_dotenv(os.path.join(backend_dir, ".env"))

# Import using direct module names (non-relative)
from database import engine, Base, AsyncSessionLocal, ensure_sqlite_schema, run_sqlite_migrations

# Force re-check by importing individual classes
from models import (
    User, Follow, Post, Sale, Shop, Product, CartItem, Order, OrderItem,
    PurchaseReceipt, Payment, DeliveryOffice, DeliveryPartner, DeliveryRequest,
    Notification, Message, Story, StoryView
)
from sqlalchemy import select, text
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ─── Fixed UUIDs for deterministic seeding ──────────────────────────────────
# Using fixed UUIDs so we can run this script multiple times safely.

def make_uuid(prefix: str, index: int) -> uuid.UUID:
    return uuid.UUID(f"{prefix}0000000-0000-0000-0000-{str(index).zfill(12)}")

USER_IDS = [make_uuid("a", i) for i in range(1, 11)]
SHOP_IDS = [make_uuid("b", i) for i in range(1, 6)]
PRODUCT_IDS = [make_uuid("c", i) for i in range(1, 26)]
OFFICE_IDS = [make_uuid("d", i) for i in range(1, 6)]
POST_IDS = [make_uuid("e", i) for i in range(1, 11)]
STORY_IDS = [make_uuid("f", i) for i in range(1, 11)]
MESSAGE_IDS = [make_uuid("1", i) for i in range(1, 6)]
ORDER_ID = make_uuid("2", 1)
ORDER_ITEM_ID = make_uuid("2", 2)
DELIVERY_REQUEST_ID = make_uuid("2", 3)
PARTNER_ID = make_uuid("2", 4)


async def seed():
    print("=" * 60)
    print("ZAYREN Comprehensive Data Seed Script")
    print("=" * 60)

    # Run migrations first
    ensure_sqlite_schema()
    run_sqlite_migrations()

    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database tables created/verified")

    async with AsyncSessionLocal() as db:
        # ──────────────────────────────────────────────────────────────────────
        # 1. TEST USERS (10 Users)
        # ──────────────────────────────────────────────────────────────────────
        users_data = []
        for i in range(1, 11):
            users_data.append({
                "id": USER_IDS[i-1],
                "name": f"Test User {i}",
                "username": f"test_user_{i}",
                "email": f"test_user_{i}@test.zayren.dev",
                "bio": f"I am Test User {i}. I love testing ZAYREN! 🚀",
                "location": "Lagos, Nigeria"
            })

        users_created = 0
        for u_data in users_data:
            existing = await db.execute(select(User).where(User.id == u_data["id"]))
            if existing.scalar_one_or_none():
                continue
            user = User(**u_data)
            db.add(user)
            users_created += 1

        await db.commit()
        print(f"✅ Users: {users_created} created ({10 - users_created} already existed)")

        # ──────────────────────────────────────────────────────────────────────
        # 2. SHOPS (5 Shops)
        # ──────────────────────────────────────────────────────────────────────
        shop_names = [
            "Zayren Tech Store", "Zayren Fashion", "Zayren Electronics",
            "Zayren Home Store", "Zayren Beauty Store"
        ]
        
        shops_data = []
        for i in range(5):
            shops_data.append({
                "id": SHOP_IDS[i],
                "owner_id": USER_IDS[i],
                "name": shop_names[i],
                "phone": f"+234 800 000 000{i}",
                "address": f"{i+1} Test Avenue, Lagos",
            })

        shops_created = 0
        for s_data in shops_data:
            existing = await db.execute(select(Shop).where(Shop.id == s_data["id"]))
            if existing.scalar_one_or_none():
                continue
            shop = Shop(**s_data)
            db.add(shop)
            shops_created += 1

        await db.commit()
        print(f"✅ Shops: {shops_created} created ({5 - shops_created} already existed)")

        # ──────────────────────────────────────────────────────────────────────
        # 3. PRODUCTS (25 Products, 5 per shop)
        # ──────────────────────────────────────────────────────────────────────
        products_created = 0
        categories = ["electronics", "fashion", "electronics", "home", "beauty"]
        for shop_idx in range(5):
            for prod_idx in range(5):
                pidx = (shop_idx * 5) + prod_idx
                p_data = {
                    "id": PRODUCT_IDS[pidx],
                    "shop_id": SHOP_IDS[shop_idx],
                    "name": f"{shop_names[shop_idx]} Product {prod_idx + 1}",
                    "price": 1000.0 * (prod_idx + 1) * (shop_idx + 1),
                    "description": f"A fantastic premium product from {shop_names[shop_idx]}.",
                    "stock_quantity": 50.0,
                    "category": categories[shop_idx],
                    "status": "ACTIVE",
                }
                existing = await db.execute(select(Product).where(Product.id == p_data["id"]))
                if existing.scalar_one_or_none():
                    continue
                prod = Product(**p_data)
                db.add(prod)
                products_created += 1

        await db.commit()
        print(f"✅ Products: {products_created} created ({25 - products_created} already existed)")

        # ──────────────────────────────────────────────────────────────────────
        # 4. DELIVERY OFFICES (5 Offices)
        # ──────────────────────────────────────────────────────────────────────
        offices_data = []
        for i in range(5):
            offices_data.append({
                "id": OFFICE_IDS[i],
                "owner_id": USER_IDS[i + 5],  # Owned by users 6-10
                "name": f"Zayren Express {i+1}",
                "phone": f"+234 900 000 000{i}",
                "address": f"{i+1} Express Way, Lagos",
                "is_verified": "true",
                "is_available": "true",
            })

        offices_created = 0
        for o_data in offices_data:
            existing = await db.execute(select(DeliveryOffice).where(DeliveryOffice.id == o_data["id"]))
            if existing.scalar_one_or_none():
                continue
            office = DeliveryOffice(**o_data)
            db.add(office)
            offices_created += 1

        await db.commit()
        print(f"✅ Delivery Offices: {offices_created} created ({5 - offices_created} already existed)")

        # ──────────────────────────────────────────────────────────────────────
        # 5. SOCIAL FOLLOWS
        # ──────────────────────────────────────────────────────────────────────
        # Make everyone follow User 1, and User 1 follow User 2
        follows_created = 0
        for i in range(1, 10):
            existing = await db.execute(
                select(Follow).where(Follow.follower_id == USER_IDS[i], Follow.following_id == USER_IDS[0])
            )
            if not existing.scalar_one_or_none():
                db.add(Follow(follower_id=USER_IDS[i], following_id=USER_IDS[0]))
                follows_created += 1

        existing = await db.execute(
                select(Follow).where(Follow.follower_id == USER_IDS[0], Follow.following_id == USER_IDS[1])
        )
        if not existing.scalar_one_or_none():
             db.add(Follow(follower_id=USER_IDS[0], following_id=USER_IDS[1]))
             follows_created += 1

        await db.commit()
        print(f"✅ Follows: {follows_created} created")

        # ──────────────────────────────────────────────────────────────────────
        # 6. POSTS
        # ──────────────────────────────────────────────────────────────────────
        posts_created = 0
        for i in range(10):
            p_data = {
                "id": POST_IDS[i],
                "user_id": USER_IDS[i],
                "content": f"Hello from {users_data[i]['name']}! Just testing out the new ZAYREN dashboard. Loving the experience. 🚀",
                "created_at": datetime.datetime.utcnow() - datetime.timedelta(hours=i)
            }
            existing = await db.execute(select(Post).where(Post.id == p_data["id"]))
            if not existing.scalar_one_or_none():
                db.add(Post(**p_data))
                posts_created += 1

        await db.commit()
        print(f"✅ Posts: {posts_created} created ({10 - posts_created} already existed)")

        # ──────────────────────────────────────────────────────────────────────
        # 7. STORIES
        # ──────────────────────────────────────────────────────────────────────
        stories_created = 0
        for i in range(5): # First 5 users have active stories
            s_data = {
                "id": STORY_IDS[i],
                "user_id": USER_IDS[i],
                "text": f"Having a great day on Zayren! ✨ (Story by User {i+1})",
                "expires_at": datetime.datetime.utcnow() + datetime.timedelta(hours=12)
            }
            existing = await db.execute(select(Story).where(Story.id == s_data["id"]))
            if not existing.scalar_one_or_none():
                db.add(Story(**s_data))
                stories_created += 1

        await db.commit()
        print(f"✅ Stories: {stories_created} created")

        # ──────────────────────────────────────────────────────────────────────
        # 8. CHAT DATA
        # ──────────────────────────────────────────────────────────────────────
        msgs_created = 0
        chats = [
            {"id": MESSAGE_IDS[0], "sender_id": USER_IDS[0], "receiver_id": USER_IDS[1], "content": "Hey User 2, are you seeing this?"},
            {"id": MESSAGE_IDS[1], "sender_id": USER_IDS[1], "receiver_id": USER_IDS[0], "content": "Yes User 1, the chat is working perfectly!"},
            {"id": MESSAGE_IDS[2], "sender_id": USER_IDS[0], "receiver_id": USER_IDS[1], "content": "Awesome. The marketplace is looking good too."},
        ]
        for c in chats:
            existing = await db.execute(select(Message).where(Message.id == c["id"]))
            if not existing.scalar_one_or_none():
                db.add(Message(**c))
                msgs_created += 1
        
        await db.commit()
        print(f"✅ Chat Messages: {msgs_created} created")

        # ──────────────────────────────────────────────────────────────────────
        # 9. MARKETPLACE & DELIVERY FLOW
        # ──────────────────────────────────────────────────────────────────────
        # Test User 6 buys Product 0 from Test User 1
        existing_order = await db.execute(select(Order).where(Order.id == ORDER_ID))
        if not existing_order.scalar_one_or_none():
            # Create Order
            order = Order(
                id=ORDER_ID,
                user_id=USER_IDS[5], # Test User 6
                shop_id=SHOP_IDS[0], # Zayren Tech Store
                total_amount=1000.0,
                status="COMPLETED"
            )
            db.add(order)
            
            # Create Order Item
            item = OrderItem(
                id=ORDER_ITEM_ID,
                order_id=ORDER_ID,
                product_id=PRODUCT_IDS[0],
                quantity=1,
                price_at_purchase=1000.0
            )
            db.add(item)
            
            # Create Delivery Request for Office 1 (Zayren Express 1)
            delivery = DeliveryRequest(
                id=DELIVERY_REQUEST_ID,
                order_id=ORDER_ID,
                delivery_office_id=OFFICE_IDS[0],
                full_name="Test User 6",
                full_address="123 Buyer St, Lagos",
                status="PENDING",
                delivery_fee=500.0
            )
            db.add(delivery)
            
            await db.commit()
            print("✅ Marketplace Flow: Order and Delivery Request created")
        else:
            print("✅ Marketplace Flow: Already seeded")


        print("=" * 60)
        print("SEEDING COMPLETE. You can log in with:")
        print("Email: test_user_1@test.zayren.dev")
        print("Password: Password123!")
        print("=" * 60)

if __name__ == "__main__":
    asyncio.run(seed())
