from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from backend.database import get_db
from backend.models import DeliveryOffice, DeliveryRequest, Order, PurchaseReceipt, DeliveryPartner, Shop, Product, OrderItem
from backend.schemas import DeliveryOfficeSchema, DeliveryRequestSchema, DeliveryRequestCreate, DeliveryFeePropose
from typing import Optional

router = APIRouter()

@router.get("/offices/nearby", response_model=list[DeliveryOfficeSchema])
async def get_nearby_offices(lat: Optional[float] = None, lng: Optional[float] = None, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DeliveryOffice))
    offices = result.scalars().all()
    # In a real app, calculate distance. Here we just return existing offices sorted by distance_km.
    return sorted(offices, key=lambda x: x.distance_km if x.distance_km else 0)

@router.get("/offices", response_model=list[DeliveryOfficeSchema])
async def get_offices(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DeliveryOffice))
    offices = result.scalars().all()
    return offices

@router.post("/offices/seed", response_model=list[DeliveryOfficeSchema])
async def seed_offices(db: AsyncSession = Depends(get_db)):
    """Seeds the database with default delivery offices if none exist."""
    result = await db.execute(select(DeliveryOffice))
    existing = result.scalars().all()
    if existing:
        return existing

    seed_data = [
        DeliveryOffice(
            name="ZAYREN Express Office",
            phone="+234 800 000 0001",
            base_fee=2000.0,
            rating=4.8,
            reviews_count=230,
            distance_km=1.2,
            estimated_time="25 – 40 min",
            tag="Fastest"
        ),
        DeliveryOffice(
            name="City Swift Logistics",
            phone="+234 800 000 0002",
            base_fee=2200.0,
            rating=4.6,
            reviews_count=178,
            distance_km=1.8,
            estimated_time="30 – 45 min",
            tag="Reliable"
        ),
        DeliveryOffice(
            name="RapidGo Delivery",
            phone="+234 800 000 0003",
            base_fee=2500.0,
            rating=4.5,
            reviews_count=156,
            distance_km=2.3,
            estimated_time="35 – 50 min",
            tag="Affordable"
        ),
        DeliveryOffice(
            name="Prime Delivery Hub",
            phone="+234 800 000 0004",
            base_fee=2800.0,
            rating=4.4,
            reviews_count=95,
            distance_km=2.9,
            estimated_time="40 – 60 min",
            tag="Reliable"
        ),
    ]
    for office in seed_data:
        db.add(office)
    await db.commit()
    result = await db.execute(select(DeliveryOffice))
    return result.scalars().all()

@router.get("/active/{user_id}", response_model=list[DeliveryRequestSchema])
async def get_active_requests(user_id: UUID, db: AsyncSession = Depends(get_db)):
    from sqlalchemy.orm import joinedload
    stmt = (
        select(DeliveryRequest)
        .options(
            joinedload(DeliveryRequest.order).joinedload(Order.items).joinedload(OrderItem.product),
            joinedload(DeliveryRequest.order).joinedload(Order.shop),
            joinedload(DeliveryRequest.delivery_office),
            joinedload(DeliveryRequest.delivery_partner)
        )
        .join(Order)
        .where(Order.user_id == user_id, DeliveryRequest.status != "DELIVERED", DeliveryRequest.status != "CUSTOMER_CONFIRMED", DeliveryRequest.status != "REJECTED")
    )
    result = await db.execute(stmt)
    return result.unique().scalars().all()

@router.get("/history/{user_id}", response_model=list[DeliveryRequestSchema])
async def get_history_requests(user_id: UUID, db: AsyncSession = Depends(get_db)):
    from sqlalchemy.orm import joinedload
    stmt = (
        select(DeliveryRequest)
        .options(
            joinedload(DeliveryRequest.order).joinedload(Order.items).joinedload(OrderItem.product),
            joinedload(DeliveryRequest.order).joinedload(Order.shop),
            joinedload(DeliveryRequest.delivery_office)
        )
        .join(Order)
        .where(Order.user_id == user_id, DeliveryRequest.status.in_(["DELIVERED", "CUSTOMER_CONFIRMED", "REJECTED"]))
    )
    result = await db.execute(stmt)
    return result.unique().scalars().all()

@router.post("/request", response_model=DeliveryRequestSchema)
async def create_delivery_request(request_data: DeliveryRequestCreate, db: AsyncSession = Depends(get_db)):
    # Validate order
    order = await db.get(Order, request_data.order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    office = await db.get(DeliveryOffice, request_data.delivery_office_id)
    if not office:
        raise HTTPException(status_code=404, detail="Delivery Office not found")

    receipt = await db.get(PurchaseReceipt, request_data.receipt_id) if request_data.receipt_id else None

    new_request = DeliveryRequest(
        order_id=request_data.order_id,
        delivery_office_id=request_data.delivery_office_id,
        receipt_id=request_data.receipt_id,
        full_name=request_data.full_name,
        whatsapp_number=request_data.whatsapp_number,
        call_number=request_data.call_number,
        full_address=request_data.full_address,
        state=request_data.state,
        lga=request_data.lga,
        country=request_data.country,
        additional_details=request_data.additional_details,
        location_coords=request_data.location_coords,
        status="VERIFYING"
    )
    db.add(new_request)
    await db.commit()
    await db.refresh(new_request)
    return new_request

@router.get("/request/{request_id}", response_model=DeliveryRequestSchema)
async def get_delivery_request(request_id: UUID, db: AsyncSession = Depends(get_db)):
    req = await db.get(DeliveryRequest, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Delivery Request not found")
    return req

@router.post("/request/{request_id}/verify", response_model=DeliveryRequestSchema)
async def verify_request(request_id: UUID, fee_data: DeliveryFeePropose, db: AsyncSession = Depends(get_db)):
    req = await db.get(DeliveryRequest, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Delivery Request not found")
    
    req.delivery_fee = fee_data.delivery_fee
    req.status = "AWAITING_PAYMENT"
    await db.commit()
    await db.refresh(req)
    return req

@router.post("/request/{request_id}/pay", response_model=DeliveryRequestSchema)
async def pay_fee(request_id: UUID, db: AsyncSession = Depends(get_db)):
    req = await db.get(DeliveryRequest, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Delivery Request not found")
        
    req.status = "PICKUP"
    await db.commit()
    await db.refresh(req)
    return req

@router.post("/request/{request_id}/pickup", response_model=DeliveryRequestSchema)
async def pickup_order(request_id: UUID, db: AsyncSession = Depends(get_db)):
    req = await db.get(DeliveryRequest, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Delivery Request not found")
        
    req.status = "OUT_FOR_DELIVERY"
    await db.commit()
    await db.refresh(req)
    return req

@router.post("/request/{request_id}/reject", response_model=DeliveryRequestSchema)
async def reject_request(request_id: UUID, db: AsyncSession = Depends(get_db)):
    req = await db.get(DeliveryRequest, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Delivery Request not found")
    req.status = "REJECTED"
    await db.commit()
    await db.refresh(req)
    return req

@router.post("/request/{request_id}/complete", response_model=DeliveryRequestSchema)
async def complete_order(request_id: UUID, db: AsyncSession = Depends(get_db)):
    req = await db.get(DeliveryRequest, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Delivery Request not found")
        
    req.status = "DELIVERED"
    await db.commit()
    await db.refresh(req)
    return req

@router.post("/request/{request_id}/customer-confirm", response_model=DeliveryRequestSchema)
async def customer_confirm(request_id: UUID, db: AsyncSession = Depends(get_db)):
    req = await db.get(DeliveryRequest, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Delivery Request not found")
    req.status = "CUSTOMER_CONFIRMED"
    await db.commit()
    await db.refresh(req)
    return req
