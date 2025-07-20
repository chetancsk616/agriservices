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

const MerchantSignup = () => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });
  const [popupMessage, setPopupMessage] = useState('');
  const [popupNav, setPopupNav] = useState(null);
  const [placeholders, setPlaceholders] = useState({
    name: 'Name',
    phone: 'Phone Number',
    email: 'Email',
    password: 'Password'
  });
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);

  // Translate placeholders
  useEffect(() => {
    const translatePlaceholders = async () => {
      const tName = await translateText('Name', language);
      const tPhone = await translateText('Phone Number', language);
      const tEmail = await translateText('Email', language);
      const tPassword = await translateText('Password', language);
      setPlaceholders({ name: tName, phone: tPhone, email: tEmail, password: tPassword });
    };
    translatePlaceholders();
  }, [language]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSignup = async () => {
    const { name, phone, email, password } = form;

    if (!email || !password) {
      const msg = await translateText('Email and password are required', language);
      setPopupMessage(msg);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name,
          phone: phone,
          role: 'merchant',
        },
      },
    });

    if (error) {
      const prefix = await translateText('Signup failed: ', language);
      setPopupMessage(prefix + error.message);
      return;
    }

    const user = data?.user;

    if (!user) {
      const msg = await translateText('Signup successful but user data is missing.', language);
      setPopupMessage(msg);
      return;
    }

    const { error: cartError } = await supabase.from('cart').insert({
      user_id: user.id,
      email: user.email,
      product_id: [],
      quantity: []
    });

    if (cartError) {
      console.error('Cart creation failed:', cartError);
      const msg = await translateText('Signup succeeded, but cart setup failed. Try again later.', language);
      setPopupMessage(msg);
      return;
    }

    const successMsg = await translateText('Signup successful as merchant! Please confirm your email.', language);
    setPopupMessage(successMsg);
    setPopupNav('/merchantlogin');
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

        <h1><Translate>Merchant Signup</Translate></h1>

        <input
          type="text"
          id="name"
          placeholder={placeholders.name}
          value={form.name}
          onChange={handleChange}
        />
        <input
          type="text"
          id="phone"
          placeholder={placeholders.phone}
          value={form.phone}
          onChange={handleChange}
        />
        <input
          type="email"
          id="email"
          placeholder={placeholders.email}
          value={form.email}
          onChange={handleChange}
        />
        <input
          type="password"
          id="password"
          placeholder={placeholders.password}
          value={form.password}
          onChange={handleChange}
        />

        <button type="button" onClick={handleSignup}><Translate>Submit</Translate></button>

        <p>
          <Translate>Existing User?</Translate>{' '}
          <span
            style={{ color: '#add8e6', cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => navigate('/merchantlogin')}
          >
            <Translate>LogIn</Translate>
          </span>
        </p>
      </form>

      <Popup
        message={popupMessage}
        onClose={() => {
          setPopupMessage('');
          setPopupNav(null);
        }}
        navigateTo={popupNav}
      />
    </>
  );
};

export default MerchantSignup;
