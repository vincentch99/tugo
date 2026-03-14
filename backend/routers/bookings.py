from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from core.database import get_db
from core.security import get_current_user
from models.user import User, UserRole
from models.booking import Booking, BookingStatus
from models.match import AIMatch
from models.shipment import ShipmentRequest, ShipmentStatus
from models.vessel import Vessel
from schemas.booking import BookingCreate, BookingStatusUpdate, BookingResponse
import uuid

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    payload: BookingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.SHIPPER:
        raise HTTPException(status_code=403, detail="Only shippers can create bookings")

    # Load match
    match_result = await db.execute(select(AIMatch).where(AIMatch.id == payload.match_id))
    match = match_result.scalar_one_or_none()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    # Verify shipment ownership
    shipment_result = await db.execute(select(ShipmentRequest).where(ShipmentRequest.id == match.shipment_id))
    shipment = shipment_result.scalar_one_or_none()
    if not shipment or shipment.shipper_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your shipment")

    # Check vessel still available
    vessel_result = await db.execute(select(Vessel).where(Vessel.id == match.vessel_id))
    vessel = vessel_result.scalar_one_or_none()
    if not vessel or not vessel.is_available:
        raise HTTPException(status_code=400, detail="Vessel is no longer available")

    booking = Booking(
        shipment_id=match.shipment_id,
        vessel_id=match.vessel_id,
        match_id=match.id,
        shipper_id=current_user.id,
        agreed_price_usd=payload.agreed_price_usd,
    )
    db.add(booking)

    # Mark vessel unavailable and shipment booked
    vessel.is_available = False
    shipment.status = ShipmentStatus.BOOKED

    await db.commit()
    await db.refresh(booking)
    return booking


@router.get("/", response_model=list[BookingResponse])
async def list_bookings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == UserRole.SHIPPER:
        query = select(Booking).where(Booking.shipper_id == current_user.id)
    else:
        # Vessel owner sees bookings for their vessels
        vessels_result = await db.execute(select(Vessel).where(Vessel.owner_id == current_user.id))
        vessel_ids = [v.id for v in vessels_result.scalars().all()]
        query = select(Booking).where(Booking.vessel_id.in_(vessel_ids))

    query = query.order_by(Booking.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


@router.put("/{booking_id}/status", response_model=BookingResponse)
async def update_booking_status(
    booking_id: uuid.UUID,
    payload: BookingStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.status = payload.status

    # If cancelled, free the vessel
    if payload.status == BookingStatus.CANCELLED:
        vessel_result = await db.execute(select(Vessel).where(Vessel.id == booking.vessel_id))
        vessel = vessel_result.scalar_one_or_none()
        if vessel:
            vessel.is_available = True
        shipment_result = await db.execute(select(ShipmentRequest).where(ShipmentRequest.id == booking.shipment_id))
        shipment = shipment_result.scalar_one_or_none()
        if shipment:
            shipment.status = ShipmentStatus.OPEN

    await db.commit()
    await db.refresh(booking)
    return booking
