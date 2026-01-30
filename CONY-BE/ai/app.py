from fastapi import FastAPI
from api.ocr import router as ocr_router
from api.embedding import router as embedding_router


def create_app(testing: bool = False) -> FastAPI:
    app = FastAPI()
    app.include_router(ocr_router)
    app.include_router(embedding_router)

    @app.get("/health")
    def health():
        return {"status": "ok"}

    return app

app = create_app()