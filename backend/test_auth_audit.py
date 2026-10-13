import pytest
import datetime
import jwt
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.core.security import SECRET_KEY, ALGORITHM, create_access_token
from app.models.models import User, CreatorProfile, Brand

client = TestClient(app)

def test_valid_existing_user():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.is_active == True).first()
        assert user is not None, "A seeded active user must exist"
        
        token = create_access_token({"sub": user.id, "role": user.role, "email": user.email})
        response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        data = response.json()
        assert data["user"]["id"] == user.id
        assert data["user"]["email"] == user.email
        assert data["user"]["role"] == user.role
    finally:
        db.close()

def test_invalid_jwt_signature():
    bogus_token = jwt.encode(
        {"sub": "fake-user-id", "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)},
        "wrong-secret-key-1234567890",
        algorithm=ALGORITHM
    )
    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {bogus_token}"})
    assert response.status_code == 401
    assert "Authentication required" in response.json()["detail"]

def test_expired_jwt_token():
    expired_token = jwt.encode(
        {"sub": "fake-user-id", "exp": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=1)},
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {expired_token}"})
    assert response.status_code == 401
    assert "Authentication required" in response.json()["detail"]

def test_missing_or_empty_sub_claim():
    # Empty string sub
    empty_sub_token = jwt.encode(
        {"sub": "", "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)},
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    res1 = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {empty_sub_token}"})
    assert res1.status_code == 401

    # Missing sub claim entirely
    no_sub_token = jwt.encode(
        {"role": "creator", "email": "nosub@unframe.ai", "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)},
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    res2 = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {no_sub_token}"})
    assert res2.status_code == 401

def test_role_escalation_to_admin_prevented():
    malicious_admin_token = jwt.encode(
        {
            "sub": "attacker-admin-id-999",
            "role": "admin",
            "email": "attacker_admin@unframe.ai",
            "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)
        },
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {malicious_admin_token}"})
    # Should NOT succeed in becoming an admin
    db = SessionLocal()
    try:
        created_user = db.query(User).filter(User.id == "attacker-admin-id-999").first()
        assert created_user is None or created_user.role != "admin", "Admin role must NOT be created from claims"
    finally:
        db.close()

def test_account_collision_and_hijacking_prevented():
    db = SessionLocal()
    try:
        victim = db.query(User).filter(User.is_active == True).first()
        assert victim is not None
        
        # Token with a DIFFERENT sub but matching the victim's email
        spoofed_token = jwt.encode(
            {
                "sub": "imposter-id-888",
                "email": victim.email,
                "role": "creator",
                "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)
            },
            SECRET_KEY,
            algorithm=ALGORITHM
        )
        response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {spoofed_token}"})
        # If response succeeds, it must NOT return the victim's user ID!
        if response.status_code == 200:
            assert response.json()["user"]["id"] != victim.id, "Token with mismatched sub must not authenticate as victim"
        else:
            assert response.status_code == 401
    finally:
        db.close()

def test_safe_serverless_rehydration_idempotency():
    new_creator_id = "test-rehydrated-creator-777"
    valid_token = jwt.encode(
        {
            "sub": new_creator_id,
            "role": "creator",
            "email": "rehydrated_creator_777@example.com",
            "display_name": "Rehydrated Creator",
            "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)
        },
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    # First call - rehydrates user
    res1 = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {valid_token}"})
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["user"]["id"] == new_creator_id
    assert data1["user"]["role"] == "creator"
    assert data1["creator_profile"] is not None

    # Second call - idempotent reuse
    res2 = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {valid_token}"})
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["user"]["id"] == new_creator_id

    # Clean up
    db = SessionLocal()
    try:
        db.query(CreatorProfile).filter(CreatorProfile.user_id == new_creator_id).delete()
        db.query(User).filter(User.id == new_creator_id).delete()
        db.commit()
    finally:
        db.close()
