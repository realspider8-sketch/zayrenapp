from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from uuid import UUID
import uuid

from backend.database import get_db
from backend.models import Product, CartItem, Order, OrderItem, Shop, PurchaseReceipt, Payment
from backend.schemas import (
    ProductSchema, CartItemSchema, CartItemCreate, CartItemUpdate, 
    OrderSchema, PaymentSchema, PaymentVerifyRequest, PurchaseReceiptSchema
)

router = APIRouter()

# --- Products ---

@router.get("/products", response_model=list[ProductSchema])
async def get_products(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).options(selectinload(Product.shop)))
    products = result.scalars().all()
    return products

@router.get("/products/{product_id}", response_model=ProductSchema)
async def get_product(product_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).options(selectinload(Product.shop)).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# --- Cart ---

@router.get("/cart/{user_id}", response_model=list[CartItemSchema])
async def get_cart(user_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CartItem).options(selectinload(CartItem.product).selectinload(Product.shop)).where(CartItem.user_id == user_id))
    items = result.scalars().all()
    return items

@router.post("/cart/{user_id}", response_model=CartItemSchema)
async def add_to_cart(user_id: UUID, item_data: CartItemCreate, db: AsyncSession = Depends(get_db)):
    product = await db.get(Product, item_data.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    stmt = select(CartItem).where(CartItem.user_id == user_id, CartItem.product_id == item_data.product_id)
    result = await db.execute(stmt)
    existing_item = result.scalar_one_or_none()

    if existing_item:
        existing_item.quantity += item_data.quantity
        await db.commit()
        await db.refresh(existing_item)
        return existing_item
    
    new_item = CartItem(user_id=user_id, product_id=item_data.product_id, quantity=item_data.quantity)
    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)
    return new_item

@router.delete("/cart/{item_id}")
async def remove_from_cart(item_id: UUID, db: AsyncSession = Depends(get_db)):
    item = await db.get(CartItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    await db.delete(item)
    await db.commit()
    return {"message": "Removed from cart"}

@router.patch("/cart/{item_id}", response_model=CartItemSchema)
async def update_cart_item(item_id: UUID, item_data: CartItemUpdate, db: AsyncSession = Depends(get_db)):
    item = await db.get(CartItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    if item_data.quantity <= 0:
        await db.delete(item)
        await db.commit()
        return {"message": "Item removed because quantity is 0 or less"}

    item.quantity = item_data.quantity
    await db.commit()
    await db.refresh(item)
    return item

@router.delete("/cart/clear/{user_id}")
async def clear_cart(user_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CartItem).where(CartItem.user_id == user_id))
    items = result.scalars().all()
    
    for item in items:
        await db.delete(item)
    
    await db.commit()
    return {"message": "Cart cleared successfully"}


# --- Payments & Checkout ---

@router.post("/payments/{user_id}", response_model=PaymentSchema)
async def create_payment(user_id: UUID, db: AsyncSession = Depends(get_db)):
    # Calculate secure total from DB
    result = await db.execute(select(CartItem).where(CartItem.user_id == user_id))
    cart_items = result.scalars().all()

    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total_amount = 0.0
    for c_item in cart_items:
        product = await db.get(Product, c_item.product_id)
        if not product:
            raise HTTPException(status_code=400, detail="Product no longer exists")
        if product.stock_quantity < c_item.quantity:
            raise HTTPException(status_code=400, detail=f"Not enough stock for {product.name}")
        total_amount += product.price * c_item.quantity

    new_payment = Payment(
        user_id=user_id,
        amount=total_amount,
        status="PENDING"
    )
    db.add(new_payment)
    await db.commit()
    await db.refresh(new_payment)
    
    return new_payment

@router.post("/payments/verify", response_model=PurchaseReceiptSchema)
async def verify_payment(request: PaymentVerifyRequest, db: AsyncSession = Depends(get_db)):
    payment = await db.get(Payment, request.payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    if payment.status == "VERIFIED":
        raise HTTPException(status_code=400, detail="Payment already verified")

    # In a real app, verify with Stripe/Paystack API here.
    payment.status = "VERIFIED"

    # Proceed to create Order and Receipt
    user_id = payment.user_id
    result = await db.execute(select(CartItem).where(CartItem.user_id == user_id))
    cart_items = result.scalars().all()

    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty, cannot generate order")

    shop_id = None
    order_items_data = []

    for c_item in cart_items:
        product = await db.get(Product, c_item.product_id)
        if product:
            # Decrease stock
            if product.stock_quantity < c_item.quantity:
                raise HTTPException(status_code=400, detail=f"Stock unavailable for {product.name} during checkout")
            product.stock_quantity -= c_item.quantity

            shop_id = product.shop_id 
            order_items_data.append({
                "product_id": product.id,
                "quantity": c_item.quantity,
                "price": product.price
            })
    
    receipt_number = f"REC-{uuid.uuid4().hex[:8].upper()}"
    new_order = Order(
        user_id=user_id,
        shop_id=shop_id,
        total_amount=payment.amount,
        status="PAID",
        payment_id=payment.id,
        receipt_url=f"receipts/{receipt_number}.pdf"
    )
    db.add(new_order)
    await db.commit()
    await db.refresh(new_order)

    total_items = sum(item["quantity"] for item in order_items_data)
    
    new_receipt = PurchaseReceipt(
        order_id=new_order.id,
        shop_id=shop_id,
        user_id=user_id,
        receipt_number=receipt_number,
        total_amount=payment.amount,
        total_items=total_items,
        payment_id=payment.id,
        payment_status="PAID"
    )
    db.add(new_receipt)

    for item_data in order_items_data:
        o_item = OrderItem(
            order_id=new_order.id,
            product_id=item_data["product_id"],
            quantity=item_data["quantity"],
            price_at_purchase=item_data["price"]
        )
        db.add(o_item)
    
    for c_item in cart_items:
        await db.delete(c_item)

    await db.commit()
    await db.refresh(new_receipt)
    
    return new_receipt


# --- Orders ---

@router.get("/orders/{user_id}", response_model=list[OrderSchema])
async def get_orders(user_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.shop), selectinload(Order.items).selectinload(OrderItem.product))
        .where(Order.user_id == user_id)
        .order_by(Order.created_at.desc())
    )
    return result.scalars().all()

@router.get("/orders/detail/{order_id}", response_model=OrderSchema)
async def get_order_detail(order_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.shop), selectinload(Order.items).selectinload(OrderItem.product))
        .where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


# --- Receipts ---

@router.get("/receipts/{user_id}", response_model=list[PurchaseReceiptSchema])
async def get_receipts(user_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PurchaseReceipt)
        .where(PurchaseReceipt.user_id == user_id)
        .order_by(PurchaseReceipt.created_at.desc())
    )
    return result.scalars().all()

@router.get("/receipts/detail/{receipt_id}", response_model=dict)
async def get_receipt_detail(receipt_id: UUID, db: AsyncSession = Depends(get_db)):
    # Returns a rich dict with joined data for the UI
    result = await db.execute(
        select(PurchaseReceipt)
        .options(selectinload(PurchaseReceipt.shop), selectinload(PurchaseReceipt.order).selectinload(Order.items).selectinload(OrderItem.product))
        .where(PurchaseReceipt.id == receipt_id)
    )
    receipt = result.scalar_one_or_none()
    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")
    
    return {
        "id": receipt.id,
        "receipt_number": receipt.receipt_number,
        "date": receipt.created_at.isoformat(),
        "total_amount": receipt.total_amount,
        "total_items": receipt.total_items,
        "payment_status": receipt.payment_status,
        "shop": {
            "name": receipt.shop.name,
            "logo_url": receipt.shop.logo_url,
            "phone": receipt.shop.phone,
            "address": receipt.shop.address,
        },
        "items": [
            {
                "name": item.product.name,
                "quantity": item.quantity,
                "price": item.price_at_purchase
            }
            for item in receipt.order.items
        ]
    }

@router.get("/receipts/{receipt_id}/download")
async def download_receipt(receipt_id: UUID, db: AsyncSession = Depends(get_db)):
    # Simulates returning a PDF file url
    receipt = await db.get(PurchaseReceipt, receipt_id)
    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")
    
    # In a real app, generate PDF here and return file response or signed URL
    return {"pdf_url": f"https://cdn.zayren.com/receipts/{receipt.receipt_number}.pdf"}
