// src/App.jsx
import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ManagerDashboard from './components/ManagerDashboard';
import { getRoleFromToken } from './services/api';

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
    const [role, setRole] = useState(getRoleFromToken());

    const handleLoginSuccess = () => {
        setRole(getRoleFromToken());
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setRole(null);
    };

    if (!isAuthenticated) {
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    // ניתוב לפי role
    if (role === 'Manager') {
        return <ManagerDashboard onLogout={handleLogout} />;
    }

    // Admin ו-Employee רואים את Dashboard הרגיל
    return <Dashboard onLogout={handleLogout} />;
}
