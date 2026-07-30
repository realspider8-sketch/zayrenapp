"""
ZAYREN Complete Development Seed Script
=======================================
Generates exactly:
- 10 test users
- 5 shops
- 14 products
- 5 delivery offices & 5 delivery partners
- Social Data (Follows, Posts, Comments)
- Chat Data (Messages)
- Mock Marketplace purchase flow
- Mock Delivery flow
- Notifications
"""
import asyncio
import uuid
import datetime
import os
import sys

# Ensure the backend package is importable
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)
sys.path.insert(0, os.path.dirname(backend_dir))

from dotenv import load_dotenv
load_dotenv(os.path.join(backend_dir, ".env"))

from database import engine, Base, AsyncSessionLocal, ensure_sqlite_schema, run_sqlite_migrations
from models import (
    User, Follow, Post, Sale, Shop, Product, CartItem, Order, OrderItem,
    PurchaseReceipt, Payment, DeliveryOffice, DeliveryPartner, DeliveryRequest,
    Notification, Message,
)
from sqlalchemy import select, text

# Fixed UUIDs
USERS = {
    "arfat":   uuid.UUID("a0000000-0000-0000-0000-000000000001"),
    "amara":   uuid.UUID("a0000000-0000-0000-0000-000000000002"),
    "musa":    uuid.UUID("a0000000-0000-0000-0000-000000000003"),
    "aisha":   uuid.UUID("a0000000-0000-0000-0000-000000000004"),
    "express": uuid.UUID("a0000000-0000-0000-0000-000000000005"),
    "ibrahim": uuid.UUID("a0000000-0000-0000-0000-000000000006"),
    "fatima":  uuid.UUID("a0000000-0000-0000-0000-000000000007"),
    "bello":   uuid.UUID("a0000000-0000-0000-0000-000000000008"),
    "zainab":  uuid.UUID("a0000000-0000-0000-0000-000000000009"),
    "umar":    uuid.UUID("a0000000-0000-0000-0000-000000000010"),
}

SHOPS = {
    "amara":  uuid.UUID("b0000000-0000-0000-0000-000000000001"),
    "aisha":  uuid.UUID("b0000000-0000-0000-0000-000000000002"),
    "bello":  uuid.UUID("b0000000-0000-0000-0000-000000000003"),
    "zainab": uuid.UUID("b0000000-0000-0000-0000-000000000004"),
    "umar":   uuid.UUID("b0000000-0000-0000-0000-000000000005"),
}

OFFICES = {
    "central": uuid.UUID("d0000000-0000-0000-0000-000000000001"),
    "quick":   uuid.UUID("d0000000-0000-0000-0000-000000000002"),
    "north":   uuid.UUID("d0000000-0000-0000-0000-000000000003"),
    "city":    uuid.UUID("d0000000-0000-0000-0000-000000000004"),
    "fast":    uuid.UUID("d0000000-0000-0000-0000-000000000005"),
}

PRODUCTS = {
    "neon_hoodie": uuid.UUID("c0000000-0000-0000-0000-000000000001"),
}

FLOW_IDS = {
    "payment": uuid.UUID("f0000000-0000-0000-0000-000000000001"),
    "order": uuid.UUID("f0000000-0000-0000-0000-000000000002"),
    "receipt": uuid.UUID("f0000000-0000-0000-0000-000000000003"),
    "delivery": uuid.UUID("f0000000-0000-0000-0000-000000000004"),
}

async def clear_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("🧹 Database wiped and recreated.")

async def seed():
    print("=" * 60)
    print("ZAYREN COMPLETE TEST ENVIRONMENT SEED")
    print("=" * 60)

    # 1. Clear database completely to prevent duplicates
    await clear_db()

    async with AsyncSessionLocal() as db:
        
        # ─── 1. USERS ───
        users_data = [
            {"id": USERS["arfat"], "name": "Arfat Test", "username": "arfat_test", "email": "arfat.test@zayren.test", "bio": "Customer", "location": "Lagos"},
            {"id": USERS["amara"], "name": "Amara Test", "username": "amara_shop", "email": "amara.test@zayren.test", "bio": "Shop Owner", "location": "Abuja"},
            {"id": USERS["musa"], "name": "Musa Test", "username": "musa_test", "email": "musa.test@zayren.test", "bio": "Customer", "location": "Kano"},
            {"id": USERS["aisha"], "name": "Aisha Test", "username": "aisha_shop", "email": "aisha.test@zayren.test", "bio": "Shop Owner", "location": "Port Harcourt"},
            {"id": USERS["express"], "name": "Zayren Express Owner", "username": "express_owner", "email": "express.owner@zayren.test", "bio": "Delivery", "location": "Lagos"},
            {"id": USERS["ibrahim"], "name": "Ibrahim Test", "username": "ibrahim_driver", "email": "ibrahim.driver@zayren.test", "bio": "Driver", "location": "Lagos"},
            {"id": USERS["fatima"], "name": "Fatima Test", "username": "fatima_test", "email": "fatima.test@zayren.test", "bio": "Customer", "location": "Ibadan"},
            {"id": USERS["bello"], "name": "Bello Test", "username": "bello_test", "email": "bello.test@zayren.test", "bio": "Customer", "location": "Kaduna"},
            {"id": USERS["zainab"], "name": "Zainab Test", "username": "zainab_test", "email": "zainab.test@zayren.test", "bio": "Customer", "location": "Enugu"},
            {"id": USERS["umar"], "name": "Umar Test", "username": "umar_test", "email": "umar.test@zayren.test", "bio": "Customer", "location": "Jos"},
        ]
        
        for u in users_data:
            db.add(User(**u))
        await db.commit()
        print("✅ 10 Test Users created.")

        # ─── 2. SHOPS ───
        shops_data = [
            {"id": SHOPS["amara"], "owner_id": USERS["amara"], "name": "Amara Creates", "address": "Abuja"},
            {"id": SHOPS["aisha"], "owner_id": USERS["aisha"], "name": "Aisha Fashion", "address": "Port Harcourt"},
            {"id": SHOPS["bello"], "owner_id": USERS["bello"], "name": "Bello Tech Store", "address": "Kaduna"},
            {"id": SHOPS["zainab"], "owner_id": USERS["zainab"], "name": "Zainab Beauty", "address": "Enugu"},
            {"id": SHOPS["umar"], "owner_id": USERS["umar"], "name": "Umar Home Store", "address": "Jos"},
        ]
        
        for s in shops_data:
            db.add(Shop(**s))
        await db.commit()
        print("✅ 5 Shops created.")

        # ─── 3. PRODUCTS ───
        products_data = [
            # Amara Creates
            {"id": PRODUCTS["neon_hoodie"], "shop_id": SHOPS["amara"], "name": "Neon Hoodie", "price": 15000.0, "stock_quantity": 50},
            {"id": uuid.uuid4(), "shop_id": SHOPS["amara"], "name": "Wireless Headphones", "price": 25000.0, "stock_quantity": 20},
            {"id": uuid.uuid4(), "shop_id": SHOPS["amara"], "name": "Phone Case", "price": 5000.0, "stock_quantity": 100},
            
            # Aisha Fashion
            {"id": uuid.uuid4(), "shop_id": SHOPS["aisha"], "name": "Black Sneakers", "price": 35000.0, "stock_quantity": 15},
            {"id": uuid.uuid4(), "shop_id": SHOPS["aisha"], "name": "Classic T-Shirt", "price": 8000.0, "stock_quantity": 40},
            {"id": uuid.uuid4(), "shop_id": SHOPS["aisha"], "name": "Denim Jacket", "price": 28000.0, "stock_quantity": 10},
            
            # Bello Tech Store
            {"id": uuid.uuid4(), "shop_id": SHOPS["bello"], "name": "Mechanical Keyboard", "price": 45000.0, "stock_quantity": 5},
            {"id": uuid.uuid4(), "shop_id": SHOPS["bello"], "name": "Wireless Mouse", "price": 12000.0, "stock_quantity": 25},
            {"id": uuid.uuid4(), "shop_id": SHOPS["bello"], "name": "USB-C Hub", "price": 18000.0, "stock_quantity": 30},
            
            # Zainab Beauty
            {"id": uuid.uuid4(), "shop_id": SHOPS["zainab"], "name": "Face Cream", "price": 9000.0, "stock_quantity": 50},
            {"id": uuid.uuid4(), "shop_id": SHOPS["zainab"], "name": "Perfume", "price": 18000.0, "stock_quantity": 20},
            {"id": uuid.uuid4(), "shop_id": SHOPS["zainab"], "name": "Hair Care Set", "price": 22000.0, "stock_quantity": 15},
            
            # Umar Home Store
            {"id": uuid.uuid4(), "shop_id": SHOPS["umar"], "name": "Table Lamp", "price": 12000.0, "stock_quantity": 10},
            {"id": uuid.uuid4(), "shop_id": SHOPS["umar"], "name": "Backpack", "price": 20000.0, "stock_quantity": 35},
            {"id": uuid.uuid4(), "shop_id": SHOPS["umar"], "name": "Water Bottle", "price": 6000.0, "stock_quantity": 80},
        ]
        
        for p in products_data:
            db.add(Product(**p))
        await db.commit()
        print(f"✅ {len(products_data)} Products created.")

        # ─── 4. DELIVERY OFFICES ───
        offices_data = [
            {"id": OFFICES["central"], "owner_id": USERS["express"], "name": "ZAYREN Express Central", "base_fee": 1500, "is_verified": "true"},
            {"id": OFFICES["quick"], "owner_id": USERS["express"], "name": "ZAYREN Quick Delivery", "base_fee": 1000, "is_verified": "true"},
            {"id": OFFICES["north"], "owner_id": USERS["express"], "name": "ZAYREN North Delivery", "base_fee": 2500, "is_verified": "true"},
            {"id": OFFICES["city"], "owner_id": USERS["express"], "name": "ZAYREN City Logistics", "base_fee": 2000, "is_verified": "true"},
            {"id": OFFICES["fast"], "owner_id": USERS["express"], "name": "ZAYREN Fast Route", "base_fee": 1800, "is_verified": "true"},
        ]
        
        for o in offices_data:
            db.add(DeliveryOffice(**o))
            
        partners_data = [
            {"office_id": OFFICES["central"], "user_id": USERS["ibrahim"], "name": "Ibrahim Driver", "phone": "08012345678"},
            {"office_id": OFFICES["quick"], "name": "Sani Driver", "phone": "08012345679"},
            {"office_id": OFFICES["north"], "name": "Musa Driver", "phone": "08012345680"},
            {"office_id": OFFICES["city"], "name": "Ahmed Driver", "phone": "08012345681"},
            {"office_id": OFFICES["fast"], "name": "Tunde Driver", "phone": "08012345682"},
        ]
        
        for p in partners_data:
            db.add(DeliveryPartner(**p))
        await db.commit()
        print("✅ 5 Delivery Offices and 5 Partners created.")

        # ─── 5. SOCIAL DATA ───
        db.add(Follow(follower_id=USERS["arfat"], following_id=USERS["amara"]))
        db.add(Follow(follower_id=USERS["musa"], following_id=USERS["arfat"]))
        
        db.add(Post(user_id=USERS["amara"], content="Neon Hoodie back in stock!"))
        db.add(Post(user_id=USERS["arfat"], content="Just placed an order!"))
        await db.commit()
        print("✅ Social Data created.")

        # ─── 6. CHAT DATA ───
        msgs = [
            # Arfat ↔ Amara
            {"sender_id": USERS["arfat"], "receiver_id": USERS["amara"], "content": "Hi, is the Neon Hoodie true to size?"},
            {"sender_id": USERS["amara"], "receiver_id": USERS["arfat"], "content": "Yes, it is true to size!"},
            # Customer ↔ Delivery Office
            {"sender_id": USERS["arfat"], "receiver_id": USERS["express"], "content": "I requested delivery, please confirm."},
        ]
        for m in msgs:
            db.add(Message(**m))
        await db.commit()
        print("✅ Chat Data created.")

        # ─── 7. MARKETPLACE PURCHASE FLOW ───
        db.add(Payment(id=FLOW_IDS["payment"], user_id=USERS["arfat"], amount=15000, status="VERIFIED"))
        db.add(Order(id=FLOW_IDS["order"], user_id=USERS["arfat"], shop_id=SHOPS["amara"], total_amount=15000, status="PAID", payment_id=FLOW_IDS["payment"]))
        db.add(OrderItem(order_id=FLOW_IDS["order"], product_id=PRODUCTS["neon_hoodie"], quantity=1, price_at_purchase=15000))
        db.add(PurchaseReceipt(id=FLOW_IDS["receipt"], order_id=FLOW_IDS["order"], shop_id=SHOPS["amara"], user_id=USERS["arfat"], receipt_number="ZRN-TEST-001", total_amount=15000, total_items=1, payment_id=FLOW_IDS["payment"]))
        await db.commit()
        print("✅ Marketplace Purchase Flow created.")

        # ─── 8. DELIVERY FLOW ───
        db.add(DeliveryRequest(
            id=FLOW_IDS["delivery"],
            order_id=FLOW_IDS["order"],
            delivery_office_id=OFFICES["central"],
            receipt_id=FLOW_IDS["receipt"],
            full_name="Arfat Test",
            full_address="123 Test Avenue",
            delivery_fee=1500,
            status="DELIVERED"
        ))
        await db.commit()
        print("✅ Delivery Flow created.")

        # ─── 9. NOTIFICATIONS ───
        notifs = [
            {"user_id": USERS["amara"], "type": "follow", "title": "New Follower", "body": "Arfat is now following you."},
            {"user_id": USERS["amara"], "type": "order", "title": "New Order", "body": "You have a new order for Neon Hoodie."},
            {"user_id": USERS["arfat"], "type": "delivery", "title": "Delivery Complete", "body": "Your order was successfully delivered."},
        ]
        for n in notifs:
            db.add(Notification(**n))
        await db.commit()
        print("✅ Notifications created.")

        print()
        print("🎉 ALL DATA SEEDED SUCCESSFULLY.")

if __name__ == "__main__":
    asyncio.run(seed())
