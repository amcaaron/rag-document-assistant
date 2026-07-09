import os
from fastapi import Header, HTTPException
from supabase import create_client


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL:
    raise ValueError("SUPABASE_URL is missing from backend environment variables.")

if not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("SUPABASE_SERVICE_ROLE_KEY is missing from backend environment variables.")


supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header.")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header.")

    token = authorization.replace("Bearer ", "").strip()

    if not token:
        raise HTTPException(status_code=401, detail="Missing access token.")

    try:
        response = supabase.auth.get_user(token)
        user = response.user

        if not user:
            raise HTTPException(status_code=401, detail="Invalid or expired token.")

        return {
            "id": user.id,
            "email": user.email,
        }

    except HTTPException:
        raise
    except Exception as error:
        print("AUTH VERIFICATION ERROR:", error)
        raise HTTPException(status_code=401, detail="Could not verify user.")