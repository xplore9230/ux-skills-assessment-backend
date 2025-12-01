"""
Integration tests for full flow.
Tests quiz → results → RAG → display flow.
"""
import pytest
import time
from conftest import client, sample_assessment_data, sample_assessment_data_low_score, sample_assessment_data_high_score

def test_full_results_flow(client, sample_assessment_data):
    """Test full flow: all endpoints called in sequence."""
    # 1. Generate resources
    resources_response = client.post("/api/generate-resources", json=sample_assessment_data)
    assert resources_response.status_code == 200
    resources_data = resources_response.json()
    assert "resources" in resources_data
    assert len(resources_data["resources"]) > 0
    
    # 2. Generate deep dive
    deep_dive_response = client.post("/api/generate-deep-dive", json=sample_assessment_data)
    assert deep_dive_response.status_code == 200
    deep_dive_data = deep_dive_response.json()
    assert "topics" in deep_dive_data
    
    # 3. Generate insights
    insights_response = client.post("/api/generate-category-insights", json=sample_assessment_data)
    assert insights_response.status_code == 200
    insights_data = insights_response.json()
    assert "insights" in insights_data
    
    # 4. Generate improvement plan
    plan_response = client.post("/api/generate-improvement-plan", json=sample_assessment_data)
    assert plan_response.status_code == 200
    plan_data = plan_response.json()
    assert "weeks" in plan_data
    
    # All should complete in reasonable time
    print("✓ Full flow completed successfully")

def test_different_scores(client):
    """Test system works with different score ranges."""
    test_cases = [
        sample_assessment_data_low_score,
        sample_assessment_data,
        sample_assessment_data_high_score
    ]
    
    for test_data in test_cases:
        response = client.post("/api/generate-resources", json=test_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "resources" in data
        assert len(data["resources"]) > 0
        
        print(f"✓ Score {test_data['totalScore']} works correctly")

def test_error_scenarios(client):
    """Test error handling scenarios."""
    # Test with invalid data
    invalid_data = {"stage": "Invalid", "totalScore": -1}
    response = client.post("/api/generate-resources", json=invalid_data)
    
    # Should either return 422 (validation error) or handle gracefully
    assert response.status_code in [200, 422], f"Unexpected status: {response.status_code}"
    
    if response.status_code == 200:
        data = response.json()
        # Should still return resources (fallback)
        assert "resources" in data
    
    print("✓ Error scenarios handled correctly")

def test_response_times(client, sample_assessment_data):
    """Test that all endpoints respond quickly."""
    endpoints = [
        "/api/generate-resources",
        "/api/generate-deep-dive",
        "/api/generate-category-insights",
        "/api/generate-improvement-plan"
    ]
    
    max_time = 5.0  # 5 seconds max
    
    for endpoint in endpoints:
        start = time.time()
        response = client.post(endpoint, json=sample_assessment_data)
        elapsed = time.time() - start
        
        assert response.status_code == 200, f"{endpoint} failed"
        assert elapsed < max_time, f"{endpoint} took {elapsed:.2f}s, expected < {max_time}s"
        
        print(f"✓ {endpoint} responded in {elapsed:.2f}s")





