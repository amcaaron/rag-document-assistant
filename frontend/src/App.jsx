import { useState } from "react";
import {
  uploadDocument,
  getDocuments,
  askQuestion,
  deleteDocument,
  clearAllDocuments,
} from "./api";
import "./styles.css";

function App() {
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");

  const loadDocuments = async () => {
    try {
      const data = await getDocuments();
      setDocuments(data.documents || []);
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadMessage("Please select a document first.");
      return;
    }

    setLoadingUpload(true);
    setUploadMessage("");
    setAnswer("");
    setSources([]);
    setQuestion("");
    setChatHistory([]);

    try {
      const data = await uploadDocument(file);

      setCurrentDocument({
        document_id: data.document_id,
        filename: data.filename,
        pages: data.pages_loaded,
        chunks: data.chunks_created,
      });

      setSelectedDocumentId(data.document_id);
      setUploadMessage(data.message);
      await loadDocuments();
    } catch (error) {
      setUploadMessage(
        error.response?.data?.detail || "Upload failed. Please try again."
      );
    }

    setLoadingUpload(false);
  };

  const handleSelectDocument = (documentId) => {
    const selected = documents.find((doc) => doc.document_id === documentId);

    if (!selected) {
      return;
    }

    setSelectedDocumentId(documentId);
    setCurrentDocument({
      document_id: selected.document_id,
      filename: selected.filename,
      pages: selected.pages_loaded,
      chunks: selected.chunks_created,
    });

    setQuestion("");
    setAnswer("");
    setSources([]);
    setChatHistory([]);
    setUploadMessage(`Selected document: ${selected.filename}`);
  };

  const handleAsk = async () => {
    if (!selectedDocumentId) {
      setAnswer("Please upload or select a document before asking a question.");
      return;
    }

    if (!question.trim()) {
      setAnswer("Please enter a question first.");
      return;
    }

    const userQuestion = question;

    setLoadingAnswer(true);
    setQuestion("");
    setAnswer("");
    setSources([]);

    try {
      const data = await askQuestion(userQuestion, selectedDocumentId);

      const newChatEntry = {
        question: userQuestion,
        answer: data.answer,
        sources: data.sources || [],
      };

      setChatHistory((prevHistory) => [...prevHistory, newChatEntry]);

      setAnswer(data.answer);
      setSources(data.sources || []);
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        "Something went wrong while getting the answer.";

      const newChatEntry = {
        question: userQuestion,
        answer: errorMessage,
        sources: [],
      };

      setChatHistory((prevHistory) => [...prevHistory, newChatEntry]);
      setAnswer(errorMessage);
    }

    setLoadingAnswer(false);
  };

  const handleClear = () => {
    setQuestion("");
    setAnswer("");
    setSources([]);
    setChatHistory([]);
  };

  const handleClearAllDocuments = async () => {
    try {
      const data = await clearAllDocuments();

      setDocuments([]);
      setCurrentDocument(null);
      setSelectedDocumentId("");
      setUploadMessage(data.message);
      setQuestion("");
      setAnswer("");
      setSources([]);
      setChatHistory([]);
      setFile(null);
    } catch (error) {
      setUploadMessage(
        error.response?.data?.detail ||
          "Something went wrong while clearing documents."
      );
    }
  };

  return (
    <div className="app">
      <header className="hero">
        <p className="badge">RAG Document Assistant</p>
        <h1>DocuMind AI</h1>
        <p>
          Upload PDF, DOCX, or TXT documents and ask questions using semantic
          search, OpenAI, ChromaDB, and source citations.
        </p>
      </header>

      <section className="card">
        <h2>Upload Document</h2>

        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button onClick={handleUpload} disabled={loadingUpload}>
          {loadingUpload ? "Processing..." : "Upload and Index Document"}
        </button>

        {uploadMessage && <p className="message">{uploadMessage}</p>}
      </section>

      {documents.length > 0 && (
        <section className="card">
          <h2>Uploaded Documents</h2>

          <div className="document-list">
            {documents.map((doc) => (
              <div
                key={doc.document_id}
                className={
                  doc.document_id === selectedDocumentId
                    ? "document-item selected-document"
                    : "document-item"
                }
              >
                <div>
                  <p className="document-name">{doc.filename}</p>
                  <p className="document-meta">
                    Pages: {doc.pages_loaded} | Chunks: {doc.chunks_created}
                  </p>
                </div>

                <button onClick={() => handleSelectDocument(doc.document_id)}>
                  Select
                </button>
              </div>
            ))}
          </div>

          <button onClick={handleClearAllDocuments} className="danger-button">
            Clear All Documents
          </button>
        </section>
      )}

      {currentDocument && (
        <section className="document-card">
          <h3>Current Document</h3>

          <p>
            <strong>File:</strong> {currentDocument.filename}
          </p>
          <p>
            <strong>Pages:</strong> {currentDocument.pages}
          </p>
          <p>
            <strong>Chunks:</strong> {currentDocument.chunks}
          </p>
        </section>
      )}

      <section className="card">
        <h2>Ask a Question</h2>

        <textarea
          placeholder="Example: What is this document about?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <div className="button-row">
          <button onClick={handleAsk} disabled={loadingAnswer || !selectedDocumentId}>
            {loadingAnswer ? "Thinking..." : "Ask Question"}
          </button>

          <button onClick={handleClear} className="secondary-button">
            Clear Chat
          </button>
        </div>

        {!selectedDocumentId && (
          <p className="helper-text">
            Upload or select a document before asking a question.
          </p>
        )}
      </section>

      {chatHistory.length > 0 && (
        <section className="card">
          <h2>Chat History</h2>

          {chatHistory.map((chat, index) => (
            <div key={index} className="chat-entry">
              <div className="user-message">
                <p className="message-label">You</p>
                <p>{chat.question}</p>
              </div>

              <div className="assistant-message">
                <p className="message-label">Assistant</p>
                <p className="answer">{chat.answer}</p>

                {chat.sources.length > 0 && (
                  <div className="chat-sources">
                    <h3>Sources</h3>

                    {chat.sources.map((source, sourceIndex) => (
                      <div key={sourceIndex} className="source">
                        <a
                          className="citation-title citation-link"
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {source.source} — Page {source.page}
                        </a>
                        <p>{source.preview}...</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

export default App;