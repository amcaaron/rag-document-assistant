from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_list_uploaded_documents():
    response = client.get("/documents/")

    assert response.status_code == 200
    assert "documents" in response.json()


def test_upload_rejects_unsupported_file_type():
    response = client.post(
        "/documents/upload",
        files={
            "file": ("test.exe", b"fake file content", "application/octet-stream")
        },
        data={
            "user_id": "test-user-id"
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "Unsupported file type. Please upload a PDF, DOCX, or TXT file."
    )