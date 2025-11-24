// Shared type definitions for the UX Skills Assessment Quiz

export interface Question {
  id: string;
  text: string;
  category: string;
  options: { value: number; label: string }[];
}

export interface LearningQuestion extends Question {
  correctAnswerIndex: number; // Index of correct option (0-4)
  explanation: string; // Detailed explanation of the answer
  relatedTopics?: string[]; // Topics this question covers
  relatedSection?: string; // Section in ebook/blog (for linking)
}

export interface CategoryScore {
  name: string;
  score: number;
  maxScore: number;
  status: "strong" | "decent" | "needs-work";
}

export interface ImprovementWeek {
  week: number;
  tasks: string[];
}

export interface Resource {
  title: string;
  url: string;
  description: string;
}

export interface DeepDiveResource {
  title: string;
  type: "article" | "video" | "guide";
  estimated_read_time: string;
  source: string;
  url: string;
  tags: string[];
}

export interface DeepDiveTopic {
  name: string;
  pillar: string;
  level: string;
  summary: string;
  practice_points?: string[];
  resources?: DeepDiveResource[];
}

export interface JobLinks {
  job_title: string;
  linkedin_url: string;
  google_url: string;
}

export interface LayoutStrategy {
  section_order: string[];
  section_visibility: Record<string, boolean>;
  content_depth: Record<string, 'minimal' | 'standard' | 'detailed'>;
  priority_message: string;
}

export interface CategoryInsight {
  category: string;
  brief: string;
  detailed: string;
  actionable: string[];
}

// RAG System Types
export interface RAGResource {
  resource_id: string;
  title: string;
  url: string;
  summary?: string;
  content_preview?: string;
  category: string;
  resource_type: string;
  difficulty: string;
  tags: string[];
  source: string;
  estimated_read_time: number;
  relevance_score: number;
}

export interface LearningPath {
  weak_area: string;
  current_score: number;
  max_score: number;
  resources: RAGResource[];
  total_resources: number;
}

export interface RAGSearchResult {
  query: string;
  results: RAGResource[];
  total: number;
}

export interface RAGStats {
  status: string;
  total_resources: number;
  total_chunks: number;
  categories: Record<string, number>;
  difficulties: Record<string, number>;
  sources: Record<string, number>;
}

export interface ResultsData {
  stage: string;
  totalScore: number;
  maxScore: number;
  summary: string;
  categories: CategoryScore[];
  improvementPlan: ImprovementWeek[];
}

export type AppState = "landing" | "quiz" | "loading-results" | "results";

