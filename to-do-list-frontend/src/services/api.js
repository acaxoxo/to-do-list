const API_BASE_URL = 'http://localhost:5000/api';

// Helper untuk tambah token ke headers
const getHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
    };
};

// Auth API
export const authAPI = {
    register: async (username, email, password) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Registration failed');
        return data;
    },
    
    login: async (email, password) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Login failed');
        return data;
    },
    requestPasswordReset: async (email) => {
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Reset request failed');
        return data;
    },
    resetPassword: async (token, password) => {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Reset failed');
        return data;
    },
};

// Tasks API
export const tasksAPI = {
    create: async (task) => {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(task),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to create task');
        return data;
    },
    
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'GET',
            headers: getHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch tasks');
        return data;
    },
    
    getOne: async (id) => {
        const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
            method: 'GET',
            headers: getHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch task');
        return data;
    },
    
    update: async (id, task) => {
        const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(task),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update task');
        return data;
    },
    
    delete: async (id) => {
        const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to delete task');
        return data;
    },
};
