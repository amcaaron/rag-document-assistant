from fastapi import APIRouter, Depends, HTTPException

from app.services.auth_service import get_current_user
from app.services.quiz_service import generate_document_quiz


router = APIRouter(prefix="/documents", tags=["Quiz Generation"])


@router.post("/{document_id}/quiz")
def create_document_quiz(
    document_id: str,
    current_user=Depends(get_current_user),
):
    user_id = current_user["id"]

    print("\n==============================")
    print("DOCUMENT QUIZ CALLED")
    print(f"Document ID: {document_id}")
    print(f"Verified User ID: {user_id}")
    print("==============================\n")

    try:
        quiz = generate_document_quiz(
            document_id=document_id,
            user_id=user_id,
        )

        return {
            "document_id": document_id,
            "quiz": quiz,
        }

    except Exception as error:
        print("DOCUMENT QUIZ ERROR")
        print(f"Error type: {type(error)}")
        print(f"Error message: {error}")

        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate document quiz: {str(error)}",
        )