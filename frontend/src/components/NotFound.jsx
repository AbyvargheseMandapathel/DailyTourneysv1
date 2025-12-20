import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gaming-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-gaming-accent/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
            </div>

            <div className="relative z-10 text-center max-w-2xl mx-auto">
                {/* Glitch Effect 404 */}
                <h1 className="text-[150px] md:text-[200px] font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-gaming-accent to-purple-600 leading-none select-none relative animate-glitch" data-text="404">
                    404
                </h1>

                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 uppercase tracking-wider font-display">
                    Mission Failed
                </h2>

                <p className="text-gray-400 text-lg mb-10 max-w-md mx-auto leading-relaxed">
                    The map you are looking for has been removed from the rotation or never existed. Return to base immediately.
                </p>

                <Link
                    to="/"
                    className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-gaming-accent font-display uppercase tracking-widest hover:bg-gaming-accent/90 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gaming-accent focus:ring-offset-gaming-900 clip-path-polygon"
                >
                    <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
                    <span className="relative flex items-center gap-2">
                        <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Return to Base
                    </span>
                </Link>
            </div>

            {/* CSS for Glitch Animation */}
            <style jsx>{`
                @keyframes glitch {
                    0% { text-shadow: 2px 2px 0px #ff00ff, -2px -2px 0px #00ffff; }
                    25% { text-shadow: -2px 2px 0px #ff00ff, 2px -2px 0px #00ffff; }
                    50% { text-shadow: 2px -2px 0px #ff00ff, -2px 2px 0px #00ffff; }
                    75% { text-shadow: -2px -2px 0px #ff00ff, 2px 2px 0px #00ffff; }
                    100% { text-shadow: 2px 2px 0px #ff00ff, -2px -2px 0px #00ffff; }
                }
                .animate-glitch {
                    animation: glitch 3s infinite linear alternate-reverse;
                }
                .clip-path-polygon {
                    clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%);
                }
            `}</style>
        </div>
    );
};

export default NotFound;
