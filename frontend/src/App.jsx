import { useState } from "react";
import {
  uploadDocument,
  getDocuments,
  askQuestion,
  clearAllDocuments,
  getDocumentIntelligence,
  getDocumentQuiz,
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

  const [documentQuiz, setDocumentQuiz] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [showQuizAnswers, setShowQuizAnswers] = useState({});
  const [activeQuizPanel, setActiveQuizPanel] = useState("multiple_choice");
  const [activeMultipleChoiceQuestion, setActiveMultipleChoiceQuestion] =
    useState(0);
  const [activeShortAnswerQuestion, setActiveShortAnswerQuestion] = useState(0);

  const [activeChatSources, setActiveChatSources] = useState({});
  const [activeSavedNoteSources, setActiveSavedNoteSources] = useState({});

  const cleanSourceName = (sourceName) => {
    if (!sourceName) {
      return "Source";
    }
  
    // Removes UUID prefix like:
    // 7321e15f-24a0-4df9-90db-d2d9e93af3b1_filename.pdf
    return sourceName.replace(
      /^[0-9a-fA-F-]{36}_/,
      ""
    );
  };

  const setActiveChatSource = (chatIndex, sourceIndex) => {
    setActiveChatSources((prevSources) => ({
      ...prevSources,
      [chatIndex]: sourceIndex,
    }));
  };
  
  const setActiveSavedNoteSource = (noteId, sourceIndex) => {
    setActiveSavedNoteSources((prevSources) => ({
      ...prevSources,
      [noteId]: sourceIndex,
    }));
  };

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

  const toggleQuizAnswer = (questionKey) => {
    setShowQuizAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionKey]: !prevAnswers[questionKey],
    }));
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

      setUploadMessage(data.message || "Document uploaded successfully.");

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
      setDocumentQuiz(null);
      setShowQuizAnswers({});
      setActiveQuizPanel("multiple_choice");
      setActiveMultipleChoiceQuestion(0);
      setActiveShortAnswerQuestion(0);
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
    setDocumentQuiz(null);
    setShowQuizAnswers({});
    setActiveQuizPanel("multiple_choice");
    setActiveMultipleChoiceQuestion(0);
    setActiveShortAnswerQuestion(0);
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
      setDocumentQuiz(null);
      setShowQuizAnswers({});
      setActiveQuizPanel("multiple_choice");
      setActiveMultipleChoiceQuestion(0);
      setActiveShortAnswerQuestion(0);
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

  const handleGenerateQuiz = async () => {
    if (!selectedDocumentId) {
      setUploadMessage("Please upload or select a document first.");
      return;
    }

    setLoadingQuiz(true);
    setDocumentQuiz(null);
    setShowQuizAnswers({});
    setActiveQuizPanel("multiple_choice");
    setActiveMultipleChoiceQuestion(0);
    setActiveShortAnswerQuestion(0);

    try {
      const data = await getDocumentQuiz(selectedDocumentId);

      console.log("DOCUMENT QUIZ RESPONSE:", data);

      setDocumentQuiz(data.quiz);
    } catch (error) {
      console.error("DOCUMENT QUIZ ERROR:", error);

      setUploadMessage(
        error.response?.data?.detail ||
          error.message ||
          "Something went wrong while generating the quiz."
      );
    } finally {
      setLoadingQuiz(false);
    }
  };

  const [savedNotes, setSavedNotes] = useState(() => {
    const storedNotes = localStorage.getItem("documind_saved_notes");
    return storedNotes ? JSON.parse(storedNotes) : [];
  });

  const saveNote = (chat) => {
    const newNote = {
      id: Date.now(),
      question: chat.question,
      answer: chat.answer,
      sources: chat.sources || [],
      documentName: currentDocument?.filename || "Unknown document",
      createdAt: new Date().toLocaleString(),
    };
  
    const updatedNotes = [newNote, ...savedNotes];
  
    setSavedNotes(updatedNotes);
    localStorage.setItem("documind_saved_notes", JSON.stringify(updatedNotes));
  };
  
  const deleteNote = (noteId) => {
    const updatedNotes = savedNotes.filter((note) => note.id !== noteId);
  
    setSavedNotes(updatedNotes);
    localStorage.setItem("documind_saved_notes", JSON.stringify(updatedNotes));
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

      <main className="dashboard-layout">
      <aside className="left-dashboard-panel">
        {/* Upload Document */}
        {/* Uploaded Documents */}
        {/* Current Document */}
        {/* AI Document Intelligence */}
        {/* Document Quiz */}
        {/* Saved Notes */}
      </aside>

      <section className="right-chat-panel">
        {/* Ask a Question */}
        {/* Chat History */}
      </section>
    </main>

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

          <div className="intelligence-tabs action-tabs">
            <button
              className={
                loadingIntelligence
                  ? "intelligence-tab action-tab-button active-tab"
                  : "intelligence-tab action-tab-button"
              }
              onClick={handleGenerateIntelligence}
              disabled={loadingIntelligence}
            >
              {loadingIntelligence
                ? "Generating Overview..."
                : "Generate Document Overview"}
            </button>

            <button
              className={
                loadingQuiz
                  ? "intelligence-tab action-tab-button active-tab"
                  : "intelligence-tab action-tab-button"
              }
              onClick={handleGenerateQuiz}
              disabled={loadingQuiz}
            >
              {loadingQuiz ? "Generating Quiz..." : "Generate Study Quiz"}
            </button>
          </div>
        </section>
      )}

      {documentIntelligence && (
        <section className="card intelligence-card">
          <div className="intelligence-header">
            <p className="section-eyebrow">Document Overview</p>
            <h2>AI Document Intelligence</h2>
            <p className="intelligence-subtitle">
              Quickly understand the document with summaries, key ideas,
              glossary terms, suggested questions, and related topics.
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
                    {documentIntelligence.key_takeaways.map(
                      (takeaway, index) => (
                        <li key={index}>{takeaway}</li>
                      )
                    )}
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

      {documentQuiz && (
        <section className="card quiz-card">
          <div className="quiz-header">
            <p className="section-eyebrow">Study Mode</p>
            <h2>Document Quiz</h2>
            <p className="intelligence-subtitle">
              Test your understanding with multiple-choice and short-answer
              questions generated from the selected document.
            </p>
          </div>

          <div className="intelligence-tabs">
            <button
              className={
                activeQuizPanel === "multiple_choice"
                  ? "intelligence-tab active-tab"
                  : "intelligence-tab"
              }
              onClick={() => setActiveQuizPanel("multiple_choice")}
            >
              Multiple Choice
            </button>

            <button
              className={
                activeQuizPanel === "short_answer"
                  ? "intelligence-tab active-tab"
                  : "intelligence-tab"
              }
              onClick={() => setActiveQuizPanel("short_answer")}
            >
              Short Answer
            </button>
          </div>

          <div className="quiz-content-panel">
            {activeQuizPanel === "multiple_choice" &&
              Array.isArray(documentQuiz.multiple_choice) &&
              documentQuiz.multiple_choice.length > 0 && (
                <div className="quiz-section">
                  <h3>Multiple Choice</h3>

                  <div className="intelligence-tabs">
                    {documentQuiz.multiple_choice.map((_, index) => (
                      <button
                        key={index}
                        className={
                          activeMultipleChoiceQuestion === index
                            ? "intelligence-tab active-tab"
                            : "intelligence-tab"
                        }
                        onClick={() => setActiveMultipleChoiceQuestion(index)}
                      >
                        Question {index + 1}
                      </button>
                    ))}
                  </div>

                  {(() => {
                    const item =
                      documentQuiz.multiple_choice[
                        activeMultipleChoiceQuestion
                      ];
                    const questionKey = `mc-${activeMultipleChoiceQuestion}`;

                    if (!item) return null;

                    return (
                      <div className="quiz-question-card single-question-panel">
                        <p className="quiz-question">
                          {activeMultipleChoiceQuestion + 1}. {item.question}
                        </p>

                        <div className="quiz-options">
                          {Array.isArray(item.options) &&
                            item.options.map((option, optionIndex) => (
                              <p key={optionIndex} className="quiz-option">
                                {option}
                              </p>
                            ))}
                        </div>

                        <button
                          className="secondary-button quiz-answer-button"
                          onClick={() => toggleQuizAnswer(questionKey)}
                        >
                          {showQuizAnswers[questionKey]
                            ? "Hide Answer"
                            : "Show Answer"}
                        </button>

                        {showQuizAnswers[questionKey] && (
                          <div className="quiz-answer-box">
                            <p>
                              <strong>Answer:</strong> {item.answer}
                            </p>
                            <p>
                              <strong>Explanation:</strong> {item.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

            {activeQuizPanel === "short_answer" &&
              Array.isArray(documentQuiz.short_answer) &&
              documentQuiz.short_answer.length > 0 && (
                <div className="quiz-section">
                  <h3>Short Answer</h3>

                  <div className="intelligence-tabs">
                    {documentQuiz.short_answer.map((_, index) => (
                      <button
                        key={index}
                        className={
                          activeShortAnswerQuestion === index
                            ? "intelligence-tab active-tab"
                            : "intelligence-tab"
                        }
                        onClick={() => setActiveShortAnswerQuestion(index)}
                      >
                        Question {index + 1}
                      </button>
                    ))}
                  </div>

                  {(() => {
                    const item =
                      documentQuiz.short_answer[activeShortAnswerQuestion];
                    const questionKey = `sa-${activeShortAnswerQuestion}`;

                    if (!item) return null;

                    return (
                      <div className="quiz-question-card single-question-panel">
                        <p className="quiz-question">
                          {activeShortAnswerQuestion + 1}. {item.question}
                        </p>

                        <button
                          className="secondary-button quiz-answer-button"
                          onClick={() => toggleQuizAnswer(questionKey)}
                        >
                          {showQuizAnswers[questionKey]
                            ? "Hide Answer"
                            : "Show Answer"}
                        </button>

                        {showQuizAnswers[questionKey] && (
                          <div className="quiz-answer-box">
                            <p>
                              <strong>Answer:</strong> {item.answer}
                            </p>
                            <p>
                              <strong>Explanation:</strong> {item.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
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
          <button
            onClick={handleAsk}
            disabled={loadingAnswer || !selectedDocumentId}
          >
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
                <p className="answer">
                  {chat?.answer || "Answer unavailable."}
                </p>

                <button
                  className="secondary-button save-note-button"
                  onClick={() => saveNote(chat)}
                >
                  Save Note
                </button>

                {Array.isArray(chat?.sources) && chat.sources.length > 0 && (
                  <div className="source-panel">
                    <h3>Sources</h3>

                    <div className="intelligence-tabs source-tabs">
                      {chat.sources.map((source, sourceIndex) => {
                        const activeSourceIndex = activeChatSources[index] ?? 0;

                        return (
                          <button
                            key={sourceIndex}
                            className={
                              activeSourceIndex === sourceIndex
                                ? "intelligence-tab active-tab"
                                : "intelligence-tab"
                            }
                            onClick={() => setActiveChatSource(index, sourceIndex)}
                          >
                            Source {sourceIndex + 1}
                          </button>
                        );
                      })}
                    </div>

                    {(() => {
                      const activeSourceIndex = activeChatSources[index] ?? 0;
                      const source = chat.sources[activeSourceIndex];

                      if (!source) return null;

                      return (
                        <div className="source-card-panel">
                          {source?.url ? (
                            <a
                              className="citation-title citation-link"
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {cleanSourceName(source?.source)} — Page {source?.page || "Unknown"}
                            </a>
                          ) : (
                            <p className="citation-title">
                              {cleanSourceName(source?.source)} — Page {source?.page || "Unknown"}
                            </p>
                          )}

                          <p>{source?.preview || "No preview available."}...</p>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {Array.isArray(savedNotes) && savedNotes.length > 0 && (
        <section className="card saved-notes-card">
          <div className="saved-notes-header">
            <p className="section-eyebrow">Knowledge Retention</p>
            <h2>Saved Notes</h2>
            <p className="intelligence-subtitle">
              Review important answers, source-backed explanations, and key insights
              you saved from your documents.
            </p>
          </div>

          <div className="saved-notes-list">
            {savedNotes.map((note) => (
              <div key={note.id} className="saved-note">
                <div className="saved-note-top">
                  <div>
                    <p className="saved-note-document">{note.documentName}</p>
                    <p className="saved-note-date">{note.createdAt}</p>
                  </div>

                  <button
                    className="danger-button delete-note-button"
                    onClick={() => deleteNote(note.id)}
                  >
                    Delete
                  </button>
                </div>

                <div className="saved-note-content">
                  <div className="note-section-block">
                    <p className="saved-note-label">Question</p>
                    <p className="saved-note-question">{note.question}</p>
                  </div>

                  <div className="note-section-block">
                    <p className="saved-note-label">Answer</p>
                    <p className="saved-note-answer">{note.answer}</p>
                  </div>
                </div>

               
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}


export default App;