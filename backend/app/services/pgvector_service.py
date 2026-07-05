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
            page_number = int(page_number) + 1

        content = chunk.page_content.strip()

        if not content:
            continue

        embedding = create_embedding(content)

        rows.append(
            {
                "user_id": user_id,
                "document_id": document_id,
                "filename": filename,
                "stored_filename": stored_filename,
                "storage_path": storage_path,
                "storage_url": storage_url,
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


def delete_document_chunks_from_pgvector(document_id: str, user_id: str | None = None) -> bool:
    query = supabase.table("document_chunks").delete().eq("document_id", document_id)

    if user_id:
      query = query.eq("user_id", user_id)

    query.execute()

    return True


def clear_user_chunks_from_pgvector(user_id: str) -> bool:
    supabase.table("document_chunks").delete().eq("user_id", user_id).execute()
    return True