import axios from 'axios';

let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// If we are NOT on the Vite dev server (port 5173), we are being served by FastAPI or Ngrok.
// In that case, we must use relative paths so the request routes to the same server.
if (window.location.port !== '5173' && window.location.hostname !== 'localhost') {
  API_URL = '';
} else if (window.location.port !== '5173') {
  API_URL = '';
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
