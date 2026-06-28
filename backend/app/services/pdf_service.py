import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document
from docx import Document as DocxDocument


def load_pdf(file_path: str):
    loader = PyPDFLoader(file_path)
    documents = loader.load()

    for page_number, doc in enumerate(documents, start=1):
        doc.metadata["page"] = page_number
        doc.metadata["source"] = file_path

        print(f"Page {page_number} text length: {len(doc.page_content.strip())}")

    return documents


def load_txt(file_path: str):
    with open(file_path, "r", encoding="utf-8") as file:
        text = file.read()

    document = Document(
        page_content=text,
        metadata={
            "source": file_path,
            "page": 1
        }
    )

    print(f"TXT text length: {len(text.strip())}")

    return [document]


def load_docx(file_path: str):
    docx_file = DocxDocument(file_path)

    paragraphs = [
        paragraph.text
        for paragraph in docx_file.paragraphs
        if paragraph.text.strip()
    ]

    text = "\n".join(paragraphs)

    document = Document(
        page_content=text,
        metadata={
            "source": file_path,
            "page": 1
        }
    )

    print(f"DOCX text length: {len(text.strip())}")

    return [document]


def load_document(file_path: str):
    extension = os.path.splitext(file_path)[1].lower()

    if extension == ".pdf":
        return load_pdf(file_path)

    if extension == ".txt":
        return load_txt(file_path)

    if extension == ".docx":
        return load_docx(file_path)

    raise ValueError("Unsupported file type. Please upload a PDF, DOCX, or TXT file.")