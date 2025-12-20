import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('login/', { username, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role);
            localStorage.setItem('user_id', res.data.user_id);
            window.dispatchEvent(new Event('auth-change'));
            alert('Login Successful');
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            alert('Invalid credentials');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-gray-800 rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
                <input className="w-full p-2 bg-gray-700 rounded" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
                <input className="w-full p-2 bg-gray-700 rounded" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                <button className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded font-bold">Login</button>
            </form>
            <p className="mt-4 text-center text-gray-400 text-sm">
                Don't have an account? <Link to="/register" className="text-purple-400 hover:underline">Sign up</Link>
            </p>
        </div>
    );
};

export default Login;
