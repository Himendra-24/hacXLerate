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

def test_messages_threads_and_sending():
    # Test getting threads
    threads_res = client.get("/api/v1/messages/threads?current_user_id=brand_demo_user")
    assert threads_res.status_code == 200
    threads = threads_res.json()
    assert len(threads) > 0

    partner_id = threads[0]["partner_id"]
    conv_res = client.get(f"/api/v1/messages/conversation/{partner_id}?current_user_id=brand_demo_user")
    assert conv_res.status_code == 200
    assert len(conv_res.json()) > 0

    # Test sending a message
    send_payload = {
        "sender_id": "brand_demo_user",
        "sender_name": "Brand Test Lead",
        "sender_role": "brand",
        "recipient_id": partner_id,
        "recipient_name": threads[0]["partner_name"],
        "content": "Automated unit test message verification."
    }
    post_res = client.post("/api/v1/messages", json=send_payload)
    assert post_res.status_code == 200
    msg = post_res.json()
    assert msg["content"] == send_payload["content"]

def test_reviews_lifecycle():
    creators_res = client.get("/api/v1/creators")
    creator_id = creators_res.json()[0]["id"]

    # Get reviews
    reviews_res = client.get(f"/api/v1/reviews/creator/{creator_id}")
    assert reviews_res.status_code == 200

    # Submit review
    review_payload = {
        "creator_id": creator_id,
        "brand_name": "Test Brand Co",
        "rating": 5.0,
        "delivery_speed_rating": 5.0,
        "workflow_transparency_rating": 5.0,
        "communication_rating": 5.0,
        "comment": "Outstanding speed and quality in automated test.",
        "project_title": "Test Commercial Ad"
    }
    create_res = client.post("/api/v1/reviews", json=review_payload)
    assert create_res.status_code == 200
    assert create_res.json()["rating"] == 5.0

def test_asset_upload():
    import io
    test_file_content = b"Mock AI Video File or ComfyUI Workflow JSON content"
    files = {"file": ("test_render.mp4", io.BytesIO(test_file_content), "video/mp4")}
    data = {"uploader_role": "creator", "file_type": "video"}

    upload_res = client.post("/api/v1/uploads", files=files, data=data)
    assert upload_res.status_code == 200
    res_data = upload_res.json()
    assert res_data["original_filename"] == "test_render.mp4"
    assert "/uploads/" in res_data["url"]

