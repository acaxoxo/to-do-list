import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tasksAPI } from '../services/api';

const softPink = '#f9dbe7';
const darkerPink = '#f3c2d5';
const accent = '#e48fb2';

export default function ToDoInput() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'not-started',
        priority: 'medium',
        dueDate: '',
    });
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (formData.title.trim().length < 3) {
            newErrors.title = 'Title must be at least 3 characters';
        } else if (formData.title.trim().length > 100) {
            newErrors.title = 'Title must not exceed 100 characters';
        }
        
        if (formData.description.trim().length > 500) {
            newErrors.description = 'Description must not exceed 500 characters';
        }
        
        if (formData.dueDate) {
            const dueDate = new Date(formData.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (dueDate < today) {
                newErrors.dueDate = 'Due date must be today or in the future';
            }
        }
        
        if (!['low', 'medium', 'high'].includes(formData.priority)) {
            newErrors.priority = 'Invalid priority selected';
        }
        
        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Call API to create task
        tasksAPI.create({
            title: formData.title.trim(),
            description: formData.description.trim(),
            status: formData.status,
            priority: formData.priority,
            dueDate: formData.dueDate || null,
        }).then(() => {
            navigate('/dashboard');
        }).catch((err) => {
            setErrors({ submit: err.message });
        });
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.header}>
                        <button 
                            onClick={() => navigate('/dashboard')} 
                            style={styles.backButton}
                            aria-label="Back to Dashboard"
                        >
                            ← Back
                        </button>
                        <h1 style={styles.title}>Add New Task</h1>
                        <p style={styles.subtitle}>Create a new task to stay organized</p>
                    </div>

                    <form onSubmit={handleSubmit} style={styles.form}>
                        {Object.keys(errors).length > 0 && (
                            <div style={styles.errorBox}>
                                <div style={styles.errorTitle}>⚠️ Please fix the following errors:</div>
                                {Object.entries(errors).map(([field, message]) => (
                                    <div key={field} style={styles.errorItem}>
                                        • {message}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={styles.inputGroup}>
                            <label htmlFor="title" style={styles.label}>
                                Task Title * {formData.title.length}/100
                            </label>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter task title"
                                style={{ ...styles.input, ...(errors.title ? styles.inputError : {}) }}
                                autoFocus
                                maxLength="100"
                            />
                            {errors.title && <span style={styles.error}>{errors.title}</span>}
                        </div>

                        <div style={styles.inputGroup}>
                            <label htmlFor="description" style={styles.label}>
                                Description ({formData.description.length}/500)
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter task description (optional)"
                                style={{ ...styles.input, ...styles.textarea, ...(errors.description ? styles.inputError : {}) }}
                                rows={4}
                                maxLength="500"
                            />
                            {errors.description && <span style={styles.error}>{errors.description}</span>}
                        </div>

                        <div style={styles.twoColumn}>
                            <div style={styles.inputGroup}>
                                <label htmlFor="priority" style={styles.label}>
                                    Priority *
                                </label>
                                <select
                                    id="priority"
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    style={{ ...styles.select, ...(errors.priority ? styles.inputError : {}) }}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                                {errors.priority && <span style={styles.error}>{errors.priority}</span>}
                            </div>

                            <div style={styles.inputGroup}>
                                <label htmlFor="dueDate" style={styles.label}>
                                    Due Date
                                </label>
                                <input
                                    id="dueDate"
                                    name="dueDate"
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={handleChange}
                                    style={{ ...styles.input, ...(errors.dueDate ? styles.inputError : {}) }}
                                />
                                {errors.dueDate && <span style={styles.error}>{errors.dueDate}</span>}
                            </div>
                        </div>

                        <div style={styles.inputGroup}>
                            <label htmlFor="status" style={styles.label}>
                                Status
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                style={styles.select}
                            >
                                <option value="not-started">Not Started</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>

                        <div style={styles.buttonGroup}>
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                style={styles.cancelButton}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                style={styles.submitButton}
                            >
                                Create Task
                            </button>
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
        maxWidth: '600px',
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
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        left: 0,
        top: 0,
        background: 'transparent',
        color: accent,
        border: 'none',
        padding: '.5rem',
        fontSize: '.9rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all .25s',
    },
    title: {
        margin: 0,
        fontSize: 'clamp(1.6rem,4vw,2rem)',
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
        gap: '1.5rem',
    },
    errorBox: {
        background: '#ffe0e0',
        color: '#c62828',
        padding: '1rem',
        borderRadius: '10px',
        fontSize: '.85rem',
        fontWeight: 500,
        border: '1px solid #ffcdd2',
    },
    errorTitle: {
        fontWeight: 700,
        marginBottom: '.5rem',
    },
    errorItem: {
        marginLeft: '.5rem',
        marginTop: '.25rem',
    },
    error: {
        color: '#c62828',
        fontSize: '.75rem',
        fontWeight: 600,
        marginTop: '.2rem',
        display: 'block',
    },
    inputError: {
        borderColor: '#ffcdd2',
        background: '#ffebee',
    },
    twoColumn: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
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
    textarea: {
        resize: 'vertical',
        minHeight: '100px',
    },
    select: {
        padding: '.85rem 1rem',
        fontSize: '.9rem',
        border: `2px solid ${darkerPink}`,
        borderRadius: '12px',
        background: '#ffeaf2',
        color: '#3d3d3d',
        outline: 'none',
        transition: 'all .25s',
        fontFamily: 'inherit',
        cursor: 'pointer',
    },
    buttonGroup: {
        display: 'flex',
        gap: '1rem',
        marginTop: '.5rem',
    },
    cancelButton: {
        flex: 1,
        padding: '.95rem 1.5rem',
        fontSize: '1rem',
        fontWeight: 600,
        letterSpacing: '.5px',
        background: 'transparent',
        color: accent,
        border: `2px solid ${accent}`,
        borderRadius: '999px',
        cursor: 'pointer',
        transition: 'all .25s',
    },
    submitButton: {
        flex: 1,
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
};

// Add global hover effects
const addGlobalHover = () => {
    const style = document.createElement('style');
    style.innerHTML = `
        input:focus, textarea:focus, select:focus {
            border-color: ${accent} !important;
            background: #fff !important;
            box-shadow: 0 0 0 3px rgba(228,143,178,0.15) !important;
        }
        button:hover {
            transform: translateY(-2px);
        }
        button:active {
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
};

if (typeof window !== 'undefined' && !window.__todoInputHoverInjected) {
    window.__todoInputHoverInjected = true;
    addGlobalHover();
}
