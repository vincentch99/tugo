from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.config import get_settings
from core.database import engine, Base
from routers import auth, vessels, shipments, ai, bookings, ports, admin

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup (use Alembic for production migrations)
    async with engine.begin() as conn:
        # Ensure 'admin' enum value exists before create_all
        from sqlalchemy import text
        await conn.execute(text("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'admin'"))
        await conn.run_sync(Base.metadata.create_all)

    # Seed Indonesian ports if empty
    from core.database import AsyncSessionLocal
    from models.port import IndonesianPort
    from data.indonesian_ports import INDONESIAN_PORTS
    from sqlalchemy import select, func

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(func.count()).select_from(IndonesianPort))
        count = result.scalar()
        if count == 0:
            for port_data in INDONESIAN_PORTS:
                port = IndonesianPort(**port_data)
                session.add(port)
            await session.commit()

    yield


app = FastAPI(
    title="TUGO.AI",
    description="AI-powered maritime logistics platform for Indonesia — matching tug & barge owners to shippers",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(ports.router, prefix=API_PREFIX)
app.include_router(vessels.router, prefix=API_PREFIX)
app.include_router(shipments.router, prefix=API_PREFIX)
app.include_router(ai.router, prefix=API_PREFIX)
app.include_router(bookings.router, prefix=API_PREFIX)
app.include_router(admin.router, prefix=API_PREFIX)


@app.get("/health")
async def health():
    return {"status": "ok", "app": settings.app_name}
