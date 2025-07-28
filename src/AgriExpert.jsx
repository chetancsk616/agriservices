import React, { useState } from 'react';
import axios from 'axios';

// All API calls go to your single Flask server
const API_BASE_URL = 'http://127.0.0.1:5000';

// FIXED: Added "export default" to the function definition
export default function AgriExpert() {
    const [question, setQuestion] = useState('');
    const [result, setResult] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!question.trim()) {
            setError('Please enter a question.');
            return;
        }

        setError('');
        setResult('');
        setIsLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/ask-question`, { question });
            // Using dangerouslySetInnerHTML to render HTML tags like <br>
            // In a real app, sanitize this or use a markdown library for safety.
            setResult({ __html: response.data.answer.replace(/\n/g, '<br />') });
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'An unknown error occurred.';
            setError(`Error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card5 p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-700">💬 Ask an Agri-Expert</h2>
            <p className="text-gray-600 mb-6">Ask about crop cycles, fertilizers, government schemes, or any other farming question.</p>
            <form onSubmit={handleSubmit}>
                <textarea
                    id="question-input"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    rows="4"
                    placeholder="e.g., What is the best time to plant tomatoes in Telangana?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    disabled={isLoading}
                />
                <button type="submit" className="btn-primary w-full mt-4 flex items-center justify-center" disabled={isLoading}>
                    <span>{isLoading ? 'Thinking...' : 'Get Answer'}</span>
                    {isLoading && <div className="loader hidden sm:block ml-3"></div>}
                </button>
            </form>
            {error && <div className="text-red-600 mt-4">{error}</div>}
            {result && <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg" dangerouslySetInnerHTML={result} />}
        </div>
    );
}
