from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import os

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from .api.routes import router
from .models.database import init_db, close_db
from .scrapers.tmdb import close_tmdb_client

# 速率限制器
limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

# CORS 配置：支持环境变量自定义
def get_cors_origins():
    """获取允许的 CORS 来源"""
    # 默认开发环境来源
    default_origins = ["http://localhost:3000", "http://localhost:5173"]

    # 从环境变量读取额外的来源（逗号分隔）
    extra_origins = os.getenv("CORS_ORIGINS", "")
    if extra_origins:
        default_origins.extend([o.strip() for o in extra_origins.split(",") if o.strip()])

    return default_origins


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时初始化
    await init_db()
    logging.info("数据库初始化完成")
    yield
    # 关闭时清理资源
    await close_tmdb_client()
    await close_db()
    logging.info("应用关闭，资源已释放")


app = FastAPI(
    title="XZstudio",
    description="美食选题发现工具",
    version="3.0.0",
    lifespan=lifespan
)

# 配置速率限制
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
)

# 注册路由
app.include_router(router)


@app.get("/")
async def root():
    return {
        "name": "XZstudio",
        "version": "3.0.0",
        "description": "美食选题发现工具",
        "endpoints": {
            "status": "/api/status",
            "discover": "POST /api/collect",
            "topics": "GET /api/topics",
            "favorites": "GET /api/favorites/full",
            "mark_done": "POST /api/topics/{id}/done"
        }
    }
