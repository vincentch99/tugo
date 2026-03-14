from pydantic import BaseModel
from models.shipment import ShipmentStatus
from schemas.port import PortResponse
import uuid
from datetime import date, datetime


class ShipmentCreate(BaseModel):
    commodity_type: str
    cargo_weight_tons: float
    origin_port_id: uuid.UUID
    destination_port_id: uuid.UUID
    departure_date: date
    arrival_deadline: date
    special_requirements: str | None = None


class ShipmentStatusUpdate(BaseModel):
    status: ShipmentStatus


class ShipmentResponse(BaseModel):
    id: uuid.UUID
    shipper_id: uuid.UUID
    commodity_type: str
    cargo_weight_tons: float
    origin_port_id: uuid.UUID
    destination_port_id: uuid.UUID
    origin_port: PortResponse | None = None
    destination_port: PortResponse | None = None
    departure_date: date
    arrival_deadline: date
    special_requirements: str | None
    status: ShipmentStatus
    created_at: datetime

    class Config:
        from_attributes = True
