import logging
import uuid
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app import create_app
from config import get_settings
from services.chroma import get_chroma_collection


def _enable_test_logging() -> None:
    # 테스트 실행 시 로그가 콘솔에 보이도록 설정
    logging.basicConfig(level=logging.INFO)


# 실제 ChromaDB(PersistentClient)를 사용한 통합 테스트
# - 라우터 -> 엔진 -> Chroma 연동 흐름을 그대로 검증한다.
# - 테스트 전용 컬렉션/경로로 분리한다.
@pytest.mark.integration
def test_recommend_endpoint_integration_with_real_chroma(monkeypatch):
    _enable_test_logging()

    test_collection = f"test_sale_embeddings_{uuid.uuid4().hex}"
    test_dir = Path(__file__).resolve().parents[2] / "chroma_db_test"
    monkeypatch.setenv("CHROMA_COLLECTION", test_collection)
    monkeypatch.setenv("CHROMA_PERSIST_DIR", str(test_dir))
    monkeypatch.setenv("CHROMA_HOST", "")
    monkeypatch.setenv("CHROMA_PORT", "")

    # 설정 캐시 제거 후 테스트 컬렉션 생성
    get_settings.cache_clear()
    collection = get_chroma_collection()

    # 테스트용 임베딩/메타데이터 삽입 (2차원 테스트 컬렉션)
    collection.add(
        ids=["sale_1", "sale_2", "sale_3", "sale_4"],
        embeddings=[
            [1.0, 0.0],
            [0.0, 1.0],
            [0.9, 0.1],
            [0.1, 0.9],
        ],
        metadatas=[
            {"sale_id": 1, "sale_status": "ON_SALE"},
            {"sale_id": 2, "sale_status": "ON_SALE"},
            {"sale_id": 3, "sale_status": "ON_SALE"},
            {"sale_id": 4, "sale_status": "ON_SALE"},
        ],
    )

    app = create_app(testing=True)
    client = TestClient(app)

    payload = {
        "user_log": [
            {"sale_id": 1, "event_type": "CLICK"},
            {"sale_id": 2, "event_type": "PURCHASE"},
        ]
    }

    # limit=2로 요청하면, 본 상품(1, 2)은 제외되고 3, 4가 반환되어야 함
    response = client.post("/recommend/personal?limit=2", json=payload)

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "SUCCESS"
    assert body["data"]["limit"] == 2
    assert sorted(body["data"]["items"]) == [3, 4]


# 임베딩 생성 API까지 포함한 통합 테스트
# - 실제 Embedding API를 호출하므로 환경 변수가 없으면 스킵한다.
# - RUN_EMBEDDING_INTEGRATION=1일 때만 실행되도록 안전장치 적용.
@pytest.mark.integration
def test_recommend_with_real_embedding_and_chroma():
    _enable_test_logging()

    get_settings.cache_clear()
    settings = get_settings()
    if settings.RUN_EMBEDDING_INTEGRATION != 1:
        pytest.skip("RUN_EMBEDDING_INTEGRATION=1일 때만 실행")

    if not settings.GMS_API_KEY or not settings.EMBEDDING_MODEL:
        pytest.skip("GMS_API_KEY 또는 EMBEDDING_MODEL이 없어 임베딩 테스트를 건너뜀")

    app = create_app(testing=True)
    client = TestClient(app)

    # 임베딩 API를 통해 실제 벡터를 생성하고 Chroma에 저장
    for sale_id, text in [
        # 카페 5개
        (1, "[카페] 스타벅스 아메리카노 (부가 정보: 10% 할인, 유효기간 2026-12-31)"),
        (2, "[카페] 투썸플레이스 카페라떼 (부가 정보: 12% 할인, 유효기간 2026-11-30)"),
        (3, "[카페] 이디야 바닐라라떼 (부가 정보: 8% 할인, 유효기간 2026-10-31)"),
        (4, "[카페] 할리스 카라멜마키아토 (부가 정보: 15% 할인, 유효기간 2026-09-30)"),
        (5, "[카페] 메가커피 아이스아메리카노 (부가 정보: 5% 할인, 유효기간 2026-08-31)"),
        # 치킨 5개
        (6, "[치킨] 교촌치킨 허니콤보 (부가 정보: 7% 할인, 유효기간 2026-12-15)"),
        (7, "[치킨] BBQ 황금올리브치킨 (부가 정보: 10% 할인, 유효기간 2026-11-20)"),
        (8, "[치킨] BHC 뿌링클 (부가 정보: 9% 할인, 유효기간 2026-10-25)"),
        (9, "[치킨] 네네치킨 스노윙치킨 (부가 정보: 6% 할인, 유효기간 2026-09-20)"),
        (10, "[치킨] 굽네치킨 고추바사삭 (부가 정보: 11% 할인, 유효기간 2026-08-20)"),
        # 편의점 5개
        (11, "[편의점] GS25 모바일상품권 1만원권 (부가 정보: 4% 할인, 유효기간 2027-01-31)"),
        (12, "[편의점] CU 모바일상품권 1만원권 (부가 정보: 5% 할인, 유효기간 2027-01-15)"),
        (13, "[편의점] 세븐일레븐 모바일상품권 1만원권 (부가 정보: 3% 할인, 유효기간 2026-12-20)"),
        (14, "[편의점] 이마트24 모바일상품권 1만원권 (부가 정보: 6% 할인, 유효기간 2026-11-25)"),
        (15, "[편의점] GS25 삼각김밥 세트 (부가 정보: 7% 할인, 유효기간 2026-10-10)"),
        # 베이커리 5개
        (16, "[베이커리] 파리바게뜨 우유식빵 (부가 정보: 10% 할인, 유효기간 2026-12-05)"),
        (17, "[베이커리] 뚜레쥬르 에그타르트 (부가 정보: 12% 할인, 유효기간 2026-11-18)"),
        (18, "[베이커리] 파리바게뜨 소보로빵 (부가 정보: 8% 할인, 유효기간 2026-10-08)"),
        (19, "[베이커리] 뚜레쥬르 단팥빵 (부가 정보: 9% 할인, 유효기간 2026-09-12)"),
        (20, "[베이커리] 파리크라상 크루아상 (부가 정보: 13% 할인, 유효기간 2026-08-25)"),
    ]:
        resp = client.put(
            f"/embedding/{sale_id}",
            json={"content_text": text, "sale_status": "ON_SALE"},
        )
        assert resp.status_code == 200
        body = resp.json()
        if body.get("status") != "SUCCESS":
            pytest.skip(f"임베딩 API 실패로 스킵: {body.get('message')}")

    payload = {
        "user_log": [
            {"sale_id": 1, "event_type": "CLICK"},
            {"sale_id": 2, "event_type": "PURCHASE"},
        ]
    }

    # 실제 임베딩 기반 추천 결과가 정상 반환되는지 확인
    response = client.post("/recommend/personal?limit=6", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "SUCCESS"
    assert body["data"]["limit"] == 6

    # 이미 본 상품(1, 2)은 제외되어야 함
    items = body["data"]["items"]
    assert 1 not in items
    assert 2 not in items

    # 추천 결과가 선호 카테고리(카페)에 편향되는지 확인
    # - 사용자 로그는 카페 2개로 구성되어 있으므로, 추천 결과에서 카페가 우세한지 본다.
    category_by_sale_id = {
        1: "카페", 2: "카페", 3: "카페", 4: "카페", 5: "카페",
        6: "치킨", 7: "치킨", 8: "치킨", 9: "치킨", 10: "치킨",
        11: "편의점", 12: "편의점", 13: "편의점", 14: "편의점", 15: "편의점",
        16: "베이커리", 17: "베이커리", 18: "베이커리", 19: "베이커리", 20: "베이커리",
    }
    category_counts = {}
    for sid in items:
        category = category_by_sale_id.get(sid)
        if not category:
            continue
        category_counts[category] = category_counts.get(category, 0) + 1

    cafe_count = category_counts.get("카페", 0)
    other_counts = [cnt for cat, cnt in category_counts.items() if cat != "카페"]
    max_other = max(other_counts) if other_counts else 0

    assert cafe_count >= 2
    assert cafe_count >= max_other
