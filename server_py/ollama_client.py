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

def quick_ollama_check(timeout: float = 2.0) -> bool:
    """
    Quick check if Ollama is available and ready (fast timeout for speed).
    Returns True if Ollama responds within timeout, False otherwise.
    """
    try:
        response = requests.get(f"{OLLAMA_HOST}/api/tags", timeout=timeout)
        return response.status_code == 200
    except:
        return False

def call_ollama(prompt: str, model: str = MODEL_NAME, format_json: bool = True, quick_check: bool = True) -> Dict[str, Any]:
    """
    Generic helper to call Ollama API with optional JSON format enforcement.
    Returns None if Ollama is not available.
    
    Args:
        prompt: The prompt to send
        model: Model name to use
        format_json: If True, expect JSON response. If False, return raw text.
        quick_check: If True, do a quick availability check before calling (default: True)
    """
    # Quick check if Ollama is ready (faster than waiting for full timeout)
    if quick_check and not quick_ollama_check(timeout=2.0):
        return None  # Signal to use fallback
    
    if not OLLAMA_AVAILABLE:
        return None  # Signal to use fallback
        
    try:
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "stream": False,
            "options": {
                "temperature": 0.3,  # Lower = faster and more focused
                "num_predict": 800 if format_json else 200    # Limit response length for speed
            }
        }
        
        # Only request JSON format if specified
        if format_json:
            payload["format"] = "json"
        
        response = requests.post(f"{OLLAMA_HOST}/api/chat", json=payload, timeout=15)
        response.raise_for_status()
        
        result = response.json()
        content = result.get("message", {}).get("content", "{}" if format_json else "")
        
        if format_json:
            try:
                return json.loads(content)
            except json.JSONDecodeError:
                print(f"Failed to parse JSON from Ollama: {content[:200]}...")
                return None
        else:
            # Return as string for non-JSON responses
            return content
            
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
    
    prompt = f"""You are a UX career coach. Create a highly personalized 4-week improvement plan for a {stage} level designer.

Career Stage: {stage}
Total Score: {total_score}/{max_score} ({percentage}%)

Full Skill Breakdown:
{category_details}

WEAKEST AREAS (focus here):
{weakest_details}
{rag_context}

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

Return ONLY valid JSON with this structure:
{{
  "weeks": [
    {{"week": 1, "tasks": ["Specific task referencing their weak area", "Another concrete task", "Third actionable task"]}},
    {{"week": 2, "tasks": ["Build on week 1", "More advanced task", "Third task"]}},
    {{"week": 3, "tasks": ["Even more advanced", "Task 2", "Task 3"]}},
    {{"week": 4, "tasks": ["Most advanced task", "Final push", "Capstone task"]}}
  ]
}}"""
    
    result = call_ollama(prompt)
    if result is None:
        return get_fallback_improvement_plan(stage, categories)
    return result

def generate_resource_description(resource: Dict[str, Any], stage: str, category: str) -> str:
    """
    Generate contextual description for a resource using AI based on user's profile and resource data.
    Uses the resource's actual summary/content to create a personalized description.
    """
    import re
    
    title = resource.get('title', '')
    summary = resource.get('summary', '') or resource.get('content_preview', '')
    category_field = resource.get('category', category) or category
    
    # Clean and extract meaningful content from summary
    if summary:
        # Remove markdown formatting
        cleaned = re.sub(r'\*\s*\[([^\]]+)\]\([^)]+\)', r'\1', summary)  # Remove markdown links, keep text
        cleaned = re.sub(r'\*\s*', '', cleaned)  # Remove asterisks
        cleaned = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', cleaned)  # Remove any remaining links
        cleaned = re.sub(r'!\[[^\]]*\]\([^\)]+\)', '', cleaned)  # Remove images
        cleaned = re.sub(r'=+', '', cleaned)  # Remove separator lines
        cleaned = re.sub(r'^\d+\s+', '', cleaned, flags=re.MULTILINE)  # Remove leading numbers
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()  # Normalize whitespace
        
        # Check if it's just language links
        if re.match(r'^(English|Español|Francais|عربي|中文|日本語)[\s\w\s\.,]*$', cleaned, re.IGNORECASE):
            cleaned = ''  # Ignore language-only descriptions
        
        summary = cleaned[:400] if cleaned else ''  # Use cleaned version
    
    # If no good summary, use title-based fallback
    if not summary or len(summary) < 30:
        # Generate simple contextual description
        return f"Master {title} to strengthen your {category_field} skills as a {stage} designer."
    
    # Generate contextual description using AI with actual resource content
    prompt = f"""Create a brief, contextual description (1 sentence, max 150 chars) for this UX resource.

Resource:
Title: {title}
Content: {summary[:250]}

User Context:
- Career Stage: {stage}
- Focus Area: {category_field}

Description should:
- Explain why this resource matters for a {stage} designer
- Highlight its relevance to {category_field}
- Be engaging and actionable
- Use content from the resource
- Max 150 characters
- No markdown, no quotes, just plain text

Description:"""
    
    try:
        # Use a simple text prompt (not JSON) for description
        ai_response = call_ollama(prompt, model=MODEL_NAME, format_json=False)
        
        # Extract description from response (should be string)
        if ai_response:
            description = ai_response if isinstance(ai_response, str) else str(ai_response)
            
            # Clean and validate description
            description = description.strip()
            # Remove quotes if present
            description = re.sub(r'^["\']|["\']$', '', description)
            # Remove JSON formatting if present
            description = re.sub(r'^\{"description":\s*"|"}$', '', description)
            # Remove "Description:" prefix if present
            description = re.sub(r'^(Description|description):\s*', '', description, flags=re.IGNORECASE)
            description = description.strip()
            
            # Limit length
            if len(description) > 150:
                description = description[:147] + '...'
            
            # Validate minimum length
            if len(description) >= 30:
                return description
            
    except Exception as e:
        print(f"Error generating AI description for {title}: {e}")
    
    # Fallback: Create contextual description from cleaned summary
    if summary and len(summary) >= 30:
        # Take first sentence or first 120 chars
        first_sentence = re.split(r'[.!?]\s+', summary)[0]
        if len(first_sentence) >= 30 and len(first_sentence) <= 150:
            return f"{first_sentence} Essential for {stage} designers working on {category_field}."
        # Otherwise, create a contextual summary
        return f"{summary[:100]}... Essential reading for {stage} designers."
    
    # Final fallback
    return f"Master {title} to strengthen your {category_field} skills as a {stage} designer."

def generate_resources_ollama(stage: str, categories: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Uses RAG to retrieve relevant resources and AI to generate inspiring readup text.
    Generates contextual descriptions for each resource.
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
    
    # Get weakest category for contextual descriptions
    sorted_cats = sorted(categories, key=lambda c: (c['score'] / c['maxScore']) if c['maxScore'] > 0 else 0)
    weakest_category = sorted_cats[0]['name'] if sorted_cats else "UX skills"
    
    # Format resources with contextual descriptions
    formatted_resources = []
    for res in resources:
        resource_category = res.get('category', weakest_category)
        contextual_description = generate_resource_description(res, stage, resource_category)
        
        formatted_resources.append({
            'title': res.get('title', ''),
            'url': res.get('url', ''),
            'description': contextual_description,
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
    
    prompt = f"""You are a UX career expert. Based on this assessment, provide 2-3 deep dive topics for focused learning.

Career Stage: {stage}

Skill Breakdown:
{category_details}
{rag_context}

IMPORTANT:
- Focus on their WEAKEST areas first
- Each practice point must be SPECIFIC and ACTIONABLE (not generic advice)
- Include concrete deliverables (e.g., "Create 3 wireframes...", "Conduct 2 interviews...")
- Make it appropriate for {stage} level

GOOD practice point examples:
- "Conduct 5 user interviews using the Jobs-to-be-Done framework and document findings"
- "Create a comprehensive style guide with color, typography, and spacing tokens"
- "Build 3 interactive prototypes in Figma with micro-interactions"

BAD practice point examples (too vague):
- "Learn more about UX"
- "Practice design"
- "Read articles"

Return ONLY valid JSON with this structure:
{{
  "topics": [
    {{
      "name": "Specific Topic Name",
      "pillar": "Category Name from above",
      "level": "Beginner/Intermediate/Advanced",
      "summary": "One sentence explaining why this matters for a {stage} designer",
      "practice_points": [
        "First specific, actionable task with clear deliverable",
        "Second specific, actionable task with clear deliverable",
        "Third specific, actionable task with clear deliverable"
      ]
    }}
  ]
}}"""
    
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

