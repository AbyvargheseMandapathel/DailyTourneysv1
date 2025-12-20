import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
    return (
        <div className="relative bg-gaming-900 rounded-3xl overflow-hidden border border-white/5 shadow-2xl mb-16">
            {/* Background Image/Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-gaming-900 via-gaming-900/95 to-transparent z-10"></div>
            <div className="absolute inset-0 bg-[url('https://esports.battlegroundsmobileindia.com/static/media/banner_desk.a4448558.jpg')] bg-cover bg-center opacity-40 grayscale z-0"></div>

            <div className="relative z-20 p-12 md:p-20 max-w-4xl">
                <div className="flex items-center space-x-4 mb-6">
                    <span className="bg-gaming-accent text-gaming-900 font-bold px-3 py-1 rounded text-xs uppercase tracking-widest">Official</span>
                    <span className="text-gray-400 text-xs uppercase tracking-widest">Battlegrounds Mobile India</span>
                </div>
                <h1 className="text-6xl md:text-8xl font-display font-black text-white leading-none mb-6 uppercase italic">
                    DAILY <span className="text-gaming-accent">WARS</span><br />
                    2026
                </h1>
                <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed border-l-4 border-gaming-accent pl-6">
                    Registrations for the biggest open-for-all esports showdown are officially LIVE!
                    Rally your squad, step into the arena, and fight for glory.
                </p>
                <div className="flex flex-wrap gap-4">
                    <button className="px-8 py-4 bg-transparent border border-gray-600 text-white font-bold rounded hover:bg-white/10 transition-colors uppercase tracking-wider">
                        Tournament Details
                    </button>
                    <Link to="/dashboard" className="px-8 py-4 bg-gaming-accent text-gaming-900 font-black rounded hover:bg-yellow-500 transition-colors uppercase tracking-wider shadow-[0_0_20px_rgba(242,169,0,0.4)]">
                        Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Hero;
