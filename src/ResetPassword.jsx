import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '/src/supabaseClient';
import { LanguageContext } from './LanguageContext.jsx';
import { translateText } from './translationService.js';
import Translate from './Translation.jsx';

// Reusable Popup
const Popup = ({ message, onClose, navigateTo }) => {
  const navigate = useNavigate();

  if (!message) return null;

  const handleClose = () => {
    onClose();
    if (navigateTo) {
      setTimeout(() => navigate(navigateTo), 100);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <p>{message}</p>
        <button onClick={handleClose}><Translate>OK</Translate></button>
      </div>
    </div>
  );
};

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [popupNav, setPopupNav] = useState(null);
  const [placeholder, setPlaceholder] = useState('New password');
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);

  // Translate placeholder
  useEffect(() => {
    const translatePlaceholder = async () => {
        const translated = await translateText('New password', language);
        setPlaceholder(translated);
    };
    translatePlaceholder();
  }, [language]);


  const handleReset = async () => {
    if (!newPassword.trim()) {
      const msg = await translateText('Please enter a new password.', language);
      setPopupMessage(msg);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword.trim(),
    });

    if (error) {
      const prefix = await translateText('Failed to update password: ', language);
      setPopupMessage(prefix + error.message);
    } else {
      const msg = await translateText('Password updated successfully!', language);
      setPopupMessage(msg);
      setPopupNav('/main/3'); // Redirect to login page
    }
  };

  const containerStyle = {
    fontFamily: 'Arial, sans-serif',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    padding: '1rem',
    background: 'linear-gradient(to right, #141e30, #243b55)',
    color: '#333'
  };

  const boxStyle = {
    background: 'white',
    padding: '2rem',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center'
  };

  const inputStyle = {
    width: '100%',
    margin: '1rem 0',
    padding: '0.75rem',
    border: '1px solid #ccc',
    borderRadius: '5px',
    fontSize: '1rem'
  };

  const buttonStyle = {
    ...inputStyle,
    backgroundColor: '#28a745',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: 'none'
  };

  return (
    <div style={containerStyle}>
      <div style={boxStyle}>
        <button
          type="button"
          style={{ width: 'fit-content', background: 'none', border: 'none', float: 'left', fontSize: '24px' }}
          onClick={() => navigate(-1)}
        >
          <span style={{ color: 'black' }}>&larr;</span>
        </button>

        <h2><Translate>Reset Your Password</Translate></h2>
        <input
          type="password"
          id="newPassword"
          placeholder={placeholder}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={inputStyle}
        />
        <button id="resetBtn" onClick={handleReset} style={buttonStyle}>
          <Translate>Update Password</Translate>
        </button>
      </div>

      <Popup
        message={popupMessage}
        onClose={() => {
          setPopupMessage('');
          setPopupNav(null);
        }}
        navigateTo={popupNav}
      />
    </div>
  );
};

export default ResetPassword;
