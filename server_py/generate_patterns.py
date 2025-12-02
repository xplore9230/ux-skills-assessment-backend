"""
Category Pattern Generator for Pre-generation

Generates representative category score patterns for each total score (0-100).
These patterns represent typical score distributions that would result in a given total score.
"""

import random
from typing import List, Dict, Any

# The 5 categories used in the quiz
CATEGORIES = [
    "UX Fundamentals",
    "UI Craft & Visual Design",
    "User Research & Validation",
    "Product Thinking & Strategy",
    "Collaboration & Communication"
]

def get_stage_from_score(score: int) -> str:
    """
    Determine career stage based on total score.
    Matches the logic in client/src/lib/results/scoring.ts
    """
    if score <= 40:
        return "Explorer"
    elif score <= 65:
        return "Practitioner"
    elif score <= 83:
        return "Emerging Lead"
    elif score <= 90:
        return "Strategic Lead - Senior"
    elif score <= 95:
        return "Strategic Lead - Executive"
    else:
        return "Strategic Lead - C-Suite"

def generate_category_pattern(total_score: int) -> List[Dict[str, Any]]:
    """
    Generate representative category scores for a given total score.
    
    Creates a balanced pattern where all categories are close to the total score,
    with slight variations (±5-10 points) for realism.
    Ensures the average of category percentages approximately equals the total score.
    
    Args:
        total_score: The total score (0-100) to generate patterns for
        
    Returns:
        List of category dictionaries with name, score, and maxScore
    """
    # Set random seed based on score for reproducibility
    random.seed(total_score)
    
    # Target average category score should be close to total_score
    # We'll create 5 categories that average to approximately total_score
    
    # Generate base scores with slight variations
    base_scores = []
    for i in range(5):
        # Add variation: ±5 to ±10 points from total score
        variation = random.randint(-10, 10)
        # Clamp to valid range [0, 100]
        category_score = max(0, min(100, total_score + variation))
        base_scores.append(category_score)
    
    # Adjust to ensure average is close to total_score
    current_avg = sum(base_scores) / 5
    adjustment = total_score - current_avg
    
    # Apply adjustment to each category proportionally
    adjusted_scores = []
    for score in base_scores:
        adjusted = score + adjustment
        # Clamp again after adjustment
        adjusted = max(0, min(100, round(adjusted)))
        adjusted_scores.append(adjusted)
    
    # Fine-tune to ensure average is exactly total_score (or very close)
    current_avg = sum(adjusted_scores) / 5
    if abs(current_avg - total_score) > 1:
        diff = round(total_score - current_avg)
        # Distribute the difference across categories
        for i in range(abs(diff)):
            idx = i % 5
            if diff > 0:
                if adjusted_scores[idx] < 100:
                    adjusted_scores[idx] += 1
            else:
                if adjusted_scores[idx] > 0:
                    adjusted_scores[idx] -= 1
    
    # Create category objects
    categories = []
    for i, category_name in enumerate(CATEGORIES):
        categories.append({
            "name": category_name,
            "score": adjusted_scores[i],
            "maxScore": 100
        })
    
    return categories

def validate_pattern(categories: List[Dict[str, Any]], expected_total: int) -> bool:
    """
    Validate that the category pattern averages to approximately the expected total score.
    
    Args:
        categories: List of category dictionaries
        expected_total: The expected total score
        
    Returns:
        True if average is within acceptable range (within 2 points)
    """
    if not categories:
        return False
    
    avg_score = sum(cat["score"] for cat in categories) / len(categories)
    return abs(avg_score - expected_total) <= 2

if __name__ == "__main__":
    # Test the pattern generator
    print("Testing pattern generator...")
    
    test_scores = [0, 25, 50, 75, 100]
    for score in test_scores:
        pattern = generate_category_pattern(score)
        avg = sum(cat["score"] for cat in pattern) / len(pattern)
        stage = get_stage_from_score(score)
        
        print(f"\nScore: {score}, Stage: {stage}, Avg: {avg:.1f}")
        for cat in pattern:
            print(f"  {cat['name']}: {cat['score']}/100")
        
        assert validate_pattern(pattern, score), f"Pattern validation failed for score {score}"

