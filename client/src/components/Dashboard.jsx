// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Dashboard({ onLogout }) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentEnv, setCurrentEnv] = useState(null)  

    // טעינת הפרויקטים מיד כשהמסך עולה
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

    const handleSendToManager = async () => {
        if(!currentEnv) return;
        try{
            const updateData = {
                ...currentEnv,
                status: 'RUNNING'
            }
            await api.updateEnvironment(currentEnv.id,updateData)
            console.log("status: ",currentEnv.status);
            
            alert("הסביבה נשלחה למנהל בהצלחה!")
            setCurrentEnv(null)
            loadProjects()
        }catch (err) {
            alert(`שגיאה בשליחה למנהל: ${err.message}`)
        }
    }

    const handleCreateEnvironment = async (projectId) => {
        try {
            alert(`Starting environment creation for project ${projectId}...`);
            
            // נניח לצורך הבדיקה שה-workerId הוא 1 (השרת שלך ייקח את ה-ID מהטוקן אם הוא Employee)
            const newEnv = await api.createEnvironment(projectId, 1);
            setCurrentEnv(newEnv);
            
            alert(`Success! Environment running on port: ${newEnv.port}`);
            
            // רענון רשימת הפרויקטים כדי לראות את הסביבה החדשה ברשימה
            loadProjects(); 
        } catch (err) {
            alert(`Failed to create environment: ${err.message}`);
        }
    };

    if (loading) return <h3>Loading projects from Spring Boot...</h3>;
    if (error) return <div style={{ color: 'red' }}>Error: {error} <button onClick={onLogout}>Logout</button></div>;

    

    return (
        <div style={{ padding: '20px' }}>
            <h2>InstantStack Dashboard</h2>
            <button onClick={onLogout}>Logout</button>
            <hr/>

            {currentEnv && (
            <div style={{ background: '#e6f7ff', padding: '15px', margin: '15px 0', border: '1px solid #91d5ff', borderRadius: '5px' }}>
                <p style={{ color: '#0050b3', fontWeight: 'bold' }}>
                    הסביבה מוכנה בפורט: {currentEnv.port}! 
                </p>
                <p>העבודה שלך מוכנה? לחץ על הכפתור כדי לעדכן את ה-DB ולשתף עם המנהל:</p>
                <button onClick={handleSendToManager} style={{ backgroundColor: '#52c41a', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    ✉️ שלח למנהל
                </button>
            </div>
        )}
            
            <h3>My Projects</h3>
            {projects.length === 0 ? <p>No projects found for this user.</p> : (
                <ul>
                    {projects.map(project => (
                        <li key={project.id} style={{ marginBottom: '15px' }}>
                            <strong>{project.name}</strong> (ID: {project.id})
                            <br/>
                            <button onClick={() => handleCreateEnvironment(project.id)}>
                                🚀 Launch Dynamic Environment
                            </button>

                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}