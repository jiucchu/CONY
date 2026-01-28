from typing import Any, Dict, Optional, Tuple
import requests

from config import get_settings
from services.chroma import get_chroma_collection
from schemas.embedding import Response
from services.chroma import get_chroma_collection

GMS_API_URL = "https://gms.ssafy.io/gmsapi/api.openai.com/v1/embeddings"


# 임베딩 생성
def _generate_embedding(content_text: str) -> list[float]:
    settings = get_settings()
    GMS_API_KEY = settings.GMS_API_KEY

    if not GMS_API_KEY:
        raise RuntimeError("GMS_API_KEY가 없습니다")

    model = settings.EMBEDDING_MODEL

    headers = {
        "Authorization": f"Bearer {GMS_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": model,
        "input": content_text,
    }

    try:
        resp = requests.post(GMS_API_URL, json=payload, headers=headers, timeout=60)
        resp.raise_for_status()
        return resp.json()["data"][0]["embedding"]
    except requests.RequestException as exc:
        raise RuntimeError("Embedding API 요청 실패") from exc
    except (KeyError, IndexError, ValueError) as exc:
        raise RuntimeError("Embedding API 응답 파싱 실패") from exc


# 기존 문서의 임베딩/텍스트/메타데이터 조회 및 반환
def _fetch_existing(
    sale_id: int,
) -> Tuple[Optional[list[float]], Optional[str], Dict[str, Any]]:
    collection = get_chroma_collection()
    res = collection.get(ids=[f"sale_{sale_id}"], include=["embeddings", "documents", "metadatas"])
    if not res.get("ids"):
        return None, None, {}

    embedding = (res.get("embeddings") or [None])[0]
    document = (res.get("documents") or [None])[0]
    metadata = (res.get("metadatas") or [{}])[0] or {}
    return embedding, document, metadata


# 메타데이터 업데이트
def _merge_metadata(existing: Dict[str, Any], sale_id: int, sale_status: str) -> Dict[str, Any]:
    merged = dict(existing) if existing else {}
    merged["sale_id"] = sale_id
    merged["sale_status"] = sale_status
    return merged


# 임베딩을 생성 및 수정하여 업데이트
def upsert_embedding(sale_id: int, content_text: str, sale_status: str) -> Response:
    embedding = _generate_embedding(content_text)
    document = content_text
    _, _, existing_meta = _fetch_existing(sale_id)

    metadata = _merge_metadata(existing_meta, sale_id, sale_status)

    try:
        collection = get_chroma_collection()
        collection.upsert(
            ids=[f"sale_{sale_id}"],
            embeddings=[embedding],
            documents=[document],
            metadatas=[metadata],
        )
    except Exception as exc:
        raise RuntimeError("ChromaDB 저장 실패") from exc

    return Response(status="SUCCESS", message="임베딩 upsert 성공")


# 임베딩은 유지한 채 메타데이터의 sale_status만 변경
def update_embedding_status(sale_id: int, sale_status: str) -> Response:
    embedding, document, existing_meta = _fetch_existing(sale_id)
    if embedding is None or document is None:
        raise RuntimeError("수정할 임베딩이 없습니다")

    metadata = _merge_metadata(existing_meta, sale_id, sale_status)

    try:
        collection = get_chroma_collection()
        collection.upsert(
            ids=[f"sale_{sale_id}"],
            embeddings=[embedding],
            documents=[document],
            metadatas=[metadata],
        )
    except Exception as exc:
        raise RuntimeError("ChromaDB 상태 업데이트 실패") from exc

    return Response(status="SUCCESS", message="임베딩 상태 변경 성공")


# sale_id에 해당하는 임베딩을 물리적으로 삭제
def delete_embedding(sale_id: int) -> Response:
    try:
        collection = get_chroma_collection()
        existing = collection.get(ids=[f"sale_{sale_id}"])
        if not existing.get("ids"):
            raise RuntimeError("삭제할 임베딩이 없습니다")
        collection.delete(ids=[f"sale_{sale_id}"])
    except RuntimeError:
        raise
    except Exception as exc:
        raise RuntimeError("ChromaDB 삭제 실패") from exc

    return Response(
        status="SUCCESS",
        message="임베딩 삭제 성공",
    )
