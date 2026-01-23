import json
import os
from typing import Any
import requests
from schemas.ocr import OCRFields, OCRIntField, OCRTextField

GMS_API_URL = "https://gms.ssafy.io/gmsapi/api.openai.com/v1/chat/completions"


# PaddleOCR 결과(raw_results)를 LLM 입력용 단순 리스트로 평탄화
def _flatten_results(raw_results: list[Any]) -> list[dict[str, Any]]:
    if not raw_results or not raw_results[0]:
        return []

    items: list[dict[str, Any]] = []
    for bbox, (text, prob) in raw_results[0]:
        items.append(
            {
                "text": text,
                "confidence": round(float(prob), 3),
                # "bbox": bbox,
            }
        )
    return items


# 문자열 필드를 OCRFields 형식으로 변환
def _parse_text_field(data: dict[str, Any] | None) -> OCRTextField | None:
    if not data:
        return None
    value = data.get("value")
    confidence = float(data.get("confidence", 0.0))
    if value is None or str(value).strip() == "":
        return OCRTextField(value=None, confidence=confidence)
    return OCRTextField(value=str(value), confidence=confidence)


# 숫자 필드를 OCRFields 형식으로 변환 (숫자만 추출)
def _parse_int_field(data: dict[str, Any] | None) -> OCRIntField | None:
    if not data:
        return None
    value = data.get("value")
    confidence = float(data.get("confidence", 0.0))
    if value is None:
        return OCRIntField(value=None, confidence=confidence)
    digits = "".join(ch for ch in str(value) if ch.isdigit())
    if digits == "":
        return OCRIntField(value=None, confidence=confidence)
    return OCRIntField(value=int(digits), confidence=confidence)


# LLM이 반환한 JSON을 OCRFields로 매핑
def _build_fields(parsed: dict[str, Any]) -> OCRFields:
    return OCRFields(
        brand_name=_parse_text_field(parsed.get("brand_name")),
        product_name=_parse_text_field(parsed.get("product_name")),
        original_price=_parse_int_field(parsed.get("original_price")),
        expiry_date=_parse_text_field(parsed.get("expiry_date")),
        gifticon_type=_parse_text_field(parsed.get("gifticon_type")),
        barcode_number=_parse_text_field(parsed.get("barcode_number")),
    )


# 바코드 디코딩 결과에서 바코드 데이터만 추출
def extract_barcode_value(bar_results: Any | None) -> str | None:
    if not bar_results:
        return None
    for item in bar_results:
        if isinstance(item, dict):
            value = item.get("parsed") or item.get("raw") or item.get("text")
        else:
            value = item
        
        # bytes -> 문자열로 변환
        if isinstance(value, (bytes, bytearray)):
            value = value.decode("utf-8", errors="ignore")
        if value and str(value).strip():
            return str(value)
    return None


# OCR 결과를 LLM에 전달해 OCRFields로 파싱
def parse_ocr_results(raw_results: list[Any], barcode_value: str | None = None) -> tuple[OCRFields | None, list[str]]:
    items = _flatten_results(raw_results)

    # OCR 결과가 유효한 값이 아닌 경우
    if not items:
        return None, ["brand_name", "product_name", "original_price", "expiry_date", "gifticon_type", "barcode_number"]

    # GMS API KEY
    GMS_API_KEY = os.getenv("GMS_API_KEY")
    if not GMS_API_KEY:
        raise RuntimeError("GMS_API_KEY 확인이 필요합니다.")

    # GMS Model
    model = os.getenv("GMS_MODEL")

    # system prompt
    system_msg = (
        "Strict OCR→JSON parser. Output ONLY JSON. No extra text. "
        "Use only OCR tokens; never guess. Unknown => value=null, confidence=0.0."
    )

    # developer prompt
    developer_msg = """
    Parse OCR tokens into the JSON schema below. Use only token evidence.

    Schema:
    {
      "brand_name": {"value": string|null, "confidence": number},
      "product_name": {"value": string|null, "confidence": number},
      "original_price": {"value": integer|null, "confidence": number},
      "expiry_date": {"value": string|null, "confidence": number},
      "gifticon_type": {"value": "PRODUCT"|"PREPAID", "confidence": number},
      "barcode_number": {"value": string|null, "confidence": number}
    }

    Rules:
    - Do not hallucinate. Merge broken fragments when needed.
    - brand_name: remove surrounding brackets if any.
    - product_name: prefer meaningful product phrases over footer text.
    - expiry_date: normalize to YYYY-MM-DD.
    - original_price: only if explicit price evidence exists (currency/commas).
    - gifticon_type: "PRODUCT" for product voucher, "PREPAID" for cash voucher, else null.
    - confidence: use token confidence; if value is null, confidence is 0.0.
    """


    # user prompt
    user_msg = (
        "OCR tokens:\n"
        + json.dumps(items, ensure_ascii=False)
    )

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_msg},
            {"role": "developer", "content": developer_msg},
            {"role": "user", "content": user_msg},
        ]
    }

    # GMS 프록시로 요청 전송
    headers = {
        "Authorization": f"Bearer {GMS_API_KEY}", 
        "Content-Type": "application/json"
    }

    # LLM 요청
    resp = requests.post(GMS_API_URL, json=payload, headers=headers, timeout=60)
    resp.raise_for_status()

    # LLM 응답에서 JSON 문자열 추출
    content = resp.json()["choices"][0]["message"]["content"]
    print(f"llm 파싱 내용:\n {content}")

    # JSON 파싱 후 OCRFields로 변환
    parsed = json.loads(content)
    if barcode_value:
        parsed["barcode_number"] = {"value": barcode_value, "confidence": 1.0}
    fields = _build_fields(parsed)

    # confidence에 따라 needs_review 설정
    needs_review: list[str] = []
    for key in (
        "brand_name",
        "product_name",
        "original_price",
        "expiry_date",
        "gifticon_type",
        "barcode_number",
    ):
        item = parsed.get(key, {})
        if not isinstance(item, dict):
            needs_review.append(key)
            continue
        value = item.get("value")
        confidence = float(item.get("confidence", 0.0) or 0.0)
        if value is None or (isinstance(value, str) and value.strip() == "") or confidence < 0.8:
            # confidence < 0.8 이면 확인 필요
            needs_review.append(key)

    return fields, needs_review
