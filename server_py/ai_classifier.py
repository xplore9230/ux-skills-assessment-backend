"""
AI Content Classifier
=====================

This module uses OpenAI to classify content (videos, tweets, podcasts,
articles) into:
- One of the 5 quiz categories
- Skill level (explorer, practitioner, emerging-senior, strategic-lead)
- Difficulty (beginner, intermediate, advanced)
- Tags

NOTE: This intentionally does NOT use Ollama. It talks directly to the
OpenAI Chat Completions API using the OPENAI_API_KEY environment
variable, mirroring the Node v2 setup conceptually.
"""

from __future__ import annotations

from typing import Dict, Any, List, Optional
import os
import logging

import requests
import json


logger = logging.getLogger(__name__)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")


QUIZ_CATEGORIES = [
    "UX Fundamentals",
    "UI Craft & Visual Design",
    "User Research & Validation",
    "Product Thinking & Strategy",
    "Collaboration & Communication",
]

LEVELS = ["explorer", "practitioner", "emerging-senior", "strategic-lead"]
DIFFICULTIES = ["beginner", "intermediate", "advanced"]


def _call_openai(system_prompt: str, user_prompt: str) -> Optional[Dict[str, Any]]:
    """
    Minimal JSON-call wrapper to OpenAI Chat API.
    """
    if not OPENAI_API_KEY:
        logger.warning("AIClassifier: OPENAI_API_KEY not configured")
        return None

    url = f"{OPENAI_BASE_URL}/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }
    body = {
        "model": OPENAI_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.3,
        "max_tokens": 600,
    }

    try:
        response = requests.post(url, json=body, headers=headers, timeout=20)
        response.raise_for_status()
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        return json.loads(content)
    except Exception as exc:  # pragma: no cover - network dependent
        logger.error("AIClassifier: OpenAI error: %s", exc)
        return None


def classify_content(title: str, text: str, url: str = "") -> Dict[str, Any]:
    """
    Classify a piece of content and return a structured dict.

    The return value is designed to be stored in UXResource.ai_classification
    and then mirrored into the primary fields by the ingestion pipeline or
    admin tools.
    """
    system_prompt = (
        "You are a senior UX mentor helping classify learning resources into "
        "a small UX skills taxonomy. Always respond with a single JSON object."
    )

    user_prompt = f"""
TITLE:
{title}

CONTENT SNIPPET:
{text[:2000]}

URL: {url}

Return JSON with:
- category: one of {QUIZ_CATEGORIES}
- level: one of {LEVELS}
- difficulty: one of {DIFFICULTIES}
- tags: array of 3-8 short tags
"""

    result = _call_openai(system_prompt, user_prompt)
    if not result:
        # Safe fallback classification
        return {
            "category": "UX Fundamentals",
            "level": "explorer",
            "difficulty": "beginner",
            "tags": [],
        }

    # Normalise / validate keys
    category = result.get("category", "UX Fundamentals")
    if category not in QUIZ_CATEGORIES:
        category = "UX Fundamentals"

    level = result.get("level", "explorer")
    if level not in LEVELS:
        level = "explorer"

    difficulty = result.get("difficulty", "beginner")
    if difficulty not in DIFFICULTIES:
        difficulty = "beginner"

    tags = result.get("tags", [])
    if not isinstance(tags, list):
        tags = []

    return {
        "category": category,
        "level": level,
        "difficulty": difficulty,
        "tags": tags,
        "_raw": result,
    }


