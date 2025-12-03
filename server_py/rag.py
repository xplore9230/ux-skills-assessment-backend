"""
RAG (Retrieval-Augmented Generation) System

This module handles the retrieval of relevant content from the vector store
to augment LLM prompts with specific knowledge.
"""

# CRITICAL: Import numpy_compat FIRST before any chromadb imports
import numpy_compat  # noqa: F401

from typing import List, Dict, Any, Optional
import json
from vector_store import get_vector_store

class RAGRetriever:
    """
    Handles retrieval of relevant content for RAG.
    """
    
    def __init__(self):
        self.vector_store = get_vector_store()
        
    def semantic_search_resources(
        self, 
        query: str, 
        category: Optional[str] = None,
        difficulty: Optional[str] = None,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Search for resources using semantic similarity.
        """
        results = self.vector_store.semantic_search(
            query=query,
            category=category,
            difficulty=difficulty,
            top_k=top_k
        )
        
        # Deduplicate by resource ID to return unique resources
        unique_resources = self.vector_store.get_unique_resources(results)
        return unique_resources[:top_k]
    
    def retrieve_resources_for_user(
        self, 
        stage: str, 
        categories: List[Dict[str, Any]], 
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Retrieve resources tailored to the user's stage and weakest categories.
        """
        # Identify weakest categories
        sorted_cats = sorted(
            categories, 
            key=lambda c: (c.get('score', 0) / c.get('maxScore', 100)) if c.get('maxScore', 0) > 0 else 0
        )
        weakest_cats = [c.get('name') for c in sorted_cats[:2]]
        
        all_resources = []
        
        # 1. Search for resources in weakest categories appropriate for stage
        for cat in weakest_cats:
            # Query strategy: Category + Stage + "learning"
            query = f"{cat} for {stage} level learning"
            
            cat_results = self.semantic_search_resources(
                query=query,
                category=cat,
                top_k=3
            )
            all_resources.extend(cat_results)
            
        # 2. Search for stage-specific growth resources
        stage_query = f"Career growth for {stage} UX designer"
        stage_results = self.semantic_search_resources(
            query=stage_query,
            top_k=3
        )
        all_resources.extend(stage_results)
        
        # Deduplicate and sort by relevance
        seen_ids = set()
        unique_results = []
        
        for res in all_resources:
            if res['resource_id'] not in seen_ids:
                seen_ids.add(res['resource_id'])
                unique_results.append(res)
        
        # Sort by relevance score if available
        unique_results.sort(key=lambda x: x.get('relevance_score', 0), reverse=True)
        
        return unique_results[:top_k]

    def generate_learning_path(
        self,
        weak_categories: List[Dict[str, Any]],
        stage: str
    ) -> Dict[str, Any]:
        """
        Generate a sequenced learning path based on resources.
        """
        path = {
            "stage": stage,
            "modules": []
        }
        
        for cat in weak_categories:
            cat_name = cat.get('name', 'General')
            
            # Get beginner resources for immediate gaps
            beginner_resources = self.semantic_search_resources(
                query=f"Fundamentals of {cat_name}",
                category=cat_name,
                difficulty="Beginner",
                top_k=2
            )
            
            # Get advanced resources for growth
            advanced_resources = self.semantic_search_resources(
                query=f"Advanced {cat_name} strategies",
                category=cat_name,
                difficulty="Advanced",
                top_k=2
            )
            
            module = {
                "category": cat_name,
                "goal": f"Master {cat_name} concepts",
                "steps": [
                    {
                        "level": "Foundation",
                        "resources": beginner_resources
                    },
                    {
                        "level": "Advanced Application",
                        "resources": advanced_resources
                    }
                ]
            }
            path["modules"].append(module)
            
        return path
    
    def get_resources_for_category(
        self,
        category: str,
        difficulty: Optional[str] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get resources for a specific category.
        """
        # Use vector store filter
        chunks = self.vector_store.get_by_category(
            category=category,
            difficulty=difficulty,
            limit=limit * 3  # Fetch more chunks to ensure enough unique resources
        )
        
        # Format and deduplicate
        unique = self.vector_store.get_unique_resources(chunks)
        return unique[:limit]

    def retrieve_learning_paths(self, categories: List[str]) -> Dict[str, List[Dict[str, Any]]]:
        """
        Retrieve learning path resources for specified categories.
        """
        paths = {}
        for cat in categories:
            # Search for "learning path" style content
            query = f"How to learn {cat} step by step guide"
            resources = self.semantic_search_resources(
                query=query, 
                category=cat, 
                top_k=3
            )
            paths[cat] = resources
        return paths

    def retrieve_stage_competencies(self, stage: str) -> List[Dict[str, Any]]:
        """
        Retrieve competency definitions for a specific stage.
        """
        query = f"What is expected of a {stage} UX designer skills responsibilities"
        return self.semantic_search_resources(query=query, top_k=5)

    def retrieve_skill_relationships(
        self, 
        weak_cats: List[str], 
        strong_cats: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Retrieve content bridging weak and strong skills.
        """
        relationships = []
        for weak in weak_cats:
            for strong in strong_cats:
                query = f"How does {strong} relate to {weak} in UX design"
                results = self.semantic_search_resources(query=query, top_k=1)
                if results:
                    relationships.extend(results)
                    
        # Deduplicate
        return self.vector_store.get_unique_resources(relationships)[:5]
    
    def retrieve_social_media_resources(
        self,
        stage: str,
        categories: List[Dict[str, Any]],
        resource_types: List[str] = None,
        limit: int = 8
    ) -> List[Dict[str, Any]]:
        """
        Retrieve social media content (YouTube videos, podcasts, tweets) 
        relevant to the user's stage and categories.
        
        Args:
            stage: User's career stage
            categories: List of category scores
            resource_types: List of resource types to filter (video, podcast, tweet)
            limit: Maximum number of resources to return
            
        Returns:
            List of social media resources
        """
        if resource_types is None:
            resource_types = ["video", "podcast", "tweet"]
        
        all_resources = []
        
        # Identify weakest categories for personalized content
        sorted_cats = sorted(
            categories,
            key=lambda c: (c.get('score', 0) / c.get('maxScore', 100)) if c.get('maxScore', 0) > 0 else 0
        )
        weakest_cats = [c.get('name') for c in sorted_cats[:2]]
        
        # Search for social media content in each resource type
        for resource_type in resource_types:
            # Build query based on stage and categories
            if weakest_cats:
                query = f"{weakest_cats[0]} for {stage} level UX designer"
            else:
                query = f"UX design insights for {stage} level"
            
            # Search with resource type filter
            results = self.vector_store.semantic_search(
                query=query,
                resource_type=resource_type,
                top_k=limit // len(resource_types) + 2  # Get a few extra per type
            )
            
            # Deduplicate and add to results
            unique_results = self.vector_store.get_unique_resources(results)
            all_resources.extend(unique_results)
        
        # Sort by engagement score or view count if available
        all_resources.sort(
            key=lambda x: (
                x.get('metadata', {}).get('engagement_score', 0) or 
                x.get('metadata', {}).get('view_count', 0)
            ),
            reverse=True
        )
        
        # Return top results
        return all_resources[:limit]

# Singleton instance
_rag_instance = None

def get_rag_retriever() -> RAGRetriever:
    """
    Get or create the singleton RAGRetriever instance.
    """
    global _rag_instance
    if _rag_instance is None:
        _rag_instance = RAGRetriever()
    return _rag_instance
