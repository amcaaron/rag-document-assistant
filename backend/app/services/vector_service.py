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

    return splitter.split_documents(documents)


def clear_vectorstore():
    os.makedirs(CHROMA_DB_PATH, exist_ok=True)

    client = chromadb.PersistentClient(path=CHROMA_DB_PATH)

    try:
        client.delete_collection(name=COLLECTION_NAME)
        print("Old Chroma collection deleted.")
    except Exception:
        print("No existing Chroma collection to delete.")


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