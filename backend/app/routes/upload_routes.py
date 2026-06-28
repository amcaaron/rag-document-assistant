import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.config import UPLOAD_DIR
from app.services.pdf_service import load_document
from app.services.vector_service import split_documents, store_documents, clear_vectorstore
import uuid

from app.services.document_registry import (
    add_document,
    load_documents,
    delete_document,
    clear_documents
)
from app.services.vector_service import (
    split_documents,
    store_documents,
    clear_vectorstore,
    delete_document_vectors
)

router = APIRouter(prefix="/documents", tags=["Documents"])

os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    allowed_extensions = [".pdf", ".docx", ".txt"]

    file_extension = os.path.splitext(file.filename)[1].lower()

    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOCX, and TXT files are allowed."
        )

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        documents = load_document(file_path)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    if not documents:
        raise HTTPException(
            status_code=400,
            detail="No pages were found in this PDF."
        )

    # Remove pages with empty text
    documents = [
        doc for doc in documents
        if doc.page_content and doc.page_content.strip()
    ]

    if not documents:
        raise HTTPException(
            status_code=400,
            detail="No readable text found in this PDF. Try using a text-based PDF instead of a scanned/image PDF."
        )

    chunks = split_documents(documents)

    chunks = [
        chunk for chunk in chunks
        if chunk.page_content and chunk.page_content.strip()
    ]

    if not chunks:
        raise HTTPException(
            status_code=400,
            detail="The PDF was loaded, but no valid text chunks were created."
        )

    document_id = str(uuid.uuid4())

    for chunk in chunks:
        chunk.metadata["document_id"] = document_id
        chunk.metadata["filename"] = file.filename

    store_documents(chunks)

    add_document({
        "document_id": document_id,
        "filename": file.filename,
        "pages_loaded": len(documents),
        "chunks_created": len(chunks)
    })

    return {
        "message": "Document uploaded and indexed successfully",
        "document_id": document_id,
        "filename": file.filename,
        "pages_loaded": len(documents),
        "chunks_created": len(chunks)
    }

@router.delete("/clear/all")
def clear_all_documents():
    clear_vectorstore()
    clear_documents()

    return {
        "message": "All documents cleared successfully"
    }

@router.get("/")
def list_uploaded_documents():
    return {
        "documents": load_documents()
    }

@router.delete("/{document_id}")
def delete_uploaded_document(document_id: str):
    delete_document_vectors(document_id)
    delete_document(document_id)

    return {
        "message": "Document deleted successfully",
        "document_id": document_id
    }