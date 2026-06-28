import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

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

export const askQuestion = async (question, documentId) => {
  const response = await axios.post(`${API_BASE_URL}/chat/ask`, {
    question,
    document_id: documentId,
  });

  return response.data;
};

export const deleteDocument = async (documentId) => {
  const response = await axios.delete(`${API_BASE_URL}/documents/${documentId}`);
  return response.data;
};

export const clearAllDocuments = async () => {
  const response = await axios.delete(`${API_BASE_URL}/documents/clear/all`);
  return response.data;
};