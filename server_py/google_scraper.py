"""
Google Search Scraper for UX Resources
======================================

Uses the `googlesearch` helper from `googlesearch-python` to discover
new URLs for:
- YouTube tutorials
- UX podcasts
- UX tips articles / tweets

This module ONLY discovers URLs + basic metadata; actual scraping and
parsing of the content is handled by other scrapers or the ingestion
pipeline.
"""

from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import List, Dict, Any, Optional
import logging

try:
    from googlesearch import search  # type: ignore
except ImportError:  # pragma: no cover - optional dependency
    search = None  # type: ignore


logger = logging.getLogger(__name__)


@dataclass
class SearchResult:
    url: str
    query: str
    rank: int

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class GoogleScraper:
    """
    Thin wrapper around googlesearch to discover relevant URLs.
    """

    def __init__(self, queries: Optional[List[str]] = None, max_results: int = 10) -> None:
        self.queries = queries or [
            "UX design tutorial site:youtube.com",
            "UX podcast",
            "UX tips for designers",
        ]
        self.max_results = max_results

        if search is None:
            logger.warning(
                "GoogleScraper: googlesearch-python not installed; discovery disabled"
            )

    def discover_urls(self) -> List[SearchResult]:
        """
        Run all configured queries and return a list of SearchResult.
        """
        if search is None:
            return []

        results: List[SearchResult] = []

        for query in self.queries:
            logger.info("GoogleScraper: running search for '%s'", query)
            try:
                urls = search(query, num_results=self.max_results)  # type: ignore[arg-type]
            except Exception as exc:  # pragma: no cover - network dependent
                logger.error("GoogleScraper: error searching '%s': %s", query, exc)
                continue

            for rank, url in enumerate(urls, start=1):
                results.append(SearchResult(url=url, query=query, rank=rank))

        return results



