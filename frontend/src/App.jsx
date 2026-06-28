import { useState } from "react";
import { uploadPDF, askQuestion, clearDocument } from "./api";
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

  const handleUpload = async () => {
    if (!file) {
      setUploadMessage("Please select a PDF first.");
      return;
    }

    setLoadingUpload(true);
    setUploadMessage("");
    setAnswer("");
    setSources([]);
    setQuestion("");
    setChatHistory([]);

    try {
      const data = await uploadPDF(file);

        setCurrentDocument({
          filename: data.filename,
          pages: data.pages_loaded,
          chunks: data.chunks_created,
        });

        setUploadMessage(data.message);
    } catch (error) {
      setUploadMessage(
        error.response?.data?.detail || "Upload failed. Please try again."
      );
    }

    setLoadingUpload(false);
  };

  const handleAsk = async () => {
    if (!currentDocument) {
      setAnswer("Please upload a document before asking a question.");
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
      const data = await askQuestion(userQuestion);
  
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

  const handleClearDocument = async () => {
    try {
      const data = await clearDocument();
  
      setCurrentDocument(null);
      setUploadMessage(data.message);
      setQuestion("");
      setAnswer("");
      setSources([]);
      setChatHistory([]);
      setFile(null);
    } catch (error) {
      setUploadMessage(
        error.response?.data?.detail ||
          "Something went wrong while clearing the document."
      );
    }
  };

  return (
    <div className="app">
      <header className="hero">
        <p className="badge">RAG Document Assistant</p>
        <h1>DocuMind AI</h1>
        <p>
          Upload a PDF and ask questions using semantic search, OpenAI, ChromaDB,
          and source citations.
        </p>
      </header>

      <section className="card">
        <h2>Upload PDF</h2>

        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button onClick={handleUpload} disabled={loadingUpload}>
          {loadingUpload ? "Processing..." : "Upload and Index PDF"}
        </button>

        {uploadMessage && <p className="message">{uploadMessage}</p>}
      </section>

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

          <button onClick={handleClearDocument} className="danger-button">
            Clear Current Document
          </button>
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
            <button onClick={handleAsk} disabled={loadingAnswer || !currentDocument}>
              {loadingAnswer ? "Thinking..." : "Ask Question"}
            </button>

            <button onClick={handleClear} className="secondary-button">
              Clear
            </button>
          </div>

          {!currentDocument && (
            <p className="helper-text">
              Upload a PDF before asking a question.
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
                        <p className="citation-title">
                          {source.source} — Page {source.page}
                        </p>
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