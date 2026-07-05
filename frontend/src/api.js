import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

  export const uploadDocument = async (file, userId) => {
    const formData = new FormData();
  
    formData.append("file", file);
  
    if (userId) {
      formData.append("user_id", userId);
    }
  
    const response = await axios.post(`${API_BASE_URL}/documents/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  
    return response.data;
  };

export const getDocuments = async () => {
  const response = await axios.get(`${API_BASE_URL}/documents/`);
  return response.data;
};

export const askQuestion = async (question, documentId, userId) => {
  const response = await axios.post(`${API_BASE_URL}/chat/ask`, {
    question,
    document_id: documentId,
    user_id: userId,
  });

  return response.data;
};

export const clearAllDocuments = async () => {
  const response = await axios.delete(`${API_BASE_URL}/documents/clear/all`);
  return response.data;
};

export const getDocumentIntelligence = async (documentId) => {
  const response = await axios.post(
    `${API_BASE_URL}/documents/${documentId}/intelligence`
  );

  return response.data;
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
    setDocumentIntelligence(data.intelligence);
  } catch (error) {
    setUploadMessage(
      error.response?.data?.detail ||
        "Something went wrong while generating the document overview."
    );
  } finally {
    setLoadingIntelligence(false);
  }

  
};

export const getDocumentQuiz = async (documentId) => {
  const response = await axios.post(
    `${API_BASE_URL}/documents/${documentId}/quiz`
  );

  return response.data;
};

export const deleteDocument = async (documentId) => {
  const response = await axios.delete(`${API_BASE_URL}/documents/${documentId}`);
  return response.data;
};