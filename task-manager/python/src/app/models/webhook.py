from typing import Optional
from pydantic import BaseModel


class WebhookPayload(BaseModel):
    type: str
    table: str
    record: Optional[dict] = None
    old_record: Optional[dict] = None