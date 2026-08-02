from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    id: UUID
    email: str  # Added: required for verification
    name: str
    username: str

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None

class StatsSchema(BaseModel):
    followers_count: int = 0
    following_count: int = 0
    posts_count: int = 0
    sales_total: float = 0.0

class UserProfileResponse(BaseModel):
    id: UUID
    email: Optional[str] = None  # Added: include email in responses
    name: str
    username: str
    bio: Optional[str] = None
    location: Optional[str] = None
    profile_pic: Optional[str] = None
    role: Optional[str] = "user"
    status: Optional[str] = "Active"
    permissions: Optional[str] = None
    stats: Optional[StatsSchema] = None

    class Config:
        from_attributes = True

class PictureUploadResponse(BaseModel):
    profile_pic: str

class PasswordResetRequest(BaseModel):
    email: str
    new_password: str

# --- Market Schemas ---

class ShopSchema(BaseModel):
    id: UUID
    owner_id: Optional[UUID] = None
    name: str
    logo_url: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    status: Optional[str] = "Pending"
    verification_documents: Optional[str] = None

    class Config:
        from_attributes = True

class ProductSchema(BaseModel):
    id: UUID
    shop_id: UUID
    name: str
    price: float
    description: Optional[str] = None
    image_url: Optional[str] = None
    stock_quantity: Optional[float] = 0.0
    category: Optional[str] = None
    status: Optional[str] = "ACTIVE"
    shop: Optional[ShopSchema] = None

    class Config:
        from_attributes = True

class CartItemCreate(BaseModel):
    product_id: UUID
    quantity: float = 1.0

class CartItemUpdate(BaseModel):
    quantity: float


class CartItemSchema(BaseModel):
    id: UUID
    user_id: UUID
    product_id: UUID
    quantity: float
    product: Optional[ProductSchema] = None

    class Config:
        from_attributes = True

class OrderItemSchema(BaseModel):
    id: UUID
    product_id: UUID
    quantity: float
    price_at_purchase: float
    product: Optional[ProductSchema] = None

    class Config:
        from_attributes = True

class OrderSchema(BaseModel):
    id: UUID
    user_id: UUID
    shop_id: UUID
    total_amount: float
    status: str
    payment_id: Optional[UUID] = None
    receipt_url: Optional[str] = None
    items: list[OrderItemSchema] = []
    shop: Optional[ShopSchema] = None

    class Config:
        from_attributes = True

class PurchaseReceiptSchema(BaseModel):
    id: UUID
    order_id: UUID
    shop_id: UUID
    user_id: UUID
    receipt_number: str
    total_amount: float
    total_items: float
    payment_id: Optional[UUID] = None
    payment_status: str

    class Config:
        from_attributes = True

class PaymentSchema(BaseModel):
    id: UUID
    user_id: UUID
    amount: float
    status: str

    class Config:
        from_attributes = True

class PaymentVerifyRequest(BaseModel):
    payment_id: UUID


# --- Delivery Schemas ---

class DeliveryOfficeSchema(BaseModel):
    id: UUID
    owner_id: Optional[UUID] = None
    name: str
    logo_url: Optional[str] = None
    phone: Optional[str] = None
    whatsapp_number: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    base_fee: Optional[float] = None
    rating: Optional[float] = None
    reviews_count: Optional[float] = None
    distance_km: Optional[float] = None
    estimated_time: Optional[str] = None
    tag: Optional[str] = None
    is_verified: Optional[str] = None
    is_available: Optional[str] = None
    status: Optional[str] = "Pending"
    verification_documents: Optional[str] = None

    class Config:
        from_attributes = True

class DeliveryPartnerSchema(BaseModel):
    id: UUID
    name: str
    phone: Optional[str] = None
    rating: Optional[float] = None
    profile_pic: Optional[str] = None
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None

    class Config:
        from_attributes = True

class DeliveryRequestCreate(BaseModel):
    order_id: UUID
    delivery_office_id: UUID
    full_name: str
    whatsapp_number: Optional[str] = None
    call_number: Optional[str] = None
    full_address: str
    state: Optional[str] = None
    lga: Optional[str] = None
    country: Optional[str] = None
    additional_details: Optional[str] = None
    location_coords: Optional[str] = None
    receipt_id: Optional[UUID] = None

class DeliveryRequestSchema(BaseModel):
    id: UUID
    order_id: UUID
    delivery_office_id: UUID
    full_name: str
    whatsapp_number: Optional[str] = None
    call_number: Optional[str] = None
    full_address: str
    state: Optional[str] = None
    lga: Optional[str] = None
    country: Optional[str] = None
    additional_details: Optional[str] = None
    location_coords: Optional[str] = None
    delivery_fee: Optional[float] = None
    status: str
    order: Optional[OrderSchema] = None
    delivery_office: Optional[DeliveryOfficeSchema] = None
    receipt: Optional[PurchaseReceiptSchema] = None
    delivery_partner: Optional[DeliveryPartnerSchema] = None

    class Config:
        from_attributes = True

class DeliveryFeePropose(BaseModel):
    delivery_fee: float

class CheckoutRequest(BaseModel):
    # Can include payment details if needed, for now mock
    pass


# --- Notification / Message Schemas ---

class NotificationSchema(BaseModel):
    id: UUID
    user_id: UUID
    type: str
    title: str
    body: Optional[str] = None
    is_read: Optional[str] = "false"
    reference_id: Optional[str] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True

class MessageSchema(BaseModel):
    id: UUID
    sender_id: UUID
    receiver_id: UUID
    content: str
    is_read: Optional[str] = "false"
    created_at: Optional[str] = None

    class Config:
        from_attributes = True

class ShopCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None

class ProductCreate(BaseModel):
    name: str
    price: float
    description: Optional[str] = None
    image_url: Optional[str] = None
    stock_quantity: Optional[float] = 0.0
    category: Optional[str] = None

class DeliveryOfficeRegister(BaseModel):
    name: str
    phone: Optional[str] = None
    whatsapp_number: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

# --- Post Schemas ---

class PostCommentSchema(BaseModel):
    id: UUID
    post_id: UUID
    user_id: UUID
    content: str
    user: Optional[UserProfileResponse] = None

    class Config:
        from_attributes = True

class PostLikeSchema(BaseModel):
    id: UUID
    user_id: UUID
    post_id: UUID

    class Config:
        from_attributes = True

class PostShareSchema(BaseModel):
    id: UUID
    user_id: UUID
    post_id: UUID
    platform: Optional[str] = None

    class Config:
        from_attributes = True

class PostMediaSchema(BaseModel):
    id: UUID
    post_id: UUID
    media_url: str
    media_type: str
    size_bytes: Optional[int] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True

class PostMediaCreate(BaseModel):
    media_url: str
    media_type: str
    size_bytes: Optional[int] = None

class PostSchema(BaseModel):
    id: UUID
    user_id: UUID
    content: Optional[str] = None
    post_type: Optional[str] = "post"
    audience: Optional[str] = "public"
    user: Optional[UserProfileResponse] = None
    media_items: list[PostMediaSchema] = []
    likes_count: int = 0
    comments_count: int = 0
    shares_count: int = 0
    is_liked_by_me: bool = False
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True

class PostCreate(BaseModel):
    content: Optional[str] = None
    post_type: Optional[str] = "post"
    audience: Optional[str] = "public"
    media_items: list[PostMediaCreate] = []

class CommentCreate(BaseModel):
    content: str

class StoryCreate(BaseModel):
    media_url: Optional[str] = None
    media_type: Optional[str] = None
    text: Optional[str] = None
    location: Optional[str] = None
    music_id: Optional[str] = None

class StoryViewSchema(BaseModel):
    id: UUID
    viewer_id: UUID
    viewed_at: Optional[str] = None
    viewer: Optional[UserProfileResponse] = None

    class Config:
        from_attributes = True

class StorySchema(BaseModel):
    id: UUID
    user_id: UUID
    media_url: Optional[str] = None
    media_type: Optional[str] = None
    text: Optional[str] = None
    location: Optional[str] = None
    music_id: Optional[str] = None
    created_at: Optional[str] = None
    expires_at: Optional[str] = None
    user: Optional[UserProfileResponse] = None
    views: list[StoryViewSchema] = []
    has_viewed: bool = False

    class Config:
        from_attributes = True

# --- Admin Schemas ---

class AuditLogSchema(BaseModel):
    id: UUID
    admin_id: UUID
    admin_name: str
    action: str
    target_entity: Optional[str] = None
    target_id: Optional[str] = None
    previous_value: Optional[str] = None
    new_value: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True

class ComplaintSchema(BaseModel):
    id: UUID
    reporter_id: UUID
    reported_entity_id: Optional[UUID] = None
    entity_type: Optional[str] = None
    category: str
    description: str
    order_id: Optional[UUID] = None
    status: Optional[str] = "Open"
    admin_notes: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    
    reporter: Optional[UserProfileResponse] = None
    # Can add order/shop relations here later if needed

    class Config:
        from_attributes = True

from .business import *
