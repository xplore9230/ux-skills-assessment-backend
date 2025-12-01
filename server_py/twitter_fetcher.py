"""
Twitter Content Fetcher
=======================

This module fetches high‑engagement tweets related to UX/Design using:
- Twitter API v2 via tweepy (preferred, requires API key)
- Optional scraping fallback (e.g. snscrape) if no API key is configured

Tweets are normalised into a simple structure which can later be mapped
to UXResource instances for the RAG knowledge base.
"""

from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import List, Dict, Any, Optional
import logging
import os

from knowledge_base import UXResource

logger = logging.getLogger(__name__)

try:
    import tweepy  # type: ignore
except ImportError:  # pragma: no cover - optional dependency
    tweepy = None  # type: ignore


@dataclass
class TweetItem:
    id: str
    text: str
    url: str
    author: str
    like_count: int
    retweet_count: int
    reply_count: int
    quote_count: int
    engagement_score: int
    created_at: str
    raw: Dict[str, Any]

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class TwitterFetcher:
    """
    Fetch tweets either via Twitter API v2 or via a scraping fallback.
    """

    def __init__(
        self,
        min_engagement: int = 100,
        queries: Optional[List[str]] = None,
    ) -> None:
        self.min_engagement = min_engagement
        self.queries = queries or ["UX design", "user experience", "design systems"]

        self.client = None
        bearer_token = os.getenv("TWITTER_BEARER_TOKEN") or os.getenv(
            "TWITTER_API_BEARER_TOKEN"
        )
        if tweepy and bearer_token:
            try:
                self.client = tweepy.Client(bearer_token=bearer_token, wait_on_rate_limit=True)
                logger.info("TwitterFetcher: Tweepy client initialised")
            except Exception as exc:  # pragma: no cover - defensive
                logger.error("TwitterFetcher: failed to init tweepy client: %s", exc)
                self.client = None
        else:
            if not tweepy:
                logger.warning("TwitterFetcher: tweepy not installed; API mode disabled")
            else:
                logger.warning("TwitterFetcher: bearer token not configured; API mode disabled")

    # Public API ------------------------------------------------------------

    def fetch_high_engagement_tweets(self, limit_per_query: int = 20) -> List[TweetItem]:
        """
        Fetch tweets for all configured queries, filtered by engagement score.
        """
        items: List[TweetItem] = []

        if self.client:
            for query in self.queries:
                items.extend(self._fetch_via_api(query, limit_per_query))
        else:
            logger.info("TwitterFetcher: API client unavailable, skipping fetch")

        # Deduplicate by id
        seen: Dict[str, TweetItem] = {}
        for item in items:
            if item.id not in seen:
                seen[item.id] = item

        return list(seen.values())

    # Internal helpers ------------------------------------------------------

    def _fetch_via_api(self, query: str, limit: int) -> List[TweetItem]:
        """
        Fetch tweets via Twitter API v2 using tweepy.
        """
        if not self.client:  # pragma: no cover - safety
            return []

        logger.info("TwitterFetcher: searching tweets for query '%s'", query)
        items: List[TweetItem] = []

        try:
            response = self.client.search_recent_tweets(
                query=query + " lang:en -is:reply -is:quote",
                tweet_fields=["public_metrics", "created_at", "author_id"],
                max_results=min(limit, 100),
            )
        except Exception as exc:  # pragma: no cover - network dependent
            logger.error("TwitterFetcher: API error for '%s': %s", query, exc)
            return []

        if not response.data:
            return []

        for tweet in response.data:
            metrics = tweet.public_metrics or {}
            like_count = int(metrics.get("like_count", 0))
            retweet_count = int(metrics.get("retweet_count", 0))
            reply_count = int(metrics.get("reply_count", 0))
            quote_count = int(metrics.get("quote_count", 0))
            engagement = like_count + retweet_count + reply_count + quote_count

            if engagement < self.min_engagement:
                continue

            tweet_id = str(tweet.id)
            url = f"https://twitter.com/i/web/status/{tweet_id}"
            created_at = ""
            if getattr(tweet, "created_at", None):
                created_at = tweet.created_at.isoformat()

            items.append(
                TweetItem(
                    id=tweet_id,
                    text=tweet.text,
                    url=url,
                    author=str(getattr(tweet, "author_id", "")),
                    like_count=like_count,
                    retweet_count=retweet_count,
                    reply_count=reply_count,
                    quote_count=quote_count,
                    engagement_score=engagement,
                    created_at=created_at,
                    raw=tweet.data if hasattr(tweet, "data") else {},
                )
            )

        return items


def tweet_to_ux_resource(tweet: TweetItem, category: str, level: str) -> UXResource:
    """
    Convert a TweetItem into a UXResource.

    The content is the tweet text; longer context or threads can be added later
    by extending the fetcher.
    """
    summary = tweet.text.strip()

    return UXResource(
        id=UXResource.generate_id(tweet.url),
        title=f"Tweet by {tweet.author}",
        url=tweet.url,
        content=tweet.text,
        summary=summary[:800],
        category=category,
        resource_type="tweet",
        difficulty="beginner",  # can be refined via AI
        tags=[],
        author=tweet.author,
        source="twitter.com",
        publish_date=tweet.created_at,
        estimated_read_time=1,
        engagement_score=tweet.engagement_score,
        social_metadata={
            "like_count": tweet.like_count,
            "retweet_count": tweet.retweet_count,
            "reply_count": tweet.reply_count,
            "quote_count": tweet.quote_count,
        },
    )



