from fastapi import APIRouter
from schemas.embedding import Request, Response
from services.embedding.engine import run_embedding, delete_embedding

router = APIRouter(prefix="/embedding")

# 임베딩 생성 및 저장
@router.post("", response_model=Response)
def embedding(request: Request):
    try:
        result = run_embedding(request.sale_id, request.content_text)
        return result
    except Exception as exc:
        return Response(status="FAIL", message=str(exc))

# 임베딩 삭제
@router.delete("/{sale_id}", response_model=Response)
def delete_embedding_by_sale_id(sale_id: int):
    try:
        result = delete_embedding(sale_id)
        return result
    except Exception as exc:
        return Response(status="FAIL", message=str(exc))
