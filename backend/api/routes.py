from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Literal, Optional
from datetime import datetime
import asyncio

from ..core.collector import TopicCollector, CURATED_TOPICS
from ..data.ingredients import get_ingredients
from ..core.draft_generator import get_draft_generator
from ..models.database import (
    init_db,
    get_done_topics,
    mark_topic_done,
    toggle_favorite,
    get_favorites,
    is_favorited,
    skip_topic,
    get_skipped_topics,
    get_skip_stats
)


class SkipRequest(BaseModel):
    topic_id: str
    work_name: str
    dish_name: str = ""
    reason: Literal["not_interested", "not_suitable", "too_simple", "done"]


class MaterialItem(BaseModel):
    id: str
    type: str
    content: str
    source: Optional[str] = None


class OutlineItem(BaseModel):
    id: str
    title: str
    structure: str
    hook: str
    wordCount: int = 350


class GenerateDraftRequest(BaseModel):
    materials: List[MaterialItem]
    outline: OutlineItem

router = APIRouter(prefix="/api", tags=["topics"])

collector = TopicCollector()

# 状态跟踪（使用 Lock 保护并发访问）
_discovery_lock = asyncio.Lock()
discovery_status = {
    "is_running": False,
    "last_run": None,
    "last_count": 0
}


@router.get("/status")
async def get_status():
    """获取发现状态"""
    return discovery_status


@router.post("/collect")
async def trigger_collect():
    """收集选题候选（返回完整数据）"""
    async with _discovery_lock:
        if discovery_status["is_running"]:
            raise HTTPException(status_code=409, detail="收集任务正在运行中")
        discovery_status["is_running"] = True

    try:
        # 获取所有符合条件的选题
        topics = await collector.collect_topics()

        # 获取收藏状态
        favorites = await get_favorites()
        favorite_ids = set(favorites)

        # 标记收藏状态
        for topic in topics:
            topic["is_favorited"] = topic.get("id") in favorite_ids

        async with _discovery_lock:
            discovery_status["last_run"] = datetime.now().isoformat()
            discovery_status["last_count"] = len(topics)

        return {
            "status": "success",
            "count": len(topics),
            "topics": topics,
            "formatted": collector.format_for_analysis(topics),
            "message": f"收集完成！{len(topics)}个选题已准备好"
        }
    finally:
        async with _discovery_lock:
            discovery_status["is_running"] = False


@router.get("/topics")
async def get_topics(limit: int = None) -> List[Dict[str, Any]]:
    """获取选题候选列表（完整数据）"""
    topics = await collector.collect_topics(max_count=limit)

    # 获取收藏状态
    favorites = await get_favorites()
    favorite_ids = set(favorites)

    # 标记收藏状态
    for topic in topics:
        topic["is_favorited"] = topic.get("id") in favorite_ids

    return topics


@router.get("/topics/formatted")
async def get_formatted_topics():
    """获取格式化的选题列表（供 Claude Code 分析）"""
    topics = await collector.collect_topics()
    return {
        "formatted": collector.format_for_analysis(topics),
        "count": len(topics)
    }


@router.post("/topics/{topic_id}/favorite")
async def toggle_topic_favorite(topic_id: str):
    """切换选题收藏状态"""
    is_now_favorited = await toggle_favorite(topic_id)
    return {
        "topic_id": topic_id,
        "is_favorited": is_now_favorited
    }


@router.get("/favorites")
async def get_favorite_topics():
    """获取收藏的选题ID列表"""
    favorites = await get_favorites()
    return {"favorites": favorites, "count": len(favorites)}


@router.get("/favorites/full")
async def get_favorite_topics_full():
    """获取收藏选题的完整数据（带海报等）"""
    favorites = await get_favorites()
    if not favorites:
        return {"topics": [], "count": 0}

    favorite_set = set(favorites)
    result = []

    for topic in CURATED_TOPICS:
        if topic.get("id") in favorite_set:
            # 获取海报
            poster_url = None
            if collector.tmdb:
                try:
                    poster_url = await collector.tmdb.get_movie_poster(
                        topic["work_name"],
                        topic.get("release_year")
                    )
                except Exception:
                    pass

            # 构建完整数据
            result.append({
                **topic,
                "poster_url": poster_url,
                "is_favorited": True,
                "is_done": False,
                "collected_at": datetime.now().isoformat()
            })

    return {"topics": result, "count": len(result)}


@router.post("/topics/done")
async def mark_done(work_name: str, dish_name: str = ""):
    """标记选题为已完成（不再推荐）"""
    await mark_topic_done(work_name, dish_name)
    return {"status": "success", "message": f"已标记 {work_name} 为已完成"}


@router.get("/done")
async def get_done():
    """获取已完成的选题列表"""
    done = await get_done_topics()
    return {"done_topics": done, "count": len(done)}


@router.post("/topics/skip")
async def skip_topic_endpoint(request: SkipRequest):
    """
    跳过一个选题，记录原因用于学习偏好

    原因说明:
    - not_interested: 对这个选题不感兴趣
    - not_suitable: 不适合我做（技术/设备/食材限制）
    - too_simple: 画面太简单，撑不起内容
    - done: 已经做过了
    """
    await skip_topic(
        request.topic_id,
        request.work_name,
        request.dish_name,
        request.reason
    )
    return {
        "status": "success",
        "message": f"已跳过 {request.work_name}",
        "reason": request.reason
    }


@router.get("/skip-stats")
async def get_skip_statistics():
    """获取跳过统计，用于分析用户偏好"""
    stats = await get_skip_stats()
    return stats


@router.get("/topics/single/random")
async def get_single_random_topic(exclude: str = ""):
    """
    获取单个新选题（用于补充列表）

    Args:
        exclude: 逗号分隔的要排除的topic_id列表
    """
    exclude_ids = set(exclude.split(",")) if exclude else set()

    # 获取已做过和已跳过的选题
    done_topics = await get_done_topics()
    done_set = set(done_topics)
    skipped_topics = await get_skipped_topics()

    for topic in CURATED_TOPICS:
        topic_key = f"{topic['work_name']}·{topic['recommended_dish']}"

        # 跳过已显示的
        if topic['id'] in exclude_ids:
            continue

        # 跳过已做过的
        if topic['work_name'] in done_set or topic_key in done_set:
            continue

        # 跳过已pass的
        if topic['id'] in skipped_topics:
            continue

        # 获取海报
        poster_url = None
        if collector.tmdb:
            try:
                poster_url = await collector.tmdb.get_movie_poster(
                    topic["work_name"],
                    topic.get("release_year")
                )
            except Exception:
                pass

        # 返回第一个符合条件的选题
        result = {
            **topic,
            "poster_url": poster_url,
            "is_favorited": await is_favorited(topic['id']),
            "is_done": False,
            "collected_at": datetime.now().isoformat()
        }
        return result

    # 没有更多选题
    return None


@router.get("/topics/{topic_id}")
async def get_topic_by_id(topic_id: str):
    """获取单个选题详情"""
    # 直接从静态数据中查找，不受过滤逻辑影响
    for topic in CURATED_TOPICS:
        if topic.get("id") == topic_id:
            # 获取海报
            poster_url = None
            if collector.tmdb:
                try:
                    poster_url = await collector.tmdb.get_movie_poster(
                        topic["work_name"],
                        topic.get("release_year")
                    )
                except Exception:
                    pass

            # 构建完整的返回数据
            result = {
                **topic,
                "poster_url": poster_url,
                "is_favorited": await is_favorited(topic_id),
                "is_done": False,
                "collected_at": datetime.now().isoformat(),
                "ingredients": get_ingredients(topic.get("recommended_dish", ""))
            }
            return result

    raise HTTPException(status_code=404, detail="选题不存在")


@router.post("/workflow/{topic_id}/generate-materials")
async def generate_materials(topic_id: str, request: Dict[str, Any]):
    """
    生成素材（结合预置数据 + 待挖掘方向）

    优先使用 CURATED_TOPICS 中的真实数据作为已核实素材，
    其他方向作为待挖掘提示。
    """
    # 从 CURATED_TOPICS 查找完整选题数据
    topic_data = None
    for topic in CURATED_TOPICS:
        if topic.get("id") == topic_id:
            topic_data = topic
            break

    # 如果没找到，用请求中的数据
    work_name = topic_data.get("work_name") if topic_data else request.get("work_name", "未知作品")
    dish_name = topic_data.get("recommended_dish") if topic_data else request.get("dish_name", "未知菜品")
    food_scene = topic_data.get("food_scene_description") if topic_data else request.get("food_scene", "")
    dish_origin = topic_data.get("dish_origin", "") if topic_data else ""
    story_angles = topic_data.get("story_angles", []) if topic_data else []
    backup_angles = topic_data.get("backup_angles", []) if topic_data else []
    opening_hooks = topic_data.get("opening_hooks", []) if topic_data else []
    cooking_notes = topic_data.get("cooking_notes", "") if topic_data else ""
    douban_score = topic_data.get("douban_score", 0) if topic_data else 0
    release_year = topic_data.get("release_year", 0) if topic_data else 0

    materials = []
    mid = 1

    # ========== 作品细节（已核实）==========
    if food_scene:
        materials.append({
            "id": f"m{mid}", "category": "作品细节",
            "content": f"《{work_name}》中的美食场景：{food_scene}",
            "credibility": "已核实", "sourceNote": "作品原片"
        })
        mid += 1

    # 故事切入点 - 标记为"方向提示"，提醒用户这些需要展开
    for angle in story_angles:
        materials.append({
            "id": f"m{mid}", "category": angle.get("angle_type", "故事角度"),
            "content": f"[方向] {angle['title']}：{angle['description']}",
            "credibility": "待挖掘", "sourceNote": "需要搜索资料展开",
            "potential_score": angle.get("potential_score", 7)
        })
        mid += 1

    # 备选切入点 - 同样标记为方向提示
    for angle in backup_angles:
        materials.append({
            "id": f"m{mid}", "category": angle.get("angle_type", "故事角度"),
            "content": f"[方向] {angle['title']}：{angle['description']}",
            "credibility": "待挖掘", "sourceNote": "备选方向，需搜索验证",
            "potential_score": angle.get("potential_score", 5)
        })
        mid += 1

    # ========== 开场钩子（已核实）==========
    for hook in opening_hooks:
        materials.append({
            "id": f"m{mid}", "category": "开场钩子",
            "content": hook["content"],
            "credibility": "已核实", "sourceNote": f"类型：{hook['type']}"
        })
        mid += 1

    # ========== 历史源头 ==========
    if dish_origin:
        materials.append({
            "id": f"m{mid}", "category": "历史源头",
            "content": f"{dish_name}：{dish_origin}",
            "credibility": "已核实", "sourceNote": "菜品资料"
        })
        mid += 1

    # ========== 冷知识 ==========
    if cooking_notes:
        materials.append({
            "id": f"m{mid}", "category": "冷知识",
            "content": f"烹饪提示：{cooking_notes}",
            "credibility": "已核实", "sourceNote": "烹饪分析"
        })
        mid += 1

    return {"materials": materials, "count": len(materials)}


@router.post("/workflow/{topic_id}/generate-draft")
async def generate_draft(topic_id: str, request: GenerateDraftRequest):
    """
    使用 AI 生成旁白文案

    根据用户选择的素材和大纲结构，调用 Claude API 生成符合熙崽风格的文案。
    """
    # 获取选题完整信息
    topic_data = None
    for topic in CURATED_TOPICS:
        if topic.get("id") == topic_id:
            topic_data = topic
            break

    if not topic_data:
        raise HTTPException(status_code=404, detail="选题不存在")

    # 获取生成器
    generator = get_draft_generator()

    if not generator.is_available():
        raise HTTPException(
            status_code=503,
            detail="AI 生成功能不可用，请检查 ANTHROPIC_API_KEY 配置"
        )

    # 转换素材格式
    materials = [
        {
            "id": m.id,
            "type": m.type,
            "content": m.content,
            "source": m.source
        }
        for m in request.materials
    ]

    # 转换大纲格式
    outline = {
        "id": request.outline.id,
        "title": request.outline.title,
        "structure": request.outline.structure,
        "hook": request.outline.hook,
        "wordCount": request.outline.wordCount
    }

    # 生成文案
    result = await generator.generate_draft(
        topic=topic_data,
        materials=materials,
        outline=outline
    )

    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])

    return {
        "success": True,
        "draft": result["draft"],
        "word_count": result["word_count"]
    }


@router.get("/ai/status")
async def get_ai_status():
    """检查 AI 生成功能是否可用"""
    generator = get_draft_generator()
    return {
        "available": generator.is_available(),
        "message": "AI 生成功能可用" if generator.is_available() else "未配置 ANTHROPIC_API_KEY"
    }


@router.get("/health")
async def health():
    """健康检查"""
    return {"status": "healthy", "version": "3.0", "name": "XZstudio"}
