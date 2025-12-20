import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
    const navigate = useNavigate();

    useEffect(() => {
        const handleAuthChange = () => setIsAuthenticated(!!localStorage.getItem('token'));
        window.addEventListener('storage', handleAuthChange);
        window.addEventListener('auth-change', handleAuthChange);
        return () => {
            window.removeEventListener('storage', handleAuthChange);
            window.removeEventListener('auth-change', handleAuthChange);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('user_id');
        window.dispatchEvent(new Event('auth-change'));
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-50 px-8 py-5 bg-gaming-900/95 backdrop-blur-md border-b border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-8">
                <Link to="/" className="text-2xl font-display font-black tracking-widest text-white uppercase italic">
                    ESP<span className="text-gaming-accent">DAILY</span>
                </Link>
                <div className="hidden md:flex space-x-8 text-sm font-bold tracking-widest text-gray-400 uppercase">
                    <Link to="/" className="hover:text-white transition-colors">Tournaments</Link>
                    <Link to="/" className="hover:text-white transition-colors">Rankings</Link>
                    <Link to="/" className="hover:text-white transition-colors">Videos</Link>
                </div>
            </div>

            <div className="flex items-center gap-6 font-bold tracking-wide">
                {isAuthenticated ? (
                    <>
                        <Link to="/dashboard" className="text-gaming-accent hover:text-white transition-colors uppercase text-sm">Dashboard</Link>
                        <button onClick={handleLogout} className="bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white px-4 py-2 rounded text-xs font-bold uppercase transition-all">
                            Sign Out
                        </button>
                    </>
                ) : (
                    <Link to="/login" className="bg-gaming-accent text-gaming-900 hover:bg-white px-6 py-2 rounded text-xs font-black uppercase tracking-widest transition-all">
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
