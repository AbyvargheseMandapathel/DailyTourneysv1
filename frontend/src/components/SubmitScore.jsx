import React, { useState, useEffect } from 'react';
import api from '../api';

const SubmitScore = () => {
    const [matches, setMatches] = useState([]);
    const [teams, setTeams] = useState([]);
    const [tournaments, setTournaments] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);

    // Form States
    const [selectedScoreTournament, setSelectedScoreTournament] = useState('');
    const [selectedMatch, setSelectedMatch] = useState('');
    const [selectedTeam, setSelectedTeam] = useState('');
    const [kills, setKills] = useState(0);
    const [placement, setPlacement] = useState(1);
    const [isEliminated, setIsEliminated] = useState(true); // Default to eliminated/final score

    useEffect(() => {
        api.get('tournaments/').then(res => setTournaments(res.data));
        api.get('matches/').then(res => setMatches(res.data));
        api.get('teams/').then(res => setTeams(res.data));
    }, []);

    const fetchLeaderboard = () => {
        if (selectedScoreTournament) {
            api.get(`tournaments/${selectedScoreTournament}/leaderboard/`)
                .then(res => setLeaderboard(res.data))
                .catch(err => console.error("Failed to fetch leaderboard", err));
        }
    };

    useEffect(() => {
        fetchLeaderboard();
        // Set up an interval or just rely on manual refresh/submit trigger
        // For "live" feel, we could poll every 10s
        const interval = setInterval(fetchLeaderboard, 10000);
        return () => clearInterval(interval);
    }, [selectedScoreTournament]);

    const [errorMessage, setErrorMessage] = useState(null);
    const [conflictError, setConflictError] = useState(null); // Store conflict details for force update action

    const submitScore = async (e, forceUpdate = false) => {
        if (e) e.preventDefault();
        setErrorMessage(null);
        setConflictError(null);

        try {
            await api.post('scores/', {
                match: selectedMatch,
                team: selectedTeam,
                kills: parseInt(kills),
                placement: parseInt(placement),
                force_update: forceUpdate
            });
            alert('Score added!');
            setErrorMessage(null);
            setConflictError(null);
            fetchLeaderboard(); // Update standings immediately
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data) {
                const data = err.response.data;
                // Check for placement conflict
                if (data.placement && Array.isArray(data.placement) && data.placement.some(msg => msg.includes("already taken"))) {
                    setErrorMessage(data.placement[0]);
                    setConflictError(true);
                } else {
                    // Generic error display
                    setErrorMessage(JSON.stringify(data));
                }
            } else {
                setErrorMessage('Error adding score. Check console.');
            }
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <h1 className="text-4xl font-display font-black text-white uppercase italic tracking-wide border-l-4 border-gaming-accent pl-4">
                Submit Match Score
            </h1>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Score Submission Form */}
                <div className="bg-gaming-800/80 backdrop-blur border border-white/5 p-8 rounded-2xl shadow-xl relative overflow-hidden group h-fit">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    </div>

                    <h2 className="text-xl font-display font-bold text-white mb-6 uppercase tracking-wider">Score Entry</h2>

                    <form onSubmit={submitScore} className="space-y-6 relative z-10">
                        {errorMessage && (
                            <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl">
                                <p className="text-red-400 text-sm font-bold flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {errorMessage}
                                </p>
                                {conflictError && (
                                    <div className="mt-3">
                                        <button
                                            type="button"
                                            onClick={() => submitScore(null, true)}
                                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest shadow-lg transition-all"
                                        >
                                            Delete Conflicting Score & Update
                                        </button>
                                        <p className="text-[10px] text-gray-400 mt-2">
                                            Clicking this will <span className="text-white font-bold">DELETE</span> the team currently holding this rank and save your new entry.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs uppercase font-bold text-gray-400 tracking-wider">Tournament</label>
                                <select
                                    className="w-full bg-gaming-900 border border-gaming-700 text-white p-3 rounded-xl focus:border-gaming-primary focus:ring-1 focus:ring-gaming-primary transition-all appearance-none"
                                    value={selectedScoreTournament}
                                    onChange={e => {
                                        setSelectedScoreTournament(e.target.value);
                                        setSelectedMatch('');
                                        setSelectedTeam('');
                                    }}
                                >
                                    <option value="">Select Tournament...</option>
                                    {tournaments.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs uppercase font-bold text-gray-400 tracking-wider">Match</label>
                                    <select
                                        className="w-full bg-gaming-900 border border-gaming-700 text-white p-3 rounded-xl focus:border-gaming-primary focus:ring-1 focus:ring-gaming-primary transition-all appearance-none"
                                        value={selectedMatch}
                                        onChange={e => setSelectedMatch(e.target.value)}
                                        disabled={!selectedScoreTournament}
                                    >
                                        <option value="">Select Match...</option>
                                        {matches
                                            .filter(m => !selectedScoreTournament || m.tournament === parseInt(selectedScoreTournament))
                                            .map(m => (
                                                <option key={m.id} value={m.id}>Match {m.match_number}</option>
                                            ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs uppercase font-bold text-gray-400 tracking-wider">Team</label>
                                    <select
                                        className="w-full bg-gaming-900 border border-gaming-700 text-white p-3 rounded-xl focus:border-gaming-primary focus:ring-1 focus:ring-gaming-primary transition-all appearance-none"
                                        value={selectedTeam}
                                        onChange={e => setSelectedTeam(e.target.value)}
                                        disabled={!selectedScoreTournament}
                                    >
                                        <option value="">Select Team...</option>
                                        {teams
                                            .filter(t => !selectedScoreTournament || t.tournament === parseInt(selectedScoreTournament))
                                            .map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs uppercase font-bold text-gray-400 tracking-wider">Kills</label>
                                <input type="number" className="w-full bg-gaming-900 border border-gaming-700 text-white p-3 rounded-xl focus:border-gaming-success focus:ring-1 focus:ring-gaming-success transition-all font-mono text-lg" value={kills} onChange={e => setKills(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-xs uppercase font-bold text-gray-400 tracking-wider">Rank</label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-3 w-3 text-gaming-accent rounded bg-gray-700 border-gray-600 focus:ring-0"
                                            checked={isEliminated}
                                            onChange={e => {
                                                setIsEliminated(e.target.checked);
                                                if (!e.target.checked) setPlacement(0);
                                            }}
                                        />
                                        <span className={`text-[9px] font-bold uppercase tracking-wider ${isEliminated ? 'text-red-500' : 'text-green-500'}`}>
                                            {isEliminated ? 'Dead' : 'Alive'}
                                        </span>
                                    </label>
                                </div>
                                <input
                                    type="number"
                                    className={`w-full bg-gaming-900 border border-gaming-700 text-white p-3 rounded-xl focus:border-gaming-success focus:ring-1 focus:ring-gaming-success transition-all font-mono text-lg ${!isEliminated ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    value={isEliminated ? placement : 0}
                                    onChange={e => setPlacement(e.target.value)}
                                    disabled={!isEliminated}
                                />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-white text-gaming-900 hover:bg-gaming-accent hover:text-black font-black uppercase py-4 rounded-xl shadow-lg transform hover:-translate-y-1 transition-all duration-300 tracking-widest text-sm">
                            Submit Score
                        </button>
                    </form>
                </div>

                {/* Live Leaderboard Section */}
                <div className="bg-gaming-800/80 backdrop-blur border border-white/5 p-8 rounded-2xl shadow-xl flex flex-col h-[600px]">
                    <h2 className="text-xl font-display font-bold text-white mb-6 uppercase tracking-wider flex items-center justify-between">
                        <span>Live Standings</span>
                        <span className="text-xs font-mono text-gaming-accent animate-pulse">● LIVE UPDATE</span>
                    </h2>

                    {!selectedScoreTournament ? (
                        <div className="flex-1 flex items-center justify-center text-gray-500 font-mono text-sm">
                            Select a tournament to view standings
                        </div>
                    ) : (
                        <div className="overflow-auto flex-1 pr-2 custom-scrollbar">
                            <table className="w-full text-left">
                                <thead className="text-xs text-gray-400 uppercase font-bold tracking-wider border-b border-white/10 sticky top-0 bg-gaming-800">
                                    <tr>
                                        <th className="pb-3 pl-2">#</th>
                                        <th className="pb-3">Team</th>
                                        <th className="pb-3 text-right">Kills</th>
                                        <th className="pb-3 text-right pr-2">Pts</th>
                                    </tr>
                                </thead>
                                <tbody className="font-mono text-sm">
                                    {leaderboard.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-8 text-gray-500">No scores yet</td>
                                        </tr>
                                    ) : (
                                        leaderboard.map((team, index) => (
                                            <tr key={team.team_id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className={`py-3 pl-2 font-bold ${index < 3 ? 'text-gaming-accent' : 'text-gray-500'}`}>
                                                    {index + 1}
                                                </td>
                                                <td className="py-3 font-semibold text-white">{team.team_name}</td>
                                                <td className="py-3 text-right text-gray-400">{team.total_kills}</td>
                                                <td className="py-3 text-right pr-2 font-bold text-gaming-primary">{team.total_points}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubmitScore;

