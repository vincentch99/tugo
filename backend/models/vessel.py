import uuid
from datetime import datetime, timezone
from enum import Enum
from sqlalchemy import String, Boolean, DateTime, Numeric, Integer, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from core.database import Base


class VesselType(str, Enum):
    TUG = "tug"
    BARGE = "barge"


class Vessel(Base):
    __tablename__ = "vessels"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    vessel_type: Mapped[VesselType] = mapped_column(SAEnum(VesselType), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    registration_number: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    capacity_tons: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    length_m: Mapped[float] = mapped_column(Numeric(8, 2), nullable=False)
    beam_m: Mapped[float] = mapped_column(Numeric(8, 2), nullable=False)
    draft_m: Mapped[float] = mapped_column(Numeric(8, 2), nullable=False)
    horsepower: Mapped[int | None] = mapped_column(Integer)
    home_port: Mapped[str] = mapped_column(String(255), nullable=False)
    current_location: Mapped[str] = mapped_column(String(255), nullable=False)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    daily_rate_usd: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    description: Mapped[str | None] = mapped_column(String(1000))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    owner = relationship("User", back_populates="vessels")
    matches = relationship("AIMatch", back_populates="vessel", lazy="selectin")
    bookings = relationship("Booking", back_populates="vessel", lazy="selectin")
