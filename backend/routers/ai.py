import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.database import get_db
from core.security import get_current_user
from core.redis import cache_get, cache_set
from models.user import User, UserRole
from models.shipment import ShipmentRequest, ShipmentStatus
from models.vessel import Vessel
from models.match import AIMatch
from models.port import IndonesianPort
from schemas.match import MatchRequest, RouteRequest, PriceRequest, MatchResponse
from services import ai_service

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/match", response_model=list[MatchResponse])
async def run_matching(
    payload: MatchRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.SHIPPER:
        raise HTTPException(status_code=403, detail="Only shippers can request matching")

    # Check cache
    cache_key = f"ai_match:{payload.shipment_id}"
    cached = await cache_get(cache_key)
    if cached:
        result = await db.execute(
            select(AIMatch)
            .where(AIMatch.shipment_id == payload.shipment_id)
            .order_by(AIMatch.match_score.desc())
        )
        existing = result.scalars().all()
        if existing:
            return existing

    # Load shipment
    result = await db.execute(select(ShipmentRequest).where(ShipmentRequest.id == payload.shipment_id))
    shipment = result.scalar_one_or_none()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    if shipment.shipper_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your shipment")

    # Load ports
    origin_result = await db.execute(select(IndonesianPort).where(IndonesianPort.id == shipment.origin_port_id))
    origin_port = origin_result.scalar_one_or_none()
    dest_result = await db.execute(select(IndonesianPort).where(IndonesianPort.id == shipment.destination_port_id))
    dest_port = dest_result.scalar_one_or_none()

    # Load available vessels (barges need tugs, but we match all vessel types and let AI decide)
    vessels_result = await db.execute(
        select(Vessel).where(Vessel.is_available == True, Vessel.capacity_tons >= shipment.cargo_weight_tons * 0.9)
    )
    vessels = vessels_result.scalars().all()

    if not vessels:
        raise HTTPException(status_code=404, detail="No available vessels found for this shipment")

    shipment_data = {
        "id": str(shipment.id),
        "commodity_type": shipment.commodity_type,
        "cargo_weight_tons": float(shipment.cargo_weight_tons),
        "origin_port": {"name": origin_port.name, "city": origin_port.city, "island": origin_port.island, "latitude": float(origin_port.latitude), "longitude": float(origin_port.longitude)} if origin_port else {},
        "destination_port": {"name": dest_port.name, "city": dest_port.city, "island": dest_port.island, "latitude": float(dest_port.latitude), "longitude": float(dest_port.longitude)} if dest_port else {},
        "departure_date": str(shipment.departure_date),
        "arrival_deadline": str(shipment.arrival_deadline),
        "special_requirements": shipment.special_requirements,
    }

    vessels_data = [
        {
            "id": str(v.id),
            "vessel_type": v.vessel_type,
            "name": v.name,
            "capacity_tons": float(v.capacity_tons),
            "length_m": float(v.length_m),
            "beam_m": float(v.beam_m),
            "draft_m": float(v.draft_m),
            "horsepower": v.horsepower,
            "current_location": v.current_location,
            "daily_rate_usd": float(v.daily_rate_usd),
        }
        for v in vessels
    ]

    ai_results = await ai_service.match_vessels(shipment_data, vessels_data)

    # Save matches to DB
    saved_matches = []
    for match_data in ai_results:
        vessel_id = match_data.get("vessel_id")
        vessel_result = await db.execute(select(Vessel).where(Vessel.id == vessel_id))
        vessel = vessel_result.scalar_one_or_none()
        if not vessel:
            continue

        # Get route optimization for this match
        route_data = {}
        try:
            route_data = await ai_service.optimize_route(
                origin=shipment_data["origin_port"],
                destination=shipment_data["destination_port"],
                vessel={"type": vessel.vessel_type, "draft_m": float(vessel.draft_m)},
                cargo_weight_tons=float(shipment.cargo_weight_tons),
                commodity_type=shipment.commodity_type,
            )
        except Exception:
            route_data = {}

        ai_match = AIMatch(
            shipment_id=shipment.id,
            vessel_id=vessel.id,
            match_score=float(match_data.get("match_score", 0)),
            ai_reasoning=match_data.get("reasoning", ""),
            estimated_route=route_data,
            estimated_distance_nm=route_data.get("distance_nm"),
            estimated_duration_days=route_data.get("duration_days"),
            estimated_price_usd=match_data.get("estimated_price_usd"),
            price_breakdown=match_data.get("price_breakdown", {}),
        )
        db.add(ai_match)
        saved_matches.append(ai_match)

    # Update shipment status
    if saved_matches:
        shipment.status = ShipmentStatus.MATCHED

    await db.commit()
    for m in saved_matches:
        await db.refresh(m)

    # Cache result
    await cache_set(cache_key, {"matched": True}, ttl=3600)

    return sorted(saved_matches, key=lambda m: m.match_score, reverse=True)


@router.post("/route")
async def get_route(
    payload: RouteRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    shipment_result = await db.execute(select(ShipmentRequest).where(ShipmentRequest.id == payload.shipment_id))
    shipment = shipment_result.scalar_one_or_none()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    vessel_result = await db.execute(select(Vessel).where(Vessel.id == payload.vessel_id))
    vessel = vessel_result.scalar_one_or_none()
    if not vessel:
        raise HTTPException(status_code=404, detail="Vessel not found")

    origin_result = await db.execute(select(IndonesianPort).where(IndonesianPort.id == shipment.origin_port_id))
    origin_port = origin_result.scalar_one_or_none()
    dest_result = await db.execute(select(IndonesianPort).where(IndonesianPort.id == shipment.destination_port_id))
    dest_port = dest_result.scalar_one_or_none()

    cache_key = f"route:{origin_port.code}:{dest_port.code}:{vessel.draft_m}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    route = await ai_service.optimize_route(
        origin={"name": origin_port.name, "city": origin_port.city, "island": origin_port.island, "latitude": float(origin_port.latitude), "longitude": float(origin_port.longitude)},
        destination={"name": dest_port.name, "city": dest_port.city, "island": dest_port.island, "latitude": float(dest_port.latitude), "longitude": float(dest_port.longitude)},
        vessel={"type": vessel.vessel_type, "draft_m": float(vessel.draft_m)},
        cargo_weight_tons=float(shipment.cargo_weight_tons),
        commodity_type=shipment.commodity_type,
    )

    await cache_set(cache_key, route, ttl=21600)
    return route


@router.post("/price")
async def get_price(
    payload: PriceRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    shipment_result = await db.execute(select(ShipmentRequest).where(ShipmentRequest.id == payload.shipment_id))
    shipment = shipment_result.scalar_one_or_none()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    vessel_result = await db.execute(select(Vessel).where(Vessel.id == payload.vessel_id))
    vessel = vessel_result.scalar_one_or_none()
    if not vessel:
        raise HTTPException(status_code=404, detail="Vessel not found")

    cache_key = f"pricing:{payload.shipment_id}:{payload.vessel_id}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    pricing = await ai_service.calculate_price(
        route_data={"distance_nm": payload.distance_nm, "duration_days": payload.duration_days},
        cargo_weight_tons=float(shipment.cargo_weight_tons),
        commodity_type=shipment.commodity_type,
        vessel_daily_rate=float(vessel.daily_rate_usd),
        special_requirements=shipment.special_requirements,
    )

    await cache_set(cache_key, pricing, ttl=1800)
    return pricing
