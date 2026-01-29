from enum import Enum
from pydantic import BaseModel

class SaleStatus(str, Enum):
    ON_SALE = "ON_SALE"
    PENDING = "PENDING"
    SOLD_OUT = "SOLD_OUT"

class UpsertRequest(BaseModel):
    content_text: str
    sale_status: SaleStatus = SaleStatus.ON_SALE

class StatusUpdateRequest(BaseModel):
    sale_status: SaleStatus

class Response(BaseModel):
    status: str
    message: str
