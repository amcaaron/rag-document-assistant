import axios from "axios";
import { supabase } from "./supabaseClient";

const getAuthHeaders = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return {};
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
  };
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

  export const uploadDocument = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
  
    const authHeaders = await getAuthHeaders();
  
    const response = await axios.post(
      `${API_BASE_URL}/documents/upload`,
      formData,
      {
        headers: {
          ...authHeaders,
          "Content-Type": "multipart/form-data",
        },
      }
    );
  
    return response.data;
  };

export const getDocuments = async () => {
  const response = await axios.get(`${API_BASE_URL}/documents/`);
  return response.data;
};

export const askQuestion = async (question, documentId) => {
  const authHeaders = await getAuthHeaders();

  const response = await axios.post(
    `${API_BASE_URL}/chat/ask`,
    {
      question,
      document_id: documentId,
    },
    {
      headers: authHeaders,
    }
  );

  return response.data;
};

export const clearAllDocuments = async () => {
  const authHeaders = await getAuthHeaders();

  const response = await axios.delete(`${API_BASE_URL}/documents/clear/all`, {
    headers: authHeaders,
  });

  return response.data;
};

export const getDocumentIntelligence = async (documentId) => {
  const authHeaders = await getAuthHeaders();

  const response = await axios.post(
    `${API_BASE_URL}/documents/${documentId}/intelligence`,
    {},
    {
      headers: authHeaders,
    }
  );

  return response.data;
};

export const getDocumentQuiz = async (documentId) => {
  const authHeaders = await getAuthHeaders();

  const response = await axios.post(
    `${API_BASE_URL}/documents/${documentId}/quiz`,
    {},
    {
      headers: authHeaders,
    }
  );

  return response.data;
};

export const deleteDocument = async (documentId) => {
  const authHeaders = await getAuthHeaders();

  const response = await axios.delete(`${API_BASE_URL}/documents/${documentId}`, {
    headers: authHeaders,
  });

  return response.data;
};