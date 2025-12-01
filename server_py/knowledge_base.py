"""
Knowledge Base Schema and Chunking Strategy for RAG System

This module defines the data structure for UX resources and provides
intelligent chunking functionality for long-form content.
"""

from dataclasses import dataclass, field, asdict
from typing import List, Optional, Dict, Any
from datetime import datetime
import hashlib
import re


@dataclass
class UXResource:
    """
    Core data structure for UX learning resources.
    Maps to the 5 quiz categories for personalized recommendations.
    """
    id: str
    title: str
    url: str
    content: str  # Full text content
    summary: str  # First 200 words or explicit summary
    category: str  # Maps to quiz categories
    resource_type: str  # article, book, course, tool, case_study, guide
    difficulty: str  # beginner, intermediate, advanced
    tags: List[str] = field(default_factory=list)
    author: str = ""
    source: str = ""  # Domain name (e.g., nngroup.com)
    publish_date: str = ""
    estimated_read_time: int = 0  # Minutes
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for storage"""
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'UXResource':
        """Create from dictionary"""
        return cls(**data)
    
    @staticmethod
    def generate_id(url: str) -> str:
        """Generate unique ID from URL"""
        return hashlib.md5(url.encode()).hexdigest()


@dataclass
class ContentChunk:
    """
    A semantic chunk of content with context preservation.
    Used for embedding and retrieval.
    """
    chunk_id: str
    resource_id: str
    content: str
    chunk_index: int
    total_chunks: int
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for storage"""
        return asdict(self)


class ContentChunker:
    """
    Intelligent content chunking with context preservation.
    Splits long articles while maintaining semantic coherence.
    """
    
    def __init__(
        self,
        chunk_size: int = 500,  # Target words per chunk
        overlap: int = 50,  # Overlapping words for context
        min_chunk_size: int = 100  # Minimum chunk size
    ):
        self.chunk_size = chunk_size
        self.overlap = overlap
        self.min_chunk_size = min_chunk_size
    
    def chunk_by_paragraphs(self, text: str) -> List[str]:
        """
        Split text into chunks by paragraphs, respecting semantic boundaries.
        """
        # Split by double newlines (paragraphs)
        paragraphs = re.split(r'\n\s*\n', text)
        paragraphs = [p.strip() for p in paragraphs if p.strip()]
        
        chunks = []
        current_chunk = []
        current_word_count = 0
        
        for para in paragraphs:
            para_words = len(para.split())
            
            # If adding this paragraph exceeds chunk size and we have content
            if current_word_count + para_words > self.chunk_size and current_chunk:
                # Save current chunk
                chunks.append('\n\n'.join(current_chunk))
                
                # Start new chunk with overlap from previous
                if self.overlap > 0 and current_chunk:
                    # Keep last paragraph for context
                    overlap_text = current_chunk[-1]
                    overlap_words = len(overlap_text.split())
                    
                    if overlap_words <= self.overlap:
                        current_chunk = [overlap_text]
                        current_word_count = overlap_words
                    else:
                        current_chunk = []
                        current_word_count = 0
                else:
                    current_chunk = []
                    current_word_count = 0
            
            # Add paragraph to current chunk
            current_chunk.append(para)
            current_word_count += para_words
        
        # Add final chunk
        if current_chunk:
            chunks.append('\n\n'.join(current_chunk))
        
        return chunks
    
    def chunk_by_sentences(self, text: str, max_words: int) -> List[str]:
        """
        Split text into chunks by sentences when paragraph method isn't suitable.
        """
        # Simple sentence splitting
        sentences = re.split(r'(?<=[.!?])\s+', text)
        
        chunks = []
        current_chunk = []
        current_word_count = 0
        
        for sentence in sentences:
            sentence_words = len(sentence.split())
            
            if current_word_count + sentence_words > max_words and current_chunk:
                chunks.append(' '.join(current_chunk))
                current_chunk = []
                current_word_count = 0
            
            current_chunk.append(sentence)
            current_word_count += sentence_words
        
        if current_chunk:
            chunks.append(' '.join(current_chunk))
        
        return chunks
    
    def create_chunks(self, resource: UXResource) -> List[ContentChunk]:
        """
        Create chunks from a UXResource with metadata preservation.
        """
        content = resource.content
        
        # If content is short enough, return single chunk
        word_count = len(content.split())
        if word_count <= self.chunk_size:
            return [ContentChunk(
                chunk_id=f"{resource.id}_chunk_0",
                resource_id=resource.id,
                content=content,
                chunk_index=0,
                total_chunks=1,
                metadata={
                    'title': resource.title,
                    'url': resource.url,
                    'category': resource.category,
                    'difficulty': resource.difficulty,
                    'resource_type': resource.resource_type,
                    'tags': resource.tags,
                    'source': resource.source
                }
            )]
        
        # Otherwise, chunk the content
        text_chunks = self.chunk_by_paragraphs(content)
        
        # Create ContentChunk objects
        chunks = []
        for idx, chunk_text in enumerate(text_chunks):
            # Skip chunks that are too small (likely artifacts)
            if len(chunk_text.split()) < self.min_chunk_size:
                continue
            
            chunks.append(ContentChunk(
                chunk_id=f"{resource.id}_chunk_{idx}",
                resource_id=resource.id,
                content=chunk_text,
                chunk_index=idx,
                total_chunks=len(text_chunks),
                metadata={
                    'title': resource.title,
                    'url': resource.url,
                    'category': resource.category,
                    'difficulty': resource.difficulty,
                    'resource_type': resource.resource_type,
                    'tags': resource.tags,
                    'source': resource.source,
                    'chunk_position': f"{idx + 1}/{len(text_chunks)}"
                }
            ))
        
        return chunks


class CategoryMapper:
    """
    Maps scraped content topics to quiz categories.
    Helps categorize resources into the 5 main skill areas.
    """
    
    CATEGORY_KEYWORDS = {
        "UX Fundamentals": [
            "user flow", "wireframe", "information architecture", "ia",
            "heuristics", "usability principles", "design principles",
            "user experience basics", "ux basics", "foundations"
        ],
        "UI Craft & Visual Design": [
            "visual design", "ui design", "typography", "color theory",
            "layout", "grid system", "visual hierarchy", "aesthetics",
            "design system", "component library", "style guide"
        ],
        "User Research & Validation": [
            "user research", "usability testing", "user testing",
            "interviews", "surveys", "personas", "user interviews",
            "research methods", "validation", "testing", "feedback"
        ],
        "Product Thinking & Strategy": [
            "product strategy", "product thinking", "product design",
            "business goals", "metrics", "kpis", "roadmap",
            "prioritization", "product management", "strategy"
        ],
        "Collaboration & Communication": [
            "stakeholder", "communication", "presentation", "collaboration",
            "teamwork", "feedback", "critique", "handoff", "documentation",
            "design reviews", "working with developers"
        ]
    }
    
    @classmethod
    def infer_category(cls, title: str, content: str, tags: List[str]) -> str:
        """
        Infer the most appropriate category based on content analysis.
        Returns the category with the highest keyword match.
        """
        # Combine all text for analysis
        text = f"{title} {' '.join(tags)} {content[:1000]}".lower()
        
        category_scores = {}
        for category, keywords in cls.CATEGORY_KEYWORDS.items():
            score = sum(1 for keyword in keywords if keyword.lower() in text)
            category_scores[category] = score
        
        # Return category with highest score, or default to Fundamentals
        if max(category_scores.values()) > 0:
            return max(category_scores.items(), key=lambda x: x[1])[0]
        
        return "UX Fundamentals"  # Default category


class DifficultyClassifier:
    """
    Classifies content difficulty level based on various signals.
    """
    
    BEGINNER_KEYWORDS = [
        "introduction", "basics", "getting started", "beginner",
        "fundamental", "101", "guide", "what is", "how to start"
    ]
    
    ADVANCED_KEYWORDS = [
        "advanced", "expert", "deep dive", "mastery", "optimization",
        "at scale", "enterprise", "complex", "strategic", "system design"
    ]
    
    @classmethod
    def classify_difficulty(cls, title: str, content: str, tags: List[str]) -> str:
        """
        Classify difficulty level: beginner, intermediate, or advanced.
        """
        text = f"{title} {' '.join(tags)}".lower()
        
        # Check for explicit difficulty markers
        beginner_score = sum(1 for kw in cls.BEGINNER_KEYWORDS if kw in text)
        advanced_score = sum(1 for kw in cls.ADVANCED_KEYWORDS if kw in text)
        
        # Additional signals from content
        word_count = len(content.split())
        avg_word_length = sum(len(word) for word in content.split()) / max(word_count, 1)
        
        # Simple heuristic based on scores and content complexity
        if beginner_score > advanced_score or "beginner" in text:
            return "beginner"
        elif advanced_score > beginner_score or avg_word_length > 6:
            return "advanced"
        else:
            return "intermediate"


def estimate_read_time(content: str) -> int:
    """
    Estimate reading time in minutes (assuming 200 words per minute).
    """
    word_count = len(content.split())
    return max(1, round(word_count / 200))


def create_summary(content: str, max_words: int = 200) -> str:
    """
    Create a summary from the first N words of content.
    """
    words = content.split()
    if len(words) <= max_words:
        return content
    
    # Take first max_words and try to end on sentence boundary
    summary_words = words[:max_words]
    summary_text = ' '.join(summary_words)
    
    # Try to end on a sentence
    last_period = summary_text.rfind('.')
    if last_period > len(summary_text) * 0.7:  # If we're at least 70% through
        return summary_text[:last_period + 1]
    
    return summary_text + "..."



