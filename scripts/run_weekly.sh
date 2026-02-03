#!/bin/bash
# 每周选题发现脚本
# 用于手动运行或通过 cron/launchd 定时执行

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# 激活虚拟环境
if [ -f ".venv/bin/activate" ]; then
    source .venv/bin/activate
elif [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
fi

# 运行发现任务
python -c "
import asyncio
import logging
import sys

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

from backend.core.discovery import TopicDiscovery
from backend.models.database import init_db

async def main():
    await init_db()
    discovery = TopicDiscovery()
    topics = await discovery.discover_weekly_topics()

    print()
    print('=' * 60)
    print(f'发现 {len(topics)} 个选题:')
    print('=' * 60)

    for i, t in enumerate(topics, 1):
        print(f'{i:2}. {t.work_name} · {t.recommended_dish}')
        print(f'    评分: {t.total_score()} | 豆瓣: {t.douban_score} | 难度: {t.cooking_difficulty.value}')
        tags = []
        if t.is_interesting:
            tags.append('有趣')
        if t.is_discussable:
            tags.append('有话题')
        if t.has_momentum:
            tags.append('有热点')
        if tags:
            print(f'    标签: {\" · \".join(tags)}')
        print()

    return len(topics)

try:
    count = asyncio.run(main())
    sys.exit(0 if count > 0 else 1)
except Exception as e:
    logging.error(f'运行失败: {e}')
    sys.exit(1)
"
