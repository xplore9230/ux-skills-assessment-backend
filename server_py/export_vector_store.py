#!/usr/bin/env python3
"""
Export Vector Store to JSON

Exports all resources from the ChromaDB vector store to JSON format
for Railway deployment auto-population.

This ensures Railway gets all 264 resources (knowledge bank + social media + scraped articles),
not just the 83 from knowledge_bank_export.json.

Usage:
    python3 export_vector_store.py
"""

from vector_store import get_vector_store
import json

def main():
    print("📊 Connecting to vector store...")
    vs = get_vector_store()
    
    stats = vs.get_stats()
    total = stats.get('unique_resources', 0)
    print(f"📖 Found {total} resources in vector store")
    
    print("🔍 Retrieving all resources...")
    results = vs.collection.get(include=['metadatas'])
    
    resources = []
    seen = set()
    
    for metadata in results['metadatas']:
        resource_id = metadata.get('resource_id')
        if not resource_id:
            continue
            
        if resource_id in seen:
            continue
            
        seen.add(resource_id)
        
        # Convert ChromaDB metadata to knowledge bank format
        resource = {
            'id': resource_id,
            'title': metadata.get('title', ''),
            'url': metadata.get('url', ''),
            'type': metadata.get('resource_type', 'article'),
            'category': metadata.get('category', 'UX Fundamentals'),
            'level': metadata.get('difficulty', 'beginner'),
            'summary': metadata.get('summary', ''),
            'tags': metadata.get('tags', '').split(',') if metadata.get('tags') else [],
            'author': metadata.get('author', ''),
            'source': metadata.get('source', ''),
            'duration': f"{metadata.get('estimated_read_time', 5)} min read"
        }
        
        resources.append(resource)
    
    print(f"💾 Writing {len(resources)} unique resources to JSON...")
    
    with open('vector_store_export.json', 'w', encoding='utf-8') as f:
        json.dump(resources, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Successfully exported {len(resources)} resources to vector_store_export.json")
    
    # Show breakdown by category
    by_category = {}
    by_level = {}
    by_type = {}
    
    for res in resources:
        cat = res.get('category', 'Unknown')
        level = res.get('level', 'Unknown')
        res_type = res.get('type', 'Unknown')
        
        by_category[cat] = by_category.get(cat, 0) + 1
        by_level[level] = by_level.get(level, 0) + 1
        by_type[res_type] = by_type.get(res_type, 0) + 1
    
    print("\n📊 Breakdown:")
    print("\n  By Category:")
    for cat, count in sorted(by_category.items(), key=lambda x: -x[1]):
        print(f"    {cat}: {count}")
    
    print("\n  By Level:")
    for level, count in sorted(by_level.items()):
        print(f"    {level}: {count}")
    
    print("\n  By Type:")
    for res_type, count in sorted(by_type.items()):
        print(f"    {res_type}: {count}")
    
    print("\n✅ Export complete!")

if __name__ == "__main__":
    main()

