import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error('useAuth must be used within an AuthProvider. Jaya, make sure you wrap your components with <AuthProvider> in main.jsx or App.jsx!');
    }
    return context;
};
