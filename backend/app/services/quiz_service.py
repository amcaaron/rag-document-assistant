import json

from langchain_openai import ChatOpenAI

from app.services.pgvector_service import search_chunks_in_pgvector

def extract_context_from_docs(docs) -> str:
    """
    Safely extracts readable text from pgvector search results.
    Supports both LangChain Document objects and dictionary results.
    """
    context_parts = []

    for doc in docs:
        content = ""

        if isinstance(doc, dict):
            content = (
                doc.get("content")
                or doc.get("page_content")
                or doc.get("text")
                or doc.get("chunk_text")
                or doc.get("metadata", {}).get("content", "")
                or ""
            )
        else:
            content = (
                getattr(doc, "page_content", "")
                or getattr(doc, "content", "")
                or getattr(doc, "text", "")
                or ""
            )

        if content is None:
            content = ""

        content = str(content).strip()

        if content:
            context_parts.append(content)

    return "\n\n".join(context_parts)

def generate_document_quiz(document_id: str, user_id: str):
    """
    Generates a quiz using user-scoped pgvector chunks from the selected document.
    """

    docs = search_chunks_in_pgvector(
        question=(
            "Create a helpful study quiz from the main ideas, key terms, "
            "and important details in this document."
        ),
        user_id=user_id,
        document_id=document_id,
        match_count=12,
    )

    print("QUIZ DEBUG")
    print("Docs found:", len(docs) if docs else 0)
    if docs:
        print("First doc type:", type(docs[0]))
        print("First doc preview:", docs[0])

    context = extract_context_from_docs(docs)

    print("Context length:", len(context))

    if not context.strip():
        return {
            "multiple_choice": [],
            "short_answer": [],
        }

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2)

    prompt = f"""
You are an AI study assistant.

Create a quiz based only on the provided document context.

Return ONLY valid JSON using this exact structure:

{{
  "multiple_choice": [
    {{
      "question": "Question text?",
      "options": ["A. Option one", "B. Option two", "C. Option three", "D. Option four"],
      "answer": "A. Option one",
      "explanation": "Brief explanation based on the document."
    }}
  ],
  "short_answer": [
    {{
      "question": "Question text?",
      "answer": "Expected short answer.",
      "explanation": "Brief explanation based on the document."
    }}
  ]
}}

Rules:
- Create exactly 5 multiple-choice questions.
- Create exactly 5 short-answer questions.
- Use only the provided document context.
- Do not invent information.
- Make questions useful for studying and retention.
- Keep explanations clear and beginner-friendly.
- Return valid JSON only.
- Do not include markdown.

Document Context:
{context}
"""

    response = llm.invoke(prompt)

    try:
        return json.loads(response.content)
    except json.JSONDecodeError:
        return {
            "multiple_choice": [],
            "short_answer": [
                {
                    "question": "Quiz generation response",
                    "answer": response.content,
                    "explanation": "The model returned text that could not be parsed as JSON.",
                }
            ],
        }