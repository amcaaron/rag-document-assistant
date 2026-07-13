from tests.conftest import client


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
    )

    assert response.status_code == 400
    assert "Unsupported file type" in response.json()["detail"]