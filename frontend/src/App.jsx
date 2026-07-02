import { useState } from "react";
import {
  uploadDocument,
  getDocuments,
  askQuestion,
  clearAllDocuments,
  getDocumentIntelligence,
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
  const [documentIntelligence, setDocumentIntelligence] = useState(null);
  const [loadingIntelligence, setLoadingIntelligence] = useState(false);

  const [openIntelligencePanels, setOpenIntelligencePanels] = useState({
    summary: true,
    takeaways: false,
    terms: false,
    questions: false,
    related: false,
  });

  const toggleIntelligencePanel = (panelName) => {
    setOpenIntelligencePanels({
      summary: false,
      takeaways: false,
      terms: false,
      questions: false,
      related: false,
      [panelName]: true,
    });
  };

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
    setUploadMessage("Uploading and indexing document...");
  
    try {
      const data = await uploadDocument(file);
      console.log("FRONTEND UPLOAD RESPONSE:", data);
  
      setUploadMessage("Upload worked.");
  
      setCurrentDocument({
        document_id: data.document_id,
        filename: data.filename || file.name,
        pages: data.pages_loaded || 0,
        chunks: data.chunks_created || 0,
      });
  
      setSelectedDocumentId(data.document_id || "");
  
      setDocuments([
        {
          document_id: data.document_id,
          filename: data.filename || file.name,
          pages_loaded: data.pages_loaded || 0,
          chunks_created: data.chunks_created || 0,
        },
      ]);
  
      setQuestion("");
      setAnswer("");
      setSources([]);
      setChatHistory([]);
      setDocumentIntelligence(null);
    } catch (error) {
      console.error("FRONTEND UPLOAD ERROR:", error);
  
      setUploadMessage(
        error.response?.data?.detail ||
          error.message ||
          "Upload failed. Please try again."
      );
    } finally {
      setLoadingUpload(false);
    }
  };

  const handleSelectDocument = (documentId) => {
    if (!documentId) {
      return;
    }
  
    const selected = documents.find((doc) => doc.document_id === documentId);
  
    if (!selected) {
      return;
    }
  
    setSelectedDocumentId(documentId);
  
    setCurrentDocument({
      document_id: selected.document_id,
      filename: selected.filename || "Untitled document",
      pages: selected.pages_loaded || 0,
      chunks: selected.chunks_created || 0,
    });
  
    setQuestion("");
    setAnswer("");
    setSources([]);
    setChatHistory([]);
    setDocumentIntelligence(null);
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

      const safeAnswer =
        typeof data.answer === "string"
          ? data.answer
          : JSON.stringify(data.answer);

      const safeSources = Array.isArray(data.sources) ? data.sources : [];

      const newChatEntry = {
        question: userQuestion,
        answer: safeAnswer,
        sources: safeSources,
      };

      setChatHistory((prevHistory) => [...prevHistory, newChatEntry]);
      setAnswer(safeAnswer);
      setSources(safeSources);
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Something went wrong while getting the answer.";

      const newChatEntry = {
        question: userQuestion,
        answer: errorMessage,
        sources: [],
      };

      setChatHistory((prevHistory) => [...prevHistory, newChatEntry]);
      setAnswer(errorMessage);
    } finally {
      setLoadingAnswer(false);
    }
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
      setDocumentIntelligence(null);
      setFile(null);
    } catch (error) {
      setUploadMessage(
        error.response?.data?.detail ||
          "Something went wrong while clearing documents."
      );
    }
  };

  const handleGenerateIntelligence = async () => {
    if (!selectedDocumentId) {
      setUploadMessage("Please upload or select a document first.");
      return;
    }
  
    setLoadingIntelligence(true);
    setDocumentIntelligence(null);
  
    try {
      const data = await getDocumentIntelligence(selectedDocumentId);
  
      console.log("DOCUMENT INTELLIGENCE RESPONSE:", data);
  
      setDocumentIntelligence(data.intelligence);
    } catch (error) {
      console.error("DOCUMENT INTELLIGENCE ERROR:", error);
  
      setUploadMessage(
        error.response?.data?.detail ||
          error.message ||
          "Something went wrong while generating the document overview."
      );
    } finally {
      setLoadingIntelligence(false);
    }
  };

  return (
    <div className="app">
      <header className="hero">
        <p className="badge">RAG Personal Document Assistant</p>
        <h1>DocuMind AI</h1>
        <p>
          Upload your personal PDFs, DOCX, or TXT files and ask intelligent
          questions with semantic search, OpenAI, ChromaDB, and clickable source
          citations.
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

      {Array.isArray(documents) && documents.length > 0 && (
        <section className="card">
          <h2>Uploaded Documents</h2>

          <div className="document-list">
            {documents.map((doc, index) => (
              <div
                key={doc?.document_id || index}
                className={
                  doc?.document_id === selectedDocumentId
                    ? "document-item selected-document"
                    : "document-item"
                }
              >
                <div>
                  <p className="document-name">
                    {doc?.filename || "Untitled document"}
                  </p>
                  <p className="document-meta">
                    Pages: {doc?.pages_loaded ?? 0} | Chunks:{" "}
                    {doc?.chunks_created ?? 0}
                  </p>
                </div>

                <button
                  onClick={() => handleSelectDocument(doc?.document_id)}
                  disabled={!doc?.document_id}
                >
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

          <button
            onClick={handleGenerateIntelligence}
            disabled={loadingIntelligence}
          >
            {loadingIntelligence ? "Generating Overview..." : "Generate Document Overview"}
          </button>
        </section>
      )}

      {documentIntelligence && (
        <section className="card intelligence-card">
          <div className="intelligence-header">
            <p className="section-eyebrow">Document Overview</p>
            <h2>AI Document Intelligence</h2>
            <p className="intelligence-subtitle">
              Quickly understand the document with summaries, key ideas, glossary
              terms, suggested questions, and related topics.
            </p>
          </div>

          <div className="intelligence-tabs">
            <button
              className={
                openIntelligencePanels.summary
                  ? "intelligence-tab active-tab"
                  : "intelligence-tab"
              }
              onClick={() => toggleIntelligencePanel("summary")}
            >
              Summary
            </button>

            <button
              className={
                openIntelligencePanels.takeaways
                  ? "intelligence-tab active-tab"
                  : "intelligence-tab"
              }
              onClick={() => toggleIntelligencePanel("takeaways")}
            >
              Key Takeaways
            </button>

            <button
              className={
                openIntelligencePanels.terms
                  ? "intelligence-tab active-tab"
                  : "intelligence-tab"
              }
              onClick={() => toggleIntelligencePanel("terms")}
            >
              Important Terms
            </button>

            <button
              className={
                openIntelligencePanels.questions
                  ? "intelligence-tab active-tab"
                  : "intelligence-tab"
              }
              onClick={() => toggleIntelligencePanel("questions")}
            >
              Suggested Questions
            </button>

            <button
              className={
                openIntelligencePanels.related
                  ? "intelligence-tab active-tab"
                  : "intelligence-tab"
              }
              onClick={() => toggleIntelligencePanel("related")}
            >
              Explore More
            </button>
          </div>

          <div className="intelligence-content-panel">
            {openIntelligencePanels.summary && (
              <div className="intelligence-content">
                <h3>Summary</h3>
                <p>{documentIntelligence.summary}</p>
              </div>
            )}

            {openIntelligencePanels.takeaways &&
              Array.isArray(documentIntelligence.key_takeaways) &&
              documentIntelligence.key_takeaways.length > 0 && (
                <div className="intelligence-content">
                  <h3>Key Takeaways</h3>
                  <ul className="clean-list">
                    {documentIntelligence.key_takeaways.map((takeaway, index) => (
                      <li key={index}>{takeaway}</li>
                    ))}
                  </ul>
                </div>
              )}

            {openIntelligencePanels.terms &&
              Array.isArray(documentIntelligence.important_terms) &&
              documentIntelligence.important_terms.length > 0 && (
                <div className="intelligence-content">
                  <h3>Important Terms</h3>

                  <div className="term-grid">
                    {documentIntelligence.important_terms.map((item, index) => (
                      <div key={index} className="term-card">
                        <h4>{item.term}</h4>
                        <p>{item.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {openIntelligencePanels.questions &&
              Array.isArray(documentIntelligence.suggested_questions) &&
              documentIntelligence.suggested_questions.length > 0 && (
                <div className="intelligence-content">
                  <h3>Suggested Questions</h3>

                  <div className="question-chip-list">
                    {documentIntelligence.suggested_questions.map(
                      (suggested, index) => (
                        <button
                          key={index}
                          className="question-chip"
                          onClick={() => setQuestion(suggested)}
                        >
                          {suggested}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

            {openIntelligencePanels.related &&
              Array.isArray(documentIntelligence.related_topics) &&
              documentIntelligence.related_topics.length > 0 && (
                <div className="intelligence-content">
                  <h3>Explore More</h3>

                  <ul className="clean-list related-list">
                    {documentIntelligence.related_topics.map((topic, index) => (
                      <li key={index}>{topic}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
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

      {Array.isArray(chatHistory) && chatHistory.length > 0 && (
        <section className="card">
          <h2>Chat History</h2>

          {chatHistory.map((chat, index) => (
            <div key={index} className="chat-entry">
              <div className="user-message">
                <p className="message-label">You</p>
                <p>{chat?.question || "Question unavailable."}</p>
              </div>

              <div className="assistant-message">
                <p className="message-label">Assistant</p>
                <p className="answer">{chat?.answer || "Answer unavailable."}</p>

                {Array.isArray(chat?.sources) && chat.sources.length > 0 && (
                  <div className="chat-sources">
                    <h3>Sources</h3>

                    {chat.sources.map((source, sourceIndex) => (
                      <div key={sourceIndex} className="source">
                        {source?.url ? (
                          <a
                            className="citation-title citation-link"
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {source?.source || "Source"} — Page{" "}
                            {source?.page || "Unknown"}
                          </a>
                        ) : (
                          <p className="citation-title">
                            {source?.source || "Source"} — Page{" "}
                            {source?.page || "Unknown"}
                          </p>
                        )}

                        <p>{source?.preview || "No preview available."}...</p>
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