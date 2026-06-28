from fastapi import APIRouter
from pydantic import BaseModel
from app.services.rag_service import answer_question

router = APIRouter(prefix="/chat", tags=["Chat"])


class QuestionRequest(BaseModel):
    question: str
    document_id: str


@router.post("/ask")
def ask_question(request: QuestionRequest):
    return answer_question(request.question, request.document_id)