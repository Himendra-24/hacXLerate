import json
import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
BASE_URL = "/api/v1"

def test_full_creator_organization_e2e_workflow_and_security():
    """
    Complete end-to-end simulation of UNFRAME marketplace:
    1. Organization Registration & Onboarding
    2. Creator Registration & Portfolio Upload
    3. Campaign Brief Creation
    4. 4-Factor Matching Engine Verification (0.4K + 0.3P + 0.2F + 0.1T)
    5. Organization Shortlists Creator
    6. Creator Brief Application
    7. Organization Application Review & Acceptance
    8. Bidirectional Direct Messaging between Brand & Creator
    9. Security Isolation & Role-based Access Control Boundaries (401/403)
    10. Data Persistence & Re-Authentication
    """
    # 1. REGISTER ORGANIZATION
    org_email = f"neovision_{uuid.uuid4().hex[:6]}@brand.com"
    org_reg_payload = {
        "email": org_email,
        "password": "Password123!",
        "display_name": "NeoVision Media Lead",
        "role": "brand",
        "company_name": "NeoVision Media Studios",
        "type": "brand",
        "industry": "Automotive & Entertainment",
        "website": "https://neovision.media",
        "description": "High-end commercial spec production house."
    }
    res = client.post(f"{BASE_URL}/auth/register", json=org_reg_payload)
    assert res.status_code == 201, f"Org reg failed: {res.text}"
    org_auth = res.json()
    org_token = org_auth["access_token"]
    org_id = org_auth["organization"]["id"]
    org_user_id = org_auth["user"]["id"]
    org_headers = {"Authorization": f"Bearer {org_token}"}
    assert org_auth["user"]["role"] == "brand"

    # 2. REGISTER CREATOR
    creator_email = f"aria_{uuid.uuid4().hex[:6]}@creators.com"
    creator_reg_payload = {
        "email": creator_email,
        "password": "Password123!",
        "display_name": "Aria Sterling",
        "role": "creator",
        "title": "Generative AI Filmmaker & Spec VFX Artist",
        "bio": "Directing next-generation cinematic videos using Runway Gen-3 and Topaz.",
        "location": "Tokyo / Remote",
        "specializations": ["AI Filmmaking", "Product CGI", "Automotive"],
        "skills": ["cinematic", "photorealistic", "cyberpunk", "automotive", "Prompt Engineering", "Camera Motion"],
        "tools": ["Runway Gen-3", "Midjourney v6", "Topaz Video AI"],
        "rate_min": 2500,
        "rate_max": 5000,
        "availability_status": "Available",
        "initial_project": {
            "title": "Cybernetic Drift 4K Spec",
            "description": "Autonomous hypercar drifting in rain-slicked Neo-Tokyo streets.",
            "media_url": "/uploads/0c5c6997-04f2-4f4a-adfc-0cafd07daa79.mp4",
            "content_type": "video",
            "specialization": "AI Filmmaking",
            "aspect_ratios": ["16:9", "9:16"],
            "commercial_use_status": "Commercial Rights Granted"
        }
    }
    res = client.post(f"{BASE_URL}/auth/register", json=creator_reg_payload)
    assert res.status_code == 201, f"Creator reg failed: {res.text}"
    creator_auth = res.json()
    creator_token = creator_auth["access_token"]
    creator_id = creator_auth["creator_profile"]["id"]
    creator_user_id = creator_auth["user"]["id"]
    creator_headers = {"Authorization": f"Bearer {creator_token}"}
    assert creator_auth["user"]["role"] == "creator"

    # 3. ORGANIZATION CREATES CAMPAIGN BRIEF
    brief_payload = {
        "title": "Hyper-Realistic Cyberpunk Supercar Spec",
        "objective": "High fidelity 20s cinematic video of electric supercar.",
        "description": "Macro lighting, reflection passes, neon night city, dynamic camera angles.",
        "content_type": "video",
        "style_tags": ["cinematic", "photorealistic", "cyberpunk", "automotive"],
        "aspect_ratio": "16:9",
        "duration": "15-30s",
        "resolution": "4K",
        "commercial_use_scope": "Full Commercial (Digital & Broadcast)",
        "budget_min": 3000.0,
        "budget_max": 6000.0,
        "status": "open",
        "visibility": "public"
    }
    res = client.post(f"{BASE_URL}/briefs", json=brief_payload, headers=org_headers)
    assert res.status_code == 200, f"Create brief failed: {res.text}"
    brief = res.json()
    brief_id = brief["id"]
    assert brief["organization_id"] == org_id

    # 4. CAMPAIGN-SPECIFIC MATCHING ENGINE EVALUATION
    res = client.post(f"{BASE_URL}/briefs/{brief_id}/matches")
    assert res.status_code == 200, f"Match failed: {res.text}"
    matches = res.json()
    aria_match = next((m for m in matches if m["creator"]["id"] == creator_id), None)
    assert aria_match is not None, "Aria Sterling must be in matching candidates"
    assert aria_match["score"] > 60.0
    bd = aria_match["breakdown"]
    assert "skill_match" in bd
    assert "portfolio_relevance" in bd
    assert "format_compatibility" in bd
    assert "tool_compatibility" in bd
    assert bd["mandatory_passed"] is True

    # 5. ORGANIZATION SHORTLISTS CREATOR
    res = client.post(
        f"{BASE_URL}/shortlist",
        json={"creator_id": creator_id, "brief_id": brief_id, "notes": "Top candidate for Cyberpunk Supercar"},
        headers=org_headers
    )
    assert res.status_code == 200, f"Shortlist failed: {res.text}"
    shortlist_item = res.json()
    assert shortlist_item["creator_id"] == creator_id

    res = client.get(f"{BASE_URL}/shortlist?brief_id={brief_id}", headers=org_headers)
    assert res.status_code == 200
    assert any(s["creator_id"] == creator_id for s in res.json())

    # 6. CREATOR APPLIES TO THE OPEN BRIEF
    app_payload = {
        "pitch": "I specialize in photoreal cyberpunk car aesthetics using Runway Gen-3 and custom camera motion prompts.",
        "proposed_rate": 4500.0,
        "portfolio_sample_urls": ["/uploads/0c5c6997-04f2-4f4a-adfc-0cafd07daa79.mp4"]
    }
    res = client.post(f"{BASE_URL}/briefs/{brief_id}/apply", json=app_payload, headers=creator_headers)
    assert res.status_code == 200, f"Apply failed: {res.text}"
    application = res.json()
    app_id = application["id"]
    assert application["status"] == "pending"

    # Verify creator sees their application
    res = client.get(f"{BASE_URL}/briefs/my-applications/all", headers=creator_headers)
    assert res.status_code == 200
    assert any(a["id"] == app_id for a in res.json())

    # 7. ORGANIZATION REVIEWS AND ACCEPTS APPLICATION
    res = client.get(f"{BASE_URL}/briefs/{brief_id}/applications", headers=org_headers)
    assert res.status_code == 200
    assert any(a["id"] == app_id for a in res.json())

    res = client.patch(f"{BASE_URL}/briefs/applications/{app_id}", json={"status": "accepted"}, headers=org_headers)
    assert res.status_code == 200
    assert res.json()["status"] == "accepted"

    # 8. DIRECT MESSAGING WORKFLOW
    msg_1_payload = {
        "sender_id": org_user_id,
        "sender_name": "NeoVision Media Lead",
        "sender_role": "brand",
        "recipient_id": creator_user_id,
        "recipient_name": "Aria Sterling",
        "content": "Hi Aria, we loved your Cybernetic Drift spec. Your application has been accepted!"
    }
    res = client.post(f"{BASE_URL}/messages", json=msg_1_payload, headers=org_headers)
    assert res.status_code == 200, f"Message 1 failed: {res.text}"

    # Creator receives message and replies
    res = client.get(f"{BASE_URL}/messages/conversation/{org_user_id}", headers=creator_headers)
    assert res.status_code == 200
    conv = res.json()
    assert len(conv) >= 1
    assert any(m["content"] == msg_1_payload["content"] for m in conv)

    msg_2_payload = {
        "sender_id": creator_user_id,
        "sender_name": "Aria Sterling",
        "sender_role": "creator",
        "recipient_id": org_user_id,
        "recipient_name": "NeoVision Media Lead",
        "content": "Thank you! I am thrilled to collaborate on this."
    }
    res = client.post(f"{BASE_URL}/messages", json=msg_2_payload, headers=creator_headers)
    assert res.status_code == 200

    res = client.get(f"{BASE_URL}/messages/conversation/{creator_user_id}", headers=org_headers)
    assert res.status_code == 200
    assert len(res.json()) >= 2

    # 9. SECURITY & AUTHORIZATION ISOLATION CHECKS
    # (a) Unauthenticated visitor cannot access private shortlist
    assert client.get(f"{BASE_URL}/shortlist").status_code == 401

    # (b) Creator cannot access brand shortlist
    assert client.get(f"{BASE_URL}/shortlist", headers=creator_headers).status_code == 403

    # (c) Creator cannot modify organization profile
    assert client.patch(f"{BASE_URL}/organizations/{org_id}", json={"company_name": "Hacked"}, headers=creator_headers).status_code == 403

    # (d) Brand cannot modify creator profile
    assert client.patch(f"{BASE_URL}/creators/{creator_id}", json={"title": "Hacked Title"}, headers=org_headers).status_code == 403

    # (e) Brand cannot apply to brief
    assert client.post(f"{BASE_URL}/briefs/{brief_id}/apply", json={"pitch": "Imposter"}, headers=org_headers).status_code == 403

    # (f) Unauthenticated visitor cannot view private/draft briefs or applications
    assert client.get(f"{BASE_URL}/briefs/{brief_id}/applications").status_code == 401

    # 10. DATA PERSISTENCE & SESSION STATE VERIFICATION
    # Re-login with credentials to verify password hashing and persistent record storage
    login_res = client.post(f"{BASE_URL}/auth/login", json={"email": org_email, "password": "Password123!"})
    assert login_res.status_code == 200
    assert login_res.json()["user"]["email"] == org_email

    login_res_c = client.post(f"{BASE_URL}/auth/login", json={"email": creator_email, "password": "Password123!"})
    assert login_res_c.status_code == 200
    assert login_res_c.json()["user"]["email"] == creator_email
