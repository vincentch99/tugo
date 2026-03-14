import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Numeric, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from core.database import Base


class AIMatch(Base):
    __tablename__ = "ai_matches"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    shipment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("shipment_requests.id"), nullable=False)
    vessel_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("vessels.id"), nullable=False)
    match_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    ai_reasoning: Mapped[str] = mapped_column(Text, nullable=False)
    estimated_route: Mapped[dict] = mapped_column(JSONB, default=dict)
    estimated_distance_nm: Mapped[float | None] = mapped_column(Numeric(10, 2))
    estimated_duration_days: Mapped[float | None] = mapped_column(Numeric(6, 2))
    estimated_price_usd: Mapped[float | None] = mapped_column(Numeric(12, 2))
    price_breakdown: Mapped[dict] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    shipment = relationship("ShipmentRequest", back_populates="matches")
    vessel = relationship("Vessel", back_populates="matches")
    booking = relationship("Booking", back_populates="match", uselist=False)
