from typing import Optional, List
from fastapi import Depends, HTTPException, Header, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.models import User, CreatorProfile, Brand

security_scheme = HTTPBearer(auto_error=False)

def get_current_user(
    auth_creds: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Extracts the authenticated user strictly from the Authorization Bearer JWT token.
    Supports resilient serverless container state synchronization.
    """
    if auth_creds and auth_creds.credentials:
        payload = decode_access_token(auth_creds.credentials)
        if payload and isinstance(payload, dict):
            user_id = payload.get("sub")
            if not user_id or not isinstance(user_id, str) or not user_id.strip():
                return None
            user_id = user_id.strip()

            user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
            if user:
                return user

            # Valid cryptographically signed JWT token, but user not in this container's SQLite instance:
            try:
                raw_role = payload.get("role")
                # SECURITY RULE: Only standard self-service roles can be re-hydrated.
                # Role escalation to 'admin' via token claim is strictly rejected.
                if raw_role not in ("creator", "brand"):
                    return None
                user_role = raw_role

                user_email = (payload.get("email") or "").strip().lower()
                if not user_email or "@" not in user_email:
                    user_email = f"{user_id}@unframe.ai"

                user_name = (payload.get("display_name") or "").strip() or user_email.split("@")[0].title()

                # Check if email is already bound to a user
                existing = db.query(User).filter(User.email == user_email).first()
                if existing:
                    # If the existing user has a different id, reject to prevent account hijacking
                    if existing.id != user_id:
                        return None
                    return existing

                new_user = User(
                    id=user_id,
                    email=user_email,
                    display_name=user_name,
                    password_hash="",
                    role=user_role,
                    is_active=True,
                    onboarding_completed=True
                )
                db.add(new_user)
                db.flush()

                # Provision role relationships safely and idempotently
                if user_role == "creator":
                    existing_creator = db.query(CreatorProfile).filter(CreatorProfile.user_id == new_user.id).first()
                    if not existing_creator:
                        creator = CreatorProfile(
                            user_id=new_user.id,
                            display_name=new_user.display_name,
                            title="AI Creator",
                            bio="",
                            specializations=[],
                            skills=[],
                            tools=[],
                            rate_min=1500,
                            rate_max=3500,
                            rating_avg=5.0,
                            reviews_count=0
                        )
                        db.add(creator)
                elif user_role == "brand":
                    existing_brand = db.query(Brand).filter(Brand.owner_user_id == new_user.id).first()
                    if not existing_brand:
                        brand = Brand(
                            owner_user_id=new_user.id,
                            company_name=f"{new_user.display_name}'s Studio",
                            type="brand",
                            verified=True
                        )
                        db.add(brand)

                db.commit()
                db.refresh(new_user)
                return new_user
            except Exception as e:
                db.rollback()
                print(f"[Auth] Notice re-hydrating user: {e}")

    return None

def require_current_user(
    user: Optional[User] = Depends(get_current_user)
) -> User:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

def require_role(allowed_roles: List[str] | str):
    if isinstance(allowed_roles, str):
        allowed_roles = [allowed_roles]

    def role_checker(user: User = Depends(require_current_user)) -> User:
        if user.role not in allowed_roles and user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of {allowed_roles} role, got '{user.role}'."
            )
        return user

    return role_checker
