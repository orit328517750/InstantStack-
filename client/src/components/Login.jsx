// src/components/Login.jsx
import React, { useState } from 'react';
import { api } from '../services/api';

export default function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            // קריאה לשירות ה-API 
            const token = await api.login(email, password);
            
            // שמירת הטוקן בדפדפן
            localStorage.setItem('token', token);
            
            onLoginSuccess();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Login (Draft)</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                />
                <br /><br />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                />
                <br /><br />
                <button type="submit">Sign In</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}