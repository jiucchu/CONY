from fastapi import FastAPI
from dotenv import load_dotenv
from api.ocr import router as ocr_router

load_dotenv()

app = FastAPI()

app.include_router(ocr_router)

@app.get("/health")
def health():
    return {"status": "ok"}
