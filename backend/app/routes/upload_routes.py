import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.config import UPLOAD_DIR
from app.services.pdf_service import load_pdf
from app.services.vector_service import split_documents, store_documents, clear_vectorstore

router = APIRouter(prefix="/documents", tags=["Documents"])

os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    documents = load_pdf(file_path)

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

    clear_vectorstore()
    store_documents(chunks)

    return {
        "message": "PDF uploaded and indexed successfully",
        "filename": file.filename,
        "pages_loaded": len(documents),
        "chunks_created": len(chunks)
    }
