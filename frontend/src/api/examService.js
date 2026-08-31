const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export const fetchTests = async () => {
  const response = await fetch(`${API_BASE}/tests`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch tests');
  return response.json();
};

export const startAttempt = async (testId) => {
  const response = await fetch(`${API_BASE}/attempts/start`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ testId })
  });
  if (!response.ok) throw new Error('Failed to start attempt');
  return response.json();
};

export const fetchQuestions = async (testId) => {
  const response = await fetch(`${API_BASE}/tests/${testId}/questions`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch questions');
  return response.json();
};

export const saveAnswer = async (attemptId, questionId, selectedAnswer, status) => {
  const response = await fetch(`${API_BASE}/attempts/${attemptId}/answers`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ questionId, selectedAnswer, status })
  });
  if (!response.ok) throw new Error('Failed to save answer');
  return response.json();
};

export const submitExam = async (attemptId) => {
  const response = await fetch(`${API_BASE}/attempts/${attemptId}/submit`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to submit exam');
  return response.json();
};
