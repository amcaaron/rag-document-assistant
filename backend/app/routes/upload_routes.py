import os
import shutil
import uuid

from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from app.config import UPLOAD_DIR
from app.services.pdf_service import load_document
from app.services.storage_service import (
    upload_file_to_supabase,
    delete_file_from_supabase,
)
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
def upload_document(
    file: UploadFile = File(...),
    user_id: str = Form(None),
):
    print("\n==============================")
    print("1. Upload request received")
    print(f"Uploaded filename: {file.filename}")
    print(f"User ID: {user_id}")
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
        print("3. Saving uploaded file locally...")
        print(f"File path: {file_path}")

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        print("4. File saved locally successfully")

        print("5. Uploading original file to Supabase Storage...")

        storage_owner = user_id if user_id else "anonymous"
        storage_path = f"{storage_owner}/{safe_filename}"

        storage_data = upload_file_to_supabase(
            local_file_path=file_path,
            storage_path=storage_path,
        )

        storage_url = storage_data.get("storage_url")

        print("6. File uploaded to Supabase Storage")
        print(f"Storage path: {storage_path}")
        print(f"Storage URL: {storage_url}")

        print("7. Loading document text...")
        documents = load_document(file_path)

        print(f"8. Document loaded successfully. Pages loaded: {len(documents)}")

        if not documents:
            print("ERROR: No documents/pages loaded")
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from this document.",
            )

        print("9. Checking extracted text length...")
        total_text_length = sum(len(doc.page_content.strip()) for doc in documents)
        print(f"Total extracted text length: {total_text_length}")

        if total_text_length == 0:
            print("ERROR: Extracted text length is 0")
            raise HTTPException(
                status_code=400,
                detail="This document does not contain readable text.",
            )

        print("10. Splitting document into chunks...")
        chunks = split_documents(documents)

        print(f"11. Chunks created after filtering: {len(chunks)}")

        if not chunks:
            print("ERROR: No useful chunks created")
            raise HTTPException(
                status_code=400,
                detail="No useful text chunks were found after filtering.",
            )

        print("12. Adding metadata to chunks...")

        for chunk in chunks:
            chunk.metadata["document_id"] = document_id
            chunk.metadata["filename"] = file.filename
            chunk.metadata["stored_filename"] = safe_filename
            chunk.metadata["storage_path"] = storage_path
            chunk.metadata["storage_url"] = storage_url

        print("13. Metadata added successfully")

        print("14. Storing chunks in ChromaDB...")
        store_documents(chunks)

        print("15. Chunks stored successfully in ChromaDB")

        print("16. Adding document to registry...")

        document_data = {
            "document_id": document_id,
            "filename": file.filename,
            "stored_filename": safe_filename,
            "pages_loaded": len(documents),
            "chunks_created": len(chunks),
            "storage_path": storage_path,
            "storage_url": storage_url,
        }

        add_document(document_data)

        print("17. Document added to registry")
        print("18. Upload route completed successfully\n")

        return {
            "message": "Document uploaded, indexed, and stored successfully",
            "document_id": document_id,
            "filename": file.filename,
            "stored_filename": safe_filename,
            "pages_loaded": len(documents),
            "chunks_created": len(chunks),
            "storage_path": storage_path,
            "storage_url": storage_url,
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
        print("1. Loading documents before clearing...")
        documents = load_documents()

        print("2. Deleting files from Supabase Storage...")
        for document in documents:
            storage_path = document.get("storage_path")

            if storage_path:
                delete_file_from_supabase(storage_path)

        print("3. Clearing ChromaDB vectorstore...")
        clear_vectorstore()

        print("4. Clearing document registry...")
        clear_documents()

        print("5. Clear all completed successfully")

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
        print("1. Loading documents to find storage path...")
        documents = load_documents()

        document_to_delete = next(
            (
                document
                for document in documents
                if document.get("document_id") == document_id
            ),
            None,
        )

        if document_to_delete:
            storage_path = document_to_delete.get("storage_path")

            if storage_path:
                print("2. Deleting file from Supabase Storage...")
                delete_file_from_supabase(storage_path)
            else:
                print("2. No Supabase storage path found for this document")
        else:
            print("2. Document not found in registry, continuing cleanup")

        print("3. Deleting document vectors...")
        delete_document_vectors(document_id)

        print("4. Deleting document from registry...")
        delete_document(document_id)

        print("5. Delete completed successfully")

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