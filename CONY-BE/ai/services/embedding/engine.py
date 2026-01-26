import os
import requests
import chromadb

from schemas.embedding import Response

GMS_API_URL = "https://gms.ssafy.io/gmsapi/api.openai.com/v1/embeddings"

def _get_chroma_collection():
    persist_dir = os.getenv("CHROMA_PERSIST_DIR")
    collection_name = "sale_embeddings"

    client = chromadb.PersistentClient(path=persist_dir)
    return client.get_or_create_collection(name=collection_name)


# 임베딩 생성
def run_embedding(sale_id: int, content_text: str) -> Response:
    # GMS API 키
    gms_api_key = os.getenv("GMS_API_KEY")
    if not gms_api_key:
        raise RuntimeError("GMS_API_KEY 확인이 필요합니다.")

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
        collection = _get_chroma_collection()
        collection.upsert(
            ids=[str(f"sale_{sale_id}")],
            embeddings=[embedding],
            documents=[content_text],
            metadatas=[{"sale_id": sale_id}],
        )
    except Exception as exc:
        raise RuntimeError("ChromaDB 저장 실패") from exc

    return Response(
        status="SUCCESS",
        message="임베딩 생성 및 저장 성공"
    )
