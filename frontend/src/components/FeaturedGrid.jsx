import React, { useEffect, useState } from 'react';
import api from '../api';

const FeaturedGrid = () => {
    const [content, setContent] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        api.get('featured/')
            .then(res => {
                if (Array.isArray(res.data)) {
                    setContent(res.data);
                } else if (res.data && Array.isArray(res.data.results)) {
                    // Handle paginated response
                    setContent(res.data.results);
                } else {
                    console.error("Unexpected API response for featured content:", res.data);
                    setContent([]);
                }
            })
            .catch(err => {
                console.error("Failed to fetch featured content", err);
                setContent([]);
            });
    }, []);

    // Filter content by type
    const mainContents = content.filter(item => item.content_type === 'MAIN');
    const sideContent = content.filter(item => item.content_type === 'SIDE').slice(0, 2);
    const bottomContent = content.filter(item => item.content_type === 'BOTTOM').slice(0, 4);

    // Auto-carousel effect
    useEffect(() => {
        if (mainContents.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % mainContents.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [mainContents.length]);

    // If no content at all, hide the section entirely
    if (content.length === 0) {
        return null;
    }

    const currentMain = mainContents[currentSlide];
    const showTopSection = mainContents.length > 0 || sideContent.length > 0;
    const showBottomSection = bottomContent.length > 0;

    return (
        <div className="max-w-7xl mx-auto mb-16 space-y-6">
            {/* Top Section: Main Hero + Side Column */}
            {showTopSection && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[500px]">

                    {/* Main Hero Item (Takes 2/3 width normally, full width if no side content) */}
                    {mainContents.length > 0 && (
                        <div className={`${sideContent.length > 0 ? 'md:col-span-2' : 'md:col-span-3'} relative group overflow-hidden rounded-3xl cursor-pointer shadow-2xl border border-white/5`}>
                            {currentMain && (
                                <div className="relative w-full h-full">
                                    {/* Slide Image with fade transition */}
                                    <img
                                        key={currentMain.id}
                                        src={currentMain.image}
                                        alt={currentMain.title}
                                        className="w-full h-full object-cover animate-fade-in transition-transform duration-700 group-hover:scale-105"
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

                                    {/* Text Content */}
                                    <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
                                        <h2 className="text-4xl md:text-6xl font-display font-black text-white italic uppercase leading-none mb-4 drop-shadow-xl animate-slide-in">
                                            {currentMain.title}
                                        </h2>
                                        <p className="text-xl text-gray-200 font-medium max-w-lg drop-shadow-md">
                                            {currentMain.subtitle}
                                        </p>
                                    </div>

                                    {/* Carousel Indicators */}
                                    {mainContents.length > 1 && (
                                        <div className="absolute bottom-6 right-6 flex space-x-2 z-20">
                                            {mainContents.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={(e) => { e.stopPropagation(); setCurrentSlide(idx); }}
                                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-gaming-accent w-6' : 'bg-white/50 hover:bg-white'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Side Column (Takes 1/3 width, stacks vertically) */}
                    {sideContent.length > 0 && (
                        <div className="flex flex-col gap-6 h-full">
                            {sideContent.map((item, index) => (
                                <div key={item.id} className="relative flex-1 group overflow-hidden rounded-3xl cursor-pointer shadow-xl border border-white/5">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                                    <div className="absolute bottom-0 left-0 p-6 w-full">
                                        <span className="text-gaming-accent text-xs font-bold uppercase tracking-widest mb-1 block">
                                            Top Product
                                        </span>
                                        <h3 className="text-2xl font-display font-bold text-white uppercase leading-tight group-hover:text-gaming-accent transition-colors">
                                            {item.title}
                                        </h3>
                                        {item.subtitle && <p className="text-gray-400 text-sm mt-1 line-clamp-1">{item.subtitle}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Bottom Section: 4-Column Grid */}
            {showBottomSection && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {bottomContent.map((item) => (
                        <div key={item.id} className="relative group overflow-hidden rounded-2xl aspect-[4/3] cursor-pointer shadow-lg border border-white/5 bg-gaming-800">
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                            />
                            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black to-transparent">
                                <h4 className="text-white font-bold font-display uppercase text-lg leading-none mb-1">
                                    {item.title}
                                </h4>
                                <span className="text-gaming-accent text-xs font-bold uppercase tracking-wider group-hover:underline">
                                    Shop Now &rarr;
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FeaturedGrid;
