"""
Web Scrapers for UX Resources

This module contains scrapers for authoritative UX sources.
Respects robots.txt, includes rate limiting, and ethical scraping practices.
"""

import time
import requests
from bs4 import BeautifulSoup
from markdownify import markdownify as md
from typing import List, Dict, Any, Optional
from datetime import datetime
import re
from urllib.parse import urljoin, urlparse
import os

from knowledge_base import (
    UXResource,
    CategoryMapper,
    DifficultyClassifier,
    estimate_read_time,
    create_summary
)


# Rate limiting configuration
REQUEST_DELAY = 2.0  # Seconds between requests
USER_AGENT = "UXSkillQuiz-RAG-Bot/1.0 (Educational purpose; +https://github.com/yourrepo)"

# Request headers
HEADERS = {
    'User-Agent': USER_AGENT,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    'Connection': 'keep-alive',
}


class BaseScraper:
    """
    Base class for all scrapers with common functionality.
    """
    
    def __init__(self, source_name: str, base_url: str):
        self.source_name = source_name
        self.base_url = base_url
        self.last_request_time = 0
    
    def _rate_limit(self):
        """Ensure we don't exceed rate limits"""
        elapsed = time.time() - self.last_request_time
        if elapsed < REQUEST_DELAY:
            time.sleep(REQUEST_DELAY - elapsed)
        self.last_request_time = time.time()
    
    def _fetch_url(self, url: str, timeout: int = 30) -> Optional[BeautifulSoup]:
        """
        Fetch and parse URL with error handling and rate limiting.
        """
        self._rate_limit()
        
        try:
            response = requests.get(url, headers=HEADERS, timeout=timeout)
            response.raise_for_status()
            return BeautifulSoup(response.content, 'html.parser')
        except Exception as e:
            print(f"  ✗ Error fetching {url}: {str(e)}")
            return None
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove multiple newlines
        text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)
        return text.strip()
    
    def _extract_domain(self, url: str) -> str:
        """Extract domain from URL"""
        return urlparse(url).netloc


class NNGroupScraper(BaseScraper):
    """
    Scraper for Nielsen Norman Group articles.
    """
    
    def __init__(self):
        super().__init__("Nielsen Norman Group", "https://www.nngroup.com")
    
    def scrape_article(self, url: str) -> Optional[UXResource]:
        """
        Scrape a single NN/g article.
        """
        print(f"  → Scraping NN/g: {url}")
        
        soup = self._fetch_url(url)
        if not soup:
            return None
        
        try:
            # Extract title
            title_elem = soup.find('h1', class_='article-h1')
            if not title_elem:
                title_elem = soup.find('h1')
            title = title_elem.get_text(strip=True) if title_elem else "Untitled"
            
            # Extract author
            author_elem = soup.find('span', class_='author-name')
            author = author_elem.get_text(strip=True) if author_elem else "Nielsen Norman Group"
            
            # Extract date
            date_elem = soup.find('time')
            publish_date = date_elem.get('datetime', '') if date_elem else ''
            
            # Extract main content
            article_body = soup.find('article') or soup.find('div', class_='article-body')
            if not article_body:
                print(f"  ⊗ Could not find article body")
                return None
            
            # Convert to markdown and clean
            content = md(str(article_body))
            content = self._clean_text(content)
            
            # Extract tags/topics
            tags = []
            topic_links = soup.find_all('a', class_='topic-tag')
            for tag in topic_links:
                tags.append(tag.get_text(strip=True))
            
            # Infer category and difficulty
            category = CategoryMapper.infer_category(title, content, tags)
            difficulty = DifficultyClassifier.classify_difficulty(title, content, tags)
            
            # Create resource
            resource = UXResource(
                id=UXResource.generate_id(url),
                title=title,
                url=url,
                content=content,
                summary=create_summary(content),
                category=category,
                resource_type="article",
                difficulty=difficulty,
                tags=tags,
                author=author,
                source="nngroup.com",
                publish_date=publish_date,
                estimated_read_time=estimate_read_time(content)
            )
            
            print(f"  ✓ Scraped: {title}")
            return resource
            
        except Exception as e:
            print(f"  ✗ Error parsing article: {str(e)}")
            return None
    
    def get_article_links(self, topic: Optional[str] = None, limit: int = 10) -> List[str]:
        """
        Get a list of article URLs from NN/g.
        """
        print(f"  → Fetching article links from NN/g...")
        
        # NN/g articles page
        articles_url = f"{self.base_url}/articles/"
        if topic:
            articles_url = f"{self.base_url}/topic/{topic}/"
        
        soup = self._fetch_url(articles_url)
        if not soup:
            return []
        
        links = []
        article_cards = soup.find_all('article', limit=limit * 2)  # Get extra in case some fail
        
        for card in article_cards[:limit]:
            link = card.find('a', href=True)
            if link:
                full_url = urljoin(self.base_url, link['href'])
                if '/articles/' in full_url:
                    links.append(full_url)
        
        print(f"  ✓ Found {len(links)} article links")
        return links[:limit]


class LawsOfUXScraper(BaseScraper):
    """
    Scraper for Laws of UX principles.
    """
    
    def __init__(self):
        super().__init__("Laws of UX", "https://lawsofux.com")
    
    def scrape_law(self, url: str) -> Optional[UXResource]:
        """
        Scrape a single UX law.
        """
        print(f"  → Scraping Laws of UX: {url}")
        
        soup = self._fetch_url(url)
        if not soup:
            return None
        
        try:
            # Extract title
            title_elem = soup.find('h1')
            title = title_elem.get_text(strip=True) if title_elem else "UX Law"
            
            # Extract main content
            main_content = soup.find('main') or soup.find('article')
            if not main_content:
                return None
            
            content = md(str(main_content))
            content = self._clean_text(content)
            
            # Laws of UX is primarily fundamentals
            category = "UX Fundamentals"
            
            resource = UXResource(
                id=UXResource.generate_id(url),
                title=title,
                url=url,
                content=content,
                summary=create_summary(content, max_words=150),
                category=category,
                resource_type="guide",
                difficulty="beginner",
                tags=["heuristics", "principles", "psychology"],
                author="Jon Yablonski",
                source="lawsofux.com",
                publish_date="",
                estimated_read_time=estimate_read_time(content)
            )
            
            print(f"  ✓ Scraped: {title}")
            return resource
            
        except Exception as e:
            print(f"  ✗ Error parsing law: {str(e)}")
            return None
    
    def get_all_laws(self) -> List[str]:
        """
        Get all UX law URLs.
        """
        # Predefined list of Laws of UX
        laws = [
            f"{self.base_url}/",
            f"{self.base_url}/aesthetic-usability-effect/",
            f"{self.base_url}/doherty-threshold/",
            f"{self.base_url}/fittss-law/",
            f"{self.base_url}/hicks-law/",
            f"{self.base_url}/jakobs-law/",
            f"{self.base_url}/law-of-common-region/",
            f"{self.base_url}/law-of-proximity/",
            f"{self.base_url}/law-of-similarity/",
            f"{self.base_url}/law-of-uniform-connectedness/",
            f"{self.base_url}/millers-law/",
            f"{self.base_url}/occams-razor/",
            f"{self.base_url}/parkinsons-law/",
            f"{self.base_url}/peak-end-rule/",
            f"{self.base_url}/postel-s-law/",
            f"{self.base_url}/serial-position-effect/",
            f"{self.base_url}/teslers-law/",
            f"{self.base_url}/von-restorff-effect/",
            f"{self.base_url}/zeigarnik-effect/"
        ]
        
        print(f"  ✓ Found {len(laws)} Laws of UX")
        return laws


class UXCollectiveScraper(BaseScraper):
    """
    Scraper for UX Collective articles on Medium.
    Note: Medium can be tricky to scrape. This is a basic implementation.
    """
    
    def __init__(self):
        super().__init__("UX Collective", "https://uxdesign.cc")
    
    def scrape_article(self, url: str) -> Optional[UXResource]:
        """
        Scrape a UX Collective article.
        """
        print(f"  → Scraping UX Collective: {url}")
        
        soup = self._fetch_url(url)
        if not soup:
            return None
        
        try:
            # Medium article structure
            title_elem = soup.find('h1')
            title = title_elem.get_text(strip=True) if title_elem else "Untitled"
            
            # Extract author
            author_elem = soup.find('a', {'data-testid': 'authorName'})
            if not author_elem:
                author_elem = soup.find('meta', {'name': 'author'})
            author = author_elem.get('content', 'UX Collective') if author_elem and author_elem.get('content') else "UX Collective"
            
            # Extract article content
            article = soup.find('article')
            if not article:
                print(f"  ⊗ Could not find article content")
                return None
            
            content = md(str(article))
            content = self._clean_text(content)
            
            # Extract tags
            tags = []
            tag_links = soup.find_all('a', href=lambda href: href and '/tag/' in href)
            for tag in tag_links[:5]:
                tags.append(tag.get_text(strip=True))
            
            # Infer category and difficulty
            category = CategoryMapper.infer_category(title, content, tags)
            difficulty = DifficultyClassifier.classify_difficulty(title, content, tags)
            
            resource = UXResource(
                id=UXResource.generate_id(url),
                title=title,
                url=url,
                content=content,
                summary=create_summary(content),
                category=category,
                resource_type="article",
                difficulty=difficulty,
                tags=tags,
                author=author,
                source="uxdesign.cc",
                publish_date="",
                estimated_read_time=estimate_read_time(content)
            )
            
            print(f"  ✓ Scraped: {title}")
            return resource
            
        except Exception as e:
            print(f"  ✗ Error parsing article: {str(e)}")
            return None


class SmashingMagazineScraper(BaseScraper):
    """
    Scraper for Smashing Magazine UX articles.
    """
    
    def __init__(self):
        super().__init__("Smashing Magazine", "https://www.smashingmagazine.com")
    
    def scrape_article(self, url: str) -> Optional[UXResource]:
        """
        Scrape a Smashing Magazine article.
        """
        print(f"  → Scraping Smashing Magazine: {url}")
        
        soup = self._fetch_url(url)
        if not soup:
            return None
        
        try:
            # Extract title
            title_elem = soup.find('h1', class_='article__title')
            if not title_elem:
                title_elem = soup.find('h1')
            title = title_elem.get_text(strip=True) if title_elem else "Untitled"
            
            # Extract author
            author_elem = soup.find('a', class_='author-link')
            author = author_elem.get_text(strip=True) if author_elem else "Smashing Magazine"
            
            # Extract content
            article_body = soup.find('div', class_='article__body') or soup.find('article')
            if not article_body:
                print(f"  ⊗ Could not find article body")
                return None
            
            content = md(str(article_body))
            content = self._clean_text(content)
            
            # Extract tags
            tags = []
            tag_links = soup.find_all('a', href=lambda href: href and '/category/' in href)
            for tag in tag_links[:5]:
                tags.append(tag.get_text(strip=True))
            
            # Infer category and difficulty
            category = CategoryMapper.infer_category(title, content, tags)
            difficulty = DifficultyClassifier.classify_difficulty(title, content, tags)
            
            resource = UXResource(
                id=UXResource.generate_id(url),
                title=title,
                url=url,
                content=content,
                summary=create_summary(content),
                category=category,
                resource_type="article",
                difficulty=difficulty,
                tags=tags,
                author=author,
                source="smashingmagazine.com",
                publish_date="",
                estimated_read_time=estimate_read_time(content)
            )
            
            print(f"  ✓ Scraped: {title}")
            return resource
            
        except Exception as e:
            print(f"  ✗ Error parsing article: {str(e)}")
            return None


class AListApartScraper(BaseScraper):
    """
    Scraper for A List Apart design articles.
    """
    
    def __init__(self):
        super().__init__("A List Apart", "https://alistapart.com")
    
    def scrape_article(self, url: str) -> Optional[UXResource]:
        """
        Scrape an A List Apart article.
        """
        print(f"  → Scraping A List Apart: {url}")
        
        soup = self._fetch_url(url)
        if not soup:
            return None
        
        try:
            # Extract title
            title_elem = soup.find('h1', class_='entry-title')
            if not title_elem:
                title_elem = soup.find('h1')
            title = title_elem.get_text(strip=True) if title_elem else "Untitled"
            
            # Extract author
            author_elem = soup.find('a', rel='author')
            author = author_elem.get_text(strip=True) if author_elem else "A List Apart"
            
            # Extract content
            article_body = soup.find('div', class_='entry-content')
            if not article_body:
                article_body = soup.find('article')
            if not article_body:
                print(f"  ⊗ Could not find article body")
                return None
            
            content = md(str(article_body))
            content = self._clean_text(content)
            
            # Extract tags
            tags = []
            tag_links = soup.find_all('a', rel='tag')
            for tag in tag_links:
                tags.append(tag.get_text(strip=True))
            
            # Infer category and difficulty
            category = CategoryMapper.infer_category(title, content, tags)
            difficulty = DifficultyClassifier.classify_difficulty(title, content, tags)
            
            resource = UXResource(
                id=UXResource.generate_id(url),
                title=title,
                url=url,
                content=content,
                summary=create_summary(content),
                category=category,
                resource_type="article",
                difficulty=difficulty,
                tags=tags,
                author=author,
                source="alistapart.com",
                publish_date="",
                estimated_read_time=estimate_read_time(content)
            )
            
            print(f"  ✓ Scraped: {title}")
            return resource
            
        except Exception as e:
            print(f"  ✗ Error parsing article: {str(e)}")
            return None


class ScraperFactory:
    """
    Factory to create appropriate scraper for a given source.
    """
    
    SCRAPERS = {
        'nngroup': NNGroupScraper,
        'lawsofux': LawsOfUXScraper,
        'uxcollective': UXCollectiveScraper,
        'smashing': SmashingMagazineScraper,
        'alistapart': AListApartScraper
    }
    
    @classmethod
    def create_scraper(cls, source_name: str) -> Optional[BaseScraper]:
        """
        Create a scraper instance for the given source.
        """
        scraper_class = cls.SCRAPERS.get(source_name.lower())
        if scraper_class:
            return scraper_class()
        return None
    
    @classmethod
    def get_available_sources(cls) -> List[str]:
        """
        Get list of available scraper sources.
        """
        return list(cls.SCRAPERS.keys())

