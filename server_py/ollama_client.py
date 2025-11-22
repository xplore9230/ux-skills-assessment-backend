import json
import requests
import os
from typing import Dict, List, Any, Optional

# Import RAG components
try:
    from rag import get_rag_retriever
    RAG_AVAILABLE = True
except ImportError:
    RAG_AVAILABLE = False
    print("⚠ RAG system not available - using fallback mode")

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
MODEL_NAME = "llama3.2"  # Can be overridden by env var

# Check if Ollama is available
OLLAMA_AVAILABLE = False

def check_ollama_availability():
    """Check if Ollama service is running and accessible."""
    global OLLAMA_AVAILABLE
    try:
        response = requests.get(f"{OLLAMA_HOST}/api/tags", timeout=5)
        OLLAMA_AVAILABLE = response.status_code == 200
        if OLLAMA_AVAILABLE:
            print("✓ Ollama is available and ready")
        else:
            print("⚠ Ollama service not responding - using fallback mode")
    except Exception as e:
        OLLAMA_AVAILABLE = False
        print(f"⚠ Ollama not available ({str(e)}) - using fallback mode")

# Check on startup
check_ollama_availability()

def call_ollama(prompt: str, model: str = MODEL_NAME) -> Dict[str, Any]:
    """
    Generic helper to call Ollama API with JSON format enforcement.
    Returns None if Ollama is not available.
    """
    if not OLLAMA_AVAILABLE:
        return None  # Signal to use fallback
        
    try:
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "format": "json",
            "stream": False,
            "options": {
                "temperature": 0.3,  # Lower = faster and more focused
                "num_predict": 800    # Limit response length for speed
            }
        }
        
        response = requests.post(f"{OLLAMA_HOST}/api/chat", json=payload, timeout=120)
        response.raise_for_status()
        
        result = response.json()
        content = result.get("message", {}).get("content", "{}")
        
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            print(f"Failed to parse JSON from Ollama: {content[:200]}...")
            return None
            
    except Exception as e:
        print(f"Ollama API error: {str(e)}")
        return None

def get_fallback_improvement_plan(stage: str, categories: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Generate a basic improvement plan when Ollama is not available."""
    sorted_cats = sorted(categories, key=lambda c: (c['score'] / c['maxScore']) if c['maxScore'] > 0 else 0)
    weakest = sorted_cats[0]['name'] if sorted_cats else "UX skills"
    
    return {
        "weeks": [
            {
                "week": 1,
                "tasks": [
                    f"Review fundamentals of {weakest}",
                    "Complete 2-3 online tutorials or courses",
                    "Document your learning in a journal"
                ]
            },
            {
                "week": 2,
                "tasks": [
                    f"Practice {weakest} through small projects",
                    "Get feedback from peers or mentors",
                    "Analyze case studies in your focus area"
                ]
            },
            {
                "week": 3,
                "tasks": [
                    "Apply new skills to a real project",
                    "Create a portfolio piece showcasing your work",
                    "Share your progress with the community"
                ]
            },
            {
                "week": 4,
                "tasks": [
                    "Review and reflect on your growth",
                    "Set goals for continued improvement",
                    "Identify next areas to develop"
                ]
            }
        ]
    }

def generate_improvement_plan_ollama(stage: str, total_score: int, max_score: int, categories: List[Dict[str, Any]]) -> Dict[str, Any]:
    # Sort categories by score to identify weakest areas
    sorted_cats = sorted(categories, key=lambda c: (c['score'] / c['maxScore']) if c['maxScore'] > 0 else 0)
    weakest_two = sorted_cats[:2]
    
    category_details = "\n".join([f"{c['name']}: {c['score']}/{c['maxScore']} ({round((c['score']/c['maxScore']*100)) if c['maxScore'] > 0 else 0}%)" for c in categories])
    weakest_details = "\n".join([f"- {c['name']}: {c['score']}/{c['maxScore']} ({round((c['score']/c['maxScore']*100)) if c['maxScore'] > 0 else 0}%)" for c in weakest_two])
    
    percentage = round((total_score / max_score * 100)) if max_score > 0 else 0
    
    # Retrieve relevant resources using RAG
    rag_context = ""
    if RAG_AVAILABLE:
        try:
            rag = get_rag_retriever()
            resources = rag.retrieve_resources_for_user(stage, categories, top_k=5)
            if resources:
                rag_context = "\n\nRELEVANT LEARNING RESOURCES:\n"
                for idx, res in enumerate(resources[:5], 1):
                    rag_context += f"{idx}. {res.get('title', 'Unknown')} ({res.get('source', 'Unknown')})\n"
                    rag_context += f"   Category: {res.get('category', 'N/A')}, Difficulty: {res.get('difficulty', 'N/A')}\n"
                    rag_context += f"   URL: {res.get('url', 'N/A')}\n"
                rag_context += "\nYou can reference these specific resources in your tasks.\n"
        except Exception as e:
            print(f"RAG retrieval error: {e}")
    
    prompt = f"""Create a 4-week UX improvement plan for a {stage} designer (score: {percentage}%).

Weakest areas: {weakest_details}

Requirements:
- Focus on weakest 2 categories
- 3 specific, actionable tasks per week (1-2 hours each)
- Progressive difficulty (Week 1=basics, Week 4=advanced)
- Match {stage} level capabilities

Return JSON:
{{
  "weeks": [
    {{"week": 1, "tasks": ["task1", "task2", "task3"]}},
    {{"week": 2, "tasks": ["task1", "task2", "task3"]}},
    {{"week": 3, "tasks": ["task1", "task2", "task3"]}},
    {{"week": 4, "tasks": ["task1", "task2", "task3"]}}
  ]
}}"""
    
    result = call_ollama(prompt)
    if result is None:
        return get_fallback_improvement_plan(stage, categories)
    return result

def generate_resources_ollama(stage: str, categories: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Uses RAG to retrieve relevant resources and AI to generate inspiring readup text.
    """
    category_details = "\n".join([f"{c['name']}: {c['score']}/{c['maxScore']}" for c in categories])
    
    # Retrieve resources using RAG
    resources = []
    if RAG_AVAILABLE:
        try:
            rag = get_rag_retriever()
            resources = rag.retrieve_resources_for_user(stage, categories, top_k=5)
        except Exception as e:
            print(f"RAG retrieval error: {e}")
    
    # Format resources for response
    formatted_resources = []
    for res in resources:
        formatted_resources.append({
            'title': res.get('title', ''),
            'url': res.get('url', ''),
            'description': res.get('content_preview', '')[:150] + '...',
            'tags': res.get('tags', [])
        })
    
    prompt = f"""Brief inspiring readup for {stage} UX designer (2 sentences).

Skills: {category_details}

JSON: {{"readup": "Your message"}}"""
    
    ai_response = call_ollama(prompt)
    
    # Combine AI readup with RAG resources
    return {
        'readup': ai_response.get('readup', 'Keep growing your skills!'),
        'resources': formatted_resources
    }

def generate_deep_dive_topics_ollama(stage: str, categories: List[Dict[str, Any]]) -> Dict[str, Any]:
    category_details = "\n".join([f"{c['name']}: {c['score']}/{c['maxScore']}" for c in categories])
    
    # Retrieve resources for context
    rag_context = ""
    if RAG_AVAILABLE:
        try:
            rag = get_rag_retriever()
            resources = rag.retrieve_resources_for_user(stage, categories, top_k=8)
            if resources:
                rag_context = "\n\nAVAILABLE LEARNING RESOURCES:\n"
                for res in resources[:8]:
                    rag_context += f"- {res.get('title', 'Unknown')} ({res.get('category', 'N/A')}, {res.get('difficulty', 'N/A')})\n"
                rag_context += "\nReference these when suggesting practice points.\n"
        except Exception as e:
            print(f"RAG retrieval error: {e}")
    
    prompt = f"""Provide 2-3 deep dive topics for a {stage} UX designer.

Skills: {category_details}

For each topic return JSON:
{{
  "topics": [
    {{
      "name": "Topic",
      "pillar": "Category",
      "level": "Intermediate",
      "summary": "1 sentence why this matters",
      "practice_points": ["action1", "action2", "action3"]
    }}
  ]
}}

Focus on weakest areas."""
    
    return call_ollama(prompt)

def generate_layout_strategy(stage: str, total_score: int, max_score: int, categories: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Uses AI to determine the optimal layout strategy for the results page based on user's performance.
    """
    category_details = "\n".join([f"{c['name']}: {c['score']}/{c['maxScore']}" for c in categories])
    
    # Calculate percentage for context
    percentage = round((total_score / max_score * 100)) if max_score > 0 else 0
    
    prompt = f"""Layout for {stage} designer ({percentage}%).

Skills: {category_details}

Return section order, all visible, depth, message.

JSON:
{{
  "section_order": ["hero", "stage-readup", "skill-breakdown", "resources", "deep-dive", "improvement-plan", "jobs"],
  "section_visibility": {{"hero": true, "stage-readup": true, "skill-breakdown": true, "resources": true, "deep-dive": true, "improvement-plan": true, "jobs": true}},
  "content_depth": {{"resources": "detailed", "deep-dive": "standard", "improvement-plan": "standard"}},
  "priority_message": "Focus message"
}}"""
    
    return call_ollama(prompt)

def generate_category_insights(stage: str, categories: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generates personalized insights for each skill category.
    Returns brief, detailed, and actionable insights per category.
    """
    category_details = "\n".join([f"{c['name']}: {c['score']}/{c['maxScore']}" for c in categories])
    
    prompt = f"""Insights for {stage} designer.

Skills: {category_details}

For each category: brief (1 sentence), detailed (2 sentences), actionable (3 items).

JSON:
{{
  "insights": [
    {{
      "category": "Category Name",
      "brief": "Score meaning for {stage}",
      "detailed": "Performance vs {stage} expectations",
      "actionable": ["step1", "step2", "step3"]
    }}
  ]
}}"""
    
    return call_ollama(prompt)

