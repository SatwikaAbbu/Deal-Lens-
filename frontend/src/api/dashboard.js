import axios from 'axios';

let API_URL = import.meta.env.VITE_API_URL || '';

if (!API_URL) {
  // Fallback if VITE_API_URL is not set
  API_URL = window.location.port === '5173' ? 'http://localhost:8000' : '';
}

// ── Submit a deck (founder form) ──────────────────────────────────────────────

export async function submitDeck(file, founderEmail, startupName) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('founder_email', founderEmail);
  formData.append('startup_name_input', startupName);

  const response = await axios.post(
    `${API_URL}/submit-deck`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    }
  );
  return response.data;
}

// ── Get all deals for dashboard ───────────────────────────────────────────────

export async function getDeals() {
  const response = await axios.get(`${API_URL}/deals`);
  return response.data;
}

// ── Update deal status ────────────────────────────────────────────────────────

export async function updateDealStatus(dealId, status) {
  const response = await axios.patch(`${API_URL}/deals/${dealId}/status`, { status });
  return response.data;
}

// ── Delete deal ───────────────────────────────────────────────────────────────

export async function deleteDeal(dealId) {
  const response = await axios.delete(`${API_URL}/deals/${dealId}`);
  return response.data;
}

// ── Run full analysis on a deal ───────────────────────────────────────────────

export async function analyseFullDeal(reportId) {
  const response = await axios.post(
    `${API_URL}/analyse-full/${reportId}`,
    {},
    { timeout: 300000 }
  );
  return response.data;
}

// ── Get investor preferences ──────────────────────────────────────────────────

export async function getPreferences() {
  const response = await axios.get(`${API_URL}/preferences`);
  return response.data;
}

// ── Save investor preferences ─────────────────────────────────────────────────

export async function savePreferences(interested, disqualified) {
  const response = await axios.post(`${API_URL}/preferences`, {
    interested_categories: interested,
    disqualified_categories: disqualified,
  });
  return response.data;
}

// ── Send meeting invite ───────────────────────────────────────────────────────

export async function sendMeetingInvite(dealId) {
  const response = await axios.post(`${API_URL}/deals/${dealId}/invite`);
  return response.data;
}
