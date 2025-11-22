"""
Pre-generation Script for LLM Responses

Generates all LLM responses for scores 0-100 and saves them to JSON files.
This allows the API to instantly return results without calling the LLM for each user.

Usage:
    python pregenerate_responses.py --generate-all    # Generate all 101 scores
    python pregenerate_responses.py --resume          # Resume from last checkpoint
    python pregenerate_responses.py --stats           # Show generation progress
"""

import json
import os
import sys
import argparse
import time
from datetime import datetime
from typing import Dict, Any, Optional
from tqdm import tqdm

# Import our modules
from generate_patterns import generate_category_pattern, get_stage_from_score
from pregenerated_lookup import ensure_data_dir, PREGENERATED_DATA_DIR
from ollama_client import (
    generate_improvement_plan_ollama,
    generate_resources_ollama,
    generate_deep_dive_topics_ollama,
    generate_layout_strategy,
    generate_category_insights
)

CHECKPOINT_FILE = os.path.join(os.path.dirname(__file__), ".generation_checkpoint.json")

def load_checkpoint() -> Dict[str, Any]:
    """Load generation checkpoint to resume from."""
    if os.path.exists(CHECKPOINT_FILE):
        try:
            with open(CHECKPOINT_FILE, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading checkpoint: {e}")
    return {"last_completed_score": -1, "failed_scores": []}

def save_checkpoint(last_score: int, failed_scores: list):
    """Save generation checkpoint."""
    checkpoint = {
        "last_completed_score": last_score,
        "failed_scores": failed_scores,
        "updated_at": datetime.now().isoformat()
    }
    try:
        with open(CHECKPOINT_FILE, 'w') as f:
            json.dump(checkpoint, f, indent=2)
    except Exception as e:
        print(f"Error saving checkpoint: {e}")

def generate_all_responses_for_score(score: int) -> Optional[Dict[str, Any]]:
    """
    Generate all 5 LLM responses for a specific score.
    
    Args:
        score: The total score (0-100)
        
    Returns:
        Dictionary with all responses, or None if generation failed
    """
    try:
        # Generate category pattern for this score
        categories = generate_category_pattern(score)
        stage = get_stage_from_score(score)
        
        # Convert categories to dict format expected by LLM functions
        categories_dict = [c for c in categories]
        
        # Generate all 5 responses
        print(f"  Generating improvement plan...")
        improvement_plan = generate_improvement_plan_ollama(
            stage, score, 100, categories_dict
        )
        
        print(f"  Generating resources...")
        resources = generate_resources_ollama(stage, categories_dict)
        
        print(f"  Generating deep dive...")
        deep_dive = generate_deep_dive_topics_ollama(stage, categories_dict)
        
        print(f"  Generating layout...")
        layout = generate_layout_strategy(stage, score, 100, categories_dict)
        
        print(f"  Generating insights...")
        insights = generate_category_insights(stage, categories_dict)
        
        # Combine all responses
        result = {
            "score": score,
            "stage": stage,
            "categories": categories,
            "improvement_plan": improvement_plan,
            "resources": resources,
            "deep_dive": deep_dive,
            "layout": layout,
            "insights": insights,
            "generated_at": datetime.now().isoformat()
        }
        
        return result
        
    except Exception as e:
        print(f"  Error generating responses for score {score}: {e}")
        import traceback
        traceback.print_exc()
        return None

def save_score_responses(score: int, data: Dict[str, Any]):
    """Save generated responses to JSON file."""
    ensure_data_dir()
    score_file = os.path.join(PREGENERATED_DATA_DIR, f"score_{score}.json")
    
    try:
        with open(score_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"  ✓ Saved to {score_file}")
    except Exception as e:
        print(f"  ✗ Error saving score {score}: {e}")
        raise

def generate_all(start_from: int = 0, skip_existing: bool = False):
    """
    Generate all responses for scores 0-100.
    
    Args:
        start_from: Score to start from (for resuming)
        skip_existing: If True, skip scores that already have files
    """
    ensure_data_dir()
    
    failed_scores = []
    completed = 0
    
    # Progress bar for all scores
    scores_to_generate = range(start_from, 101)
    
    print(f"\n🚀 Starting pre-generation from score {start_from} to 100...")
    print(f"   Total scores to generate: {101 - start_from}")
    print(f"   Data directory: {PREGENERATED_DATA_DIR}\n")
    
    for score in tqdm(scores_to_generate, desc="Generating scores"):
        # Check if already exists
        if skip_existing:
            from pregenerated_lookup import has_pregenerated
            if has_pregenerated(score):
                print(f"\n⏭️  Skipping score {score} (already exists)")
                completed += 1
                continue
        
        print(f"\n📊 Processing score {score}...")
        
        # Generate all responses
        data = generate_all_responses_for_score(score)
        
        if data is None:
            print(f"  ✗ Failed to generate responses for score {score}")
            failed_scores.append(score)
            save_checkpoint(score - 1, failed_scores)
            continue
        
        # Save to file
        try:
            save_score_responses(score, data)
            completed += 1
            save_checkpoint(score, failed_scores)
            
            # Small delay to avoid overwhelming Ollama
            time.sleep(0.5)
            
        except Exception as e:
            print(f"  ✗ Failed to save score {score}: {e}")
            failed_scores.append(score)
            save_checkpoint(score - 1, failed_scores)
    
    # Final summary
    print(f"\n✅ Pre-generation complete!")
    print(f"   Completed: {completed}/{101 - start_from}")
    print(f"   Failed: {len(failed_scores)}")
    
    if failed_scores:
        print(f"\n❌ Failed scores: {failed_scores}")
        print(f"   You can retry failed scores manually or use --resume")

def resume_from_checkpoint():
    """Resume generation from last checkpoint."""
    checkpoint = load_checkpoint()
    last_score = checkpoint.get("last_completed_score", -1)
    failed_scores = checkpoint.get("failed_scores", [])
    
    if last_score < 0:
        print("No checkpoint found. Starting from score 0.")
        start_from = 0
    else:
        print(f"Resuming from checkpoint: last completed score = {last_score}")
        start_from = last_score + 1
    
    if failed_scores:
        print(f"Retrying {len(failed_scores)} previously failed scores: {failed_scores}")
        for score in failed_scores:
            print(f"\n🔄 Retrying score {score}...")
            data = generate_all_responses_for_score(score)
            if data:
                save_score_responses(score, data)
                failed_scores.remove(score)
                save_checkpoint(score, failed_scores)
    
    generate_all(start_from=start_from, skip_existing=True)

def show_stats():
    """Show generation statistics."""
    from pregenerated_lookup import get_generation_stats
    
    stats = get_generation_stats()
    
    print("\n📈 Pre-generation Statistics")
    print("=" * 50)
    print(f"Total generated: {stats['total_generated']}/101 ({stats['completion_percentage']}%)")
    print(f"Missing scores: {stats['total_missing']}")
    
    if stats['missing_scores']:
        missing = stats['missing_scores']
        if len(missing) <= 20:
            print(f"\nMissing: {missing}")
        else:
            print(f"\nMissing (first 20): {missing[:20]}...")
            print(f"Missing (last 10): ...{missing[-10:]}")
    
    if stats['generated_scores']:
        print(f"\n✅ Generated scores available: {len(stats['generated_scores'])}")

def main():
    parser = argparse.ArgumentParser(description="Pre-generate LLM responses for all scores")
    parser.add_argument(
        "--generate-all",
        action="store_true",
        help="Generate all responses for scores 0-100"
    )
    parser.add_argument(
        "--resume",
        action="store_true",
        help="Resume generation from last checkpoint"
    )
    parser.add_argument(
        "--stats",
        action="store_true",
        help="Show generation statistics"
    )
    
    args = parser.parse_args()
    
    if args.stats:
        show_stats()
    elif args.resume:
        resume_from_checkpoint()
    elif args.generate_all:
        generate_all()
    else:
        parser.print_help()
        sys.exit(1)

if __name__ == "__main__":
    main()

