from langchain_openai import ChatOpenAI

from app.services.pgvector_service import search_chunks_in_pgvector


def answer_question(question: str, document_id: str, user_id: str):
    if not user_id:
        return {
            "answer": "User authentication is required to search this document.",
            "sources": [],
        }

    docs = search_chunks_in_pgvector(
        question=question,
        user_id=user_id,
        document_id=document_id,
        match_count=8,
    )

    if not docs:
        return {
            "answer": "I could not find that information in the uploaded document.",
            "sources": [],
        }

    context = "\n\n".join([doc.get("content", "") for doc in docs])

    sources = []

    for doc in docs:
        filename = doc.get("filename", "Unknown")
        page = doc.get("page") or "Unknown"
        storage_url = doc.get("storage_url")
        content = doc.get("content", "")

        if storage_url and filename.lower().endswith(".pdf") and page != "Unknown":
            citation_url = f"{storage_url}#page={page}"
        else:
            citation_url = storage_url

        sources.append(
            {
                "source": filename,
                "page": page,
                "preview": content[:250],
                "url": citation_url,
                "similarity": doc.get("similarity"),
            }
        )

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
        "sources": sources,
    }