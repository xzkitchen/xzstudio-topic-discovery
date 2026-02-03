from typing import List
import uuid
from datetime import datetime
import logging

from ..scrapers.douban import DoubanScraper
from ..analyzers.food_scene_analyzer import analyze_food_scene
from ..analyzers.story_evaluator import evaluate_story_potential
from ..models.topic import TopicCandidate, StoryAngle, CookingDifficulty
from ..models.database import get_done_topics, save_topics, create_discovery_run, update_discovery_run
from ..config import settings

logger = logging.getLogger(__name__)


class TopicDiscovery:
    """选题发现核心类"""

    def __init__(self):
        self.douban = DoubanScraper(delay=settings.DOUBAN_DELAY)

    async def discover_weekly_topics(self, max_movies: int = 30) -> List[TopicCandidate]:
        """每周选题发现主流程"""

        logger.info("开始每周选题发现...")

        # 创建本次发现记录
        run_id = await create_discovery_run()

        # 获取已做过的选题
        done_topics = await get_done_topics()
        logger.info(f"已有 {len(done_topics)} 个已完成选题")

        candidates = []

        # 1. 从豆瓣高分经典中发现
        logger.info("正在获取豆瓣高分经典...")
        classics = await self.douban.get_classic_high_score(
            min_year=1950,
            max_year=2020,
            min_score=settings.MIN_DOUBAN_SCORE
        )

        for i, movie in enumerate(classics[:max_movies]):
            # 跳过已做过的
            if any(movie["title"] in done for done in done_topics):
                logger.debug(f"跳过已做过: {movie['title']}")
                continue

            logger.info(f"[{i+1}/{min(len(classics), max_movies)}] 分析: {movie['title']}")

            # 搜索美食相关讨论
            discussions = await self.douban.search_food_scenes(movie["title"])

            if not discussions:
                logger.debug(f"未找到美食讨论: {movie['title']}")
                continue

            # AI 分析美食场景
            analysis = await analyze_food_scene(
                work_name=movie["title"],
                year=movie["year"],
                score=movie["score"],
                discussions=discussions,
                api_key=settings.ANTHROPIC_API_KEY
            )

            if not analysis.get("has_food_scene"):
                logger.debug(f"无美食场景: {movie['title']}, 原因: {analysis.get('reason', '未知')}")
                continue

            # 检查烹饪难度
            difficulty = analysis.get("cooking_difficulty", "中等")
            if difficulty == "超出能力":
                logger.debug(f"烹饪难度超出: {movie['title']}")
                continue

            # 评估故事潜力
            evaluation = await evaluate_story_potential(
                work_name=movie["title"],
                dish_name=analysis.get("recommended_dish", ""),
                scene_description=analysis.get("food_scene_description", ""),
                story_angles=analysis.get("story_angles", []),
                api_key=settings.ANTHROPIC_API_KEY
            )

            # 构建候选选题
            story_angles = []
            for angle in analysis.get("story_angles", []):
                try:
                    story_angles.append(StoryAngle(
                        angle_type=angle.get("angle_type", "其他"),
                        title=angle.get("title", ""),
                        description=angle.get("description", ""),
                        potential_score=angle.get("potential_score", 5)
                    ))
                except Exception as e:
                    logger.warning(f"构建故事角度失败: {e}")

            try:
                difficulty_enum = CookingDifficulty(difficulty)
            except ValueError:
                difficulty_enum = CookingDifficulty.MEDIUM

            topic = TopicCandidate(
                id=str(uuid.uuid4()),
                work_name=movie["title"],
                work_type="电影",
                douban_score=movie["score"],
                douban_url=movie.get("url"),
                release_year=movie["year"],
                food_scene_description=analysis.get("food_scene_description", ""),
                recommended_dish=analysis.get("recommended_dish", ""),
                dish_origin=analysis.get("dish_origin"),
                story_angles=story_angles,
                footage_sources=analysis.get("footage_sources", []),
                footage_available=bool(analysis.get("footage_sources")),
                cooking_difficulty=difficulty_enum,
                cooking_notes=analysis.get("cooking_notes"),
                is_interesting=evaluation.get("is_interesting", False),
                is_discussable=evaluation.get("is_discussable", False),
                has_momentum=False,  # 经典无时机热点
                source="豆瓣高分经典",
                discovered_at=datetime.now()
            )

            candidates.append(topic)
            logger.info(f"发现候选: {topic.work_name} · {topic.recommended_dish}, 评分: {topic.total_score()}")

        # 2. 从近期热点老片中发现
        logger.info("正在搜索近期热点老片...")
        hot_classics = await self.douban.get_hot_classic_rewatches()

        for movie in hot_classics[:15]:
            title = movie["title"]

            # 跳过已做过的
            if any(title in done for done in done_topics):
                continue

            # 跳过已经在候选中的
            if any(c.work_name == title for c in candidates):
                continue

            logger.info(f"分析热点: {title} (原因: {movie.get('heat_reason', '未知')})")

            discussions = await self.douban.search_food_scenes(title)

            if not discussions:
                continue

            analysis = await analyze_food_scene(
                work_name=title,
                year=2000,  # 热点老片年份不确定
                score=8.0,  # 假设评分
                discussions=discussions,
                api_key=settings.ANTHROPIC_API_KEY
            )

            if not analysis.get("has_food_scene"):
                continue

            difficulty = analysis.get("cooking_difficulty", "中等")
            if difficulty == "超出能力":
                continue

            evaluation = await evaluate_story_potential(
                work_name=title,
                dish_name=analysis.get("recommended_dish", ""),
                scene_description=analysis.get("food_scene_description", ""),
                story_angles=analysis.get("story_angles", []),
                api_key=settings.ANTHROPIC_API_KEY
            )

            story_angles = []
            for angle in analysis.get("story_angles", []):
                try:
                    story_angles.append(StoryAngle(
                        angle_type=angle.get("angle_type", "其他"),
                        title=angle.get("title", ""),
                        description=angle.get("description", ""),
                        potential_score=angle.get("potential_score", 5)
                    ))
                except Exception:
                    pass

            try:
                difficulty_enum = CookingDifficulty(difficulty)
            except ValueError:
                difficulty_enum = CookingDifficulty.MEDIUM

            topic = TopicCandidate(
                id=str(uuid.uuid4()),
                work_name=title,
                work_type="电影",
                douban_score=8.0,
                douban_url=movie.get("url"),
                release_year=2000,
                food_scene_description=analysis.get("food_scene_description", ""),
                recommended_dish=analysis.get("recommended_dish", ""),
                dish_origin=analysis.get("dish_origin"),
                story_angles=story_angles,
                footage_sources=analysis.get("footage_sources", []),
                footage_available=bool(analysis.get("footage_sources")),
                cooking_difficulty=difficulty_enum,
                cooking_notes=analysis.get("cooking_notes"),
                is_interesting=evaluation.get("is_interesting", False),
                is_discussable=evaluation.get("is_discussable", False),
                has_momentum=True,  # 热点标记
                heat_reason=movie.get("heat_reason"),
                source="近期热点",
                discovered_at=datetime.now()
            )

            candidates.append(topic)
            logger.info(f"发现热点候选: {topic.work_name} · {topic.recommended_dish}")

        # 排序：综合分数高的排前面
        candidates.sort(key=lambda x: x.total_score(), reverse=True)

        # 保存到数据库
        await save_topics(candidates)
        await update_discovery_run(run_id, len(candidates))

        logger.info(f"本次发现 {len(candidates)} 个选题")

        return candidates[:10]  # 返回 Top 10
