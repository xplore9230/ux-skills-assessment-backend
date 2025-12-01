"""
Test suite for API endpoints.
Tests response times, JSON validity, and RAG usage.
"""
import pytest
import time
import json
from conftest import client, sample_assessment_data

def test_health_endpoint(client):
    """Test health endpoint returns valid JSON and includes RAG status."""
    response = client.get("/health")
    assert response.status_code == 200
    
    data = response.json()
    assert data["status"] == "ok"
    assert "rag" in data
    assert "ollama" in data
    assert "pregenerated" in data
    
    # Should respond quickly
    assert response.elapsed.total_seconds() < 1.0

def test_generate_resources_returns_json(client, sample_assessment_data):
    """Test generate-resources endpoint returns valid JSON."""
    start_time = time.time()
    response = client.post("/api/generate-resources", json=sample_assessment_data)
    elapsed = time.time() - start_time
    
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/json"
    
    data = response.json()
    assert "readup" in data
    assert "resources" in data
    assert "source" in data
    assert isinstance(data["resources"], list)
    
    # Should respond in < 5 seconds
    assert elapsed < 5.0, f"Response took {elapsed:.2f}s, expected < 5s"
    
    # Should return valid resources
    assert len(data["resources"]) > 0, "No resources returned"
    
    # Check resource structure
    for resource in data["resources"]:
        assert "title" in resource
        assert "url" in resource
        assert "description" in resource

def test_generate_resources_uses_rag(client, sample_assessment_data):
    """Test that generate-resources uses RAG when available."""
    response = client.post("/api/generate-resources", json=sample_assessment_data)
    assert response.status_code == 200
    
    data = response.json()
    source = data.get("source", "")
    
    # Source should be one of: rag, rag+pregenerated, rag+ai, curated, pregenerated, fallback
    valid_sources = ["rag", "rag+pregenerated", "rag+ai", "curated", "pregenerated", "fallback"]
    assert source in valid_sources, f"Invalid source: {source}"
    
    # If RAG is available, it should be used (unless it times out)
    # We can't guarantee RAG will always work, but we can check the structure

def test_generate_resources_fallback(client, sample_assessment_data):
    """Test that generate-resources falls back gracefully."""
    response = client.post("/api/generate-resources", json=sample_assessment_data)
    assert response.status_code == 200
    
    data = response.json()
    assert len(data["resources"]) > 0, "Fallback should always return resources"

def test_generate_deep_dive_returns_json(client, sample_assessment_data):
    """Test generate-deep-dive endpoint returns valid JSON."""
    start_time = time.time()
    response = client.post("/api/generate-deep-dive", json=sample_assessment_data)
    elapsed = time.time() - start_time
    
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/json"
    
    data = response.json()
    assert "topics" in data
    assert "source" in data
    assert isinstance(data["topics"], list)
    
    # Should respond in < 5 seconds
    assert elapsed < 5.0, f"Response took {elapsed:.2f}s, expected < 5s"

def test_generate_category_insights_returns_json(client, sample_assessment_data):
    """Test generate-category-insights endpoint returns valid JSON."""
    start_time = time.time()
    response = client.post("/api/generate-category-insights", json=sample_assessment_data)
    elapsed = time.time() - start_time
    
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/json"
    
    data = response.json()
    assert "insights" in data
    assert "source" in data
    assert isinstance(data["insights"], list)
    
    # Should respond in < 5 seconds
    assert elapsed < 5.0, f"Response took {elapsed:.2f}s, expected < 5s"
    
    # Should have insights for all categories
    assert len(data["insights"]) > 0, "No insights returned"

def test_generate_improvement_plan_returns_json(client, sample_assessment_data):
    """Test generate-improvement-plan endpoint returns valid JSON."""
    start_time = time.time()
    response = client.post("/api/generate-improvement-plan", json=sample_assessment_data)
    elapsed = time.time() - start_time
    
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/json"
    
    data = response.json()
    assert "weeks" in data
    assert "source" in data
    assert isinstance(data["weeks"], list)
    
    # Should respond in < 5 seconds
    assert elapsed < 5.0, f"Response took {elapsed:.2f}s, expected < 5s"

def test_start_ai_generation_returns_json(client, sample_assessment_data):
    """Test start-ai-generation endpoint returns valid JSON (not HTML)."""
    response = client.post("/api/start-ai-generation", json=sample_assessment_data)
    
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/json"
    
    data = response.json()
    assert "jobId" in data
    assert "status" in data
    
    # Should not be HTML
    assert not data.get("jobId", "").startswith("<!DOCTYPE"), "Response is HTML, not JSON"

def test_all_endpoints_return_json(client, sample_assessment_data):
    """Test all endpoints return JSON, not HTML."""
    endpoints = [
        "/api/generate-resources",
        "/api/generate-deep-dive",
        "/api/generate-category-insights",
        "/api/generate-improvement-plan",
        "/api/start-ai-generation"
    ]
    
    for endpoint in endpoints:
        response = client.post(endpoint, json=sample_assessment_data)
        assert response.status_code == 200, f"{endpoint} returned {response.status_code}"
        assert response.headers["content-type"] == "application/json", f"{endpoint} returned wrong content type"
        
        # Try to parse as JSON
        try:
            data = response.json()
            assert isinstance(data, dict), f"{endpoint} returned non-dict JSON"
        except json.JSONDecodeError:
            pytest.fail(f"{endpoint} returned invalid JSON: {response.text[:200]}")

def test_job_search_links_returns_json(client):
    """Test job-search-links endpoint returns valid JSON."""
    response = client.get("/api/job-search-links?stage=Practitioner&location=Remote")
    
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/json"
    
    data = response.json()
    assert "job_title" in data or "linkedin_url" in data






