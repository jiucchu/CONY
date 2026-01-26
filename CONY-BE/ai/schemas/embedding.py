from pydantic import BaseModel, Field

class Request(BaseModel):
    sale_id: int
    content_text: str

class Response(BaseModel):
    status: str
    message: str