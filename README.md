# DocuMind AI — Retrieval-Augmented Document Assistant

DocuMind AI is a full-stack Retrieval-Augmented Generation app that allows users to upload PDF documents and ask natural language questions about their contents. The system extracts text from uploaded PDFs, splits the text into searchable chunks, stores vector embeddings in ChromaDB, retrieves relevant document sections through semantic search, and generates source-cited answers using OpenAI and LangChain.

## Features

* Upload PDF documents
* Extract text from PDF files
* Split documents into smaller searchable chunks
* Generate vector embeddings using OpenAI
* Store document embeddings in ChromaDB
* Perform semantic search over uploaded document content
* Generate AI-powered answers using retrieved document context
* Display clean source citations with filename, page number, and preview text
* Show the active uploaded document with filename, page count, and chunk count
* Maintain chat history for multi-question conversations
* Clear the current document and reset the active ChromaDB collection
* Prevent users from asking questions before uploading a document
* React frontend for document upload, question answering, chat history, and citations
* FastAPI backend with interactive API documentation

## Tech Stack

### Frontend

* React
* Vite
* Axios
* CSS

### Backend

* FastAPI
* Python
* LangChain
* OpenAI API
* ChromaDB
* PyPDF
* Uvicorn

## How It Works

The app follows a Retrieval-Augmented Generation pipeline:

```text
User uploads PDF
        ↓
FastAPI saves the file
        ↓
PDF text is extracted
        ↓
Text is split into chunks
        ↓
OpenAI creates embeddings
        ↓
Embeddings are stored in ChromaDB
        ↓
User asks a question
        ↓
Semantic search retrieves relevant chunks
        ↓
LLM generates an answer from retrieved context
        ↓
Answer is returned with source citations
        ↓
Conversation is displayed in chat history
```

## Architecture

```text
React Frontend
    │
    ├── Upload PDF
    ├── Display current document
    ├── Ask questions
    ├── Show chat history
    └── Display citations
            ↓
FastAPI Backend
    │
    ├── PDF upload endpoint
    ├── Document clearing endpoint
    └── Question answering endpoint
            ↓
Document Processing
    │
    ├── PDF text extraction
    ├── Text chunking
    └── Metadata assignment
            ↓
Vector Search
    │
    ├── OpenAI embeddings
    ├── ChromaDB vector storage
    └── Semantic retrieval
            ↓
LLM Response
    │
    ├── Retrieved context
    ├── OpenAI chat model
    └── Source-cited answer
```

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
│   │   │   └── chat_routes.py
│   │   └── services/
│   │       ├── pdf_service.py
│   │       ├── vector_service.py
│   │       └── rag_service.py
│   │
│   ├── requirements.txt
│   └── .env
│
├── frontend/
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

> Note: `uploads/`, `chroma_db/`, `.env`, `venv/`, and `node_modules/` are intentionally excluded from GitHub.

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

## Frontend Setup

Navigate to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the frontend development server:

```bash
npm run dev
```

The frontend will run at:

```text
http://localhost:5173
```

## API Endpoints

### Upload PDF

```http
POST /documents/upload
```

Uploads a PDF, extracts text, creates chunks, generates embeddings, and stores them in ChromaDB.

When a new PDF is uploaded, the previous ChromaDB collection is cleared so the assistant answers from the most recently uploaded document only.

Example response:

```json
{
  "message": "PDF uploaded and indexed successfully",
  "filename": "example.pdf",
  "pages_loaded": 3,
  "chunks_created": 8
}
```

### Ask a Question

```http
POST /chat/ask
```

Accepts a user question and returns an AI-generated answer with source citations.

Example request:

```json
{
  "question": "What is this document about?"
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
      "preview": "This section discusses..."
    }
  ]
}
```

### Clear Current Document

```http
DELETE /documents/clear
```

Clears the active ChromaDB collection and resets the current document context.

Example response:

```json
{
  "message": "Current document cleared successfully"
}
```

## Current Behavior

This version uses one active document at a time. When a new PDF is uploaded, the previous ChromaDB collection is cleared and replaced with the newly uploaded document. This keeps answers focused on the most recent document and prevents old sources from mixing into new responses.

The frontend also displays the current document name, page count, chunk count, chat history, and source citations. If no document is active, users are prompted to upload a PDF before asking a question.

## Environment Variables

This project requires an OpenAI API key.

Create a `.env` file in the `backend` folder:

```env
OPENAI_API_KEY=your_openai_api_key_here
CHROMA_DB_PATH=./chroma_db
UPLOAD_DIR=./uploads
```

Do not commit the `.env` file to GitHub.

## Security Notes

The following files and folders should not be pushed to GitHub:

```text
backend/.env
backend/venv/
backend/uploads/
backend/chroma_db/
frontend/node_modules/
```

These are excluded in `.gitignore`.

## Problems Solved

DocuMind AI solves the problem of manually searching through long PDF documents by allowing users to ask natural language questions and receive document-grounded answers. Instead of relying on keyword search or general chatbot knowledge, the app uses semantic retrieval to find relevant document sections and generate answers from the uploaded content.

The project also improves transparency by returning source citations, helping users verify where the answer came from.

## Future Improvements

* Support multiple uploaded PDFs
* Add document selection
* Add document deletion for individual files
* Add support for DOCX and TXT files
* Add authentication
* Add streaming AI responses
* Add Pinecone or another managed vector database
* Deploy backend to Render
* Deploy frontend to Vercel
* Add user-specific document collections
* Add downloadable chat history

## Resume Summary

Built a full-stack Retrieval-Augmented Generation document assistant that enables users to upload PDFs and ask natural language questions about their contents. The system extracts document text, creates vector embeddings, stores them in ChromaDB, retrieves relevant context through semantic search, and generates source-cited answers using OpenAI and LangChain.

## Author

Aaron Cole
