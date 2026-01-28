import os
import logging
from typing import List

import requests
from fastapi import APIRouter, Depends, Query
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from schemas.recommend import Response, RecentInteraction, EventType
from services.recommend.engine import run_recommend

router = APIRouter(prefix="/recommend")
security = HTTPBearer()
logger = logging.getLogger(__name__)


# 사용자 최근 행동 로그 불러오기
def _fetch_recent_interactions(authorization: str) -> List[RecentInteraction]:
    base_url = os.getenv("PAYMENT_SERVICE_URL")
    if not base_url:
        raise RuntimeError("PAYMENT_SERVICE_URL가 없습니다")

    url = f"{base_url.rstrip('/')}/interactions/recent"
    headers = {"Authorization": authorization}

    try:
        resp = requests.get(url, headers=headers, timeout=10)
        resp.raise_for_status()
        payload = resp.json()
    except requests.RequestException as exc:
        raise RuntimeError("최근 행동 로그 조회 실패") from exc
    except ValueError as exc:
        raise RuntimeError("최근 행동 로그 응답 파싱 실패") from exc

    data = payload.get("data") or []
    if not isinstance(data, list):
        raise RuntimeError("최근 행동 로그 형식이 올바르지 않습니다")

    interactions: List[RecentInteraction] = []
    for item in data:
        if not isinstance(item, dict):
            continue
        sale_id = item.get("saleId") or item.get("sale_id")
        event_type = item.get("eventType") or item.get("event_type")
        if not isinstance(sale_id, int) or sale_id <= 0:
            continue
        if not isinstance(event_type, str):
            continue
        try:
            interactions.append(
                RecentInteraction(
                    sale_id=sale_id,
                    event_type=EventType(event_type),
                )
            )
        except ValueError:
            continue

    return interactions


# 개인화 추천 리스트 조회
@router.get("/personal", response_model=Response)
def recommend(
    limit: int = Query(10, ge=1, le=50),
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    try:
        authorization = f"{credentials.scheme} {credentials.credentials}"
        recent_interactions = _fetch_recent_interactions(authorization)
        result = run_recommend(limit, recent_interactions)
        return result
    except Exception as exc:
        logger.exception("recommend failed")
        return Response(status="FAIL", message=str(exc), data=None)
    
