import React, { useEffect, useState, useMemo } from 'react';
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

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const result = await tasksAPI.getAll();
            setTasks(result.tasks || []);
            setError('');
        } catch (err) {
            console.error('Failed to fetch tasks:', err);
            setError(err.message);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

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
                                style={styles.taskItem}
                                onClick={() => navigate(`/todoitem/${task.id}`)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={e => e.key === 'Enter' && navigate(`/todoitem/${task.id}`)}
                            >
                                <div style={styles.taskContent}>
                                    <span style={styles.taskTitle}>{task.title}</span>
                                    {task.dueDate && (
                                        <span style={styles.dueDate}>
                                            📅 {new Date(task.dueDate).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                                        </span>
                                    )}
                                </div>
                                <div style={styles.taskBadges}>
                                    {task.priority && (
                                        <span style={{ ...styles.priorityBadge, ...priorityColor(task.priority) }}>
                                            {task.priority}
                                        </span>
                                    )}
                                    <span style={{ ...styles.statusBadge, ...badgeColor(task.status) }}>
                                        {label(task.status)}
                                    </span>
                                </div>
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
        padding: '1.1rem 1.1rem 1.3rem',
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
        fontSize: '1.15rem',
        fontWeight: 700,
        margin: 0,
        color: '#bf4d79',
        letterSpacing: '.3px',
    },
    addBtn: {
        background: accent,
        color: '#fff',
        border: 'none',
        padding: '.5rem .85rem',
        fontSize: '.75rem',
        borderRadius: '999px',
        cursor: 'pointer',
        letterSpacing: '.5px',
        fontWeight: 600,
        boxShadow: '0 4px 12px -3px rgba(228,143,178,.5)',
        transition: '.25s',
    },
    taskList: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '.55rem',
    },
    taskItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '.5rem',
        padding: '.6rem .75rem',
        borderRadius: '12px',
        background: '#ffeaf2',
        fontSize: '.8rem',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'background .25s, transform .25s',
        outline: 'none',
    },
    taskContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '.2rem',
        flex: 1,
        minWidth: 0,
    },
    taskTitle: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    dueDate: {
        fontSize: '.65rem',
        color: '#666',
        whiteSpace: 'nowrap',
    },
    taskBadges: {
        display: 'flex',
        gap: '.3rem',
        flexShrink: 0,
    },
    priorityBadge: {
        fontSize: '.6rem',
        padding: '.2rem .4rem',
        borderRadius: '8px',
        fontWeight: 600,
        letterSpacing: '.4px',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
    },
    progressShell: {
        position: 'relative',
        width: '80px',
        height: '8px',
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
    statusBadge: {
        fontSize: '.6rem',
        padding: '.2rem .4rem',
        borderRadius: '8px',
        fontWeight: 600,
        letterSpacing: '.4px',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
    },
    empty: {
        fontSize: '.75rem',
        color: '#777',
        padding: '.75rem',
        textAlign: 'center',
        background: '#f7f7f7',
        borderRadius: '10px',
    },
    progressGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '.65rem',
        marginTop: '.4rem',
        flexGrow: 1,
    },
    statusRow: {
        display: 'grid',
        gridTemplateColumns: '85px 1fr 44px',
        alignItems: 'center',
        gap: '.55rem',
    },
    statusLabel: {
        fontSize: '.65rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '.8px',
        color: '#555',
    },
    barTrack: {
        position: 'relative',
        height: '10px',
        borderRadius: '6px',
        background: '#f4d2de',
        overflow: 'hidden',
    },
    barFill: {
        position: 'absolute',
        inset: 0,
        width: '0%',
        borderRadius: 'inherit',
        transition: 'width .6s cubic-bezier(.65,.05,.36,1)',
    },
    barValue: {
        fontSize: '.65rem',
        fontWeight: 600,
        textAlign: 'right',
        color: '#444',
    },
    miniCounts: {
        marginTop: 'auto',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '.6rem',
        fontSize: '.6rem',
        fontWeight: 600,
        letterSpacing: '.5px',
        color: '#6a3551',
    },
    completedList: {
        listStyle: 'none',
        margin: '.4rem 0 0',
        padding: 0,
        overflowY: 'auto',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '.5rem',
    },
    completedItem: {
        background: '#e9f9ef',
        padding: '.55rem .7rem',
        borderRadius: '12px',
        fontSize: '.7rem',
        fontWeight: 600,
        letterSpacing: '.4px',
        display: 'flex',
        alignItems: 'center',
    },
    completedLink: {
        color: '#2e7d53',
        textDecoration: 'none',
        flex: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    '@media(maxWidth:600px)': {},
};

const addGlobalHover = () => {
    const style = document.createElement('style');
    style.innerHTML = `
        .task-hover:hover { background:#ffd3e4 !important; transform:translateY(-2px); }
        button:hover { filter:brightness(.92); transform:translateY(-2px); }
        button:active { transform:translateY(0); }
        @media (max-width: 700px){
            .task-hover { font-size:.75rem; }
        }
    `;
    document.head.appendChild(style);
};

if (typeof window !== 'undefined' && !window.__dashboardHoverInjected) {
    window.__dashboardHoverInjected = true;
    addGlobalHover();
}