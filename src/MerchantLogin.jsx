import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';
import supabase from '/src/supabaseClient';
import { LanguageContext } from './LanguageContext.jsx';
import { translateText } from './translationService.js';
import Translate from './Translation.jsx';

const Popup = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <p>{message}</p>
        <button onClick={onClose}><Translate>OK</Translate></button>
      </div>
    </div>
  );
};

const MerchantLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [popupMessage, setPopupMessage] = useState('');
  const [placeholders, setPlaceholders] = useState({ email: 'Email', password: 'Password' });
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);

  useEffect(() => {
    const translatePlaceholders = async () => {
      const translatedEmail = await translateText('Email', language);
      const translatedPassword = await translateText('Password', language);
      setPlaceholders({ email: translatedEmail, password: translatedPassword });
    };
    translatePlaceholders();
  }, [language]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const showPopup = (msg) => setPopupMessage(msg);
  const closePopup = () => setPopupMessage('');

  const handleLogin = async () => {
    const { email, password } = form;

    if (!email || !password) {
      const msg = await translateText('Please enter both email and password', language);
      showPopup(msg);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      let msg = '';
      if (error.message.includes('Invalid login credentials')) {
        msg = await translateText('Login failed: Incorrect email or password', language);
      } else if (error.message.includes('Email not confirmed')) {
        msg = await translateText('Login failed: Please confirm your email before logging in.', language);
      } else {
        const prefix = await translateText('Login failed: ', language);
        msg = prefix + error.message;
      }
      showPopup(msg);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    const actualRole = user?.user_metadata?.role;

    if (!actualRole) {
      const msg = await translateText('Login failed: No role assigned to this user.', language);
      showPopup(msg);
      return;
    }

    if (actualRole !== 'merchant') {
      const msg = await translateText('Login failed: You are not authorized to login as a merchant.', language);
      showPopup(msg);
      return;
    }

    navigate('/main/0'); // Navigate directly on success
  };

  const handleResetPassword = async () => {
    const email = form.email.trim();

    if (!email) {
      const msg = await translateText('Please enter your email to reset your password.', language);
      showPopup(msg);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://agriservices.vercel.app/resetpassword'
    });

    if (error) {
      const prefix = await translateText('Password reset failed: ', language);
      showPopup(prefix + error.message);
    } else {
      const msg = await translateText('Password reset email sent. Please check your inbox.', language);
      showPopup(msg);
    }
  };

  return (
    <>
      <form className="box" style={{ overflow: 'auto', height: 'calc(100vh - 268px)', scrollbarWidth: 'none' }}>
        <button
          type="button"
          style={{
            color: "white",
            width: "100%",
            backgroundColor: "rgba(255, 255, 255, 0)",
            border: "none",
            textAlign: "left",
            fontSize: "30px"
          }}
          onClick={() => navigate(-1)}
        >
          &larr;
        </button>

        <h1><Translate>Merchant Login</Translate></h1>

        <input
          type="email"
          placeholder={placeholders.email}
          id="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          placeholder={placeholders.password}
          id="password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="button" onClick={handleLogin}><Translate>Submit</Translate></button>

        <p>
          <span style={{ color: '#add8e6', cursor: 'pointer', textDecoration: 'underline' }} onClick={handleResetPassword}>
            <Translate>Forgot Password?</Translate>
          </span>
        </p>
        <p>
          <Translate>New User?</Translate>{' '}
          <span style={{ color: '#add8e6', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/merchantsignup')}>
            <Translate>SignUp</Translate>
          </span>
        </p>
      </form>
      <Popup message={popupMessage} onClose={closePopup} />
    </>
  );
};

export default MerchantLogin;
