import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal, Base, engine
from app.models.models import CreatorProfile, Brief
from app.services.matching import evaluate_creator_fit

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_seeded_creators_count():
    response = client.get("/api/v1/creators")
    assert response.status_code == 200
    creators = response.json()
    assert len(creators) >= 10, f"Expected at least 10 seeded creators, got {len(creators)}"

def test_creator_filters():
    # Test filtering by specialization
    response = client.get("/api/v1/creators?specialization=AI+Filmmaking")
    assert response.status_code == 200
    filmmakers = response.json()
    assert len(filmmakers) > 0
    for c in filmmakers:
        assert any("filmmaking" in s.lower() for s in c["specializations"])

    # Test filtering by aspect ratio
    response_916 = client.get("/api/v1/creators?aspect_ratio=9:16")
    assert response_916.status_code == 200
    assert len(response_916.json()) > 0

def test_brief_structure_endpoint():
    payload = {
        "raw_idea": "Ultra high-speed commercial video of a luxury electric sports car at night in rain with neon reflections",
        "preferred_format": "16:9"
    }
    response = client.post("/api/v1/briefs/structure", json=payload)
    assert response.status_code == 200
    draft = response.json()
    assert "video" in draft["content_type"]
    assert draft["aspect_ratio"] == "16:9"
    assert "needs_confirmation_fields" in draft
    assert len(draft["integrity_warnings"]) > 0

def test_deterministic_matching_engine():
    # Fetch sample automotive brief
    briefs_res = client.get("/api/v1/briefs")
    assert briefs_res.status_code == 200
    briefs = briefs_res.json()
    assert len(briefs) > 0
    auto_brief_id = briefs[0]["id"]

    match_res = client.post(f"/api/v1/briefs/{auto_brief_id}/matches")
    assert match_res.status_code == 200
    matches = match_res.json()
    assert len(matches) > 0

    top_match = matches[0]
    assert "score" in top_match
    assert "breakdown" in top_match
    assert top_match["score"] <= 100.0
    assert top_match["score"] >= 0.0
    assert "skill_match" in top_match["breakdown"]
    assert "portfolio_relevance" in top_match["breakdown"]
    assert "format_compatibility" in top_match["breakdown"]
    assert "tool_compatibility" in top_match["breakdown"]
    assert len(top_match["match_explanations"]) > 0

def test_mandatory_violations_flagging():
    # Check that booked creator or over-budget creator is flagged
    briefs_res = client.get("/api/v1/briefs")
    auto_brief_id = briefs_res.json()[0]["id"]

    match_res = client.post(f"/api/v1/briefs/{auto_brief_id}/matches")
    matches = match_res.json()
    
    # Check that Valerie Sterling (booked and over-budget) has mandatory violation
    valerie_match = next((m for m in matches if "Valerie" in m["creator"]["display_name"]), None)
    if valerie_match:
        assert valerie_match["breakdown"]["mandatory_passed"] is False
        assert len(valerie_match["breakdown"]["mandatory_violations"]) > 0

def test_shortlist_lifecycle():
    creators_res = client.get("/api/v1/creators")
    creator_id = creators_res.json()[0]["id"]

    # Add to shortlist
    add_res = client.post("/api/v1/shortlist", json={"creator_id": creator_id, "notes": "Top candidate"})
    assert add_res.status_code == 200

    # Get shortlist
    get_res = client.get("/api/v1/shortlist")
    assert get_res.status_code == 200
    shortlist_items = get_res.json()
    assert any(item["creator_id"] == creator_id for item in shortlist_items)

    # Remove from shortlist
    del_res = client.delete(f"/api/v1/shortlist/creator/{creator_id}")
    assert del_res.status_code == 200
