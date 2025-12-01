"""
Social Scrapers (YouTube & Podcasts)
====================================

These scrapers use RSS feeds and the BaseScraper utilities to normalise
YouTube videos and podcast episodes into UXResource instances.
"""

from __future__ import annotations

from typing import List, Optional

from knowledge_base import UXResource
from scraper import BaseScraper  # reuse rate limiting, headers, etc.
from rss_parser import RSSParser, RSSItem, rss_item_to_ux_resource


class YouTubeScraper(BaseScraper):
    """
    Scraper for YouTube content via RSS feeds.

    NOTE: We intentionally avoid HTML scraping here and rely solely on
    the official RSS feeds, which are stable and lightweight.
    """

    def __init__(self) -> None:
        super().__init__("YouTube", "https://www.youtube.com")
        self.rss_parser = RSSParser()

    def scrape_channel(
        self,
        feed_url: str,
        category: str,
        level: str,
        limit: int = 20,
    ) -> List[UXResource]:
        items: List[RSSItem] = self.rss_parser.parse_youtube_channel(feed_url)
        resources: List[UXResource] = []

        for item in items[:limit]:
            resources.append(
                rss_item_to_ux_resource(
                    item=item,
                    category=category,
                    level=level,
                )
            )

        return resources


class PodcastScraper(BaseScraper):
    """
    Scraper for podcast episodes via RSS feeds.
    """

    def __init__(self) -> None:
        super().__init__("Podcast", "")
        self.rss_parser = RSSParser()

    def scrape_podcast(
        self,
        feed_url: str,
        category: str,
        level: str,
        limit: int = 20,
    ) -> List[UXResource]:
        items: List[RSSItem] = self.rss_parser.parse_podcast(feed_url)
        resources: List[UXResource] = []

        for item in items[:limit]:
            res = rss_item_to_ux_resource(
                item=item,
                category=category,
                level=level,
            )
            # Mark as podcast episode where applicable
            res.resource_type = "podcast"
            resources.append(res)

        return resources



