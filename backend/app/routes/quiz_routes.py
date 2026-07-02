from fastapi import APIRouter, HTTPException
from app.services.quiz_service import generate_document_quiz
from app.services.document_registry import get_document


router = APIRouter(prefix="/documents", tags=["Quiz Generation"])


@router.post("/{document_id}/quiz")
def create_document_quiz(document_id: str):
    document = get_document(document_id)

    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")

    quiz = generate_document_quiz(document_id)

    return {
        "document_id": document_id,
        "filename": document.get("filename"),
        "quiz": quiz,
    }