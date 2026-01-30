from fastapi.testclient import TestClient

from app import create_app

def test_health_endpoint():
    app = create_app(testing=True)
    client = TestClient(app)

    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
