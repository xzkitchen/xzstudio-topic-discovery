from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import os

from .api.routes import router
from .models.database import init_db

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
    # 关闭时清理（如果需要）
    logging.info("应用关闭")


app = FastAPI(
    title="XZstudio",
    description="美食选题发现工具",
    version="3.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
