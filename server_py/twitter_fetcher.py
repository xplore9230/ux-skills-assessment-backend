"""
Twitter Content Fetcher
=======================

This module fetches high‑engagement tweets related to UX/Design using:
- Twitter API v2 via tweepy (preferred, requires API key)
- Twikit scraper (fallback, no API key required, but requires Python 3.10+)
  See: https://github.com/d60/twikit

Tweets are normalised into a simple structure which can later be mapped
to UXResource instances for the RAG knowledge base.
"""

from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import List, Dict, Any, Optional, Union
import logging
import os

from knowledge_base import UXResource

logger = logging.getLogger(__name__)

try:
    import tweepy  # type: ignore
except ImportError:  # pragma: no cover - optional dependency
    tweepy = None  # type: ignore

try:
    from twikit import Client as TwikitClient  # type: ignore
    import asyncio
    TWIKIT_AVAILABLE = True
except (ImportError, TypeError) as e:  # pragma: no cover - optional dependency
    # TypeError can occur if twikit requires Python 3.10+ (uses | union syntax)
    # ImportError occurs if twikit is not installed
    TwikitClient = None  # type: ignore
    TWIKIT_AVAILABLE = False
    if "unsupported operand type" in str(e) or "|" in str(e):
        logger.warning("TwitterFetcher: twikit requires Python 3.10+ (current: %s). Install Python 3.10+ to use twikit scraper.", 
                      __import__('sys').version.split()[0])


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
        self.twikit_client = None
        
        # Try Twitter API v2 first (requires bearer token)
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
                logger.info("TwitterFetcher: tweepy not installed; will try twikit fallback")
            else:
                logger.info("TwitterFetcher: bearer token not configured; will try twikit fallback")
        
        # Fallback to twikit if no API key (no API key required)
        if not self.client and TWIKIT_AVAILABLE:
            try:
                # Initialize twikit client (will need login credentials if required)
                # For now, we'll use it without login for public searches
                self.twikit_client = TwikitClient('en-US')
                logger.info("TwitterFetcher: Twikit client initialised (no API key required)")
            except Exception as exc:
                logger.warning("TwitterFetcher: failed to init twikit client: %s", exc)
                self.twikit_client = None
        elif not TWIKIT_AVAILABLE:
            logger.warning("TwitterFetcher: twikit not installed; install with: pip install twikit")

    # Public API ------------------------------------------------------------

    def fetch_high_engagement_tweets(self, limit_per_query: int = 20) -> List[TweetItem]:
        """
        Fetch tweets for all configured queries, filtered by engagement score.
        Uses Twitter API v2 if available, otherwise falls back to twikit scraper.
        """
        items: List[TweetItem] = []

        if self.client:
            # Use Twitter API v2 (requires bearer token)
            for query in self.queries:
                items.extend(self._fetch_via_api(query, limit_per_query))
        elif self.twikit_client:
            # Use twikit scraper (no API key required)
            for query in self.queries:
                items.extend(self._fetch_via_twikit(query, limit_per_query))
        else:
            logger.warning("TwitterFetcher: No client available (neither API nor twikit), skipping fetch")

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

    def _fetch_via_twikit(self, query: str, limit: int) -> List[TweetItem]:
        """
        Fetch tweets via twikit scraper (no API key required).
        Uses async/await pattern as twikit is async.
        """
        if not self.twikit_client:  # pragma: no cover - safety
            return []

        logger.info("TwitterFetcher: searching tweets via twikit for query '%s'", query)
        items: List[TweetItem] = []

        try:
            # Run async search synchronously
            tweets = asyncio.run(self.twikit_client.search_tweet(query, 'Latest'))
            
            if not tweets:
                return []

            for tweet in tweets[:limit]:
                try:
                    # Extract engagement metrics
                    like_count = getattr(tweet, 'favorite_count', 0) or 0
                    retweet_count = getattr(tweet, 'retweet_count', 0) or 0
                    reply_count = getattr(tweet, 'reply_count', 0) or 0
                    quote_count = getattr(tweet, 'quote_count', 0) or 0
                    
                    # Convert to int
                    like_count = int(like_count) if like_count else 0
                    retweet_count = int(retweet_count) if retweet_count else 0
                    reply_count = int(reply_count) if reply_count else 0
                    quote_count = int(quote_count) if quote_count else 0
                    
                    engagement = like_count + retweet_count + reply_count + quote_count

                    if engagement < self.min_engagement:
                        continue

                    tweet_id = str(getattr(tweet, 'id', ''))
                    if not tweet_id:
                        continue
                    
                    url = f"https://twitter.com/i/web/status/{tweet_id}"
                    text = getattr(tweet, 'text', '') or getattr(tweet, 'full_text', '') or ''
                    author = getattr(tweet, 'user', None)
                    author_name = getattr(author, 'name', '') or getattr(author, 'screen_name', '') if author else 'Unknown'
                    created_at = getattr(tweet, 'created_at', '')
                    if created_at:
                        created_at = created_at.isoformat() if hasattr(created_at, 'isoformat') else str(created_at)

                    items.append(
                        TweetItem(
                            id=tweet_id,
                            text=text,
                            url=url,
                            author=author_name,
                            like_count=like_count,
                            retweet_count=retweet_count,
                            reply_count=reply_count,
                            quote_count=quote_count,
                            engagement_score=engagement,
                            created_at=created_at,
                            raw={},
                        )
                    )
                except Exception as exc:
                    logger.warning("TwitterFetcher: Error processing tweet: %s", exc)
                    continue

        except Exception as exc:  # pragma: no cover - network dependent
            logger.error("TwitterFetcher: Twikit error for '%s': %s", query, exc)
            return []

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



