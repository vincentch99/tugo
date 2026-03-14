from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql+asyncpg://tugo:tugo_secret@localhost:5432/tugo_db"

    # Redis
    redis_url: str = "redis://localhost:6379"

    # Security
    secret_key: str = "change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    # Anthropic
    anthropic_api_key: str = ""

    # App
    app_name: str = "TUGO.AI"
    debug: bool = False

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()
