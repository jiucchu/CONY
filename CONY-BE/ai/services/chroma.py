import chromadb
from config import get_settings

def get_chroma_collection():
    settings = get_settings()

    persist_dir = settings.CHROMA_PERSIST_DIR
    collection_name = settings.CHROMA_COLLECTION

    if settings.CHROMA_HOST or settings.CHROMA_PORT:
        host = settings.CHROMA_HOST or "localhost"
        port = settings.CHROMA_PORT or 8000
        client = chromadb.HttpClient(host=host, port=port)
    else:
        client = chromadb.PersistentClient(path=persist_dir)

    return client.get_or_create_collection(name=collection_name)
