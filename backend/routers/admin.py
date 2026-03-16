from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.database import get_db
from core.security import get_current_user
from models.user import User, UserRole
from models.vessel import Vessel
from models.shipment import ShipmentRequest, ShipmentStatus
from models.match import AIMatch
from schemas.auth import UserResponse
from schemas.shipment import ShipmentResponse
from schemas.vessel import VesselResponse
from schemas.match import MatchResponse
from pydantic import BaseModel
import uuid

router = APIRouter(prefix="/admin", tags=["admin"])


def _require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


class ManualRecommendRequest(BaseModel):
    shipment_id: uuid.UUID
    vessel_id: uuid.UUID


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(_require_admin),
):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return result.scalars().all()


@router.get("/board/shipments", response_model=list[ShipmentResponse])
async def board_shipments(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(_require_admin),
):
    result = await db.execute(
        select(ShipmentRequest)
        .where(ShipmentRequest.status.in_([ShipmentStatus.OPEN, ShipmentStatus.MATCHED]))
        .order_by(ShipmentRequest.created_at.desc())
    )
    return result.scalars().all()


@router.get("/board/vessels", response_model=list[VesselResponse])
async def board_vessels(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(_require_admin),
):
    result = await db.execute(
        select(Vessel).where(Vessel.is_available == True).order_by(Vessel.created_at.desc())
    )
    return result.scalars().all()


@router.post("/recommend", response_model=MatchResponse)
async def manual_recommend(
    payload: ManualRecommendRequest,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(_require_admin),
):
    shipment_result = await db.execute(
        select(ShipmentRequest).where(ShipmentRequest.id == payload.shipment_id)
    )
    shipment = shipment_result.scalar_one_or_none()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    vessel_result = await db.execute(select(Vessel).where(Vessel.id == payload.vessel_id))
    vessel = vessel_result.scalar_one_or_none()
    if not vessel:
        raise HTTPException(status_code=404, detail="Vessel not found")

    # Check if this pair already has a match
    existing = await db.execute(
        select(AIMatch).where(
            AIMatch.shipment_id == payload.shipment_id,
            AIMatch.vessel_id == payload.vessel_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Match already exists for this shipment-vessel pair")

    match = AIMatch(
        shipment_id=shipment.id,
        vessel_id=vessel.id,
        match_score=100.0,
        ai_reasoning="Manual recommendation by admin.",
        estimated_route={},
        price_breakdown={},
    )
    db.add(match)

    if shipment.status == ShipmentStatus.OPEN:
        shipment.status = ShipmentStatus.MATCHED

    await db.commit()
    await db.refresh(match)
    return match
