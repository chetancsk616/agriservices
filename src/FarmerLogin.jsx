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
      setTimeout(() => {
        navigate(navigateTo);
      }, 100);
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

const FarmerLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [popupMessage, setPopupMessage] = useState('');
  const [popupNav, setPopupNav] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = form;
  
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setPopupMessage('Login failed: Incorrect email or password');
      } else if (error.message.includes('Email not confirmed')) {
        setPopupMessage('Login failed: Please confirm your email before logging in.');
      } else {
        setPopupMessage('Login failed: ' + error.message);
      }
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    const user = userData?.user;
    const actualRole = user?.user_metadata?.role;

    if (!actualRole) {
      setPopupMessage('Login failed: No role assigned to this user.');
      return;
    }

    if (actualRole !== 'farmer') {
      setPopupMessage('Login failed: You are not authorized to login as a farmer.');
      return;
    }

    setPopupMessage('Login successful!');
    setPopupNav('/main/0');
  };

  const handleResetPassword = async () => {
    const email = form.email.trim();

    if (!email) {
      setPopupMessage('Please enter your email to reset your password.');
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://9000-firebase-agriservices-1749529002317.cluster-ikxjzjhlifcwuroomfkjrx437g.cloudworkstations.dev/resetpassword'
    });

    if (error) {
      setPopupMessage('Password reset failed: ' + error.message);
    } else {
      setPopupMessage('Password reset email sent. Please check your inbox.');
    }
  };

  return (
    <>
      <form onSubmit={handleLogin} className="box" style={{ overflow: 'auto', height: 'calc(100vh - 268px)', scrollbarWidth: 'none' }}>
        <button
          type="button"
          style={{color:"white", width: "20vw", backgroundColor: "rgba(255, 255, 255, 0)", border: "outset rgba(255, 255, 255, 0)",textAlign:"left",fontSize:"20px" }}
          onClick={() => navigate(-1)}
        >
          &larr;
        </button>
        <h1>Farmer Login</h1>

        <input
          type="email"
          placeholder="Email"
          id="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          placeholder="Password"
          id="password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Submit</button>

        <p>
          <span style={{ color: 'blue', cursor: 'pointer' }} onClick={handleResetPassword}>
            Forgot Password?
          </span>
        </p>
        <p>
          New User?{' '}
          <span style={{ color: 'blue', cursor: 'pointer' }} onClick={() => navigate('/farmersignup')}>
            SignUp
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

export default FarmerLogin;
