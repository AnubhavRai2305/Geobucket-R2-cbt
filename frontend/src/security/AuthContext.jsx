import React, { createContext, useState, useEffect } from 'react';
import { loginStudent, getCurrentStudent } from './authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('studentToken') || null);
    const [loading, setLoading] = useState(true);

    // Verify session token on initial mount or when token changes
    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    const data = await getCurrentStudent(token);
                    if (data.success) {
                        // Using 'student' key as defined in api.md for login responses
                        setUser(data.student || data.user);
                    } else {
                        logout();
                    }
                } catch (error) {
                    console.error("Session verification failed:", error);
                    logout();
                }
            }
            setLoading(false);
        };
        initAuth();
    }, [token]);

    const login = async (rollNumber, password) => {
        const data = await loginStudent(rollNumber, password);
        if (data.success && data.token) {
            setToken(data.token);
            setUser(data.student);
            localStorage.setItem('studentToken', data.token);
        }
        return data;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('studentToken');
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
