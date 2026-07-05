import os
import mimetypes
from supabase import create_client


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_STORAGE_BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET", "documents")


if not SUPABASE_URL:
    raise ValueError("SUPABASE_URL is missing from backend environment variables.")

if not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("SUPABASE_SERVICE_ROLE_KEY is missing from backend environment variables.")


supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def upload_file_to_supabase(local_file_path: str, storage_path: str) -> dict:
    content_type, _ = mimetypes.guess_type(local_file_path)

    if not content_type:
        content_type = "application/octet-stream"

    with open(local_file_path, "rb") as file:
        supabase.storage.from_(SUPABASE_STORAGE_BUCKET).upload(
            path=storage_path,
            file=file,
            file_options={
                "content-type": content_type,
                "upsert": "true",
            },
        )

    public_url_response = supabase.storage.from_(
        SUPABASE_STORAGE_BUCKET
    ).get_public_url(storage_path)

    return {
        "storage_path": storage_path,
        "storage_url": public_url_response,
    }


def delete_file_from_supabase(storage_path: str) -> bool:
    if not storage_path:
        return False

    supabase.storage.from_(SUPABASE_STORAGE_BUCKET).remove([storage_path])
    return True