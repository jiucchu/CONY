from fastapi import APIRouter
from schemas.embedding import Request, Response
from services.embedding.engine import run_embedding

router = APIRouter(prefix="/embedding")

@router.post("", response_model=Response)
def embedding(request: Request):
    try:
        result = run_embedding(request.sale_id, request.content_text)
        return result
    except Exception as exc:
        return Response(status="FAIL", message=str(exc))
