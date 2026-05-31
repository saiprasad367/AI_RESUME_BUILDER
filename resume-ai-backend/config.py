from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SUPABASE_URL: str = "https://your-supabase-url.supabase.co"
    SUPABASE_SERVICE_KEY: str = "your-service-key"
    SUPABASE_ANON_KEY: str = "your-anon-key"
    HF_API_TOKEN: str = "your-hf-token"
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

