import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { validateEmail } from '../utils/validation';

const softPink = '#f9dbe7';
const darkerPink = '#f3c2d5';
const accent = '#e48fb2';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setInfo('');

        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            setError(emailValidation.message);
            return;
        }

        setIsLoading(true);

        try {
            const response = await authAPI.requestPasswordReset(email);
            setInfo(response.message || 'Check your email for reset instructions.');
        } catch (err) {
            setError(err.message || 'Failed to request password reset.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.header}>
                        <h1 style={styles.title}>Reset Password</h1>
                        <p style={styles.subtitle}>We will send a reset link to your email</p>
                    </div>

                    <form onSubmit={handleSubmit} style={styles.form}>
                        {error && <div style={styles.errorBox}>{error}</div>}
                        {info && <div style={styles.infoBox}>{info}</div>}

                        <div style={styles.inputGroup}>
                            <label htmlFor="email" style={styles.label}>
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                style={styles.input}
                                disabled={isLoading}
                                autoComplete="email"
                            />
                        </div>

                        <button
                            type="submit"
                            style={{
                                ...styles.button,
                                ...(isLoading ? styles.buttonDisabled : {}),
                            }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </button>

                        <div style={styles.footer}>
                            <p style={styles.footerText}>
                                Remembered your password?{' '}
                                <Link to="/login" style={styles.link}>
                                    Sign in
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
    infoBox: {
        background: '#eaf6ff',
        color: '#2468a2',
        padding: '.75rem 1rem',
        borderRadius: '10px',
        fontSize: '.85rem',
        fontWeight: 500,
        border: '1px solid #cfe8ff',
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

if (typeof window !== 'undefined' && !window.__forgotHoverInjected) {
    window.__forgotHoverInjected = true;
    addGlobalHover();
}
