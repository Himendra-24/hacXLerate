from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc
import datetime

from app.core.database import get_db
from app.core.auth import get_current_user, require_current_user
from app.models.models import Message, User
from app.schemas.schemas import MessageCreate, MessageResponse, MessageThreadSummary

router = APIRouter(prefix="/messages", tags=["Messaging & Collaboration"])


@router.get("/threads", response_model=List[MessageThreadSummary])
def get_message_threads(
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all active conversation threads for the current authenticated user.
    """
    auth_id = current_user.id

    all_msgs = (
        db.query(Message)
        .filter(or_(Message.sender_id == auth_id, Message.recipient_id == auth_id))
        .order_by(desc(Message.created_at))
        .all()
    )

    threads_dict = {}
    for m in all_msgs:
        is_sender = (m.sender_id == auth_id)
        partner_id = m.recipient_id if is_sender else m.sender_id
        partner_name = m.recipient_name if is_sender else m.sender_name
        partner_role = m.recipient_name if is_sender else m.sender_name

        if partner_id not in threads_dict:
            unread = 1 if (not is_sender and not m.is_read) else 0
            threads_dict[partner_id] = {
                "partner_id": partner_id,
                "partner_name": partner_name,
                "partner_role": "creator" if m.sender_role == "brand" else "brand",
                "last_message": m.content,
                "last_message_at": m.created_at,
                "unread_count": unread,
                "engagement_id": m.engagement_id
            }
        else:
            if not is_sender and not m.is_read:
                threads_dict[partner_id]["unread_count"] += 1

    return list(threads_dict.values())


@router.get("/conversation/{partner_id}", response_model=List[MessageResponse])
def get_conversation(
    partner_id: str,
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    """
    Get message history between current user and a creator/brand partner.
    """
    auth_id = current_user.id

    messages = (
        db.query(Message)
        .filter(
            or_(
                and_(Message.sender_id == auth_id, Message.recipient_id == partner_id),
                and_(Message.sender_id == partner_id, Message.recipient_id == auth_id)
            )
        )
        .order_by(Message.created_at.asc())
        .all()
    )
    return messages


@router.get("/engagement/{engagement_id}", response_model=List[MessageResponse])
def get_engagement_messages(
    engagement_id: str,
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all messages linked to a specific engagement. User must be authenticated.
    """
    messages = (
        db.query(Message)
        .filter(Message.engagement_id == engagement_id)
        .order_by(Message.created_at.asc())
        .all()
    )
    return messages


@router.post("", response_model=MessageResponse)
def send_message(
    msg_in: MessageCreate,
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a direct message or project-linked message.
    Sender ID is always overridden with the authenticated user's ID.
    """
    auth_id = current_user.id

    new_msg = Message(
        engagement_id=msg_in.engagement_id,
        sender_id=auth_id,
        sender_name=msg_in.sender_name if msg_in.sender_name else current_user.display_name,
        sender_role=msg_in.sender_role,
        recipient_id=msg_in.recipient_id,
        recipient_name=msg_in.recipient_name,
        content=msg_in.content,
        attachment_url=msg_in.attachment_url,
        attachment_name=msg_in.attachment_name,
        is_read=False,
        created_at=datetime.datetime.now(datetime.timezone.utc)
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)
    return new_msg


@router.patch("/{message_id}/read", response_model=MessageResponse)
def mark_message_as_read(
    message_id: str,
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    # Only recipient can mark as read
    if msg.recipient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the recipient can mark a message as read")
    msg.is_read = True
    db.commit()
    db.refresh(msg)
    return msg


@router.post("/mark-thread-read/{partner_id}")
def mark_thread_read(
    partner_id: str,
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    auth_id = current_user.id
    db.query(Message).filter(
        and_(Message.sender_id == partner_id, Message.recipient_id == auth_id)
    ).update({Message.is_read: True})
    db.commit()
    return {"status": "ok"}
