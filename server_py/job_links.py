from urllib.parse import urlencode, quote_plus
from typing import Dict

def build_job_title(stage: str) -> str:
    """
    Maps the career stage to a search-friendly job title.
    """
    stage_map = {
        "Explorer": "Junior Product Designer",
        "Practitioner": "Product Designer",
        "Emerging Lead": "Lead Product Designer",
        "Strategic Lead - Senior": "Design Director",
        "Strategic Lead - Executive": "VP of Design",
        "Strategic Lead - C-Suite": "SVP of Design"
    }
    return stage_map.get(stage, "Product Designer")

def build_job_search_links(stage: str, location: str) -> Dict[str, str]:
    """
    Generates direct search URLs for LinkedIn and Google Jobs.
    This avoids using any paid APIs.
    """
    job_title = build_job_title(stage)
    
    # LinkedIn jobs search URL
    linkedin_params = {
        "keywords": job_title,
        "location": location
    }
    linkedin_url = (
        "https://www.linkedin.com/jobs/search/?" + 
        urlencode(linkedin_params, quote_via=quote_plus)
    )

    # Google job search URL
    # We use a standard google search with "jobs" appended to trigger the jobs widget
    google_query = quote_plus(f"{job_title} jobs in {location}")
    google_url = f"https://www.google.com/search?q={google_query}&ibp=htl;jobs"

    return {
        "job_title": job_title,
        "linkedin_url": linkedin_url,
        "google_url": google_url
    }

