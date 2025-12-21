import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

import FeaturedGrid from './FeaturedGrid';

const TournamentList = () => {
    const [tournaments, setTournaments] = useState([]);

    useEffect(() => {
        api.get('tournaments/')
            .then(res => {
                if (Array.isArray(res.data)) {
                    setTournaments(res.data);
                } else if (res.data && Array.isArray(res.data.results)) {
                    // Handle paginated response
                    setTournaments(res.data.results);
                } else {
                    console.error("Unexpected API response for tournaments:", res.data);
                    setTournaments([]);
                }
            })
            .catch(err => {
                console.error("Failed to fetch tournaments", err);
                setTournaments([]);
            });
    }, []);

    return (
        <div className="space-y-12 animate-fade-in">
            <FeaturedGrid />

            <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-6">
                <h2 className="text-2xl font-bold text-gaming-accent uppercase tracking-widest flex items-center">
                    <span className="w-8 h-1 bg-gaming-accent mr-4"></span>
                    Active Tournaments
                </h2>
                <div className="text-sm text-gray-400 font-mono">
                    SEASON 2026
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {tournaments.map((t, idx) => (
                    <Link key={t.id} to={`/tournament/${t.id}`} className="group relative flex flex-col h-full bg-gaming-800 rounded-2xl overflow-hidden border border-white/5 hover:border-gaming-accent/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,247,255,0.15)] hover:-translate-y-2">
                        {/* Image Placeholder Area */}
                        <div className="relative h-48 bg-gray-900 overflow-hidden">
                            {t.cover_image ? (
                                <img
                                    src={t.cover_image}
                                    alt={t.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                            ) : (
                                <div className="w-full h-full bg-black flex items-center justify-center relative group-hover:scale-110 transition-transform duration-700">
                                    <h3 className="text-white font-black text-2xl uppercase tracking-widest text-center px-4 z-10">
                                        {t.name}
                                    </h3>
                                    {/* Subtle grid pattern for black bg */}
                                    <div className="absolute inset-0 opacity-20"
                                        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
                                </div>
                            )}

                            <div className="absolute top-4 right-4 z-20">
                                <span className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${t.status === 'ACTIVE' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-yellow-500/20 border-yellow-500 text-yellow-400'}`}>
                                    {t.status}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col relative z-20 bg-gaming-800">

                            <h2 className="text-2xl font-display font-bold text-white mb-2 leading-none group-hover:text-gaming-accent transition-colors">
                                {t.name}
                            </h2>
                            <div className="flex items-center space-x-2 mb-6">
                                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Host:</span>
                                <span className="text-xs text-gray-300 bg-white/5 px-2 py-0.5 rounded">{t.creator_username}</span>
                            </div>

                            <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                <div className="text-xs font-mono text-gray-500">
                                    Format: <span className="text-gray-300">SQUADS</span>
                                </div>
                                <span className="text-gaming-accent font-bold text-sm flex items-center group-hover:translate-x-1 transition-transform">
                                    ENTER LOBBY <span className="ml-1">→</span>
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}

                {tournaments.length === 0 && (
                    <div className="col-span-full py-32 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/5">
                        <p className="text-2xl font-display font-bold text-gray-500">NO ACTIVE TOURNAMENTS</p>
                        <p className="text-gray-600 mt-2">The arena is quiet... for now.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TournamentList;
