import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    // const [role, setRole] = useState('ORGANISER'); // Default set in backend now
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('register/', { username, password }); // Role handled by backend
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role);
            localStorage.setItem('user_id', res.data.user_id);
            localStorage.setItem('is_approved', res.data.is_approved);
            alert('Registration Successful');
            navigate('/dashboard'); // Go to dashboard, which will show approval message
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.error || 'Registration Failed';
            alert(errorMessage);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-gray-800 rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
            <form onSubmit={handleRegister} className="space-y-4">
                <input className="w-full p-2 bg-gray-700 rounded" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
                <input className="w-full p-2 bg-gray-700 rounded" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                {/* Role selection removed - Defaults to Organiser */}
                <button className="w-full bg-green-600 hover:bg-green-700 py-2 rounded font-bold">Sign Up</button>
            </form>
            <p className="mt-4 text-center text-gray-400 text-sm">
                Already have an account? <Link to="/login" className="text-purple-400 hover:underline">Login</Link>
            </p>
        </div>
    );
};

export default Signup;
