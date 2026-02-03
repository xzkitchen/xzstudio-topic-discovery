import httpx
import asyncio
import random
from abc import ABC, abstractmethod
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

# 多个 User-Agent 轮换
USER_AGENTS = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0",
]


class BaseScraper(ABC):
    """基础爬虫类"""

    def __init__(self, delay: float = 2.0):
        self.delay = delay
        self._client = None

    def _get_headers(self, referer: str = None) -> dict:
        """生成随机请求头"""
        headers = {
            "User-Agent": random.choice(USER_AGENTS),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Cache-Control": "max-age=0",
        }
        if referer:
            headers["Referer"] = referer
            headers["Sec-Fetch-Site"] = "same-origin"
        return headers

    async def fetch(self, url: str, timeout: float = 30.0, referer: str = None) -> str:
        """获取网页内容"""
        # 随机延迟 (delay ~ delay*1.5)
        wait_time = self.delay + random.random() * self.delay * 0.5
        await asyncio.sleep(wait_time)

        async with httpx.AsyncClient(
            timeout=timeout,
            follow_redirects=True,
            http2=True,  # 使用 HTTP/2
        ) as client:
            try:
                response = await client.get(
                    url,
                    headers=self._get_headers(referer),
                )

                # 检查是否被重定向到安全验证页面
                if "sec.douban.com" in str(response.url):
                    logger.warning(f"触发豆瓣安全验证: {url}")
                    return ""

                response.raise_for_status()
                return response.text
            except httpx.HTTPError as e:
                logger.error(f"请求失败: {url}, 错误: {e}")
                raise

    @abstractmethod
    async def search(self, query: str) -> List[Dict[str, Any]]:
        """搜索接口，子类必须实现"""
        pass
