#!/usr/bin/env python3
"""
Quick test script to verify all endpoints return valid responses.
"""
import requests
import json
import sys

BASE_URL = "http://localhost:8000"

test_data = {
    "stage": "Practitioner",
    "totalScore": 65,
    "maxScore": 100,
    "categories": [
        {"name": "UX Fundamentals", "score": 60, "maxScore": 100},
        {"name": "UI Craft & Visual Design", "score": 70, "maxScore": 100},
        {"name": "User Research & Validation", "score": 65, "maxScore": 100}
    ]
}

def test_endpoint(name, method, url, data=None):
    """Test an endpoint and verify it returns valid JSON."""
    try:
        if method == "POST":
            response = requests.post(url, json=data, timeout=15)
        else:
            response = requests.get(url, timeout=15)
        
        if response.status_code != 200:
            print(f"❌ {name}: HTTP {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
        
        try:
            result = response.json()
            print(f"✅ {name}: OK")
            print(f"   Source: {result.get('source', 'unknown')}")
            return True
        except json.JSONDecodeError:
            print(f"❌ {name}: Invalid JSON response")
            print(f"   Response: {response.text[:200]}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ {name}: Request failed - {e}")
        return False
    except Exception as e:
        print(f"❌ {name}: Error - {e}")
        return False

def main():
    print("Testing Python Backend Endpoints...")
    print("=" * 50)
    
    results = []
    
    # Test health endpoint
    results.append(test_endpoint("Health Check", "GET", f"{BASE_URL}/health"))
    
    # Test generate-resources
    results.append(test_endpoint(
        "Generate Resources",
        "POST",
        f"{BASE_URL}/api/generate-resources",
        test_data
    ))
    
    # Test generate-layout
    results.append(test_endpoint(
        "Generate Layout",
        "POST",
        f"{BASE_URL}/api/generate-layout",
        test_data
    ))
    
    # Test generate-category-insights
    results.append(test_endpoint(
        "Generate Category Insights",
        "POST",
        f"{BASE_URL}/api/generate-category-insights",
        test_data
    ))
    
    # Test generate-deep-dive
    results.append(test_endpoint(
        "Generate Deep Dive",
        "POST",
        f"{BASE_URL}/api/generate-deep-dive",
        test_data
    ))
    
    # Test job-search-links
    results.append(test_endpoint(
        "Job Search Links",
        "GET",
        f"{BASE_URL}/api/job-search-links?stage=Practitioner&location=Remote"
    ))
    
    print("=" * 50)
    passed = sum(results)
    total = len(results)
    print(f"Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("✅ All tests passed!")
        return 0
    else:
        print("❌ Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())

