import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import ThemeEditor from './ThemeEditor';

const AdminDashboard = () => {
    // MVP: Simulate "Logged in as Admin" by having a super-powered UI
    // In real app, check context/auth
    const [isApproved, setIsApproved] = useState(false);
    const [tournaments, setTournaments] = useState([]);
    const [showThemeEditor, setShowThemeEditor] = useState(null);

    useEffect(() => {
        // Initial check from local storage for instant feedback
        const storedApproved = localStorage.getItem('is_approved');
        const role = localStorage.getItem('role');
        const localApproved = (storedApproved === 'true') || (role === 'ADMIN');

        console.log("Dashboard - Initial Local State:", localApproved);
        setIsApproved(localApproved);

        // Fetch latest status from API
        api.get('user/profile/')
            .then(res => {
                const { is_approved, role } = res.data;
                const freshApproved = is_approved || (role === 'ADMIN');

                console.log("Dashboard - Fresh Profile:", res.data);
                console.log("Dashboard - Fresh Approved State:", freshApproved);

                // Update local storage to keep it in sync
                localStorage.setItem('is_approved', is_approved);
                localStorage.setItem('role', role); // In case role changed

                setIsApproved(freshApproved);

                if (freshApproved) {
                    api.get('tournaments/').then(res => setTournaments(res.data));
                }
            })
            .catch(err => {
                console.error("Dashboard - Failed to fetch profile:", err);
                // If API fails, we stick with local storage state
            });
    }, []);

    if (!isApproved) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="bg-red-900/20 border border-red-500/50 p-8 rounded-2xl max-w-lg">
                    <h2 className="text-3xl font-display font-bold text-red-500 mb-4">Account Not Approved</h2>
                    <p className="text-gray-300 text-lg mb-6">Your organiser account is pending approval.</p>
                    <div className="bg-black/40 p-4 rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">Please contact support:</p>
                        <p className="text-xl font-mono font-bold text-white selection:bg-red-500/30">+91 73062 55503</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid gap-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center justify-between border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-4xl font-display font-black text-white uppercase italic tracking-wide">Organiser Dashboard</h1>
                    <p className="text-gray-400 mt-2 font-mono">Manage tournaments, teams, and live scoring.</p>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Create Tournament Card */}
                <Link to="/dashboard/create" className="group p-8 bg-gaming-800 rounded-2xl border border-white/5 hover:border-gaming-primary transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <svg className="w-24 h-24 text-gaming-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 2h2v4h4v2h-4v4h-2v-4H8V9h4V5z" /></svg>
                    </div>
                    <h3 className="text-xl font-display font-bold text-gaming-primary mb-2">New Tournament</h3>
                    <p className="text-gray-400 text-xs">Launch a new competition.</p>
                </Link>

                {/* Create Match Card */}
                <Link to="/dashboard/create-match" className="group p-8 bg-gaming-800 rounded-2xl border border-white/5 hover:border-gaming-success transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <svg className="w-24 h-24 text-gaming-success" fill="currentColor" viewBox="0 0 24 24"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" /></svg>
                    </div>
                    <h3 className="text-xl font-display font-bold text-gaming-success mb-2">Create Match</h3>
                    <p className="text-gray-400 text-xs">Initialize game lobbies.</p>
                </Link>

                {/* Add Team Card */}
                <Link to="/dashboard/add-team" className="group p-8 bg-gaming-800 rounded-2xl border border-white/5 hover:border-gaming-accent transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <svg className="w-24 h-24 text-gaming-accent" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
                    </div>
                    <h3 className="text-xl font-display font-bold text-gaming-accent mb-2">Register Team</h3>
                    <p className="text-gray-400 text-xs">Add squads to tournaments.</p>
                </Link>

                {/* Submit Score Card */}
                <Link to="/dashboard/submit-score" className="group p-8 bg-gaming-800 rounded-2xl border border-white/5 hover:border-white transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    </div>
                    <h3 className="text-xl font-display font-bold text-white mb-2">Submit Scores</h3>
                    <p className="text-gray-400 text-xs">Update match results.</p>
                </Link>
            </div>
            {/* Active Tournaments Section */}
            <div>
                <h2 className="text-2xl font-display font-bold text-white mb-6 uppercase tracking-wider border-l-4 border-white pl-4">
                    Your Competitions
                </h2>
                <div className="space-y-4">
                    {tournaments.length === 0 ? (
                        <p className="text-gray-500 font-mono">No tournaments found.</p>
                    ) : (
                        tournaments.map(t => (
                            <div key={t.id} className="bg-gaming-800 p-6 rounded-xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-black rounded-lg overflow-hidden border border-white/10">
                                        {t.logo ? (
                                            <img src={t.logo} alt={t.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-700 font-bold">LOG</div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{t.name}</h3>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${t.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                                                {t.status}
                                            </span>
                                            <span className="text-gray-500 text-xs font-mono">ID: {t.id}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => setShowThemeEditor(t.id)}
                                        className="px-4 py-2 bg-gaming-900 hover:bg-white hover:text-black border border-white/10 rounded-lg text-sm font-bold uppercase transition-all"
                                    >
                                        Layout & Theme
                                    </button>
                                    <a
                                        href={`${import.meta.env.VITE_API_URL}tournaments/${t.id}/generate_image/`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-4 py-2 bg-gaming-accent text-black rounded-lg text-sm font-bold uppercase hover:brightness-110 transition-all shadow-lg flex items-center"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                        Download Image
                                    </a>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Theme Editor Modal */}
            {showThemeEditor && (
                <ThemeEditor
                    tournamentId={showThemeEditor}
                    onClose={() => setShowThemeEditor(null)}
                />
            )}
            {/* Active Tournaments Section */}
            <div>
                <h2 className="text-2xl font-display font-bold text-white mb-6 uppercase tracking-wider border-l-4 border-white pl-4">
                    Your Competitions
                </h2>
                <div className="space-y-4">
                    {tournaments.length === 0 ? (
                        <p className="text-gray-500 font-mono">No tournaments found.</p>
                    ) : (
                        tournaments.map(t => (
                            <div key={t.id} className="bg-gaming-800 p-6 rounded-xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-black rounded-lg overflow-hidden border border-white/10">
                                        {t.logo ? (
                                            <img src={t.logo} alt={t.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-700 font-bold">LOG</div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{t.name}</h3>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${t.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                                                {t.status}
                                            </span>
                                            <span className="text-gray-500 text-xs font-mono">ID: {t.id}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => setShowThemeEditor(t.id)}
                                        className="px-4 py-2 bg-gaming-900 hover:bg-white hover:text-black border border-white/10 rounded-lg text-sm font-bold uppercase transition-all"
                                    >
                                        Layout & Theme
                                    </button>
                                    <a
                                        href={`${import.meta.env.VITE_API_URL}tournaments/${t.id}/generate_zip/`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-4 py-2 bg-gaming-800 text-white border border-white/20 rounded-lg text-sm font-bold uppercase hover:bg-white hover:text-black transition-all shadow-lg flex items-center"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                        ZIP
                                    </a>
                                    <a
                                        href={`${import.meta.env.VITE_API_URL}tournaments/${t.id}/generate_image/`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-4 py-2 bg-gaming-accent text-black rounded-lg text-sm font-bold uppercase hover:brightness-110 transition-all shadow-lg flex items-center"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                        Download Image
                                    </a>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Theme Editor Modal */}
            {showThemeEditor && (
                <ThemeEditor
                    tournamentId={showThemeEditor}
                    onClose={() => setShowThemeEditor(null)}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
