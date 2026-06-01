// src/services/api.js

const BASE_URL = 'http://localhost:8080/api';

// פונקציית עזר גנרית שמטפלת בהוספת ה-Token ובשגיאות
async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;

    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = { ...options, headers };

    const response = await fetch(url, config);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || 'Server error occurred';
        throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return await response.json();
    }
    return await response.text();
}

// שולף את ה-role מתוך ה-JWT token בלי ספריה חיצונית
export function getRoleFromToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role || null;
    } catch {
        return null;
    }
}

export const api = {
    // ─── Auth ───────────────────────────────────────────────
    login: (email, password) =>
        request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    register: (userData) =>
        request('/Users', {
            method: 'POST',
            body: JSON.stringify(userData),
        }),

    // ─── Projects ───────────────────────────────────────────
    getProjects: () => request('/projects'),

    createProject: (projectData) =>
        request('/projects', {
            method: 'POST',
            body: JSON.stringify(projectData),
        }),

    // ─── Environments ───────────────────────────────────────
    createEnvironment: (projectId, workerId) =>
        request(`/projects/${projectId}/environments?workerId=${workerId}`, {
            method: 'POST',
        }),

    getProjectEnvironments: (projectId) =>
        request(`/projects/${projectId}/environments`),

    deleteEnvironment: (projectId, envId) =>
        request(`/projects/${projectId}/environments/${envId}`, {
            method: 'DELETE',
        }),

    updateEnvironment: (envId, envData) =>
        request(`/environments/${envId}`, {
            method: 'PUT',
            body: JSON.stringify(envData),
        }),
};
