# DocuMind AI — RAG Personal Document Assistant

DocuMind AI is a full-stack Retrieval-Augmented Generation application that allows users to upload personal documents and ask natural language questions about their contents. The system supports PDF, DOCX, and TXT files, extracts document text, removes repeated junk content such as advertisements and headers, splits the content into searchable chunks, stores vector embeddings in ChromaDB, retrieves relevant sections through semantic search, and generates source-cited answers using OpenAI and LangChain.

The application includes a React/Vite frontend deployed on Vercel and a FastAPI backend deployed on Render.

## Live Demo

Frontend:

```text
https://rag-document-assistant-henna.vercel.app/
```

Backend API:

```text
Add your Render backend URL here
```

FastAPI Docs:

```text
Add your Render backend URL here/docs
```

## Features

* Upload PDF, DOCX, and TXT documents
* Extract text from multiple document formats
* Remove repeated document noise such as ads, headers, footers, and boilerplate text
* Split documents into smaller searchable chunks
* Generate vector embeddings using OpenAI
* Store document embeddings in ChromaDB
* Upload and manage multiple documents
* Select which uploaded document to ask questions about
* Use document-specific metadata filtering to prevent sources from mixing across files
* Perform semantic search over selected document content
* Generate AI-powered answers using retrieved document context
* Display source citations with filename, page number, preview text, and clickable links
* Open cited PDF sources directly to the referenced page
* Maintain chat history for multi-question conversations
* Clear all uploaded documents and reset the vector database
* Prevent users from asking questions before uploading or selecting a document
* Polished React frontend with responsive UI
* FastAPI backend with interactive API documentation
* Deployed frontend on Vercel
* Deployed backend on Render

## Tech Stack

### Frontend

* React
* Vite
* Axios
* CSS
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
```

## Architecture

```text
React/Vite Frontend
    │
    ├── Upload PDF, DOCX, or TXT files
    ├── Display uploaded documents
    ├── Select active document
    ├── Ask document-specific questions
    ├── Show chat history
    └── Display clickable citations
            ↓
FastAPI Backend
    │
    ├── Document upload endpoint
    ├── Document list endpoint
    ├── Document clear endpoint
    ├── Static file serving for uploaded documents
    └── Question-answering endpoint
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
│   │       ├── rag_service.py
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

## Current Behavior

DocuMind AI supports multiple uploaded documents. Each document receives a unique document ID, and each embedded chunk is stored with metadata tied to that document. When a user selects a document and asks a question, the retriever filters results by document ID so answers stay grounded in the selected file.

The frontend displays uploaded documents, the current selected document, chat history, and clickable source citations. PDF citations open the uploaded file directly to the cited page when supported by the browser.

## Known Limitations

* Uploaded files and ChromaDB data may reset after backend redeploys or server restarts on free/simple hosting.
* Browser PDF viewers can jump to a cited page, but they cannot reliably highlight the exact cited sentence inside the PDF.
* DOCX files may download instead of previewing directly in the browser, depending on browser behavior.
* This project is designed as a portfolio/demo application, not a production document management system.

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

## Problems Solved

DocuMind AI solves the problem of manually searching through long documents by allowing users to ask natural language questions and receive document-grounded answers. Instead of relying on keyword search or general chatbot knowledge, the app uses semantic retrieval to find relevant document sections and generate answers from uploaded content.

The project also improves transparency by returning clickable source citations, helping users verify where answers came from.

In addition, the project addresses a common real-world RAG challenge: noisy document extraction. Web-exported PDFs often contain repeated ads, headers, footers, and navigation text. DocuMind AI includes preprocessing logic to reduce repeated junk content before generating embeddings, improving retrieval quality and citation relevance.

## Future Improvements

* Add user authentication
* Add persistent cloud file storage
* Replace local ChromaDB with a managed vector database
* Add individual document deletion controls in the frontend
* Add streaming AI responses
* Add downloadable chat history
* Add custom PDF viewer with exact text highlighting
* Add user-specific document collections
* Add file size limits and upload progress indicators
* Add automated tests for backend endpoints
* Add CI/CD checks with GitHub Actions

## Resume Summary

Built and deployed a full-stack Retrieval-Augmented Generation personal document assistant using React, FastAPI, LangChain, OpenAI API, and ChromaDB. The application supports PDF, DOCX, and TXT uploads, multi-document selection, semantic search, document-specific metadata filtering, chat history, junk text preprocessing, and clickable source citations.

## Author

Aaron Cole
