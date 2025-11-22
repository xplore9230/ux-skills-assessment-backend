"""
Pre-generated Response Lookup Helper

Simple functions to load pre-generated LLM responses from JSON files.
"""

import json
import os
from typing import Optional, Dict, Any

# Directory where pre-generated data is stored
PREGENERATED_DATA_DIR = os.path.join(os.path.dirname(__file__), "pregenerated_data")

def get_pregenerated_data_dir() -> str:
    """Get the directory path for pre-generated data."""
    return PREGENERATED_DATA_DIR

def ensure_data_dir() -> None:
    """Ensure the pre-generated data directory exists."""
    os.makedirs(PREGENERATED_DATA_DIR, exist_ok=True)

def get_pregenerated_for_score(score: int) -> Optional[Dict[str, Any]]:
    """
    Load pre-generated response for a specific score.
    
    Args:
        score: The total score (0-100) to look up
        
    Returns:
        Dictionary with all pre-generated responses, or None if not found
    """
    score_file = os.path.join(PREGENERATED_DATA_DIR, f"score_{score}.json")
    
    if not os.path.exists(score_file):
        return None
    
    try:
        with open(score_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error loading pre-generated data for score {score}: {e}")
        return None

def has_pregenerated(score: int) -> bool:
    """
    Check if pre-generated data exists for a specific score.
    
    Args:
        score: The total score (0-100) to check
        
    Returns:
        True if pre-generated data exists, False otherwise
    """
    score_file = os.path.join(PREGENERATED_DATA_DIR, f"score_{score}.json")
    return os.path.exists(score_file)

def get_pregenerated_improvement_plan(score: int) -> Optional[Dict[str, Any]]:
    """Get just the improvement plan for a score."""
    data = get_pregenerated_for_score(score)
    if data:
        return data.get("improvement_plan")
    return None

def get_pregenerated_resources(score: int) -> Optional[Dict[str, Any]]:
    """Get just the resources for a score."""
    data = get_pregenerated_for_score(score)
    if data:
        return data.get("resources")
    return None

def get_pregenerated_deep_dive(score: int) -> Optional[Dict[str, Any]]:
    """Get just the deep dive for a score."""
    data = get_pregenerated_for_score(score)
    if data:
        return data.get("deep_dive")
    return None

def get_pregenerated_layout(score: int) -> Optional[Dict[str, Any]]:
    """Get just the layout strategy for a score."""
    data = get_pregenerated_for_score(score)
    if data:
        return data.get("layout")
    return None

def get_pregenerated_insights(score: int) -> Optional[Dict[str, Any]]:
    """Get just the category insights for a score."""
    data = get_pregenerated_for_score(score)
    if data:
        return data.get("insights")
    return None

def get_generation_stats() -> Dict[str, Any]:
    """
    Get statistics about pre-generated data.
    
    Returns:
        Dictionary with stats: total_generated, missing_scores, etc.
    """
    ensure_data_dir()
    
    generated_scores = []
    missing_scores = []
    
    for score in range(101):
        if has_pregenerated(score):
            generated_scores.append(score)
        else:
            missing_scores.append(score)
    
    return {
        "total_generated": len(generated_scores),
        "total_missing": len(missing_scores),
        "generated_scores": generated_scores,
        "missing_scores": missing_scores,
        "completion_percentage": round((len(generated_scores) / 101) * 100, 2)
    }

