"""
TMDB API 客户端 - 获取电影海报
"""
import aiohttp
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)


class TMDBClient:
    """TMDB API 客户端"""

    BASE_URL = "https://api.themoviedb.org/3"
    IMAGE_BASE = "https://image.tmdb.org/t/p"

    # 海报尺寸选项
    POSTER_SIZES = {
        "small": "w185",
        "medium": "w342",
        "large": "w500",
        "original": "original"
    }

    def __init__(self, api_key: str):
        self.api_key = api_key
        self._session: Optional[aiohttp.ClientSession] = None

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession()
        return self._session

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()

    async def search_movie(self, title: str, year: Optional[int] = None) -> Optional[Dict[str, Any]]:
        """
        搜索电影，返回最匹配的结果

        Args:
            title: 电影标题（中文或英文）
            year: 上映年份（可选，提高匹配准确度）
        """
        session = await self._get_session()

        params = {
            "api_key": self.api_key,
            "query": title,
            "language": "zh-CN",
            "include_adult": "false"
        }

        if year:
            params["year"] = str(year)

        try:
            async with session.get(f"{self.BASE_URL}/search/movie", params=params) as resp:
                if resp.status != 200:
                    logger.warning(f"TMDB 搜索失败: {title}, 状态码: {resp.status}")
                    return None

                data = await resp.json()
                results = data.get("results", [])

                if not results:
                    # 尝试不带年份搜索
                    if year:
                        params.pop("year")
                        async with session.get(f"{self.BASE_URL}/search/movie", params=params) as retry_resp:
                            if retry_resp.status == 200:
                                retry_data = await retry_resp.json()
                                results = retry_data.get("results", [])

                if results:
                    # 返回第一个结果
                    return results[0]

                logger.info(f"TMDB 未找到电影: {title}")
                return None

        except Exception as e:
            logger.error(f"TMDB 搜索异常: {title}, 错误: {e}")
            return None

    def get_poster_url(self, poster_path: Optional[str], size: str = "large") -> Optional[str]:
        """
        构建海报完整 URL

        Args:
            poster_path: TMDB 返回的 poster_path（如 /abc123.jpg）
            size: 尺寸选项 small/medium/large/original
        """
        if not poster_path:
            return None

        size_code = self.POSTER_SIZES.get(size, self.POSTER_SIZES["large"])
        return f"{self.IMAGE_BASE}/{size_code}{poster_path}"

    def get_backdrop_url(self, backdrop_path: Optional[str], size: str = "large") -> Optional[str]:
        """构建背景图完整 URL"""
        if not backdrop_path:
            return None

        # 背景图尺寸
        size_map = {
            "small": "w780",
            "large": "w1280",
            "original": "original"
        }
        size_code = size_map.get(size, "w1280")
        return f"{self.IMAGE_BASE}/{size_code}{backdrop_path}"

    async def get_movie_poster(
        self,
        title: str,
        year: Optional[int] = None,
        english_name: Optional[str] = None
    ) -> Optional[str]:
        """
        便捷方法：直接获取电影海报 URL

        Args:
            title: 电影标题（中文）
            year: 上映年份
            english_name: 英文名（优先使用）

        Returns:
            海报 URL 或 None
        """
        # 优先用英文名搜索（TMDB 对英文名匹配更准确）
        if english_name:
            movie = await self.search_movie(english_name, year)
            if movie and movie.get("poster_path"):
                return self.get_poster_url(movie["poster_path"])

        # 回退到中文名搜索
        movie = await self.search_movie(title, year)
        if movie and movie.get("poster_path"):
            return self.get_poster_url(movie["poster_path"])
        return None

    async def get_movie_images(self, title: str, year: Optional[int] = None) -> Dict[str, Optional[str]]:
        """
        获取电影的海报和背景图

        Returns:
            {"poster_url": ..., "backdrop_url": ...}
        """
        movie = await self.search_movie(title, year)
        if not movie:
            return {"poster_url": None, "backdrop_url": None}

        return {
            "poster_url": self.get_poster_url(movie.get("poster_path")),
            "backdrop_url": self.get_backdrop_url(movie.get("backdrop_path"))
        }


# 全局实例（使用时设置 API Key）
_tmdb_client: Optional[TMDBClient] = None


def get_tmdb_client(api_key: str) -> TMDBClient:
    """获取 TMDB 客户端单例"""
    global _tmdb_client
    if _tmdb_client is None:
        _tmdb_client = TMDBClient(api_key)
    return _tmdb_client


async def close_tmdb_client():
    """关闭 TMDB 客户端，释放资源"""
    global _tmdb_client
    if _tmdb_client is not None:
        await _tmdb_client.close()
        _tmdb_client = None
        logger.info("TMDB 客户端已关闭")
