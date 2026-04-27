import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { getSessionExpiration, isSessionExpired } from '../utils/validation';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('authToken');
            const userData = localStorage.getItem('user');
            const expiresAt = localStorage.getItem('sessionExpiresAt');

            if (isSessionExpired(expiresAt)) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                localStorage.removeItem('sessionExpiresAt');
                setUser(null);
                setIsLoading(false);
                return;
            }
            
            if (token && userData && !expiresAt) {
                const computedExpiry = getSessionExpiration(token);
                localStorage.setItem('sessionExpiresAt', computedExpiry);
            }

            if (token && userData) {
                try {
                    setUser(JSON.parse(userData));
                } catch (e) {
                    console.error('Failed to parse user data:', e);
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                    localStorage.removeItem('sessionExpiresAt');
                }
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        setError(null);
        try {
            const response = await authAPI.login(email, password);
            const expiresAt = getSessionExpiration(response.token);
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('sessionExpiresAt', expiresAt);
            setUser(response.user);
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const register = async (username, email, password) => {
        setError(null);
        try {
            const response = await authAPI.register(username, email, password);
            const expiresAt = getSessionExpiration(response.token);
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('sessionExpiresAt', expiresAt);
            setUser(response.user);
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('sessionExpiresAt');
        localStorage.removeItem('tasks'); // Remove cached tasks
        setUser(null);
    };

    const value = {
        user,
        isLoading,
        error,
        login,
        logout,
        register,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthProvider;
