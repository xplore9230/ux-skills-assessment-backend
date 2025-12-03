#!/usr/bin/env python3
"""
Import Knowledge Bank Resources into Vector Store
==================================================

This script imports resources from the exported knowledge bank JSON file
into the vector database, checking for duplicates by URL.

Usage:
    python import_knowledge_bank.py [--dry-run] [--limit N] [--json-file PATH]
"""

import sys
import os
import json
import argparse
from typing import List, Dict, Any
from urllib.parse import urlparse

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

from knowledge_base import UXResource, ContentChunker
from vector_store import get_vector_store


def level_to_difficulty(level: str) -> str:
    """
    Map knowledge bank level to difficulty.
    """
    mapping = {
        'explorer': 'beginner',
        'practitioner': 'intermediate',
        'emerging-senior': 'intermediate',
        'strategic-lead': 'advanced'
    }
    return mapping.get(level, 'beginner')


def extract_domain(url: str) -> str:
    """Extract domain name from URL."""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.replace('www.', '')
        return domain
    except:
        return ""


def estimate_read_time_from_duration(duration: str) -> int:
    """Convert duration string to minutes."""
    if not duration:
        return 5  # Default
    
    import re
    # Extract numbers
    numbers = re.findall(r'\d+', duration)
    if numbers:
        num = int(numbers[0])
        if 'min' in duration.lower():
            return num
        elif 'hour' in duration.lower() or 'hr' in duration.lower():
            return num * 60
    return 5  # Default


def knowledge_bank_to_ux_resource(kb_resource: Dict[str, Any]) -> UXResource:
    """
    Convert knowledge bank resource to UXResource.
    """
    url = kb_resource['url']
    resource_id = UXResource.generate_id(url)
    
    # Map resource type
    kb_type = kb_resource.get('type', 'article')
    resource_type_map = {
        'article': 'article',
        'video': 'video',
        'podcast': 'podcast'
    }
    resource_type = resource_type_map.get(kb_type, 'article')
    
    # Use summary as content (knowledge bank doesn't have full content)
    # For imported resources, we'll use the summary as the main content
    content = kb_resource.get('summary', kb_resource.get('title', ''))
    
    # Create UXResource
    return UXResource(
        id=resource_id,
        title=kb_resource['title'],
        url=url,
        content=content,  # Using summary as content
        summary=kb_resource.get('summary', ''),
        category=kb_resource['category'],
        resource_type=resource_type,
        difficulty=level_to_difficulty(kb_resource['level']),
        tags=kb_resource.get('tags', []),
        author=kb_resource.get('author', ''),
        source=extract_domain(url) or kb_resource.get('source', ''),
        publish_date='',
        estimated_read_time=estimate_read_time_from_duration(kb_resource.get('duration', ''))
    )


def get_existing_urls(vs) -> set:
    """Get all existing URLs from vector store."""
    try:
        all_data = vs.collection.get()
        existing_urls = set()
        
        for metadata in all_data.get('metadatas', []):
            url = metadata.get('url')
            if url:
                existing_urls.add(url)
        
        return existing_urls
    except Exception as e:
        print(f"  ⚠ Error getting existing URLs: {e}")
        return set()


def main():
    parser = argparse.ArgumentParser(
        description="Import knowledge bank resources into vector store",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Preview changes (dry run)
  python import_knowledge_bank.py --dry-run
  
  # Import all resources
  python import_knowledge_bank.py
  
  # Test with first 10 resources
  python import_knowledge_bank.py --limit 10
  
  # Use custom JSON file
  python import_knowledge_bank.py --json-file custom_export.json
        """
    )
    
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Preview changes without applying them'
    )
    
    parser.add_argument(
        '--limit',
        type=int,
        help='Limit number of resources to process (for testing)'
    )
    
    parser.add_argument(
        '--json-file',
        type=str,
        default='server_py/knowledge_bank_export.json',
        help='Path to knowledge bank JSON export file'
    )
    
    args = parser.parse_args()
    
    print("\n" + "="*70)
    print("  IMPORT KNOWLEDGE BANK INTO VECTOR STORE")
    print("="*70 + "\n")
    
    if args.dry_run:
        print("🔍 DRY RUN MODE - No changes will be applied\n")
    
    # Load JSON file
    print(f"📖 Loading knowledge bank from {args.json_file}...")
    if not os.path.exists(args.json_file):
        print(f"❌ Error: JSON file not found: {args.json_file}")
        print(f"\n💡 First export the knowledge bank:")
        print(f"   node scripts/export-knowledge-bank.mjs")
        return 1
    
    try:
        with open(args.json_file, 'r', encoding='utf-8') as f:
            kb_resources = json.load(f)
        print(f"   Found {len(kb_resources)} resources in knowledge bank")
    except Exception as e:
        print(f"❌ Error loading JSON file: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    if args.limit:
        kb_resources = kb_resources[:args.limit]
        print(f"   Limited to first {args.limit} resources\n")
    
    # Get vector store
    print("🔍 Checking existing resources in vector store...")
    vs = get_vector_store()
    existing_urls = get_existing_urls(vs)
    print(f"   Found {len(existing_urls)} existing resources\n")
    
    # Convert and check for duplicates
    print("🔄 Converting and checking for duplicates...\n")
    
    chunker = ContentChunker(chunk_size=500, overlap=50, min_chunk_size=100)
    ux_resources = []
    duplicates = []
    new_resources = []
    errors = []
    
    for kb_res in kb_resources:
        try:
            ux_res = knowledge_bank_to_ux_resource(kb_res)
            ux_resources.append(ux_res)
            
            if ux_res.url in existing_urls:
                duplicates.append({
                    'title': ux_res.title,
                    'url': ux_res.url,
                    'category': ux_res.category
                })
            else:
                new_resources.append(ux_res)
        except Exception as e:
            errors.append({
                'resource': kb_res.get('title', 'unknown'),
                'error': str(e)
            })
            print(f"  ⚠ Error converting resource {kb_res.get('title', 'unknown')[:50]}...: {e}")
    
    # Report duplicates
    if duplicates:
        print(f"\n⚠ Found {len(duplicates)} duplicates (will be skipped):\n")
        for dup in duplicates[:10]:  # Show first 10
            print(f"   - {dup['title'][:60]}...")
            print(f"     URL: {dup['url']}")
        if len(duplicates) > 10:
            print(f"   ... and {len(duplicates) - 10} more\n")
        else:
            print()
    
    # Report errors
    if errors:
        print(f"\n⚠ Found {len(errors)} conversion errors:\n")
        for err in errors[:5]:
            print(f"   - {err['resource']}: {err['error']}")
        if len(errors) > 5:
            print(f"   ... and {len(errors) - 5} more\n")
    
    # Import new resources
    print(f"📥 Ready to import {len(new_resources)} new resources\n")
    
    if not args.dry_run and new_resources:
        print("💾 Importing resources...\n")
        added = 0
        failed = 0
        
        for i, res in enumerate(new_resources, 1):
            try:
                if vs.resource_exists(res.id):
                    continue
                
                chunks = chunker.create_chunks(res)
                if not chunks:
                    print(f"  ⚠ [{i}/{len(new_resources)}] No chunks created for: {res.title[:50]}...")
                    continue
                
                if vs.add_resource(res, chunks):
                    added += 1
                    if added % 10 == 0:
                        print(f"  ✓ Imported {added}/{len(new_resources)} resources...")
            except Exception as e:
                failed += 1
                print(f"  ✗ [{i}/{len(new_resources)}] Error importing {res.title[:50]}...: {e}")
        
        print()
        print("="*70)
        print("  SUMMARY")
        print("="*70)
        print(f"  Total knowledge bank resources: {len(kb_resources)}")
        print(f"  Duplicates found (skipped):      {len(duplicates)}")
        print(f"  Conversion errors:               {len(errors)}")
        print(f"  New resources imported:          {added}")
        print(f"  Failed imports:                  {failed}")
        print("="*70 + "\n")
        
        # Show new category distribution
        if added > 0:
            print("📊 New Category Distribution:")
            categories = {}
            for res in new_resources[:added]:
                cat = res.category
                categories[cat] = categories.get(cat, 0) + 1
            
            for cat, count in sorted(categories.items()):
                print(f"   {cat:30s}: {count:3d} resources")
            print()
        
    elif args.dry_run:
        print("="*70)
        print("  PREVIEW SUMMARY")
        print("="*70)
        print(f"  Total knowledge bank resources: {len(kb_resources)}")
        print(f"  Duplicates found (would skip):  {len(duplicates)}")
        print(f"  Conversion errors:              {len(errors)}")
        print(f"  New resources (would import):   {len(new_resources)}")
        print()
        print("  ℹ️  Run without --dry-run to import")
        print("="*70 + "\n")
    
    return 0


if __name__ == '__main__':
    sys.exit(main())

