from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.database import get_db
from core.security import get_current_user
from models.user import User, UserRole
from models.shipment import ShipmentRequest, ShipmentStatus
from models.port import IndonesianPort
from schemas.shipment import ShipmentCreate, ShipmentStatusUpdate, ShipmentResponse
from schemas.match import MatchResponse
from models.match import AIMatch
import uuid

router = APIRouter(prefix="/shipments", tags=["shipments"])


def _require_shipper(user: User):
    if user.role != UserRole.SHIPPER:
        raise HTTPException(status_code=403, detail="Only shippers can perform this action")


@router.get("/", response_model=list[ShipmentResponse])
async def list_shipments(
    status: ShipmentStatus | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    query = select(ShipmentRequest)
    if status:
        query = query.where(ShipmentRequest.status == status)
    else:
        query = query.where(ShipmentRequest.status == ShipmentStatus.OPEN)
    query = query.order_by(ShipmentRequest.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=ShipmentResponse, status_code=status.HTTP_201_CREATED)
async def create_shipment(
    payload: ShipmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_shipper(current_user)

    # Validate ports exist
    for port_id in [payload.origin_port_id, payload.destination_port_id]:
        result = await db.execute(select(IndonesianPort).where(IndonesianPort.id == port_id))
        if not result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail=f"Port {port_id} not found")

    if payload.origin_port_id == payload.destination_port_id:
        raise HTTPException(status_code=400, detail="Origin and destination ports must be different")

    if payload.arrival_deadline <= payload.departure_date:
        raise HTTPException(status_code=400, detail="Arrival deadline must be after departure date")

    shipment = ShipmentRequest(shipper_id=current_user.id, **payload.model_dump())
    db.add(shipment)
    await db.commit()
    await db.refresh(shipment)
    return shipment


@router.get("/{shipment_id}", response_model=ShipmentResponse)
async def get_shipment(shipment_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ShipmentRequest).where(ShipmentRequest.id == shipment_id))
    shipment = result.scalar_one_or_none()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return shipment


@router.get("/{shipment_id}/matches", response_model=list[MatchResponse])
async def get_shipment_matches(shipment_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(AIMatch).where(AIMatch.shipment_id == shipment_id).order_by(AIMatch.match_score.desc())
    )
    return result.scalars().all()


@router.put("/{shipment_id}/status", response_model=ShipmentResponse)
async def update_shipment_status(
    shipment_id: uuid.UUID,
    payload: ShipmentStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(ShipmentRequest).where(ShipmentRequest.id == shipment_id))
    shipment = result.scalar_one_or_none()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    if shipment.shipper_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your shipment")

    shipment.status = payload.status
    await db.commit()
    await db.refresh(shipment)
    return shipment


@router.get("/my/shipments", response_model=list[ShipmentResponse])
async def my_shipments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_shipper(current_user)
    result = await db.execute(
        select(ShipmentRequest)
        .where(ShipmentRequest.shipper_id == current_user.id)
        .order_by(ShipmentRequest.created_at.desc())
    )
    return result.scalars().all()
