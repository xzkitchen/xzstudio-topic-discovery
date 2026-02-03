#!/usr/bin/env python3
"""
选题收集脚本 - 不需要 API Key
收集豆瓣数据后，可以用 Claude Code 来分析
"""
import asyncio
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from backend.core.collector import TopicCollector
from backend.models.database import init_db
import json
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)


async def main():
    print()
    print("=" * 60)
    print("🎬 熙崽选题收集器")
    print("=" * 60)
    print()
    print("功能：从豆瓣收集高分经典和热点老片的美食讨论")
    print("下一步：将收集的数据发给 Claude Code 分析")
    print()

    # 初始化数据库
    await init_db()

    # 收集数据
    collector = TopicCollector(delay=2.0)
    raw_topics = await collector.collect_raw_topics(max_movies=15)

    if not raw_topics:
        print("❌ 未收集到任何候选选题")
        return

    # 保存到文件
    output_path = project_root / "data" / "raw_topics.json"
    output_path.parent.mkdir(exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(raw_topics, f, ensure_ascii=False, indent=2)

    print(f"\n✅ 已收集 {len(raw_topics)} 个候选选题")
    print(f"📁 原始数据已保存到: {output_path}")
    print()

    # 输出格式化文本供 Claude Code 分析
    print("=" * 60)
    print("📋 以下内容可以发送给 Claude Code 进行分析：")
    print("=" * 60)
    print()

    formatted = collector.format_for_analysis(raw_topics)
    print(formatted)

    print()
    print("=" * 60)
    print("💡 下一步操作：")
    print("   1. 复制上面的选题列表")
    print("   2. 在 Claude Code 中说：「帮我分析这些选题」")
    print("   3. Claude Code 会评估每个选题的美食场景和故事潜力")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
