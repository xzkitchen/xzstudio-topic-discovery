from anthropic import Anthropic
from typing import Dict, Any, List
import json
import re
import logging

logger = logging.getLogger(__name__)

FOOD_SCENE_PROMPT = """你是熙崽的选题助手。熙崽是美食博主，专注「故事驱动型美食内容」——通过国际美食烹饪演示结合历史叙事。

分析这部作品是否有值得做的美食选题：

作品：{work_name} ({year})
豆瓣评分：{score}
相关讨论：
{discussions}

请分析：
1. 这部作品中是否有明确的美食/食物场景？具体描述
2. 推荐做什么菜？（优先烘焙/西餐/甜点，排除中式猛火爆炒）
3. 这道菜有什么历史/文化/阶级流变的故事？
4. 有没有演员/幕后相关的有趣故事？
5. 剧情/角色有什么值得解读的角度？
6. 画面素材从哪里找？（原片截图、网络图片等）
7. 烹饪难度评估（简单/中等/困难/超出能力）

重要判断标准（"有趣"至少满足其一）：
- 有反转：结局和开头形成强烈对比
- 有冲突：认知冲突、身份冲突、文化冲突
- 有荒诞：历史的黑色幽默、命运的讽刺
- 有"人"：不只是食物史，要有具体的人和故事

返回JSON格式：
{{
    "has_food_scene": true/false,
    "food_scene_description": "场景描述（如果有的话）",
    "recommended_dish": "推荐的菜（如果有的话）",
    "dish_origin": "菜品文化背景简述",
    "story_angles": [
        {{"angle_type": "菜品历史", "title": "标题", "description": "描述", "potential_score": 1-10}},
        {{"angle_type": "演员幕后", "title": "标题", "description": "描述", "potential_score": 1-10}},
        {{"angle_type": "剧情解读", "title": "标题", "description": "描述", "potential_score": 1-10}}
    ],
    "footage_sources": ["来源1", "来源2"],
    "cooking_difficulty": "简单/中等/困难/超出能力",
    "cooking_notes": "烹饪注意事项",
    "is_interesting": true/false,
    "is_discussable": true/false,
    "reason": "判断理由"
}}

如果这部作品没有明显的美食场景，或者不适合做选题，has_food_scene 返回 false 并说明原因。"""


async def analyze_food_scene(
    work_name: str,
    year: int,
    score: float,
    discussions: List[str],
    api_key: str
) -> Dict[str, Any]:
    """使用 Claude 分析作品的美食场景潜力"""

    client = Anthropic(api_key=api_key)

    discussions_text = "\n".join([f"- {d}" for d in discussions[:10]]) if discussions else "（暂无相关讨论）"

    try:
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2000,
            messages=[{
                "role": "user",
                "content": FOOD_SCENE_PROMPT.format(
                    work_name=work_name,
                    year=year,
                    score=score,
                    discussions=discussions_text
                )
            }]
        )

        response_text = message.content[0].text

        # 提取 JSON
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            result = json.loads(json_match.group())
            logger.info(f"分析完成: {work_name}, has_food_scene={result.get('has_food_scene')}")
            return result

        logger.warning(f"无法解析响应: {work_name}")
        return {"has_food_scene": False, "reason": "响应解析失败"}

    except json.JSONDecodeError as e:
        logger.error(f"JSON 解析错误: {work_name}, 错误: {e}")
        return {"has_food_scene": False, "reason": f"JSON解析错误: {e}"}
    except Exception as e:
        logger.error(f"分析失败: {work_name}, 错误: {e}")
        return {"has_food_scene": False, "reason": f"分析失败: {e}"}
