import aiosqlite
from pathlib import Path
from typing import List, Set, Optional
from contextlib import asynccontextmanager
from .topic import TopicCandidate
import json
import os
import logging

logger = logging.getLogger(__name__)

# 数据库放在本地目录，避免 iCloud Drive 同步导致的性能问题
# 使用 ~/.xzstudio 作为数据存储目录
LOCAL_DATA_DIR = Path.home() / ".xzstudio"
LOCAL_DATA_DIR.mkdir(exist_ok=True)
DATABASE_PATH = LOCAL_DATA_DIR / "topics.db"


class DatabaseManager:
    """数据库连接管理器 - 复用连接，避免频繁创建"""

    _instance: Optional["DatabaseManager"] = None

    def __init__(self):
        self._connection: Optional[aiosqlite.Connection] = None

    @classmethod
    def get_instance(cls) -> "DatabaseManager":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    async def get_connection(self) -> aiosqlite.Connection:
        """获取数据库连接（复用已有连接）"""
        if self._connection is None:
            self._connection = await aiosqlite.connect(
                DATABASE_PATH,
                isolation_level=None  # 自动提交模式
            )
            # 启用 WAL 模式提高并发性能
            await self._connection.execute("PRAGMA journal_mode=WAL")
            await self._connection.execute("PRAGMA synchronous=NORMAL")
            logger.info("数据库连接已建立")
        return self._connection

    async def close(self):
        """关闭数据库连接"""
        if self._connection is not None:
            await self._connection.close()
            self._connection = None
            logger.info("数据库连接已关闭")


@asynccontextmanager
async def get_db():
    """获取数据库连接的上下文管理器"""
    manager = DatabaseManager.get_instance()
    conn = await manager.get_connection()
    try:
        yield conn
    finally:
        pass  # 不关闭连接，保持复用


async def close_db():
    """关闭数据库连接（在应用关闭时调用）"""
    manager = DatabaseManager.get_instance()
    await manager.close()


async def init_db():
    """初始化数据库"""
    DATABASE_PATH.parent.mkdir(exist_ok=True)
    async with get_db() as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS topics (
                id TEXT PRIMARY KEY,
                data JSON,
                discovered_at TIMESTAMP,
                status TEXT DEFAULT 'pending'
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS done_topics (
                work_name TEXT,
                dish_name TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (work_name, dish_name)
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS discovery_runs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                topics_found INTEGER
            )
        """)
        # 收藏表
        await db.execute("""
            CREATE TABLE IF NOT EXISTS favorites (
                topic_id TEXT PRIMARY KEY,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        # 跳过/不感兴趣表 - 用于学习用户偏好
        await db.execute("""
            CREATE TABLE IF NOT EXISTS skipped_topics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                topic_id TEXT NOT NULL,
                work_name TEXT NOT NULL,
                dish_name TEXT,
                skip_reason TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.commit()


async def save_topics(topics: List[TopicCandidate], run_id: int = None):
    """保存选题到数据库"""
    async with get_db() as db:
        for topic in topics:
            await db.execute(
                "INSERT OR REPLACE INTO topics (id, data, discovered_at, status) VALUES (?, ?, ?, ?)",
                (topic.id, topic.model_dump_json(), topic.discovered_at.isoformat(), "pending")
            )
        await db.commit()


async def get_done_topics() -> Set[str]:
    """获取已做过的选题，避免重复"""
    async with get_db() as db:
        cursor = await db.execute("SELECT work_name, dish_name FROM done_topics")
        rows = await cursor.fetchall()
        return {f"{r[0]}·{r[1]}" for r in rows}


async def mark_topic_done(work_name: str, dish_name: str):
    """标记选题为已完成"""
    async with get_db() as db:
        await db.execute(
            "INSERT OR IGNORE INTO done_topics (work_name, dish_name) VALUES (?, ?)",
            (work_name, dish_name)
        )
        await db.commit()


async def get_latest_topics(limit: int = 20) -> List[TopicCandidate]:
    """获取最新的选题"""
    async with get_db() as db:
        cursor = await db.execute(
            "SELECT data FROM topics WHERE status = 'pending' ORDER BY discovered_at DESC LIMIT ?",
            (limit,)
        )
        rows = await cursor.fetchall()
        topics = []
        for row in rows:
            data = json.loads(row[0])
            topics.append(TopicCandidate(**data))
        return topics


async def create_discovery_run() -> int:
    """创建一次发现记录"""
    async with get_db() as db:
        cursor = await db.execute(
            "INSERT INTO discovery_runs (topics_found) VALUES (0)"
        )
        await db.commit()
        return cursor.lastrowid


async def update_discovery_run(run_id: int, topics_found: int):
    """更新发现记录"""
    async with get_db() as db:
        await db.execute(
            "UPDATE discovery_runs SET topics_found = ? WHERE id = ?",
            (topics_found, run_id)
        )
        await db.commit()


# ============ 收藏功能 ============

async def toggle_favorite(topic_id: str) -> bool:
    """切换收藏状态，返回新的收藏状态"""
    async with get_db() as db:
        # 检查是否已收藏
        cursor = await db.execute(
            "SELECT topic_id FROM favorites WHERE topic_id = ?",
            (topic_id,)
        )
        row = await cursor.fetchone()

        if row:
            # 已收藏，取消收藏
            await db.execute("DELETE FROM favorites WHERE topic_id = ?", (topic_id,))
            await db.commit()
            return False
        else:
            # 未收藏，添加收藏
            await db.execute(
                "INSERT INTO favorites (topic_id) VALUES (?)",
                (topic_id,)
            )
            await db.commit()
            return True


async def get_favorites() -> List[str]:
    """获取所有收藏的选题ID"""
    async with get_db() as db:
        cursor = await db.execute("SELECT topic_id FROM favorites")
        rows = await cursor.fetchall()
        return [r[0] for r in rows]


async def is_favorited(topic_id: str) -> bool:
    """检查选题是否已收藏"""
    async with get_db() as db:
        cursor = await db.execute(
            "SELECT topic_id FROM favorites WHERE topic_id = ?",
            (topic_id,)
        )
        row = await cursor.fetchone()
        return row is not None


# ============ 跳过/偏好学习功能 ============

async def skip_topic(topic_id: str, work_name: str, dish_name: str, reason: str) -> bool:
    """
    跳过一个选题并记录原因
    reason: 'not_interested' | 'not_suitable' | 'too_simple' | 'done'
    """
    async with get_db() as db:
        await db.execute(
            """INSERT INTO skipped_topics (topic_id, work_name, dish_name, skip_reason)
               VALUES (?, ?, ?, ?)""",
            (topic_id, work_name, dish_name, reason)
        )
        await db.commit()
        return True


async def get_skipped_topics() -> Set[str]:
    """获取所有被跳过的选题ID"""
    async with get_db() as db:
        cursor = await db.execute("SELECT DISTINCT topic_id FROM skipped_topics")
        rows = await cursor.fetchall()
        return {r[0] for r in rows}


async def get_skip_stats() -> dict:
    """获取跳过统计，用于偏好分析"""
    async with get_db() as db:
        # 按原因统计
        cursor = await db.execute(
            "SELECT skip_reason, COUNT(*) FROM skipped_topics GROUP BY skip_reason"
        )
        by_reason = {r[0]: r[1] for r in await cursor.fetchall()}

        # 按作品统计（可能揭示不喜欢的类型）
        cursor = await db.execute(
            "SELECT work_name, COUNT(*) FROM skipped_topics GROUP BY work_name ORDER BY COUNT(*) DESC LIMIT 10"
        )
        by_work = {r[0]: r[1] for r in await cursor.fetchall()}

        return {
            "by_reason": by_reason,
            "by_work": by_work,
            "total": sum(by_reason.values()) if by_reason else 0
        }
