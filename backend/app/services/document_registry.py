import json
import os
from typing import List, Dict, Optional

REGISTRY_PATH = "./documents.json"


def load_documents() -> List[Dict]:
    if not os.path.exists(REGISTRY_PATH):
        return []

    with open(REGISTRY_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


def save_documents(documents: List[Dict]) -> None:
    with open(REGISTRY_PATH, "w", encoding="utf-8") as file:
        json.dump(documents, file, indent=2)


def add_document(document: Dict) -> None:
    documents = load_documents()
    documents.append(document)
    save_documents(documents)


def get_document(document_id: str) -> Optional[Dict]:
    documents = load_documents()

    for document in documents:
        if document["document_id"] == document_id:
            return document

    return None


def delete_document(document_id: str) -> None:
    documents = load_documents()
    documents = [
        document for document in documents
        if document["document_id"] != document_id
    ]
    save_documents(documents)


def clear_documents() -> None:
    save_documents([])