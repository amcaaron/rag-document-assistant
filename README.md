# DocuMind AI — RAG Personal Document Assistant

DocuMind AI is a full-stack Retrieval-Augmented Generation application that allows users to upload personal documents and interact with them using AI. Users can upload PDF, DOCX, and TXT files, ask natural language questions, receive source-cited answers, generate document summaries, create study quizzes, and save important AI responses as notes.

The system extracts document text, removes repeated junk content such as ads, headers, footers, and boilerplate text, splits content into searchable chunks, stores vector embeddings in ChromaDB, retrieves relevant sections through semantic search, and generates grounded responses using OpenAI and LangChain.

The application includes a React/Vite frontend deployed on Vercel and a FastAPI backend deployed on Render.

---

## Live Demo

Frontend:

```text
https://documind-ai-assistant.vercel.app/
```

Backend API:

```text
https://documind-ai-backend-wr40.onrender.com
```

FastAPI Docs:

```text
https://documind-ai-backend-wr40.onrender.com/docs
```

---

## Features

### Document Upload and Management

* Upload PDF, DOCX, and TXT documents
* Extract text from multiple document formats
* Remove repeated document noise such as ads, headers, footers, and boilerplate text
* Split documents into smaller searchable chunks
* Upload and manage multiple documents
* Select which uploaded document to ask questions about
* Clear all uploaded documents and reset the vector database
* Prevent users from asking questions before uploading or selecting a document

### Retrieval-Augmented Question Answering

* Generate vector embeddings using OpenAI
* Store document embeddings in ChromaDB
* Use document-specific metadata filtering to prevent sources from mixing across files
* Perform semantic search over selected document content
* Generate AI-powered answers using retrieved document context
* Display source citations with filename, page number, preview text, and clickable links
* Open cited PDF sources directly to the referenced page
* Maintain chat history for multi-question conversations

### AI Document Intelligence

* Generate a high-level document summary
* Extract key takeaways from uploaded documents
* Identify important terms and definitions
* Suggest helpful follow-up questions
* Recommend related topics for deeper exploration
* Display document insights in a polished tab-based interface

### Study Quiz Generation

* Generate multiple-choice questions from uploaded document content
* Generate short-answer questions from uploaded document content
* Display one question at a time using a clean tabbed layout
* Allow users to reveal answers and explanations
* Help users study and retain information from their uploaded files

### Saved Notes

* Save important AI-generated answers as notes
* Store saved notes in browser localStorage
* Display saved notes with the original question, answer, document name, and timestamp
* Delete saved notes when no longer needed
* Preserve saved notes after refreshing the browser

### User Interface

* Polished React frontend with responsive design
* Clean card-based layout
* Tabbed panels for AI overview, quizzes, source citations, and document actions
* Clickable citation panels for easier source review
* Mobile-friendly layout
* Deployed frontend on Vercel
* Deployed backend on Render

---

## Tech Stack

### Frontend

* React
* Vite
* Axios
* CSS
* localStorage
* Vercel

### Backend

* FastAPI
* Python
* LangChain
* OpenAI API
* ChromaDB
* PyPDF
* python-docx
* Uvicorn
* Render

---

## How It Works

The app follows a Retrieval-Augmented Generation pipeline:

```text
User uploads PDF, DOCX, or TXT document
        ↓
FastAPI saves the uploaded file
        ↓
Text is extracted from the document
        ↓
Repeated junk text is removed
        ↓
Text is split into searchable chunks
        ↓
OpenAI creates vector embeddings
        ↓
Embeddings are stored in ChromaDB with document metadata
        ↓
User selects a document and asks a question
        ↓
Semantic search retrieves relevant chunks from the selected document
        ↓
OpenAI generates an answer using retrieved context
        ↓
Answer is returned with clickable source citations
        ↓
Conversation is displayed in chat history
        ↓
Users can save important answers as notes
```

---

## AI Document Intelligence Flow

```text
User selects an uploaded document
        ↓
User clicks Generate Document Overview
        ↓
Backend retrieves representative document chunks
        ↓
OpenAI analyzes the document content
        ↓
The app returns:
    - Summary
    - Key takeaways
    - Important terms
    - Suggested questions
    - Related topics
        ↓
Frontend displays results in a tabbed interface
```

---

## Quiz Generation Flow

```text
User selects an uploaded document
        ↓
User clicks Generate Study Quiz
        ↓
Backend retrieves relevant document chunks
        ↓
OpenAI generates quiz content
        ↓
The app returns:
    - Multiple-choice questions
    - Short-answer questions
    - Answers
    - Explanations
        ↓
Frontend displays questions one at a time
```

---

## Architecture

```text
React/Vite Frontend
    │
    ├── Upload PDF, DOCX, or TXT files
    ├── Display uploaded documents
    ├── Select active document
    ├── Ask document-specific questions
    ├── Show chat history
    ├── Save important answers as notes
    ├── Generate document intelligence
    ├── Generate study quizzes
    └── Display clickable source citations
            ↓
FastAPI Backend
    │
    ├── Document upload endpoint
    ├── Document list endpoint
    ├── Document clear endpoint
    ├── Static file serving for uploaded documents
    ├── Question-answering endpoint
    ├── Document intelligence endpoint
    └── Quiz generation endpoint
            ↓
Document Processing
    │
    ├── PDF text extraction
    ├── DOCX text extraction
    ├── TXT text extraction
    ├── Repeated header/ad/footer filtering
    ├── Text chunking
    └── Metadata assignment
            ↓
Vector Search
    │
    ├── OpenAI embeddings
    ├── ChromaDB vector storage
    ├── Document ID metadata filtering
    └── Semantic retrieval
            ↓
LLM Response
    │
    ├── Retrieved context
    ├── OpenAI chat model
    ├── Source-cited answers
    ├── Document summaries
    └── Study quiz generation
```

---

## Project Structure

```text
RagDocumentAssistantProject/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── routes/
│   │   │   ├── upload_routes.py
│   │   │   ├── chat_routes.py
│   │   │   ├── intelligence_routes.py
│   │   │   └── quiz_routes.py
│   │   └── services/
│   │       ├── pdf_service.py
│   │       ├── vector_service.py
│   │       ├── rag_service.py
│   │       ├── intelligence_service.py
│   │       ├── quiz_service.py
│   │       └── document_registry.py
│   │
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   └── styles.css
│   │
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

> Note: `uploads/`, `chroma_db/`, `.env`, `venv/`, `documents.json`, and `node_modules/` are intentionally excluded from GitHub.

---

## Backend Setup

Navigate to the backend folder:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside the `backend` folder:

```env
OPENAI_API_KEY=your_openai_api_key_here
CHROMA_DB_PATH=./chroma_db
UPLOAD_DIR=./uploads
```

Run the backend server:

```bash
python -m uvicorn app.main:app --reload
```

The backend will run at:

```text
http://127.0.0.1:8000
```

FastAPI documentation is available at:

```text
http://127.0.0.1:8000/docs
```

---

## Frontend Setup

Navigate to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `frontend` folder if you want to override the local backend URL:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Run the frontend development server:

```bash
npm run dev
```

The frontend will run at:

```text
http://localhost:5173
```

---

## Deployment

### Frontend

The frontend is deployed on Vercel.

Required Vercel environment variable:

```env
VITE_API_BASE_URL=https://your-render-backend-url.onrender.com
```

### Backend

The backend is deployed on Render.

Render settings:

```text
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Required Render environment variables:

```env
OPENAI_API_KEY=your_openai_api_key_here
CHROMA_DB_PATH=./chroma_db
UPLOAD_DIR=./uploads
```

---

## API Endpoints

### Upload Document

```http
POST /documents/upload
```

Uploads a PDF, DOCX, or TXT document, extracts text, removes repeated junk content, creates chunks, generates embeddings, and stores them in ChromaDB.

Example response:

```json
{
  "message": "Document uploaded and indexed successfully",
  "document_id": "example-document-id",
  "filename": "example.pdf",
  "pages_loaded": 3,
  "chunks_created": 8
}
```

### List Uploaded Documents

```http
GET /documents/
```

Returns all currently uploaded documents.

Example response:

```json
{
  "documents": [
    {
      "document_id": "example-document-id",
      "filename": "example.pdf",
      "pages_loaded": 3,
      "chunks_created": 8
    }
  ]
}
```

### Ask a Question

```http
POST /chat/ask
```

Accepts a user question and document ID, retrieves relevant chunks from the selected document, and returns an AI-generated answer with source citations.

Example request:

```json
{
  "question": "What is this document about?",
  "document_id": "example-document-id"
}
```

Example response:

```json
{
  "answer": "The document explains...",
  "sources": [
    {
      "source": "example.pdf",
      "page": 1,
      "preview": "This section discusses...",
      "url": "https://your-backend-url.onrender.com/uploads/example.pdf#page=1"
    }
  ]
}
```

### Generate Document Intelligence

```http
POST /documents/{document_id}/intelligence
```

Generates a structured overview of the selected document, including summary, key takeaways, important terms, suggested questions, and related topics.

Example response:

```json
{
  "document_id": "example-document-id",
  "filename": "example.pdf",
  "intelligence": {
    "summary": "This document explains...",
    "key_takeaways": [
      "Key idea one",
      "Key idea two"
    ],
    "important_terms": [
      {
        "term": "Example Term",
        "definition": "A short definition of the term."
      }
    ],
    "suggested_questions": [
      "What is the main argument of this document?"
    ],
    "related_topics": [
      "Related topic one",
      "Related topic two"
    ]
  }
}
```

### Generate Study Quiz

```http
POST /documents/{document_id}/quiz
```

Generates multiple-choice and short-answer questions from the selected document.

Example response:

```json
{
  "document_id": "example-document-id",
  "filename": "example.pdf",
  "quiz": {
    "multiple_choice": [
      {
        "question": "What is the main idea of the document?",
        "options": [
          "A. Option one",
          "B. Option two",
          "C. Option three",
          "D. Option four"
        ],
        "answer": "A. Option one",
        "explanation": "This answer is supported by the document because..."
      }
    ],
    "short_answer": [
      {
        "question": "Explain the main idea in your own words.",
        "answer": "The document mainly explains...",
        "explanation": "This is supported by the document because..."
      }
    ]
  }
}
```

### Delete a Document

```http
DELETE /documents/{document_id}
```

Deletes a specific document and removes its vectors from ChromaDB.

Example response:

```json
{
  "message": "Document deleted successfully",
  "document_id": "example-document-id"
}
```

### Clear All Documents

```http
DELETE /documents/clear/all
```

Clears all uploaded documents and resets the ChromaDB collection.

Example response:

```json
{
  "message": "All documents cleared successfully"
}
```

---

## Current Behavior

DocuMind AI supports multiple uploaded documents. Each document receives a unique document ID, and each embedded chunk is stored with metadata tied to that document. When a user selects a document and asks a question, the retriever filters results by document ID so answers stay grounded in the selected file.

The frontend displays uploaded documents, the current selected document, chat history, AI document intelligence, generated quizzes, saved notes, and clickable source citations. PDF citations open the uploaded file directly to the cited page when supported by the browser.

Saved notes are currently stored in browser localStorage, allowing users to save important answers and return to them after refreshing the page.

---

## Known Limitations

* Uploaded files and ChromaDB data may reset after backend redeploys or server restarts on free/simple hosting.
* Saved notes are stored in browser localStorage and are not yet synced across devices.
* Browser PDF viewers can jump to a cited page, but they cannot reliably highlight the exact cited sentence inside the PDF.
* DOCX files may download instead of previewing directly in the browser, depending on browser behavior.
* This project is designed as a portfolio/demo application, not a production document management system.

---

## Environment Variables

### Backend

```env
OPENAI_API_KEY=your_openai_api_key_here
CHROMA_DB_PATH=./chroma_db
UPLOAD_DIR=./uploads
```

### Frontend

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

For deployment, use your Render backend URL:

```env
VITE_API_BASE_URL=https://your-render-backend-url.onrender.com
```

---

## Security Notes

The following files and folders should not be pushed to GitHub:

```text
backend/.env
.env
backend/venv/
backend/uploads/
backend/chroma_db/
backend/documents.json
frontend/node_modules/
frontend/.env
```

These should be excluded in `.gitignore`.

---

## Problems Solved

DocuMind AI solves the problem of manually searching through long documents by allowing users to ask natural language questions and receive document-grounded answers. Instead of relying on keyword search or general chatbot knowledge, the app uses semantic retrieval to find relevant document sections and generate answers from uploaded content.

The project improves transparency by returning clickable source citations, helping users verify exactly where answers came from.

It also supports learning and retention. Users can generate document summaries, key takeaways, glossary terms, suggested questions, related topics, and study quizzes. This turns uploaded documents into interactive study material rather than static files.

In addition, the project addresses a common real-world RAG challenge: noisy document extraction. Web-exported PDFs often contain repeated ads, headers, footers, and navigation text. DocuMind AI includes preprocessing logic to reduce repeated junk content before generating embeddings, improving retrieval quality and citation relevance.

---

## Future Improvements

* Add user authentication
* Add persistent cloud file storage
* Move saved notes from localStorage to a user-specific database
* Replace local ChromaDB with a managed vector database
* Add individual document deletion controls in the frontend
* Add streaming AI responses
* Add downloadable chat history
* Add downloadable saved notes
* Add custom PDF viewer with exact text highlighting
* Add user-specific document collections
* Add file size limits and upload progress indicators
* Add automated tests for backend endpoints
* Add CI/CD checks with GitHub Actions

---

## Resume Summary

Built and deployed a full-stack Retrieval-Augmented Generation personal document assistant using React, FastAPI, LangChain, OpenAI API, and ChromaDB. The application supports PDF, DOCX, and TXT uploads, multi-document selection, semantic search, document-specific metadata filtering, chat history, AI-generated document summaries, key takeaways, glossary terms, suggested questions, study quizzes, saved notes, junk text preprocessing, and clickable source citations.

---

## Author

Aaron Cole