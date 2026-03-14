import uuid
from sqlalchemy import String, Boolean, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from core.database import Base


class IndonesianPort(Base):
    __tablename__ = "indonesian_ports"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(10), unique=True, nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    province: Mapped[str] = mapped_column(String(100), nullable=False)
    island: Mapped[str] = mapped_column(String(100), nullable=False)
    latitude: Mapped[float] = mapped_column(Numeric(9, 6), nullable=False)
    longitude: Mapped[float] = mapped_column(Numeric(9, 6), nullable=False)
    is_major: Mapped[bool] = mapped_column(Boolean, default=False)

    origin_shipments = relationship("ShipmentRequest", back_populates="origin_port", foreign_keys="ShipmentRequest.origin_port_id", lazy="selectin")
    destination_shipments = relationship("ShipmentRequest", back_populates="destination_port", foreign_keys="ShipmentRequest.destination_port_id", lazy="selectin")
