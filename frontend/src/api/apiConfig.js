const API_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://geobucket-r2-cbt.onrender.com' : '');
export const API_BASE_URL = API_URL ? `${API_URL.replace(/\/$/, '')}/api` : '/api';

