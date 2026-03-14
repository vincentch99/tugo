from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.database import get_db
from core.security import get_current_user
from models.user import User, UserRole
from models.vessel import Vessel, VesselType
from schemas.vessel import VesselCreate, VesselUpdate, VesselResponse
from core.redis import cache_get, cache_set, cache_delete
import uuid

router = APIRouter(prefix="/vessels", tags=["vessels"])


def _require_owner(user: User):
    if user.role not in (UserRole.TUG_OWNER, UserRole.BARGE_OWNER):
        raise HTTPException(status_code=403, detail="Only vessel owners can perform this action")


@router.get("/", response_model=list[VesselResponse])
async def list_vessels(
    vessel_type: VesselType | None = Query(None),
    available_only: bool = Query(True),
    min_capacity: float | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    query = select(Vessel)
    if vessel_type:
        query = query.where(Vessel.vessel_type == vessel_type)
    if available_only:
        query = query.where(Vessel.is_available == True)
    if min_capacity:
        query = query.where(Vessel.capacity_tons >= min_capacity)
    query = query.order_by(Vessel.created_at.desc())

    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=VesselResponse, status_code=status.HTTP_201_CREATED)
async def create_vessel(
    payload: VesselCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_owner(current_user)

    # Validate vessel type matches owner role
    if current_user.role == UserRole.TUG_OWNER and payload.vessel_type != VesselType.TUG:
        raise HTTPException(status_code=400, detail="Tug owners can only list tug vessels")
    if current_user.role == UserRole.BARGE_OWNER and payload.vessel_type != VesselType.BARGE:
        raise HTTPException(status_code=400, detail="Barge owners can only list barge vessels")

    vessel = Vessel(owner_id=current_user.id, **payload.model_dump())
    db.add(vessel)
    await db.commit()
    await db.refresh(vessel)
    return vessel


@router.get("/{vessel_id}", response_model=VesselResponse)
async def get_vessel(vessel_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Vessel).where(Vessel.id == vessel_id))
    vessel = result.scalar_one_or_none()
    if not vessel:
        raise HTTPException(status_code=404, detail="Vessel not found")
    return vessel


@router.put("/{vessel_id}", response_model=VesselResponse)
async def update_vessel(
    vessel_id: uuid.UUID,
    payload: VesselUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_owner(current_user)
    result = await db.execute(select(Vessel).where(Vessel.id == vessel_id))
    vessel = result.scalar_one_or_none()
    if not vessel:
        raise HTTPException(status_code=404, detail="Vessel not found")
    if vessel.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your vessel")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(vessel, field, value)
    await db.commit()
    await db.refresh(vessel)
    return vessel


@router.delete("/{vessel_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vessel(
    vessel_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_owner(current_user)
    result = await db.execute(select(Vessel).where(Vessel.id == vessel_id))
    vessel = result.scalar_one_or_none()
    if not vessel:
        raise HTTPException(status_code=404, detail="Vessel not found")
    if vessel.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your vessel")

    vessel.is_available = False
    await db.commit()
