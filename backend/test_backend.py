import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal, Base, engine
from app.models.models import CreatorProfile, Brief, PortfolioProject, User, Brand
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

def get_auth_token_for(role: str = "brand", email_prefix: str = "test"):
    uid = str(uuid.uuid4())[:8]
    email = f"{email_prefix}_{uid}@{role}.com"
    reg_payload = {
        "email": email,
        "password": "securepassword123",
        "display_name": f"Test {role.title()} User {uid}",
        "role": role,
    }
    if role == "brand":
        reg_payload["company_name"] = f"Test Brand Studio {uid}"
    else:
        reg_payload["title"] = "Generative AI Specialist"
    resp = client.post("/api/v1/auth/register", json=reg_payload)
    assert resp.status_code == 201, f"Failed to register test user: {resp.text}"
    data = resp.json()
    return data["access_token"], data["user"], data.get("creator_profile"), data.get("organization")

def test_shortlist_lifecycle():
    token, user, _, _ = get_auth_token_for("brand", "shortlist_user")
    headers = {"Authorization": f"Bearer {token}"}
    creators_res = client.get("/api/v1/creators")
    creator_id = creators_res.json()[0]["id"]

    # Add to shortlist
    add_res = client.post("/api/v1/shortlist", json={"creator_id": creator_id, "notes": "Top candidate"}, headers=headers)
    assert add_res.status_code == 200

    # Get shortlist
    get_res = client.get("/api/v1/shortlist", headers=headers)
    assert get_res.status_code == 200
    shortlist_items = get_res.json()
    assert any(item["creator_id"] == creator_id for item in shortlist_items)

    # Remove from shortlist
    del_res = client.delete(f"/api/v1/shortlist/creator/{creator_id}", headers=headers)
    assert del_res.status_code == 200

def test_messages_threads_and_sending():
    b_token, b_user, _, _ = get_auth_token_for("brand", "brand_msg")
    c_token, c_user, _, _ = get_auth_token_for("creator", "creator_msg")
    b_headers = {"Authorization": f"Bearer {b_token}"}
    c_headers = {"Authorization": f"Bearer {c_token}"}

    # Brand sends message
    send_payload = {
        "sender_id": b_user["id"],
        "sender_name": b_user["display_name"],
        "sender_role": "brand",
        "recipient_id": c_user["id"],
        "recipient_name": c_user["display_name"],
        "content": "Automated unit test message verification."
    }
    post_res = client.post("/api/v1/messages", json=send_payload, headers=b_headers)
    assert post_res.status_code == 200
    msg = post_res.json()
    assert msg["content"] == send_payload["content"]

    # Creator gets threads
    threads_res = client.get("/api/v1/messages/threads", headers=c_headers)
    assert threads_res.status_code == 200
    threads = threads_res.json()
    assert len(threads) > 0
    assert any(t["partner_id"] == b_user["id"] for t in threads)

    # Creator gets conversation
    conv_res = client.get(f"/api/v1/messages/conversation/{b_user['id']}", headers=c_headers)
    assert conv_res.status_code == 200
    assert len(conv_res.json()) > 0

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


def test_public_cannot_see_draft_briefs():
    # 1. Create a draft brief using authenticated brand owner
    b_token, b_user, _, _ = get_auth_token_for("brand", "draft_owner")
    b_headers = {"Authorization": f"Bearer {b_token}"}

    draft_payload = {
        "title": "Secret Steal-Proof AI Drone Campaign (Draft)",
        "objective": "Confidential internal objective",
        "description": "Internal test draft brief not yet ready for public release",
        "content_type": "video",
        "aspect_ratio": "16:9",
        "status": "draft",
        "visibility": "private",
    }
    create_res = client.post("/api/v1/briefs", json=draft_payload, headers=b_headers)
    assert create_res.status_code == 200
    draft_id = create_res.json()["id"]

    # 2. Public open briefs board MUST NOT include draft briefs
    open_res = client.get("/api/v1/briefs/open")
    assert open_res.status_code == 200
    open_briefs = open_res.json()
    assert all(b["id"] != draft_id for b in open_briefs)
    assert all(b["status"] == "open" for b in open_briefs)

    # 3. Public unauthenticated access directly to the draft brief is rejected (403 Forbidden)
    pub_detail_res = client.get(f"/api/v1/briefs/{draft_id}")
    assert pub_detail_res.status_code == 403

    # 4. Another unauthorized user cannot view the draft
    other_token, _, _, _ = get_auth_token_for("brand", "other_brand")
    other_user_res = client.get(f"/api/v1/briefs/{draft_id}", headers={"Authorization": f"Bearer {other_token}"})
    assert other_user_res.status_code == 403

    # 5. Brief owner CAN view their draft
    owner_res = client.get(f"/api/v1/briefs/{draft_id}", headers=b_headers)
    assert owner_res.status_code == 200
    assert owner_res.json()["id"] == draft_id


def test_only_creators_can_apply_to_brief():
    b_token, b_user, _, _ = get_auth_token_for("brand", "brief_owner")
    c_token, c_user, c_profile, _ = get_auth_token_for("creator", "applicant_creator")
    b_headers = {"Authorization": f"Bearer {b_token}"}
    c_headers = {"Authorization": f"Bearer {c_token}"}

    # 1. Create an open brief
    open_res = client.post("/api/v1/briefs", json={
        "title": "Open Creator Brief",
        "objective": "Objective",
        "description": "Description",
        "content_type": "video",
        "aspect_ratio": "16:9",
        "status": "open"
    }, headers=b_headers)
    assert open_res.status_code == 200
    brief_id = open_res.json()["id"]

    # 2. Brand role cannot apply -> 403 Forbidden
    brand_apply_payload = {
        "pitch": "Brand trying to pitch own brief erroneously",
        "proposed_rate": 2000.0,
        "portfolio_sample_urls": []
    }
    unauth_res = client.post(
        f"/api/v1/briefs/{brief_id}/apply",
        json=brand_apply_payload,
        headers=b_headers
    )
    assert unauth_res.status_code == 403

    # 3. Legitimate creator can apply -> 200 OK
    creator_apply_payload = {
        "pitch": "Automated test application: Runway Gen-3 photorealism with 4K color grade.",
        "proposed_rate": 2800.0,
        "portfolio_sample_urls": ["https://images.unsplash.com/photo-1617814076367-b759c7d7e738"]
    }
    apply_res = client.post(
        f"/api/v1/briefs/{brief_id}/apply",
        json=creator_apply_payload,
        headers=c_headers
    )
    assert apply_res.status_code == 200
    app_data = apply_res.json()
    assert app_data["status"] == "pending"

    # 4. Application is available to brand in applications review
    apps_res = client.get(f"/api/v1/briefs/{brief_id}/applications", headers=b_headers)
    assert apps_res.status_code == 200
    apps_list = apps_res.json()
    assert any(a["id"] == app_data["id"] for a in apps_list)


def test_only_owner_edits_organization():
    b1_token, b1_user, _, b1_org = get_auth_token_for("brand", "org_owner_1")
    b2_token, b2_user, _, b2_org = get_auth_token_for("brand", "org_owner_2")

    b1_headers = {"Authorization": f"Bearer {b1_token}"}
    b2_headers = {"Authorization": f"Bearer {b2_token}"}
    org_id = b1_org["id"]

    # 1. Non-owner attempting to edit -> 403 Forbidden
    hack_res = client.patch(
        f"/api/v1/organizations/{org_id}",
        json={"description": "Unauthorized defacement attempt"},
        headers=b2_headers
    )
    assert hack_res.status_code == 403

    # 2. Unauthenticated request -> 401 Unauthorized
    no_auth_res = client.patch(
        f"/api/v1/organizations/{org_id}",
        json={"description": "Anonymous edit"}
    )
    assert no_auth_res.status_code == 401

    # 3. Valid owner edits organization profile -> 200 OK
    valid_update_payload = {
        "description": "Verified high-growth studio scaling generative commercial film pipelines.",
        "website": "https://updated-brand-domain.io"
    }
    edit_res = client.patch(
        f"/api/v1/organizations/{org_id}",
        json=valid_update_payload,
        headers=b1_headers
    )
    assert edit_res.status_code == 200
    updated_org = edit_res.json()
    assert updated_org["description"] == valid_update_payload["description"]
    assert updated_org["website"] == valid_update_payload["website"]


def test_auth_creator_registration_and_jwt():
    db = SessionLocal()
    user_id = None
    try:
        # 1. Register a new creator
        email = f"creator_{uuid.uuid4().hex[:6]}@unframe.ai"
        reg_payload = {
            "email": email,
            "password": "securepassword123",
            "display_name": "Test Reg Creator",
            "role": "creator",
            "title": "Lead Generative Lighting Artist"
        }
        reg_res = client.post("/api/v1/auth/register", json=reg_payload)
        assert reg_res.status_code == 201
        auth_data = reg_res.json()
        assert "access_token" in auth_data
        assert auth_data["user"]["email"] == email
        assert auth_data["user"]["role"] == "creator"
        assert auth_data["creator_profile"] is not None
        assert auth_data["creator_profile"]["display_name"] == "Test Reg Creator"
        token = auth_data["access_token"]
        user_id = auth_data["user"]["id"]

        # 2. Access /auth/me with Bearer token
        me_res = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert me_res.status_code == 200
        me_data = me_res.json()
        assert me_data["user"]["email"] == email

        # 3. Log in with the registered credentials
        login_res = client.post("/api/v1/auth/login", json={
            "email": email,
            "password": "securepassword123"
        })
        assert login_res.status_code == 200
        assert "access_token" in login_res.json()

        # 4. Fail login with bad password
        bad_login = client.post("/api/v1/auth/login", json={
            "email": email,
            "password": "wrongpassword"
        })
        assert bad_login.status_code == 401
    finally:
        if user_id:
            db.query(CreatorProfile).filter(CreatorProfile.user_id == user_id).delete(synchronize_session=False)
            db.query(User).filter(User.id == user_id).delete(synchronize_session=False)
            db.commit()
        db.close()


def test_auth_brand_registration_and_onboarding():
    db = SessionLocal()
    user_id = None
    try:
        # 1. Register a new brand
        email = f"brand_{uuid.uuid4().hex[:6]}@acme.com"
        reg_payload = {
            "email": email,
            "password": "brandsecretpass",
            "display_name": "Test Brand Lead",
            "role": "brand",
            "company_name": "Vance Creative Labs",
            "type": "agency",
            "industry": "Automotive & Luxury CGI"
        }
        reg_res = client.post("/api/v1/auth/register", json=reg_payload)
        assert reg_res.status_code == 201
        brand_auth = reg_res.json()
        assert brand_auth["organization"] is not None
        assert brand_auth["organization"]["company_name"] == "Vance Creative Labs"
        token = brand_auth["access_token"]
        user_id = brand_auth["user"]["id"]

        # 2. Progressive onboarding endpoint
        onboarding_payload = {
            "company_name": "Vance Creative Labs Global",
            "description": "Premier generative production agency delivering broadcast specs.",
            "website": "https://vancecreative.com"
        }
        onboard_res = client.post(
            "/api/v1/auth/onboarding",
            headers={"Authorization": f"Bearer {token}"},
            json=onboarding_payload
        )
        assert onboard_res.status_code == 200
        updated_auth = onboard_res.json()
        assert updated_auth["user"]["onboarding_completed"] is True
        assert updated_auth["organization"]["company_name"] == "Vance Creative Labs Global"
        assert updated_auth["organization"]["website"] == "https://vancecreative.com"
    finally:
        if user_id:
            db.query(Brand).filter(Brand.owner_user_id == user_id).delete(synchronize_session=False)
            db.query(User).filter(User.id == user_id).delete(synchronize_session=False)
            db.commit()
        db.close()


def test_creator_ownership_and_profile_permissions():
    """
    Verifies that:
    1. Unauthenticated requests to update creator or portfolio are rejected (401).
    2. Creator A cannot modify Creator B's profile (403 Forbidden).
    3. Creator A cannot add a portfolio project to Creator B's profile (403 Forbidden).
    4. Creator A cannot update or delete a portfolio project on Creator B's profile (403 Forbidden).
    5. Creator A CAN update their own profile and manage their own portfolio projects (200 OK).
    """
    db = SessionLocal()
    user_a_id = None
    user_b_id = None
    try:
        # Register Creator A
        email_a = f"creator_a_{uuid.uuid4().hex[:6]}@unframe.ai"
        res_a = client.post("/api/v1/auth/register", json={
            "email": email_a,
            "password": "password123",
            "display_name": "Alice Studio",
            "role": "creator",
            "title": "Director A"
        })
        assert res_a.status_code == 201
        data_a = res_a.json()
        token_a = data_a["access_token"]
        user_a_id = data_a["user"]["id"]
        creator_a_id = data_a["creator_profile"]["id"]

        # Register Creator B
        email_b = f"creator_b_{uuid.uuid4().hex[:6]}@unframe.ai"
        res_b = client.post("/api/v1/auth/register", json={
            "email": email_b,
            "password": "password123",
            "display_name": "Bob Studio",
            "role": "creator",
            "title": "Director B"
        })
        assert res_b.status_code == 201
        data_b = res_b.json()
        token_b = data_b["access_token"]
        user_b_id = data_b["user"]["id"]
        creator_b_id = data_b["creator_profile"]["id"]

        # 1. Unauthenticated update attempt on Creator B -> 401 Unauthorized
        unauth_res = client.patch(f"/api/v1/creators/{creator_b_id}", json={"bio": "Hacked unauthenticated"})
        assert unauth_res.status_code == 401

        # 2. Creator A tries to modify Creator B's profile -> 403 Forbidden
        hack_res = client.patch(
            f"/api/v1/creators/{creator_b_id}",
            headers={"Authorization": f"Bearer {token_a}"},
            json={"bio": "Compromised by Creator A"}
        )
        assert hack_res.status_code == 403
        assert "forbidden" in hack_res.json()["detail"].lower() or "permission" in hack_res.json()["detail"].lower()

        # 3. Creator A tries to add a project to Creator B's profile -> 403 Forbidden
        proj_payload = {
            "title": "Unauthorized Project",
            "description": "Should fail",
            "media_url": "https://example.com/video.mp4",
            "content_type": "video",
            "specialization": "AI Filmmaking"
        }
        hack_proj_res = client.post(
            f"/api/v1/creators/{creator_b_id}/portfolio",
            headers={"Authorization": f"Bearer {token_a}"},
            json=proj_payload
        )
        assert hack_proj_res.status_code == 403

        # 4. Creator B adds a project to their OWN profile -> 200 OK
        add_b_res = client.post(
            f"/api/v1/creators/{creator_b_id}/portfolio",
            headers={"Authorization": f"Bearer {token_b}"},
            json=proj_payload
        )
        assert add_b_res.status_code == 200
        proj_b_id = add_b_res.json()["id"]

        # 5. Creator A tries to update Creator B's project -> 403 Forbidden
        hack_patch_proj = client.patch(
            f"/api/v1/creators/{creator_b_id}/portfolio/{proj_b_id}",
            headers={"Authorization": f"Bearer {token_a}"},
            json={"title": "Hacked Title"}
        )
        assert hack_patch_proj.status_code == 403

        # 6. Creator A tries to delete Creator B's project -> 403 Forbidden
        hack_del_proj = client.delete(
            f"/api/v1/creators/{creator_b_id}/portfolio/{proj_b_id}",
            headers={"Authorization": f"Bearer {token_a}"}
        )
        assert hack_del_proj.status_code == 403

        # 7. Creator A updates their OWN profile -> 200 OK
        legit_update = client.patch(
            f"/api/v1/creators/{creator_a_id}",
            headers={"Authorization": f"Bearer {token_a}"},
            json={"bio": "Legitimate bio updated by Alice"}
        )
        assert legit_update.status_code == 200
        assert legit_update.json()["bio"] == "Legitimate bio updated by Alice"

        # 8. Creator B deletes their OWN project -> 200 OK
        legit_del = client.delete(
            f"/api/v1/creators/{creator_b_id}/portfolio/{proj_b_id}",
            headers={"Authorization": f"Bearer {token_b}"}
        )
        assert legit_del.status_code == 200

    finally:
        for uid in [user_a_id, user_b_id]:
            if uid:
                db.query(PortfolioProject).filter(
                    PortfolioProject.creator_id.in_(
                        db.query(CreatorProfile.id).filter(CreatorProfile.user_id == uid)
                    )
                ).delete(synchronize_session=False)
                db.query(CreatorProfile).filter(CreatorProfile.user_id == uid).delete(synchronize_session=False)
                db.query(User).filter(User.id == uid).delete(synchronize_session=False)
        db.commit()
        db.close()


def test_matching_exact_formula_and_bounds():
    brief = Brief(
        title="Nike GenAI Spec Spot",
        objective="Photorealistic running spot",
        description="High adrenaline generative commercial",
        content_type="video",
        style_tags=["cinematic", "photorealistic"],
        aspect_ratio="16:9",
        budget_max=5000.0
    )

    creator = CreatorProfile(
        display_name="Test Talent",
        title="AI Filmmaker",
        bio="Experienced director",
        skills=["cinematic", "photorealistic", "video"],
        tools=["Runway Gen-3", "Midjourney v6", "Topaz Video AI"],
        rate_min=3000.0,
        rate_max=4500.0,
        availability_status="Available",
        portfolio_projects=[
            PortfolioProject(
                title="Running Spec",
                description="Fast paced",
                media_url="https://images.unsplash.com/test.jpg",
                content_type="video",
                specialization="AI Filmmaking",
                aspect_ratios=["16:9"],
                skills_demonstrated=["cinematic", "photorealistic"],
                commercial_use_status="Commercial Rights Granted"
            )
        ]
    )

    result = evaluate_creator_fit(creator, brief)
    b = result.breakdown

    # 1. Bounds checks [0, 100]
    assert 0.0 <= b.skill_match <= 100.0
    assert 0.0 <= b.portfolio_relevance <= 100.0
    assert 0.0 <= b.format_compatibility <= 100.0
    assert 0.0 <= b.tool_compatibility <= 100.0
    assert 0.0 <= b.overall_score <= 100.0

    # 2. Formula verification: 0.40 * skill + 0.30 * portfolio + 0.20 * format + 0.10 * tool
    expected_score = round(
        (0.40 * b.skill_match) +
        (0.30 * b.portfolio_relevance) +
        (0.20 * b.format_compatibility) +
        (0.10 * b.tool_compatibility),
        1
    )
    assert abs(b.overall_score - expected_score) < 0.1
    assert b.mandatory_passed is True


def test_matching_missing_data_penalization():
    brief = Brief(
        title="Luxury Watch Commercial",
        objective="3D CGI product render",
        description="Detailed mechanical watch movement",
        content_type="cgi",
        style_tags=["luxury", "photorealistic", "macro"],
        aspect_ratio="9:16",
        budget_max=6000.0
    )

    # Empty creator: 0 skills, 0 tools, 0 portfolio projects
    empty_creator = CreatorProfile(
        display_name="Incomplete Profile Creator",
        title="Beginner",
        bio="",
        skills=[],
        tools=[],
        rate_min=2000.0,
        portfolio_projects=[]
    )

    result = evaluate_creator_fit(empty_creator, brief)
    b = result.breakdown

    # Missing items must be heavily penalized, not assumed to match
    assert b.skill_match == 0.0
    assert b.portfolio_relevance == 0.0
    assert b.format_compatibility == 0.0
    assert b.tool_compatibility == 0.0
    assert b.overall_score == 0.0
    assert len(result.missing_or_uncertain_requirements) > 0


def test_matching_mandatory_constraint_independent_of_high_score():
    # Campaign with tight budget cap of $1,500
    brief = Brief(
        title="Indie Studio Motion ID",
        objective="Micro budget indie motion id",
        description="10s logo reveal",
        content_type="video",
        style_tags=["cinematic"],
        aspect_ratio="16:9",
        budget_max=1500.0
    )

    # Top-tier creator with perfect match but rate_min = $8,000 (over budget)
    expensive_creator = CreatorProfile(
        display_name="Legendary Director",
        title="Award Winning Generative Director",
        bio="Elite commercial campaigns",
        skills=["cinematic", "video"],
        tools=["Runway Gen-3", "Midjourney v6", "ComfyUI"],
        rate_min=8000.0,
        availability_status="Available",
        portfolio_projects=[
            PortfolioProject(
                title="Superbowl AI Commercial",
                description="Broadcast grade",
                media_url="https://images.unsplash.com/superbowl.jpg",
                content_type="video",
                specialization="AI Filmmaking",
                aspect_ratios=["16:9"],
                skills_demonstrated=["cinematic"],
                commercial_use_status="Commercial Rights Granted"
            )
        ]
    )

    result = evaluate_creator_fit(expensive_creator, brief)
    b = result.breakdown

    # High score should NOT override failed mandatory constraint
    assert b.overall_score > 70.0
    assert b.mandatory_passed is False
    assert any("budget" in v.lower() or "rate" in v.lower() for v in b.mandatory_violations)


def test_creator_and_organization_auth_flows():
    # 1. Creator registration
    c_token, c_user, c_profile, _ = get_auth_token_for("creator", "flow_creator")
    assert c_user["role"] == "creator"
    assert c_profile is not None
    assert c_profile["user_id"] == c_user["id"]

    # 2. Organization registration
    b_token, b_user, _, b_org = get_auth_token_for("brand", "flow_org")
    assert b_user["role"] == "brand"
    assert b_org is not None
    assert b_org["owner_user_id"] == b_user["id"]

    # 3. Test /api/v1/auth/me for both
    me_c = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {c_token}"})
    assert me_c.status_code == 200
    assert me_c.json()["user"]["role"] == "creator"

    me_b = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {b_token}"})
    assert me_b.status_code == 200
    assert me_b.json()["user"]["role"] == "brand"


def test_unauthenticated_requests_are_rejected():
    # Attempting to access protected endpoints without token must return 401
    assert client.get("/api/v1/shortlist").status_code == 401
    assert client.post("/api/v1/shortlist", json={"creator_id": "any"}).status_code == 401
    assert client.get("/api/v1/messages/threads").status_code == 401
    assert client.post("/api/v1/briefs", json={"title": "Test"}).status_code == 401
    assert client.get("/api/v1/auth/me").status_code == 401


def test_role_based_access_control_enforcement():
    c_token, c_user, c_profile, _ = get_auth_token_for("creator", "rbac_creator")
    b_token, b_user, _, b_org = get_auth_token_for("brand", "rbac_brand")

    c_headers = {"Authorization": f"Bearer {c_token}"}
    b_headers = {"Authorization": f"Bearer {b_token}"}

    # 1. Creator cannot access brand-only shortlist (403 Forbidden)
    res = client.get("/api/v1/shortlist", headers=c_headers)
    assert res.status_code == 403

    # 2. Creator cannot create a campaign brief (403 Forbidden)
    res = client.post("/api/v1/briefs", json={
        "title": "Unauthorized Brief",
        "objective": "Testing",
        "description": "Testing",
        "content_type": "video",
        "aspect_ratio": "16:9"
    }, headers=c_headers)
    assert res.status_code == 403

    # 3. Brand cannot modify a creator profile (403 Forbidden)
    res = client.patch(f"/api/v1/creators/{c_profile['id']}", json={
        "title": "Hacked Title"
    }, headers=b_headers)
    assert res.status_code == 403

    # 4. Brand cannot apply to a brief (only creators can apply)
    brief_res = client.post("/api/v1/briefs", json={
        "title": "Open Spec Brief",
        "objective": "Objective",
        "description": "Description",
        "content_type": "video",
        "aspect_ratio": "16:9",
        "status": "open"
    }, headers=b_headers)
    assert brief_res.status_code == 200
    brief_id = brief_res.json()["id"]

    res = client.post(f"/api/v1/briefs/{brief_id}/apply", json={
        "pitch": "Brand trying to apply"
    }, headers=b_headers)
    assert res.status_code == 403


def test_organization_ownership_isolation():
    b1_token, b1_user, _, b1_org = get_auth_token_for("brand", "org1")
    b2_token, b2_user, _, b2_org = get_auth_token_for("brand", "org2")

    b1_headers = {"Authorization": f"Bearer {b1_token}"}
    b2_headers = {"Authorization": f"Bearer {b2_token}"}

    # Brand 2 cannot edit Brand 1's organization (403 Forbidden)
    res = client.patch(f"/api/v1/organizations/{b1_org['id']}", json={
        "company_name": "Hostile Takeover Studio"
    }, headers=b2_headers)
    assert res.status_code == 403

    # Brand 1 CAN edit their own organization
    res = client.patch(f"/api/v1/organizations/{b1_org['id']}", json={
        "company_name": "Updated Legitimate Studio"
    }, headers=b1_headers)
    assert res.status_code == 200
    assert res.json()["company_name"] == "Updated Legitimate Studio"


def test_creator_brief_application_and_brand_review_journey():
    b_token, b_user, _, b_org = get_auth_token_for("brand", "journey_brand")
    c_token, c_user, c_profile, _ = get_auth_token_for("creator", "journey_creator")

    b_headers = {"Authorization": f"Bearer {b_token}"}
    c_headers = {"Authorization": f"Bearer {c_token}"}

    # 1. Brand creates open brief
    brief_res = client.post("/api/v1/briefs", json={
        "title": "Cyberpunk Neon Spec Commercial",
        "objective": "High fidelity 15s commercial for smart eyewear",
        "description": "Macro lighting and fast camera motions",
        "content_type": "video",
        "aspect_ratio": "9:16",
        "budget_min": 2000.0,
        "budget_max": 4500.0,
        "status": "open"
    }, headers=b_headers)
    assert brief_res.status_code == 200
    brief_id = brief_res.json()["id"]

    # 2. Creator applies to the open brief
    apply_res = client.post(f"/api/v1/briefs/{brief_id}/apply", json={
        "pitch": "I specialize in cyberpunk aesthetics using Runway Gen-3 and Midjourney.",
        "proposed_rate": 3500.0
    }, headers=c_headers)
    assert apply_res.status_code == 200
    app_id = apply_res.json()["id"]
    assert apply_res.json()["status"] == "pending"

    # 3. Creator can see their application
    my_apps = client.get("/api/v1/briefs/my-applications/all", headers=c_headers)
    assert my_apps.status_code == 200
    assert any(a["id"] == app_id for a in my_apps.json())

    # 4. Brand reviews applications for the brief
    brand_apps = client.get(f"/api/v1/briefs/{brief_id}/applications", headers=b_headers)
    assert brand_apps.status_code == 200
    assert any(a["id"] == app_id for a in brand_apps.json())

    # 5. Brand updates application status to accepted
    status_res = client.patch(f"/api/v1/briefs/applications/{app_id}", json={
        "status": "accepted"
    }, headers=b_headers)
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "accepted"




