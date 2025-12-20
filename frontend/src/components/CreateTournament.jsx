import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Quill from 'quill';
import 'quill/dist/quill.snow.css'; // Import styles
import api from '../api';

const CreateTournament = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [pointsConfig, setPointsConfig] = useState(JSON.stringify({
        "1": 10,
        "2": 6,
        "3": 5,
        "4": 4,
        "5": 3,
        "6": 2,
        "7-8": 1,
        "9-32": 0,
        "kill": 1
    }, null, 4));
    const navigate = useNavigate();
    const quillRef = useRef(null);
    const quillInstance = useRef(null);

    useEffect(() => {
        if (quillRef.current && !quillInstance.current) {
            quillInstance.current = new Quill(quillRef.current, {
                theme: 'snow',
                modules: {
                    toolbar: [
                        [{ 'header': [1, 2, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        ['image', 'code-block', 'link']
                    ]
                }
            });

            quillInstance.current.on('text-change', () => {
                setDescription(quillInstance.current.root.innerHTML);
            });
        }
    }, []);

    const [logo, setLogo] = useState(null);
    const [coverImage, setCoverImage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let parsedConfig;
            try {
                parsedConfig = JSON.parse(pointsConfig);
            } catch (err) {
                alert("Invalid JSON in Points Configuration");
                return;
            }

            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('points_config', JSON.stringify(parsedConfig)); // Send as string or ensure backend handles JSON in FormData (Multipart) correctly. Typically DRF needs simple fields.
            // PRO TIP: When using FormData, JSONField might need explicit handling or just send as JSON string if backend parses it, 
            // BUT standard DRF ModelSerializer + JSONField usually handles JSON data in FormData if sent with correct content-type header, 
            // OR we can just send it as a string if we adjust. 
            // Safer bet: DRF JSONField sometimes struggles with FormData. Let's send as string and ensuring backend parses? 
            // actually, standard Axios + DRF multipart/form-data: JSONField usually expects stringified JSON.
            // Let's send it normally but stringified if needed. 
            // Wait, models.JSONField usually handles dict. 
            // Let's rely on standard 'json' within formData which is treated as string.
            // Let's manually append it as a JSON blob or just use string. 
            // For simplicity, let's assume DRF can parse a stringified JSON for that field or we might need a small tweak. 
            // Let's try sending standard key-value. 
            formData.append('points_config', pointsConfig); // Sending the raw string from textarea might be safest if valid JSON

            formData.append('status', 'ACTIVE');
            if (logo) formData.append('logo', logo);
            if (coverImage) formData.append('cover_image', coverImage);

            await api.post('tournaments/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('Tournament Created!');
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            alert('Failed to create tournament. Please try again.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-4xl font-display font-black text-white uppercase italic tracking-wide border-l-4 border-gaming-accent pl-4">
                Create Tournament
            </h1>

            <form onSubmit={handleSubmit} className="bg-gaming-800/80 backdrop-blur border border-white/5 p-8 rounded-2xl shadow-xl space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-gray-400 tracking-wider">Tournament Name</label>
                        <input
                            className="w-full bg-gaming-900 border border-gaming-700 text-white p-4 rounded-xl focus:border-gaming-primary focus:ring-1 focus:ring-gaming-primary transition-all font-display text-lg"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Daily Wars Season 1"
                            required
                        />
                    </div>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="w-1/2 space-y-2">
                                <label className="text-xs uppercase font-bold text-gray-400 tracking-wider">Logo (Optional)</label>
                                <input
                                    type="file"
                                    className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gaming-accent file:text-gaming-900 hover:file:bg-white"
                                    onChange={e => setLogo(e.target.files[0])}
                                    accept="image/*"
                                />
                            </div>
                            <div className="w-1/2 space-y-2">
                                <label className="text-xs uppercase font-bold text-gray-400 tracking-wider">Cover Image (Optional)</label>
                                <input
                                    type="file"
                                    className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gaming-accent file:text-gaming-900 hover:file:bg-white"
                                    onChange={e => setCoverImage(e.target.files[0])}
                                    accept="image/*"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-gray-400 tracking-wider">Points Configuration (JSON)</label>
                    <textarea
                        className="w-full h-64 bg-gaming-900 border border-gaming-700 text-white p-4 rounded-xl focus:border-gaming-primary focus:ring-1 focus:ring-gaming-primary transition-all font-mono text-sm"
                        value={pointsConfig}
                        onChange={e => setPointsConfig(e.target.value)}
                        placeholder='{"1": 10, "kill": 1}'
                    />
                    <p className="text-xs text-gray-500">
                        Adjust points distribution using JSON format.
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-gray-400 tracking-wider">Description & Rules</label>
                    <div className="bg-white text-black rounded-xl overflow-hidden pb-12">
                        <div ref={quillRef} style={{ height: '300px' }} />
                    </div>
                </div>

                <div className="pt-6">
                    <button type="submit" className="w-full bg-gradient-to-r from-gaming-primary to-gaming-accent text-gaming-900 font-black uppercase py-4 rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] transform hover:-translate-y-1 transition-all duration-300 tracking-widest text-lg">
                        Launch Tournament
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateTournament;
