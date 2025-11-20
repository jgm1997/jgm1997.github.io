import jwt
from typing import Optional
from fastapi import APIRouter, HTTPException, Header, status

from app.models.webhook import WebhookPayload
from app.core.config import settings
from app.core.events import handle_event

router = APIRouter()


@router.post("/webhook/tasks")
async def tasks_webhook(
    payload: WebhookPayload, authorization: Optional[str] = Header(default=None)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authentication header.",
        )

    token = authorization.split(" ")[1]
    try:
        jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGROITHM])
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token.")
    
    if payload.table != "tasks":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid table.")
    
    handle_event(payload)
    return {"ok": True}