import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

const styles = {
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #f9dbe7 0%, #fff 90%)',
        fontFamily: 'system-ui, Segoe UI, Roboto, Arial',
    },
    spinner: {
        width: '50px',
        height: '50px',
        border: '4px solid #f3c2d5',
        borderTop: '4px solid #e48fb2',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        marginTop: '1rem',
        color: '#e48fb2',
        fontSize: '1rem',
        fontWeight: 600,
    },
};

if (typeof window !== 'undefined' && !window.__spinnerAnimationInjected) {
    window.__spinnerAnimationInjected = true;
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}
