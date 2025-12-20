import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const AddTeam = () => {
    const [name, setName] = useState('');
    const [tournaments, setTournaments] = useState([]);
    const [tournamentId, setTournamentId] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        api.get('tournaments/').then(res => setTournaments(res.data));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('teams/', { name, tournament: tournamentId });
            alert('Team Added Successfully!');
            setName('');
            // Optional: navigate back or stay to add more
        } catch (err) {
            console.error(err);
            alert('Failed to add team');
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-3xl font-display font-black text-white uppercase italic tracking-wide border-l-4 border-gaming-accent pl-4">
                Register Team
            </h1>

            <form onSubmit={handleSubmit} className="bg-gaming-800/80 backdrop-blur border border-white/5 p-8 rounded-2xl shadow-xl space-y-6">
                <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-gray-400 tracking-wider">Select Tournament</label>
                    <select className="w-full bg-gaming-900 border border-gaming-700 text-white p-4 rounded-xl focus:border-gaming-primary focus:ring-1 focus:ring-gaming-primary transition-all appearance-none" value={tournamentId} onChange={e => setTournamentId(e.target.value)} required>
                        <option value="">Select Tournament...</option>
                        {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-gray-400 tracking-wider">Team Name</label>
                    <input className="w-full bg-gaming-900 border border-gaming-700 text-white p-4 rounded-xl focus:border-gaming-primary focus:ring-1 focus:ring-gaming-primary transition-all" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Team Soul" required />
                </div>
                <button type="submit" className="w-full bg-gaming-accent text-gaming-900 font-black uppercase py-4 rounded-xl hover:bg-white transition-colors tracking-widest text-lg shadow-lg">
                    Add Team
                </button>
            </form>
        </div>
    );
};

export default AddTeam;
