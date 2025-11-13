import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css'; // <-- ADD THIS LINE
import { AuthProvider } from './AuthContext.jsx';
import { LanguageProvider } from './LanguageContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<LanguageProvider>
			<AuthProvider>
				<App />
			</AuthProvider>
		</LanguageProvider>
	</React.StrictMode>
);
