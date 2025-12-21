import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import MatchWinnersCarousel from './MatchWinnersCarousel';

const Leaderboard = () => {
    const { id } = useParams();
    const [leaderboard, setLeaderboard] = useState([]);
    const [tournament, setTournament] = useState(null);
    const [matches, setMatches] = useState([]);
    const [selectedMatch, setSelectedMatch] = useState('');
    const ws = useRef(null);

    const fetchLeaderboard = () => {
        let url = `tournaments/${id}/leaderboard/`;
        if (selectedMatch) {
            url += `?match_id=${selectedMatch}`;
        }
        api.get(url).then(res => setLeaderboard(res.data));
    };

    useEffect(() => {
        // Fetch details
        api.get(`tournaments/${id}/`).then(res => setTournament(res.data));

        // Fetch matches for filtering
        api.get('matches/').then(res => {
            const tourneyMatches = res.data.filter(m => m.tournament === parseInt(id));
            setMatches(tourneyMatches);
        });

        // Initial Fetch
        fetchLeaderboard();

        // Connect WebSocket
        ws.current = new WebSocket(`ws://localhost:8000/ws/leaderboard/${id}/`);

        ws.current.onopen = () => {
            console.log('Connected to Leaderboard Stream');
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'leaderboard_update') {
                console.log('Update received, refreshing...');
            }
        };

        ws.current.onclose = () => console.log('Disconnected');

        return () => {
            if (ws.current) ws.current.close();
        };
    }, [id]); // Only run on mount/ID change.

    // Effect to refetch when filter changes
    useEffect(() => {
        fetchLeaderboard();
    }, [selectedMatch]);

    useEffect(() => {
        if (!ws.current) return;
        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'leaderboard_update') {
                fetchLeaderboard();
            }
        };
    }, [selectedMatch]);


    // Helper to extract initials
    const getInitials = (name) => {
        if (!name) return 'T';
        const words = name.trim().split(/\s+/);
        if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
        return (words[0][0] + words[1][0]).toUpperCase();
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
            {/* 1) Tournament Details Hero with Cover Image */}
            <div className="relative rounded-3xl overflow-hidden bg-gaming-800 shadow-2xl border border-white/10 group">
                <div className="h-64 md:h-80 relative">
                    {tournament?.cover_image ? (
                        <img
                            src={tournament.cover_image}
                            alt={tournament.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gaming-900 via-gaming-800 to-black pattern-grid-lg"></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-gaming-900 via-gaming-900/60 to-transparent"></div>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-8 md:p-10 flex flex-col md:flex-row items-end justify-between gap-6">
                    <div className="relative z-10">
                        <div className="flex items-center space-x-3 mb-3">
                            <span className="bg-gaming-accent text-gaming-900 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">
                                {tournament?.status || 'LOADING'}
                            </span>
                            <span className="text-gray-400 text-xs uppercase tracking-widest font-mono">
                                Season 2026
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-black text-white leading-none uppercase italic shadow-black drop-shadow-lg mb-2">
                            {tournament?.name}
                        </h1>
                        <p className="text-gray-300 max-w-2xl line-clamp-2 md:line-clamp-none text-sm md:text-base">
                            {tournament?.description || "Enter the arena and fight for glory. The ultimate battleground awaits."}
                        </p>
                    </div>

                    <div className="relative z-10 flex flex-col items-end gap-3 min-w-[200px]">
                        <div className="text-right">
                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Organized By</div>
                            <div className="flex items-center justify-end space-x-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="text-white font-bold">{tournament?.creator_username || 'Admin'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter and Content */}
            <div className="flex flex-col md:flex-row justify-between items-center border-b border-gaming-primary/10 pb-4">
                <div className="flex items-center space-x-4">
                    <h2 className="text-2xl font-display font-bold text-white uppercase flex items-center">
                        <span className="w-1 h-6 bg-gaming-accent mr-3"></span>
                        Standings
                    </h2>
                </div>
                <div className="mt-4 md:mt-0 relative w-full md:w-auto">
                    <select
                        className="w-full md:w-64 appearance-none bg-gaming-800 pl-4 pr-10 py-3 rounded-lg border border-white/10 text-gray-200 font-bold focus:outline-none focus:border-gaming-accent focus:ring-1 focus:ring-gaming-accent transition-all cursor-pointer hover:bg-gaming-700 uppercase text-xs tracking-wider"
                        value={selectedMatch}
                        onChange={(e) => setSelectedMatch(e.target.value)}
                    >
                        <option value="">OVERALL STANDINGS</option>
                        {matches.map(m => (
                            <option key={m.id} value={m.id}>MATCH {m.match_number} - {m.map_name}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gaming-accent">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                    </div>
                </div>
            </div>

            <MatchWinnersCarousel matches={matches} />

            <div className="overflow-hidden bg-gaming-800/80 backdrop-blur-sm rounded-2xl border border-white/5 shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gradient-to-r from-gaming-900 to-gaming-800 text-gray-400 font-display text-xs uppercase tracking-widest border-b border-white/5">
                        <tr>
                            <th className="p-5 w-24 text-center">Rank</th>
                            <th className="p-5">Team</th>
                            <th className="p-5 text-center">WWCD</th>
                            <th className="p-5 text-center">Kills</th>
                            <th className="p-5 text-right text-gaming-accent">Total Points</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {leaderboard.map((team, index) => {
                            let rankColor = 'text-gray-400';
                            let rowBg = 'hover:bg-white/5';

                            if (index === 0) {
                                rankColor = 'text-gaming-primary drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]';
                                rowBg = 'bg-yellow-400/5 hover:bg-yellow-400/10';
                            }
                            if (index === 1) { rankColor = 'text-gray-300'; rowBg = 'bg-gray-300/5 hover:bg-gray-300/10'; }
                            if (index === 2) { rankColor = 'text-orange-400'; rowBg = 'bg-orange-400/5 hover:bg-orange-400/10'; }

                            return (
                                <tr key={team.team_id} className={`transition-colors duration-200 ${rowBg}`}>
                                    <td className="p-5 text-center">
                                        <div className={`font-display font-black text-2xl ${rankColor}`}>#{index + 1}</div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center space-x-4">
                                            {/* 2) Team Logo with Fallback */}
                                            <div className="w-12 h-12 flex-shrink-0 bg-gaming-900 rounded-lg overflow-hidden border border-white/10 flex items-center justify-center">
                                                {team.team_logo ? (
                                                    <img src={team.team_logo} alt={team.team_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="font-display font-bold text-gaming-accent text-sm tracking-wider">
                                                        {getInitials(team.team_name)}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-lg leading-tight">{team.team_name}</div>
                                                {index === 0 && <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest">Current Leader</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5 text-center">
                                        <div className="flex items-center justify-center space-x-1">
                                            <span className="text-xl">🍗</span>
                                            <span className="font-mono text-white font-bold text-lg">{team.total_wwcd || 0}</span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-center font-mono text-gray-300 font-bold text-lg">{team.total_kills}</td>
                                    <td className="p-5 text-right font-display font-black text-2xl text-white drop-shadow-md">
                                        {team.total_points}
                                        <span className="text-xs text-gray-500 font-sans font-normal ml-1">PTS</span>
                                    </td>
                                </tr>
                            );
                        })}
                        {leaderboard.length === 0 && (
                            <tr>
                                <td colSpan="4" className="p-12 text-center text-gray-500 font-display">
                                    NO DATA AVAILABLE
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center mt-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 animate-pulse">
                    <span className="w-2 h-2 mr-2 bg-green-400 rounded-full"></span>
                    Connected to Live Server
                </span>
            </div>
        </div>
    );
};

export default Leaderboard;
