import datetime
import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Float, Integer
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import relationship

try:
    from ..database import Base
except ImportError:
    from database import Base

class User(Base):
    __tablename__ = "users"

    # In Supabase, the best practice is to match the auth.users ID
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=True)  # Added: store email for verification
    name = Column(String, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    bio = Column(String, nullable=True)
    location = Column(String, nullable=True)
    profile_pic = Column(String, nullable=True)
    
    # Admin & RBAC fields
    role = Column(String, default="user") # e.g. super_admin, finance_admin, user
    permissions = Column(String, nullable=True) # JSON string of permissions
    status = Column(String, default="Active") # Active, Suspended, Banned, Pending verification
    admin_notes = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    posts = relationship("Post", back_populates="user", cascade="all, delete-orphan")
    sales_as_seller = relationship("Sale", foreign_keys="Sale.seller_id", back_populates="seller", cascade="all, delete-orphan")
    followers = relationship("Follow", foreign_keys="Follow.following_id", back_populates="following", cascade="all, delete-orphan")
    following = relationship("Follow", foreign_keys="Follow.follower_id", back_populates="follower", cascade="all, delete-orphan")

class Follow(Base):
    __tablename__ = "followers"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    follower_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    following_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    follower = relationship("User", foreign_keys=[follower_id], back_populates="following")
    following = relationship("User", foreign_keys=[following_id], back_populates="followers")

class Post(Base):
    __tablename__ = "posts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    content = Column(String, nullable=True)
    post_type = Column(String, default="post")
    audience = Column(String, default="public")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="posts")
    media_items = relationship("PostMedia", back_populates="post", cascade="all, delete-orphan")
    likes = relationship("PostLike", back_populates="post", cascade="all, delete-orphan")
    comments = relationship("PostComment", back_populates="post", cascade="all, delete-orphan")
    shares = relationship("PostShare", back_populates="post", cascade="all, delete-orphan")

class PostMedia(Base):
    __tablename__ = "post_media"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), ForeignKey("posts.id"), nullable=False)
    media_url = Column(String, nullable=False)
    media_type = Column(String, default="image") # image, video
    size_bytes = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    post = relationship("Post", back_populates="media_items")

class PostLike(Base):
    __tablename__ = "post_likes"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), ForeignKey("posts.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    post = relationship("Post", back_populates="likes")
    user = relationship("User")

class PostComment(Base):
    __tablename__ = "post_comments"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), ForeignKey("posts.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    content = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    post = relationship("Post", back_populates="comments")
    user = relationship("User")

class PostShare(Base):
    __tablename__ = "post_shares"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), ForeignKey("posts.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    platform = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    post = relationship("Post", back_populates="shares")
    user = relationship("User")

class Story(Base):
    __tablename__ = "stories"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    media_url = Column(String, nullable=True)
    media_type = Column(String, nullable=True) # 'image' or 'video'
    text = Column(String, nullable=True)
    location = Column(String, nullable=True)
    music_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    expires_at = Column(DateTime, default=lambda: datetime.datetime.utcnow() + datetime.timedelta(hours=24))

    user = relationship("User")
    views = relationship("StoryView", back_populates="story", cascade="all, delete-orphan")

class StoryView(Base):
    __tablename__ = "story_views"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    story_id = Column(UUID(as_uuid=True), ForeignKey("stories.id"), nullable=False)
    viewer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    viewed_at = Column(DateTime, default=datetime.datetime.utcnow)

    story = relationship("Story", back_populates="views")
    viewer = relationship("User")

class Sale(Base):
    __tablename__ = "sales"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False) 
    item_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    seller = relationship("User", foreign_keys=[seller_id], back_populates="sales_as_seller")

# --- Market Models ---

class Shop(Base):
    __tablename__ = "shops"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    name = Column(String, nullable=False)
    logo_url = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    status = Column(String, default="Pending") # Pending, Under review, Verified, Rejected, Suspended
    verification_documents = Column(String, nullable=True) # JSON array of urls
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User")
    products = relationship("Product", back_populates="shop", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="shop")

class Product(Base):
    __tablename__ = "products"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    shop_id = Column(UUID(as_uuid=True), ForeignKey("shops.id"), nullable=False)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    stock_quantity = Column(Float, default=0.0)
    category = Column(String, nullable=True)      # fashion, electronics, food, etc.
    status = Column(String, default="ACTIVE")      # ACTIVE, DRAFT, SOLD_OUT
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    shop = relationship("Shop", back_populates="products")

class CartItem(Base):
    __tablename__ = "cart_items"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    quantity = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User")
    product = relationship("Product")

class Order(Base):
    __tablename__ = "orders"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    shop_id = Column(UUID(as_uuid=True), ForeignKey("shops.id"), nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String, default="PENDING") # PENDING, PAID
    payment_id = Column(UUID(as_uuid=True), ForeignKey("payments.id"), nullable=True)
    receipt_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User")
    shop = relationship("Shop", back_populates="orders")
    payment = relationship("Payment")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    receipt = relationship("PurchaseReceipt", back_populates="order", uselist=False, cascade="all, delete-orphan")

class PurchaseReceipt(Base):
    __tablename__ = "purchase_receipts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False, unique=True)
    shop_id = Column(UUID(as_uuid=True), ForeignKey("shops.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    receipt_number = Column(String, unique=True, nullable=False)
    total_amount = Column(Float, nullable=False)
    total_items = Column(Float, nullable=False)
    payment_id = Column(UUID(as_uuid=True), ForeignKey("payments.id"), nullable=True)
    payment_status = Column(String, default="PAID")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    order = relationship("Order", back_populates="receipt")
    shop = relationship("Shop")
    user = relationship("User")

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    price_at_purchase = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product")

class Payment(Base):
    __tablename__ = "payments"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String, default="PENDING") # PENDING, VERIFIED, FAILED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User")


# --- Delivery Models ---

class DeliveryOffice(Base):
    __tablename__ = "delivery_offices"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    name = Column(String, nullable=False)
    logo_url = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    whatsapp_number = Column(String, nullable=True)
    address = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    base_fee = Column(Float, nullable=True)
    rating = Column(Float, nullable=True, default=4.5)
    reviews_count = Column(Float, nullable=True, default=0)
    distance_km = Column(Float, nullable=True, default=1.0)
    estimated_time = Column(String, nullable=True, default='30–45 min')
    tag = Column(String, nullable=True)  # e.g. 'Fastest', 'Reliable', 'Affordable'
    is_verified = Column(String, default="false")  # "true" / "false"
    is_available = Column(String, default="true")   # "true" / "false"
    status = Column(String, default="Pending") # Pending, Under review, Verified, Rejected, Suspended
    verification_documents = Column(String, nullable=True) # JSON array of urls
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User")

class DeliveryPartner(Base):
    __tablename__ = "delivery_partners"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    office_id = Column(UUID(as_uuid=True), ForeignKey("delivery_offices.id"), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    rating = Column(Float, nullable=True, default=5.0)
    profile_pic = Column(String, nullable=True)
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    office = relationship("DeliveryOffice")
    user = relationship("User")

class DeliveryRequest(Base):
    __tablename__ = "delivery_requests"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)
    delivery_office_id = Column(UUID(as_uuid=True), ForeignKey("delivery_offices.id"), nullable=False)
    
    # Customer Info
    full_name = Column(String, nullable=False)
    whatsapp_number = Column(String, nullable=True)
    call_number = Column(String, nullable=True)
    full_address = Column(String, nullable=False)
    state = Column(String, nullable=True)
    lga = Column(String, nullable=True)
    country = Column(String, nullable=True)
    additional_details = Column(String, nullable=True)
    location_coords = Column(String, nullable=True) # e.g., "lat,lng"
    
    # Status and Fee
    delivery_fee = Column(Float, nullable=True)
    status = Column(String, default="PENDING") # PENDING, VERIFYING, AWAITING_PAYMENT, PICKUP, OUT_FOR_DELIVERY, DELIVERED, CUSTOMER_CONFIRMED, REJECTED
    
    receipt_id = Column(UUID(as_uuid=True), ForeignKey("purchase_receipts.id"), nullable=True)
    delivery_partner_id = Column(UUID(as_uuid=True), ForeignKey("delivery_partners.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    order = relationship("Order")
    delivery_office = relationship("DeliveryOffice")
    receipt = relationship("PurchaseReceipt")
    delivery_partner = relationship("DeliveryPartner")

class CollectionReceipt(Base):
    __tablename__ = "collection_receipts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    purchase_receipt_id = Column(UUID(as_uuid=True), ForeignKey("purchase_receipts.id"), nullable=False)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)
    delivery_request_id = Column(UUID(as_uuid=True), ForeignKey("delivery_requests.id"), nullable=False)
    shop_id = Column(UUID(as_uuid=True), ForeignKey("shops.id"), nullable=False)
    delivery_office_id = Column(UUID(as_uuid=True), ForeignKey("delivery_offices.id"), nullable=False)
    delivery_partner_id = Column(UUID(as_uuid=True), ForeignKey("delivery_partners.id"), nullable=False)
    collection_code = Column(String, nullable=False)
    status = Column(String, default="AUTHORIZED_FOR_COLLECTION")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    collected_at = Column(DateTime, nullable=True)

    purchase_receipt = relationship("PurchaseReceipt")
    order = relationship("Order")
    delivery_request = relationship("DeliveryRequest")
    shop = relationship("Shop")
    delivery_office = relationship("DeliveryOffice")
    delivery_partner = relationship("DeliveryPartner")



# --- Notification Model ---

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False)  # follow, like, comment, order, payment, delivery, message
    title = Column(String, nullable=False)
    body = Column(String, nullable=True)
    is_read = Column(String, default="false")
    reference_id = Column(String, nullable=True)  # ID of related entity (order_id, post_id, etc.)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User")


# --- Chat / Message Model ---

class Message(Base):
    __tablename__ = "messages"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    receiver_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    content = Column(String, nullable=False)
    is_read = Column(String, default="false")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])

# --- Admin Models ---

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    admin_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    admin_name = Column(String, nullable=False)
    action = Column(String, nullable=False)
    target_entity = Column(String, nullable=True)
    target_id = Column(String, nullable=True)
    previous_value = Column(String, nullable=True)
    new_value = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    admin = relationship("User", foreign_keys=[admin_id])

class Complaint(Base):
    __tablename__ = "complaints"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reporter_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    reported_entity_id = Column(UUID(as_uuid=True), nullable=True) # Can be a User ID, Shop ID, Post ID, etc.
    entity_type = Column(String, nullable=True) # e.g. 'user', 'shop', 'delivery_office', 'post'
    category = Column(String, nullable=False) # e.g. 'Fraud', 'Fake product'
    description = Column(String, nullable=False)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=True)
    status = Column(String, default="Open") # Open, Under investigation, Waiting for information, Resolved, Rejected, Closed
    admin_notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    reporter = relationship("User", foreign_keys=[reporter_id])
    order = relationship("Order")

