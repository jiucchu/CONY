from fastapi import FastAPI
from dotenv import load_dotenv
from api.ocr import router as ocr_router
from api.embedding import router as embedding_router

load_dotenv()

app = FastAPI()
app.include_router(ocr_router)
app.include_router(embedding_router)

@app.get("/health")
def health():
    return {"status": "ok"}
