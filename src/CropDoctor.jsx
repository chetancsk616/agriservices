import React, { useState } from 'react';
import axios from 'axios';

// For consistency in separate files, you would define it in each or a shared config file.
const CROP_DOCTOR_API_URL = 'http://127.0.0.1:5000';

// FIXED: Added "export default" to the function definition
export default function CropDoctor() {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
            setResult(null); // Reset previous result
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select an image file.');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        setError('');
        setResult(null);
        setIsLoading(true);

        try {
            const response = await axios.post(`${CROP_DOCTOR_API_URL}/analyze-crop`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setResult(response.data);
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'An unknown error occurred.';
            setError(`Error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const renderResult = () => {
        if (!result) return null;

        if (!result.is_plant) {
            return <p className="font-semibold text-lg text-orange-600">This doesn't look like a plant.</p>;
        }
        
        const assessment = result.health_assessment;
        if (assessment.is_healthy) {
            return <p className="font-semibold text-lg text-green-600">✅ The plant appears to be healthy.</p>;
        }

        return (
            <div>
                <p className="font-semibold text-lg text-red-600">⚠️ The plant may have a disease.</p>
                {assessment.diseases?.length > 0 && (
                    <>
                        <h4 className="font-semibold mt-4 mb-2">Possible Diseases:</h4>
                        <ul className="list-disc list-inside space-y-2">
                            {assessment.diseases.map((disease, index) => (
                                <li key={index}>
                                    <strong>{disease.disease_details.common_names?.[0] || disease.name}</strong>
                                    <span className="text-sm text-gray-600"> (Probability: {(disease.probability * 100).toFixed(1)}%)</span>
                                    <p className="text-sm text-gray-500 pl-4">{disease.disease_details.description}</p>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="card5 p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-700">🌿 Crop Disease Detector</h2>
            <p className="text-gray-600 mb-6">Upload a photo of a plant leaf to check for diseases.</p>
            <form onSubmit={handleSubmit}>
                <div className="upload-btn-wrapper">
                    <label htmlFor="image-input" className="btn-upload block">
                        <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        <span>{file ? file.name : 'Click to upload an image'}</span>
                    </label>
                    <input type="file" id="image-input" accept="image/*" onChange={handleFileChange} className="hidden" />
                </div>

                {preview && (
                    <div className="mt-4 text-center">
                        <img src={preview} className="max-h-48 mx-auto rounded-lg shadow-sm" alt="Image preview" />
                    </div>
                )}
                <button type="submit" className="btn-primary w-full mt-4 flex items-center justify-center" disabled={isLoading || !file}>
                    <span>{isLoading ? 'Analyzing...' : 'Analyze Crop'}</span>
                    {isLoading && <div className="loader hidden sm:block ml-3"></div>}
                </button>
            </form>
            {error && <div className="text-red-600 mt-4">{error}</div>}
            {result && <div className="mt-6">{renderResult()}</div>}
        </div>
    );
}
