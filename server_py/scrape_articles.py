#!/usr/bin/env python3
"""
Scrape Articles from Credible Sources
======================================

This script scrapes articles from credible UX sources focusing on
UI Craft & Visual Design and User Research & Validation categories.

Usage:
    python scrape_articles.py [--category ui|research|all] [--dry-run]
"""

import sys
import os
import json
import argparse
from typing import List, Dict, Any

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

from scraper import ScraperFactory, NNGroupScraper
from knowledge_base import ContentChunker, UXResource
from vector_store import get_vector_store
from ai_classifier import classify_content, OPENAI_API_KEY


class ArticleScraper:
    """
    Scrapes articles from credible sources and adds them to vector store.
    """
    
    def __init__(self):
        self.vector_store = get_vector_store()
        self.chunker = ContentChunker(chunk_size=500, overlap=50, min_chunk_size=100)
        self.stats = {
            'total': 0,
            'added': 0,
            'duplicates': 0,
            'failed': 0,
            'by_category': {}
        }
    
    def scrape_url(self, url: str, source: str, category: str = None) -> bool:
        """
        Scrape a single article URL and add to vector store.
        """
        self.stats['total'] += 1
        
        try:
            # Check if already exists
            resource_id = UXResource.generate_id(url)
            if self.vector_store.resource_exists(resource_id):
                self.stats['duplicates'] += 1
                return False
            
            # Get appropriate scraper
            scraper = ScraperFactory.create_scraper(source)
            if not scraper:
                print(f"  ⚠ No scraper found for source: {source}")
                self.stats['failed'] += 1
                return False
            
            # Scrape the article
            if source == 'nngroup':
                resource = scraper.scrape_article(url)
            elif source == 'lawsofux':
                resource = scraper.scrape_law(url)
            else:
                resource = scraper.scrape_article(url)
            
            if not resource:
                self.stats['failed'] += 1
                return False
            
            # Override category if specified
            if category:
                resource.category = category
            
            # Use AI classifier if API key is available
            if OPENAI_API_KEY:
                try:
                    snippet = resource.summary or resource.content[:2000]
                    cls = classify_content(resource.title, snippet, resource.url)
                    resource.category = cls.get("category", resource.category)
                    resource.difficulty = cls.get("difficulty", resource.difficulty)
                    tags = cls.get("tags", [])
                    if isinstance(tags, list):
                        resource.tags.extend(tags)
                except Exception as e:
                    print(f"  ⚠ Classification error: {e}")
            
            # Chunk and store
            chunks = self.chunker.create_chunks(resource)
            if not chunks:
                self.stats['failed'] += 1
                return False
            
            if self.vector_store.add_resource(resource, chunks):
                self.stats['added'] += 1
                cat = resource.category
                self.stats['by_category'][cat] = self.stats['by_category'].get(cat, 0) + 1
                return True
            else:
                self.stats['duplicates'] += 1
                return False
                
        except Exception as e:
            print(f"  ✗ Error scraping {url}: {e}")
            self.stats['failed'] += 1
            return False
    
    def scrape_from_config(self, config_path: str, categories: List[str] = None, dry_run: bool = False):
        """
        Scrape articles from configuration file.
        """
        with open(config_path, 'r') as f:
            config = json.load(f)
        
        print("\n" + "="*70)
        print("  SCRAPING ARTICLES FROM CREDIBLE SOURCES")
        print("="*70 + "\n")
        
        if dry_run:
            print("🔍 DRY RUN MODE - No changes will be applied\n")
        
        # Determine which categories to scrape
        if categories is None or 'all' in categories:
            categories = ['ui_craft_visual_design', 'user_research_validation']
        
        for cat_key in categories:
            if cat_key not in config:
                print(f"⚠ Category '{cat_key}' not found in config")
                continue
            
            print(f"\n{'─'*70}")
            print(f"  CATEGORY: {cat_key.replace('_', ' ').title()}")
            print(f"{'─'*70}\n")
            
            sources = config[cat_key]
            for source_config in sources:
                source = source_config['source']
                urls = source_config['urls']
                
                print(f"📚 Source: {source} ({len(urls)} URLs)\n")
                
                for i, url in enumerate(urls, 1):
                    if dry_run:
                        print(f"  [{i}/{len(urls)}] Would scrape: {url}")
                    else:
                        print(f"  [{i}/{len(urls)}] Scraping: {url[:60]}...")
                        self.scrape_url(url, source, cat_key.replace('_', ' ').title())
        
        # Print summary
        print("\n" + "="*70)
        print("  SUMMARY")
        print("="*70)
        print(f"  Total URLs processed:     {self.stats['total']}")
        print(f"  Successfully added:       {self.stats['added']}")
        print(f"  Duplicates (skipped):     {self.stats['duplicates']}")
        print(f"  Failed:                   {self.stats['failed']}")
        
        if self.stats['by_category']:
            print(f"\n  By Category:")
            for cat, count in sorted(self.stats['by_category'].items()):
                print(f"    {cat:30s}: {count:3d} articles")
        
        print("="*70 + "\n")


def main():
    parser = argparse.ArgumentParser(
        description="Scrape articles from credible UX sources",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Scrape all articles
  python scrape_articles.py
  
  # Scrape only UI Craft & Visual Design
  python scrape_articles.py --category ui
  
  # Scrape only User Research & Validation
  python scrape_articles.py --category research
  
  # Dry run (preview)
  python scrape_articles.py --dry-run
        """
    )
    
    parser.add_argument(
        '--category',
        type=str,
        nargs='+',
        choices=['ui', 'research', 'all'],
        default=['all'],
        help='Categories to scrape (ui=UI Craft, research=User Research, all=both)'
    )
    
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Preview without scraping'
    )
    
    parser.add_argument(
        '--config',
        type=str,
        default='server_py/article_sources.json',
        help='Path to article sources configuration file'
    )
    
    args = parser.parse_args()
    
    # Map category arguments
    category_map = {
        'ui': ['ui_craft_visual_design'],
        'research': ['user_research_validation'],
        'all': ['ui_craft_visual_design', 'user_research_validation']
    }
    
    categories = []
    for cat_arg in args.category:
        categories.extend(category_map.get(cat_arg, []))
    
    # Remove duplicates
    categories = list(set(categories))
    
    scraper = ArticleScraper()
    scraper.scrape_from_config(args.config, categories, args.dry_run)
    
    return 0


if __name__ == '__main__':
    sys.exit(main())

