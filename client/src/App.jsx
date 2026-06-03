import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ManagerDashboard from './components/ManagerDashboard';
import AdminDashboard from './components/AdminDashboard';
import { getRoleFromToken } from './services/api';
import './index.css';

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
    const [role, setRole] = useState(getRoleFromToken());
    const navigate = useNavigate();

    const handleLoginSuccess = () => {
        const currentRole = getRoleFromToken();
        setRole(currentRole);
        setIsAuthenticated(true);
        // ניווט אוטומטי לדשבורד לאחר התחברות
        navigate('/dashboard'); 
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setRole(null);
        navigate('/');
    };

    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} onNavigateToRegister={() => navigate('/register')} />} />
            <Route path="/register" element={<Register onRegisterSuccess={() => navigate('/login')} onNavigateToLogin={() => navigate('/login')} />} />
            
            {isAuthenticated ? (
                <>
                    {role === 'Admin' && <Route path="/dashboard/*" element={<AdminDashboard onLogout={handleLogout} />} />}
                    {role === 'Manager' && <Route path="/dashboard/*" element={<ManagerDashboard onLogout={handleLogout} />} />}
                    <Route path="/dashboard/*" element={<Dashboard onLogout={handleLogout} />} />
                </>
            ) : (
                <Route path="*" element={<Login onLoginSuccess={handleLoginSuccess} />} />
            )}
        </Routes>
    );
}