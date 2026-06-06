import { useState } from "react";
import { uploadPDF, askQuestion } from "./api";
import "./styles.css";

function App() {
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
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

    try {
      const data = await uploadPDF(file);

      setUploadMessage(
        `${data.message} Pages loaded: ${data.pages_loaded}. Chunks created: ${data.chunks_created}.`
      );
    } catch (error) {
      setUploadMessage(
        error.response?.data?.detail || "Upload failed. Please try again."
      );
    }

    setLoadingUpload(false);
  };

  const handleAsk = async () => {
    if (!question.trim()) {
      setAnswer("Please enter a question first.");
      return;
    }

    setLoadingAnswer(true);
    setAnswer("");
    setSources([]);

    try {
      const data = await askQuestion(question);

      setAnswer(data.answer);
      setSources(data.sources || []);
    } catch (error) {
      setAnswer(
        error.response?.data?.detail ||
          "Something went wrong while getting the answer."
      );
    }

    setLoadingAnswer(false);
  };

  const handleClear = () => {
    setQuestion("");
    setAnswer("");
    setSources([]);
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
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button onClick={handleUpload} disabled={loadingUpload}>
          {loadingUpload ? "Processing..." : "Upload and Index PDF"}
        </button>

        {uploadMessage && <p className="message">{uploadMessage}</p>}
      </section>

      <section className="card">
        <h2>Ask a Question</h2>

        <textarea
          placeholder="Example: What is this document about?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <div className="button-row">
          <button onClick={handleAsk} disabled={loadingAnswer}>
            {loadingAnswer ? "Thinking..." : "Ask Question"}
          </button>

          <button onClick={handleClear} className="secondary-button">
            Clear
          </button>
        </div>
      </section>

      {answer && (
        <section className="card">
          <h2>Answer</h2>
          <p className="answer">{answer}</p>

          {sources.length > 0 && (
            <>
              <h3>Sources</h3>

              {sources.map((source, index) => (
                <div key={index} className="source">
                  <p>
                    <strong>Source:</strong> {source.source}
                  </p>
                  <p>
                    <strong>Page:</strong> {source.page}
                  </p>
                  <p>{source.preview}...</p>
                </div>
              ))}
            </>
          )}
        </section>
      )}
    </div>
  );
}

export default App;