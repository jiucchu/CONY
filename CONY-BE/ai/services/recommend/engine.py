from __future__ import annotations

import os
import logging
from typing import List, Dict, Any, Set

import numpy as np

from schemas.recommend import RequestData, EventType
from services.chroma import get_chroma_collection

logger = logging.getLogger(__name__)

# 이벤트 가중치
EVENT_WEIGHTS = {
    EventType.CLICK: 1.0,
    EventType.PURCHASE: 3.0,
}

# 중복 제거를 위해 추천 후보 넉넉하게 뽑아야 limit 개수를 채울 수 있음
RECOMMEND_CANDIDATE_MULTIPLIER = 20 # limit에 곱할 후보 증폭 배수 (기본 20)
RECOMMEND_MAX_CANDIDATES = 500      # 후보 검색 최대 상한선 (기본 500)


# 사용자 행동 로그에 포함된 sale_id의 embedding 값 가져오기 -> {sale_id: embedding_vector}
def _fetch_embeddings_by_sale_ids(sale_ids: List[int]) -> Dict[int, np.ndarray]:
    if not sale_ids: return {}

    collection = get_chroma_collection()
    ids = [f"sale_{sid}" for sid in sale_ids]

    res = collection.get(ids=ids, include=["embeddings", "metadatas"])
    embeddings = res.get("embeddings") or []
    metadatas = res.get("metadatas") or []

    vectors_by_id: Dict[int, np.ndarray] = {}
    for emb, meta in zip(embeddings, metadatas):
        if emb is None or not meta: continue

        sid = meta.get("sale_id")
        if not isinstance(sid, int) or sid <= 0: continue

        # emb는 list[float] 형태일 가능성이 높음
        vectors_by_id[sid] = np.asarray(emb, dtype=np.float32)

    return vectors_by_id


# 유저 벡터 생성 (벡터 평균 계산)
def _weighted_user_vector(interactions: List[RequestData]) -> np.ndarray:
    sale_ids = [it.sale_id for it in interactions]
    vectors_by_id = _fetch_embeddings_by_sale_ids(sale_ids)
    if not vectors_by_id:
        raise ValueError("유저의 최근 로그에 대한 임베딩을 찾을 수 없습니다.")

    weighted_sum: np.ndarray | None = None  # 벡터 합
    total_weight = 0.0                      # 가중치 합
    for it in interactions:
        vec = vectors_by_id.get(it.sale_id)
        if vec is None: continue
        weight = EVENT_WEIGHTS.get(it.event_type, 1.0)

        if weighted_sum is None:
            weighted_sum = vec * weight
        else:
            weighted_sum = weighted_sum + (vec * weight)
        total_weight += weight

    if weighted_sum is None or total_weight == 0.0:
        raise ValueError("가중치 부여 후 사용 가능한 임베딩이 없습니다.")

    # 평균 벡터 계산
    user_vec = weighted_sum / total_weight

    # cosine 유사도 안정화를 위해 정규화
    norm = np.linalg.norm(user_vec)
    if norm > 0:
        user_vec = user_vec / norm

    return user_vec.astype(np.float32)


# ChromaDB에서 유사 sale 후보 조회 -> [sale_id1, sale_id2, ...]
def _query_similar_sales(user_vec: np.ndarray, n_results: int) -> List[int]:
    collection = get_chroma_collection()

    # Chroma query는 query_embeddings를 list로 받음
    res = collection.query(
        query_embeddings=[user_vec.tolist()],
        n_results=n_results,
        include=["metadatas", "distances"],
        where={"sale_status": "ON_SALE"},
    )

    metadatas = (res.get("metadatas") or [[]])[0]  # query 1개니까 [0]
    sale_ids: List[int] = []
    for meta in metadatas:
        if not meta: continue
        sid = meta.get("sale_id")
        if isinstance(sid, int) and sid > 0:
            sale_ids.append(sid)

    return sale_ids


# 추천 리스트 조회
def run_recommend(limit: int, recent_interactions: List[RequestData]) -> Dict[str, Any]:
    """
    라우터에서 그대로 return 가능한 Response(dict) 형태로 반환
    Response 스키마:
      - status: str
      - message: str
      - data: { limit: int, items: List[int] }
    """
    # 입력 검증
    if limit < 1:
        raise ValueError("limit은 1보다 커야 합니다.")
    if not recent_interactions:
        raise ValueError("최근 행동 로그 리스트가 없습니다.")

    # 1) 유저 벡터 생성
    user_vec = _weighted_user_vector(recent_interactions)

    # 2) 후보 개수 결정 (중복 제외를 위해 넉넉히 뽑기, RECOMMEND_MAX_CANDIDATES 이하)
    n_candidates = min(RECOMMEND_MAX_CANDIDATES, max(limit * RECOMMEND_CANDIDATE_MULTIPLIER, limit))

    # 3) ChromaDB에서 유사 sale 후보 조회
    candidates = _query_similar_sales(user_vec, n_candidates)

    # 4) 유사 sale 후보 중 사용자가 최근 본 제품은 제외
    seen: Set[int] = {it.sale_id for it in recent_interactions}
    filtered: List[int] = [sid for sid in candidates if sid not in seen]

    # 5) limit만큼 자르기
    items = filtered[:limit]

    return {
        "status": "SUCCESS",
        "message": "추천 리스트 조회 성공",
        "data": {
            "limit": limit,
            "items": items,
        },
    }
