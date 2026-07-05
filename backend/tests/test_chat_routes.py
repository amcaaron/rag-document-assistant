from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_chat_requires_question():
    response = client.post(
        "/chat/ask",
        json={
            "question": "",
            "document_id": "test-document-id",
            "user_id": "test-user-id",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Question cannot be empty."


def test_chat_requires_document_id():
    response = client.post(
        "/chat/ask",
        json={
            "question": "What is this document about?",
            "document_id": "",
            "user_id": "test-user-id",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Document ID is required."


def test_chat_requires_user_id():
    response = client.post(
        "/chat/ask",
        json={
            "question": "What is this document about?",
            "document_id": "test-document-id",
            "user_id": "",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "User ID is required."