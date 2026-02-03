# 选题发现工具 v1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 构建一个自动化选题发现工具，每周日运行，为熙崽输出下周可拍的影视美食选题。

**Architecture:**
- 前端：React + TypeScript + Tailwind CSS，极简高级感设计
- 后端：Python FastAPI，负责数据抓取、AI 分析、筛选逻辑
- 数据源：豆瓣高分经典、近期热点老片、知乎/小红书美食场景讨论
- AI：Claude API 进行美食场景识别和故事潜力评估
- 定时任务：cron 每周日自动执行

**Tech Stack:**
- Frontend: React 18, TypeScript, Tailwind CSS, Framer Motion
- Backend: Python 3.11+, FastAPI, httpx, BeautifulSoup4, Anthropic SDK
- Database: SQLite (轻量存储历史数据)
- Scheduler: Python APScheduler / macOS launchd

---

## Task 1: 项目初始化与基础架构

**Files:**
- Create: `tools/topic-discovery/backend/main.py`
- Create: `tools/topic-discovery/backend/requirements.txt`
- Create: `tools/topic-discovery/backend/config.py`
- Create: `tools/topic-discovery/frontend/package.json`
- Create: `tools/topic-discovery/frontend/src/App.tsx`

**Step 1: 创建后端项目结构**

```bash
cd "/Users/wuxi/Library/Mobile Documents/com~apple~CloudDocs/claude-skills/xizai-content/tools/topic-discovery"
mkdir -p backend/scrapers backend/analyzers backend/models backend/api
mkdir -p frontend/src/components frontend/src/hooks frontend/src/styles
```

**Step 2: 创建 requirements.txt**

```txt
fastapi==0.109.0
uvicorn==0.27.0
httpx==0.26.0
beautifulsoup4==4.12.3
lxml==5.1.0
anthropic==0.18.0
apscheduler==3.10.4
pydantic==2.6.0
python-dotenv==1.0.0
aiosqlite==0.19.0
```

**Step 3: 创建基础配置**

```python
# backend/config.py
from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    ANTHROPIC_API_KEY: str = ""
    DATABASE_PATH: Path = Path("data/topics.db")
    DOUBAN_DELAY: float = 2.0  # 请求间隔，避免被ban

    # 熙崽的筛选标准
    COOKING_SKILLS: list[str] = ["烘焙", "西餐", "甜点", "意大利菜", "法餐"]
    EXCLUDED_COOKING: list[str] = ["猛火爆炒", "中式炒菜", "烧烤"]
    MIN_DOUBAN_SCORE: float = 7.5

    class Config:
        env_file = ".env"

settings = Settings()
```

**Step 4: 创建 FastAPI 主入口**

```python
# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="熙崽选题发现工具",
    description="每周自动发现影视美食选题",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "选题发现工具运行中"}
```

---

## Task 2: 数据模型设计

**Files:**
- Create: `backend/models/topic.py`
- Create: `backend/models/database.py`

**Step 1: 创建选题数据模型**

```python
# backend/models/topic.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class CookingDifficulty(str, Enum):
    EASY = "简单"
    MEDIUM = "中等"
    HARD = "困难"
    BEYOND = "超出能力"

class StoryAngle(BaseModel):
    """故事切入点"""
    angle_type: str  # 菜品历史、演员幕后、剧情解读、其他
    title: str
    description: str
    potential_score: int  # 1-10 故事潜力分

class TopicCandidate(BaseModel):
    """选题候选"""
    id: Optional[str] = None

    # 作品信息
    work_name: str  # 作品名
    work_type: str  # 电影/剧集/动漫/游戏
    douban_score: float
    douban_url: Optional[str] = None
    release_year: int

    # 美食场景
    food_scene_description: str  # 美食场景描述
    recommended_dish: str  # 推荐做的菜
    dish_origin: Optional[str] = None  # 菜品文化背景

    # 故事切入点
    story_angles: list[StoryAngle]

    # 画面素材
    footage_sources: list[str]  # 画面素材来源提示
    footage_available: bool  # 是否确认有可用画面

    # 评估
    cooking_difficulty: CookingDifficulty
    cooking_notes: Optional[str] = None  # 烹饪注意事项

    # 三有评分
    is_interesting: bool  # 有趣（认知冲突）
    is_discussable: bool  # 有话题（想讨论分享）
    has_momentum: bool  # 有热点（时机优势）

    # 热度来源
    heat_reason: Optional[str] = None  # 为什么现在有热度

    # 元数据
    discovered_at: datetime = datetime.now()
    source: str  # 发现来源

    def total_score(self) -> int:
        """综合评分"""
        score = 0
        score += self.douban_score * 5  # 豆瓣分权重
        score += sum(a.potential_score for a in self.story_angles)
        score += 10 if self.is_interesting else 0
        score += 8 if self.is_discussable else 0
        score += 12 if self.has_momentum else 0  # 热点加权
        score += 5 if self.cooking_difficulty in [CookingDifficulty.EASY, CookingDifficulty.MEDIUM] else -10
        return int(score)
```

**Step 2: 创建数据库操作**

```python
# backend/models/database.py
import aiosqlite
from pathlib import Path
from .topic import TopicCandidate
import json

DATABASE_PATH = Path("data/topics.db")

async def init_db():
    DATABASE_PATH.parent.mkdir(exist_ok=True)
    async with aiosqlite.connect(DATABASE_PATH) as db:
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
                created_at TIMESTAMP
            )
        """)
        await db.commit()

async def save_topics(topics: list[TopicCandidate]):
    async with aiosqlite.connect(DATABASE_PATH) as db:
        for topic in topics:
            await db.execute(
                "INSERT OR REPLACE INTO topics (id, data, discovered_at) VALUES (?, ?, ?)",
                (topic.id, topic.model_dump_json(), topic.discovered_at)
            )
        await db.commit()

async def get_done_topics() -> set[str]:
    """获取已做过的选题，避免重复"""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        cursor = await db.execute("SELECT work_name, dish_name FROM done_topics")
        rows = await cursor.fetchall()
        return {f"{r[0]}·{r[1]}" for r in rows}
```

---

## Task 3: 豆瓣数据抓取模块

**Files:**
- Create: `backend/scrapers/douban.py`
- Create: `backend/scrapers/base.py`

**Step 1: 创建基础爬虫类**

```python
# backend/scrapers/base.py
import httpx
import asyncio
from abc import ABC, abstractmethod

class BaseScraper(ABC):
    def __init__(self, delay: float = 2.0):
        self.delay = delay
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        }

    async def fetch(self, url: str) -> str:
        async with httpx.AsyncClient() as client:
            await asyncio.sleep(self.delay)
            response = await client.get(url, headers=self.headers, follow_redirects=True)
            response.raise_for_status()
            return response.text

    @abstractmethod
    async def search(self, query: str) -> list[dict]:
        pass
```

**Step 2: 创建豆瓣爬虫**

```python
# backend/scrapers/douban.py
from bs4 import BeautifulSoup
from .base import BaseScraper
import re

class DoubanScraper(BaseScraper):
    """豆瓣电影数据抓取"""

    BASE_URL = "https://movie.douban.com"

    async def get_classic_high_score(self, min_year: int = 1950, max_year: int = 2020) -> list[dict]:
        """获取高分经典电影（排除近期上映）"""
        movies = []

        # 豆瓣 Top250 作为基础池
        for start in [0, 25, 50, 75, 100]:
            url = f"{self.BASE_URL}/top250?start={start}"
            html = await self.fetch(url)
            soup = BeautifulSoup(html, "lxml")

            for item in soup.select(".item"):
                title_elem = item.select_one(".title")
                score_elem = item.select_one(".rating_num")
                info_elem = item.select_one(".bd p")

                if not all([title_elem, score_elem, info_elem]):
                    continue

                title = title_elem.text.strip()
                score = float(score_elem.text)
                info = info_elem.text

                # 提取年份
                year_match = re.search(r"(\d{4})", info)
                year = int(year_match.group(1)) if year_match else 0

                # 筛选经典老片
                if min_year <= year <= max_year:
                    movies.append({
                        "title": title,
                        "score": score,
                        "year": year,
                        "url": item.select_one("a")["href"]
                    })

        return movies

    async def search_food_scenes(self, movie_title: str) -> list[str]:
        """搜索电影相关的美食讨论"""
        queries = [
            f"{movie_title} 美食",
            f"{movie_title} 食物",
            f"{movie_title} 吃饭场景",
            f"{movie_title} 经典场景 美食"
        ]

        discussions = []
        for query in queries:
            url = f"https://www.douban.com/search?q={query}"
            try:
                html = await self.fetch(url)
                soup = BeautifulSoup(html, "lxml")

                for result in soup.select(".result")[:5]:
                    text = result.get_text(strip=True)
                    if any(kw in text for kw in ["美食", "食物", "餐", "吃", "菜"]):
                        discussions.append(text[:200])
            except Exception:
                continue

        return discussions

    async def get_hot_classic_rewatches(self) -> list[dict]:
        """获取近期有热度的老片（重映、周年纪念等）"""
        # 搜索近期讨论度高的经典
        hot_keywords = [
            "经典重映",
            "周年纪念 电影",
            "修复版上映",
            "影史经典 重温"
        ]

        hot_movies = []
        for kw in hot_keywords:
            url = f"https://www.douban.com/search?q={kw}"
            try:
                html = await self.fetch(url)
                soup = BeautifulSoup(html, "lxml")

                for item in soup.select(".result-list .result")[:10]:
                    title_elem = item.select_one("h3 a")
                    if title_elem:
                        hot_movies.append({
                            "title": title_elem.text.strip(),
                            "heat_reason": kw
                        })
            except Exception:
                continue

        return hot_movies
```

---

## Task 4: 美食场景分析模块 (Claude AI)

**Files:**
- Create: `backend/analyzers/food_scene_analyzer.py`
- Create: `backend/analyzers/story_evaluator.py`

**Step 1: 创建美食场景分析器**

```python
# backend/analyzers/food_scene_analyzer.py
from anthropic import Anthropic
from ..config import settings
from ..models.topic import TopicCandidate, StoryAngle, CookingDifficulty
import json

client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)

FOOD_SCENE_PROMPT = """你是熙崽的选题助手。熙崽是美食博主，专注「故事驱动型美食内容」。

分析这部作品是否有值得做的美食选题：

作品：{work_name} ({year})
豆瓣评分：{score}
相关讨论：{discussions}

请分析：
1. 这部作品中是否有明确的美食/食物场景？具体描述
2. 推荐做什么菜？（优先烘焙/西餐，排除中式猛火爆炒）
3. 这道菜有什么历史/文化/阶级流变的故事？
4. 有没有演员/幕后相关的有趣故事？
5. 剧情/角色有什么值得解读的角度？
6. 画面素材从哪里找？（原片截图、网络图片等）
7. 烹饪难度评估（简单/中等/困难/超出能力）

返回JSON格式：
{{
    "has_food_scene": true/false,
    "food_scene_description": "场景描述",
    "recommended_dish": "推荐的菜",
    "story_angles": [
        {{"type": "菜品历史", "title": "标题", "description": "描述", "score": 1-10}},
        {{"type": "演员幕后", "title": "标题", "description": "描述", "score": 1-10}},
        {{"type": "剧情解读", "title": "标题", "description": "描述", "score": 1-10}}
    ],
    "footage_sources": ["来源1", "来源2"],
    "cooking_difficulty": "简单/中等/困难/超出能力",
    "cooking_notes": "烹饪注意事项",
    "is_interesting": true/false,
    "is_discussable": true/false,
    "reason": "判断理由"
}}"""

async def analyze_food_scene(work_name: str, year: int, score: float, discussions: list[str]) -> dict:
    """使用 Claude 分析作品的美食场景潜力"""

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2000,
        messages=[{
            "role": "user",
            "content": FOOD_SCENE_PROMPT.format(
                work_name=work_name,
                year=year,
                score=score,
                discussions="\n".join(discussions[:10])
            )
        }]
    )

    # 解析 JSON 响应
    response_text = message.content[0].text

    # 提取 JSON
    import re
    json_match = re.search(r'\{[\s\S]*\}', response_text)
    if json_match:
        return json.loads(json_match.group())

    return {"has_food_scene": False, "reason": "解析失败"}
```

**Step 2: 创建故事评估器**

```python
# backend/analyzers/story_evaluator.py
from anthropic import Anthropic
from ..config import settings

client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)

STORY_EVAL_PROMPT = """根据熙崽的"有趣"标准，评估这个选题：

选题：{work_name} · {dish_name}
场景描述：{scene_description}
故事切入点：{story_angles}

熙崽的"有趣"标准（至少满足其一）：
- 有反转：结局和开头形成强烈对比
- 有冲突：认知冲突、身份冲突、文化冲突
- 有荒诞：历史的黑色幽默、命运的讽刺
- 有"人"：不只是食物史，要有具体的人和故事

请评估：
1. 是否满足"有趣"标准？满足哪些？
2. 是否有话题性？（让人想讨论分享）
3. 有没有互动点潜力？（悬念/站队/共鸣/冷知识/系列）
4. 综合推荐度 1-10

返回JSON：
{{
    "is_interesting": true/false,
    "interesting_reasons": ["原因1", "原因2"],
    "is_discussable": true/false,
    "discussion_potential": "话题潜力描述",
    "interaction_ideas": ["互动点1", "互动点2"],
    "recommendation_score": 1-10,
    "summary": "一句话总结为什么值得做/不值得做"
}}"""

async def evaluate_story_potential(
    work_name: str,
    dish_name: str,
    scene_description: str,
    story_angles: list[dict]
) -> dict:
    """评估选题的故事潜力"""

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1500,
        messages=[{
            "role": "user",
            "content": STORY_EVAL_PROMPT.format(
                work_name=work_name,
                dish_name=dish_name,
                scene_description=scene_description,
                story_angles=str(story_angles)
            )
        }]
    )

    response_text = message.content[0].text

    import re, json
    json_match = re.search(r'\{[\s\S]*\}', response_text)
    if json_match:
        return json.loads(json_match.group())

    return {"recommendation_score": 0}
```

---

## Task 5: 选题发现主流程

**Files:**
- Create: `backend/core/discovery.py`
- Create: `backend/api/routes.py`

**Step 1: 创建选题发现核心逻辑**

```python
# backend/core/discovery.py
from ..scrapers.douban import DoubanScraper
from ..analyzers.food_scene_analyzer import analyze_food_scene
from ..analyzers.story_evaluator import evaluate_story_potential
from ..models.topic import TopicCandidate, StoryAngle, CookingDifficulty
from ..models.database import get_done_topics, save_topics
import uuid
from datetime import datetime

class TopicDiscovery:
    def __init__(self):
        self.douban = DoubanScraper()

    async def discover_weekly_topics(self) -> list[TopicCandidate]:
        """每周选题发现主流程"""

        # 获取已做过的选题
        done_topics = await get_done_topics()

        candidates = []

        # 1. 从豆瓣高分经典中发现
        classics = await self.douban.get_classic_high_score()

        for movie in classics[:30]:  # 限制数量避免 API 调用过多
            # 跳过已做过的
            if any(movie["title"] in done for done in done_topics):
                continue

            # 搜索美食相关讨论
            discussions = await self.douban.search_food_scenes(movie["title"])

            if not discussions:
                continue

            # AI 分析美食场景
            analysis = await analyze_food_scene(
                work_name=movie["title"],
                year=movie["year"],
                score=movie["score"],
                discussions=discussions
            )

            if not analysis.get("has_food_scene"):
                continue

            # 评估故事潜力
            evaluation = await evaluate_story_potential(
                work_name=movie["title"],
                dish_name=analysis.get("recommended_dish", ""),
                scene_description=analysis.get("food_scene_description", ""),
                story_angles=analysis.get("story_angles", [])
            )

            # 构建候选选题
            topic = TopicCandidate(
                id=str(uuid.uuid4()),
                work_name=movie["title"],
                work_type="电影",
                douban_score=movie["score"],
                douban_url=movie.get("url"),
                release_year=movie["year"],
                food_scene_description=analysis.get("food_scene_description", ""),
                recommended_dish=analysis.get("recommended_dish", ""),
                story_angles=[
                    StoryAngle(**angle) for angle in analysis.get("story_angles", [])
                ],
                footage_sources=analysis.get("footage_sources", []),
                footage_available=bool(analysis.get("footage_sources")),
                cooking_difficulty=CookingDifficulty(analysis.get("cooking_difficulty", "中等")),
                cooking_notes=analysis.get("cooking_notes"),
                is_interesting=evaluation.get("is_interesting", False),
                is_discussable=evaluation.get("is_discussable", False),
                has_momentum=False,  # 经典无时机热点
                source="豆瓣高分经典",
                discovered_at=datetime.now()
            )

            candidates.append(topic)

        # 2. 从近期热点老片中发现
        hot_classics = await self.douban.get_hot_classic_rewatches()

        for movie in hot_classics[:15]:
            # 类似流程，标记 has_momentum=True
            pass  # 简化示例

        # 排序：综合分数高的排前面
        candidates.sort(key=lambda x: x.total_score(), reverse=True)

        # 保存到数据库
        await save_topics(candidates)

        return candidates[:10]  # 返回 Top 10
```

**Step 2: 创建 API 路由**

```python
# backend/api/routes.py
from fastapi import APIRouter, HTTPException
from ..core.discovery import TopicDiscovery
from ..models.topic import TopicCandidate
from ..models.database import init_db

router = APIRouter(prefix="/api", tags=["topics"])

discovery = TopicDiscovery()

@router.on_event("startup")
async def startup():
    await init_db()

@router.post("/discover", response_model=list[TopicCandidate])
async def trigger_discovery():
    """手动触发选题发现"""
    topics = await discovery.discover_weekly_topics()
    return topics

@router.get("/topics", response_model=list[TopicCandidate])
async def get_latest_topics():
    """获取最新一期选题"""
    # 从数据库读取
    pass

@router.post("/topics/{topic_id}/mark-done")
async def mark_topic_done(topic_id: str):
    """标记选题为已完成（不再推荐）"""
    pass
```

---

## Task 6: 前端 UI 设计与实现

**Files:**
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/components/TopicCard.tsx`
- Create: `frontend/src/components/TopicList.tsx`
- Create: `frontend/src/styles/globals.css`
- Create: `frontend/tailwind.config.js`
- Create: `frontend/vite.config.ts`

**Step 1: 创建 Vite + React 项目配置**

```typescript
// frontend/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8000'
    }
  }
})
```

**Step 2: 创建全局样式**

```css
/* frontend/src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-primary: #0a0a0b;
  --bg-secondary: #141416;
  --bg-card: #1a1a1e;
  --text-primary: #fafafa;
  --text-secondary: #a1a1aa;
  --accent: #f59e0b;
  --accent-soft: rgba(245, 158, 11, 0.1);
  --border: rgba(255, 255, 255, 0.06);
}

body {
  @apply bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* 高级感卡片效果 */
.card-elegant {
  @apply relative overflow-hidden rounded-2xl;
  background: linear-gradient(
    135deg,
    rgba(26, 26, 30, 0.9) 0%,
    rgba(20, 20, 22, 0.95) 100%
  );
  border: 1px solid var(--border);
  backdrop-filter: blur(20px);
}

.card-elegant::before {
  content: '';
  @apply absolute inset-0 opacity-0 transition-opacity duration-500;
  background: linear-gradient(
    135deg,
    rgba(245, 158, 11, 0.03) 0%,
    transparent 50%
  );
}

.card-elegant:hover::before {
  @apply opacity-100;
}

/* 评分徽章 */
.score-badge {
  @apply inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium;
  background: var(--accent-soft);
  color: var(--accent);
}

/* 标签 */
.tag {
  @apply inline-flex items-center px-2 py-0.5 rounded text-xs;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
}

.tag-active {
  background: var(--accent-soft);
  color: var(--accent);
}
```

**Step 3: 创建选题卡片组件**

```tsx
// frontend/src/components/TopicCard.tsx
import { motion } from 'framer-motion'

interface StoryAngle {
  angle_type: string
  title: string
  description: string
  potential_score: number
}

interface Topic {
  id: string
  work_name: string
  work_type: string
  douban_score: number
  release_year: number
  food_scene_description: string
  recommended_dish: string
  story_angles: StoryAngle[]
  footage_sources: string[]
  cooking_difficulty: string
  is_interesting: boolean
  is_discussable: boolean
  has_momentum: boolean
}

export function TopicCard({ topic, index }: { topic: Topic; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="card-elegant p-6 group cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-white group-hover:text-amber-400 transition-colors">
            {topic.work_name}
            <span className="text-[var(--text-secondary)] font-normal ml-2">
              · {topic.recommended_dish}
            </span>
          </h3>
          <div className="flex items-center gap-3 mt-2">
            <span className="score-badge">
              ⭐ {topic.douban_score}
            </span>
            <span className="tag">{topic.work_type}</span>
            <span className="tag">{topic.release_year}</span>
            <span className="tag">{topic.cooking_difficulty}</span>
          </div>
        </div>

        {/* 三有指标 */}
        <div className="flex gap-1">
          {topic.is_interesting && (
            <span className="tag tag-active">有趣</span>
          )}
          {topic.is_discussable && (
            <span className="tag tag-active">有话题</span>
          )}
          {topic.has_momentum && (
            <span className="tag tag-active">有热点</span>
          )}
        </div>
      </div>

      {/* 美食场景描述 */}
      <p className="text-[var(--text-secondary)] text-sm mb-4 line-clamp-2">
        {topic.food_scene_description}
      </p>

      {/* 故事切入点 */}
      <div className="space-y-3 mb-4">
        <h4 className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
          故事切入点
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {topic.story_angles.map((angle, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
            >
              <span className="tag shrink-0">{angle.angle_type}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {angle.title}
                </p>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-0.5">
                  {angle.description}
                </p>
              </div>
              <div className="shrink-0 w-8 h-8 rounded-full bg-amber-400/10 flex items-center justify-center">
                <span className="text-xs font-bold text-amber-400">
                  {angle.potential_score}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 画面素材提示 */}
      <div className="pt-4 border-t border-white/5">
        <h4 className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">
          画面素材
        </h4>
        <div className="flex flex-wrap gap-2">
          {topic.footage_sources.map((source, i) => (
            <span key={i} className="tag">
              {source}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
```

**Step 4: 创建主页面**

```tsx
// frontend/src/App.tsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TopicCard } from './components/TopicCard'
import './styles/globals.css'

function App() {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  const fetchTopics = async () => {
    const res = await fetch('/api/topics')
    const data = await res.json()
    setTopics(data)
  }

  const triggerDiscovery = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/discover', { method: 'POST' })
      const data = await res.json()
      setTopics(data)
      setLastUpdate(new Date().toLocaleString('zh-CN'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTopics()
  }, [])

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <header className="max-w-5xl mx-auto mb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-end justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              选题发现
            </h1>
            <p className="text-[var(--text-secondary)] mt-2">
              每周日自动发现下周可拍的影视美食选题
            </p>
          </div>

          <div className="flex items-center gap-4">
            {lastUpdate && (
              <span className="text-sm text-[var(--text-secondary)]">
                最后更新: {lastUpdate}
              </span>
            )}
            <button
              onClick={triggerDiscovery}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-amber-400 text-black font-medium
                         hover:bg-amber-300 transition-colors disabled:opacity-50
                         flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  发现中...
                </>
              ) : (
                '立即发现'
              )}
            </button>
          </div>
        </motion.div>
      </header>

      {/* Topic Grid */}
      <main className="max-w-5xl mx-auto">
        <div className="grid gap-6">
          {topics.map((topic, index) => (
            <TopicCard key={topic.id} topic={topic} index={index} />
          ))}
        </div>

        {topics.length === 0 && !loading && (
          <div className="text-center py-20">
            <p className="text-[var(--text-secondary)]">
              还没有选题，点击「立即发现」开始
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
```

---

## Task 7: 定时任务配置

**Files:**
- Create: `backend/scheduler.py`
- Create: `scripts/run_weekly.sh`
- Create: `com.xizai.topic-discovery.plist` (macOS launchd)

**Step 1: 创建调度器**

```python
# backend/scheduler.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from .core.discovery import TopicDiscovery
import logging

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()
discovery = TopicDiscovery()

async def weekly_discovery_job():
    """每周日早上 9 点运行"""
    logger.info("开始每周选题发现...")
    topics = await discovery.discover_weekly_topics()
    logger.info(f"发现 {len(topics)} 个选题")
    # TODO: 发送通知（微信/邮件）

def setup_scheduler():
    scheduler.add_job(
        weekly_discovery_job,
        CronTrigger(day_of_week='sun', hour=9, minute=0),
        id='weekly_discovery',
        replace_existing=True
    )
    scheduler.start()
    logger.info("定时任务已启动：每周日 9:00 自动发现选题")
```

**Step 2: 创建启动脚本**

```bash
#!/bin/bash
# scripts/run_weekly.sh

cd "$(dirname "$0")/.."
source .venv/bin/activate
python -c "
import asyncio
from backend.core.discovery import TopicDiscovery

async def main():
    discovery = TopicDiscovery()
    topics = await discovery.discover_weekly_topics()
    print(f'发现 {len(topics)} 个选题')
    for t in topics:
        print(f'  - {t.work_name} · {t.recommended_dish} (评分: {t.total_score()})')

asyncio.run(main())
"
```

**Step 3: 创建 macOS 定时任务**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.xizai.topic-discovery</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>/Users/wuxi/Library/Mobile Documents/com~apple~CloudDocs/claude-skills/xizai-content/tools/topic-discovery/scripts/run_weekly.sh</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Weekday</key>
        <integer>0</integer>
        <key>Hour</key>
        <integer>9</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/tmp/topic-discovery.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/topic-discovery.error.log</string>
</dict>
</plist>
```

---

## Task 8: 整合与测试

**Files:**
- Update: `backend/main.py`
- Create: `frontend/package.json`
- Create: `README.md`

**Step 1: 完善后端入口**

```python
# backend/main.py (完整版)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .api.routes import router
from .scheduler import setup_scheduler
from .models.database import init_db
import asyncio

app = FastAPI(
    title="熙崽选题发现工具",
    description="每周自动发现影视美食选题",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.on_event("startup")
async def startup():
    await init_db()
    setup_scheduler()

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# 生产环境静态文件服务
# app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="static")
```

**Step 2: 创建前端 package.json**

```json
{
  "name": "topic-discovery-ui",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^11.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

**Step 3: 创建 README**

```markdown
# 熙崽选题发现工具 v1

每周日自动发现下周可拍的影视美食选题。

## 功能

- 🎬 从豆瓣高分经典中发现美食场景
- 🔥 追踪近期热点老片（重映、周年纪念等）
- 🤖 AI 分析美食场景和故事潜力
- 📊 三有评分（有趣/有话题/有热点）
- ⏰ 每周日 9:00 自动运行

## 快速开始

### 后端

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 配置 API Key
echo "ANTHROPIC_API_KEY=your-key" > .env

# 运行
uvicorn main:app --reload
```

### 前端

```bash
cd frontend
npm install
npm run dev
```

### 定时任务

```bash
# macOS
cp com.xizai.topic-discovery.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.xizai.topic-discovery.plist
```

## 设计理念

- 高级感 UI：深色主题 + 微妙渐变 + 流畅动画
- 信息密度：一眼看到关键信息
- 操作简洁：主要自动运行，手动只需一键触发
```

---

## 执行顺序

1. Task 1: 项目初始化（目录结构 + 基础配置）
2. Task 2: 数据模型（Pydantic models + SQLite）
3. Task 3: 豆瓣爬虫（高分经典 + 美食讨论搜索）
4. Task 4: AI 分析器（美食场景 + 故事评估）
5. Task 5: 核心流程（选题发现主逻辑 + API）
6. Task 6: 前端 UI（React + Tailwind + Framer Motion）
7. Task 7: 定时任务（APScheduler + launchd）
8. Task 8: 整合测试
