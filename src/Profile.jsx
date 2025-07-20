import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';
import supabase from '/src/supabaseClient';
import { LanguageContext } from './LanguageContext.jsx';
import { translateText } from './translationService.js';
import Translate from './Translation.jsx';

const Popup = ({ message, onClose, navigateTo }) => {
  const navigate = useNavigate();

  if (!message) return null;

  const handleClose = () => {
    onClose();
    if (navigateTo) {
      setTimeout(() => {
        navigate(navigateTo);
      }, 100);
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

const Profile = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState(localStorage.getItem('selectedPage') || "0");
  const [popupNav, setPopupNav] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ phone: '', role: '', display_name: '' });
  const [placeholders, setPlaceholders] = useState({
      phone: 'Phone',
      role: 'Role',
      displayName: 'Display Name',
      newPass: 'New Password',
      confirmPass: 'Confirm New Password'
  });
  const { language } = useContext(LanguageContext);

  // Translate placeholders on language change
  useEffect(() => {
    const translatePlaceholders = async () => {
        const tPhone = await translateText('Phone', language);
        const tRole = await translateText('Role', language);
        const tDisplayName = await translateText('Display Name', language);
        const tNewPass = await translateText('New Password', language);
        const tConfirmPass = await translateText('Confirm New Password', language);
        setPlaceholders({ phone: tPhone, role: tRole, displayName: tDisplayName, newPass: tNewPass, confirmPass: tConfirmPass });
    };
    translatePlaceholders();
  }, [language]);


  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        const msg = await translateText('Please login to view your Profile.', language);
        setPopupMessage(msg);
        setPopupNav("/main/3");
        setLoading(false);
        return;
      }
      if (authError) {
        const prefix = await translateText('Error fetching user:', language);
        setPopupMessage(prefix + authError.message);
      } else {
        setUser(user);
        setFormData({
          phone: user.user_metadata.phone || '',
          role: user.user_metadata.role || '',
          display_name: user.user_metadata.display_name || '',
        });
        setLoading(false);
      }
    };

    getUser();
  }, [language]); // Rerun if language changes to translate initial error messages

  useEffect(() => {
    localStorage.setItem('selectedPage', selectedPage);
  }, [selectedPage]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordReset = async () => {
    if (!newPassword || !confirmPassword) {
      const msg = await translateText('Please fill in both password fields.', language);
      setPopupMessage(msg);
      return;
    }
    if (newPassword !== confirmPassword) {
      const msg = await translateText('Passwords do not match.', language);
      setPopupMessage(msg);
      return;
    }
    if (newPassword.length < 6) {
      const msg = await translateText('Password must be at least 6 characters long.', language);
      setPopupMessage(msg);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      const prefix = await translateText('Failed to update password: ', language);
      setPopupMessage(prefix + error.message);
    } else {
      const msg = await translateText('Password updated successfully!', language);
      setPopupMessage(msg);
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleEditToggle = async () => {
    if (isEditing) {
      const { error } = await supabase.auth.updateUser({
        data: {
          phone: formData.phone,
          role: formData.role,
          display_name: formData.display_name
        }
      });

      if (error) {
        const prefix = await translateText("Failed to update: ", language);
        setPopupMessage(prefix + error.message);
      } else {
        const msg = await translateText("Updated successfully!", language);
        setPopupMessage(msg);
      }
    }
    setIsEditing(!isEditing);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      const prefix = await translateText('Logout error: ', language);
      setPopupMessage(prefix + error.message);
    } else {
      const msg = await translateText('Logged out successfully', language);
      setPopupMessage(msg);
      setPopupNav("/main/0");
    }
  };

  if (loading) return <div style={{color: 'white', textAlign: 'center', padding: '2rem'}}><Translate>Loading user...</Translate></div>;

  const renderContent = () => {
    switch (selectedPage) {
      case "1": // Privacy Settings - Placeholder
        return (
          <div className="card2">
            <h2><Translate>Privacy Settings</Translate></h2>
            <p><Translate>Settings for privacy will be available here in a future update.</Translate></p>
          </div>
        );
      case "2": // Reset Password
        return (
          <div className="card2">
            <h2><Translate>Reset Your Password</Translate></h2>
            <input
              type="password"
              placeholder={placeholders.newPass}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder={placeholders.confirmPass}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button onClick={handlePasswordReset}>
              <Translate>Update Password</Translate>
            </button>
          </div>
        );
      case "3": // Feedback
        return (
          <div className="card2">
            <iframe title="Feedback Form" className='card2' src="https://docs.google.com/forms/d/e/1FAIpQLSdZggXPk6MsmU4cDaUjHLWMH2Pwg8lw1MFHtvd56DROLL0Xfw/viewform?usp=header"></iframe>
          </div>
        );
      case "4": // Logout
        return (
          <div className="card2">
            <h2><Translate>Logout</Translate></h2>
            <p><Translate>Are you sure you want to log out?</Translate></p>
            <button onClick={handleLogout} style={{backgroundColor: '#dc3545', color: 'white'}}>
              <Translate>Logout</Translate>
            </button>
          </div>
        );
      default: // Personal Info
        return (
          <div className="card2">
            <h2><Translate>Personal Info</Translate></h2>
            <input type="text" value={user.email} readOnly />
            <input
              type="text"
              name="phone"
              placeholder={placeholders.phone}
              value={formData.phone}
              onChange={handleChange}
              readOnly={!isEditing}
            />
            <input
              type="text"
              name="role"
              placeholder={placeholders.role}
              value={formData.role}
              onChange={handleChange}
              readOnly
            />
            <input
              type="text"
              name="display_name"
              placeholder={placeholders.displayName}
              value={formData.display_name}
              onChange={handleChange}
              readOnly={!isEditing}
            />
            <button onClick={handleEditToggle}>
              {isEditing ? <Translate>Submit</Translate> : <Translate>Edit</Translate>}
            </button>
          </div>
        );
    }
  };

  return (
    <div className='profile'>
      <div className="sidebar">
        <button
          type="button"
          style={{ width: "fit-content", backgroundColor: "rgba(255, 255, 255, 0)", border: 'none' }}
          onClick={() => navigate("/main/0")}
        >
          <span style={{ color:"#e0e0e0", fontSize: '30px' }}>&larr;</span>
        </button>
        <button value="0" onClick={(e) => setSelectedPage(e.target.value)}><Translate>Personal Info</Translate></button>
        <button value="1" onClick={(e) => setSelectedPage(e.target.value)}><Translate>Privacy Settings</Translate></button>
        <button value="2" onClick={(e) => setSelectedPage(e.target.value)}><Translate>Reset Password</Translate></button>
        <button value="3" onClick={(e) => setSelectedPage(e.target.value)}><Translate>Feedback/Review</Translate></button>
        <button value="4" onClick={(e) => setSelectedPage(e.target.value)}><Translate>LogOut</Translate></button>
      </div>
      <div id="app">
        {renderContent()}
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

export default Profile;
