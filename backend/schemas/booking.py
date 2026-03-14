from pydantic import BaseModel
from models.booking import BookingStatus
import uuid
from datetime import datetime


class BookingCreate(BaseModel):
    match_id: uuid.UUID
    agreed_price_usd: float


class BookingStatusUpdate(BaseModel):
    status: BookingStatus


class BookingResponse(BaseModel):
    id: uuid.UUID
    shipment_id: uuid.UUID
    vessel_id: uuid.UUID
    match_id: uuid.UUID | None
    shipper_id: uuid.UUID
    agreed_price_usd: float
    status: BookingStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
