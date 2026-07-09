import os
from typing import Any

from openai import OpenAI
from supabase import create_client


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL:
    raise ValueError("SUPABASE_URL is missing from backend environment variables.")

if not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("SUPABASE_SERVICE_ROLE_KEY is missing from backend environment variables.")


supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def create_embedding(text: str) -> list[float]:
    response = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=text,
    )

    return response.data[0].embedding

def sanitize_postgres_text(text: str) -> str:
    if not text:
        return ""

    return (
        text
        .replace("\x00", "")
        .replace("\u0000", "")
        .strip()
    )


def store_chunks_in_pgvector(
    chunks: list[Any],
    user_id: str,
    document_id: str,
    filename: str,
    stored_filename: str | None = None,
    storage_path: str | None = None,
    storage_url: str | None = None,
) -> int:
    rows = []

    for index, chunk in enumerate(chunks):
        page_number = chunk.metadata.get("page")

        if page_number is not None:
            page_number = int(page_number)
        else:
            page_number = 1

        content = sanitize_postgres_text(chunk.page_content)

        if not content:
            continue

        embedding = create_embedding(content)

        rows.append(
            {
                "user_id": user_id,
                "document_id": document_id,
                "filename": sanitize_postgres_text(filename),
                "stored_filename": sanitize_postgres_text(stored_filename),
                "storage_path": sanitize_postgres_text(storage_path),
                "storage_url": sanitize_postgres_text(storage_url),
                "page": page_number,
                "chunk_index": index,
                "content": content,
                "embedding": embedding,
            }
        )

    if not rows:
        return 0

    supabase.table("document_chunks").insert(rows).execute()

    return len(rows)


def search_chunks_in_pgvector(
    question: str,
    user_id: str,
    document_id: str,
    match_count: int = 5,
) -> list[dict]:
    query_embedding = create_embedding(question)

    response = supabase.rpc(
        "match_document_chunks",
        {
            "query_embedding": query_embedding,
            "match_user_id": user_id,
            "match_document_id": document_id,
            "match_count": match_count,
        },
    ).execute()

    return response.data or []


def delete_document_chunks_from_pgvector(document_id: str, user_id: str) -> None:
    supabase.table("document_chunks").delete().eq(
        "document_id", document_id
    ).eq(
        "user_id", user_id
    ).execute()


def clear_user_chunks_from_pgvector(user_id: str) -> None:
    supabase.table("document_chunks").delete().eq("user_id", user_id).execute()