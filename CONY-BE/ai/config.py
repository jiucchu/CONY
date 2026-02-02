from pathlib import Path
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_ignore_empty=True,
        env_file_encoding="utf-8",
    )

    ENV: str = "local"
    CHROMA_HOST: str | None = None
    CHROMA_PORT: int | None = None
    CHROMA_PERSIST_DIR: str = str(BASE_DIR / "chroma_db")
    CHROMA_COLLECTION: str = "sale_embeddings"
    GMS_API_KEY: str | None = None
    GMS_MODEL: str | None = None
    EMBEDDING_MODEL: str | None = None
    PAYMENT_SERVICE_URL: str | None = None
    RUN_EMBEDDING_INTEGRATION: int = 0

@lru_cache
def get_settings() -> Settings:
    return Settings()
