#!/usr/bin/env python3
"""
Run Social Media Content Aggregator
===================================

Scrapes and stores social media content (YouTube, podcasts, tweets) 
into the vector store. Run this in the background to populate content.
"""

import logging
import sys
from content_aggregator import ContentAggregator

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

def main():
    print("\n" + "="*70)
    print("  SOCIAL MEDIA CONTENT AGGREGATOR")
    print("="*70 + "\n")
    
    try:
        aggregator = ContentAggregator()
        summary = aggregator.run_full_update()
        
        print("\n" + "="*70)
        print("  SUMMARY")
        print("="*70)
        print(f"  YouTube videos added: {summary['youtube_new']}")
        print(f"  Podcast episodes added: {summary['podcast_new']}")
        print(f"  Tweets added: {summary['tweets_new']}")
        print(f"  URLs discovered: {summary['discovered_urls']}")
        print("="*70 + "\n")
        
        return 0
    except Exception as e:
        print(f"\n✗ Error: {e}\n")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())
