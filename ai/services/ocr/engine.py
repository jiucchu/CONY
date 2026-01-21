from paddleocr import PaddleOCR
import os
import tempfile
import requests
import cv2
import numpy as np
from pyzxing import BarCodeReader

from schemas.ocr import OCRResponse, OCRResponseData
from services.ocr.parser import extract_barcode_value, parse_ocr_results

_ocr_engine = None

# OCR 엔진은 최초 1회만 초기화
def _get_ocr_engine():
    global _ocr_engine
    if _ocr_engine is None:
        _ocr_engine = PaddleOCR(lang="korean")
    return _ocr_engine


# URL 이미지 다운로드 후 OpenCV로 디코딩
def _load_image_from_url(image_url: str):
    resp = requests.get(image_url, timeout=10)
    resp.raise_for_status()
    img_data = np.frombuffer(resp.content, dtype=np.uint8)
    img = cv2.imdecode(img_data, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("URL을 통한 이미지 디코딩 실패")
    return img


# pyzxing은 로컬 파일 경로가 필요하므로 임시 파일로 저장 후 정리
def _decode_barcode_from_image(img: np.ndarray):
    bar_reader = BarCodeReader()
    tmp_path = None
    try:
        ok, buf = cv2.imencode(".png", img)
        if not ok:
            raise ValueError("바코드 디코딩을 위한 이미지 인코딩 실패")
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            tmp.write(buf.tobytes())
            tmp_path = tmp.name
        return bar_reader.decode(tmp_path)
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)


# FastAPI 라우터에서 호출되는 OCR 엔진
def run_ocr(image_url: str) -> OCRResponse:
    img = _load_image_from_url(image_url)

    # 바코드 디코딩
    bar_results = _decode_barcode_from_image(img)
    barcode_value = extract_barcode_value(bar_results)
    print(f"barcode: {barcode_value}")

    if not barcode_value:
        return OCRResponse(
            status="FAIL",
            message="유효한 기프티콘 이미지가 아닙니다.(바코드 미검출)",
            data=OCRResponseData(
                fields=None,
                needs_review=[
                    "brand_name",
                    "product_name",
                    "original_price",
                    "expiry_date",
                    "gifticon_type",
                    "barcode_number",
                ],
            ),
        )

    ocr = _get_ocr_engine()
    results = ocr.ocr(img)
    print(f"results: {results}")

    fields, needs_review = parse_ocr_results(results, barcode_value)
    return OCRResponse(
        status="SUCCESS",
        message="OCR 텍스트 추출 성공",
        data=OCRResponseData(fields=fields, needs_review=needs_review),
    )
