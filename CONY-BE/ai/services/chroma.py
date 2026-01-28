import os
from pathlib import Path

import chromadb

def get_chroma_collection():
    # 항상 ai/ 디렉토리 기준의 고정 경로를 기본값으로 사용
    root_dir = Path(__file__).resolve().parents[1]
    default_persist_dir = root_dir / "chroma_db"

    persist_dir = os.getenv("CHROMA_PERSIST_DIR", str(default_persist_dir))
    collection_name = os.getenv("CHROMA_COLLECTION", "sale_embeddings")

    client = chromadb.PersistentClient(path=persist_dir)
    return client.get_or_create_collection(name=collection_name)
