/**
 * React Hook for RAG System Integration
 * 
 * Provides access to RAG-powered features:
 * - Semantic search
 * - Learning paths
 * - Knowledge base stats
 */

import { useState, useEffect } from 'react';
import type { 
  RAGResource, 
  LearningPath, 
  RAGSearchResult, 
  RAGStats,
  CategoryScore 
} from '@/types';

const API_BASE = import.meta.env.VITE_PYTHON_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Hook for semantic search in the RAG knowledge base
 */
export function useRAGSearch(initialQuery?: string) {
  const [query, setQuery] = useState(initialQuery || '');
  const [results, setResults] = useState<RAGResource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (
    searchQuery: string,
    category?: string,
    difficulty?: string,
    topK: number = 10
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/rag/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          category,
          difficulty,
          top_k: topK,
        }),
      });

      if (!response.ok) {
        throw new Error('RAG search failed');
      }

      const data: RAGSearchResult = await response.json();
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    search,
  };
}

/**
 * Hook for generating personalized learning paths
 */
export function useLearningPath(
  stage: string,
  categories: CategoryScore[]
) {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stage || !categories || categories.length === 0) return;

    const generatePath = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/api/rag/learning-path`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stage,
            categories: categories.map(cat => ({
              name: cat.name,
              score: cat.score,
              maxScore: cat.maxScore,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate learning path');
        }

        const data = await response.json();
        setLearningPaths(data.learning_paths || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate path');
        setLearningPaths([]);
      } finally {
        setIsLoading(false);
      }
    };

    generatePath();
  }, [stage, categories]);

  return {
    learningPaths,
    isLoading,
    error,
  };
}

/**
 * Hook for fetching RAG knowledge base statistics
 */
export function useRAGStats() {
  const [stats, setStats] = useState<RAGStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/api/rag/stats`);

        if (!response.ok) {
          throw new Error('Failed to fetch RAG stats');
        }

        const data: RAGStats = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return {
    stats,
    isLoading,
    error,
  };
}

/**
 * Hook for fetching resources by category
 */
export function useRAGResourcesByCategory(
  category: string,
  difficulty?: string,
  limit: number = 10
) {
  const [resources, setResources] = useState<RAGResource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!category) return;

    const fetchResources = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (difficulty) params.append('difficulty', difficulty);
        params.append('limit', limit.toString());

        const response = await fetch(
          `${API_BASE}/api/rag/resources/${encodeURIComponent(category)}?${params}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch resources');
        }

        const data = await response.json();
        setResources(data.resources || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch resources');
        setResources([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, [category, difficulty, limit]);

  return {
    resources,
    isLoading,
    error,
  };
}

