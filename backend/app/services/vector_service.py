import os
import re
import chromadb
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma
from app.config import CHROMA_DB_PATH


COLLECTION_NAME = "documents"


def clean_text(text: str) -> str:
    """
    Normalizes spacing so the chunk filter works more consistently.
    """
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def is_useful_chunk(chunk) -> bool:
    """
    Filters out low-value chunks such as cookie notices, ads,
    navigation menus, footers, and very short text.
    """
    text = clean_text(chunk.page_content)
    lower_text = text.lower()

    # Remove very short chunks
    if len(text) < 120:
        return False

    junk_phrases = [
        "this website uses cookies",
        "uses cookies",
        "cookie policy",
        "cookie notice",
        "accept cookies",
        "privacy policy",
        "terms of use",
        "terms and conditions",
        "all rights reserved",
        "advertisement",
        "advertisements",
        "sponsored content",
        "subscribe",
        "sign up",
        "newsletter",
        "follow us",
        "share this",
        "share on",
        "skip to main content",
        "main navigation",
        "site navigation",
        "menu",
        "contact us",
        "about us",
        "related articles",
        "recommended articles",
        "copyright",
        "log in",
        "login",
        "register",
    ]

    junk_matches = sum(phrase in lower_text for phrase in junk_phrases)

    # If multiple junk phrases appear, it is probably not article content
    if junk_matches >= 2:
        return False

    # Filter chunks that are mostly links/navigation-style text
    word_count = len(text.split())
    unique_word_count = len(set(text.lower().split()))

    if word_count > 0:
        unique_ratio = unique_word_count / word_count

        # Very repetitive chunks are often menus, footers, or ads
        if unique_ratio < 0.35:
            return False

    return True


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

    print(f"Original chunks: {len(chunks)}")
    print(f"Useful chunks after filtering: {len(useful_chunks)}")

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