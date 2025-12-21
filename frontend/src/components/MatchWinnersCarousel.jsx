import React, { useRef } from 'react';

const MatchWinnersCarousel = ({ matches }) => {
    const scrollContainerRef = useRef(null);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = 400;
            if (direction === 'left') {
                current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    const winningMatches = matches.filter(m => m.winner);
    if (winningMatches.length === 0) return null;

    const getInitials = (name) => {
        if (!name) return 'T';
        const words = name.trim().split(/\s+/);
        if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
        return (words[0][0] + words[1][0]).toUpperCase();
    };

    return (
        <div className="mb-12 animate-slide-in relative group">
            <div className="flex justify-between items-end mb-6 px-2">
                <div>
                    <h3 className="text-2xl font-display font-black text-white uppercase flex items-center tracking-wide drop-shadow-lg">
                        <span className="w-2 h-8 bg-gradient-to-b from-yellow-400 to-yellow-600 mr-4 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.5)]"></span>
                        Match Winners
                    </h3>
                    <p className="text-gray-400 text-sm mt-1 ml-6 font-mono tracking-wider">
                        HALL OF FAME &bull; {winningMatches.length} RECORDS
                    </p>
                </div>

                {/* Navigation Buttons */}
                <div className="flex space-x-3">
                    <button
                        onClick={() => scroll('left')}
                        className="w-10 h-10 rounded-full bg-gaming-800/80 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-gaming-accent hover:text-gaming-900 transition-all active:scale-95 shadow-lg backdrop-blur-sm"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="w-10 h-10 rounded-full bg-gaming-800/80 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-gaming-accent hover:text-gaming-900 transition-all active:scale-95 shadow-lg backdrop-blur-sm"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                </div>
            </div>

            {/* Scroll Container */}
            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {winningMatches.map((match) => (
                    <div
                        key={match.id}
                        className="snap-start flex-shrink-0 w-72 md:w-80 h-48 bg-gaming-800/40 backdrop-blur-md rounded-2xl border border-white/10 hover:border-gaming-accent/50 transition-all duration-300 relative overflow-hidden group/card hover:-translate-y-1 hover:shadow-2xl hover:shadow-gaming-accent/10"
                    >
                        {/* Background Gradient/Mesh */}
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/80"></div>
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gaming-accent/10 rounded-full blur-3xl group-hover/card:bg-gaming-accent/20 transition-all duration-500"></div>

                        {/* Match Number Watermark */}
                        <div className="absolute top-2 right-4 opacity-10 group-hover/card:opacity-20 transition-opacity">
                            <span className="font-display font-black text-6xl text-white tracking-tighter">#{match.match_number}</span>
                        </div>

                        <div className="relative z-10 h-full p-6 flex flex-col justify-between">
                            {/* Top Row: Map & Match Info */}
                            <div className="flex justify-between items-start">
                                <span className="px-2 py-1 rounded bg-black/40 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-gray-300 backdrop-blur-sm">
                                    {match.map_name}
                                </span>
                            </div>

                            {/* Center Row: Team Info */}
                            <div className="flex items-center space-x-4 mt-2">
                                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-gaming-700 to-gaming-900 rounded-xl overflow-hidden flex items-center justify-center border border-white/10 shadow-lg group-hover/card:scale-105 transition-transform duration-300">
                                    {match.winner.team_logo ? (
                                        <img src={match.winner.team_logo} alt={match.winner.team_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-gaming-accent font-display font-bold text-lg">{getInitials(match.winner.team_name)}</span>
                                    )}
                                </div>
                                <div>
                                    <div className="text-[10px] text-gaming-accent font-bold uppercase tracking-widest mb-1 opacity-80">
                                        WINNER
                                    </div>
                                    <h4 className="font-display font-bold text-white text-xl leading-none tracking-wide truncate w-40" title={match.winner.team_name}>
                                        {match.winner.team_name}
                                    </h4>
                                </div>
                            </div>

                            {/* Bottom Row: Stats */}
                            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
                                <div className="flex items-center space-x-1.5 text-red-500">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd"></path></svg>
                                    <span className="font-mono font-bold text-lg tracking-widest">{match.winner.kills}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-red-400/80 ml-1">KILLS</span>
                                </div>
                                <div className="w-px h-3 bg-white/20"></div>
                                <div className="flex items-center space-x-1.5 text-yellow-500">
                                    <span className="font-mono font-bold text-lg tracking-widest">{match.winner.total_points}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-400/80 ml-1">PTS</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MatchWinnersCarousel;
