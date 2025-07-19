import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';
import supabase from '/src/supabaseClient';

const Popup = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <p>{message}</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

const MerchantLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [popupMessage, setPopupMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const showPopup = (msg) => setPopupMessage(msg);
  const closePopup = () => setPopupMessage('');

  const handleLogin = async () => {
    const { email, password } = form;

    if (!email || !password) {
      showPopup('Please enter both email and password');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        showPopup('Login failed: Incorrect email or password');
      } else if (error.message.includes('Email not confirmed')) {
        showPopup('Login failed: Please confirm your email before logging in.');
      } else {
        showPopup('Login failed: ' + error.message);
      }
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    const actualRole = user?.user_metadata?.role;

    if (!actualRole) {
      showPopup('Login failed: No role assigned to this user.');
      return;
    }

    if (actualRole !== 'merchant') {
      showPopup('Login failed: You are not authorized to login as a merchant.');
      return;
    }

    navigate(-1);
  };

  const handleResetPassword = async () => {
    const email = form.email.trim();

    if (!email) {
      showPopup('Please enter your email to reset your password.');
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://9000-firebase-agriservices-1749529002317.cluster-ikxjzjhlifcwuroomfkjrx437g.cloudworkstations.dev/resetpassword'
    });

    if (error) {
      showPopup('Password reset failed: ' + error.message);
    } else {
      showPopup('Password reset email sent. Please check your inbox.');
    }
  };

  return (
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

      <h1>Merchant Login</h1>

      <input
        type="email"
        placeholder="Email"
        id="email"
        value={form.email}
        onChange={handleChange}
      />
      <input
        type="password"
        placeholder="Password"
        id="password"
        value={form.password}
        onChange={handleChange}
      />
      <button type="button" onClick={handleLogin}>Submit</button>

      <p>
        <span style={{ color: 'blue', cursor: 'pointer' }} onClick={handleResetPassword}>
          Forgot Password?
        </span>
      </p>
      <p>
        New User?{' '}
        <span style={{ color: 'blue', cursor: 'pointer' }} onClick={() => navigate('/merchantsignup')}>
          SignUp
        </span>
      </p>

      <Popup message={popupMessage} onClose={closePopup} />
    </form>
  );
};

export default MerchantLogin;
