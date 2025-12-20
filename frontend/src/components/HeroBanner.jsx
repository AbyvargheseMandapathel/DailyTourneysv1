import React from 'react';
import { Link } from 'react-router-dom';

const HeroBanner = () => {
    return (
        <div className="relative w-full h-96 mb-12 rounded-lg overflow-hidden group border border-white/10 shadow-2xl">
            {/* Background Texture - "Tech Mesh" */}
            <div className="absolute inset-0 bg-gaming-900 pointer-events-none">
                <div className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage: `
                            linear-gradient(45deg, #1a1b1e 25%, transparent 25%), 
                            linear-gradient(-45deg, #1a1b1e 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #1a1b1e 75%), 
                            linear-gradient(-45deg, transparent 75%, #1a1b1e 75%)
                        `,
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                    }}>
                </div>
                {/* Diagonal Slash Graphic */}
                <div className="absolute inset-0 bg-gradient-to-r from-gaming-900 via-gaming-900/90 to-transparent z-10"></div>

                {/* Hero Image */}
                <img
                    src="https://esports.battlegroundsmobileindia.com/static/media/banner_desk.a4448558.jpg"
                    alt="Tournament Banner"
                    className="absolute right-0 top-0 w-3/5 h-full object-cover grayscale opacity-50 mix-blend-luminosity z-0 clip-path-slant"
                    style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)' }}
                />
            </div>

            {/* Content Container - Flex Layout for "Banner" feel */}
            <div className="relative z-20 h-full flex flex-row items-center justify-between px-10 md:px-16 max-w-7xl mx-auto">

                {/* Left Side: Info Block */}
                <div className="flex-1 max-w-2xl">
                    <div className="flex items-center space-x-2 mb-4">
                        <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-sm">
                            Live Now
                        </span>
                        <div className="h-px w-12 bg-white/20"></div>
                        <span className="text-gray-400 text-xs uppercase tracking-widest font-mono">
                            Series A // Major 04
                        </span>
                    </div>

                    <h1 className="text-5xl font-display font-black text-white uppercase italic tracking-tighter leading-none mb-2">
                        Daily Wars <span className="text-transparent bg-clip-text bg-gradient-to-r from-gaming-accent to-yellow-200">2026</span>
                    </h1>
                    <p className="text-xl text-gray-400 font-light mb-8 max-w-lg">
                        The arena awaits. Squad up and conquer.
                    </p>

                    <div className="flex items-center gap-4">
                        <Link to="/dashboard" className="group relative inline-flex items-center justify-center px-8 py-3 bg-white text-black font-black uppercase tracking-widest hover:bg-gaming-accent transition-colors skew-x-[-10deg]">
                            <span className="skew-x-[10deg]">Join Lobby</span>
                        </Link>
                        <div className="text-xs font-mono text-gray-500">
                            <span className="block text-white font-bold">1,240</span>
                            Players Online
                        </div>
                    </div>
                </div>

                {/* Right Side: Prize Pool / Key Stat (Hidden on mobile) */}
                <div className="hidden md:flex flex-col items-end text-right border-l border-white/10 pl-8 py-4">
                    <span className="text-gaming-accent text-sm font-bold uppercase tracking-widest mb-1">Prize Pool</span>
                    <span className="text-4xl font-display font-black text-white">₹ 50,000</span>
                    <span className="text-xs text-gray-500 mt-2 font-mono">Updated: Just now</span>
                </div>
            </div>

            {/* Bottom Ticker / Bar */}
            <div className="absolute bottom-0 left-0 w-full h-10 bg-black/60 backdrop-blur border-t border-white/5 flex items-center px-6 space-x-8 z-30">
                <div className="flex items-center text-[10px] text-gray-400 uppercase tracking-widest space-x-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <span>Server Status: Stable</span>
                </div>
                <div className="flex items-center text-[10px] text-gray-400 uppercase tracking-widest space-x-2">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"></path></svg>
                    <span>Next Match: 18:00 IST</span>
                </div>
            </div>
        </div>
    );
};

export default HeroBanner;
