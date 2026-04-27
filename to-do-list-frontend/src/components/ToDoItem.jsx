import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { tasksAPI } from '../services/api';

const softPink = '#f9dbe7';
const darkerPink = '#f3c2d5';
const accent = '#e48fb2';

export default function ToDoItem() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [task, setTask] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'not-started',
        priority: 'medium',
        dueDate: '',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const result = await tasksAPI.getOne(id);
                const foundTask = result.task;
                if (foundTask) {
                    setTask(foundTask);
                    setFormData({
                        title: foundTask.title,
                        description: foundTask.description || '',
                        status: foundTask.status,
                        priority: foundTask.priority || 'medium',
                        dueDate: foundTask.dueDate ? foundTask.dueDate.split('T')[0] : '',
                    });
                } else {
                    navigate('/dashboard');
                }
            } catch (err) {
                console.error('Failed to fetch task:', err);
                navigate('/dashboard');
            }
        };

        fetchTask();
    }, [id, navigate]);

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

    const handleSave = async () => {
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const result = await tasksAPI.update(id, {
                title: formData.title.trim(),
                description: formData.description.trim(),
                status: formData.status,
                priority: formData.priority,
                dueDate: formData.dueDate || null,
            });
            setTask(result.task);
            setIsEditing(false);
            setErrors({});
        } catch (err) {
            setErrors({ submit: err.message });
        }
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            tasksAPI.delete(id).then(() => {
                navigate('/dashboard');
            }).catch((err) => {
                alert('Failed to delete task: ' + err.message);
            });
        }
    };

    if (!task) {
        return (
            <div style={styles.page}>
                <div style={styles.loading}>Loading...</div>
            </div>
        );
    }

    function progressOf(t) {
        if (!t) return 0;
        if (t.status === 'not-started') return 0;
        if (t.status === 'completed') return 100;
        const base = (t.id || '') + (t.title || '');
        let hash = 0;
        for (let i = 0; i < base.length; i++) {
            hash = (hash * 31 + base.charCodeAt(i)) >>> 0;
        }
        return (hash % 99) + 1;
    }

    const progress = progressOf(task);

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
                        <h1 style={styles.title}>Task Details</h1>
                    </div>

                    {!isEditing ? (
                        <div style={styles.viewMode}>
                            <div style={styles.section}>
                                <h2 style={styles.sectionTitle}>Title</h2>
                                <p style={styles.text}>{task.title}</p>
                            </div>

                            <div style={styles.section}>
                                <h2 style={styles.sectionTitle}>Description</h2>
                                <p style={styles.text}>
                                    {task.description || 'No description provided'}
                                </p>
                            </div>

                            <div style={styles.twoColumn}>
                                <div style={styles.section}>
                                    <h2 style={styles.sectionTitle}>Priority</h2>
                                    <span style={{ ...styles.priorityBadge, ...priorityColor(task.priority) }}>
                                        {(task.priority || 'medium').toUpperCase()}
                                    </span>
                                </div>

                                {task.dueDate && (
                                    <div style={styles.section}>
                                        <h2 style={styles.sectionTitle}>Due Date</h2>
                                        <p style={styles.text}>
                                            {new Date(task.dueDate).toLocaleDateString('id-ID', {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div style={styles.section}>
                                <h2 style={styles.sectionTitle}>Status / Progress</h2>
                                <div style={styles.progressRow}>
                                    <div style={styles.progressShell} aria-label={`Progress ${progress}%`}>
                                        <div style={{ ...styles.progressFill, width: progress + '%' }} />
                                    </div>
                                    <span style={{ ...styles.statusBadge, ...badgeColor(task.status) }}>{progress}%</span>
                                </div>
                            </div>

                            {task.createdAt && (
                                <div style={styles.section}>
                                    <h2 style={styles.sectionTitle}>Created At</h2>
                                    <p style={styles.textSmall}>
                                        {new Date(task.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            )}

                            <div style={styles.buttonGroup}>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    style={styles.editButton}
                                >
                                    Edit Task
                                </button>
                                <button
                                    onClick={handleDelete}
                                    style={styles.deleteButton}
                                >
                                    Delete Task
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={styles.editMode}>
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
                                    style={{ ...styles.input, ...(errors.title ? styles.inputError : {}) }}
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
                                    onClick={() => {
                                        setFormData({
                                            title: task.title,
                                            description: task.description || '',
                                            status: task.status,
                                            priority: task.priority || 'medium',
                                            dueDate: task.dueDate || '',
                                        });
                                        setIsEditing(false);
                                        setErrors({});
                                    }}
                                    style={styles.cancelButton}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    style={styles.saveButton}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


function badgeColor(status) {
    switch (status) {
        case 'completed':
            return { background: '#76c893', color: '#fff' };
        case 'in-progress':
            return { background: '#ffafcc', color: '#5f0f40' };
        default:
            return { background: '#bdb2ff', color: '#2d2d2d' };
    }
}

function priorityColor(priority) {
    switch (priority) {
        case 'high':
            return { background: '#ff6b6b', color: '#fff' };
        case 'medium':
            return { background: '#ffa500', color: '#fff' };
        case 'low':
            return { background: '#74c0fc', color: '#fff' };
        default:
            return { background: '#ced4da', color: '#495057' };
    }
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
    loading: {
        textAlign: 'center',
        color: accent,
        fontSize: '1.2rem',
        fontWeight: 600,
    },
    viewMode: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    editMode: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: '.5rem',
    },
    sectionTitle: {
        fontSize: '.85rem',
        fontWeight: 600,
        color: '#555',
        textTransform: 'uppercase',
        letterSpacing: '.5px',
    },
    text: {
        fontSize: '1rem',
        color: '#3d3d3d',
        lineHeight: 1.6,
    },
    textSmall: {
        fontSize: '.85rem',
        color: '#6b6b6b',
    },
    statusBadge: {
        alignSelf: 'flex-start',
        fontSize: '.7rem',
        padding: '.4rem .7rem',
        borderRadius: '10px',
        fontWeight: 600,
        letterSpacing: '.5px',
        textTransform: 'uppercase',
    },
    progressRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '.75rem',
        flexWrap: 'wrap',
    },
    progressShell: {
        position: 'relative',
        width: '160px',
        height: '10px',
        borderRadius: '999px',
        background: '#f4d2de',
        overflow: 'hidden',
    },
    progressFill: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '0%',
        background: accent,
        borderRadius: 'inherit',
        transition: 'width .6s cubic-bezier(.65,.05,.36,1)',
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
    editButton: {
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
    deleteButton: {
        flex: 1,
        padding: '.95rem 1.5rem',
        fontSize: '1rem',
        fontWeight: 600,
        letterSpacing: '.5px',
        background: '#ff6b6b',
        color: '#fff',
        border: 'none',
        borderRadius: '999px',
        cursor: 'pointer',
        boxShadow: '0 4px 12px -3px rgba(255,107,107,.5)',
        transition: 'all .25s',
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
    saveButton: {
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
    priorityBadge: {
        alignSelf: 'flex-start',
        fontSize: '.7rem',
        padding: '.4rem .7rem',
        borderRadius: '10px',
        fontWeight: 600,
        letterSpacing: '.5px',
        textTransform: 'uppercase',
    },
};

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

if (typeof window !== 'undefined' && !window.__todoItemHoverInjected) {
    window.__todoItemHoverInjected = true;
    addGlobalHover();
}
