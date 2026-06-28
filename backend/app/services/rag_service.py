import os
from langchain_openai import ChatOpenAI
from app.services.vector_service import get_vectorstore


def answer_question(question: str, document_id: str):
    vectorstore = get_vectorstore()

    retriever = vectorstore.as_retriever(
        search_kwargs={
            "k": 8,
            "filter": {
                "document_id": document_id
            }
        }
    )

    docs = retriever.invoke(question)

    context = "\n\n".join([doc.page_content for doc in docs])

    sources = []

    for doc in docs:
        source_path = doc.metadata.get("source", "Unknown")
        filename = os.path.basename(source_path)
        page = doc.metadata.get("page", 1)

        file_url = f"http://127.0.0.1:8000/uploads/{filename}"

        if filename.lower().endswith(".pdf"):
            citation_url = f"{file_url}#page={page}"
        else:
            citation_url = file_url

        sources.append({
            "source": filename,
            "page": page,
            "preview": doc.page_content[:250],
            "url": citation_url
        })

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

    prompt = f"""
You are a helpful AI assistant that answers questions using only the provided document context.

Use the provided context to answer the user's question clearly and accurately.
If the context contains relevant information, summarize it in a helpful way.

Ignore website navigation text, cookie notices, menus, ads, copyright text, contact links, and unrelated footer content.

If the answer cannot be found in the provided context, say:
"I could not find that information in the uploaded document."

Context:
{context}

Question:
{question}

Answer:
"""

    response = llm.invoke(prompt)

    return {
        "answer": response.content,
        "sources": sources
    }