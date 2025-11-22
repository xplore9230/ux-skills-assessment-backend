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
    generate_category_insights
)
from job_links import build_job_search_links

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
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local dev (npm run dev)
        "http://localhost:5173",  # Local dev (vite)
        "http://localhost:5000",  # Local dev Express
        "https://*.vercel.app",  # Vercel preview and production deployments
        # Add your custom domain here after deployment
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load curated resources
RESOURCES_FILE = os.path.join(os.path.dirname(__file__), "resources.json")
try:
    with open(RESOURCES_FILE, "r") as f:
        CURATED_RESOURCES = json.load(f)
except Exception as e:
    print(f"Warning: Could not load resources.json: {e}")
    CURATED_RESOURCES = {}

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
    return {"status": "ok", "service": "python-backend"}

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
    Generates career stage readup using Ollama with RAG-enhanced recommendations.
    Returns resources from the RAG knowledge base based on weakest categories.
    Resources always get fresh contextual descriptions based on actual resource data.
    """
    try:
        categories_dict = [c.model_dump() for c in data.categories]
        
        # Always generate fresh resources with contextual descriptions from actual data
        # Check for pre-generated readup only
        readup_text = None
        if USE_PREGENERATED:
            pregenerated = get_pregenerated_resources(data.totalScore)
            if pregenerated is not None:
                readup_text = pregenerated.get("readup")
                print(f"✓ Using pre-generated readup for score {data.totalScore}")
        
        # Always generate fresh resources with contextual descriptions
        print(f"🔄 Generating fresh resources with contextual descriptions from actual data for score {data.totalScore}")
        
        # Generate resources using RAG - this will create contextual descriptions from resource data
        ai_response = generate_resources_ollama(data.stage, categories_dict)
        
        # Use pre-generated readup if available, otherwise use AI-generated
        final_readup = readup_text if readup_text else ai_response.get("readup", "Keep growing your skills!")
        
        # Resources always have fresh contextual descriptions
        return {
            "readup": final_readup,
            "resources": ai_response.get("resources", [])
        }
        
    except Exception as e:
        print(f"Error generating resources: {e}")
        # Fallback to static resources if RAG fails
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
        return {
            "readup": "Keep growing your UX skills!",
            "resources": selected_resources
        }

@app.post("/api/generate-deep-dive")
def generate_deep_dive(data: AssessmentInput):
    """
    Generates deep dive topics using local Ollama LLM and enriches them with curated resources.
    Deep Dive always uses fresh AI generation (bypasses pre-generated data).
    """
    try:
        # Deep Dive always uses fresh AI generation, never pre-generated
        # Always skip pre-generated check to ensure fresh AI responses
        print(f"🔄 Generating fresh deep dive via AI for score {data.totalScore}")
        categories_dict = [c.model_dump() for c in data.categories]
        ai_response = generate_deep_dive_topics_ollama(data.stage, categories_dict)
        
        # Enrich each topic with resources from our curated list
        topics = ai_response.get("topics", [])
        for topic in topics:
            pillar = topic.get("pillar", "")
            # Try to match resources from the curated list based on the pillar
            topic_resources = []
            
            # Look for resources in the matching category
            if pillar in CURATED_RESOURCES:
                # Take first 2-3 resources from this category
                curated = CURATED_RESOURCES[pillar][:3]
                for res in curated:
                    topic_resources.append({
                        "title": res.get("title", ""),
                        "type": "article",  # Default type
                        "estimated_read_time": "5-10 min",  # Default estimate
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
        raise HTTPException(status_code=500, detail=str(e))

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
        # Check for pre-generated response first
        if USE_PREGENERATED:
            pregenerated = get_pregenerated_layout(data.totalScore)
            if pregenerated is not None:
                print(f"✓ Using pre-generated layout for score {data.totalScore}")
                return pregenerated
        
        # Fall back to LLM generation
        print(f"Generating layout via LLM for score {data.totalScore}")
        categories_dict = [c.model_dump() for c in data.categories]
        layout_strategy = generate_layout_strategy(
            data.stage,
            data.totalScore,
            data.maxScore,
            categories_dict
        )
        
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

@app.post("/api/generate-category-insights")
def generate_insights(data: AssessmentInput):
    """
    Generates personalized AI insights for each skill category.
    Returns brief, detailed, and actionable insights.
    """
    try:
        # Check for pre-generated response first
        if USE_PREGENERATED:
            pregenerated = get_pregenerated_insights(data.totalScore)
            if pregenerated is not None:
                print(f"✓ Using pre-generated insights for score {data.totalScore}")
                return pregenerated
        
        # Fall back to LLM generation
        print(f"Generating insights via LLM for score {data.totalScore}")
        categories_dict = [c.model_dump() for c in data.categories]
        ai_response = generate_category_insights(data.stage, categories_dict)
        
        insights = ai_response.get("insights", [])
        
        # Ensure we have insights for all categories
        if not insights or len(insights) == 0:
            # Generate fallback insights
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
        
        return {"insights": insights}
        
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
        return {"insights": insights}


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


@app.post("/api/rag/learning-path")
def rag_learning_path(data: RAGLearningPathInput):
    """
    Generate a personalized learning path using RAG.
    Sequences resources from beginner to advanced for weak areas.
    """
    if not RAG_AVAILABLE:
        raise HTTPException(status_code=503, detail="RAG system not available")
    
    try:
        # Sort categories to find weakest
        sorted_cats = sorted(
            data.categories,
            key=lambda c: (c.score / c.maxScore) if c.maxScore > 0 else 0
        )
        weak_categories = [c.model_dump() for c in sorted_cats[:2]]
        
        rag = get_rag_retriever()
        learning_path = rag.generate_learning_path(weak_categories, data.stage)
        
        return learning_path
        
    except Exception as e:
        print(f"Error generating learning path: {e}")
        raise HTTPException(status_code=500, detail=str(e))


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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

