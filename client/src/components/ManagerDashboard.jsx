// src/components/ManagerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function ManagerDashboard({ onLogout }) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // לכל פרויקט שומרים את הסביבות שלו: { [projectId]: Environment[] }
    const [environmentsByProject, setEnvironmentsByProject] = useState({});
    // אילו פרויקטים "פתוחים" להצגת סביבות: { [projectId]: boolean }
    const [expandedProjects, setExpandedProjects] = useState({});

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const data = await api.getProjects();
            setProjects(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // טוען סביבות של פרויקט מסוים (רק כשפותחים אותו)
    const loadEnvironments = async (projectId) => {
        try {
            const envs = await api.getProjectEnvironments(projectId);
            setEnvironmentsByProject((prev) => ({ ...prev, [projectId]: envs }));
        } catch (err) {
            setEnvironmentsByProject((prev) => ({ ...prev, [projectId]: [] }));
            alert(`שגיאה בטעינת סביבות: ${err.message}`);
        }
    };

    // פותח/סוגר פרויקט — וטוען סביבות אם עדיין לא נטענו
    const toggleProject = async (projectId) => {
        const isExpanded = expandedProjects[projectId];

        if (!isExpanded && !environmentsByProject[projectId]) {
            await loadEnvironments(projectId);
        }

        setExpandedProjects((prev) => ({ ...prev, [projectId]: !isExpanded }));
    };

    // פותח את האפליקציה של העובד ב-tab חדש
    const handleOpenApp = (port) => {
        window.open(`http://localhost:${port}`, '_blank');
    };

    // מחיקת סביבה (למנהל — לסגור סביבה שסיימה)
    const handleDeleteEnvironment = async (projectId, envId) => {
        if (!window.confirm(`למחוק סביבה ${envId}?`)) return;
        try {
            await api.deleteEnvironment(projectId, envId);
            // עדכון הרשימה המקומית בלי fetch מחדש
            setEnvironmentsByProject((prev) => ({
                ...prev,
                [projectId]: prev[projectId].filter((e) => e.id !== envId),
            }));
        } catch (err) {
            alert(`שגיאה במחיקה: ${err.message}`);
        }
    };

    if (loading) return <h3>Loading...</h3>;
    if (error) return (
        <div style={{ color: 'red' }}>
            Error: {error} <button onClick={onLogout}>Logout</button>
        </div>
    );

    return (
        <div style={{ padding: '20px' }}>
            <h2>Manager Dashboard</h2>
            <button onClick={onLogout}>Logout</button>
            <hr />

            <h3>My Projects</h3>

            {projects.length === 0 ? (
                <p>No projects found.</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {projects.map((project) => {
                        const isExpanded = expandedProjects[project.id];
                        const envs = environmentsByProject[project.id] || [];
                        // רק סביבות RUNNING
                        const runningEnvs = envs.filter((e) => e.status === 'RUNNING');

                        return (
                            <li key={project.id} style={{ marginBottom: '15px', border: '1px solid #ddd', borderRadius: '6px', padding: '12px' }}>
                                {/* שורת הפרויקט */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <strong>{project.name}</strong>
                                    <span style={{ color: '#888', fontSize: '0.85em' }}>ID: {project.id}</span>
                                    <button onClick={() => toggleProject(project.id)}>
                                        {isExpanded ? '▲ הסתר סביבות' : '▼ הצג סביבות RUNNING'}
                                    </button>
                                </div>

                                {/* רשימת סביבות RUNNING */}
                                {isExpanded && (
                                    <div style={{ marginTop: '10px', paddingLeft: '16px' }}>
                                        {runningEnvs.length === 0 ? (
                                            <p style={{ color: '#888' }}>אין סביבות פעילות כרגע.</p>
                                        ) : (
                                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                                {runningEnvs.map((env) => (
                                                    <li key={env.id} style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '10px',
                                                        marginBottom: '8px',
                                                        padding: '8px',
                                                        background: '#f6ffed',
                                                        border: '1px solid #b7eb8f',
                                                        borderRadius: '4px'
                                                    }}>
                                                        <span>🟢</span>
                                                        <span>סביבה #{env.id}</span>
                                                        <span style={{ color: '#555' }}>פורט: <strong>{env.port}</strong></span>
                                                        <span style={{ color: '#555' }}>עובד: {env.workerId}</span>

                                                        {/* פתיחת האפליקציה */}
                                                        <button
                                                            onClick={() => handleOpenApp(env.port)}
                                                            style={{ backgroundColor: '#1890ff', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer' }}
                                                        >
                                                            🔗 פתח אפליקציה
                                                        </button>

                                                        {/* סגירת הסביבה */}
                                                        <button
                                                            onClick={() => handleDeleteEnvironment(project.id, env.id)}
                                                            style={{ backgroundColor: '#ff4d4f', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer' }}
                                                        >
                                                            🗑 סגור
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
