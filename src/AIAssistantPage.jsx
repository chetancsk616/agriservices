import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
// For a richer Markdown experience, you can install and use react-markdown
// import ReactMarkdown from 'react-markdown'; 

// --- Configuration ---
// FIXED: Removed the trailing slash to prevent URL errors.
const API_BASE_URL = 'https://agriservices.streamlit.app';

// --- SVG Icons ---
// FIXED: Restored correct icon sizing.
const UserIcon = () => (
    <svg className="w-8 h-8 text-white bg-green-600 rounded-full p-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);

// FIXED: Restored correct icon sizing.
const AiIcon = () => (
    <svg className="w-8 h-8" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4ade80" stopOpacity="1" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="1" />
            </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill="url(#grad1)"/>
        <path d="M50,25 A25,25 0 1,1 50,75 A25,25 0 1,1 50,25 M50,35 A15,15 0 1,0 50,65 A15,15 0 1,0 50,35" fill="white"/>
        <circle cx="50" cy="50" r="5" fill="white"/>
    </svg>
);

// FIXED: Restored correct icon sizing.
const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
    </svg>
);

const PlusIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
);


// --- Main Page Component ---
export default function AIAssistantPage() {
    const [question, setQuestion] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialView, setIsInitialView] = useState(true);
    
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview('');
        if(fileInputRef.current) fileInputRef.current.value = null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userQuestion = question.trim();
        if (!userQuestion && !imageFile) return;

        setIsInitialView(false);
        setIsLoading(true);

        const userMessage = { 
            text: userQuestion, 
            sender: 'user', 
            image: imagePreview 
        };
        setMessages(prev => [...prev, userMessage]);
        
        const formData = new FormData();
        formData.append('question', userQuestion);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        setQuestion('');
        removeImage();

        try {
            // The URL is constructed here. The base URL should not have a trailing slash.
            const response = await axios.post(`${API_BASE_URL}/analyze-chat`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const aiResponse = { text: response.data.answer, sender: 'ai' };
            setMessages(prev => [...prev, aiResponse]);
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Sorry, something went wrong.';
            setMessages(prev => [...prev, { text: `Error: ${errorMessage}`, sender: 'ai', isError: true }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 text-gray-800 font-sans">
            <header className="p-4 flex items-center">
                <h1 className="text-xl font-medium">Agri-Assistant</h1>
            </header>

            <main className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-16">
                <div className="max-w-4xl mx-auto h-full">
                    {isInitialView ? (
                        <div className="flex flex-col justify-center items-start h-full pb-32">
                            <h2 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-400 mb-4">
                                Hello, Farmer!
                            </h2>
                            <p className="text-2xl text-gray-500">How can I help you today?</p>
                        </div>
                    ) : (
                        <div className="pt-4 pb-32">
                            {messages.map((msg, index) => (
                                <div key={index} className="flex items-start gap-4 mb-8">
                                    <div className="flex-shrink-0">
                                        {msg.sender === 'user' ? <UserIcon /> : <AiIcon />}
                                    </div>
                                    <div className="flex-grow pt-1">
                                        <p className="font-bold text-lg mb-2">{msg.sender === 'user' ? 'You' : 'Agri-Assistant'}</p>
                                        {msg.image && <img src={msg.image} alt="User upload" className="rounded-lg mb-4 max-h-64 border" />}
                                        <div className="prose max-w-none">
                                            {/* For a better experience, replace this with <ReactMarkdown>{msg.text}</ReactMarkdown> */}
                                            {msg.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-start gap-4 mb-8">
                                    <div className="flex-shrink-0"><AiIcon /></div>
                                    <div className="flex-grow pt-1">
                                        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>
            </main>

            <footer className="px-4 md:px-8 lg:px-16 pb-4">
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSubmit} className="bg-white rounded-full p-2 shadow-lg border border-gray-200 flex items-center gap-2">
                        <button type="button" onClick={() => fileInputRef.current.click()} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <PlusIcon />
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        
                        <input
                            type="text"
                            className="flex-1 bg-transparent focus:outline-none text-lg placeholder-gray-500"
                            placeholder="Ask a question or upload a crop photo..."
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            disabled={isLoading}
                        />
                        <button type="submit" className="bg-green-500 text-white rounded-full p-2 hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed" disabled={isLoading || (!question.trim() && !imageFile)}>
                            <SendIcon />
                        </button>
                    </form>
                    {imagePreview && (
                        <div className="relative inline-block mt-4 ml-4">
                            <img src={imagePreview} alt="Preview" className="h-24 w-24 object-cover rounded-lg border-2 border-white shadow-md" />
                            <button onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold shadow-lg">&times;</button>
                        </div>
                    )}
                </div>
            </footer>
        </div>
    );
}
