from langchain_openai import ChatOpenAI
from app.services.vector_service import get_vectorstore

def answer_question(question: str):
    vectorstore = get_vectorstore()

    retriever = vectorstore.as_retriever(
        search_kwargs={"k": 4}
    )

    docs = retriever.invoke(question)

    context = "\n\n".join([doc.page_content for doc in docs])

    sources = []
    for doc in docs:
        sources.append({
            "source": doc.metadata.get("source", "Unknown"),
            "page": doc.metadata.get("page", "Unknown"),
            "preview": doc.page_content[:250]
        })

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

    prompt = f"""
You are a helpful AI assistant that answers questions using only the provided document context.

If the answer is not in the context, say:
"I could not find that information in the uploaded documents."

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