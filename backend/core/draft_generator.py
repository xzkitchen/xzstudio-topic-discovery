"""
AI 文案生成模块

使用 Claude API 生成符合熙崽风格的旁白文案
"""

import os
import logging
from typing import List, Dict, Any, Optional

try:
    import anthropic
    HAS_ANTHROPIC = True
except ImportError:
    HAS_ANTHROPIC = False

logger = logging.getLogger(__name__)

# 熙崽风格指南（嵌入）
STYLE_GUIDE = """
# 熙崽风格指南

## 风格定义
「故事驱动型美食内容」：通过电影/历史/文化切入，讲述食物背后的故事，烹饪穿插在叙事中。

## 开头：必须有钩子
好的类型：
- 认知冲突："全世界都把它做成了炖菜，只有匈牙利人还在拿着勺子喝"
- 反差/跃迁："从农民餐桌爬上米其林餐厅的炖菜"
- 震撼数据："二等舱92%的男性没能活下来"
- 悬念："差点让昆汀放弃拍摄"

坏的开头：介绍性开场、提问式开场、背景铺垫过长

## 结构：故事线 > 菜谱
1. 钩子（名场面/震撼事实）
2. 食物历史源头
3. 文化流变/阶级跃迁
4. 回扣电影深意或个人感受
5. 轻巧收尾

烹饪过程穿插在叙事里，不单独成段。

## 语气：朋友聊天
- 短句为主，一句话一个信息点
- 口语连接词：就、其实、结果、后来、不过
- 偶尔自嘲
- 不煽情，不说教

## 细节：具体数字和冷知识
必须有：具体年份/数量/比例、专有名词、冷知识

## 收尾：互动话题优先
好的收尾类型：
1. 悬念类：留一个我也没答案的问题
2. 站队类：抛出有争议的观点引发讨论
3. 共鸣类：引发回忆或共情
4. 系列类：预告下一期

坏的收尾：总结式、升华式、号召式、空洞感慨

## 字数要求
- 旁白正文：300-380 字（350字最佳）
- 每句 ≤25 字
- 每段 3-5 句

## 禁用词列表

### 开头废话（永远不用）
让我们一起来看看、说到XX不得不提、在这个XX的时代、你有没有想过、今天我们来聊聊

### 过渡词癌（永远不用）
值得一提的是、有趣的是、事实上、不仅如此、更重要的是、与此同时、首先...其次...最后

### 结尾套话（永远不用）
总的来说、总而言之、综上所述、希望这篇/这期能够

### 虚张声势（永远不用）
毫无疑问、不可否认、众所周知、显而易见、可以说是

### 空洞形容（尽量避免）
独特的、丰富的、深刻的、完美的、极致的、一段奇妙的旅程、不一样的XX、满满的XX

### 假装有感情（永远不用）
令人惊叹的是、令人感动的是、这不禁让人想到、让人不由得、仿佛在诉说着

## 写作规则
- 开头已提到的信息，后面不要重复
- 不确定的信息用"据说"、"传说"标注
- 避免同一段落重复使用同一个词
"""


class DraftGenerator:
    """AI 文案生成器"""

    def __init__(self):
        self.client = None
        if HAS_ANTHROPIC:
            api_key = os.getenv("ANTHROPIC_API_KEY")
            if api_key and api_key != "sk-ant-xxxxx":
                self.client = anthropic.Anthropic(api_key=api_key)
                logger.info("DraftGenerator 初始化成功")
            else:
                logger.warning("未配置有效的 ANTHROPIC_API_KEY")
        else:
            logger.warning("anthropic 库未安装，AI 生成功能不可用")

    def is_available(self) -> bool:
        """检查 AI 生成功能是否可用"""
        return self.client is not None

    async def generate_draft(
        self,
        topic: Dict[str, Any],
        materials: List[Dict[str, Any]],
        outline: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        生成旁白文案

        Args:
            topic: 选题信息（work_name, recommended_dish, food_scene_description 等）
            materials: 用户选择的素材列表
            outline: 用户选择的大纲结构

        Returns:
            {
                "success": bool,
                "draft": str,  # 生成的文案
                "word_count": int,
                "error": str | None
            }
        """
        if not self.client:
            return {
                "success": False,
                "draft": "",
                "word_count": 0,
                "error": "AI 生成功能不可用，请检查 ANTHROPIC_API_KEY 配置"
            }

        # 构建素材文本
        materials_text = self._format_materials(materials)

        # 构建提示
        prompt = f"""请根据以下信息，生成一段300-380字的短视频旁白文案。

## 选题信息
- 作品名：《{topic.get('work_name', '未知')}》
- 推荐菜品：{topic.get('recommended_dish', '未知')}
- 美食场景：{topic.get('food_scene_description', '无')}
- 菜品起源：{topic.get('dish_origin', '无')}

## 用户选择的大纲结构
- 标题：{outline.get('title', '未知')}
- 结构：{outline.get('structure', '未知')}
- 开场钩子示例：{outline.get('hook', '无')}

## 可用素材
{materials_text}

## 要求
1. 严格遵守风格指南中的所有规则
2. 字数控制在300-380字之间
3. 一句一行，方便录音
4. 开场必须有钩子（认知冲突/反差/数据/悬念）
5. 结尾必须是互动话题（悬念/站队/共鸣/系列），不要总结式收尾
6. 使用口语化表达，像朋友聊天
7. 不要使用禁用词列表中的任何词
8. 如果某个信息不确定，用"据说"、"传说"标注

请直接输出文案内容，不要加任何标题、说明或格式标记。每句话单独一行。"""

        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1024,
                system=STYLE_GUIDE,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

            draft = message.content[0].text.strip()
            word_count = len(draft.replace('\n', '').replace(' ', ''))

            logger.info(f"文案生成成功，字数：{word_count}")

            return {
                "success": True,
                "draft": draft,
                "word_count": word_count,
                "error": None
            }

        except Exception as e:
            logger.error(f"文案生成失败：{e}")
            return {
                "success": False,
                "draft": "",
                "word_count": 0,
                "error": str(e)
            }

    def _format_materials(self, materials: List[Dict[str, Any]]) -> str:
        """格式化素材列表"""
        if not materials:
            return "无可用素材"

        lines = []
        for i, m in enumerate(materials, 1):
            content = m.get('content', '')
            source = m.get('source', m.get('sourceNote', ''))
            credibility = m.get('credibility', '')

            # 标注方向提示
            if content.startswith('[方向]') or ('【' in content and '】' in content):
                lines.append(f"{i}. [方向提示] {content}")
            else:
                cred_mark = "✓" if credibility == "已核实" else "?"
                lines.append(f"{i}. [{cred_mark}] {content}")
                if source:
                    lines.append(f"   来源：{source}")

        return '\n'.join(lines)


# 单例
_generator: Optional[DraftGenerator] = None


def get_draft_generator() -> DraftGenerator:
    """获取文案生成器单例"""
    global _generator
    if _generator is None:
        _generator = DraftGenerator()
    return _generator
