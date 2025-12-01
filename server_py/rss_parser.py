"""
RSS Feed Parser for Social Content (YouTube + Podcasts)
======================================================

This module parses RSS/Atom feeds for:
- YouTube channel feeds
- Podcast RSS feeds

It converts items into a lightweight intermediate representation that can
later be transformed into UXResource instances and stored in the RAG
knowledge base.
"""

from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging
import feedparser

from knowledge_base import UXResource


logger = logging.getLogger(__name__)


@dataclass
class RSSItem:
    """
    Normalised RSS item structure used by the content aggregator.
    """

    id: str
    title: str
    url: str
    description: str
    published_at: str
    author: str
    duration: Optional[int]  # seconds, if available
    source: str  # e.g. "youtube", "podcast"
    raw: Dict[str, Any]

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class RSSParser:
    """
    Generic RSS/Atom feed parser with helpers for YouTube and podcasts.
    """

    def __init__(self) -> None:
        # Nothing to configure yet, but keeps API future‑proof
        pass

    def parse_feed(self, url: str, source: str) -> List[RSSItem]:
        """
        Parse an RSS/Atom feed URL and return normalised RSSItem list.
        """
        try:
            logger.info("Parsing RSS feed: %s", url)
            feed = feedparser.parse(url)
            items: List[RSSItem] = []

            for entry in feed.entries:
                item_id = getattr(entry, "id", None) or getattr(entry, "guid", None) or getattr(
                    entry, "link", ""
                )
                title = getattr(entry, "title", "").strip()
                link = getattr(entry, "link", "").strip()
                summary = getattr(entry, "summary", "").strip()
                author = getattr(entry, "author", "").strip() if hasattr(entry, "author") else ""

                # Published date as ISO string where possible
                published_at = ""
                if getattr(entry, "published_parsed", None):
                    published_at = datetime(*entry.published_parsed[:6]).isoformat()

                # Duration (mainly for podcasts)
                duration = None
                itunes_duration = getattr(entry, "itunes_duration", None)
                if itunes_duration:
                    duration = self._parse_duration(itunes_duration)

                items.append(
                    RSSItem(
                        id=str(item_id or link or title),
                        title=title,
                        url=link,
                        description=summary,
                        published_at=published_at,
                        author=author,
                        duration=duration,
                        source=source,
                        raw=dict(entry),
                    )
                )

            return items
        except Exception as exc:  # pragma: no cover - defensive
            logger.error("Error parsing RSS feed %s: %s", url, exc)
            return []

    # Convenience wrappers -------------------------------------------------

    def parse_youtube_channel(self, channel_feed_url: str) -> List[RSSItem]:
        """
        Parse a YouTube channel RSS feed.
        Example feed URL:
          https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID
        """
        return self.parse_feed(channel_feed_url, source="youtube")

    def parse_podcast(self, feed_url: str) -> List[RSSItem]:
        """
        Parse a podcast RSS feed.
        """
        return self.parse_feed(feed_url, source="podcast")

    # Helpers --------------------------------------------------------------

    def _parse_duration(self, value: str) -> Optional[int]:
        """
        Parse a duration string like \"01:23:45\" or \"15:30\" into seconds.
        """
        try:
            parts = value.split(":")
            parts = [int(p) for p in parts]
            if len(parts) == 3:
                h, m, s = parts
            elif len(parts) == 2:
                h = 0
                m, s = parts
            elif len(parts) == 1:
                h, m, s = 0, 0, parts[0]
            else:
                return None
            return h * 3600 + m * 60 + s
        except Exception:
            return None


def rss_item_to_ux_resource(item: RSSItem, category: str, level: str) -> UXResource:
    """
    Convert an RSSItem into a UXResource.

    NOTE: The aggregator is responsible for choosing category/level using
    rules or AI classification. This helper just maps fields.
    """
    summary = item.description or item.title

    return UXResource(
        id=UXResource.generate_id(item.url),
        title=item.title,
        url=item.url,
        content=item.description or item.title,
        summary=summary[:800],
        category=category,
        resource_type="video" if item.source == "youtube" else "podcast",
        difficulty="beginner",  # can be refined later via AI
        tags=[],
        author=item.author,
        source=item.source,
        publish_date=item.published_at,
        estimated_read_time=int((item.duration or 300) / 60),
    )



