"""
ZAYREN Development Seed Script
================================
Creates a complete development/testing environment:
- 10 test users
- 5 shops (owned by users 1-5)
- 25 products (5 per shop)
- 5 delivery offices (owned by users 6-10)

Safe to run repeatedly - checks for existing records before creating.

Development Password: TestPassword123!
Run: python backend/seed_development_data.py
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
    User, Follow, Post, PostLike, PostComment, PostShare,
    Shop, Product, DeliveryOffice, DeliveryPartner,
    Order, OrderItem, Payment, PurchaseReceipt, DeliveryRequest,
    Notification, Message,
)
from sqlalchemy import select, func

# ============================================================
# FIXED UUIDs for deterministic, repeatable seeding
# ============================================================
USER_IDS = {
    1:  uuid.UUID("10000000-0000-0000-0000-000000000001"),
    2:  uuid.UUID("10000000-0000-0000-0000-000000000002"),
    3:  uuid.UUID("10000000-0000-0000-0000-000000000003"),
    4:  uuid.UUID("10000000-0000-0000-0000-000000000004"),
    5:  uuid.UUID("10000000-0000-0000-0000-000000000005"),
    6:  uuid.UUID("10000000-0000-0000-0000-000000000006"),
    7:  uuid.UUID("10000000-0000-0000-0000-000000000007"),
    8:  uuid.UUID("10000000-0000-0000-0000-000000000008"),
    9:  uuid.UUID("10000000-0000-0000-0000-000000000009"),
    10: uuid.UUID("10000000-0000-0000-0000-000000000010"),
}

SHOP_IDS = {
    1: uuid.UUID("20000000-0000-0000-0000-000000000001"),
    2: uuid.UUID("20000000-0000-0000-0000-000000000002"),
    3: uuid.UUID("20000000-0000-0000-0000-000000000003"),
    4: uuid.UUID("20000000-0000-0000-0000-000000000004"),
    5: uuid.UUID("20000000-0000-0000-0000-000000000005"),
}

OFFICE_IDS = {
    1: uuid.UUID("30000000-0000-0000-0000-000000000001"),
    2: uuid.UUID("30000000-0000-0000-0000-000000000002"),
    3: uuid.UUID("30000000-0000-0000-0000-000000000003"),
    4: uuid.UUID("30000000-0000-0000-0000-000000000004"),
    5: uuid.UUID("30000000-0000-0000-0000-000000000005"),
}

# Dev password for all test users
DEV_PASSWORD = "TestPassword123!"

# ============================================================
# USER DATA
# ============================================================
USER_DATA = [
    {
        "id": USER_IDS[1], "username": "test_user_1", "email": "test_user_1@zayren.dev",
        "name": "Test User 1", "bio": "Tech enthusiast & shop owner. Building the future with ZAYREN.",
        "location": "Lagos, Nigeria", "profile_pic": "https://i.pravatar.cc/150?u=test1"
    },
    {
        "id": USER_IDS[2], "username": "test_user_2", "email": "test_user_2@zayren.dev",
        "name": "Test User 2", "bio": "Fashion designer. Style is everything.",
        "location": "Abuja, Nigeria", "profile_pic": "https://i.pravatar.cc/150?u=test2"
    },
    {
        "id": USER_IDS[3], "username": "test_user_3", "email": "test_user_3@zayren.dev",
        "name": "Test User 3", "bio": "Electronics expert. Gadgets are my life.",
        "location": "Port Harcourt, Nigeria", "profile_pic": "https://i.pravatar.cc/150?u=test3"
    },
    {
        "id": USER_IDS[4], "username": "test_user_4", "email": "test_user_4@zayren.dev",
        "name": "Test User 4", "bio": "Home decor lover. Making spaces beautiful.",
        "location": "Kano, Nigeria", "profile_pic": "https://i.pravatar.cc/150?u=test4"
    },
    {
        "id": USER_IDS[5], "username": "test_user_5", "email": "test_user_5@zayren.dev",
        "name": "Test User 5", "bio": "Beauty & skincare specialist.",
        "location": "Ibadan, Nigeria", "profile_pic": "https://i.pravatar.cc/150?u=test5"
    },
    {
        "id": USER_IDS[6], "username": "test_user_6", "email": "test_user_6@zayren.dev",
        "name": "Test User 6", "bio": "Delivery pro. Getting packages where they need to go.",
        "location": "Lagos, Nigeria", "profile_pic": "https://i.pravatar.cc/150?u=test6"
    },
    {
        "id": USER_IDS[7], "username": "test_user_7", "email": "test_user_7@zayren.dev",
        "name": "Test User 7", "bio": "Express delivery manager. Speed is key.",
        "location": "Abuja, Nigeria", "profile_pic": "https://i.pravatar.cc/150?u=test7"
    },
    {
        "id": USER_IDS[8], "username": "test_user_8", "email": "test_user_8@zayren.dev",
        "name": "Test User 8", "bio": "Logistics coordinator & delivery expert.",
        "location": "Enugu, Nigeria", "profile_pic": "https://i.pravatar.cc/150?u=test8"
    },
    {
        "id": USER_IDS[9], "username": "test_user_9", "email": "test_user_9@zayren.dev",
        "name": "Test User 9", "bio": "Last-mile delivery specialist.",
        "location": "Kaduna, Nigeria", "profile_pic": "https://i.pravatar.cc/150?u=test9"
    },
    {
        "id": USER_IDS[10], "username": "test_user_10", "email": "test_user_10@zayren.dev",
        "name": "Test User 10", "bio": "Dispatch rider & courier service manager.",
        "location": "Benin City, Nigeria", "profile_pic": "https://i.pravatar.cc/150?u=test10"
    },
]

# ============================================================
# SHOP DATA
# ============================================================
SHOP_DATA = [
    {
        "id": SHOP_IDS[1], "owner_idx": 1, "name": "Zayren Tech Store",
        "logo_url": "https://picsum.photos/seed/ZayrenTech/200",
        "phone": "+2348001000001", "address": "15 Tech Avenue, Lagos"
    },
    {
        "id": SHOP_IDS[2], "owner_idx": 2, "name": "Zayren Fashion",
        "logo_url": "https://picsum.photos/seed/ZayrenFashion/200",
        "phone": "+2348001000002", "address": "22 Style Street, Abuja"
    },
    {
        "id": SHOP_IDS[3], "owner_idx": 3, "name": "Zayren Electronics",
        "logo_url": "https://picsum.photos/seed/ZayrenElectronics/200",
        "phone": "+2348001000003", "address": "8 Gadget Road, Port Harcourt"
    },
    {
        "id": SHOP_IDS[4], "owner_idx": 4, "name": "Zayren Home Store",
        "logo_url": "https://picsum.photos/seed/ZayrenHome/200",
        "phone": "+2348001000004", "address": "31 Comfort Lane, Kano"
    },
    {
        "id": SHOP_IDS[5], "owner_idx": 5, "name": "Zayren Beauty Store",
        "logo_url": "https://picsum.photos/seed/ZayrenBeauty/200",
        "phone": "+2348001000005", "address": "5 Glow Crescent, Ibadan"
    },
]

# ============================================================
# PRODUCT DATA (5 per shop = 25 total)
# ============================================================
PRODUCT_DATA = {
    1: [  # Zayren Tech Store
        {"name": "Wireless Bluetooth Earbuds", "price": 12500, "desc": "Premium wireless earbuds with noise cancellation and 24hr battery life.", "category": "Electronics", "stock": 150, "img": "https://picsum.photos/seed/earbuds/400"},
        {"name": "USB-C Fast Charger 65W", "price": 8900, "desc": "GaN fast charger supporting USB-C PD 3.0 for laptops and phones.", "category": "Electronics", "stock": 200, "img": "https://picsum.photos/seed/charger65w/400"},
        {"name": "Mechanical Gaming Keyboard", "price": 25000, "desc": "RGB mechanical keyboard with Cherry MX switches and aluminum frame.", "category": "Electronics", "stock": 75, "img": "https://picsum.photos/seed/keyboard/400"},
        {"name": "Smart Watch Pro", "price": 35000, "desc": "Fitness tracker with heart rate, SpO2, GPS and 7-day battery.", "category": "Electronics", "stock": 100, "img": "https://picsum.photos/seed/smartwatch/400"},
        {"name": "Portable Power Bank 20000mAh", "price": 15000, "desc": "Slim power bank with dual USB-C ports and LED display.", "category": "Electronics", "stock": 300, "img": "https://picsum.photos/seed/powerbank/400"},
    ],
    2: [  # Zayren Fashion
        {"name": "Premium Cotton T-Shirt", "price": 5500, "desc": "Soft 100% cotton tee available in multiple colors. Unisex fit.", "category": "Fashion", "stock": 500, "img": "https://picsum.photos/seed/tshirt/400"},
        {"name": "Slim Fit Denim Jeans", "price": 12000, "desc": "Stretch denim jeans with a modern slim fit. Dark wash.", "category": "Fashion", "stock": 200, "img": "https://picsum.photos/seed/jeans/400"},
        {"name": "Leather Crossbody Bag", "price": 18000, "desc": "Genuine leather crossbody bag with adjustable strap.", "category": "Fashion", "stock": 80, "img": "https://picsum.photos/seed/leatherbag/400"},
        {"name": "Sneakers - Urban Edition", "price": 22000, "desc": "Lightweight urban sneakers with memory foam insoles.", "category": "Fashion", "stock": 120, "img": "https://picsum.photos/seed/sneakers/400"},
        {"name": "Silk Scarf Collection", "price": 7500, "desc": "Luxury silk scarves with hand-printed African patterns.", "category": "Fashion", "stock": 150, "img": "https://picsum.photos/seed/scarf/400"},
    ],
    3: [  # Zayren Electronics
        {"name": "Wireless Mouse Pro", "price": 6500, "desc": "Ergonomic wireless mouse with 4000 DPI and silent clicks.", "category": "Electronics", "stock": 250, "img": "https://picsum.photos/seed/mouse/400"},
        {"name": "4K Webcam", "price": 18000, "desc": "Ultra HD webcam with auto-focus and built-in ring light.", "category": "Electronics", "stock": 90, "img": "https://picsum.photos/seed/webcam/400"},
        {"name": "Bluetooth Speaker 30W", "price": 14000, "desc": "Waterproof Bluetooth speaker with 360-degree surround sound.", "category": "Electronics", "stock": 180, "img": "https://picsum.photos/seed/speaker/400"},
        {"name": "USB Hub 7-Port", "price": 9500, "desc": "Aluminum USB 3.0 hub with 7 ports and individual switches.", "category": "Electronics", "stock": 300, "img": "https://picsum.photos/seed/usbhub/400"},
        {"name": "LED Desk Lamp Smart", "price": 11000, "desc": "Touch-controlled LED desk lamp with wireless charging base.", "category": "Electronics", "stock": 140, "img": "https://picsum.photos/seed/desklamp/400"},
    ],
    4: [  # Zayren Home Store
        {"name": "Memory Foam Pillow Set", "price": 9800, "desc": "Pack of 2 cooling gel memory foam pillows for better sleep.", "category": "Home", "stock": 200, "img": "https://picsum.photos/seed/pillow/400"},
        {"name": "Stainless Steel Cookware Set", "price": 28000, "desc": "5-piece stainless steel cookware set with glass lids.", "category": "Home", "stock": 60, "img": "https://picsum.photos/seed/cookware/400"},
        {"name": "Smart LED Bulb 4-Pack", "price": 6000, "desc": "WiFi-enabled color-changing LED bulbs. Works with Alexa.", "category": "Home", "stock": 400, "img": "https://picsum.photos/seed/ledbulb/400"},
        {"name": "Bamboo Bathroom Organizer", "price": 7500, "desc": "Natural bamboo organizer with 3 tiers for bathroom essentials.", "category": "Home", "stock": 150, "img": "https://picsum.photos/seed/organizer/400"},
        {"name": "Luxury Scented Candle Set", "price": 4500, "desc": "Set of 3 soy wax candles with lavender, vanilla, and jasmine.", "category": "Home", "stock": 350, "img": "https://picsum.photos/seed/candles/400"},
    ],
    5: [  # Zayren Beauty Store
        {"name": "Vitamin C Serum 30ml", "price": 8500, "desc": "Brightening vitamin C serum with hyaluronic acid.", "category": "Beauty", "stock": 200, "img": "https://picsum.photos/seed/serum/400"},
        {"name": "Natural Hair Oil Blend", "price": 5000, "desc": "Organic blend of argan, coconut, and jojoba oils for hair growth.", "category": "Beauty", "stock": 300, "img": "https://picsum.photos/seed/hairoil/400"},
        {"name": "Matte Lipstick Collection", "price": 6500, "desc": "Set of 6 long-lasting matte lipsticks in African-inspired shades.", "category": "Beauty", "stock": 180, "img": "https://picsum.photos/seed/lipstick/400"},
        {"name": "Shea Butter Body Lotion", "price": 3500, "desc": "Rich moisturizing body lotion made with pure shea butter.", "category": "Beauty", "stock": 400, "img": "https://picsum.photos/seed/bodylotion/400"},
        {"name": "Charcoal Face Mask Kit", "price": 4000, "desc": "Detoxifying charcoal mask kit with applicator brush.", "category": "Beauty", "stock": 250, "img": "https://picsum.photos/seed/facemask/400"},
    ],
}

# ============================================================
# DELIVERY OFFICE DATA
# ============================================================
OFFICE_DATA = [
    {
        "id": OFFICE_IDS[1], "owner_idx": 6, "name": "Zayren Express 1",
        "phone": "+2349001000001", "whatsapp": "+2349001000001",
        "address": "10 Dispatch Road, Lagos",
        "base_fee": 1500, "tag": "Fastest", "rating": 4.8
    },
    {
        "id": OFFICE_IDS[2], "owner_idx": 7, "name": "Zayren Express 2",
        "phone": "+2349001000002", "whatsapp": "+2349001000002",
        "address": "25 Courier Avenue, Abuja",
        "base_fee": 1200, "tag": "Affordable", "rating": 4.5
    },
    {
        "id": OFFICE_IDS[3], "owner_idx": 8, "name": "Zayren Express 3",
        "phone": "+2349001000003", "whatsapp": "+2349001000003",
        "address": "7 Logistics Street, Enugu",
        "base_fee": 1800, "tag": "Reliable", "rating": 4.9
    },
    {
        "id": OFFICE_IDS[4], "owner_idx": 9, "name": "Zayren Express 4",
        "phone": "+2349001000004", "whatsapp": "+2349001000004",
        "address": "14 Express Way, Kaduna",
        "base_fee": 1000, "tag": "Budget", "rating": 4.3
    },
    {
        "id": OFFICE_IDS[5], "owner_idx": 10, "name": "Zayren Express 5",
        "phone": "+2349001000005", "whatsapp": "+2349001000005",
        "address": "3 Speed Lane, Benin City",
        "base_fee": 2000, "tag": "Premium", "rating": 4.7
    },
]


# ============================================================
# MAIN SEED FUNCTION
# ============================================================
async def seed():
    # Ensure schema compatibility
    ensure_sqlite_schema()
    run_sqlite_migrations()

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        print("=" * 60)
        print("  ZAYREN Development Seed Script")
        print("=" * 60)

        # ---- 1. USERS ----
        print("\n[ ] Seeding 10 Test Users...")
        users = {}
        for ud in USER_DATA:
            result = await db.execute(select(User).where(User.username == ud["username"]))
            existing = result.scalars().first()
            if existing:
                print(f"   [OK] {ud['username']} already exists (ID: {existing.id})")
                users[ud["username"]] = existing
            else:
                new_user = User(
                    id=ud["id"],
                    username=ud["username"],
                    email=ud["email"],
                    name=ud["name"],
                    bio=ud["bio"],
                    location=ud["location"],
                    profile_pic=ud["profile_pic"],
                )
                db.add(new_user)
                users[ud["username"]] = new_user
                print(f"   [+] Created {ud['username']} (ID: {ud['id']})")
        await db.commit()

        # ---- 2. SHOPS ----
        print("\n[ ] Seeding 5 Test Shops...")
        shops = {}
        for sd in SHOP_DATA:
            result = await db.execute(select(Shop).where(Shop.name == sd["name"]))
            existing = result.scalars().first()
            if existing:
                print(f"   [OK] {sd['name']} already exists")
                shops[sd["name"]] = existing
            else:
                owner = users[f"test_user_{sd['owner_idx']}"]
                new_shop = Shop(
                    id=sd["id"],
                    owner_id=owner.id,
                    name=sd["name"],
                    logo_url=sd["logo_url"],
                    phone=sd["phone"],
                    address=sd["address"],
                )
                db.add(new_shop)
                shops[sd["name"]] = new_shop
                print(f"   [+] Created {sd['name']} (Owner: test_user_{sd['owner_idx']})")
        await db.commit()

        # ---- 3. PRODUCTS ----
        print("\n[ ] Seeding 25 Products (5 per shop)...")
        product_count = 0
        shop_list = list(shops.values())
        for shop_idx, (shop_key, shop) in enumerate(shops.items(), start=1):
            result = await db.execute(
                select(func.count(Product.id)).where(Product.shop_id == shop.id)
            )
            count = result.scalar()
            if count and count >= 5:
                print(f"   [OK] {shop.name} already has {count} products. Skipping.")
                product_count += count
                continue

            for pd in PRODUCT_DATA.get(shop_idx, []):
                new_product = Product(
                    id=uuid.uuid4(),
                    shop_id=shop.id,
                    name=pd["name"],
                    price=pd["price"],
                    description=pd["desc"],
                    image_url=pd["img"],
                    stock_quantity=pd["stock"],
                    category=pd["category"],
                    status="ACTIVE",
                )
                db.add(new_product)
                product_count += 1
            print(f"   [+] Created 5 products for {shop.name}")
        await db.commit()
        print(f"   [info] Total products: {product_count}")

        # ---- 4. DELIVERY OFFICES ----
        print("\n[ ] Seeding 5 Delivery Offices...")
        for od in OFFICE_DATA:
            result = await db.execute(select(DeliveryOffice).where(DeliveryOffice.name == od["name"]))
            existing = result.scalars().first()
            if existing:
                print(f"   [OK] {od['name']} already exists")
            else:
                owner = users[f"test_user_{od['owner_idx']}"]
                new_office = DeliveryOffice(
                    id=od["id"],
                    owner_id=owner.id,
                    name=od["name"],
                    logo_url=f"https://picsum.photos/seed/{od['name'].replace(' ', '')}/200",
                    phone=od["phone"],
                    whatsapp_number=od["whatsapp"],
                    address=od["address"],
                    base_fee=od["base_fee"],
                    rating=od["rating"],
                    reviews_count=0,
                    distance_km=round(1.0 + (od["owner_idx"] - 6) * 0.8, 1),
                    estimated_time="30–45 min",
                    tag=od["tag"],
                    is_verified="true",
                    is_available="true",
                )
                db.add(new_office)
                print(f"   [+] Created {od['name']} (Owner: test_user_{od['owner_idx']})")
        await db.commit()

        # ---- 5. SOCIAL TEST DATA ----
        print("\n[ ] Seeding Social Test Data...")

        # test_user_1 creates 3 posts
        u1 = users["test_user_1"]
        result = await db.execute(select(func.count(Post.id)).where(Post.user_id == u1.id))
        post_count = result.scalar()
        posts_created = []
        if post_count and post_count >= 3:
            print("   [OK] test_user_1 posts already exist. Skipping social data.")
            result = await db.execute(select(Post).where(Post.user_id == u1.id).limit(3))
            posts_created = result.scalars().all()
        else:
            post_texts = [
                "🚀 Welcome to ZAYREN! The future of social commerce is here. #ZayrenLaunch",
                "Just listed new products in the Tech Store! Check out the latest gadgets 🎧💻",
                "Beautiful day in Lagos! Who else is building something amazing? 🌟",
            ]
            for text in post_texts:
                p = Post(id=uuid.uuid4(), user_id=u1.id, content=text)
                db.add(p)
                posts_created.append(p)
            await db.commit()
            print("   [+] Created 3 posts by test_user_1")

            # test_user_2 likes post 1
            if posts_created:
                u2 = users["test_user_2"]
                like = PostLike(id=uuid.uuid4(), post_id=posts_created[0].id, user_id=u2.id)
                db.add(like)

                # test_user_3 comments on post 1
                u3 = users["test_user_3"]
                comment = PostComment(
                    id=uuid.uuid4(), post_id=posts_created[0].id, user_id=u3.id,
                    content="This is amazing! Can't wait to explore ZAYREN 🔥"
                )
                db.add(comment)

                # test_user_4 shares post 1
                u4 = users["test_user_4"]
                share = PostShare(
                    id=uuid.uuid4(), post_id=posts_created[0].id, user_id=u4.id, platform="internal"
                )
                db.add(share)

                # test_user_5 follows test_user_1
                u5 = users["test_user_5"]
                follow = Follow(id=uuid.uuid4(), follower_id=u5.id, following_id=u1.id)
                db.add(follow)

                # Notifications for test_user_1
                from models import Notification
                notifs = [
                    Notification(id=uuid.uuid4(), user_id=u1.id, type="like",
                                 title="Test User 2 liked your post",
                                 body="Your post got a new like!", is_read="false"),
                    Notification(id=uuid.uuid4(), user_id=u1.id, type="comment",
                                 title="Test User 3 commented on your post",
                                 body="This is amazing! Can't wait to explore ZAYREN 🔥", is_read="false"),
                    Notification(id=uuid.uuid4(), user_id=u1.id, type="follow",
                                 title="Test User 5 started following you",
                                 body="You have a new follower!", is_read="false"),
                ]
                for n in notifs:
                    db.add(n)

                await db.commit()
                print("   [+] Created likes, comments, shares, follows, and notifications")

        # ---- 6. MARKETPLACE TEST DATA ----
        print("\n[ ] Seeding Marketplace Test Scenario...")

        # Check if the test order already exists
        u6 = users["test_user_6"]
        result = await db.execute(select(func.count(Order.id)).where(Order.user_id == u6.id))
        order_count = result.scalar()

        if order_count and order_count > 0:
            print("   [OK] Marketplace test data already exists. Skipping.")
        else:
            # Get a product from Zayren Tech Store
            tech_shop = shops["Zayren Tech Store"]
            result = await db.execute(select(Product).where(Product.shop_id == tech_shop.id).limit(1))
            product = result.scalars().first()

            if product:
                # Create payment
                payment = Payment(
                    id=uuid.uuid4(), user_id=u6.id,
                    amount=product.price, status="VERIFIED"
                )
                db.add(payment)
                await db.flush()

                # Create order
                order = Order(
                    id=uuid.uuid4(), user_id=u6.id, shop_id=tech_shop.id,
                    total_amount=product.price, status="PAID", payment_id=payment.id
                )
                db.add(order)
                await db.flush()

                # Create order item
                order_item = OrderItem(
                    id=uuid.uuid4(), order_id=order.id, product_id=product.id,
                    quantity=1, price_at_purchase=product.price
                )
                db.add(order_item)

                # Create receipt
                receipt = PurchaseReceipt(
                    id=uuid.uuid4(), order_id=order.id, shop_id=tech_shop.id,
                    user_id=u6.id, receipt_number=f"ZR-{uuid.uuid4().hex[:8].upper()}",
                    total_amount=product.price, total_items=1,
                    payment_id=payment.id, payment_status="PAID"
                )
                db.add(receipt)
                await db.flush()

                # Create delivery request
                express1 = None
                result = await db.execute(select(DeliveryOffice).where(DeliveryOffice.name == "Zayren Express 1"))
                express1 = result.scalars().first()

                if express1:
                    delivery_req = DeliveryRequest(
                        id=uuid.uuid4(), order_id=order.id,
                        delivery_office_id=express1.id,
                        full_name="Test User 6", whatsapp_number="+2348001000006",
                        call_number="+2348001000006",
                        full_address="42 Buyer Street, Lagos, Nigeria",
                        state="Lagos", lga="Ikeja", country="Nigeria",
                        additional_details="Please call before delivery",
                        delivery_fee=express1.base_fee,
                        status="DELIVERED",
                        receipt_id=receipt.id,
                    )
                    db.add(delivery_req)

                # Notification for shop owner
                notif = Notification(
                    id=uuid.uuid4(), user_id=u1.id, type="order",
                    title="New Order Received!",
                    body=f"Test User 6 ordered {product.name} from your shop.",
                    is_read="false"
                )
                db.add(notif)

                await db.commit()
                print(f"   [+] Created order for {product.name} (NGN {product.price:,.0f})")
                print("   [+] Created payment, receipt, delivery request, and notification")
            else:
                print("   [!] No products found in Tech Store. Skipping marketplace test.")

        # ---- SUMMARY ----
        print("\n" + "=" * 60)
        print("  [OK] SEED COMPLETE!")
        print("=" * 60)
        print(f"\n  [info] Summary:")
        print(f"     Users:            10")
        print(f"     Shops:            5")
        print(f"     Products:         {product_count}")
        print(f"     Delivery Offices: 5")
        print(f"\n  [info] Dev Password:     {DEV_PASSWORD}")
        print(f"     (used for all test_user_X accounts)")
        print(f"\n  [info] Login with mock auth:")
        print(f"     Use the user's UUID as the Bearer token.")
        print(f"     Example: Authorization: Bearer {USER_IDS[1]}")
        print("=" * 60)


if __name__ == "__main__":
    asyncio.run(seed())
