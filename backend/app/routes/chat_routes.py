from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.rag_service import answer_question


router = APIRouter(prefix="/chat", tags=["Chat"])


class QuestionRequest(BaseModel):
    question: str
    document_id: str
    user_id: str


@router.post("/ask")
def ask_question(request: QuestionRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    if not request.document_id:
        raise HTTPException(status_code=400, detail="Document ID is required.")

    if not request.user_id:
        raise HTTPException(status_code=400, detail="User ID is required.")

    return answer_question(
        question=request.question,
        document_id=request.document_id,
        user_id=request.user_id,
    )