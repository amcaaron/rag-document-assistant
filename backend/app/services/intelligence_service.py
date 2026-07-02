import json
from langchain_openai import ChatOpenAI
from app.services.vector_service import get_vectorstore


def generate_document_intelligence(document_id: str):
    """
    Generates a document intelligence overview using retrieved chunks
    from the selected document.
    """

    vectorstore = get_vectorstore()

    retriever = vectorstore.as_retriever(
        search_kwargs={
            "k": 12,
            "filter": {"document_id": document_id},
        }
    )

    docs = retriever.invoke(
        "Summarize the main topic, key takeaways, important terms, suggested questions, and related topics from this document."
    )

    if not docs:
        return {
            "summary": "I could not find enough information to summarize this document.",
            "key_takeaways": [],
            "important_terms": [],
            "suggested_questions": [],
            "related_topics": [],
        }

    context = "\n\n".join([doc.page_content for doc in docs])

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