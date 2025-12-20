import React, { useState, useEffect } from 'react';
import api from '../api';

const CreateMatch = () => {
    const [matchNumber, setMatchNumber] = useState('');
    const [mapName, setMapName] = useState('Erangel');
    const [tournaments, setTournaments] = useState([]);
    const [tournamentId, setTournamentId] = useState('');

    useEffect(() => {
        api.get('tournaments/').then(res => setTournaments(res.data));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('matches/', {
                tournament: tournamentId,
                match_number: parseInt(matchNumber),
                map_name: mapName
            });
            alert('Match Created Successfully!');
            setMatchNumber('');
        } catch (err) {
            console.error(err);
            alert('Failed to create match. Check if match number already exists.');
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-3xl font-display font-black text-white uppercase italic tracking-wide border-l-4 border-gaming-success pl-4">
                Create Match
            </h1>

            <form onSubmit={handleSubmit} className="bg-gaming-800/80 backdrop-blur border border-white/5 p-8 rounded-2xl shadow-xl space-y-6">
                <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-gray-400 tracking-wider">Select Tournament</label>
                    <select className="w-full bg-gaming-900 border border-gaming-700 text-white p-4 rounded-xl focus:border-gaming-success focus:ring-1 focus:ring-gaming-success transition-all appearance-none" value={tournamentId} onChange={e => setTournamentId(e.target.value)} required>
                        <option value="">Select Tournament...</option>
                        {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-gray-400 tracking-wider">Match Number</label>
                        <input type="number" className="w-full bg-gaming-900 border border-gaming-700 text-white p-4 rounded-xl focus:border-gaming-success focus:ring-1 focus:ring-gaming-success transition-all" value={matchNumber} onChange={e => setMatchNumber(e.target.value)} placeholder="1" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-gray-400 tracking-wider">Map Name</label>
                        <select className="w-full bg-gaming-900 border border-gaming-700 text-white p-4 rounded-xl focus:border-gaming-success focus:ring-1 focus:ring-gaming-success transition-all appearance-none" value={mapName} onChange={e => setMapName(e.target.value)} required>
                            <option value="Erangel">Erangel</option>
                            <option value="Miramar">Miramar</option>
                            <option value="Sanhok">Sanhok</option>
                            <option value="Vikendi">Vikendi</option>
                        </select>
                    </div>
                </div>

                <button type="submit" className="w-full bg-gaming-success text-gaming-900 font-black uppercase py-4 rounded-xl hover:bg-white transition-colors tracking-widest text-lg shadow-lg">
                    Initialize Match
                </button>
            </form>
        </div>
    );
};

export default CreateMatch;
