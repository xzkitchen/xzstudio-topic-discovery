from bs4 import BeautifulSoup
from .base import BaseScraper
from typing import List, Dict, Any
import re
import logging

logger = logging.getLogger(__name__)


class DoubanScraper(BaseScraper):
    """豆瓣电影数据抓取"""

    BASE_URL = "https://movie.douban.com"

    # 静态 Top250 数据（豆瓣反爬时使用）
    # 筛选有美食场景潜力的经典电影
    # 注意：URL 为空的条目需要手动补充豆瓣 ID
    STATIC_TOP_MOVIES = [
        {"title": "肖申克的救赎", "score": 9.7, "year": 1994, "url": "https://movie.douban.com/subject/1292052/"},
        {"title": "教父", "score": 9.3, "year": 1972, "url": "https://movie.douban.com/subject/1291841/"},
        {"title": "美丽人生", "score": 9.5, "year": 1997, "url": "https://movie.douban.com/subject/1292063/"},
        {"title": "千与千寻", "score": 9.4, "year": 2001, "url": "https://movie.douban.com/subject/1291561/"},
        {"title": "辛德勒的名单", "score": 9.5, "year": 1993, "url": "https://movie.douban.com/subject/1295124/"},
        {"title": "泰坦尼克号", "score": 9.4, "year": 1997, "url": "https://movie.douban.com/subject/1292722/"},
        {"title": "海上钢琴师", "score": 9.3, "year": 1998, "url": "https://movie.douban.com/subject/1292001/"},
        {"title": "布达佩斯大饭店", "score": 8.9, "year": 2014, "url": "https://movie.douban.com/subject/11525673/"},
        {"title": "低俗小说", "score": 8.9, "year": 1994, "url": "https://movie.douban.com/subject/1291832/"},
        {"title": "无耻混蛋", "score": 8.6, "year": 2009, "url": "https://movie.douban.com/subject/3032627/"},
        {"title": "被解救的姜戈", "score": 8.7, "year": 2012, "url": "https://movie.douban.com/subject/6307447/"},
        {"title": "料理鼠王", "score": 8.3, "year": 2007, "url": "https://movie.douban.com/subject/1793084/"},
        {"title": "朱莉与朱莉娅", "score": 7.9, "year": 2009, "url": "https://movie.douban.com/subject/3055077/"},
        {"title": "海鸥食堂", "score": 8.3, "year": 2006, "url": "https://movie.douban.com/subject/1856460/"},
        {"title": "浓情巧克力", "score": 8.1, "year": 2000, "url": "https://movie.douban.com/subject/1292216/"},
        {"title": "小森林 夏秋篇", "score": 9.0, "year": 2014, "url": "https://movie.douban.com/subject/25909696/"},
        {"title": "小森林 冬春篇", "score": 9.0, "year": 2015, "url": "https://movie.douban.com/subject/25910640/"},
        {"title": "饮食男女", "score": 9.1, "year": 1994, "url": "https://movie.douban.com/subject/1291818/"},
        {"title": "深夜食堂", "score": 9.2, "year": 2009, "url": "https://movie.douban.com/subject/4152155/"},
        {"title": "美食总动员", "score": 8.3, "year": 2007, "url": "https://movie.douban.com/subject/1793084/"},
        {"title": "落魄大厨", "score": 7.9, "year": 2014, "url": "https://movie.douban.com/subject/24860710/"},
        {"title": "南极料理人", "score": 8.2, "year": 2009, "url": "https://movie.douban.com/subject/3483482/"},
        {"title": "蒲公英", "score": 8.8, "year": 1985, "url": "https://movie.douban.com/subject/1295455/"},
        {"title": "芭比特的盛宴", "score": 8.6, "year": 1987, "url": "https://movie.douban.com/subject/1294937/"},
        {"title": "大饭店", "score": 8.2, "year": 1932, "url": "https://movie.douban.com/subject/1295005/"},
        {"title": "查理与巧克力工厂", "score": 7.9, "year": 2005, "url": "https://movie.douban.com/subject/1309046/"},
        {"title": "龙猫", "score": 9.2, "year": 1988, "url": "https://movie.douban.com/subject/1291560/"},
        {"title": "哈尔的移动城堡", "score": 9.1, "year": 2004, "url": "https://movie.douban.com/subject/1308807/"},
        {"title": "悬崖上的金鱼姬", "score": 8.6, "year": 2008, "url": "https://movie.douban.com/subject/1959877/"},
        {"title": "阿甘正传", "score": 9.5, "year": 1994, "url": "https://movie.douban.com/subject/1292720/"},
        {"title": "闻香识女人", "score": 9.1, "year": 1992, "url": "https://movie.douban.com/subject/1294137/"},
        {"title": "猫鼠游戏", "score": 9.0, "year": 2002, "url": "https://movie.douban.com/subject/1305487/"},
        {"title": "绿皮书", "score": 8.9, "year": 2018, "url": "https://movie.douban.com/subject/27060077/"},
        {"title": "午夜巴黎", "score": 8.3, "year": 2011, "url": "https://movie.douban.com/subject/4867910/"},
        {"title": "爱在黎明破晓前", "score": 8.8, "year": 1995, "url": "https://movie.douban.com/subject/1296339/"},
    ]

    def _get_static_top_movies(
        self,
        min_year: int = 1950,
        max_year: int = 2020,
        min_score: float = 7.5
    ) -> List[Dict[str, Any]]:
        """返回静态电影列表（当爬虫失败时使用）"""
        return [
            m for m in self.STATIC_TOP_MOVIES
            if min_year <= m["year"] <= max_year and m["score"] >= min_score
        ]

    async def search(self, query: str) -> List[Dict[str, Any]]:
        """搜索豆瓣电影"""
        url = f"https://www.douban.com/search?cat=1002&q={query}"
        try:
            html = await self.fetch(url)
            soup = BeautifulSoup(html, "lxml")
            results = []

            for item in soup.select(".result-list .result")[:10]:
                title_elem = item.select_one("h3 a")
                if title_elem:
                    results.append({
                        "title": title_elem.text.strip(),
                        "url": title_elem.get("href", "")
                    })
            return results
        except Exception as e:
            logger.error(f"搜索失败: {query}, 错误: {e}")
            return []

    async def get_classic_high_score(
        self,
        min_year: int = 1950,
        max_year: int = 2020,
        min_score: float = 7.5
    ) -> List[Dict[str, Any]]:
        """获取高分经典电影（排除近期上映）"""
        movies = []

        # 豆瓣 Top250 作为基础池
        for start in [0, 25, 50, 75, 100]:
            url = f"{self.BASE_URL}/top250?start={start}"
            referer = self.BASE_URL if start == 0 else f"{self.BASE_URL}/top250?start={start-25}"
            try:
                html = await self.fetch(url, referer=referer)
                if not html:
                    logger.warning(f"Top250 返回空内容: start={start}，使用静态数据")
                    return self._get_static_top_movies(min_year, max_year, min_score)
                soup = BeautifulSoup(html, "lxml")

                for item in soup.select(".item"):
                    title_elem = item.select_one(".title")
                    score_elem = item.select_one(".rating_num")
                    info_elem = item.select_one(".bd p")

                    if not all([title_elem, score_elem, info_elem]):
                        continue

                    title = title_elem.text.strip()
                    try:
                        score = float(score_elem.text)
                    except ValueError:
                        continue

                    info = info_elem.text

                    # 提取年份
                    year_match = re.search(r"(\d{4})", info)
                    year = int(year_match.group(1)) if year_match else 0

                    # 提取链接
                    link_elem = item.select_one("a")
                    movie_url = link_elem.get("href", "") if link_elem else ""

                    # 筛选经典老片
                    if min_year <= year <= max_year and score >= min_score:
                        movies.append({
                            "title": title,
                            "score": score,
                            "year": year,
                            "url": movie_url
                        })

            except Exception as e:
                logger.error(f"获取 Top250 失败: start={start}, 错误: {e}")
                continue

        logger.info(f"从 Top250 获取到 {len(movies)} 部符合条件的经典电影")
        return movies

    async def search_food_scenes(self, movie_title: str) -> List[str]:
        """搜索电影相关的美食讨论"""
        queries = [
            f"{movie_title} 美食",
            f"{movie_title} 食物 场景",
        ]

        discussions = []
        failed_count = 0

        for query in queries:
            url = f"https://www.douban.com/search?q={query}"
            try:
                html = await self.fetch(url, referer="https://www.douban.com/")
                if not html:
                    failed_count += 1
                    continue

                soup = BeautifulSoup(html, "lxml")

                for result in soup.select(".result")[:5]:
                    text = result.get_text(strip=True)
                    # 只保留包含美食相关词汇的结果
                    food_keywords = ["美食", "食物", "餐", "吃", "菜", "料理", "烹饪", "厨", "饭"]
                    if any(kw in text for kw in food_keywords):
                        # 清理文本，只保留有用部分
                        clean_text = text[:300]  # 限制长度
                        if clean_text and clean_text not in discussions:
                            discussions.append(clean_text)

            except Exception as e:
                logger.warning(f"搜索美食场景失败: {query}, 错误: {e}")
                failed_count += 1
                continue

        # 如果所有搜索都失败，返回提示信息
        if failed_count == len(queries) and not discussions:
            logger.warning(f"豆瓣搜索被限制，{movie_title} 的美食场景需要手动确认")
            discussions.append(f"[需手动确认] {movie_title} 的美食场景")

        logger.info(f"找到 {len(discussions)} 条关于 {movie_title} 的美食讨论")
        return discussions

    async def get_hot_classic_rewatches(self) -> List[Dict[str, Any]]:
        """获取近期有热度的老片（重映、周年纪念等）"""
        hot_keywords = [
            "经典重映 2026",
            "周年纪念 电影 2026",
            "修复版上映",
            "影史经典 重温"
        ]

        hot_movies = []
        seen_titles = set()

        for kw in hot_keywords:
            url = f"https://www.douban.com/search?cat=1002&q={kw}"
            try:
                html = await self.fetch(url)
                soup = BeautifulSoup(html, "lxml")

                for item in soup.select(".result-list .result")[:10]:
                    title_elem = item.select_one("h3 a")
                    if title_elem:
                        title = title_elem.text.strip()
                        # 清理标题
                        title = re.sub(r'\s+', ' ', title).strip()

                        if title and title not in seen_titles:
                            seen_titles.add(title)
                            hot_movies.append({
                                "title": title,
                                "heat_reason": kw,
                                "url": title_elem.get("href", "")
                            })

            except Exception as e:
                logger.warning(f"搜索热点老片失败: {kw}, 错误: {e}")
                continue

        logger.info(f"找到 {len(hot_movies)} 部近期有热度的老片")
        return hot_movies

    async def get_movie_detail(self, movie_url: str) -> Dict[str, Any]:
        """获取电影详情"""
        try:
            html = await self.fetch(movie_url)
            soup = BeautifulSoup(html, "lxml")

            detail = {
                "title": "",
                "year": 0,
                "score": 0.0,
                "genres": [],
                "summary": ""
            }

            # 标题
            title_elem = soup.select_one("#content h1 span")
            if title_elem:
                detail["title"] = title_elem.text.strip()

            # 评分
            score_elem = soup.select_one(".rating_num")
            if score_elem:
                try:
                    detail["score"] = float(score_elem.text.strip())
                except ValueError:
                    pass

            # 年份
            year_elem = soup.select_one("#content h1 .year")
            if year_elem:
                year_match = re.search(r"(\d{4})", year_elem.text)
                if year_match:
                    detail["year"] = int(year_match.group(1))

            # 类型
            for span in soup.select("#info span"):
                if "类型" in span.get_text():
                    genres = span.find_next_siblings("span", property="v:genre")
                    detail["genres"] = [g.text for g in genres]
                    break

            # 简介
            summary_elem = soup.select_one(".related-info #link-report-inerta span.all") or \
                          soup.select_one(".related-info #link-report-inerta span")
            if summary_elem:
                detail["summary"] = summary_elem.get_text(strip=True)

            return detail

        except Exception as e:
            logger.error(f"获取电影详情失败: {movie_url}, 错误: {e}")
            return {}
