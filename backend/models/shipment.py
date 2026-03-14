import uuid
from datetime import datetime, date, timezone
from enum import Enum
from sqlalchemy import String, DateTime, Date, Numeric, ForeignKey, Text, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from core.database import Base


class ShipmentStatus(str, Enum):
    OPEN = "open"
    MATCHED = "matched"
    BOOKED = "booked"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class ShipmentRequest(Base):
    __tablename__ = "shipment_requests"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    shipper_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    commodity_type: Mapped[str] = mapped_column(String(255), nullable=False)
    cargo_weight_tons: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    origin_port_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("indonesian_ports.id"), nullable=False)
    destination_port_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("indonesian_ports.id"), nullable=False)
    departure_date: Mapped[date] = mapped_column(Date, nullable=False)
    arrival_deadline: Mapped[date] = mapped_column(Date, nullable=False)
    special_requirements: Mapped[str | None] = mapped_column(Text)
    status: Mapped[ShipmentStatus] = mapped_column(SAEnum(ShipmentStatus), default=ShipmentStatus.OPEN)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    shipper = relationship("User", back_populates="shipments")
    origin_port = relationship("IndonesianPort", foreign_keys=[origin_port_id], back_populates="origin_shipments")
    destination_port = relationship("IndonesianPort", foreign_keys=[destination_port_id], back_populates="destination_shipments")
    matches = relationship("AIMatch", back_populates="shipment", lazy="selectin")
    booking = relationship("Booking", back_populates="shipment", uselist=False, lazy="selectin")
