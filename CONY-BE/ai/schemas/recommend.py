from enum import Enum
from typing import List
from pydantic import BaseModel, Field

class EventType(str, Enum):
    CLICK = "CLICK"
    PURCHASE = "PURCHASE"

class RecentInteraction(BaseModel):
    sale_id: int = Field(..., ge=1)
    event_type: EventType

class ResponseData(BaseModel):
    limit: int
    items: List[int]

class Response(BaseModel):
    status: str
    message: str
    data: ResponseData | None
