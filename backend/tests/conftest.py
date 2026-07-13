import os
import sys
from pathlib import Path

from fastapi.testclient import TestClient

os.environ.setdefault("OPENAI_API_KEY", "test-openai-key")
os.environ.setdefault("SUPABASE_URL", "https://example.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key")
os.environ.setdefault("SUPABASE_STORAGE_BUCKET", "documents")

backend_root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(backend_root))

from app.main import app
from app.services.auth_service import get_current_user


def override_get_current_user():
    return {
        "id": "test-user-id",
        "email": "test@example.com",
    }


app.dependency_overrides[get_current_user] = override_get_current_user

client = TestClient(app)