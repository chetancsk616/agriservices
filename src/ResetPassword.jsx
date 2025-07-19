import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '/src/supabaseClient';

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
        <button onClick={handleClose}>OK</button>
      </div>
    </div>
  );
};

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [popupNav, setPopupNav] = useState(null);
  const navigate = useNavigate();

  const handleReset = async () => {
    if (!newPassword.trim()) {
      setPopupMessage('Please enter a new password.');
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword.trim(),
    });

    if (error) {
      setPopupMessage('Failed to update password: ' + error.message);
    } else {
      setPopupMessage('Password updated successfully!');
      setPopupNav('/login'); // Redirect to login
    }
  };

  const containerStyle = {
    fontFamily: 'Arial, sans-serif',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#f3f3f3',
  };

  const boxStyle = {
    background: 'white',
    padding: '2rem',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    width: '300px',
  };

  const inputStyle = {
    width: '100%',
    margin: '0.5rem 0',
    padding: '0.75rem',
    border: '1px solid #ccc',
    borderRadius: '5px',
  };

  const buttonStyle = {
    ...inputStyle,
    backgroundColor: '#28a745',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
  };

  return (
    <div style={containerStyle}>
      <div style={boxStyle}>
        <button
          type="button"
          style={{ width: 'fit-content', backgroundColor: 'white', border: 'outset' }}
          onClick={() => navigate(-1)}
        >
          <span style={{ fontSize: '30px', color: 'black' }}>&larr;</span>
        </button>

        <h2>Reset Your Password</h2>
        <input
          type="password"
          id="newPassword"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={inputStyle}
        />
        <button id="resetBtn" onClick={handleReset} style={buttonStyle}>
          Update Password
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
