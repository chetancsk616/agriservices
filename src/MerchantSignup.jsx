import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';
import supabase from '/src/supabaseClient';

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

const MerchantSignup = () => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });
  const [popupMessage, setPopupMessage] = useState('');
  const [popupNav, setPopupNav] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSignup = async () => {
    const { name, phone, email, password } = form;

    if (!email || !password) {
      setPopupMessage('Email and password are required');
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
      setPopupMessage('Signup failed: ' + error.message);
      return;
    }

    const user = data?.user;

    if (!user) {
      setPopupMessage('Signup successful but user data is missing.');
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
      setPopupMessage('Signup succeeded, but cart setup failed. Try again later.');
      return;
    }

    setPopupMessage('Signup successful as merchant! Please confirm your email.');
    setPopupNav('/merchantlogin');
  };

  return (
    <>
      <form className="box" style={{ overflow: 'auto', height: 'calc(100vh - 268px)', scrollbarWidth: 'none' }}>
        <button
          type="button"
          style={{
            color: "white",
            width: "20vw",
            backgroundColor: "rgba(255, 255, 255, 0)",
            border: "outset rgba(255, 255, 255, 0)",
            textAlign: "left",
            fontSize: "20px"
          }}
          onClick={() => navigate(-1)}
        >
          &larr;
        </button>
  
        <h1>Merchant Signup</h1>
  
        <input
          type="text"
          id="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
        />
        <input
          type="text"
          id="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
        />
        <input
          type="email"
          id="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <input
          type="password"
          id="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />
  
        <button type="button" onClick={handleSignup}>Submit</button>
  
        <p>
          Existing User?{' '}
          <span
            style={{ color: 'blue', cursor: 'pointer' }}
            onClick={() => navigate('/merchantlogin')}
          >
            LogIn
          </span>
        </p>
      </form>
  
      {/* ✅ Popup moved outside of the scrollable form */}
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
