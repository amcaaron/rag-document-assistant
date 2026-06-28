import os
import chromadb
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma
from app.config import CHROMA_DB_PATH


COLLECTION_NAME = "documents"


def split_documents(documents):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )

    chunks = splitter.split_documents(documents)

    useful_chunks = [
        chunk for chunk in chunks
        if is_useful_chunk(chunk)
    ]

    return useful_chunks


def get_chroma_client():
    os.makedirs(CHROMA_DB_PATH, exist_ok=True)
    return chromadb.PersistentClient(path=CHROMA_DB_PATH)


def clear_vectorstore():
    os.makedirs(CHROMA_DB_PATH, exist_ok=True)

    client = get_chroma_client()

    try:
        client.delete_collection(name=COLLECTION_NAME)
        print("Old Chroma collection deleted.")
    except Exception:
        print("No existing Chroma collection to delete.")


def delete_document_vectors(document_id: str):
    vectorstore = get_vectorstore()

    try:
        vectorstore.delete(where={"document_id": document_id})
        print(f"Deleted vectors for document_id: {document_id}")
    except Exception as error:
        print(f"Could not delete vectors for document_id {document_id}: {error}")

def is_useful_chunk(chunk):
    text = chunk.page_content.strip().lower()

    if len(text) < 80:
        return False

    junk_phrases = [
        "this website uses cookies",
        "privacy policy",
        "advertisement",
        "subscribe",
        "sign up",
        "accept cookies",
        "cookie notice",
        "terms of use",
        "all rights reserved",
        "follow us",
        "share this",
        "skip to main content",
        "navigation",
        "menu",
        "contact us",
    ]

    junk_matches = sum(phrase in text for phrase in junk_phrases)

    if junk_matches >= 2:
        return False

    return True


def store_documents(chunks):
    os.makedirs(CHROMA_DB_PATH, exist_ok=True)

    embeddings = OpenAIEmbeddings()

    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=CHROMA_DB_PATH,
        collection_name=COLLECTION_NAME
    )

    return vectorstore


def get_vectorstore():
    os.makedirs(CHROMA_DB_PATH, exist_ok=True)

    embeddings = OpenAIEmbeddings()

    vectorstore = Chroma(
        persist_directory=CHROMA_DB_PATH,
        embedding_function=embeddings,
        collection_name=COLLECTION_NAME
    )

    return vectorstore