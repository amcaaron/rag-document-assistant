import os
import shutil
import uuid

from fastapi import APIRouter, UploadFile, File, HTTPException

from app.config import UPLOAD_DIR
from app.services.pdf_service import load_document
from app.services.vector_service import (
    split_documents,
    store_documents,
    clear_vectorstore,
    delete_document_vectors,
)
from app.services.document_registry import (
    add_document,
    load_documents,
    delete_document,
    clear_documents,
)


router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/upload")
def upload_document(file: UploadFile = File(...)):
    print("\n==============================")
    print("1. Upload request received")
    print(f"Uploaded filename: {file.filename}")
    print("==============================\n")

    if not file.filename:
        print("ERROR: No filename received")
        raise HTTPException(status_code=400, detail="No file selected.")

    allowed_extensions = [".pdf", ".docx", ".txt"]
    file_extension = os.path.splitext(file.filename)[1].lower()

    print(f"2. File extension detected: {file_extension}")

    if file_extension not in allowed_extensions:
        print("ERROR: Unsupported file type")
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Please upload a PDF, DOCX, or TXT file.",
        )

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    document_id = str(uuid.uuid4())
    safe_filename = f"{document_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    try:
        print("3. Saving uploaded file...")
        print(f"File path: {file_path}")

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        print("4. File saved successfully")

        print("5. Loading document text...")
        documents = load_document(file_path)

        print(f"6. Document loaded successfully. Pages loaded: {len(documents)}")

        if not documents:
            print("ERROR: No documents/pages loaded")
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from this document.",
            )

        print("7. Checking extracted text length...")
        total_text_length = sum(len(doc.page_content.strip()) for doc in documents)
        print(f"Total extracted text length: {total_text_length}")

        if total_text_length == 0:
            print("ERROR: Extracted text length is 0")
            raise HTTPException(
                status_code=400,
                detail="This document does not contain readable text.",
            )

        print("8. Splitting document into chunks...")
        chunks = split_documents(documents)

        print(f"9. Chunks created after filtering: {len(chunks)}")

        if not chunks:
            print("ERROR: No useful chunks created")
            raise HTTPException(
                status_code=400,
                detail="No useful text chunks were found after filtering.",
            )

        print("10. Adding metadata to chunks...")

        for chunk in chunks:
            chunk.metadata["document_id"] = document_id
            chunk.metadata["filename"] = file.filename
            chunk.metadata["stored_filename"] = safe_filename

        print("11. Metadata added successfully")

        print("12. Storing chunks in ChromaDB...")
        store_documents(chunks)

        print("13. Chunks stored successfully in ChromaDB")

        print("14. Adding document to registry...")

        document_data = {
            "document_id": document_id,
            "filename": file.filename,
            "stored_filename": safe_filename,
            "pages_loaded": len(documents),
            "chunks_created": len(chunks),
        }

        add_document(document_data)

        print("15. Document added to registry")
        print("16. Upload route completed successfully\n")

        return {
            "message": "Document uploaded and indexed successfully",
            "document_id": document_id,
            "filename": file.filename,
            "stored_filename": safe_filename,
            "pages_loaded": len(documents),
            "chunks_created": len(chunks),
        }

    except HTTPException:
        print("HTTPException raised during upload")
        raise

    except Exception as error:
        print("UPLOAD ERROR OCCURRED")
        print(f"Error type: {type(error)}")
        print(f"Error message: {error}")

        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(error)}",
        )


@router.get("/")
def list_uploaded_documents():
    print("GET /documents/ called")

    documents = load_documents()

    print(f"Documents found: {len(documents)}")

    return {"documents": documents}


@router.delete("/clear/all")
def clear_all_documents():
    print("\n==============================")
    print("CLEAR ALL DOCUMENTS CALLED")
    print("==============================\n")

    try:
        print("1. Clearing ChromaDB vectorstore...")
        clear_vectorstore()

        print("2. Clearing document registry...")
        clear_documents()

        print("3. Clear all completed successfully")

        return {"message": "All documents cleared successfully"}

    except Exception as error:
        print("CLEAR ALL ERROR OCCURRED")
        print(f"Error type: {type(error)}")
        print(f"Error message: {error}")

        raise HTTPException(
            status_code=500,
            detail=f"Failed to clear documents: {str(error)}",
        )


@router.delete("/{document_id}")
def delete_uploaded_document(document_id: str):
    print("\n==============================")
    print(f"DELETE DOCUMENT CALLED: {document_id}")
    print("==============================\n")

    try:
        print("1. Deleting document vectors...")
        delete_document_vectors(document_id)

        print("2. Deleting document from registry...")
        delete_document(document_id)

        print("3. Delete completed successfully")

        return {
            "message": "Document deleted successfully",
            "document_id": document_id,
        }

    except Exception as error:
        print("DELETE DOCUMENT ERROR OCCURRED")
        print(f"Error type: {type(error)}")
        print(f"Error message: {error}")

        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete document: {str(error)}",
        )