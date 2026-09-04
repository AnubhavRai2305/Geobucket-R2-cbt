const API_URL = import.meta.env.VITE_API_URL || '';
export const API_BASE_URL = API_URL ? `${API_URL.replace(/\/$/, '')}/api` : '/api';
