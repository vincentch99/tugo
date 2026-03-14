from pydantic import BaseModel
from schemas.vessel import VesselResponse
import uuid
from datetime import datetime


class MatchRequest(BaseModel):
    shipment_id: uuid.UUID


class RouteRequest(BaseModel):
    shipment_id: uuid.UUID
    vessel_id: uuid.UUID


class PriceRequest(BaseModel):
    shipment_id: uuid.UUID
    vessel_id: uuid.UUID
    distance_nm: float
    duration_days: float


class MatchResponse(BaseModel):
    id: uuid.UUID
    shipment_id: uuid.UUID
    vessel_id: uuid.UUID
    match_score: float
    ai_reasoning: str
    estimated_route: dict
    estimated_distance_nm: float | None
    estimated_duration_days: float | None
    estimated_price_usd: float | None
    price_breakdown: dict
    vessel: VesselResponse | None = None
    created_at: datetime

    class Config:
        from_attributes = True
