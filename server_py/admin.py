#!/usr/bin/env python3
"""
Admin Tool for RAG Knowledge Base Management

CLI tool for viewing, managing, and testing the knowledge base.

Usage:
    python admin.py --stats
    python admin.py --search "usability testing"
    python admin.py --rebuild-index
    python admin.py --clear (USE WITH CAUTION!)
"""

import argparse
import sys
import json
from typing import Optional

from vector_store import get_vector_store
from rag import get_rag_retriever


def print_stats():
    """Display knowledge base statistics."""
    print("\n" + "="*70)
    print("  KNOWLEDGE BASE STATISTICS")
    print("="*70 + "\n")
    
    vector_store = get_vector_store()
    stats = vector_store.get_stats()
    
    print(f"📊 Overview:")
    print(f"   Total unique resources: {stats.get('unique_resources', 0)}")
    print(f"   Total content chunks:   {stats.get('total_chunks', 0)}")
    
    if stats.get('categories'):
        print(f"\n📂 Resources by Category:")
        for category, count in sorted(stats['categories'].items()):
            unique_count = count  # This is chunk count, approx
            print(f"   {category:30s}: {count:3d} chunks")
    
    if stats.get('difficulties'):
        print(f"\n📈 Resources by Difficulty:")
        for difficulty, count in sorted(stats['difficulties'].items()):
            print(f"   {difficulty:15s}: {count:3d} chunks")
    
    if stats.get('sources'):
        print(f"\n🌐 Resources by Source:")
        for source, count in sorted(stats['sources'].items(), key=lambda x: x[1], reverse=True):
            print(f"   {source:30s}: {count:3d} chunks")
    
    print("\n" + "="*70 + "\n")


def search_knowledge_base(query: str, category: Optional[str] = None, limit: int = 5):
    """Search the knowledge base and display results."""
    print("\n" + "="*70)
    print(f"  SEARCH RESULTS: '{query}'")
    if category:
        print(f"  Category filter: {category}")
    print("="*70 + "\n")
    
    rag = get_rag_retriever()
    results = rag.semantic_search_resources(
        query=query,
        category=category,
        top_k=limit
    )
    
    if not results:
        print("❌ No results found.\n")
        return
    
    print(f"Found {len(results)} results:\n")
    
    for idx, resource in enumerate(results, 1):
        print(f"{idx}. {resource.get('title', 'Untitled')}")
        print(f"   Category:   {resource.get('category', 'Unknown')}")
        print(f"   Difficulty: {resource.get('difficulty', 'Unknown')}")
        print(f"   Type:       {resource.get('resource_type', 'Unknown')}")
        print(f"   Source:     {resource.get('source', 'Unknown')}")
        print(f"   URL:        {resource.get('url', 'N/A')}")
        print(f"   Relevance:  {resource.get('relevance_score', 0):.3f}")
        
        preview = resource.get('content_preview', '')
        if preview:
            print(f"   Preview:    {preview[:100]}...")
        print()
    
    print("="*70 + "\n")


def rebuild_index():
    """Rebuild the vector store index."""
    print("\n🔨 Rebuilding index...")
    
    vector_store = get_vector_store()
    success = vector_store.rebuild_index()
    
    if success:
        print("✓ Index rebuilt successfully\n")
    else:
        print("✗ Error rebuilding index\n")


def clear_database():
    """Clear all data from the knowledge base."""
    print("\n⚠️  WARNING: This will delete ALL data from the knowledge base!")
    response = input("Type 'DELETE' to confirm: ")
    
    if response == 'DELETE':
        vector_store = get_vector_store()
        success = vector_store.clear_all()
        
        if success:
            print("✓ Knowledge base cleared\n")
        else:
            print("✗ Error clearing database\n")
    else:
        print("❌ Cancelled\n")


def test_rag_retrieval(stage: str = "Practitioner"):
    """Test RAG retrieval with sample data."""
    print("\n" + "="*70)
    print(f"  TEST RAG RETRIEVAL - Stage: {stage}")
    print("="*70 + "\n")
    
    # Sample weak categories
    categories = [
        {'name': 'User Research & Validation', 'score': 40, 'maxScore': 100},
        {'name': 'UX Fundamentals', 'score': 60, 'maxScore': 100},
        {'name': 'UI Craft & Visual Design', 'score': 80, 'maxScore': 100}
    ]
    
    print("📊 Sample Input:")
    print(f"   Stage: {stage}")
    for cat in categories:
        percentage = round((cat['score'] / cat['maxScore']) * 100)
        print(f"   - {cat['name']}: {cat['score']}/{cat['maxScore']} ({percentage}%)")
    
    print("\n🔍 Retrieving resources...\n")
    
    rag = get_rag_retriever()
    resources = rag.retrieve_resources_for_user(
        stage=stage,
        categories=categories,
        top_k=5
    )
    
    if not resources:
        print("❌ No resources retrieved.\n")
        return
    
    print(f"✓ Retrieved {len(resources)} resources:\n")
    
    for idx, resource in enumerate(resources, 1):
        print(f"{idx}. {resource.get('title', 'Untitled')}")
        print(f"   Category:   {resource.get('category', 'Unknown')}")
        print(f"   Difficulty: {resource.get('difficulty', 'Unknown')}")
        print(f"   Relevance:  {resource.get('relevance_score', 0):.3f}")
        print()
    
    print("="*70 + "\n")


def export_resources(output_file: str = "resources_export.json"):
    """Export all resources to a JSON file."""
    print(f"\n📤 Exporting resources to {output_file}...")
    
    vector_store = get_vector_store()
    collection = vector_store.collection
    
    try:
        # Get all data
        all_data = collection.get()
        
        # Format for export
        export_data = {
            'exported_at': str(vector_store.collection.count()),
            'total_chunks': len(all_data['ids']),
            'chunks': []
        }
        
        for i in range(len(all_data['ids'])):
            export_data['chunks'].append({
                'id': all_data['ids'][i],
                'content': all_data['documents'][i],
                'metadata': all_data['metadatas'][i]
            })
        
        # Write to file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, indent=2, ensure_ascii=False)
        
        print(f"✓ Exported {len(all_data['ids'])} chunks to {output_file}\n")
        
    except Exception as e:
        print(f"✗ Export failed: {str(e)}\n")


def main():
    """Main entry point for CLI."""
    parser = argparse.ArgumentParser(
        description="Admin tool for RAG knowledge base management",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # View statistics
  python admin.py --stats
  
  # Search the knowledge base
  python admin.py --search "usability testing"
  
  # Search within a category
  python admin.py --search "wireframing" --category "UX Fundamentals"
  
  # Test RAG retrieval
  python admin.py --test-rag --stage "Practitioner"
  
  # Rebuild index
  python admin.py --rebuild-index
  
  # Export resources
  python admin.py --export --output resources.json
  
  # Clear database (CAUTION!)
  python admin.py --clear
        """
    )
    
    parser.add_argument(
        '--stats',
        action='store_true',
        help='Display knowledge base statistics'
    )
    
    parser.add_argument(
        '--search',
        type=str,
        help='Search the knowledge base'
    )
    
    parser.add_argument(
        '--category',
        type=str,
        help='Filter search by category'
    )
    
    parser.add_argument(
        '--limit',
        type=int,
        default=5,
        help='Number of search results (default: 5)'
    )
    
    parser.add_argument(
        '--rebuild-index',
        action='store_true',
        help='Rebuild the vector store index'
    )
    
    parser.add_argument(
        '--clear',
        action='store_true',
        help='Clear all data from the knowledge base (USE WITH CAUTION!)'
    )
    
    parser.add_argument(
        '--test-rag',
        action='store_true',
        help='Test RAG retrieval with sample data'
    )
    
    parser.add_argument(
        '--stage',
        type=str,
        default='Practitioner',
        choices=['Explorer', 'Practitioner', 'Emerging Senior', 'Strategic Lead'],
        help='Stage for RAG testing (default: Practitioner)'
    )
    
    parser.add_argument(
        '--export',
        action='store_true',
        help='Export resources to JSON file'
    )
    
    parser.add_argument(
        '--output',
        type=str,
        default='resources_export.json',
        help='Output file for export (default: resources_export.json)'
    )
    
    args = parser.parse_args()
    
    # If no arguments, show help
    if len(sys.argv) == 1:
        parser.print_help()
        sys.exit(0)
    
    try:
        if args.stats:
            print_stats()
        
        if args.search:
            search_knowledge_base(args.search, args.category, args.limit)
        
        if args.rebuild_index:
            rebuild_index()
        
        if args.clear:
            clear_database()
        
        if args.test_rag:
            test_rag_retrieval(args.stage)
        
        if args.export:
            export_resources(args.output)
        
    except KeyboardInterrupt:
        print("\n\n⚠ Interrupted by user\n")
        sys.exit(1)
    except Exception as e:
        print(f"\n✗ Error: {str(e)}\n")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()



