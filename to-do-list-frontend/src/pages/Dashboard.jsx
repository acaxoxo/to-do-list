import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { tasksAPI } from '../services/api';
import Navbar from '../components/Navbar';

const softPink = '#f9dbe7';
const darkerPink = '#f3c2d5';
const accent = '#e48fb2';

export default function Dashboard({ username }) {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        status: 'not-started',
        priority: 'medium',
        dueDate: '',
    });
    const [editErrors, setEditErrors] = useState({});

    const normalizeTask = (task) => ({
        ...task,
        id: task.id || task._id,
    });

    const fetchTasks = useCallback(async () => {
        try {
            setLoading(true);
            const result = await tasksAPI.getAll();
            setTasks((result.tasks || []).map(normalizeTask));
            setError('');
        } catch (err) {
            console.error('Failed to fetch tasks:', err);
            setError(err.message);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    useEffect(() => {
        if (typeof window === 'undefined' || window.__inlineEditAnimInjected) return;
        window.__inlineEditAnimInjected = true;
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes inlineEditIn {
                from { opacity: 0; transform: translateY(6px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }, []);

    const user = username || JSON.parse(localStorage.getItem('user') || '{}').username || 'User';

    const filteredTasks = useMemo(() => {
        if (!searchQuery.trim()) {
            return tasks;
        }
        const query = searchQuery.toLowerCase();
        return tasks.filter(task =>
            task.title.toLowerCase().includes(query) ||
            (task.description && task.description.toLowerCase().includes(query))
        );
    }, [tasks, searchQuery]);

    const stats = useMemo(() => {
        const total = filteredTasks.length || 1;
        const completed = filteredTasks.filter(t => t.status === 'completed').length;
        const inProgress = filteredTasks.filter(t => t.status === 'in-progress').length;
        const notStarted = filteredTasks.filter(t => t.status === 'not-started').length;
        return {
            completed,
            inProgress,
            notStarted,
            pctCompleted: Math.round((completed / total) * 100),
            pctInProgress: Math.round((inProgress / total) * 100),
            pctNotStarted: Math.round((notStarted / total) * 100),
        };
    }, [filteredTasks]);

    const completedTasks = filteredTasks.filter(t => t.status === 'completed');

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const startInlineEdit = (task) => {
        setEditingTaskId(task.id);
        setEditForm({
            title: task.title || '',
            description: task.description || '',
            status: task.status || 'not-started',
            priority: task.priority || 'medium',
            dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        });
        setEditErrors({});
    };

    const cancelInlineEdit = () => {
        setEditingTaskId(null);
        setEditErrors({});
    };

    const validateInlineEdit = () => {
        const newErrors = {};

        if (!editForm.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (editForm.title.trim().length < 3) {
            newErrors.title = 'Title must be at least 3 characters';
        } else if (editForm.title.trim().length > 100) {
            newErrors.title = 'Title must not exceed 100 characters';
        }

        if (editForm.description.trim().length > 500) {
            newErrors.description = 'Description must not exceed 500 characters';
        }

        if (editForm.dueDate) {
            const dueDate = new Date(editForm.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (dueDate < today) {
                newErrors.dueDate = 'Due date must be today or in the future';
            }
        }

        if (!['low', 'medium', 'high'].includes(editForm.priority)) {
            newErrors.priority = 'Invalid priority selected';
        }

        if (!['not-started', 'in-progress', 'completed'].includes(editForm.status)) {
            newErrors.status = 'Invalid status selected';
        }

        return newErrors;
    };

    const handleInlineChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value,
        }));

        if (editErrors[name]) {
            setEditErrors(prev => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const saveInlineEdit = async (taskId) => {
        if (!taskId) {
            setEditErrors({ submit: 'Task ID missing. Please refresh the page.' });
            return;
        }

        const newErrors = validateInlineEdit();
        if (Object.keys(newErrors).length > 0) {
            setEditErrors(newErrors);
            return;
        }

        try {
            const result = await tasksAPI.update(taskId, {
                title: editForm.title.trim(),
                description: editForm.description.trim(),
                status: editForm.status,
                priority: editForm.priority,
                dueDate: editForm.dueDate || null,
            });

            const normalized = normalizeTask(result.task || {});
            setTasks(prev => prev.map(task => (
                task.id === taskId ? normalized : task
            )));
            setEditingTaskId(null);
            setEditErrors({});
        } catch (err) {
            setEditErrors({ submit: err.message });
        }
    };

    return (
        <div style={styles.page}>
            <Navbar onSearch={handleSearch} />

            <header style={styles.header}>
                <h1 style={styles.greeting}>Welcome Back, {user}!</h1>
                <p style={styles.sub}>Stay organized and keep track of your progress.</p>
            </header>

            {loading && (
                <div style={styles.loadingContainer}>
                    <p style={styles.loadingText}>Loading your tasks...</p>
                </div>
            )}

            {error && (
                <div style={styles.errorContainer}>
                    <p style={styles.errorText}>⚠️ {error}</p>
                    <button onClick={fetchTasks} style={styles.retryButton}>Retry</button>
                </div>
            )}

            {!loading && !error && (
                <div style={styles.cardsWrapper}>
                    <section style={styles.card}>
                        <div style={styles.cardHeader}>
                            <h2 style={styles.cardTitle}>To-Do Lists</h2>
                            <button
                                style={styles.addBtn}
                                onClick={() => navigate('/todoinput')}
                                aria-label="Add Task"
                            >
                                + Add Task
                            </button>
                        </div>
                        <ul style={styles.taskList}>
                            {filteredTasks.map(task => (
                                <li
                                    key={task.id}
                                    style={{
                                        ...styles.taskItem,
                                        ...priorityStripe(task.priority),
                                    }}
                                    onClick={() => {
                                        if (!editingTaskId) {
                                            navigate(`/todoitem/${task.id}`);
                                        }
                                    }}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && !editingTaskId) {
                                            navigate(`/todoitem/${task.id}`);
                                        }
                                    }}
                                >
                                    {editingTaskId === task.id ? (
                                        <div style={styles.inlineEditor} onClick={e => e.stopPropagation()}>
                                            <div style={styles.inlineHeader}>
                                                <span style={styles.inlineTitle}>Edit Task</span>
                                                <span style={styles.inlineHint}>Update details without leaving the list</span>
                                            </div>
                                            {Object.keys(editErrors).length > 0 && (
                                                <div style={styles.inlineErrorBox}>
                                                    {Object.values(editErrors).map((message, index) => (
                                                        <div key={index} style={styles.inlineErrorText}>• {message}</div>
                                                    ))}
                                                </div>
                                            )}
                                            <div style={styles.inlineRow}>
                                                <div style={{ ...styles.inlineField, flex: '7 1 280px' }}>
                                                    <label style={styles.inlineLabel}>Title</label>
                                                    <input
                                                        name="title"
                                                        value={editForm.title}
                                                        onChange={handleInlineChange}
                                                        style={{
                                                            ...styles.inlineInput,
                                                            ...(editErrors.title ? styles.inputError : {}),
                                                        }}
                                                        maxLength={100}
                                                    />
                                                </div>
                                                <div style={{ ...styles.inlineField, flex: '3 1 140px' }}>
                                                    <label style={styles.inlineLabel}>Status</label>
                                                    <select
                                                        name="status"
                                                        value={editForm.status}
                                                        onChange={handleInlineChange}
                                                        style={{
                                                            ...styles.inlineSelect,
                                                            ...(editErrors.status ? styles.inputError : {}),
                                                        }}
                                                    >
                                                        <option value="not-started">Pending</option>
                                                        <option value="in-progress">In Progress</option>
                                                        <option value="completed">Done</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div style={styles.inlineRow}>
                                                <div style={styles.inlineFieldWide}>
                                                    <label style={styles.inlineLabel}>Description</label>
                                                    <input
                                                        name="description"
                                                        value={editForm.description}
                                                        onChange={handleInlineChange}
                                                        style={{
                                                            ...styles.inlineInput,
                                                            ...(editErrors.description ? styles.inputError : {}),
                                                        }}
                                                        placeholder="Add a short description"
                                                        maxLength={500}
                                                    />
                                                </div>
                                            </div>
                                            <div style={styles.inlineRow}>
                                                <div style={styles.inlineField}>
                                                    <label style={styles.inlineLabel}>Priority</label>
                                                    <select
                                                        name="priority"
                                                        value={editForm.priority}
                                                        onChange={handleInlineChange}
                                                        style={{
                                                            ...styles.inlineSelect,
                                                            ...(editErrors.priority ? styles.inputError : {}),
                                                        }}
                                                    >
                                                        <option value="low">Low</option>
                                                        <option value="medium">Medium</option>
                                                        <option value="high">High</option>
                                                    </select>
                                                </div>
                                                <div style={styles.inlineField}>
                                                    <label style={styles.inlineLabel}>Due Date</label>
                                                    <input
                                                        name="dueDate"
                                                        type="date"
                                                        value={editForm.dueDate}
                                                        onChange={handleInlineChange}
                                                        style={{
                                                            ...styles.inlineInput,
                                                            ...(editErrors.dueDate ? styles.inputError : {}),
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div style={styles.inlineActions}>
                                                <button
                                                    type="button"
                                                    onClick={cancelInlineEdit}
                                                    style={styles.inlineCancel}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => saveInlineEdit(task.id)}
                                                    style={styles.inlineSave}
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div style={styles.taskContent}>
                                                <span style={styles.taskTitle}>{task.title}</span>
                                                {task.dueDate && (
                                                    <span style={styles.dueDate}>
                                                        📅 {new Date(task.dueDate).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={styles.taskBadges}>
                                                <span style={{ ...styles.statusBadge, ...badgeColor(task.status) }}>
                                                    {label(task.status)}
                                                </span>
                                                <button
                                                    type="button"
                                                    style={styles.inlineEditButton}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        startInlineEdit(task);
                                                    }}
                                                    aria-label="Edit task"
                                                >
                                                    ...
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </li>
                            ))}
                            {filteredTasks.length === 0 && (
                                <li style={styles.empty}>
                                    {searchQuery ? 'No tasks found matching your search.' : 'No tasks yet.'}
                                </li>
                            )}
                        </ul>
                    </section>

                    <section style={styles.card}>
                        <h2 style={styles.cardTitle}>Task Status</h2>
                        <div style={styles.progressGroup}>
                            <StatusBar label="Completed" value={stats.pctCompleted} color="#76c893" />
                            <StatusBar label="In Progress" value={stats.pctInProgress} color="#ffafcc" />
                            <StatusBar label="Not Started" value={stats.pctNotStarted} color="#bdb2ff" />
                        </div>
                        <div style={styles.miniCounts}>
                            <span>Total: {filteredTasks.length}</span>
                            <span>Done: {stats.completed}</span>
                            <span>Active: {stats.inProgress}</span>
                            <span>Pending: {stats.notStarted}</span>
                        </div>
                    </section>

                    <section style={styles.card}>
                        <h2 style={styles.cardTitle}>Completed Tasks</h2>
                        <ul style={styles.completedList}>
                            {completedTasks.map(t => (
                                <li key={t.id} style={styles.completedItem}>
                                    <Link style={styles.completedLink} to={`/todoitem/${t.id}`}>{t.title}</Link>
                                </li>
                            ))}
                            {completedTasks.length === 0 && <li style={styles.empty}>No completed tasks.</li>}
                        </ul>
                    </section>
                </div>
            )}
        </div>
    );
}

function StatusBar({ label, value, color }) {
    return (
        <div style={styles.statusRow}>
            <span style={styles.statusLabel}>{label}</span>
            <div style={styles.barTrack}>
                <div style={{ ...styles.barFill, width: `${value}%`, background: color }} />
            </div>
            <span style={styles.barValue}>{value}%</span>
        </div>
    );
}

function label(status) {
    if (status === 'completed') return 'Done';
    if (status === 'in-progress') return 'In Progress';
    return 'Pending';
}

function badgeColor(status) {
    switch (status) {
        case 'completed':
            return { background: '#e8f6ef', color: '#2b7a57' };
        case 'in-progress':
            return { background: '#fde9f1', color: '#8b3b5d' };
        default:
            return { background: '#f0efff', color: '#3c3c6b' };
    }
}

function priorityStripe(priority) {
    if (priority === 'high') return { borderLeft: '4px solid #ff6b6b' };
    if (priority === 'medium') return { borderLeft: '4px solid #f2b066' };
    if (priority === 'low') return { borderLeft: '4px solid #8cc9f5' };
    return { borderLeft: '4px solid #efdae5' };
}

const styles = {
    page: {
        minHeight: '100vh',
        padding: '2rem clamp(1rem,3vw,3rem)',
        background: `linear-gradient(160deg, ${softPink} 0%, #fff 90%)`,
        fontFamily: 'system-ui, Segoe UI, Roboto, Arial',
        color: '#3d3d3d',
    },
    header: {
        marginBottom: '1.5rem',
        textAlign: 'center',
    },
    greeting: {
        margin: 0,
        fontSize: 'clamp(1.8rem,4vw,2.6rem)',
        color: accent,
        fontWeight: 700,
        letterSpacing: '.5px',
    },
    sub: {
        margin: '.3rem 0 0',
        fontSize: 'clamp(.9rem,2vw,1rem)',
        color: '#6b6b6b',
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
        textAlign: 'center',
    },
    loadingText: {
        color: accent,
        fontSize: '1.1rem',
        fontWeight: 600,
    },
    errorContainer: {
        background: '#ffe0e0',
        color: '#c62828',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid #ffcdd2',
        textAlign: 'center',
        marginBottom: '1.5rem',
    },
    errorText: {
        margin: '0 0 1rem',
        fontSize: '1rem',
        fontWeight: 600,
    },
    retryButton: {
        background: '#c62828',
        color: '#fff',
        border: 'none',
        padding: '.6rem 1.2rem',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 600,
        transition: 'all .25s',
    },
    cardsWrapper: {
        display: 'grid',
        gap: '1.5rem',
        gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
        alignItems: 'start',
    },
    card: {
        background: '#fffffffa',
        backdropFilter: 'blur(4px)',
        borderRadius: '18px',
        padding: '1.1rem 1.4rem 1.3rem',
        boxShadow: '0 8px 20px -6px rgba(240,120,160,0.25)',
        border: `2px solid ${darkerPink}`,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '270px',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '.75rem',
        marginBottom: '.5rem',
    },
    cardTitle: {
        margin: 0,
        fontSize: '1.2rem',
        color: '#d16b93',
        fontWeight: 700,
    },
    addBtn: {
        background: accent,
        border: 'none',
        color: '#fff',
        padding: '.5rem 1rem',
        borderRadius: '999px',
        cursor: 'pointer',
        fontWeight: 600,
    },
    taskList: {
        listStyle: 'none',
        padding: '0 .2rem',
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '.75rem',
        overflowY: 'auto',
    },
    taskItem: {
        background: '#fff',
        borderRadius: '14px',
        padding: '.85rem .9rem',
        border: `1px solid ${darkerPink}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        cursor: 'pointer',
        transition: 'all .2s ease',
        boxShadow: '0 6px 14px -8px rgba(240,120,160,.3)',
    },
    taskContent: {
        display: 'flex',
        alignItems: 'center',
        gap: '.6rem',
        flexWrap: 'wrap',
    },
    taskTitle: {
        fontWeight: 600,
        color: '#1f2a44',
    },
    dueDate: {
        fontSize: '.8rem',
        color: '#a56c84',
        background: '#fff0f6',
        padding: '.2rem .55rem',
        borderRadius: '999px',
    },
    taskBadges: {
        display: 'flex',
        alignItems: 'center',
        gap: '.35rem',
        flexWrap: 'nowrap',
    },
    statusBadge: {
        padding: '.3rem .75rem',
        borderRadius: '999px',
        fontSize: '.72rem',
        fontWeight: 700,
        lineHeight: 1.2,
    },
    empty: {
        color: '#8a8a8a',
        padding: '.6rem 0',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    progressGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '.8rem',
        marginTop: '.5rem',
    },
    statusRow: {
        display: 'grid',
        gridTemplateColumns: '90px 1fr 48px',
        alignItems: 'center',
        gap: '.6rem',
    },
    statusLabel: {
        fontSize: '.85rem',
        fontWeight: 600,
        color: '#5f0f40',
    },
    barTrack: {
        height: '8px',
        background: '#f3c2d5',
        borderRadius: '999px',
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: '999px',
    },
    barValue: {
        fontSize: '.8rem',
        fontWeight: 600,
        color: '#5f0f40',
        textAlign: 'right',
    },
    miniCounts: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '.6rem 1rem',
        marginTop: '1rem',
        color: '#6b6b6b',
        fontSize: '.85rem',
    },
    completedList: {
        listStyle: 'none',
        padding: 0,
        margin: '.6rem 0 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '.5rem',
    },
    completedItem: {
        padding: '.4rem .6rem',
        background: '#fdf2f7',
        borderRadius: '10px',
        border: `1px solid ${darkerPink}`,
    },
    completedLink: {
        textDecoration: 'none',
        color: '#c95b87',
        fontWeight: 600,
    },
    inlineEditor: {
        display: 'flex',
        flexDirection: 'column',
        gap: '.75rem',
        width: '100%',
        background: 'linear-gradient(160deg, #fff6fa 0%, #ffffff 100%)',
        borderRadius: '14px',
        padding: '.9rem',
        border: '1px dashed #f3c2d5',
        animation: 'inlineEditIn .18s ease-out',
    },
    inlineHeader: {
        display: 'flex',
        flexDirection: 'column',
        gap: '.15rem',
    },
    inlineTitle: {
        fontWeight: 700,
        color: '#d16b93',
        fontSize: '.95rem',
        letterSpacing: '.2px',
    },
    inlineHint: {
        color: '#a56c84',
        fontSize: '.78rem',
    },
    inlineRow: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '.6rem',
    },
    inlineField: {
        flex: '1 1 180px',
        minWidth: '160px',
        display: 'flex',
        flexDirection: 'column',
        gap: '.35rem',
    },
    inlineFieldWide: {
        flex: '1 1 320px',
        minWidth: '240px',
        display: 'flex',
        flexDirection: 'column',
        gap: '.35rem',
    },
    inlineLabel: {
        fontSize: '.7rem',
        textTransform: 'capitalize',
        letterSpacing: '.02em',
        color: '#9b6a7c',
        fontWeight: 500,
    },
    inlineInput: {
        flex: 1,
        minWidth: '180px',
        padding: '.6rem .75rem',
        borderRadius: '12px',
        border: '1px solid #f3e3ea',
        fontSize: '.9rem',
        outline: 'none',
        background: '#fff',
        boxShadow: '0 10px 20px -16px rgba(209,107,147,.35)',
    },
    inlineSelect: {
        padding: '.6rem .75rem',
        borderRadius: '12px',
        border: '1px solid #f3e3ea',
        fontSize: '.9rem',
        background: '#fff',
        boxShadow: '0 10px 20px -16px rgba(209,107,147,.35)',
    },
    inlineActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '.6rem',
    },
    inlineSave: {
        background: 'linear-gradient(140deg, #e48fb2, #d16b93)',
        color: '#fff',
        border: 'none',
        borderRadius: '999px',
        padding: '.55rem 1.2rem',
        cursor: 'pointer',
        fontWeight: 600,
        boxShadow: '0 8px 14px -8px rgba(212,108,150,.6)',
    },
    inlineCancel: {
        background: '#fff',
        color: accent,
        border: `1px solid ${accent}`,
        borderRadius: '999px',
        padding: '.55rem 1.2rem',
        cursor: 'pointer',
        fontWeight: 600,
    },
    inlineEditButton: {
        marginLeft: '.4rem',
        background: '#fff',
        border: '1px solid #f0cadb',
        color: '#92506d',
        borderRadius: '999px',
        padding: '.1rem .5rem .18rem',
        fontSize: '.95rem',
        cursor: 'pointer',
        fontWeight: 600,
        lineHeight: 1.2,
    },
    inlineErrorBox: {
        background: '#ffe0e0',
        border: '1px solid #ffcdd2',
        color: '#c62828',
        padding: '.55rem .75rem',
        borderRadius: '10px',
        fontSize: '.8rem',
    },
    inlineErrorText: {
        lineHeight: 1.3,
    },
    inputError: {
        borderColor: '#ef5b5b',
        boxShadow: '0 0 0 2px rgba(239,91,91,.2)',
    },
};
