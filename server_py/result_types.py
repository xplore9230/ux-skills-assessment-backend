"""
Type definitions for Result Page V2 caching system.

Defines UserProfile, RetrieverContext, and ResultPagePayload types.
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class UserProfile:
    """
    Represents a user's quiz result profile.
    Used for generating cache keys and AI prompts.
    """
    stage: str
    scores: Dict[str, Any]  # Contains 'overall' and 'categories'
    yearsExperience: Optional[int] = None
    domainInterest: Optional[List[str]] = None
    
    @property
    def overall_score(self) -> float:
        """Get overall score from scores dict."""
        return self.scores.get('overall', 0.0)
    
    @property
    def categories(self) -> List[Dict[str, Any]]:
        """Get categories list from scores dict."""
        return self.scores.get('categories', [])


@dataclass
class RetrieverContext:
    """
    Context retrieved from RAG system.
    Contains resources, learning paths, and other context for AI generation.
    """
    resources: List[Dict[str, Any]] = field(default_factory=list)
    learning_paths: List[Dict[str, Any]] = field(default_factory=list)
    top_categories: List[str] = field(default_factory=list)
    weak_categories: List[str] = field(default_factory=list)
    stage: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            'resources': self.resources,
            'learning_paths': self.learning_paths,
            'top_categories': self.top_categories,
            'weak_categories': self.weak_categories,
            'stage': self.stage,
            'metadata': self.metadata
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'RetrieverContext':
        """Create from dictionary."""
        return cls(
            resources=data.get('resources', []),
            learning_paths=data.get('learning_paths', []),
            top_categories=data.get('top_categories', []),
            weak_categories=data.get('weak_categories', []),
            stage=data.get('stage', ''),
            metadata=data.get('metadata', {})
        )


@dataclass
class ResultPagePayload:
    """
    Final AI-generated result page payload.
    This is what gets cached and returned to the frontend.
    """
    # Core content sections
    hero: Optional[Dict[str, Any]] = None
    stage_readup: Optional[str] = None
    skill_breakdown: Optional[Dict[str, Any]] = None
    resources: Optional[List[Dict[str, Any]]] = None
    deep_dive: Optional[Dict[str, Any]] = None
    improvement_plan: Optional[Dict[str, Any]] = None
    jobs: Optional[List[Dict[str, Any]]] = None
    category_insights: Optional[List[Dict[str, Any]]] = None
    
    # Metadata
    meta: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        result = {}
        
        if self.hero:
            result['hero'] = self.hero
        if self.stage_readup:
            result['stage_readup'] = self.stage_readup
        if self.skill_breakdown:
            result['skill_breakdown'] = self.skill_breakdown
        if self.resources:
            result['resources'] = self.resources
        if self.deep_dive:
            result['deep_dive'] = self.deep_dive
        if self.improvement_plan:
            result['improvement_plan'] = self.improvement_plan
        if self.jobs:
            result['jobs'] = self.jobs
        if self.category_insights:
            result['category_insights'] = self.category_insights
        
        # Always include meta
        result['meta'] = self.meta
        
        return result
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ResultPagePayload':
        """Create from dictionary."""
        return cls(
            hero=data.get('hero'),
            stage_readup=data.get('stage_readup'),
            skill_breakdown=data.get('skill_breakdown'),
            resources=data.get('resources'),
            deep_dive=data.get('deep_dive'),
            improvement_plan=data.get('improvement_plan'),
            jobs=data.get('jobs'),
            category_insights=data.get('category_insights'),
            meta=data.get('meta', {})
        )

