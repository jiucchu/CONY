from pydantic import BaseModel, Field

class OCRRequest(BaseModel):
    image_url: str
    image_type: str


class OCRTextField(BaseModel):
    value: str | None
    confidence: float


class OCRIntField(BaseModel):
    value: int | None
    confidence: float


class OCRFields(BaseModel):
    brand_name: OCRTextField | None = None
    product_name: OCRTextField | None = None
    original_price: OCRIntField | None = None
    expiry_date: OCRTextField | None = None
    gifticon_type: OCRTextField | None = None
    barcode_number: OCRTextField | None = None


class OCRResponseData(BaseModel):
    fields: OCRFields | None
    needs_review: list[str] = Field(default_factory=list)


class OCRResponse(BaseModel):
    status: str
    message: str
    data: OCRResponseData | None
