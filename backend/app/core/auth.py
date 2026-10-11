from typing import Optional, List
from fastapi import Depends, HTTPException, Header, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.models import User

security_scheme = HTTPBearer(auto_error=False)

def get_current_user(
    auth_creds: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Extracts the authenticated user strictly from the Authorization Bearer JWT token.
    No unauthenticated or header-spoofing demo user fallbacks.
    """
    if auth_creds and auth_creds.credentials:
        payload = decode_access_token(auth_creds.credentials)
        if payload and "sub" in payload:
            user_id = payload["sub"]
            user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
            if user:
                return user

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
