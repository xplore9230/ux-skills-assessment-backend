"""
Content Aggregator for Social + Web Sources
===========================================

This module orchestrates:
- RSS feeds (YouTube channels + podcasts)
- Twitter high‑engagement tweets
- Google search discovery

It converts discovered items into UXResource objects and stores them in
the existing RAG vector store using the same pipeline as other sources.
"""

from __future__ import annotations

from typing import List, Dict, Any, Optional
import json
import os
import logging

from knowledge_base import UXResource, ContentChunker
from vector_store import get_vector_store
from rss_parser import RSSParser, rss_item_to_ux_resource
from social_scrapers import YouTubeScraper, PodcastScraper
from twitter_fetcher import TwitterFetcher, tweet_to_ux_resource
from google_scraper import GoogleScraper
from ai_classifier import classify_content


logger = logging.getLogger(__name__)


class ContentAggregator:
    """
    Orchestrates fetching from all social / web sources and writing into
    the vector store.
    """

    def __init__(self, config_path: Optional[str] = None) -> None:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        self.config_path = config_path or os.path.join(base_dir, "social_config.json")
        self.config: Dict[str, Any] = self._load_config()

        self.vector_store = get_vector_store()
        self.chunker = ContentChunker(chunk_size=500, overlap=50, min_chunk_size=100)

        # Helpers
        self.rss_parser = RSSParser()
        self.youtube_scraper = YouTubeScraper()
        self.podcast_scraper = PodcastScraper()
        twitter_cfg = self.config.get("twitter", {})
        self.twitter_fetcher = TwitterFetcher(
            min_engagement=int(twitter_cfg.get("min_engagement", 100)),
            queries=twitter_cfg.get("search_queries", []),
        )
        google_cfg = self.config.get("google_search", {})
        self.google_scraper = GoogleScraper(
            queries=google_cfg.get("queries", []),
            max_results=int(google_cfg.get("max_results_per_query", 10)),
        )
    
    def _load_config(self) -> Dict[str, Any]:
        """
        Load configuration from social_config.json file.
        """
        try:
            with open(self.config_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except FileNotFoundError:
            logger.warning("Config file not found at %s, using defaults", self.config_path)
            return {}
        except json.JSONDecodeError as e:
            logger.error("Invalid JSON in config file %s: %s", self.config_path, e)
            return {}

    # ------------------------------------------------------------------ #
    # Public entry points
    # ------------------------------------------------------------------ #

    def run_full_update(self) -> Dict[str, Any]:
        """
        Fetch from all sources and integrate into the knowledge base.
        Returns a summary dict.
        """
        summary: Dict[str, Any] = {
            "youtube_new": 0,
            "podcast_new": 0,
            "tweets_new": 0,
            "discovered_urls": 0,
        }

        youtube_resources = self._classify_and_enrich(self.fetch_youtube_resources())
        podcast_resources = self._classify_and_enrich(self.fetch_podcast_resources())
        tweet_resources = self._classify_and_enrich(self.fetch_tweet_resources())

        summary["youtube_new"] = self._store_resources(youtube_resources)
        summary["podcast_new"] = self._store_resources(podcast_resources)
        summary["tweets_new"] = self._store_resources(tweet_resources)

        discovered = self.google_scraper.discover_urls()
        summary["discovered_urls"] = len(discovered)

        logger.info("ContentAggregator summary: %s", summary)
        return summary

    def fetch_youtube_resources(self) -> List[UXResource]:
        """
        Parse configured YouTube channel RSS feeds and map to UXResource.
        """
        resources: List[UXResource] = []
        channels = self.config.get("rss_feeds", {}).get("youtube_channels", [])
        for channel in channels:
            url = channel.get("url")
            category = channel.get("category", "UX Fundamentals")
            level = channel.get("level", "explorer")
            if not url:
                continue
            logger.info("Fetching YouTube RSS for channel %s", channel.get("name", url))
            items = self.rss_parser.parse_youtube_channel(url)
            for item in items:
                resources.append(
                    rss_item_to_ux_resource(
                        item=item,
                        category=category,
                        level=level,
                    )
                )
        return resources

    def fetch_podcast_resources(self) -> List[UXResource]:
        """
        Parse configured podcast RSS feeds and map to UXResource.
        """
        resources: List[UXResource] = []
        podcasts = self.config.get("rss_feeds", {}).get("podcasts", [])
        for podcast in podcasts:
            url = podcast.get("url")
            category = podcast.get("category", "User Research & Validation")
            level = podcast.get("level", "practitioner")
            if not url:
                continue
            logger.info("Fetching podcast RSS for %s", podcast.get("name", url))
            items = self.rss_parser.parse_podcast(url)
            for item in items:
                res = rss_item_to_ux_resource(
                    item=item,
                    category=category,
                    level=level,
                )
                res.resource_type = "podcast"
                resources.append(res)
        return resources

    def fetch_tweet_resources(self) -> List[UXResource]:
        """
        Fetch high‑engagement tweets and map to UXResource.
        """
        tweet_items = self.twitter_fetcher.fetch_high_engagement_tweets()
        # Default mappings; AI classifier will refine category/difficulty.
        category = "Collaboration & Communication"
        level = "explorer"
        return [tweet_to_ux_resource(t, category=category, level=level) for t in tweet_items]

    # ------------------------------------------------------------------ #
    # Storage helpers
    # ------------------------------------------------------------------ #

    def _classify_and_enrich(self, resources: List[UXResource]) -> List[UXResource]:
        """
        Use OpenAI classifier to assign category, difficulty, and tags.
        New content is marked as 'pending' for review, but still usable
        by RAG.
        """
        enriched: List[UXResource] = []
        for res in resources:
            try:
                snippet = res.summary or res.content[:2000]
                cls = classify_content(res.title, snippet, res.url)
                res.category = cls.get("category", res.category)
                res.difficulty = cls.get("difficulty", res.difficulty)
                tags = cls.get("tags") or []
                if isinstance(tags, list):
                    res.tags = tags
                # Store full AI payload for the admin UI
                res.ai_classification = cls
                # Mark as pending so admins can see what was auto‑added
                res.status = "pending"
            except Exception as exc:  # pragma: no cover - safety
                logger.error("Classification error for %s: %s", res.url, exc)
                # Leave defaults, still mark as pending
                res.status = "pending"
            enriched.append(res)
        return enriched

    def _store_resources(self, resources: List[UXResource]) -> int:
        """
        Chunk and insert resources into the vector store, skipping
        duplicates.
        """
        added = 0
        for res in resources:
            try:
                if self.vector_store.resource_exists(res.id):
                    continue
                chunks = self.chunker.create_chunks(res)
                if not chunks:
                    continue
                if self.vector_store.add_resource(res, chunks):
                    added += 1
            except Exception as exc:  # pragma: no cover - defensive
                logger.error("Error storing resource %s: %s", res.url, exc)
        return added


def load_social_config(path: str) -> Dict[str, Any]:
    """
    Helper to load the social_config.json file.
    """
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


