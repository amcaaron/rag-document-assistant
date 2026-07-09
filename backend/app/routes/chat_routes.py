from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.services.auth_service import get_current_user
from app.services.rag_service import answer_question


router = APIRouter(prefix="/chat", tags=["Chat"])


class QuestionRequest(BaseModel):
    question: str
    document_id: str


@router.post("/ask")
def ask_question(request: QuestionRequest, current_user=Depends(get_current_user)):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    if not request.document_id:
        raise HTTPException(status_code=400, detail="Document ID is required.")

    return answer_question(
        question=request.question,
        document_id=request.document_id,
        user_id=current_user["id"],
    )