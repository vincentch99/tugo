from pydantic import BaseModel
import uuid


class PortResponse(BaseModel):
    id: uuid.UUID
    name: str
    code: str
    city: str
    province: str
    island: str
    latitude: float
    longitude: float
    is_major: bool

    class Config:
        from_attributes = True
