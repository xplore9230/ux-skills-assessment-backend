"""
RAG (Retrieval-Augmented Generation) System

This module provides the core RAG functionality:
- Retrieve relevant resources based on user's weak areas
- Generate learning paths
- Enrich AI prompts with retrieved context
"""

from typing import List, Dict, Any, Optional
from vector_store import get_vector_store
from knowledge_base import UXResource


class RAGRetriever:
    """
    Core RAG retrieval system for personalized resource recommendations.
    """
    
    def __init__(self):
        self.vector_store = get_vector_store()
        
        # Stage to difficulty mapping
        self.stage_difficulty_map = {
            "Explorer": ["beginner"],
            "Practitioner": ["beginner", "intermediate"],
            "Emerging Senior": ["intermediate", "advanced"],
            "Strategic Lead": ["advanced"]
        }
    
    def retrieve_resources_for_user(
        self,
        stage: str,
        categories: List[Dict[str, Any]],
        top_k: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Retrieve relevant resources based on user's stage and weak categories.
        
        Args:
            stage: User's career stage
            categories: List of category scores
            top_k: Number of resources to retrieve
        
        Returns:
            List of relevant resources with metadata
        """
        # Sort categories by score to identify weakest areas
        sorted_categories = sorted(
            categories,
            key=lambda c: (c['score'] / c['maxScore']) if c['maxScore'] > 0 else 0
        )
        
        # Focus on 2-3 weakest categories
        weak_categories = sorted_categories[:3]
        
        # Build search query from weak areas
        query_parts = []
        for cat in weak_categories:
            cat_name = cat['name']
            query_parts.append(f"{cat_name}")
        
        query = " ".join(query_parts)
        
        # Determine appropriate difficulty levels
        difficulties = self.stage_difficulty_map.get(stage, ["intermediate"])
        
        # Retrieve resources from each weak category
        all_results = []
        
        for cat in weak_categories:
            cat_name = cat['name']
            
            # Search for resources in this category
            for difficulty in difficulties:
                results = self.vector_store.semantic_search(
                    query=f"{cat_name} skills improvement",
                    category=cat_name,
                    difficulty=difficulty,
                    top_k=5
                )
                all_results.extend(results)
        
        # Also do a general semantic search
        general_results = self.vector_store.semantic_search(
            query=query,
            top_k=top_k
        )
        all_results.extend(general_results)
        
        # Deduplicate and format
        unique_resources = self.vector_store.get_unique_resources(all_results)
        
        # Sort by relevance score
        unique_resources.sort(key=lambda x: x.get('relevance_score', 0), reverse=True)
        
        return unique_resources[:top_k]
    
    def generate_learning_path(
        self,
        weak_categories: List[Dict[str, Any]],
        stage: str
    ) -> Dict[str, Any]:
        """
        Generate a structured learning path for weak areas.
        Sequences resources from beginner to advanced.
        
        Args:
            weak_categories: List of weakest category scores
            stage: User's career stage
        
        Returns:
            Dictionary with learning paths per category
        """
        learning_paths = []
        
        for category_data in weak_categories[:2]:  # Focus on top 2 weakest
            category_name = category_data['name']
            
            # Retrieve resources at different difficulty levels
            beginner_resources = self.vector_store.semantic_search(
                query=f"{category_name} basics fundamentals introduction",
                category=category_name,
                difficulty="beginner",
                top_k=3
            )
            
            intermediate_resources = self.vector_store.semantic_search(
                query=f"{category_name} intermediate techniques practices",
                category=category_name,
                difficulty="intermediate",
                top_k=3
            )
            
            advanced_resources = self.vector_store.semantic_search(
                query=f"{category_name} advanced expert mastery",
                category=category_name,
                difficulty="advanced",
                top_k=2
            )
            
            # Combine and deduplicate
            all_category_resources = (
                beginner_resources +
                intermediate_resources +
                advanced_resources
            )
            
            unique_resources = self.vector_store.get_unique_resources(all_category_resources)
            
            # Sequence by difficulty
            sequenced = self._sequence_by_difficulty(unique_resources)
            
            learning_paths.append({
                'weak_area': category_name,
                'current_score': category_data.get('score', 0),
                'max_score': category_data.get('maxScore', 100),
                'resources': sequenced,
                'total_resources': len(sequenced)
            })
        
        return {
            'stage': stage,
            'learning_paths': learning_paths
        }
    
    def _sequence_by_difficulty(self, resources: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Sequence resources by difficulty level: beginner → intermediate → advanced.
        """
        difficulty_order = {'beginner': 1, 'intermediate': 2, 'advanced': 3}
        
        return sorted(
            resources,
            key=lambda x: difficulty_order.get(x.get('difficulty', 'intermediate'), 2)
        )
    
    def enrich_prompt_with_context(
        self,
        base_prompt: str,
        retrieved_docs: List[Dict[str, Any]],
        max_context_length: int = 2000
    ) -> str:
        """
        Enrich an AI prompt with retrieved context from the knowledge base.
        
        Args:
            base_prompt: Original prompt
            retrieved_docs: Retrieved resources/chunks
            max_context_length: Maximum characters for context
        
        Returns:
            Enhanced prompt with context
        """
        if not retrieved_docs:
            return base_prompt
        
        # Build context section
        context_parts = []
        context_parts.append("\n\nRELEVANT UX RESOURCES AND CONTEXT:\n")
        
        current_length = 0
        
        for idx, doc in enumerate(retrieved_docs[:10], 1):  # Limit to top 10
            metadata = doc.get('metadata', {})
            title = metadata.get('title', 'Unknown')
            url = metadata.get('url', '')
            source = metadata.get('source', '')
            content_preview = doc.get('content_preview', '')
            
            # Format resource reference
            resource_text = f"\n{idx}. **{title}** (Source: {source})\n"
            resource_text += f"   URL: {url}\n"
            resource_text += f"   Summary: {content_preview[:200]}...\n"
            
            # Check if adding this would exceed limit
            if current_length + len(resource_text) > max_context_length:
                break
            
            context_parts.append(resource_text)
            current_length += len(resource_text)
        
        context = ''.join(context_parts)
        
        # Add instruction to reference these resources
        instruction = "\n\nIMPORTANT: When providing recommendations, reference specific resources from the context above. Mention titles and explain why they're relevant.\n"
        
        # Combine base prompt with context
        enriched_prompt = base_prompt + context + instruction
        
        return enriched_prompt
    
    def get_resources_for_category(
        self,
        category: str,
        difficulty: Optional[str] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get resources filtered by category and optional difficulty.
        
        Args:
            category: Category name
            difficulty: Optional difficulty filter
            limit: Maximum number of resources
        
        Returns:
            List of resources
        """
        results = self.vector_store.get_by_category(
            category=category,
            difficulty=difficulty,
            limit=limit * 2  # Get extra for deduplication
        )
        
        # Deduplicate to unique resources
        unique_resources = self.vector_store.get_unique_resources(results)
        
        return unique_resources[:limit]
    
    def semantic_search_resources(
        self,
        query: str,
        category: Optional[str] = None,
        difficulty: Optional[str] = None,
        top_k: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Perform semantic search on the knowledge base.
        
        Args:
            query: Search query
            category: Optional category filter
            difficulty: Optional difficulty filter
            top_k: Number of results
        
        Returns:
            List of matching resources
        """
        results = self.vector_store.semantic_search(
            query=query,
            category=category,
            difficulty=difficulty,
            top_k=top_k * 2  # Get extra for deduplication
        )
        
        # Deduplicate to unique resources
        unique_resources = self.vector_store.get_unique_resources(results)
        
        return unique_resources[:top_k]
    
    def get_diverse_resources(
        self,
        categories: List[Dict[str, Any]],
        stage: str,
        include_types: List[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get a diverse set of resources across multiple types and categories.
        
        Args:
            categories: User's category scores
            stage: User's career stage
            include_types: Optional list of resource types to include
        
        Returns:
            Diverse list of resources
        """
        if include_types is None:
            include_types = ['article', 'guide', 'book', 'course', 'tool']
        
        all_resources = []
        
        # Get resources from each category
        for category_data in categories:
            cat_name = category_data['name']
            
            # Get resources for this category
            cat_resources = self.get_resources_for_category(
                category=cat_name,
                limit=3
            )
            all_resources.extend(cat_resources)
        
        # Filter by resource type if specified
        if include_types:
            all_resources = [
                r for r in all_resources
                if r.get('resource_type', '') in include_types
            ]
        
        # Ensure diversity by resource type
        diverse_resources = self._ensure_diversity(all_resources)
        
        return diverse_resources
    
    def _ensure_diversity(
        self,
        resources: List[Dict[str, Any]],
        max_per_type: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Ensure diversity in resource types.
        """
        type_counts = {}
        diverse_resources = []
        
        for resource in resources:
            resource_type = resource.get('resource_type', 'article')
            count = type_counts.get(resource_type, 0)
            
            if count < max_per_type:
                diverse_resources.append(resource)
                type_counts[resource_type] = count + 1
        
        return diverse_resources


# Singleton instance
_rag_retriever_instance = None


def get_rag_retriever() -> RAGRetriever:
    """
    Get or create the singleton RAGRetriever instance.
    """
    global _rag_retriever_instance
    if _rag_retriever_instance is None:
        _rag_retriever_instance = RAGRetriever()
    return _rag_retriever_instance

