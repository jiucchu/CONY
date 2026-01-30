from fastapi import APIRouter

from schemas.embedding import UpsertRequest, StatusUpdateRequest, Response
from services.embedding.engine import upsert_embedding, update_embedding_status, delete_embedding

router = APIRouter(prefix="/embedding")


# 임베딩 생성/수정 (upsert)
@router.put("/{sale_id}", response_model=Response)
def upsert_embedding_by_sale_id(sale_id: int, request: UpsertRequest):
    try:
        return upsert_embedding(
            sale_id=sale_id,
            content_text=request.content_text,
            sale_status=request.sale_status.value,
        )
    except Exception as exc:
        return Response(status="FAIL", message=str(exc))


# 판매 상태 변경 (임베딩 재계산 없음)
@router.patch("/{sale_id}/status", response_model=Response)
def update_embedding_status_by_sale_id(sale_id: int, request: StatusUpdateRequest):
    try:
        return update_embedding_status(
            sale_id=sale_id,
            sale_status=request.sale_status.value,
        )
    except Exception as exc:
        return Response(status="FAIL", message=str(exc))


# 임베딩 물리 삭제
@router.delete("/{sale_id}", response_model=Response)
def delete_embedding_by_sale_id(sale_id: int):
    try:
        return delete_embedding(sale_id)
    except Exception as exc:
        return Response(status="FAIL", message=str(exc))
