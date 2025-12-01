# CRITICAL: Patch NumPy compatibility BEFORE any chromadb imports
# This MUST be the first import to ensure numpy is patched before chromadb loads
import numpy_compat  # noqa: F401

import json
import os
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ollama_client import (
    generate_improvement_plan_ollama,
    generate_resources_ollama,
    generate_deep_dive_topics_ollama,
    generate_layout_strategy,
    generate_category_insights,
    quick_ollama_check,
    generate_design_system_improvement_plan,
    generate_design_system_insights,
)
# from generate_design_system_questions import generate_all_design_system_questions
from job_links import build_job_search_links
from content_aggregator import ContentAggregator, load_social_config
from admin_api import router as admin_router

# Import RAG components
try:
    from rag import get_rag_retriever
    from vector_store import get_vector_store
    RAG_AVAILABLE = True
except ImportError:
    RAG_AVAILABLE = False
    print("⚠ RAG system not available")

# Import pre-generated lookup
try:
    from pregenerated_lookup import (
        get_pregenerated_improvement_plan,
        get_pregenerated_resources,
        get_pregenerated_deep_dive,
        get_pregenerated_layout,
        get_pregenerated_insights
    )
    PREGENERATED_AVAILABLE = True
except ImportError:
    PREGENERATED_AVAILABLE = False
    print("⚠ Pre-generated lookup not available")

# Check if pre-generated mode is enabled (default: True if available)
USE_PREGENERATED = os.getenv("USE_PREGENERATED", "true").lower() == "true" and PREGENERATED_AVAILABLE

app = FastAPI(title="UX Skills Assessment API")

# Enable CORS for local development and production
# Allow all origins for Vercel deployments (wildcard doesn't work in FastAPI CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins - Vercel uses dynamic preview URLs
    allow_credentials=False,  # Must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount admin API router
app.include_router(admin_router)

# Load curated resources with retry logic and better error handling
RESOURCES_FILE = os.path.join(os.path.dirname(__file__), "resources.json")

def load_curated_resources(max_retries: int = 3) -> Dict[str, Any]:
    """
    Load resources.json with retry logic and validation.
    Returns empty dict if all retries fail.
    """
    for attempt in range(1, max_retries + 1):
        try:
            # Check if file exists
            if not os.path.exists(RESOURCES_FILE):
                print(f"⚠ resources.json not found at {RESOURCES_FILE} (attempt {attempt}/{max_retries})")
                if attempt < max_retries:
                    continue
                return {}
            
            # Try to load the file
            with open(RESOURCES_FILE, "r", encoding="utf-8") as f:
                resources = json.load(f)
            
            # Validate it's a dict
            if not isinstance(resources, dict):
                print(f"⚠ resources.json is not a valid dictionary (attempt {attempt}/{max_retries})")
                if attempt < max_retries:
                    continue
                return {}
            
            # Validate it has content
            if not resources:
                print(f"⚠ resources.json is empty (attempt {attempt}/{max_retries})")
                if attempt < max_retries:
                    continue
                return {}
            
            print(f"✓ Successfully loaded {len(resources)} resource categories from resources.json")
            return resources
            
        except json.JSONDecodeError as e:
            print(f"⚠ JSON decode error in resources.json (attempt {attempt}/{max_retries}): {e}")
            if attempt < max_retries:
                continue
            return {}
        except Exception as e:
            print(f"⚠ Error loading resources.json (attempt {attempt}/{max_retries}): {e}")
            if attempt < max_retries:
                continue
            return {}
    
    return {}

def get_fallback_resources() -> Dict[str, Any]:
    """
    Returns hardcoded fallback resources that are always available.
    These are used when resources.json fails to load.
    """
    return {
        "UX Fundamentals": [
            {
                "title": "Laws of UX",
                "url": "https://lawsofux.com/",
                "description": "A collection of best practices that designers can consider when building user interfaces.",
                "tags": ["Heuristics", "Psychology"]
            },
            {
                "title": "Nielsen Norman Group: UX Research Cheat Sheet",
                "url": "https://www.nngroup.com/articles/ux-research-cheat-sheet/",
                "description": "A comprehensive guide to different UX research methods and when to use them.",
                "tags": ["Research", "Reference"]
            }
        ],
        "UI Craft & Visual Design": [
            {
                "title": "Refactoring UI",
                "url": "https://www.refactoringui.com/",
                "description": "Learn how to design beautiful user interfaces by yourself using specific tactics.",
                "tags": ["Visual Design", "Guide"]
            },
            {
                "title": "Material Design Guidelines",
                "url": "https://m3.material.io/",
                "description": "Google's open-source design system that provides comprehensive UI guidelines.",
                "tags": ["Design System", "Reference"]
            }
        ],
        "User Research & Validation": [
            {
                "title": "The Mom Test",
                "url": "http://momtestbook.com/",
                "description": "How to talk to customers & learn if your business is a good idea when everyone is lying to you.",
                "tags": ["Interviews", "Validation"]
            },
            {
                "title": "A Guide to Usability Testing",
                "url": "https://www.usability.gov/how-to-and-tools/methods/usability-testing.html",
                "description": "Learn the fundamentals of usability testing and how to conduct effective tests.",
                "tags": ["Testing", "Research"]
            }
        ],
        "Information Architecture": [
            {
                "title": "Information Architecture Basics",
                "url": "https://www.usability.gov/what-and-why/information-architecture.html",
                "description": "Understanding how to organize information clearly for users.",
                "tags": ["IA", "Structure"]
            }
        ],
        "Interaction Design": [
            {
                "title": "Microinteractions: Designing with Details",
                "url": "https://www.nngroup.com/articles/microinteractions/",
                "description": "Learn how small interactions can make a big difference in user experience.",
                "tags": ["Interaction", "Details"]
            }
        ]
    }


@app.get("/api/social/stats")
def social_stats() -> Dict[str, Any]:
    """
    Lightweight stats about social content in the knowledge base.
    Currently proxies vector store stats.
    """
    if not RAG_AVAILABLE:
        raise HTTPException(status_code=500, detail="RAG system not available")

    vs = get_vector_store()
    return vs.get_stats()


@app.post("/api/social/update")
def social_update() -> Dict[str, Any]:
    """
    Manually trigger social content aggregation.
    """
    if not RAG_AVAILABLE:
        raise HTTPException(status_code=500, detail="RAG system not available")

    try:
        aggregator = ContentAggregator()
        summary = aggregator.run_full_update()
        return {"ok": True, "summary": summary}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Aggregation failed: {exc}")


@app.get("/api/social/feeds")
def social_feeds() -> Dict[str, Any]:
    """
    Return the configured social feed sources (from social_config.json).
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    cfg_path = os.path.join(base_dir, "social_config.json")
    return load_social_config(cfg_path)


# Load curated resources, merge with fallback (loaded takes priority)
loaded_resources = load_curated_resources()
fallback_resources = get_fallback_resources()

# Merge: loaded resources take priority, fallback fills gaps
CURATED_RESOURCES = fallback_resources.copy()
CURATED_RESOURCES.update(loaded_resources)  # Override with loaded if available

if loaded_resources:
    print(f"✓ Using {len(loaded_resources)} categories from resources.json")
else:
    print(f"⚠ Using {len(fallback_resources)} hardcoded fallback resource categories")

# --- Data Models ---

class CategoryScore(BaseModel):
    name: str
    score: int
    maxScore: int

class AssessmentInput(BaseModel):
    stage: str
    totalScore: int = 0
    maxScore: int = 100
    categories: List[CategoryScore]
    force_ai: Optional[bool] = False  # Flag to bypass pre-generated data

# --- Routes ---

@app.get("/health")
def health_check():
    """
    Health check endpoint for Railway deployment.
    Returns immediately without blocking on Ollama initialization.
    This ensures Railway's health check passes quickly (< 1 second).
    """
    import requests
    
    # Fast response - always return immediately
    response = {
        "status": "ok",
        "service": "python-backend",
        "ollama": "initializing"  # Default: Ollama may still be starting
    }
    
    # Quick non-blocking Ollama status check (0.3s timeout max)
    # This doesn't block the response if Ollama isn't ready
    try:
        ollama_check = requests.get("http://127.0.0.1:11434/api/tags", timeout=0.3)
        if ollama_check.status_code == 200:
            response["ollama"] = "ready"
    except:
        # Ollama not ready yet - that's fine, it's initializing in background
        # The app works with pregenerated data even if Ollama isn't ready
        pass
    
    return response

@app.get("/api/ollama-status")
def ollama_status():
    """
    Get detailed status of Ollama availability and pregenerated data.
    Returns information about which content generation method is available.
    """
    from ollama_client import OLLAMA_AVAILABLE as OLLAMA_AVAIL
    ollama_ready = quick_ollama_check(timeout=2.0)
    
    return {
        "ollama_available": OLLAMA_AVAIL,
        "ollama_ready": ollama_ready,
        "pregenerated_available": PREGENERATED_AVAILABLE,
        "use_pregenerated": USE_PREGENERATED,
        "model_status": "ready" if ollama_ready else ("not_available" if not OLLAMA_AVAIL else "checking")
    }

@app.post("/api/generate-design-system-questions")
def generate_design_system_questions():
    """
    Generate 30 design system questions using Llama.
    Returns questions across 6 categories (5 questions per category).
    """
    try:
        print("Generating design system questions...")
        # questions = generate_all_design_system_questions()
        # print(f"✓ Generated {len(questions)} design system questions")
        # return {"questions": questions}
        raise Exception("Generator temporarily unavailable")
    except Exception as e:
        print(f"Error generating design system questions: {e}")
        # Return fallback questions
        return {
            "questions": [
                {
                    "id": f"DS-Fallback-{i}",
                    "text": f"Design system question {i+1}",
                    "category": "Foundations",
                    "options": [
                        {"value": 1, "label": "Not familiar"},
                        {"value": 2, "label": "Basic understanding"},
                        {"value": 3, "label": "Good understanding"},
                        {"value": 4, "label": "Strong understanding"},
                        {"value": 5, "label": "Expert level"}
                    ]
                }
                for i in range(30)
            ]
        }

@app.post("/api/generate-improvement-plan")
def generate_plan(data: AssessmentInput):
    """
    Generates a 4-week improvement plan using local Ollama LLM or pre-generated data.
    """
    try:
        # Check for pre-generated response first
        if USE_PREGENERATED:
            pregenerated = get_pregenerated_improvement_plan(data.totalScore)
            if pregenerated is not None:
                print(f"✓ Using pre-generated improvement plan for score {data.totalScore}")
                return pregenerated
        
        # Fall back to LLM generation
        print(f"Generating improvement plan via LLM for score {data.totalScore}")
        categories_dict = [c.model_dump() for c in data.categories]
        return generate_improvement_plan_ollama(
            data.stage, 
            data.totalScore, 
            data.maxScore, 
            categories_dict
        )
    except Exception as e:
        print(f"Error generating plan: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-resources")
def generate_resources(data: AssessmentInput):
    """
    Returns curated resources immediately for fast loading.
    Optionally enhances with AI descriptions if Ollama is ready and fast.
    """
    print(f"Checking Ollama availability for /api/generate-resources")
    source = "curated"
    ollama_available = False
    pregenerated_available = USE_PREGENERATED and PREGENERATED_AVAILABLE
    
    try:
        categories_dict = [c.model_dump() for c in data.categories]
        
        # Get pre-generated readup if available
        readup_text = None
        if USE_PREGENERATED:
            pregenerated = get_pregenerated_resources(data.totalScore)
            if pregenerated is not None:
                readup_text = pregenerated.get("readup")
                print(f"✓ Using pre-generated readup for score {data.totalScore}")
                source = "pregenerated"
        
        # FAST PATH: Return curated resources immediately (no AI wait)
        sorted_categories = sorted(
            data.categories, 
            key=lambda c: (c.score / c.maxScore) if c.maxScore > 0 else 0
        )
        weakest_categories = sorted_categories[:2]
        selected_resources = []
        
        # Collect curated resources from weakest categories
        for cat in weakest_categories:
            if cat.name in CURATED_RESOURCES:
                selected_resources.extend(CURATED_RESOURCES[cat.name][:2])
        
        # Fallback to any available resources if no match
        if not selected_resources and CURATED_RESOURCES:
            first_key = list(CURATED_RESOURCES.keys())[0]
            selected_resources = CURATED_RESOURCES[first_key][:3]
        
        # Final safety: if still no resources, use hardcoded fallback
        if not selected_resources:
            selected_resources = fallback_resources.get("UX Fundamentals", [])[:3]
        
        # Format curated resources (use description from JSON, no AI needed)
        formatted_resources = []
        for res in selected_resources:
            formatted_resources.append({
                'title': res.get('title', ''),
                'url': res.get('url', ''),
                'description': res.get('description', f"Learn about {res.get('title', 'UX skills')} to improve your skills."),
                'tags': res.get('tags', [])
            })
        
        # Quick check if Ollama is ready for enhancement (non-blocking, < 2s)
        ollama_ready = quick_ollama_check(timeout=2.0)
        ollama_available = ollama_ready
        print(f"Ollama status: {'ready' if ollama_ready else 'not ready'}")
        
        # ENHANCEMENT PATH: Only enhance with AI if Ollama is ready and fast
        if ollama_ready and formatted_resources:
            try:
                print(f"⚡ Calling Ollama to generate /api/generate-resources content")
                # Enhance descriptions with AI in background (non-blocking)
                # For now, return curated resources immediately
                # AI enhancement can happen async if needed
                ai_response = generate_resources_ollama(data.stage, categories_dict)
                if ai_response and isinstance(ai_response, dict) and ai_response.get("resources") and len(ai_response.get("resources", [])) > 0:
                    # Use AI-enhanced resources if available
                    formatted_resources = ai_response.get("resources", formatted_resources)
                    readup_text = readup_text or ai_response.get("readup", "Keep growing your skills!")
                    source = "ollama"
                    print(f"Final source: ollama")
                else:
                    print(f"⚠ Ollama generation failed or returned empty, using fallback")
            except Exception as e:
                print(f"⚠ Ollama generation failed, using fallback: {e}")
                # Continue with curated resources
        else:
            if not ollama_ready:
                print(f"✓ Using curated resources (Ollama not ready)")
            else:
                print(f"✓ Using curated resources (fast path)")
            if source != "pregenerated":
                source = "curated"
        
        # Use pre-generated readup if available, otherwise default
        final_readup = readup_text if readup_text else "Keep growing your UX skills!"
        
        return {
            "readup": final_readup,
            "resources": formatted_resources,
            "source": source,
            "ollama_available": ollama_available,
            "pregenerated_available": pregenerated_available
        }
        
    except Exception as e:
        print(f"Error generating resources: {e}")
        # Final fallback to static resources
        sorted_categories = sorted(
            data.categories, 
            key=lambda c: (c.score / c.maxScore) if c.maxScore > 0 else 0
        )
        weakest_categories = sorted_categories[:2]
        selected_resources = []
        for cat in weakest_categories:
            if cat.name in CURATED_RESOURCES:
                selected_resources.extend(CURATED_RESOURCES[cat.name][:2])
        if not selected_resources and CURATED_RESOURCES:
            first_key = list(CURATED_RESOURCES.keys())[0]
            selected_resources = CURATED_RESOURCES[first_key][:3]
        
        # Format fallback resources
        formatted_resources = []
        for res in selected_resources:
            formatted_resources.append({
                'title': res.get('title', ''),
                'url': res.get('url', ''),
                'description': res.get('description', f"Learn about {res.get('title', 'UX skills')}."),
                'tags': res.get('tags', [])
            })
        
        # Final safety: if still no resources, use hardcoded fallback
        if not formatted_resources:
            formatted_resources = [
                {
                    'title': 'Laws of UX',
                    'url': 'https://lawsofux.com/',
                    'description': 'A collection of best practices that designers can consider when building user interfaces.',
                    'tags': ['Heuristics', 'Psychology']
                },
                {
                    'title': 'Nielsen Norman Group',
                    'url': 'https://www.nngroup.com/',
                    'description': 'Evidence-based user experience research, training, and consulting.',
                    'tags': ['Research', 'Reference']
                }
            ]
        
        return {
            "readup": "Keep growing your UX skills!",
            "resources": formatted_resources,
            "source": "fallback",
            "ollama_available": False,
            "pregenerated_available": USE_PREGENERATED and PREGENERATED_AVAILABLE
        }

@app.post("/api/generate-deep-dive")
def generate_deep_dive(data: AssessmentInput):
    """
    Generates deep dive topics using local Ollama LLM and enriches them with curated resources.
    Returns curated resources if AI times out or fails.
    """
    print(f"Checking Ollama availability for /api/generate-deep-dive")
    source = "curated"
    ollama_available = False
    pregenerated_available = USE_PREGENERATED and PREGENERATED_AVAILABLE
    
    import signal
    from contextlib import contextmanager
    
    @contextmanager
    def timeout_handler(seconds):
        """Context manager for timeout handling."""
        def timeout_signal(signum, frame):
            raise TimeoutError(f"Operation timed out after {seconds} seconds")
        
        # Set up signal handler (Unix only)
        if hasattr(signal, 'SIGALRM'):
            old_handler = signal.signal(signal.SIGALRM, timeout_signal)
            signal.alarm(seconds)
            try:
                yield
            finally:
                signal.alarm(0)
                signal.signal(signal.SIGALRM, old_handler)
        else:
            # Windows/fallback: just yield without timeout
            yield
    
    try:
        categories_dict = [c.model_dump() for c in data.categories]
        
        # Quick check if Ollama is ready
        ollama_ready = quick_ollama_check(timeout=2.0)
        ollama_available = ollama_ready
        print(f"Ollama status: {'ready' if ollama_ready else 'not ready'}")
        
        ai_response = None
        if ollama_ready:
            try:
                print(f"⚡ Calling Ollama to generate /api/generate-deep-dive content")
                # Try AI generation with timeout (15s max)
                # Note: Actual timeout is handled by call_ollama (15s), but we add extra safety
                ai_response = generate_deep_dive_topics_ollama(data.stage, categories_dict)
                if ai_response and isinstance(ai_response, dict) and ai_response.get("topics") and len(ai_response.get("topics", [])) > 0:
                    source = "ollama"
                    print(f"Final source: ollama")
                    return {
                        "topics": ai_response.get("topics"),
                        "source": source,
                        "ollama_available": ollama_available,
                        "pregenerated_available": pregenerated_available
                    }
                else:
                    print(f"⚠ Ollama returned None or invalid response, using fallback")
                    ai_response = None
            except Exception as e:
                print(f"⚠ Ollama generation failed, using fallback: {e}")
                import traceback
                traceback.print_exc()
                ai_response = None
        else:
            print(f"✓ Ollama not ready, using curated resources for deep dive")
        
        # If AI failed or not ready, create topics from curated resources
        if not ai_response or not ai_response.get("topics"):
            print(f"✓ Creating deep dive topics from curated resources")
            source = "curated"
            # Create topics based on weakest categories
            sorted_categories = sorted(
                data.categories, 
                key=lambda c: (c.score / c.maxScore) if c.maxScore > 0 else 0
            )
            weakest_categories = sorted_categories[:3]  # Top 3 weakest
            
            topics = []
            for cat in weakest_categories:
                topic_resources = []
                # Get resources for this category
                if cat.name in CURATED_RESOURCES:
                    curated = CURATED_RESOURCES[cat.name][:3]
                    for res in curated:
                        topic_resources.append({
                            "title": res.get("title", ""),
                            "type": "article",
                            "estimated_read_time": "5-10 min",
                            "source": res.get("url", "").split("//")[1].split("/")[0] if res.get("url") else "Web",
                            "url": res.get("url", ""),
                            "tags": res.get("tags", [])
                        })
                
                # If no resources for this category, get general ones
                if not topic_resources and CURATED_RESOURCES:
                    first_key = list(CURATED_RESOURCES.keys())[0]
                    curated = CURATED_RESOURCES[first_key][:2]
                    for res in curated:
                        topic_resources.append({
                            "title": res.get("title", ""),
                            "type": "article",
                            "estimated_read_time": "5-10 min",
                            "source": res.get("url", "").split("//")[1].split("/")[0] if res.get("url") else "Web",
                            "url": res.get("url", ""),
                            "tags": res.get("tags", [])
                        })
                
                if topic_resources:
                    topics.append({
                        "name": f"Master {cat.name}",
                        "pillar": cat.name,
                        "level": "Intermediate",
                        "summary": f"Focus on improving your {cat.name} skills as a {data.stage} designer.",
                        "practice_points": [
                            f"Review {cat.name} fundamentals",
                            f"Practice {cat.name} through hands-on projects",
                            f"Apply {cat.name} concepts to real-world scenarios"
                        ],
                        "resources": topic_resources
                    })
            
            print(f"Final source: curated")
            return {
                "topics": topics,
                "source": source,
                "ollama_available": ollama_available,
                "pregenerated_available": pregenerated_available
            }
        
        # Enrich AI-generated topics with curated resources
        topics = ai_response.get("topics", [])
        for topic in topics:
            pillar = topic.get("pillar", "")
            topic_resources = []
            
            # Look for resources in the matching category
            if pillar in CURATED_RESOURCES:
                curated = CURATED_RESOURCES[pillar][:3]
                for res in curated:
                    topic_resources.append({
                        "title": res.get("title", ""),
                        "type": "article",
                        "estimated_read_time": "5-10 min",
                        "source": res.get("url", "").split("//")[1].split("/")[0] if res.get("url") else "Web",
                        "url": res.get("url", ""),
                        "tags": res.get("tags", [])
                    })
            
            # If no resources found, add some general ones
            if not topic_resources and CURATED_RESOURCES:
                first_key = list(CURATED_RESOURCES.keys())[0]
                curated = CURATED_RESOURCES[first_key][:2]
                for res in curated:
                    topic_resources.append({
                        "title": res.get("title", ""),
                        "type": "article",
                        "estimated_read_time": "5-10 min",
                        "source": res.get("url", "").split("//")[1].split("/")[0] if res.get("url") else "Web",
                        "url": res.get("url", ""),
                        "tags": res.get("tags", [])
                    })
            
            topic["resources"] = topic_resources
        
        return {"topics": topics}
        
    except Exception as e:
        print(f"Error generating deep dive: {e}")
        # Final fallback: return curated resources
        sorted_categories = sorted(
            data.categories, 
            key=lambda c: (c.score / c.maxScore) if c.maxScore > 0 else 0
        )
        weakest_categories = sorted_categories[:2]
        topics = []
        for cat in weakest_categories:
            if cat.name in CURATED_RESOURCES:
                curated = CURATED_RESOURCES[cat.name][:2]
                topic_resources = []
                for res in curated:
                    topic_resources.append({
                        "title": res.get("title", ""),
                        "type": "article",
                        "estimated_read_time": "5-10 min",
                        "source": res.get("url", "").split("//")[1].split("/")[0] if res.get("url") else "Web",
                        "url": res.get("url", ""),
                        "tags": res.get("tags", [])
                    })
                if topic_resources:
                    topics.append({
                        "name": f"Focus on {cat.name}",
                        "pillar": cat.name,
                        "level": "Intermediate",
                        "summary": f"Improve your {cat.name} skills.",
                        "practice_points": ["Practice", "Apply", "Review"],
                        "resources": topic_resources
                    })
        
        return {"topics": topics}

@app.get("/api/job-search-links")
def get_job_links(
    stage: str = Query(..., description="Career stage"),
    location: str = Query("Remote", description="Preferred location")
):
    """
    Returns generated search URLs for LinkedIn and Google Jobs.
    No external API calls required.
    """
    return build_job_search_links(stage, location)

@app.post("/api/generate-layout")
def generate_layout(data: AssessmentInput):
    """
    Generates dynamic layout strategy using AI based on user's performance.
    Determines section order, visibility, and content depth.
    """
    try:
        print(f"Checking Ollama availability for /api/generate-layout")
        source = "curated"
        ollama_available = False
        pregenerated_available = USE_PREGENERATED and PREGENERATED_AVAILABLE
        
        # Check for pre-generated response first
        if USE_PREGENERATED:
            pregenerated = get_pregenerated_layout(data.totalScore)
            if pregenerated is not None:
                print(f"✓ Using pre-generated layout for score {data.totalScore}")
                source = "pregenerated"
                pregenerated["source"] = source
                pregenerated["ollama_available"] = False
                pregenerated["pregenerated_available"] = pregenerated_available
                print(f"Final source: pregenerated")
                return pregenerated
        
        # Check Ollama availability
        ollama_ready = quick_ollama_check(timeout=2.0)
        ollama_available = ollama_ready
        print(f"Ollama status: {'ready' if ollama_ready else 'not ready'}")
        
        # Fall back to LLM generation
        if ollama_ready:
            try:
                print(f"⚡ Calling Ollama to generate /api/generate-layout content")
                categories_dict = [c.model_dump() for c in data.categories]
                layout_strategy = generate_layout_strategy(
                    data.stage,
                    data.totalScore,
                    data.maxScore,
                    categories_dict
                )
                
                if layout_strategy and isinstance(layout_strategy, dict) and layout_strategy.get("section_order") and layout_strategy.get("section_visibility"):
                    source = "ollama"
                    print(f"Final source: ollama")
                else:
                    source = "curated"
                    print(f"⚠ Ollama returned None or invalid layout, using fallback")
                    layout_strategy = None
            except Exception as e:
                print(f"⚠ Ollama generation failed, using fallback: {e}")
                import traceback
                traceback.print_exc()
                source = "curated"
                layout_strategy = None
        else:
            source = "curated"
            layout_strategy = None
        
        # Ensure we have valid defaults if AI fails
        if not layout_strategy or not layout_strategy.get("section_order"):
            layout_strategy = {
                "section_order": ["hero", "stage-readup", "skill-breakdown", "resources", "deep-dive", "improvement-plan", "jobs"],
                "section_visibility": {
                    "hero": True,
                    "stage-readup": True,
                    "skill-breakdown": True,
                    "resources": True,
                    "deep-dive": True,
                    "improvement-plan": True,
                    "jobs": True
                },
                "content_depth": {
                    "resources": "standard",
                    "deep-dive": "standard",
                    "improvement-plan": "standard"
                },
                "priority_message": f"Based on your {data.stage} level, here's your personalized roadmap."
            }
        
        # Force jobs to always be visible
        if "section_visibility" in layout_strategy:
            layout_strategy["section_visibility"]["jobs"] = True
        
        layout_strategy["source"] = source
        layout_strategy["ollama_available"] = ollama_available
        layout_strategy["pregenerated_available"] = pregenerated_available
        
        return layout_strategy
        
    except Exception as e:
        print(f"Error generating layout: {e}")
        # Return default layout on error
        return {
            "section_order": ["hero", "stage-readup", "skill-breakdown", "resources", "deep-dive", "improvement-plan", "jobs"],
            "section_visibility": {
                "hero": True,
                "stage-readup": True,
                "skill-breakdown": True,
                "resources": True,
                "deep-dive": True,
                "improvement-plan": True,
                "jobs": True
            },
            "content_depth": {
                "resources": "standard",
                "deep-dive": "standard",
                "improvement-plan": "standard"
            },
            "priority_message": "Let's review your UX skills assessment results."
        }

@app.post("/api/generate-design-system-improvement-plan")
def generate_ds_improvement_plan(data: AssessmentInput):
    """
    Generates a 4-week improvement plan specifically for Design Systems knowledge.
    """
    try:
        print(f"Generating design system improvement plan for {data.stage} level")
        categories_dict = [c.model_dump() for c in data.categories]
        return generate_design_system_improvement_plan(
            data.stage,
            data.totalScore,
            data.maxScore,
            categories_dict
        )
    except Exception as e:
        print(f"Error generating design system improvement plan: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-design-system-insights")
def generate_ds_insights(data: AssessmentInput):
    """
    Generates personalized insights for Design Systems categories.
    """
    try:
        print(f"Generating design system insights for {data.stage} level")
        categories_dict = [c.model_dump() for c in data.categories]
        ai_response = generate_design_system_insights(data.stage, categories_dict)
        
        insights = ai_response.get("insights", [])
        
        # Ensure we have insights for all categories
        if not insights or len(insights) == 0:
            insights = []
            for cat in data.categories:
                percentage = round((cat.score / cat.maxScore * 100)) if cat.maxScore > 0 else 0
                insights.append({
                    "category": cat.name,
                    "brief": f"You scored {percentage}% in {cat.name}.",
                    "detailed": f"Your Design Systems knowledge in {cat.name} shows room for growth.",
                    "actionable": [
                        f"Review {cat.name} concepts in the Design Systems guide",
                        f"Practice applying {cat.name} in your work",
                        f"Build a project focusing on {cat.name}"
                    ]
                })
        
        return {"insights": insights}
    except Exception as e:
        print(f"Error generating design system insights: {e}")
        # Return fallback insights
        insights = []
        for cat in data.categories:
            percentage = round((cat.score / cat.maxScore * 100)) if cat.maxScore > 0 else 0
            insights.append({
                "category": cat.name,
                "brief": f"You scored {percentage}% in {cat.name}.",
                "detailed": f"Your Design Systems knowledge in {cat.name} can be improved.",
                "actionable": [
                    f"Study {cat.name} in design systems",
                    f"Practice {cat.name} concepts",
                    f"Apply {cat.name} to projects"
                ]
            })
        return {"insights": insights}

@app.post("/api/generate-category-insights")
def generate_insights(data: AssessmentInput):
    """
    Generates personalized AI insights for each skill category.
    Returns brief, detailed, and actionable insights.
    """
    try:
        print(f"Checking Ollama availability for /api/generate-category-insights")
        source = "curated"
        ollama_available = False
        pregenerated_available = USE_PREGENERATED and PREGENERATED_AVAILABLE
        
        # Check for pre-generated response first
        if USE_PREGENERATED:
            pregenerated = get_pregenerated_insights(data.totalScore)
            if pregenerated is not None:
                print(f"✓ Using pre-generated insights for score {data.totalScore}")
                source = "pregenerated"
                pregenerated["source"] = source
                pregenerated["ollama_available"] = False
                pregenerated["pregenerated_available"] = pregenerated_available
                print(f"Final source: pregenerated")
                return pregenerated
        
        # Check Ollama availability
        ollama_ready = quick_ollama_check(timeout=2.0)
        ollama_available = ollama_ready
        print(f"Ollama status: {'ready' if ollama_ready else 'not ready'}")
        
        # Fall back to LLM generation
        insights = []
        if ollama_ready:
            try:
                print(f"⚡ Calling Ollama to generate /api/generate-category-insights content")
                categories_dict = [c.model_dump() for c in data.categories]
                ai_response = generate_category_insights(data.stage, categories_dict)
                if ai_response and isinstance(ai_response, dict):
                    insights = ai_response.get("insights", [])
                    
                    if insights and len(insights) > 0:
                        source = "ollama"
                        print(f"Final source: ollama")
                    else:
                        source = "curated"
                        print(f"⚠ Ollama returned empty insights, using fallback")
                        insights = []
                else:
                    source = "curated"
                    print(f"⚠ Ollama returned None or invalid response, using fallback")
                    insights = []
            except Exception as e:
                print(f"⚠ Ollama generation failed, using fallback: {e}")
                import traceback
                traceback.print_exc()
                source = "curated"
                insights = []
        
        # Ensure we have insights for all categories
        if not insights or len(insights) == 0:
            # Generate fallback insights
            source = "curated"
            insights = []
            for cat in data.categories:
                percentage = round((cat.score / cat.maxScore * 100)) if cat.maxScore > 0 else 0
                insights.append({
                    "category": cat.name,
                    "brief": f"You scored {percentage}% in {cat.name}.",
                    "detailed": f"Your performance in {cat.name} shows room for growth. Focus on building stronger foundations in this area.",
                    "actionable": [
                        f"Review core concepts in {cat.name}",
                        f"Practice {cat.name} skills daily",
                        f"Seek feedback on your {cat.name} work"
                    ]
                })
            print(f"Final source: curated")
        
        return {
            "insights": insights,
            "source": source,
            "ollama_available": ollama_available,
            "pregenerated_available": pregenerated_available
        }
        
    except Exception as e:
        print(f"Error generating category insights: {e}")
        # Return fallback insights
        insights = []
        for cat in data.categories:
            percentage = round((cat.score / cat.maxScore * 100)) if cat.maxScore > 0 else 0
            insights.append({
                "category": cat.name,
                "brief": f"You scored {percentage}% in {cat.name}.",
                "detailed": f"Your performance in {cat.name} shows room for growth. Focus on building stronger foundations in this area.",
                "actionable": [
                    f"Review core concepts in {cat.name}",
                    f"Practice {cat.name} skills daily",
                    f"Seek feedback on your {cat.name} work"
                ]
            })
        return {
            "insights": insights,
            "source": "fallback",
            "ollama_available": False,
            "pregenerated_available": USE_PREGENERATED and PREGENERATED_AVAILABLE
        }


# ============================================================================
# RAG ENDPOINTS
# ============================================================================

class RAGSearchInput(BaseModel):
    query: str
    category: Optional[str] = None
    difficulty: Optional[str] = None
    top_k: int = 10

class RAGLearningPathInput(BaseModel):
    stage: str
    categories: List[CategoryScore]

@app.post("/api/rag/search")
def rag_search(data: RAGSearchInput):
    """
    Perform semantic search on the RAG knowledge base.
    Returns relevant UX resources based on the query.
    """
    if not RAG_AVAILABLE:
        raise HTTPException(status_code=503, detail="RAG system not available")
    
    try:
        rag = get_rag_retriever()
        results = rag.semantic_search_resources(
            query=data.query,
            category=data.category,
            difficulty=data.difficulty,
            top_k=data.top_k
        )
        
        return {
            "query": data.query,
            "results": results,
            "total": len(results)
        }
        
    except Exception as e:
        print(f"Error in RAG search: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class RAGRetrieveInput(BaseModel):
    stage: str
    categories: List[CategoryScore]
    top_k: Optional[int] = 5

@app.post("/api/rag/retrieve")
def rag_retrieve_context(data: RAGRetrieveInput):
    """
    Retrieve personalized resources for RAG context injection.
    Designed to be called by the Node.js backend.
    """
    if not RAG_AVAILABLE:
        return {"resources": []}
    
    try:
        # Convert Pydantic models to dicts
        categories_dict = [c.model_dump() for c in data.categories]
        
        rag = get_rag_retriever()
        resources = rag.retrieve_resources_for_user(
            stage=data.stage, 
            categories=categories_dict, 
            top_k=data.top_k
        )
        
        return {"resources": resources}
        
    except Exception as e:
        print(f"Error in RAG retrieval: {e}")
        # Fail gracefully by returning empty list (prevents blocking)
        return {"resources": []}


@app.get("/api/rag/stats")
def rag_stats():
    """
    Get statistics about the RAG knowledge base.
    Returns total resources, categories, and source breakdown.
    """
    if not RAG_AVAILABLE:
        raise HTTPException(status_code=503, detail="RAG system not available")
    
    try:
        vector_store = get_vector_store()
        stats = vector_store.get_stats()
        
        return {
            "status": "available",
            "total_resources": stats.get("unique_resources", 0),
            "total_chunks": stats.get("total_chunks", 0),
            "categories": stats.get("categories", {}),
            "difficulties": stats.get("difficulties", {}),
            "sources": stats.get("sources", {})
        }
        
    except Exception as e:
        print(f"Error getting RAG stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/pregenerated/stats")
def pregenerated_stats():
    """
    Get statistics about pre-generated LLM responses.
    Returns how many scores have been pre-generated.
    """
    if not PREGENERATED_AVAILABLE:
        return {
            "status": "unavailable",
            "use_pregenerated": USE_PREGENERATED,
            "message": "Pre-generated lookup not available"
        }
    
    try:
        from pregenerated_lookup import get_generation_stats
        stats = get_generation_stats()
        
        return {
            "status": "available",
            "use_pregenerated": USE_PREGENERATED,
            "total_generated": stats.get("total_generated", 0),
            "total_missing": stats.get("total_missing", 0),
            "completion_percentage": stats.get("completion_percentage", 0),
            "missing_scores": stats.get("missing_scores", [])
        }
        
    except Exception as e:
        print(f"Error getting pre-generated stats: {e}")
        return {
            "status": "error",
            "error": str(e)
        }


@app.get("/api/rag/resources/{category}")
def get_resources_by_category(
    category: str,
    difficulty: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=50)
):
    """
    Get resources filtered by category and optional difficulty.
    """
    if not RAG_AVAILABLE:
        raise HTTPException(status_code=503, detail="RAG system not available")
    
    try:
        rag = get_rag_retriever()
        resources = rag.get_resources_for_category(
            category=category,
            difficulty=difficulty,
            limit=limit
        )
        
        return {
            "category": category,
            "difficulty": difficulty,
            "resources": resources,
            "total": len(resources)
        }
        
    except Exception as e:
        print(f"Error getting resources: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class RAGMultiCatInput(BaseModel):
    categories: List[str]

@app.post("/api/rag/learning-paths")
def rag_learning_paths(data: RAGMultiCatInput):
    """Retrieve learning paths for categories."""
    if not RAG_AVAILABLE:
        return {"paths": {}}
    try:
        rag = get_rag_retriever()
        paths = rag.retrieve_learning_paths(data.categories)
        return {"paths": paths}
    except Exception as e:
        print(f"Error in learning paths: {e}")
        return {"paths": {}}

class RAGStageInput(BaseModel):
    stage: str

@app.post("/api/rag/stage-competencies")
def rag_stage_competencies(data: RAGStageInput):
    """Retrieve stage competencies."""
    if not RAG_AVAILABLE:
        return {"competencies": []}
    try:
        rag = get_rag_retriever()
        competencies = rag.retrieve_stage_competencies(data.stage)
        return {"competencies": competencies}
    except Exception as e:
        print(f"Error in stage competencies: {e}")
        return {"competencies": []}

class RAGSkillRelInput(BaseModel):
    weak_categories: List[str]
    strong_categories: List[str]

@app.post("/api/rag/skill-relationships")
def rag_skill_relationships(data: RAGSkillRelInput):
    """Retrieve skill relationships."""
    if not RAG_AVAILABLE:
        return {"relationships": []}
    try:
        rag = get_rag_retriever()
        rels = rag.retrieve_skill_relationships(data.weak_categories, data.strong_categories)
        return {"relationships": rels}
    except Exception as e:
        print(f"Error in skill relationships: {e}")
        return {"relationships": []}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

