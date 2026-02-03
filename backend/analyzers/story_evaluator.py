from anthropic import Anthropic
from typing import Dict, Any, List
import json
import re
import logging

logger = logging.getLogger(__name__)

STORY_EVAL_PROMPT = """根据熙崽的"有趣"标准，评估这个选题的潜力：

选题：{work_name} · {dish_name}
场景描述：{scene_description}
故事切入点：{story_angles}

熙崽的"有趣"标准（至少满足其一）：
- 有反转：结局和开头形成强烈对比（从囚犯食物变国宴、从差点自杀到拿艾美奖）
- 有冲突：认知冲突（你以为是A其实是B）、身份冲突（农民菜上米其林）、文化冲突（全世界vs只有XX）
- 有荒诞：历史的黑色幽默、命运的讽刺（最体面的人死亡率最高）
- 有"人"：不只是食物史，要有具体的人和故事（帕门蒂尔的阳谋、吉安卡洛的翻身）

成功案例参考：
- 玛德琳蛋糕：王后千年黑锅、历史荒诞感
- 无耻混蛋·苹果卷：瓦叔传奇试镜、昆汀执念
- 他们是神·茄汁焗豆：意大利人拍美国西部片、Scarpetta冷知识

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
    story_angles: List[Dict[str, Any]],
    api_key: str
) -> Dict[str, Any]:
    """评估选题的故事潜力"""

    client = Anthropic(api_key=api_key)

    # 格式化故事切入点
    angles_text = "\n".join([
        f"- {a.get('angle_type', '未知')}: {a.get('title', '')} - {a.get('description', '')}"
        for a in story_angles
    ]) if story_angles else "（暂无）"

    try:
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1500,
            messages=[{
                "role": "user",
                "content": STORY_EVAL_PROMPT.format(
                    work_name=work_name,
                    dish_name=dish_name,
                    scene_description=scene_description,
                    story_angles=angles_text
                )
            }]
        )

        response_text = message.content[0].text

        # 提取 JSON
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            result = json.loads(json_match.group())
            logger.info(f"评估完成: {work_name}·{dish_name}, score={result.get('recommendation_score')}")
            return result

        logger.warning(f"无法解析评估响应: {work_name}")
        return {"recommendation_score": 0, "is_interesting": False}

    except json.JSONDecodeError as e:
        logger.error(f"评估JSON解析错误: {work_name}, 错误: {e}")
        return {"recommendation_score": 0, "is_interesting": False}
    except Exception as e:
        logger.error(f"评估失败: {work_name}, 错误: {e}")
        return {"recommendation_score": 0, "is_interesting": False}
