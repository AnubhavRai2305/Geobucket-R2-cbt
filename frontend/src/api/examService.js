import { API_BASE_URL } from './apiConfig';

function getAuthHeaders() {
  const token = localStorage.getItem('studentToken') || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export const fetchTests = async () => {
  const response = await fetch(`${API_BASE_URL}/tests`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch tests');
  return response.json();
};

export const fetchTestDetails = async (testId) => {
  const response = await fetch(`${API_BASE}/tests/${testId}`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch test details');
  return response.json();
};

export const startAttempt = async (testId) => {
  const response = await fetch(`${API_BASE_URL}/attempts/start`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ testId })
  });
  if (!response.ok) throw new Error('Failed to start attempt');
  return response.json();
};

export const fetchQuestions = async (testId) => {
  const response = await fetch(`${API_BASE_URL}/tests/${testId}/questions`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch questions');
  return response.json();
};

export const saveAnswer = async (attemptId, questionId, selectedAnswer, status) => {
  const response = await fetch(`${API_BASE_URL}/attempts/${attemptId}/answers`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ questionId, selectedAnswer, status })
  });
  if (!response.ok) throw new Error('Failed to save answer');
  return response.json();
};

export const submitExam = async (attemptId) => {
  const response = await fetch(`${API_BASE_URL}/attempts/${attemptId}/submit`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to submit exam');
  return response.json();
};

export const fetchMyAttempts = async () => {
  const response = await fetch(`${API_BASE}/attempts/my-attempts`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch past attempts');
  return response.json();
};
