from fastapi import APIRouter, Depends, HTTPException

from app.services.auth_service import get_current_user
from app.services.intelligence_service import generate_document_intelligence


router = APIRouter(prefix="/documents", tags=["Document Intelligence"])


@router.post("/{document_id}/intelligence")
def create_document_intelligence(
    document_id: str,
    current_user=Depends(get_current_user),
):
    user_id = current_user["id"]

    print("\n==============================")
    print("DOCUMENT INTELLIGENCE CALLED")
    print(f"Document ID: {document_id}")
    print(f"Verified User ID: {user_id}")
    print("==============================\n")

    try:
        intelligence = generate_document_intelligence(
            document_id=document_id,
            user_id=user_id,
        )

        return {
            "document_id": document_id,
            "intelligence": intelligence,
        }

    except Exception as error:
        print("DOCUMENT INTELLIGENCE ERROR")
        print(f"Error type: {type(error)}")
        print(f"Error message: {error}")

        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate document intelligence: {str(error)}",
        )