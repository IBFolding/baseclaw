// Central API configuration
export const API_BASE_URL = 'https://moltmail-backend-64pt549ej-howardtherekts-projects.vercel.app';
export const API_URL = `${API_BASE_URL}/api/v1`;

// Health check URL
export const HEALTH_URL = `${API_BASE_URL}/health`;

// API Endpoints
export const ENDPOINTS = {
  health: `${API_BASE_URL}/health`,
  register: `${API_URL}/register`,
  send: `${API_URL}/send`,
  inbox: (address: string) => `${API_URL}/inbox/${address}`,
  sent: (address: string) => `${API_URL}/sent/${address}`,
  email: (hash: string) => `${API_URL}/email/${hash}`,
  stats: (address: string) => `${API_URL}/stats/${address}`,
  agent: (address: string) => `${API_URL}/agent/${address}`,
};
