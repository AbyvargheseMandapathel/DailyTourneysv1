import React from 'react';
import { Link } from 'react-router-dom';

const HeroModern = () => {
    return (
        <div className="relative w-full h-[600px] mb-16 rounded-3xl overflow-hidden group">
            {/* Dynamic Background Layer */}
            <div className="absolute inset-0 bg-gaming-900">
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-gaming-900 to-black z-0"></div>
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gaming-accent/10 via-transparent to-transparent z-0 opacity-50"></div>

                {/* Animated Grid Background */}
                <div className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                        transform: 'perspective(500px) rotateX(20deg) scale(1.5)'
                    }}>
                </div>

                {/* Hero Image / Graphic */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://esports.battlegroundsmobileindia.com/static/media/banner_desk.a4448558.jpg"
                        alt="Hero Background"
                        className="w-full h-full object-cover opacity-60 mix-blend-overlay transition-transform duration-[10s] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gaming-900 via-gaming-900/80 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-gaming-900 via-transparent to-transparent"></div>
                </div>
            </div>

            {/* Content Layer */}
            <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 max-w-7xl mx-auto">
                {/* Badge */}
                <div className="inline-flex items-center space-x-3 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <span className="px-3 py-1 bg-gaming-accent text-gaming-900 text-xs font-black uppercase tracking-widest rounded-sm shadow-[0_0_15px_rgba(242,169,0,0.5)]">
                        Season 4 Live
                    </span>
                    <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        <span className="text-red-400 text-xs font-bold tracking-wider uppercase">Live Now</span>
                    </div>
                </div>

                {/* Main Heading with Glitch/Neon Effect */}
                <h1 className="text-6xl md:text-8xl font-display font-black text-white leading-tight mb-8 drop-shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
                        DOMINATE
                    </span>
                    <span className="relative inline-block text-gaming-accent">
                        THE ARENA
                        <span className="absolute inset-0 text-gaming-accent blur-lg opacity-50 animate-pulse">THE ARENA</span>
                    </span>
                </h1>

                {/* Subtext */}
                <p className="max-w-xl text-lg text-gray-300 mb-10 leading-relaxed border-l-2 border-gaming-accent/50 pl-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    Join the ultimate esports showdown. Compete with top squads, climb the ranks, and claim your glory in the Daily Wars 2026.
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <Link to="/dashboard" className="relative px-8 py-4 bg-white text-gaming-900 font-black uppercase tracking-widest overflow-hidden group/btn hover:text-white transition-colors duration-300 skew-x-[-10deg]">
                        <span className="absolute inset-0 w-full h-full bg-gaming-accent scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-300 origin-left"></span>
                        <span className="relative flex items-center gap-2 skew-x-[10deg]">
                            Enter Dashboard
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                        </span>
                    </Link>

                    <button className="px-8 py-4 bg-transparent border border-white/20 text-white font-bold uppercase tracking-widest hover:bg-white/5 hover:border-white/40 transition-all duration-300 rounded skew-x-[-10deg]">
                        <span className="skew-x-[10deg] block">View Bracket</span>
                    </button>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute right-0 bottom-0 w-1/3 h-full bg-gradient-to-l from-gaming-accent/5 to-transparent skew-x-[-20deg] pointer-events-none"></div>
            <div className="absolute top-10 right-10 w-24 h-24 border-t-2 border-r-2 border-white/10 rounded-tr-3xl pointer-events-none"></div>
            <div className="absolute bottom-10 left-10 w-24 h-24 border-b-2 border-l-2 border-white/10 rounded-bl-3xl pointer-events-none"></div>
        </div>
    );
};

export default HeroModern;
