import os
import requests
import chromadb

from schemas.embedding import Response
from services.chroma import get_chroma_collection

GMS_API_URL = "https://gms.ssafy.io/gmsapi/api.openai.com/v1/embeddings"


# 임베딩 생성 및 저장
def run_embedding(sale_id: int, content_text: str) -> Response:
    # GMS API 키
    gms_api_key = os.getenv("GMS_API_KEY")
    if not gms_api_key:
        raise RuntimeError("GMS_API_KEY가 없습니다")

    # 임베딩 모델
    model = os.getenv("EMBEDDING_MODEL")

    headers = {
        "Authorization": f"Bearer {gms_api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": model,
        "input": content_text,
    }

    # 임베딩 요청
    try:
        resp = requests.post(GMS_API_URL, json=payload, headers=headers, timeout=60)
        resp.raise_for_status()
        embedding = resp.json()["data"][0]["embedding"]
    except requests.RequestException as exc:
        raise RuntimeError("Embedding API 요청 실패") from exc
    except (KeyError, IndexError, ValueError) as exc:
        raise RuntimeError("Embedding API 응답 파싱 실패") from exc

    # ChromaDB에 저장
    try:
        collection = get_chroma_collection()
        collection.upsert(
            ids=[f"sale_{sale_id}"],
            embeddings=[embedding],
            documents=[content_text],
            metadatas=[{"sale_id": sale_id}],
        )
    except Exception as exc:
        raise RuntimeError("ChromaDB 저장 실패") from exc

    return Response(
        status="SUCCESS",
        message="임베딩 생성 및 저장 성공",
    )


# 임베딩 삭제
def delete_embedding(sale_id: int) -> Response:
    # ChromaDB에서 벡터 삭제
    try:
        collection = get_chroma_collection()
        # 존재 여부 확인
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
