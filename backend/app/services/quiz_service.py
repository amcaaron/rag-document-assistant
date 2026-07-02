import json
from langchain_openai import ChatOpenAI
from app.services.vector_service import get_vectorstore


def generate_document_quiz(document_id: str):
    """
    Generates a quiz from retrieved chunks belonging to the selected document.
    """

    vectorstore = get_vectorstore()

    retriever = vectorstore.as_retriever(
        search_kwargs={
            "k": 12,
            "filter": {"document_id": document_id},
        }
    )

    docs = retriever.invoke(
        "Create a helpful study quiz from the main ideas, key terms, and important details in this document."
    )

    if not docs:
        return {
            "multiple_choice": [],
            "short_answer": [],
        }

    context = "\n\n".join([doc.page_content for doc in docs])

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