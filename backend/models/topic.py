from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum


class TopicType(str, Enum):
    """选题类型"""
    MOVIE_FOOD = "movie_food"          # 影视美食
    FAMOUS_RECIPE = "famous_recipe"    # 名店配方
    ARCHAEOLOGICAL = "archaeological"  # 考古美食


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

    # 选题类型
    topic_type: TopicType = TopicType.MOVIE_FOOD

    # 作品信息（影视美食用）
    work_name: str  # 作品名
    english_name: Optional[str] = None  # 英文名（用于 TMDB 搜索）
    work_type: str  # 电影/剧集/动漫/游戏
    douban_score: Optional[float] = None
    douban_url: Optional[str] = None
    release_year: Optional[int] = None
    poster_url: Optional[str] = None  # TMDB 海报 URL

    # 美食场景
    food_scene_description: str  # 美食场景描述
    recommended_dish: str  # 推荐做的菜
    dish_origin: Optional[str] = None  # 菜品文化背景

    # 故事切入点
    story_angles: List[StoryAngle]

    # 画面素材
    footage_sources: List[str]  # 画面素材来源提示
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

    # === 名店配方专用字段 ===
    restaurant_name: Optional[str] = None        # 餐厅名称
    restaurant_location: Optional[str] = None    # 餐厅位置（城市、国家）
    michelin_stars: Optional[int] = None         # 米其林星级 (1-3)
    chef_name: Optional[str] = None              # 主厨姓名
    chef_background: Optional[str] = None        # 主厨背景故事
    restaurant_story: Optional[str] = None       # 餐厅背景故事
    recipe_source_type: Optional[str] = None     # 配方来源类型（官网/书籍/采访）
    recipe_source_url: Optional[str] = None      # 原始配方URL
    dish_category: Optional[str] = None          # 菜品分类（甜品/正餐/开胃菜等）

    # === 考古美食专用字段 ===
    historical_period: Optional[str] = None      # 历史时期（如"维多利亚时代"）
    year_origin: Optional[int] = None            # 配方具体年份（如1867）
    historical_source: Optional[str] = None      # 史料来源（古籍名称）
    historical_source_url: Optional[str] = None  # 史料数字化链接
    cultural_context: Optional[str] = None       # 文化背景描述
    historical_figure: Optional[str] = None      # 相关历史人物（如"歌德家族"）
    archive_collection: Optional[str] = None     # 所属档案馆/数据库

    # 元数据
    discovered_at: datetime = datetime.now()
    source: str  # 发现来源

    def total_score(self) -> int:
        """综合评分"""
        score = 0

        # 基础分（根据类型不同）
        if self.topic_type == TopicType.MOVIE_FOOD:
            # 影视美食：豆瓣分权重
            score += (self.douban_score or 0) * 5
        elif self.topic_type == TopicType.FAMOUS_RECIPE:
            # 名店配方：米其林星级权重
            score += (self.michelin_stars or 0) * 15
            score += 20  # 名店基础分
        elif self.topic_type == TopicType.ARCHAEOLOGICAL:
            # 考古美食：历史年代权重（越老越有价值）
            if self.year_origin:
                age = 2025 - self.year_origin
                score += min(age // 10, 40)  # 每10年+1分，上限40
            score += 15  # 考古基础分

        # 故事潜力分
        score += sum(a.potential_score for a in self.story_angles)

        # 三有评分
        score += 10 if self.is_interesting else 0
        score += 8 if self.is_discussable else 0
        score += 12 if self.has_momentum else 0

        # 难度调整
        if self.cooking_difficulty in [CookingDifficulty.EASY, CookingDifficulty.MEDIUM]:
            score += 5
        else:
            score -= 10

        return int(score)
