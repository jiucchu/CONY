import logging
from fastapi import APIRouter, Query

from schemas.recommend import Response, Request
from services.recommend.engine import run_recommend

router = APIRouter(prefix="/recommend")
logger = logging.getLogger(__name__)


# 개인화 추천 리스트 조회
@router.post("/personal", response_model=Response)
def recommend(request: Request, limit: int = Query(10, ge=1, le=20)):
    try:
        recent_interactions = request.user_log
        result = run_recommend(limit, recent_interactions)
        return result
    except Exception as exc:
        logger.exception("recommend failed")
        return Response(status="FAIL", message=str(exc), data=None)
    
