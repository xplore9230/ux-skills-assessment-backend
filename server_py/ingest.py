#!/usr/bin/env python3
"""
Ingestion Pipeline for RAG System

Command-line tool to scrape UX resources and populate the knowledge base.

Usage:
    python ingest.py --scrape --sources nngroup,lawsofux --limit 20
    python ingest.py --scrape --sources all --limit 100
    python ingest.py --add-url <url> --source nngroup
"""

import argparse
import sys
import json
from typing import List, Optional
from datetime import datetime

from scraper import ScraperFactory, NNGroupScraper, LawsOfUXScraper
from knowledge_base import ContentChunker, UXResource
from vector_store import get_vector_store, init_vector_store


class IngestionPipeline:
    """
    Orchestrates the scraping, processing, and storage of UX resources.
    """
    
    def __init__(self, reset: bool = False):
        """
        Initialize the ingestion pipeline.
        
        Args:
            reset: If True, clear existing data before ingestion
        """
        print("\n" + "="*70)
        print("  UX RESOURCES INGESTION PIPELINE")
        print("="*70 + "\n")
        
        # Initialize vector store
        self.vector_store = init_vector_store(reset=reset)
        
        # Initialize chunker
        self.chunker = ContentChunker(
            chunk_size=500,
            overlap=50,
            min_chunk_size=100
        )
        
        # Statistics
        self.stats = {
            'total_scraped': 0,
            'successful': 0,
            'failed': 0,
            'skipped': 0,
            'sources': {}
        }
    
    def scrape_source(
        self,
        source: str,
        limit: int = 10,
        urls: Optional[List[str]] = None
    ) -> int:
        """
        Scrape resources from a specific source.
        
        Args:
            source: Source name (nngroup, lawsofux, etc.)
            limit: Maximum number of resources to scrape
            urls: Optional list of specific URLs to scrape
        
        Returns:
            Number of successfully scraped resources
        """
        print(f"\n{'─'*70}")
        print(f"  SOURCE: {source.upper()}")
        print(f"{'─'*70}\n")
        
        scraper = ScraperFactory.create_scraper(source)
        if not scraper:
            print(f"✗ Unknown source: {source}")
            return 0
        
        success_count = 0
        
        # Get URLs to scrape
        if urls:
            urls_to_scrape = urls[:limit]
        else:
            urls_to_scrape = self._get_urls_for_source(source, scraper, limit)
        
        print(f"📥 Processing {len(urls_to_scrape)} URLs from {source}...\n")
        
        # Scrape each URL
        for idx, url in enumerate(urls_to_scrape, 1):
            print(f"[{idx}/{len(urls_to_scrape)}] {url}")
            
            try:
                # Scrape the resource
                resource = scraper.scrape_article(url)
                
                if resource:
                    # Process and store
                    if self._process_and_store(resource):
                        success_count += 1
                        self.stats['successful'] += 1
                    else:
                        self.stats['skipped'] += 1
                else:
                    self.stats['failed'] += 1
                
                self.stats['total_scraped'] += 1
                
            except Exception as e:
                print(f"  ✗ Error: {str(e)}")
                self.stats['failed'] += 1
        
        # Update source stats
        self.stats['sources'][source] = success_count
        
        print(f"\n✓ Completed {source}: {success_count}/{len(urls_to_scrape)} successful\n")
        
        return success_count
    
    def _get_urls_for_source(
        self,
        source: str,
        scraper,
        limit: int
    ) -> List[str]:
        """
        Get URLs to scrape for a given source.
        """
        if source == 'lawsofux' and hasattr(scraper, 'get_all_laws'):
            return scraper.get_all_laws()
        elif source == 'nngroup' and hasattr(scraper, 'get_article_links'):
            return scraper.get_article_links(limit=limit)
        else:
            # For other sources, would need to be provided manually
            return []
    
    def _process_and_store(self, resource: UXResource) -> bool:
        """
        Process a resource (chunk it) and store in vector database.
        
        Returns:
            True if successful, False if skipped or failed
        """
        try:
            # Check if already exists
            if self.vector_store.resource_exists(resource.id):
                print(f"  ⊗ Already exists, skipping")
                return False
            
            # Create chunks
            chunks = self.chunker.create_chunks(resource)
            
            if not chunks:
                print(f"  ⊗ No chunks created, skipping")
                return False
            
            # Store in vector database
            success = self.vector_store.add_resource(resource, chunks)
            
            return success
            
        except Exception as e:
            print(f"  ✗ Processing error: {str(e)}")
            return False
    
    def scrape_all_sources(self, limit_per_source: int = 20) -> None:
        """
        Scrape from all available sources.
        """
        sources = ScraperFactory.get_available_sources()
        
        print(f"\n📚 Scraping from {len(sources)} sources...")
        print(f"   Limit per source: {limit_per_source}")
        
        for source in sources:
            try:
                self.scrape_source(source, limit=limit_per_source)
            except Exception as e:
                print(f"✗ Error scraping {source}: {str(e)}")
    
    def add_manual_resource(
        self,
        url: str,
        source: str
    ) -> bool:
        """
        Manually add a single resource by URL.
        
        Args:
            url: URL of the resource
            source: Source name (nngroup, uxcollective, etc.)
        
        Returns:
            True if successful
        """
        print(f"\n📥 Adding resource: {url}")
        
        scraper = ScraperFactory.create_scraper(source)
        if not scraper:
            print(f"✗ Unknown source: {source}")
            return False
        
        try:
            resource = scraper.scrape_article(url)
            
            if resource:
                return self._process_and_store(resource)
            else:
                print(f"✗ Failed to scrape resource")
                return False
                
        except Exception as e:
            print(f"✗ Error: {str(e)}")
            return False
    
    def print_summary(self) -> None:
        """
        Print ingestion summary statistics.
        """
        print("\n" + "="*70)
        print("  INGESTION SUMMARY")
        print("="*70)
        
        print(f"\n📊 Statistics:")
        print(f"   Total URLs processed: {self.stats['total_scraped']}")
        print(f"   ✓ Successful:         {self.stats['successful']}")
        print(f"   ⊗ Skipped (exists):   {self.stats['skipped']}")
        print(f"   ✗ Failed:             {self.stats['failed']}")
        
        if self.stats['sources']:
            print(f"\n📚 By Source:")
            for source, count in self.stats['sources'].items():
                print(f"   {source:20s}: {count}")
        
        # Get vector store stats
        vs_stats = self.vector_store.get_stats()
        
        print(f"\n💾 Knowledge Base Status:")
        print(f"   Total resources:  {vs_stats.get('unique_resources', 0)}")
        print(f"   Total chunks:     {vs_stats.get('total_chunks', 0)}")
        
        if vs_stats.get('categories'):
            print(f"\n📂 By Category:")
            for category, count in sorted(vs_stats['categories'].items()):
                print(f"   {category:30s}: {count} chunks")
        
        if vs_stats.get('difficulties'):
            print(f"\n📈 By Difficulty:")
            for difficulty, count in sorted(vs_stats['difficulties'].items()):
                print(f"   {difficulty:15s}: {count} chunks")
        
        print("\n" + "="*70 + "\n")


def main():
    """
    Main entry point for CLI.
    """
    parser = argparse.ArgumentParser(
        description="Ingest UX resources into the RAG knowledge base",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Scrape 20 articles from Nielsen Norman Group
  python ingest.py --scrape --sources nngroup --limit 20
  
  # Scrape all Laws of UX
  python ingest.py --scrape --sources lawsofux
  
  # Scrape from all sources (100 total)
  python ingest.py --scrape --sources all --limit 100
  
  # Add a specific URL
  python ingest.py --add-url https://www.nngroup.com/articles/ten-usability-heuristics/ --source nngroup
  
  # Reset and rebuild from scratch
  python ingest.py --scrape --sources all --reset --limit 150
        """
    )
    
    parser.add_argument(
        '--scrape',
        action='store_true',
        help='Scrape resources from sources'
    )
    
    parser.add_argument(
        '--sources',
        type=str,
        help='Comma-separated list of sources or "all" (nngroup,lawsofux,uxcollective,smashing,alistapart)'
    )
    
    parser.add_argument(
        '--limit',
        type=int,
        default=10,
        help='Maximum number of resources per source (default: 10)'
    )
    
    parser.add_argument(
        '--add-url',
        type=str,
        help='Add a specific URL manually'
    )
    
    parser.add_argument(
        '--source',
        type=str,
        help='Source name for manual URL addition'
    )
    
    parser.add_argument(
        '--reset',
        action='store_true',
        help='Clear existing data before ingestion (USE WITH CAUTION!)'
    )
    
    args = parser.parse_args()
    
    # Validate arguments
    if not args.scrape and not args.add_url:
        parser.print_help()
        sys.exit(1)
    
    if args.add_url and not args.source:
        print("✗ Error: --source is required when using --add-url")
        sys.exit(1)
    
    # Initialize pipeline
    pipeline = IngestionPipeline(reset=args.reset)
    
    try:
        # Add manual URL
        if args.add_url:
            success = pipeline.add_manual_resource(args.add_url, args.source)
            sys.exit(0 if success else 1)
        
        # Scrape from sources
        if args.scrape:
            if not args.sources:
                print("✗ Error: --sources is required when using --scrape")
                sys.exit(1)
            
            if args.sources.lower() == 'all':
                pipeline.scrape_all_sources(limit_per_source=args.limit)
            else:
                sources = [s.strip() for s in args.sources.split(',')]
                for source in sources:
                    pipeline.scrape_source(source, limit=args.limit)
        
        # Print summary
        pipeline.print_summary()
        
    except KeyboardInterrupt:
        print("\n\n⚠ Interrupted by user")
        pipeline.print_summary()
        sys.exit(1)
    except Exception as e:
        print(f"\n✗ Fatal error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()

