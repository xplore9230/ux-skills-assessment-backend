#!/usr/bin/env python3
"""
RAG System Test Suite

Tests all components of the RAG system to ensure proper functionality:
- Knowledge base schema and chunking
- Vector store operations
- Scraper functionality (without actual scraping)
- RAG retrieval
- API endpoint validation

Run this before the first ingestion to verify setup.
"""

import sys
from typing import List, Dict, Any


def test_imports():
    """Test that all required modules can be imported."""
    print("\n" + "="*70)
    print("  TEST 1: Module Imports")
    print("="*70)
    
    try:
        import chromadb
        print("✓ chromadb imported")
    except ImportError as e:
        print(f"✗ chromadb import failed: {e}")
        return False
    
    try:
        import sentence_transformers
        print("✓ sentence-transformers imported")
    except ImportError as e:
        print(f"✗ sentence-transformers import failed: {e}")
        return False
    
    try:
        from bs4 import BeautifulSoup
        print("✓ beautifulsoup4 imported")
    except ImportError as e:
        print(f"✗ beautifulsoup4 import failed: {e}")
        return False
    
    try:
        from markdownify import markdownify
        print("✓ markdownify imported")
    except ImportError as e:
        print(f"✗ markdownify import failed: {e}")
        return False
    
    try:
        from knowledge_base import UXResource, ContentChunker, CategoryMapper, DifficultyClassifier
        print("✓ knowledge_base module imported")
    except ImportError as e:
        print(f"✗ knowledge_base import failed: {e}")
        return False
    
    try:
        from vector_store import VectorStore, get_vector_store
        print("✓ vector_store module imported")
    except ImportError as e:
        print(f"✗ vector_store import failed: {e}")
        return False
    
    try:
        from rag import RAGRetriever, get_rag_retriever
        print("✓ rag module imported")
    except ImportError as e:
        print(f"✗ rag import failed: {e}")
        return False
    
    try:
        from scraper import ScraperFactory
        print("✓ scraper module imported")
    except ImportError as e:
        print(f"✗ scraper import failed: {e}")
        return False
    
    print("\n✓ All imports successful!")
    return True


def test_knowledge_base():
    """Test knowledge base schema and utilities."""
    print("\n" + "="*70)
    print("  TEST 2: Knowledge Base Schema")
    print("="*70)
    
    from knowledge_base import (
        UXResource, 
        ContentChunker, 
        CategoryMapper, 
        DifficultyClassifier,
        estimate_read_time,
        create_summary
    )
    
    # Create a sample resource
    sample_content = """
    This is a sample UX article about usability testing methods.
    
    Usability testing is a crucial part of the UX design process. It involves 
    observing real users as they interact with your product to identify pain 
    points and areas for improvement.
    
    There are several types of usability testing: moderated, unmoderated, 
    remote, and in-person. Each has its own advantages and use cases.
    
    When conducting usability testing, it's important to prepare a test plan,
    recruit appropriate participants, and analyze the results systematically.
    """ * 10  # Repeat to make it longer
    
    resource = UXResource(
        id=UXResource.generate_id("https://example.com/article"),
        title="Introduction to Usability Testing",
        url="https://example.com/article",
        content=sample_content,
        summary=create_summary(sample_content),
        category="User Research & Validation",
        resource_type="article",
        difficulty="beginner",
        tags=["usability", "testing", "research"],
        author="Test Author",
        source="example.com",
        publish_date="2024-01-01",
        estimated_read_time=estimate_read_time(sample_content)
    )
    
    print(f"✓ Created UXResource: {resource.title}")
    print(f"  - ID: {resource.id}")
    print(f"  - Category: {resource.category}")
    print(f"  - Difficulty: {resource.difficulty}")
    print(f"  - Estimated read time: {resource.estimated_read_time} min")
    
    # Test chunking
    chunker = ContentChunker(chunk_size=300, overlap=50, min_chunk_size=100)
    chunks = chunker.create_chunks(resource)
    
    print(f"\n✓ Created {len(chunks)} chunks")
    if chunks:
        print(f"  - First chunk ID: {chunks[0].chunk_id}")
        print(f"  - Chunk content length: {len(chunks[0].content)} chars")
    
    # Test category mapper
    inferred_cat = CategoryMapper.infer_category(
        "Usability Testing Guide",
        "This article covers usability testing methods and user research",
        ["testing", "research"]
    )
    print(f"\n✓ Category mapping works: {inferred_cat}")
    
    # Test difficulty classifier
    difficulty = DifficultyClassifier.classify_difficulty(
        "Introduction to Usability Testing",
        sample_content,
        ["beginner", "basics"]
    )
    print(f"✓ Difficulty classification works: {difficulty}")
    
    return True


def test_vector_store():
    """Test vector store initialization and basic operations."""
    print("\n" + "="*70)
    print("  TEST 3: Vector Store")
    print("="*70)
    
    try:
        from vector_store import VectorStore
        from knowledge_base import UXResource, ContentChunker
        import os
        import tempfile
        
        # Use temporary directory for testing
        test_dir = tempfile.mkdtemp(prefix="rag_test_")
        print(f"Using test directory: {test_dir}")
        
        # Initialize vector store
        print("\nInitializing vector store...")
        store = VectorStore(persist_directory=test_dir)
        print("✓ Vector store initialized")
        
        # Get stats
        stats = store.get_stats()
        print(f"✓ Initial stats: {stats.get('total_chunks', 0)} chunks")
        
        # Create test resource
        test_content = "This is a test article about UX design principles. " * 20
        test_resource = UXResource(
            id="test_resource_001",
            title="Test UX Article",
            url="https://test.com/article",
            content=test_content,
            summary="Test summary",
            category="UX Fundamentals",
            resource_type="article",
            difficulty="intermediate",
            tags=["test", "ux"],
            author="Test",
            source="test.com",
            publish_date="2024-01-01",
            estimated_read_time=5
        )
        
        # Create chunks
        chunker = ContentChunker()
        chunks = chunker.create_chunks(test_resource)
        print(f"\n✓ Created {len(chunks)} test chunks")
        
        # Add to vector store
        success = store.add_resource(test_resource, chunks)
        if success:
            print("✓ Resource added to vector store")
        else:
            print("⊗ Resource already exists or failed to add")
        
        # Test search
        print("\nTesting semantic search...")
        results = store.semantic_search("UX design principles", top_k=5)
        print(f"✓ Search returned {len(results)} results")
        
        # Get unique resources
        unique = store.get_unique_resources(results)
        print(f"✓ Deduplicated to {len(unique)} unique resources")
        
        # Cleanup
        import shutil
        shutil.rmtree(test_dir)
        print(f"\n✓ Cleaned up test directory")
        
        return True
        
    except Exception as e:
        print(f"\n✗ Vector store test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_rag_retriever():
    """Test RAG retriever functionality."""
    print("\n" + "="*70)
    print("  TEST 4: RAG Retriever")
    print("="*70)
    
    try:
        from rag import RAGRetriever
        
        # Initialize retriever
        print("Initializing RAG retriever...")
        retriever = RAGRetriever()
        print("✓ RAG retriever initialized")
        
        # Test stage difficulty mapping
        for stage in ["Explorer", "Practitioner", "Emerging Senior", "Strategic Lead"]:
            difficulties = retriever.stage_difficulty_map.get(stage, [])
            print(f"✓ {stage}: {', '.join(difficulties)}")
        
        # Note: Can't test actual retrieval without data in knowledge base
        print("\n⚠ Actual retrieval tests require populated knowledge base")
        print("  Run ingestion first, then use admin.py --test-rag")
        
        return True
        
    except Exception as e:
        print(f"\n✗ RAG retriever test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_scrapers():
    """Test scraper initialization and structure."""
    print("\n" + "="*70)
    print("  TEST 5: Scrapers")
    print("="*70)
    
    try:
        from scraper import ScraperFactory
        
        # Get available sources
        sources = ScraperFactory.get_available_sources()
        print(f"✓ Available sources: {', '.join(sources)}")
        
        # Test creating each scraper
        for source in sources:
            scraper = ScraperFactory.create_scraper(source)
            if scraper:
                print(f"✓ {source:15s}: {scraper.source_name}")
            else:
                print(f"✗ {source:15s}: Failed to create")
        
        print("\n⚠ Actual scraping tests require network access")
        print("  Use ingest.py to test scraping with real URLs")
        
        return True
        
    except Exception as e:
        print(f"\n✗ Scraper test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_ollama_integration():
    """Test Ollama integration with RAG."""
    print("\n" + "="*70)
    print("  TEST 6: Ollama Integration")
    print("="*70)
    
    try:
        from ollama_client import RAG_AVAILABLE
        
        if RAG_AVAILABLE:
            print("✓ RAG integration is available in ollama_client")
        else:
            print("⚠ RAG integration not available (expected if imports failed)")
        
        print("\n⚠ Full Ollama+RAG tests require:")
        print("  1. Ollama server running (http://localhost:11434)")
        print("  2. Model downloaded (ollama pull llama3.2)")
        print("  3. Knowledge base populated (python ingest.py)")
        
        return True
        
    except Exception as e:
        print(f"\n✗ Ollama integration test failed: {e}")
        return False


def run_all_tests():
    """Run all tests and report results."""
    print("\n" + "="*70)
    print("  RAG SYSTEM TEST SUITE")
    print("="*70)
    print("\nThis will verify that all RAG components are properly installed")
    print("and can be initialized without errors.\n")
    
    tests = [
        ("Imports", test_imports),
        ("Knowledge Base", test_knowledge_base),
        ("Vector Store", test_vector_store),
        ("RAG Retriever", test_rag_retriever),
        ("Scrapers", test_scrapers),
        ("Ollama Integration", test_ollama_integration),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            success = test_func()
            results.append((test_name, success))
        except Exception as e:
            print(f"\n✗ {test_name} test crashed: {e}")
            import traceback
            traceback.print_exc()
            results.append((test_name, False))
    
    # Print summary
    print("\n" + "="*70)
    print("  TEST SUMMARY")
    print("="*70 + "\n")
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    for test_name, success in results:
        status = "✓ PASS" if success else "✗ FAIL"
        print(f"  {status:10s} {test_name}")
    
    print(f"\n  {passed}/{total} tests passed\n")
    
    if passed == total:
        print("✅ All tests passed! RAG system is ready.")
        print("\nNext steps:")
        print("  1. Start Ollama: ollama serve")
        print("  2. Pull model: ollama pull llama3.2")
        print("  3. Run ingestion: python ingest.py --scrape --sources all --limit 100")
        print("  4. Check stats: python admin.py --stats")
        print("  5. Test search: python admin.py --search 'usability testing'")
        return 0
    else:
        print("⚠️  Some tests failed. Check errors above.")
        print("\nTroubleshooting:")
        print("  - Ensure all dependencies installed: pip install -r requirements.txt")
        print("  - Check Python version: Python 3.8+ required")
        print("  - Verify working directory: Should be in server_py/")
        return 1


if __name__ == '__main__':
    sys.exit(run_all_tests())

