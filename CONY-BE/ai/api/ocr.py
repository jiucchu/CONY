from fastapi import APIRouter
from schemas.ocr import OCRRequest, OCRResponse
from services.ocr.engine import run_ocr

router = APIRouter(prefix="/ocr")

@router.post("", response_model=OCRResponse)
def ocr(request: OCRRequest):
    result = run_ocr(request.image_url)
    return result