from pydantic_settings import BaseSettings
from pathlib import Path
from typing import List


class Settings(BaseSettings):
    ANTHROPIC_API_KEY: str = ""
    TMDB_API_KEY: str = "5e9db32563dd5e00d90859ae2689f3c2"  # TMDB 海报 API
    DATABASE_PATH: Path = Path("data/topics.db")
    DOUBAN_DELAY: float = 2.0  # 请求间隔，避免被ban

    # 熙崽的筛选标准
    COOKING_SKILLS: List[str] = ["烘焙", "西餐", "甜点", "意大利菜", "法餐"]
    EXCLUDED_COOKING: List[str] = ["猛火爆炒", "中式炒菜", "烧烤"]
    MIN_DOUBAN_SCORE: float = 7.5

    class Config:
        env_file = ".env"


settings = Settings()
