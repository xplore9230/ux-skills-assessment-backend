#!/usr/bin/env python3
"""
Re-classify Existing Content in Vector Store
=============================================

This script re-classifies all existing resources in the vector store using
the OpenAI classifier. This is useful when:
- The API key was not configured initially
- You want to update categories based on improved prompts
- Content was added with incorrect default categories

WARNING: This will update metadata for all resources in the vector store.
"""

import os
import sys
import argparse
from typing import List, Dict, Any

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

from vector_store import get_vector_store
from ai_classifier import classify_content, OPENAI_API_KEY
from knowledge_base import UXResource


def get_all_resources() -> List[Dict[str, Any]]:
    """
    Get all unique resources from the vector store.
    """
    vs = get_vector_store()
    
    # Get all data
    all_data = vs.collection.get()
    
    # Deduplicate by resource_id
    seen = {}
    for i, metadata in enumerate(all_data['metadatas']):
        resource_id = metadata.get('resource_id')
        if resource_id and resource_id not in seen:
            seen[resource_id] = {
                'resource_id': resource_id,
                'title': metadata.get('title', ''),
                'url': metadata.get('url', ''),
                'content': all_data['documents'][i] if i < len(all_data['documents']) else '',
                'current_category': metadata.get('category', ''),
                'current_difficulty': metadata.get('difficulty', ''),
                'source': metadata.get('source', ''),
            }
    
    return list(seen.values())


def reclassify_resource(resource: Dict[str, Any], dry_run: bool = False) -> Dict[str, Any]:
    """
    Classify a single resource and return the new classification.
    """
    title = resource['title']
    content = resource['content'][:2000]  # Use first 2000 chars
    url = resource['url']
    
    try:
        classification = classify_content(title, content, url)
        
        result = {
            'resource_id': resource['resource_id'],
            'title': title,
            'old_category': resource['current_category'],
            'new_category': classification.get('category'),
            'old_difficulty': resource['current_difficulty'],
            'new_difficulty': classification.get('difficulty'),
            'level': classification.get('level'),
            'tags': classification.get('tags', []),
            'changed': (
                classification.get('category') != resource['current_category'] or
                classification.get('difficulty') != resource['current_difficulty']
            )
        }
        
        return result
        
    except Exception as e:
        print(f"  ✗ Error classifying {title}: {e}")
        return None


def update_resource_metadata(vs, resource_id: str, new_data: Dict[str, Any]) -> bool:
    """
    Update metadata for all chunks of a resource.
    """
    try:
        # Get all chunks for this resource
        results = vs.collection.get(
            where={"resource_id": resource_id}
        )
        
        if not results['ids']:
            return False
        
        # Update metadata for each chunk
        updated_metadatas = []
        for metadata in results['metadatas']:
            metadata['category'] = new_data['category']
            metadata['difficulty'] = new_data['difficulty']
            if 'tags' in new_data and new_data['tags']:
                metadata['tags'] = ','.join(new_data['tags'])
            updated_metadatas.append(metadata)
        
        # Update in ChromaDB
        vs.collection.update(
            ids=results['ids'],
            metadatas=updated_metadatas
        )
        
        return True
        
    except Exception as e:
        print(f"  ✗ Error updating metadata: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(
        description="Re-classify existing content in the vector store",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Dry run (preview changes without applying)
  python reclassify_content.py --dry-run
  
  # Apply re-classification
  python reclassify_content.py
  
  # Limit to first 10 resources (for testing)
  python reclassify_content.py --limit 10
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
    
    args = parser.parse_args()
    
    # Check API key
    if not OPENAI_API_KEY:
        print("\n❌ ERROR: OPENAI_API_KEY is not set")
        print("   Please create a .env file with your OpenAI API key")
        print()
        return 1
    
    print("\n" + "="*70)
    print("  RE-CLASSIFY EXISTING CONTENT")
    print("="*70 + "\n")
    
    if args.dry_run:
        print("🔍 DRY RUN MODE - No changes will be applied")
        print()
    
    # Get all resources
    print("📊 Fetching resources from vector store...")
    resources = get_all_resources()
    
    if args.limit:
        resources = resources[:args.limit]
    
    print(f"   Found {len(resources)} unique resources")
    print()
    
    # Re-classify each resource
    print("🤖 Re-classifying content using OpenAI...")
    print()
    
    results = []
    changed_count = 0
    
    for i, resource in enumerate(resources, 1):
        print(f"[{i}/{len(resources)}] {resource['title'][:60]}...")
        
        result = reclassify_resource(resource, dry_run=args.dry_run)
        
        if result:
            results.append(result)
            
            if result['changed']:
                changed_count += 1
                print(f"  → Category: {result['old_category']} → {result['new_category']}")
                print(f"  → Difficulty: {result['old_difficulty']} → {result['new_difficulty']}")
                
                # Update in vector store if not dry run
                if not args.dry_run:
                    vs = get_vector_store()
                    success = update_resource_metadata(
                        vs,
                        result['resource_id'],
                        {
                            'category': result['new_category'],
                            'difficulty': result['new_difficulty'],
                            'tags': result['tags']
                        }
                    )
                    if success:
                        print("  ✓ Updated in vector store")
                    else:
                        print("  ✗ Failed to update")
            else:
                print("  → No changes needed")
        
        print()
    
    # Summary
    print("="*70)
    print("  SUMMARY")
    print("="*70)
    print(f"  Total resources processed: {len(results)}")
    print(f"  Resources changed:         {changed_count}")
    print(f"  Resources unchanged:       {len(results) - changed_count}")
    
    if args.dry_run:
        print()
        print("  ℹ️  This was a dry run. Run without --dry-run to apply changes.")
    
    print()
    print("="*70)
    print()
    
    # Show category distribution
    if results:
        print("📊 New Category Distribution:")
        categories = {}
        for result in results:
            cat = result['new_category']
            categories[cat] = categories.get(cat, 0) + 1
        
        for cat, count in sorted(categories.items()):
            print(f"   {cat:30s}: {count:3d} resources")
        print()
    
    return 0


if __name__ == "__main__":
    sys.exit(main())

