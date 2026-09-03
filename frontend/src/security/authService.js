const API_BASE_URL = '/api/auth';

/**
 * Authenticates a student via roll number and password.
 * Maps to: POST /api/auth/student/login
 */
export const loginStudent = async (rollNumber, password) => {
    const response = await fetch(`${API_BASE_URL}/student/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rollNumber, password })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to login');
    }
    return data;
};

/**
 * Fetches the currently authenticated user's session data.
 * Maps to: GET /api/auth/me
 */
export const getCurrentStudent = async (token) => {
    const response = await fetch(`${API_BASE_URL}/me`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch current user');
    }
    return data;
};
export const registerStudent = async (name, email, rollNumber, password) => {
    const response = await fetch(`${API_BASE_URL}/student/public-register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, rollNumber, password })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to register');
    }
    return data;
};
