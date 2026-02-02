import numpy as np
import pytest

from schemas.recommend import EventType, RequestData
from services.recommend import engine


# 추천 결과에서 이미 본 항목 제외 + limit 적용 테스트
def test_run_recommend_filters_seen_and_limits(monkeypatch):
    def fake_user_vec(_):
        return np.array([1.0, 0.0], dtype=np.float32)

    def fake_query(_vec, n_results):
        # limit보다 많이 반환하고, 사용자가 이미 본 항목도 포함
        assert n_results >= 2
        return [1, 2, 3, 4, 5]

    monkeypatch.setattr(engine, "_weighted_user_vector", fake_user_vec)
    monkeypatch.setattr(engine, "_query_similar_sales", fake_query)

    interactions = [
        RequestData(sale_id=2, event_type=EventType.CLICK),
        RequestData(sale_id=5, event_type=EventType.PURCHASE),
    ]

    result = engine.run_recommend(limit=2, recent_interactions=interactions)

    assert result["status"] == "SUCCESS"
    assert result["data"]["limit"] == 2
    # 2와 5는 제외되고, 이후 limit 적용
    assert result["data"]["items"] == [1, 3]


# 최근 행동 로그가 비어있을 때 예외 발생 테스트
def test_run_recommend_raises_on_empty_interactions():
    with pytest.raises(ValueError, match="최근 행동 로그 리스트가 없습니다"):
        engine.run_recommend(limit=3, recent_interactions=[])


# 이벤트 가중치 반영 + 벡터 정규화 테스트
def test_weighted_user_vector_applies_weights_and_normalizes(monkeypatch):
    def fake_fetch_embeddings(_sale_ids):
        return {
            1: np.array([1.0, 0.0], dtype=np.float32),
            2: np.array([0.0, 1.0], dtype=np.float32),
        }

    monkeypatch.setattr(engine, "_fetch_embeddings_by_sale_ids", fake_fetch_embeddings)

    interactions = [
        RequestData(sale_id=1, event_type=EventType.CLICK),    # weight 1.0
        RequestData(sale_id=2, event_type=EventType.PURCHASE), # weight 3.0
    ]

    user_vec = engine._weighted_user_vector(interactions)

    weighted_sum = np.array([1.0, 3.0], dtype=np.float32)
    expected = weighted_sum / np.linalg.norm(weighted_sum)

    assert np.allclose(user_vec, expected, atol=1e-6)
