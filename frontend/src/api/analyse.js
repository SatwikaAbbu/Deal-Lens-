import axios from 'axios';

let API_URL = import.meta.env.VITE_API_URL || '';

if (!API_URL) {
  // Fallback if VITE_API_URL is not set
  API_URL = window.location.port === '5173' ? 'http://localhost:8000' : '';
}

export async function analyseDeck(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(
    `${API_URL}/analyse`,
    formData,
    { 
      headers: { 'Content-Type': 'multipart/form-data' },
      // Optional timeout - backend can take up to 20-30s depending on Gemini, but with retry rotation it can take up to 5 mins
      timeout: 300000 
    }
  );

  return response.data;
}

export async function getReport(reportId) {
  const response = await axios.get(`${API_URL}/report/${reportId}`);
  return response.data;
}

export async function chatWithDeal(message, history, rawText) {
  const response = await axios.post(`${API_URL}/chat`, {
    message,
    history,
    raw_text: rawText
  });
  return response.data;
}
