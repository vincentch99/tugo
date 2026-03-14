from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.database import get_db
from models.port import IndonesianPort
from schemas.port import PortResponse

router = APIRouter(prefix="/ports", tags=["ports"])


@router.get("/", response_model=list[PortResponse])
async def list_ports(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(IndonesianPort).order_by(IndonesianPort.is_major.desc(), IndonesianPort.name))
    return result.scalars().all()
