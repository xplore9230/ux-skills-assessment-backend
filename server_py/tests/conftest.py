"""
Pytest configuration and fixtures for test suite.
"""
import pytest
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi.testclient import TestClient
from main import app

@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)

@pytest.fixture
def sample_assessment_data():
    """Sample assessment data for testing."""
    return {
        "stage": "Practitioner",
        "totalScore": 65,
        "maxScore": 100,
        "categories": [
            {"name": "UX Fundamentals", "score": 60, "maxScore": 100},
            {"name": "UI Craft & Visual Design", "score": 70, "maxScore": 100},
            {"name": "User Research & Validation", "score": 65, "maxScore": 100}
        ]
    }

@pytest.fixture
def sample_assessment_data_low_score():
    """Sample assessment data with low score."""
    return {
        "stage": "Explorer",
        "totalScore": 35,
        "maxScore": 100,
        "categories": [
            {"name": "UX Fundamentals", "score": 30, "maxScore": 100},
            {"name": "UI Craft & Visual Design", "score": 40, "maxScore": 100}
        ]
    }

@pytest.fixture
def sample_assessment_data_high_score():
    """Sample assessment data with high score."""
    return {
        "stage": "Strategic Lead",
        "totalScore": 85,
        "maxScore": 100,
        "categories": [
            {"name": "UX Fundamentals", "score": 90, "maxScore": 100},
            {"name": "Product Thinking & Strategy", "score": 85, "maxScore": 100}
        ]
    }





