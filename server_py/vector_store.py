"""
Vector Store Management with ChromaDB

This module handles embedding generation, storage, and retrieval
using ChromaDB for the RAG system.
"""

import os
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions
from sentence_transformers import SentenceTransformer

from knowledge_base import UXResource, ContentChunk


# ChromaDB configuration
CHROMA_DIR = os.path.join(os.path.dirname(__file__), ".chroma")
COLLECTION_NAME = "ux_resources"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"  # Fast, efficient model


class VectorStore:
    """
    Manages the ChromaDB vector store for UX resources.
    Handles embedding generation, storage, and semantic search.
    """
    
    def __init__(self, persist_directory: str = CHROMA_DIR):
        """
        Initialize ChromaDB client and embedding model.
        """
        self.persist_directory = persist_directory
        
        # Ensure directory exists
        os.makedirs(persist_directory, exist_ok=True)
        
        # Initialize ChromaDB client with persistent storage
        self.client = chromadb.PersistentClient(
            path=persist_directory,
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=True
            )
        )
        
        # Initialize embedding function
        self.embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name=EMBEDDING_MODEL
        )
        
        # Get or create collection
        self.collection = self._get_or_create_collection()
        
        print(f"✓ Vector store initialized at {persist_directory}")
        print(f"✓ Using embedding model: {EMBEDDING_MODEL}")
        print(f"✓ Collection '{COLLECTION_NAME}' ready")
    
    def _get_or_create_collection(self):
        """
        Get existing collection or create new one.
        """
        try:
            collection = self.client.get_collection(
                name=COLLECTION_NAME,
                embedding_function=self.embedding_function
            )
            print(f"  → Loaded existing collection with {collection.count()} items")
        except Exception:
            collection = self.client.create_collection(
                name=COLLECTION_NAME,
                embedding_function=self.embedding_function,
                metadata={"description": "UX learning resources and content chunks"}
            )
            print(f"  → Created new collection '{COLLECTION_NAME}'")
        
        return collection
    
    def add_resource(self, resource: UXResource, chunks: List[ContentChunk]) -> bool:
        """
        Add a resource and its chunks to the vector store.
        Returns True if successful, False otherwise.
        """
        try:
            # Check if resource already exists
            if self.resource_exists(resource.id):
                print(f"  ⊗ Resource already exists: {resource.title}")
                return False
            
            # Prepare data for ChromaDB
            ids = []
            documents = []
            metadatas = []
            
            # Add each chunk
            for chunk in chunks:
                ids.append(chunk.chunk_id)
                documents.append(chunk.content)
                
                # Metadata for filtering and retrieval
                metadata = {
                    "resource_id": resource.id,
                    "title": resource.title,
                    "url": resource.url,
                    "category": resource.category,
                    "difficulty": resource.difficulty,
                    "resource_type": resource.resource_type,
                    "source": resource.source,
                    "chunk_index": chunk.chunk_index,
                    "total_chunks": chunk.total_chunks,
                    "tags": ",".join(resource.tags),  # Store as comma-separated
                    "estimated_read_time": resource.estimated_read_time
                }
                metadatas.append(metadata)
            
            # Add to collection
            self.collection.add(
                ids=ids,
                documents=documents,
                metadatas=metadatas
            )
            
            print(f"  ✓ Added: {resource.title} ({len(chunks)} chunks)")
            return True
            
        except Exception as e:
            print(f"  ✗ Error adding resource: {str(e)}")
            return False
    
    def resource_exists(self, resource_id: str) -> bool:
        """
        Check if a resource already exists in the store.
        """
        try:
            results = self.collection.get(
                where={"resource_id": resource_id},
                limit=1
            )
            return len(results['ids']) > 0
        except Exception:
            return False
    
    def semantic_search(
        self,
        query: str,
        category: Optional[str] = None,
        difficulty: Optional[str] = None,
        resource_type: Optional[str] = None,
        top_k: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Perform semantic search on the vector store.
        
        Args:
            query: Search query text
            category: Filter by category (optional)
            difficulty: Filter by difficulty level (optional)
            resource_type: Filter by resource type (optional)
            top_k: Number of results to return
        
        Returns:
            List of dictionaries containing matched chunks and metadata
        """
        try:
            # Build filter conditions
            where = {}
            if category:
                where["category"] = category
            if difficulty:
                where["difficulty"] = difficulty
            if resource_type:
                where["resource_type"] = resource_type
            
            # Perform search
            results = self.collection.query(
                query_texts=[query],
                n_results=top_k,
                where=where if where else None
            )
            
            # Format results
            formatted_results = []
            if results['ids'] and len(results['ids'][0]) > 0:
                for i in range(len(results['ids'][0])):
                    formatted_results.append({
                        'chunk_id': results['ids'][0][i],
                        'content': results['documents'][0][i],
                        'metadata': results['metadatas'][0][i],
                        'distance': results['distances'][0][i] if 'distances' in results else 0
                    })
            
            return formatted_results
            
        except Exception as e:
            print(f"Search error: {str(e)}")
            return []
    
    def get_by_category(
        self,
        category: str,
        difficulty: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Get resources filtered by category and optionally difficulty.
        """
        try:
            where = {"category": category}
            if difficulty:
                where["difficulty"] = difficulty
            
            results = self.collection.get(
                where=where,
                limit=limit
            )
            
            # Format results
            formatted_results = []
            if results['ids']:
                for i in range(len(results['ids'])):
                    formatted_results.append({
                        'chunk_id': results['ids'][i],
                        'content': results['documents'][i],
                        'metadata': results['metadatas'][i]
                    })
            
            return formatted_results
            
        except Exception as e:
            print(f"Filter error: {str(e)}")
            return []
    
    def get_unique_resources(self, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Deduplicate chunks to get unique resources.
        Groups chunks by resource_id and returns one entry per resource.
        """
        seen_resources = {}
        
        for chunk in chunks:
            metadata = chunk.get('metadata', {})
            resource_id = metadata.get('resource_id')
            
            if resource_id and resource_id not in seen_resources:
                # Store the first chunk of each resource
                seen_resources[resource_id] = {
                    'resource_id': resource_id,
                    'title': metadata.get('title', ''),
                    'url': metadata.get('url', ''),
                    'category': metadata.get('category', ''),
                    'difficulty': metadata.get('difficulty', ''),
                    'resource_type': metadata.get('resource_type', ''),
                    'source': metadata.get('source', ''),
                    'tags': metadata.get('tags', '').split(',') if metadata.get('tags') else [],
                    'estimated_read_time': metadata.get('estimated_read_time', 0),
                    'content_preview': chunk.get('content', '')[:300],
                    'relevance_score': 1 - chunk.get('distance', 0)  # Convert distance to similarity
                }
        
        return list(seen_resources.values())
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get statistics about the vector store.
        """
        try:
            total_chunks = self.collection.count()
            
            # Get all metadata to calculate stats
            all_data = self.collection.get()
            
            # Count unique resources
            unique_resources = set()
            categories = {}
            difficulties = {}
            sources = {}
            
            if all_data['metadatas']:
                for metadata in all_data['metadatas']:
                    resource_id = metadata.get('resource_id')
                    if resource_id:
                        unique_resources.add(resource_id)
                    
                    # Count by category
                    category = metadata.get('category', 'Unknown')
                    categories[category] = categories.get(category, 0) + 1
                    
                    # Count by difficulty
                    difficulty = metadata.get('difficulty', 'Unknown')
                    difficulties[difficulty] = difficulties.get(difficulty, 0) + 1
                    
                    # Count by source
                    source = metadata.get('source', 'Unknown')
                    sources[source] = sources.get(source, 0) + 1
            
            return {
                'total_chunks': total_chunks,
                'unique_resources': len(unique_resources),
                'categories': categories,
                'difficulties': difficulties,
                'sources': sources
            }
            
        except Exception as e:
            print(f"Stats error: {str(e)}")
            return {}
    
    def delete_resource(self, resource_id: str) -> bool:
        """
        Delete all chunks for a specific resource.
        """
        try:
            # Get all chunks for this resource
            results = self.collection.get(
                where={"resource_id": resource_id}
            )
            
            if results['ids']:
                self.collection.delete(ids=results['ids'])
                print(f"  ✓ Deleted resource: {resource_id} ({len(results['ids'])} chunks)")
                return True
            else:
                print(f"  ⊗ Resource not found: {resource_id}")
                return False
                
        except Exception as e:
            print(f"Delete error: {str(e)}")
            return False
    
    def clear_all(self) -> bool:
        """
        Clear all data from the collection.
        USE WITH CAUTION!
        """
        try:
            self.client.delete_collection(name=COLLECTION_NAME)
            self.collection = self._get_or_create_collection()
            print("  ✓ Collection cleared")
            return True
        except Exception as e:
            print(f"Clear error: {str(e)}")
            return False
    
    def rebuild_index(self) -> bool:
        """
        Rebuild the entire index (useful after updates).
        """
        try:
            # ChromaDB handles indexing automatically
            # This is a placeholder for potential future optimization
            print("  ✓ Index rebuild complete")
            return True
        except Exception as e:
            print(f"Rebuild error: {str(e)}")
            return False


# Singleton instance
_vector_store_instance = None


def get_vector_store() -> VectorStore:
    """
    Get or create the singleton VectorStore instance.
    """
    global _vector_store_instance
    if _vector_store_instance is None:
        _vector_store_instance = VectorStore()
    return _vector_store_instance


def init_vector_store(reset: bool = False) -> VectorStore:
    """
    Initialize the vector store.
    
    Args:
        reset: If True, clear existing data
    
    Returns:
        VectorStore instance
    """
    store = get_vector_store()
    
    if reset:
        print("⚠ Resetting vector store...")
        store.clear_all()
    
    return store

