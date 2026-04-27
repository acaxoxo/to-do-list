import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const darkerPink = '#f3c2d5';
const accent = '#e48fb2';

export default function Navbar({ onSearch }) {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [showNotif, setShowNotif] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const notifRef = useRef(null);
    const calendarRef = useRef(null);

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to log out?')) {
            logout();
            navigate('/login');
        }
    };

    const CalendarPopup = () => {
        const now = new Date();
        const [currentMonth, setCurrentMonth] = useState(now.getMonth());
        const [currentYear, setCurrentYear] = useState(now.getFullYear());
        const [selectedDate, setSelectedDate] = useState(null);

        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const getDaysInMonth = (month, year) => {
            return new Date(year, month + 1, 0).getDate();
        };

        const getFirstDayOfMonth = (month, year) => {
            return new Date(year, month, 1).getDay();
        };

        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
        
        const prevMonth = () => {
            if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
            } else {
                setCurrentMonth(currentMonth - 1);
            }
        };

        const nextMonth = () => {
            if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
            } else {
                setCurrentMonth(currentMonth + 1);
            }
        };

        const handleDateClick = (day) => {
            setSelectedDate(new Date(currentYear, currentMonth, day));
        };

        const isToday = (day) => {
            const today = new Date();
            return day === today.getDate() && 
                   currentMonth === today.getMonth() && 
                   currentYear === today.getFullYear();
        };

        const isSelected = (day) => {
            if (!selectedDate) return false;
            return day === selectedDate.getDate() && 
                   currentMonth === selectedDate.getMonth() && 
                   currentYear === selectedDate.getFullYear();
        };

        // Build calendar grid
        const calendarDays = [];
        for (let i = 0; i < firstDay; i++) {
            calendarDays.push(<div key={`empty-${i}`} style={styles.emptyDay}></div>);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const today = isToday(day);
            const selected = isSelected(day);
            calendarDays.push(
                <button
                    key={day}
                    style={{
                        ...styles.calendarDay,
                        ...(today ? styles.calendarDayToday : {}),
                        ...(selected ? styles.calendarDaySelected : {}),
                    }}
                    onClick={() => handleDateClick(day)}
                >
                    {day}
                </button>
            );
        }

        return (
            <div style={styles.calendarPopup} role="dialog" aria-label="Calendar">
                <div style={styles.calendarHeader}>
                    <button 
                        style={styles.calendarNavButton}
                        onClick={prevMonth}
                        aria-label="Previous month"
                    >
                        ‹
                    </button>
                    <div style={styles.calendarTitle}>
                        {monthNames[currentMonth]} {currentYear}
                    </div>
                    <button 
                        style={styles.calendarNavButton}
                        onClick={nextMonth}
                        aria-label="Next month"
                    >
                        ›
                    </button>
                </div>
                <div style={styles.calendarWeekdays}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} style={styles.weekday}>{day}</div>
                    ))}
                </div>
                <div style={styles.calendarGrid}>
                    {calendarDays}
                </div>
                {selectedDate && (
                    <div style={styles.selectedDateInfo}>
                        Selected: {selectedDate.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </div>
                )}
            </div>
        );
    };

    useEffect(() => {
        const updateDate = () => {
            const now = new Date();
            const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
            setCurrentDate(now.toLocaleDateString('en-US', options));
        };

        updateDate();
        const interval = setInterval(updateDate, 60000);

        return () => clearInterval(interval);
    }, []);

    // Build notifications from tasks in localStorage
    useEffect(() => {
        const buildNotifs = () => {
            try {
                const stored = localStorage.getItem('tasks');
                const tasks = stored ? JSON.parse(stored) : [];
                const items = tasks
                    .map(t => ({
                        id: t.id,
                        title: t.title,
                        status: t.status,
                        createdAt: t.createdAt,
                    }))
                    // Sort by createdAt desc when available
                    .sort((a, b) => {
                        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                        return tb - ta;
                    })
                    .slice(0, 5);
                setNotifications(items);
            } catch {
                setNotifications([]);
            }
        };

        buildNotifs();
        const onStorage = (e) => {
            if (e.key === 'tasks') buildNotifs();
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    // Close notif on outside click or ESC
    useEffect(() => {
        if (!showNotif) return;
        const onClick = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotif(false);
            }
        };
        const onKey = (e) => {
            if (e.key === 'Escape') setShowNotif(false);
        };
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [showNotif]);

    // Close calendar on outside click or ESC
    useEffect(() => {
        if (!showCalendar) return;
        const onClick = (e) => {
            if (calendarRef.current && !calendarRef.current.contains(e.target)) {
                setShowCalendar(false);
            }
        };
        const onKey = (e) => {
            if (e.key === 'Escape') setShowCalendar(false);
        };
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [showCalendar]);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (onSearch) {
            onSearch(value);
        }
    };

    return (
        <nav style={styles.navbar}>
            <div style={styles.brand}>
                <h1 style={styles.brandText}>Yours!</h1>
            </div>

            <div style={styles.searchContainer}>
                <div style={styles.searchWrapper}>
                    <svg 
                        style={styles.searchIcon} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                        />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search your task here"
                        value={searchQuery}
                        onChange={handleSearch}
                        style={styles.searchInput}
                    />
                </div>
            </div>

            <div style={styles.rightSection}>
                <div style={styles.notifWrapper} ref={notifRef}>
                    <button 
                        style={styles.iconButton}
                        aria-label="Notifications"
                        title="Notifications"
                        aria-haspopup="dialog"
                        aria-expanded={showNotif}
                        onClick={() => setShowNotif(v => !v)}
                    >
                    <svg 
                        style={styles.icon} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                        />
                    </svg>
                        {notifications.length > 0 && (
                            <span style={styles.notificationBadge} aria-label={`${notifications.length} notifications`}>
                                {notifications.length}
                            </span>
                        )}
                    </button>

                    {showNotif && (
                        <div role="dialog" aria-label="Notifications" style={styles.notifPopover}>
                            <div style={styles.notifHeader}>
                                <span style={styles.notifTitle}>Notifications</span>
                                {notifications.length > 0 && (
                                    <span style={styles.notifCount}>{notifications.length}</span>
                                )}
                            </div>
                            <div style={styles.notifList}>
                                {notifications.length === 0 ? (
                                    <div style={styles.notifEmpty}>No notifications</div>
                                ) : (
                                    notifications.map(n => (
                                        <div key={n.id} style={styles.notifItem}>
                                            <div style={styles.notifDot} />
                                            <div style={styles.notifContent}>
                                                <div style={styles.notifTitleRow}>
                                                    <span style={styles.notifTask}>{n.title}</span>
                                                    <span style={{ ...styles.notifStatus, ...statusColor(n.status) }}>{labelStatus(n.status)}</span>
                                                </div>
                                                <span style={styles.notifTime}>{formatTime(n.createdAt)}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div style={styles.calendarWrapper} ref={calendarRef}>
                    <button 
                        style={styles.iconButton}
                        aria-label="Calendar"
                        title="Calendar"
                        aria-haspopup="dialog"
                        aria-expanded={showCalendar}
                        onClick={() => setShowCalendar(v => !v)}
                    >
                        <svg 
                            style={styles.icon} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                            />
                        </svg>
                    </button>

                    {showCalendar && (
                        <CalendarPopup />
                    )}
                </div>

                <div style={styles.dateDisplay}>
                    <span style={styles.dateText}>{currentDate}</span>
                </div>

                <button
                    onClick={handleLogout}
                    style={styles.logoutButton}
                    title="Log out"
                    aria-label="Log out"
                >
                    <svg 
                        style={{ ...styles.icon, color: '#ff6b6b' }} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                        />
                    </svg>
                </button>
            </div>
        </nav>
    );
}

const styles = {
    navbar: {
        position: 'relative',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
        padding: '1rem 1.5rem',
        background: '#fffffffa',
        backdropFilter: 'blur(4px)',
        borderRadius: '16px',
        boxShadow: '0 4px 12px -4px rgba(240,120,160,0.2)',
        border: `2px solid ${darkerPink}`,
        marginBottom: '1.5rem',
    },
    brand: {
        flex: '1 1 0',
        minWidth: '100px',
        display: 'flex',
        justifyContent: 'flex-start',
    },
    brandText: {
        margin: 0,
        fontSize: '1.5rem',
        fontWeight: 700,
        color: accent,
        letterSpacing: '.5px',
        cursor: 'default',
        whiteSpace: 'nowrap',
    },
    searchContainer: {
        flex: '2 1 0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchWrapper: {
        position: 'relative',
        width: '100%',
        maxWidth: '500px',
    },
    searchIcon: {
        position: 'absolute',
        left: '1rem',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '18px',
        height: '18px',
        color: '#999',
        pointerEvents: 'none',
    },
    searchInput: {
        width: '100%',
        padding: '.7rem 1rem .7rem 2.8rem',
        fontSize: '.85rem',
        border: `2px solid ${darkerPink}`,
        borderRadius: '999px',
        background: '#ffeaf2',
        color: '#3d3d3d',
        outline: 'none',
        transition: 'all .25s',
        fontFamily: 'inherit',
    },
    rightSection: {
        flex: '1 1 0',
        minWidth: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '.75rem',
    },
    iconButton: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        background: '#ffeaf2',
        border: `2px solid ${darkerPink}`,
        borderRadius: '50%',
        cursor: 'pointer',
        transition: 'all .25s',
    },
    icon: {
        width: '20px',
        height: '20px',
        color: accent,
    },
    notificationBadge: {
        position: 'absolute',
        top: '-6px',
        right: '-6px',
        minWidth: '18px',
        height: '18px',
        padding: '0 5px',
        background: '#ff6b6b',
        color: '#fff',
        borderRadius: '999px',
        border: '2px solid #fff',
        fontSize: '.65rem',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
    },
    notifWrapper: {
        position: 'relative',
        zIndex: 101,
    },
    calendarWrapper: {
        position: 'relative',
        zIndex: 101,
    },
    calendarPopup: {
        position: 'absolute',
        top: '48px',
        right: 0,
        width: '320px',
        background: '#fff',
        border: `2px solid ${darkerPink}`,
        borderRadius: '14px',
        boxShadow: '0 10px 24px -8px rgba(240,120,160,0.35)',
        zIndex: 9999,
        padding: '1rem',
    },
    calendarHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '.75rem',
        paddingBottom: '.5rem',
        borderBottom: `1px solid ${darkerPink}`,
    },
    calendarNavButton: {
        background: 'transparent',
        border: 'none',
        fontSize: '1.5rem',
        fontWeight: 700,
        color: accent,
        cursor: 'pointer',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '6px',
        transition: 'all .2s',
    },
    calendarTitle: {
        fontWeight: 800,
        color: accent,
        fontSize: '.95rem',
        letterSpacing: '.3px',
    },
    calendarWeekdays: {
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '.25rem',
        marginBottom: '.5rem',
    },
    weekday: {
        textAlign: 'center',
        fontSize: '.7rem',
        fontWeight: 700,
        color: '#777',
        padding: '.4rem 0',
        textTransform: 'uppercase',
        letterSpacing: '.5px',
    },
    calendarGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '.25rem',
    },
    emptyDay: {
        aspectRatio: '1',
    },
    calendarDay: {
        aspectRatio: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '.8rem',
        fontWeight: 500,
        border: `1px solid ${darkerPink}`,
        borderRadius: '6px',
        background: '#ffeaf2',
        color: '#3d3d3d',
        cursor: 'pointer',
        transition: 'all .2s',
    },
    calendarDayToday: {
        background: accent,
        color: '#fff',
        fontWeight: 700,
        border: `2px solid ${accent}`,
    },
    calendarDaySelected: {
        background: darkerPink,
        color: '#fff',
        fontWeight: 700,
        border: `2px solid ${darkerPink}`,
    },
    selectedDateInfo: {
        marginTop: '.75rem',
        padding: '.6rem',
        background: '#fff0f6',
        borderRadius: '8px',
        fontSize: '.75rem',
        fontWeight: 600,
        color: '#555',
        textAlign: 'center',
    },
    notifPopover: {
        position: 'absolute',
        top: '48px',
        right: 0,
        width: '320px',
        background: '#fff',
        border: `2px solid ${darkerPink}`,
        borderRadius: '14px',
        boxShadow: '0 10px 24px -8px rgba(240,120,160,0.35)',
        zIndex: 9999,
        overflow: 'hidden',
    },
    notifHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '.75rem 1rem',
        background: '#fff0f6',
        borderBottom: `1px solid ${darkerPink}`,
    },
    notifTitle: {
        fontWeight: 800,
        color: accent,
        fontSize: '.9rem',
        letterSpacing: '.3px',
    },
    notifCount: {
        background: accent,
        color: '#fff',
        borderRadius: '999px',
        fontSize: '.7rem',
        fontWeight: 700,
        padding: '.15rem .5rem',
    },
    notifList: {
        maxHeight: '300px',
        overflowY: 'auto',
        padding: '.4rem 0',
    },
    notifItem: {
        display: 'flex',
        gap: '.6rem',
        padding: '.6rem 1rem',
        alignItems: 'center',
        borderBottom: '1px solid #f6e3ec',
    },
    notifDot: {
        width: '8px',
        height: '8px',
        background: accent,
        borderRadius: '50%',
        flex: '0 0 auto',
    },
    notifContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '.2rem',
        minWidth: 0,
    },
    notifTitleRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '.6rem',
    },
    notifTask: {
        fontWeight: 700,
        color: '#3d3d3d',
        fontSize: '.9rem',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    notifStatus: {
        fontSize: '.65rem',
        fontWeight: 800,
        padding: '.2rem .4rem',
        borderRadius: '999px',
        textTransform: 'uppercase',
        letterSpacing: '.6px',
        whiteSpace: 'nowrap',
    },
    notifTime: {
        fontSize: '.7rem',
        color: '#777',
    },
    notifEmpty: {
        padding: '1rem',
        textAlign: 'center',
        color: '#777',
        fontSize: '.85rem',
    },
    dateDisplay: {
        padding: '.6rem 1rem',
        background: '#ffeaf2',
        border: `2px solid ${darkerPink}`,
        borderRadius: '999px',
        marginLeft: '.25rem',
    },
    dateText: {
        fontSize: '.8rem',
        fontWeight: 600,
        color: '#555',
        letterSpacing: '.3px',
        whiteSpace: 'nowrap',
    },
    logoutButton: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        background: '#ffebee',
        border: '2px solid #ffcdd2',
        borderRadius: '50%',
        cursor: 'pointer',
        transition: 'all .25s',
        marginLeft: '.5rem',
    },
};

const addGlobalHover = () => {
    const style = document.createElement('style');
    style.innerHTML = `
        nav input:focus {
            border-color: ${accent} !important;
            background: #fff !important;
            box-shadow: 0 0 0 3px rgba(228,143,178,0.15) !important;
        }
        nav button:hover {
            background: ${accent} !important;
            transform: scale(1.05);
        }
        nav button:hover svg {
            color: #fff !important;
        }
        nav button:active {
            transform: scale(0.95);
        }

        /* Calendar navigation button hover */
        button[aria-label="Previous month"]:hover,
        button[aria-label="Next month"]:hover {
            background: #fff0f6 !important;
            transform: scale(1) !important;
        }

        /* Calendar day hover */
        button[style*="calendarDay"]:hover {
            background: ${darkerPink} !important;
            color: #fff !important;
            transform: scale(1.05) !important;
        }
        
        @media (max-width: 768px) {
            nav {
                flex-wrap: wrap;
            }
            nav > div:nth-child(2) {
                order: 3;
                flex: 1 1 100%;
                max-width: 100% !important;
                margin-top: .75rem;
            }
        }
    `;
    document.head.appendChild(style);
};

if (typeof window !== 'undefined' && !window.__navbarHoverInjected) {
    window.__navbarHoverInjected = true;
    addGlobalHover();
}

// Helpers for notifications UI
function labelStatus(status) {
    if (status === 'completed') return 'Done';
    if (status === 'in-progress') return 'In Progress';
    return 'Pending';
}

function statusColor(status) {
    switch (status) {
        case 'completed':
            return { background: '#76c893', color: '#fff' };
        case 'in-progress':
            return { background: '#ffafcc', color: '#5f0f40' };
        default:
            return { background: '#bdb2ff', color: '#2d2d2d' };
    }
}

function formatTime(iso) {
    if (!iso) return '';
    try {
        const d = new Date(iso);
        return d.toLocaleString();
    } catch {
        return '';
    }
}
