import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

export const uploadPDF = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(`${API_BASE_URL}/documents/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const askQuestion = async (question) => {
  const response = await axios.post(`${API_BASE_URL}/chat/ask`, {
    question,
  });

  return response.data;
};

export const clearDocument = async () => {
  const response = await axios.delete(`${API_BASE_URL}/documents/clear`);
  return response.data;
};