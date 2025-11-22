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

def call_ollama(prompt: str, model: str = MODEL_NAME) -> Dict[str, Any]:
    """
    Generic helper to call Ollama API with JSON format enforcement.
    """
    try:
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "format": "json",
            "stream": False,
            "options": {
                "temperature": 0.7
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
            return {}
            
    except Exception as e:
        print(f"Ollama API error: {str(e)}")
        return {}

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
    
    prompt = f"""
    You are a UX career coach. Create a highly personalized 4-week improvement plan for a {stage} level designer.
    
    Career Stage: {stage}
    Total Score: {total_score}/{max_score} ({percentage}%)
    
    Full Skill Breakdown:
    {category_details}
    
    WEAKEST AREAS (focus here):
    {weakest_details}
    
    IMPORTANT GUIDELINES:
    1. This is a {stage} level designer - tasks must match their current capabilities
    2. Focus HEAVILY on the 2 weakest categories above
    3. Each task must be:
       - Specific and actionable (not generic advice)
       - Completable in 1-2 hours
       - Measurable (clear done criteria)
       - Reference their actual score gaps
    4. Build progressively: Week 1 = basics, Week 4 = advanced
    5. Mention the {stage} stage in context (e.g., "As a {stage}, you should...")
    
    EXAMPLES OF GOOD TASKS:
    - "Create 3 wireframes for a checkout flow, focusing on error states you missed"
    - "Conduct 2 user interviews and document 5 pain points using the Jobs-to-be-Done framework"
    - "Redesign your portfolio's navigation using the 8-point grid system"
    
    EXAMPLES OF BAD TASKS:
    - "Learn more about UX" (too vague)
    - "Become better at design" (not measurable)
    - "Read articles" (not specific enough)
    {rag_context}
    
    Return ONLY valid JSON with this structure:
    {{
      "weeks": [
        {{"week": 1, "tasks": ["Specific task referencing their weak area", "Another concrete task", "Third actionable task"]}},
        {{"week": 2, "tasks": ["Build on week 1", "More advanced task", "Third task"]}},
        {{"week": 3, "tasks": ["Even more advanced", "Task 2", "Task 3"]}},
        {{"week": 4, "tasks": ["Most advanced task", "Final push", "Capstone task"]}}
      ]
    }}
    """
    
    return call_ollama(prompt)

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
    
    prompt = f"""
    You are a UX career expert. Based on this assessment result, provide a brief, inspiring career stage readup (2-3 sentences).
    
    Career Stage: {stage}
    
    Skill Breakdown:
    {category_details}
    
    Return ONLY valid JSON with this structure:
    {{
      "readup": "Brief inspiring paragraph about their career stage"
    }}
    """
    
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
    
    prompt = f"""
    You are a UX career expert. Based on this assessment result, provide 2-3 deep dive topics for focused learning.
    
    Career Stage: {stage}
    
    Skill Breakdown:
    {category_details}
    
    For each topic, provide:
    - name: Topic title
    - pillar: Which skill area (from the 5 categories)
    - level: Beginner/Intermediate/Advanced
    - summary: 1-2 sentence explanation of why this matters for them
    - practice_points: 3 specific action items
    
    Focus on their weakest areas first.
    {rag_context}
    
    Return ONLY valid JSON with this structure:
    {{
      "topics": [
        {{
          "name": "Topic Name",
          "pillar": "Category Name",
          "level": "Intermediate",
          "summary": "Why this matters...",
          "practice_points": ["action1", "action2", "action3"]
        }}
      ]
    }}
    """
    
    return call_ollama(prompt)

def generate_layout_strategy(stage: str, total_score: int, max_score: int, categories: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Uses AI to determine the optimal layout strategy for the results page based on user's performance.
    """
    category_details = "\n".join([f"{c['name']}: {c['score']}/{c['maxScore']}" for c in categories])
    
    # Calculate percentage for context
    percentage = round((total_score / max_score * 100)) if max_score > 0 else 0
    
    prompt = f"""
    You are a UX career advisor. Analyze this assessment result and determine the best way to present the results page.
    
    Career Stage: {stage}
    Total Score: {total_score}/{max_score} ({percentage}%)
    
    Skill Breakdown:
    {category_details}
    
    Based on their situation, decide:
    1. Section order priority (what should they see first?)
    2. Content depth per section (minimal/standard/detailed)
    3. A priority message explaining your layout focus
    
    Available sections: hero, stage-readup, skill-breakdown, resources, deep-dive, improvement-plan, jobs
    
    IMPORTANT: ALL sections must be visible (jobs section is ALWAYS shown for everyone).
    
    Rules for section ordering and depth:
    - Explorer (low scores): Focus on fundamentals first, then jobs. Show detailed learning resources.
    - Practitioner (mid scores): Balance all sections, standard depth, jobs in middle.
    - Emerging Senior (high scores): Emphasize strategy, show jobs prominently.
    - Strategic Lead (very high): Focus on advanced topics and career progression, jobs near top.
    
    Return ONLY valid JSON with this structure:
    {{
      "section_order": ["hero", "stage-readup", "skill-breakdown", "resources", "deep-dive", "improvement-plan", "jobs"],
      "section_visibility": {{
        "hero": true,
        "stage-readup": true,
        "skill-breakdown": true,
        "resources": true,
        "deep-dive": true,
        "improvement-plan": true,
        "jobs": true
      }},
      "content_depth": {{
        "resources": "detailed",
        "deep-dive": "standard",
        "improvement-plan": "standard"
      }},
      "priority_message": "Based on your {stage} level at {percentage}%, here's your personalized roadmap."
    }}
    """
    
    return call_ollama(prompt)

def generate_category_insights(stage: str, categories: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generates personalized insights for each skill category.
    Returns brief, detailed, and actionable insights per category.
    """
    category_details = "\n".join([f"{c['name']}: {c['score']}/{c['maxScore']}" for c in categories])
    
    prompt = f"""
    You are a UX career coach. For each skill category, provide personalized insights based on their score and career stage.
    
    Career Stage: {stage}
    
    Skill Breakdown:
    {category_details}
    
    For EACH category, provide:
    1. brief: 1-2 sentences explaining what their score means SPECIFICALLY for a {stage} level designer
    2. detailed: A full paragraph comparing their performance to {stage} stage expectations, with specific examples
    3. actionable: 3-5 concrete next steps appropriate for a {stage} level designer
    
    IMPORTANT:
    - Always reference the {stage} stage in your insights
    - Compare their score to what's expected at {stage} level
    - If they're below {stage} expectations, explain the gap
    - If they're above {stage} expectations, acknowledge their strength
    - Make actionable items match {stage} capabilities
    
    Return ONLY valid JSON with this structure:
    {{
      "insights": [
        {{
          "category": "UX Fundamentals",
          "brief": "As a {stage}, your fundamentals score of 75% shows solid understanding of core UX principles.",
          "detailed": "At the {stage} level, you're expected to have strong grasp of user flows and wireframing, which you demonstrate well at 75%. You're comfortable breaking down problems and documenting decisions. To advance beyond {stage}, focus on anticipating edge cases earlier in the design process and building more robust information architectures that scale.",
          "actionable": [
            "Document 3 edge cases for your current project that you initially missed",
            "Create a comprehensive IA diagram for a complex multi-step flow",
            "Review Nielsen's 10 heuristics and find violations in a popular app"
          ]
        }}
      ]
    }}
    """
    
    return call_ollama(prompt)

