from pydantic import BaseModel
from models.vessel import VesselType
import uuid
from datetime import datetime


class VesselCreate(BaseModel):
    vessel_type: VesselType
    name: str
    registration_number: str
    capacity_tons: float
    length_m: float
    beam_m: float
    draft_m: float
    horsepower: int | None = None
    home_port: str
    current_location: str
    daily_rate_usd: float
    description: str | None = None


class VesselUpdate(BaseModel):
    name: str | None = None
    current_location: str | None = None
    is_available: bool | None = None
    daily_rate_usd: float | None = None
    description: str | None = None


class VesselResponse(BaseModel):
    id: uuid.UUID
    owner_id: uuid.UUID
    vessel_type: VesselType
    name: str
    registration_number: str
    capacity_tons: float
    length_m: float
    beam_m: float
    draft_m: float
    horsepower: int | None
    home_port: str
    current_location: str
    is_available: bool
    daily_rate_usd: float
    description: str | None
    created_at: datetime

    class Config:
        from_attributes = True
