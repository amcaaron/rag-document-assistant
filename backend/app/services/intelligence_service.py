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


def generate_document_intelligence(document_id: str, user_id: str):
    """
    Generates a document intelligence overview using user-scoped pgvector chunks
    from the selected document.
    """

    docs = search_chunks_in_pgvector(
        question=(
            "Summarize the main topic, key takeaways, important terms, "
            "suggested questions, and related topics from this document."
        ),
        user_id=user_id,
        document_id=document_id,
        match_count=12,
    )

    print("INTELLIGENCE DEBUG")
    print("Docs found:", len(docs) if docs else 0)

    if docs:
        print("First doc type:", type(docs[0]))
        print("First doc preview:", docs[0])

    context = extract_context_from_docs(docs)

    print("Context length:", len(context))
    print("Context preview:", context[:300])

    if not context.strip():
        return {
            "summary": "I could not find enough readable text to summarize this document.",
            "key_takeaways": [],
            "important_terms": [],
            "suggested_questions": [],
            "related_topics": [],
        }

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2)

    prompt = f"""
You are an AI document intelligence assistant.

Analyze the provided document context and return a structured JSON response.

Your goal is to help a user understand and retain information from the document faster.

Return ONLY valid JSON using this exact structure:

{{
  "summary": "A clear 4-6 sentence overview of the document.",
  "key_takeaways": [
    "Takeaway 1",
    "Takeaway 2",
    "Takeaway 3",
    "Takeaway 4",
    "Takeaway 5"
  ],
  "important_terms": [
    {{
      "term": "Term 1",
      "definition": "Simple definition based on the document."
    }},
    {{
      "term": "Term 2",
      "definition": "Simple definition based on the document."
    }}
  ],
  "suggested_questions": [
    "Question 1?",
    "Question 2?",
    "Question 3?",
    "Question 4?",
    "Question 5?"
  ],
  "related_topics": [
    "Related topic 1",
    "Related topic 2",
    "Related topic 3",
    "Related topic 4",
    "Related topic 5"
  ]
}}

Rules:
- Use only the provided document context.
- Do not invent facts that are not supported by the document.
- Keep the language clear and beginner-friendly.
- Important terms should help the user understand the document.
- Suggested questions should be useful follow-up questions the user may ask.
- Related topics should help the user expand their understanding of the document topic.
- Return valid JSON only. Do not include markdown.

Document Context:
{context}
"""

    response = llm.invoke(prompt)

    try:
        return json.loads(response.content)
    except json.JSONDecodeError:
        return {
            "summary": response.content,
            "key_takeaways": [],
            "important_terms": [],
            "suggested_questions": [],
            "related_topics": [],
        }