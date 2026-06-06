# DocuMind AI — Retrieval-Augmented Document Assistant

DocuMind AI is a full-stack Retrieval-Augmented Generation app that allows users to upload PDF documents and ask natural language questions about their contents. The system extracts text from uploaded PDFs, splits the text into searchable chunks, stores vector embeddings in ChromaDB, retrieves relevant document sections through semantic search, and generates source-cited answers using OpenAI and LangChain.

## Features

* Upload PDF documents
* Extract text from PDF files
* Split documents into smaller text chunks
* Generate vector embeddings using OpenAI
* Store document embeddings in ChromaDB
* Perform semantic search over uploaded document content
* Generate AI-powered answers using retrieved context
* Display source citations with page number and preview text
* React frontend for document upload and question answering
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
│   ├── uploads/
│   ├── chroma_db/
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
      "source": "./uploads/example.pdf",
      "page": 1,
      "preview": "This section discusses..."
    }
  ]
}
```

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

## Current Behavior

This version is designed to use one active document at a time. When a new PDF is uploaded, the previous ChromaDB collection is cleared and replaced with the newly uploaded document. This keeps answers focused on the most recent document and prevents old sources from mixing into new responses.

## Future Improvements

* Support multiple uploaded PDFs
* Add document selection
* Add document deletion
* Add chat history
* Add authentication
* Add streaming AI responses
* Add support for DOCX and TXT files
* Improve citation formatting
* Deploy backend to Render
* Deploy frontend to Vercel
* Add user-specific document collections

## Author

Aaron Cole
