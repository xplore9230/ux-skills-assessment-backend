"""
Admin API for Knowledge Bank Review
===================================

FastAPI router exposing endpoints for:
- Listing content
- Viewing single resources
- Updating metadata (category, level, tags, status)
- Approving / rejecting pending items
- Basic statistics

NOTE: This operates primarily on the vector store metadata. For a more
complete admin experience you may later introduce a relational database,
but this keeps things lightweight and compatible with the existing RAG
stack.
"""

from __future__ import annotations

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from vector_store import get_vector_store


router = APIRouter(prefix="/api/admin", tags=["admin"])


class ResourceUpdate(BaseModel):
    category: Optional[str] = None
    difficulty: Optional[str] = None
    resource_type: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None


@router.get("/stats")
def get_admin_stats() -> Dict[str, Any]:
    vs = get_vector_store()
    return vs.get_stats()


@router.get("/content")
def list_content(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = Query(50, ge=1, le=500),
) -> List[Dict[str, Any]]:
    """
    List unique resources with optional filters.
    """
    vs = get_vector_store()
    # Reuse semantic_search with a broad query and then dedupe
    chunks = vs.semantic_search(
        query="UX",
        category=category,
        difficulty=difficulty,
        top_k=limit * 5,
    )
    resources = vs.get_unique_resources(chunks)

    if status:
        resources = [r for r in resources if r.get("status", "approved") == status]

    return resources[:limit]


@router.get("/content/{resource_id}")
def get_content(resource_id: str) -> Dict[str, Any]:
    """
    Fetch all chunks for a specific resource and return merged metadata.
    """
    vs = get_vector_store()
    results = vs.collection.get(where={"resource_id": resource_id})
    if not results or not results.get("ids"):
        raise HTTPException(status_code=404, detail="Resource not found")

    # Use first chunk's metadata as canonical
    metadata = results["metadatas"][0] if results["metadatas"] else {}
    content = "\n\n".join(results["documents"]) if results.get("documents") else ""

    return {
        "resource_id": resource_id,
        "metadata": metadata,
        "content": content,
    }


@router.put("/content/{resource_id}")
def update_content(resource_id: str, payload: ResourceUpdate) -> Dict[str, Any]:
    """
    Update resource metadata in the vector store.
    """
    vs = get_vector_store()
    results = vs.collection.get(where={"resource_id": resource_id})
    if not results or not results.get("ids"):
        raise HTTPException(status_code=404, detail="Resource not found")

    ids = results["ids"]
    metadatas = results["metadatas"]

    for md in metadatas:
        if payload.category is not None:
            md["category"] = payload.category
        if payload.difficulty is not None:
            md["difficulty"] = payload.difficulty
        if payload.resource_type is not None:
            md["resource_type"] = payload.resource_type
        if payload.tags is not None:
            md["tags"] = ",".join(payload.tags)
        if payload.status is not None:
            md["status"] = payload.status

    vs.collection.update(ids=ids, metadatas=metadatas)
    return {"ok": True}


@router.post("/content/{resource_id}/approve")
def approve_content(resource_id: str) -> Dict[str, Any]:
    return update_content(resource_id, ResourceUpdate(status="approved"))


@router.post("/content/{resource_id}/reject")
def reject_content(resource_id: str) -> Dict[str, Any]:
    return update_content(resource_id, ResourceUpdate(status="rejected"))


@router.get("/pending")
def list_pending(limit: int = Query(50, ge=1, le=500)) -> List[Dict[str, Any]]:
    """
    List resources whose status is 'pending'.
    """
    return list_content(status="pending", limit=limit)




