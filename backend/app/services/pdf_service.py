from langchain_community.document_loaders import PyPDFLoader


def load_pdf(file_path: str):
    loader = PyPDFLoader(file_path)
    documents = loader.load()

    for page_number, doc in enumerate(documents, start=1):
        doc.metadata["page"] = page_number
        doc.metadata["source"] = file_path

        print(f"Page {page_number} text length: {len(doc.page_content.strip())}")

    return documents