import React, { useState, useEffect, useRef } from 'react';
import api from '../api';

const ThemeEditor = ({ tournamentId, onClose }) => {
    // UI State
    const [themes, setThemes] = useState([]);
    const [selectedThemeId, setSelectedThemeId] = useState(null); // 'new' or ID
    const [themeName, setThemeName] = useState('New Theme');
    const [themeImage, setThemeImage] = useState(null);
    const [customFont, setCustomFont] = useState(null);
    const [teamsPerPage, setTeamsPerPage] = useState(20);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Config State
    const [config, setConfig] = useState({
        start_x: 100,
        start_y: 300,
        row_height: 50,
        font_size: 40,
        font_color: '#FFFFFF',
        font_weight: 0,
        logo_size: 40, // Default logo size
        logo_y_offset: 0,
        columns: {
            rank: 0,
            team: 100,
            wwcd: 500,
            matches: 650,
            pos_pts: 800,
            fin_pts: 950,
            total: 1100
        }
    });

    const [isSaving, setIsSaving] = useState(false);
    const imageRef = useRef(null);

    // Initial Load - Fetch Tournament Data to get Themes
    useEffect(() => {
        if (tournamentId) {
            fetchThemes();
        }
    }, [tournamentId]);

    const fetchThemes = () => {
        api.get(`tournaments/${tournamentId}/`).then(res => {
            const fetchedThemes = res.data.themes || [];
            if (fetchedThemes.length > 0) {
                setThemes(fetchedThemes);
                // Select first theme by default if none selected
                if (!selectedThemeId) selectTheme(fetchedThemes[0]);
            } else {
                // Prepare "New Theme" state
                resetForm();
            }
        });
    };

    const selectTheme = (theme) => {
        setSelectedThemeId(theme.id);
        setThemeName(theme.name);
        setTeamsPerPage(theme.teams_per_page || 20);
        setConfig(theme.layout_config || {});

        // Handle URL logic
        let imageUrl = theme.theme_image;
        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('blob:')) {
            // It's likely a relative path from backend (e.g. /media/...)
            // Remove leading slash if API_URL has trailing slash, or handle standard join
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/'; // fallback
            // Strip /api/ from base if it exists because media is usually at root
            const rootUrl = baseUrl.replace(/\/api\/$/, '');
            imageUrl = `${rootUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
        }
        setPreviewUrl(imageUrl);

        // Reset file inputs since we can't prefill them
        setThemeImage(null);
        setCustomFont(null);

        // If theme has custom font, we can't easily preview it without URL, 
        // but if user uploads new one, we handle it.
    };

    const resetForm = () => {
        setSelectedThemeId('new');
        setThemeName('New Theme');
        setTeamsPerPage(20);
        setPreviewUrl(null);
        setThemeImage(null);
        setCustomFont(null);
        // Keep default config structure
        setConfig({
            start_x: 100, start_y: 300, row_height: 50, font_size: 40, font_color: '#FFFFFF', font_weight: 0, logo_size: 40, logo_y_offset: 0,
            columns: { rank: 0, logo: 50, team: 100, wwcd: 500, matches: 650, pos_pts: 800, fin_pts: 950, total: 1100 }
        });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setThemeImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleFontUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setCustomFont(file);
            // Load font for preview
            try {
                const buffer = await file.arrayBuffer();
                const fontName = `CustomFont_${Date.now()}`;
                const fontFace = new FontFace(fontName, buffer);
                await fontFace.load();
                document.fonts.add(fontFace);
                // Store font family name in config (temp for preview only, backend uses file)
                // We'll pass this down to overlay
                setConfig(prev => ({ ...prev, _previewFontFamily: fontName }));
            } catch (err) {
                console.error("Failed to load custom font preview", err);
            }
        }
    };

    const handleImageClick = (e) => {
        if (!imageRef.current) return;
        const rect = imageRef.current.getBoundingClientRect();

        // Calculate click position relative to the displayed image size
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Scale to actual image dimensions
        const scaleX = imageRef.current.naturalWidth / rect.width;
        const scaleY = imageRef.current.naturalHeight / rect.height;

        const actualX = Math.round(clickX * scaleX);
        const actualY = Math.round(clickY * scaleY);

        // Update Start X/Y
        setConfig(prev => ({
            ...prev,
            start_x: actualX,
            start_y: actualY
        }));
    };

    const saveConfig = async () => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', themeName);
            formData.append('teams_per_page', teamsPerPage);
            formData.append('layout_config', JSON.stringify(config));

            if (themeImage) formData.append('theme_image', themeImage);
            if (customFont) formData.append('custom_font', customFont);

            let promise;
            if (selectedThemeId && selectedThemeId !== 'new') {
                // Update existing theme
                promise = api.patch(`tournament_themes/${selectedThemeId}/`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Create new theme
                formData.append('tournament', tournamentId);
                promise = api.post(`tournament_themes/`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            await promise;
            alert('Theme saved successfully!');
            fetchThemes(); // Refresh list
            // Don't close immediately so user can verify
        } catch (err) {
            console.error(err);
            alert('Failed to save config. ' + (err.response?.data?.detail || err.message));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 lg:p-8">
            <div className="bg-gaming-800 w-full max-w-7xl h-[95vh] rounded-2xl flex border border-white/10 overflow-hidden shadow-2xl">
                {/* Config Sidebar */}
                <div className="w-full lg:w-1/3 bg-gaming-900 p-6 overflow-y-auto border-r border-white/10 space-y-8 custom-scrollbar">

                    {/* Header & Theme Selection */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold font-display text-white uppercase tracking-wider">Theme Editor</h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="flex space-x-2">
                            <select
                                className="flex-1 bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm"
                                value={selectedThemeId || 'new'}
                                onChange={(e) => {
                                    if (e.target.value === 'new') resetForm();
                                    else selectTheme(themes.find(t => t.id === parseInt(e.target.value)));
                                }}
                            >
                                <option value="new">+ Create New Theme</option>
                                {themes.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>

                        <input
                            type="text"
                            className="w-full bg-transparent border-b border-white/10 text-xl font-bold text-white placeholder-gray-600 focus:outline-none focus:border-gaming-accent transition-colors pb-2"
                            placeholder="Theme Name (e.g. Red Style)"
                            value={themeName}
                            onChange={(e) => setThemeName(e.target.value)}
                        />
                    </div>

                    {/* Basic Settings */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest border-b border-white/5 pb-2">Assets & Setup</h3>

                            <div>
                                <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Background Template</label>
                                <input type="file" onChange={handleImageUpload} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:uppercase file:bg-white/10 file:text-white hover:file:bg-gaming-accent hover:file:text-black transition-all cursor-pointer" />
                            </div>

                            <div>
                                <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Custom Font (Optional)</label>
                                <input type="file" accept=".ttf,.otf" onChange={handleFontUpload} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:uppercase file:bg-white/10 file:text-white hover:file:bg-gaming-accent hover:file:text-black transition-all cursor-pointer" />
                            </div>

                            <div>
                                <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Teams Per Page</label>
                                <input type="number" value={teamsPerPage} onChange={e => setTeamsPerPage(parseInt(e.target.value))} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white font-mono text-sm focus:border-gaming-accent focus:ring-1 focus:ring-gaming-accent transition-all" />
                            </div>
                        </div>

                        {/* Measurements */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest border-b border-white/5 pb-2">Layout & Typography</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Row Height</label>
                                    <input type="number" value={config.row_height} onChange={e => setConfig({ ...config, row_height: parseInt(e.target.value) })} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white font-mono text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Logo Size (Sq)</label>
                                    <input type="number" value={config.logo_size || 40} onChange={e => setConfig({ ...config, logo_size: parseInt(e.target.value) })} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white font-mono text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Logo Y Offset</label>
                                    <input type="number" value={config.logo_y_offset || 0} onChange={e => setConfig({ ...config, logo_y_offset: parseInt(e.target.value) })} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white font-mono text-sm" placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Font Size</label>
                                    <input type="number" value={config.font_size} onChange={e => setConfig({ ...config, font_size: parseInt(e.target.value) })} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white font-mono text-sm" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Font Color</label>
                                    <div className="flex gap-2">
                                        <input type="color" value={config.font_color} onChange={e => setConfig({ ...config, font_color: e.target.value })} className="h-10 w-12 bg-transparent border-0 rounded cursor-pointer" />
                                        <input type="text" value={config.font_color} onChange={e => setConfig({ ...config, font_color: e.target.value })} className="flex-1 bg-black/30 border border-white/10 rounded p-2 text-white font-mono text-sm" />
                                    </div>
                                </div>
                                <div className="col-span-2 flex items-center gap-4">
                                    <label className="flex items-center space-x-2 w-full">
                                        <span className="text-[10px] font-bold uppercase text-gray-500 whitespace-nowrap">Stroke Width (Boldness):</span>
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            value={config.font_weight || 0}
                                            onChange={e => setConfig({ ...config, font_weight: parseInt(e.target.value) || 0 })}
                                            className="w-16 bg-black/30 border border-white/10 rounded p-2 text-white font-mono text-sm"
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Columns */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest border-b border-white/5 pb-2">Column Offsets (X-Axis)</h3>
                            <p className="text-[10px] text-gray-500">Uncheck to hide column from the image.</p>

                            <div className="space-y-3">
                                {[
                                    { id: 'rank', label: 'Rank' },
                                    { id: 'logo', label: 'Team Logo' },
                                    { id: 'team', label: 'Team Name' },
                                    { id: 'wwcd', label: 'WWCD' },
                                    { id: 'matches', label: 'Matches' },
                                    { id: 'pos_pts', label: 'Pos. Pts' },
                                    { id: 'fin_pts', label: 'Fin. Pts' },
                                    { id: 'total', label: 'Total Pts' }
                                ].map(col => {
                                    const isVisible = config.columns.hasOwnProperty(col.id);
                                    return (
                                        <div key={col.id} className="flex items-center justify-between group p-2 rounded-lg hover:bg-white/5 transition-colors">
                                            <div className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={isVisible}
                                                    onChange={(e) => {
                                                        const newCols = { ...config.columns };
                                                        if (e.target.checked) {
                                                            newCols[col.id] = 100; // Default value
                                                        } else {
                                                            delete newCols[col.id];
                                                        }
                                                        setConfig({ ...config, columns: newCols });
                                                    }}
                                                    className="rounded border-white/20 bg-black/50 text-gaming-accent focus:ring-gaming-accent"
                                                />
                                                <span className={`text-xs font-bold uppercase transition-colors ${isVisible ? 'text-white' : 'text-gray-600'}`}>
                                                    {col.label}
                                                </span>
                                            </div>

                                            {isVisible && (
                                                <input
                                                    type="number"
                                                    value={config.columns[col.id]}
                                                    onChange={e => setConfig({
                                                        ...config,
                                                        columns: { ...config.columns, [col.id]: parseInt(e.target.value) || 0 }
                                                    })}
                                                    className="w-20 bg-black/30 border border-white/10 rounded p-1 text-white text-right font-mono text-sm focus:bg-black/50 focus:border-gaming-accent focus:outline-none"
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 sticky bottom-0 bg-gaming-900 border-t border-white/5">
                        <button
                            onClick={saveConfig}
                            disabled={isSaving}
                            className="w-full bg-gaming-accent text-black font-black uppercase py-4 rounded-xl hover:bg-white transition-all disabled:opacity-50 shadow-lg"
                        >
                            {isSaving ? 'Saving...' : 'Save Theme'}
                        </button>

                        {selectedThemeId && selectedThemeId !== 'new' && (
                            <a
                                href={`${import.meta.env.VITE_API_URL}tournaments/${tournamentId}/generate_zip/?theme_id=${selectedThemeId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="block text-center w-full bg-gaming-800 text-white font-bold uppercase py-4 rounded-xl hover:bg-gaming-accent hover:text-black transition-all border border-white/10 mt-4"
                            >
                                Download ZIP (All Pages)
                            </a>
                        )}
                    </div>
                </div>

                {/* Preview Area */}
                <div className="flex-1 bg-black/50 flex flex-col relative">
                    <div className="absolute top-4 right-4 z-10 bg-black/80 px-4 py-2 rounded-full text-xs font-mono text-white/50 border border-white/10 backdrop-blur pointer-events-none">
                        Click on image to set Start X/Y
                    </div>

                    <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
                        {previewUrl ? (
                            <div className="relative border-2 border-gaming-accent/30 shadow-2xl inline-block max-h-full max-w-full">
                                <img
                                    ref={imageRef}
                                    src={previewUrl}
                                    alt="Theme Preview"
                                    className="max-h-[85vh] object-contain cursor-crosshair"
                                    onClick={handleImageClick}
                                />
                                {/* Overlay */}
                                <div className="absolute inset-0 pointer-events-none">
                                    {imageRef.current && (
                                        <ConfigOverlay config={config} imgRef={imageRef} tournamentId={tournamentId} teamsPerPage={teamsPerPage} />
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-500 font-mono space-y-4">
                                <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <span>Upload a background image to start</span>
                            </div>
                        )}
                    </div>

                    {/* Bottom Status Bar */}
                    <div className="h-10 bg-gaming-900 border-t border-white/10 flex items-center px-4 justify-between text-[10px] text-gray-500 font-mono uppercase">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <span className="font-bold">X:</span>
                                <input
                                    type="number"
                                    value={config.start_x}
                                    onChange={e => setConfig({ ...config, start_x: parseInt(e.target.value) || 0 })}
                                    className="w-16 bg-black/30 border border-white/10 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-gaming-accent"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="font-bold">Y:</span>
                                <input
                                    type="number"
                                    value={config.start_y}
                                    onChange={e => setConfig({ ...config, start_y: parseInt(e.target.value) || 0 })}
                                    className="w-16 bg-black/30 border border-white/10 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-gaming-accent"
                                />
                            </div>
                        </div>
                        <div>
                            Teams/Page: {teamsPerPage} | {config.font_color}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper component to handle overlay re-rendering
const ConfigOverlay = ({ config, imgRef, tournamentId, teamsPerPage }) => {
    // Force re-render on window resize
    const [, setTick] = useState(0);
    const [sampleData, setSampleData] = useState([]);

    useEffect(() => {
        const handleResize = () => setTick(t => t + 1);
        window.addEventListener('resize', handleResize);
        if (imgRef.current) imgRef.current.onload = handleResize;
        return () => window.removeEventListener('resize', handleResize);
    }, [imgRef]);

    useEffect(() => {
        if (tournamentId) {
            // Fetch real leaderboard data for preview
            api.get(`tournaments/${tournamentId}/leaderboard/`)
                .then(res => {
                    // Take slice based on pagination limit
                    setSampleData(res.data.slice(0, teamsPerPage || 10));
                })
                .catch(err => console.error("Preview fetch failed", err));
        }
    }, [tournamentId, teamsPerPage]);

    if (!imgRef.current) return null;

    const rect = imgRef.current.getBoundingClientRect();
    const naturalW = imgRef.current.naturalWidth;
    const naturalH = imgRef.current.naturalHeight;

    if (!naturalW) return null; // Not loaded yet

    const scaleX = rect.width / naturalW;
    const scaleY = rect.height / naturalH;

    const startX = config.start_x * scaleX;
    const startY = config.start_y * scaleY;
    const rowH = config.row_height * scaleY;

    // Use sample data if available, else dummy rows
    const displayRows = sampleData.length > 0 ? sampleData : [
        { team_name: "Team Soul", total_wwcd: 2, matches: 5, total_position_points: 40, total_kills: 35, total_points: 75 },
    ];

    const fontSizeScaled = (config.font_size || 40) * scaleY;

    return (
        <div
            className="absolute inset-0 pointer-events-none font-sans"
            style={{
                color: config.font_color || 'white',
                // Simulate stroke using text-shadow or WebkitTextStroke. Scale stroke just like font size.
                WebkitTextStroke: config.font_weight ? `${config.font_weight * scaleY}px ${config.font_color || 'white'}` : '0px',
                fontFamily: config._previewFontFamily ? `"${config._previewFontFamily}", sans-serif` : 'sans-serif'
            }}
        >
            {/* Start Point Marker */}
            <div className="absolute w-3 h-3 bg-red-500 rounded-full border border-white -translate-x-1/2 -translate-y-1/2 shadow-sm" style={{ top: startY, left: startX }}></div>

            {displayRows.map((team, idx) => {
                const rowTop = startY + (idx * rowH);
                return (
                    <div key={idx} className="absolute w-full border-b border-red-500/20 border-dashed flex items-center whitespace-nowrap" style={{ top: rowTop, left: 0, height: rowH }}>
                        {/* Only render columns present in config and not "0" or "false" if we considered valid check? 
                            Actually, render all keys in config.columns.
                        */}
                        {Object.entries(config.columns).map(([key, offset]) => (
                            <div key={key} className="absolute" style={{ left: startX + (offset * scaleX), fontSize: fontSizeScaled }}>
                                {key === 'rank' ? (idx + 1) :
                                    key === 'logo' ? <div className="bg-gray-500/50 border border-white/20 flex items-center justify-center text-[8px] uppercase text-white/50" style={{
                                        width: (config.logo_size || 40) * scaleY,
                                        height: (config.logo_size || 40) * scaleY,
                                        transform: `translateY(-${50 - (config.logo_y_offset || 0)}%)` // Start from center (-50%) then add offset. Wait, translate is relative to element. 
                                        // Actually simplest is specific style top/transform similar to backend logic
                                        // Backend: logo_y = current_y + (row_height - logo_size) // 2 + offset
                                        // Here we are inside a row div of height rowH.
                                        // So we should just position it relative to row.
                                    }}>Logo</div> :
                                        key === 'team' ? team.team_name :
                                            key === 'wwcd' ? team.total_wwcd :
                                                key === 'matches' ? (team.matches || 1) :
                                                    key === 'pos_pts' ? team.total_position_points :
                                                        key === 'fin_pts' ? team.total_kills :
                                                            key === 'total' ? team.total_points : 0}
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
    );
}

export default ThemeEditor;
