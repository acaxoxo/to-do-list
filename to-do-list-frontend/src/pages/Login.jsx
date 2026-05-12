import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateLoginIdentifier } from '../utils/validation';

const softPink = '#f9dbe7';
const darkerPink = '#f3c2d5';
const accent = '#e48fb2';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!identifier || !password) {
            setError('Please fill in all fields');
            return;
        }

        const identifierValidation = validateLoginIdentifier(identifier);
        if (!identifierValidation.isValid) {
            setError(identifierValidation.message);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            await login(identifier, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.header}>
                        <h1 style={styles.title}>Welcome Back!</h1>
                        <p style={styles.subtitle}>Sign in to continue to your tasks</p>
                    </div>

                    <form onSubmit={handleSubmit} style={styles.form}>
                        {error && (
                            <div style={styles.errorBox}>
                                {error}
                            </div>
                        )}

                        <div style={styles.inputGroup}>
                            <label htmlFor="identifier" style={styles.label}>
                                Username or Email
                            </label>
                            <input
                                id="identifier"
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder="Enter your username or email"
                                style={styles.input}
                                disabled={isLoading}
                                autoComplete="username"
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label htmlFor="password" style={styles.label}>
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                style={styles.input}
                                disabled={isLoading}
                                autoComplete="current-password"
                            />
                        </div>

                        <div style={styles.supportRow}>
                            <Link to="/forgot-password" style={styles.supportLink}>
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            style={{
                                ...styles.button,
                                ...(isLoading ? styles.buttonDisabled : {}),
                            }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>

                        <div style={styles.footer}>
                            <p style={styles.footerText}>
                                Don't have an account?{' '}
                                <Link to="/register" style={styles.link}>
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem clamp(1rem,3vw,3rem)',
        background: `linear-gradient(160deg, ${softPink} 0%, #fff 90%)`,
        fontFamily: 'system-ui, Segoe UI, Roboto, Arial',
    },
    container: {
        width: '100%',
        maxWidth: '420px',
    },
    card: {
        background: '#fffffffa',
        backdropFilter: 'blur(4px)',
        borderRadius: '18px',
        padding: '2rem 1.75rem',
        boxShadow: '0 8px 20px -6px rgba(240,120,160,0.25)',
        border: `2px solid ${darkerPink}`,
    },
    header: {
        textAlign: 'center',
        marginBottom: '2rem',
    },
    title: {
        margin: 0,
        fontSize: 'clamp(1.8rem,4vw,2.2rem)',
        color: accent,
        fontWeight: 700,
        letterSpacing: '.5px',
    },
    subtitle: {
        margin: '.5rem 0 0',
        fontSize: 'clamp(.85rem,2vw,.95rem)',
        color: '#6b6b6b',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
    },
    errorBox: {
        background: '#ffe0e0',
        color: '#c62828',
        padding: '.75rem 1rem',
        borderRadius: '10px',
        fontSize: '.85rem',
        fontWeight: 500,
        border: '1px solid #ffcdd2',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '.5rem',
    },
    label: {
        fontSize: '.85rem',
        fontWeight: 600,
        color: '#555',
        letterSpacing: '.3px',
    },
    input: {
        padding: '.85rem 1rem',
        fontSize: '.9rem',
        border: `2px solid ${darkerPink}`,
        borderRadius: '12px',
        background: '#ffeaf2',
        color: '#3d3d3d',
        outline: 'none',
        transition: 'all .25s',
        fontFamily: 'inherit',
    },
    button: {
        marginTop: '.5rem',
        padding: '.95rem 1.5rem',
        fontSize: '1rem',
        fontWeight: 600,
        letterSpacing: '.5px',
        background: accent,
        color: '#fff',
        border: 'none',
        borderRadius: '999px',
        cursor: 'pointer',
        boxShadow: '0 4px 12px -3px rgba(228,143,178,.5)',
        transition: 'all .25s',
    },
    buttonDisabled: {
        opacity: 0.6,
        cursor: 'not-allowed',
    },
    footer: {
        marginTop: '.5rem',
        textAlign: 'center',
    },
    footerText: {
        margin: 0,
        fontSize: '.85rem',
        color: '#6b6b6b',
    },
    supportRow: {
        display: 'flex',
        justifyContent: 'flex-end',
    },
    supportLink: {
        fontSize: '.8rem',
        color: accent,
        textDecoration: 'none',
        fontWeight: 600,
    },
    link: {
        color: accent,
        fontWeight: 600,
        textDecoration: 'none',
    },
};

const addGlobalHover = () => {
    const style = document.createElement('style');
    style.innerHTML = `
        input:focus {
            border-color: ${accent} !important;
            background: #fff !important;
            box-shadow: 0 0 0 3px rgba(228,143,178,0.15) !important;
        }
        input:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        button:not(:disabled):hover {
            filter: brightness(.92);
            transform: translateY(-2px);
        }
        button:not(:disabled):active {
            transform: translateY(0);
        }
        a:hover {
            text-decoration: underline;
        }
    `;
    document.head.appendChild(style);
};

if (typeof window !== 'undefined' && !window.__loginHoverInjected) {
    window.__loginHoverInjected = true;
    addGlobalHover();
}
