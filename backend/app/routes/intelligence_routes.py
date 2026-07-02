from fastapi import APIRouter, HTTPException
from app.services.intelligence_service import generate_document_intelligence
from app.services.document_registry import get_document


router = APIRouter(prefix="/documents", tags=["Document Intelligence"])


@router.post("/{document_id}/intelligence")
def create_document_intelligence(document_id: str):
    document = get_document(document_id)

    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")

    intelligence = generate_document_intelligence(document_id)

    return {
        "document_id": document_id,
        "filename": document.get("filename"),
        "intelligence": intelligence,
    }