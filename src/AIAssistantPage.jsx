import React from 'react';
import AgriExpert from './AgriExpert';
import CropDoctor from './CropDoctor';

export default function AIAssistantPage() {
    // Note: The CSS classes for .card, .btn-primary, .loader, etc.
    // should be in your global CSS file (e.g., index.css).
    return (
        <div className="container mx-auto p-4 md:p-8 max-w-6xl">
            <header className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-green-700">Farmer's AI Assistant</h1>
                <p className="text-lg text-gray-600 mt-2">Get instant help for your crops and questions.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <AgriExpert />
                <CropDoctor />
            </div>
        </div>
    );
}
