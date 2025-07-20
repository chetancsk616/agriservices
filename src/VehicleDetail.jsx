import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '/src/supabaseClient';
import './style.css';
import { LanguageContext } from './LanguageContext.jsx';
import { translateText } from './translationService.js';
import Translate from './Translation.jsx';

const Popup = ({ message, onClose, navigateTo, children, showConfirm }) => {
  const navigate = useNavigate();

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
        {message && <p>{message}</p>}
        {children}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
          {showConfirm ? (
            <>
              <button onClick={showConfirm}><Translate>Confirm</Translate></button>
              <button onClick={handleClose}><Translate>Cancel</Translate></button>
            </>
          ) : (
            <button onClick={handleClose}><Translate>OK</Translate></button>
          )}
        </div>
      </div>
    </div>
  );
};

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupNav, setPopupNav] = useState(null);
  const [showDateForm, setShowDateForm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { language } = useContext(LanguageContext);

  useEffect(() => {
    const fetchVehicle = async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) console.error('Error fetching vehicle:', error);
      else setVehicle(data);
    };

    fetchVehicle();
  }, [id]);

  const handleBooking = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const msg = await translateText('Please log in to book a vehicle.', language);
      setPopupMessage(msg);
      setPopupNav('/farmerlogin');
      return;
    }
    setShowDateForm(true);
  };

  const handleDateConfirm = async () => {
    if (!startDate || !endDate) {
      const msg = await translateText('Please fill both start and end dates.', language);
      setPopupMessage(msg);
      setShowDateForm(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const msg = await translateText('Session expired. Please log in again.', language);
      setPopupMessage(msg);
      setPopupNav('/farmerlogin');
      return;
    }

    const { error: bookingError } = await supabase.from('bookings').insert([
      {
        user_id: user.id,
        vehicle_id: id,
        start_date: startDate,
        end_date: endDate,
        status: 'Pending',
      },
    ]);

    if (bookingError) {
      const msg = await translateText('Failed to book vehicle.', language);
      setPopupMessage(msg);
    } else {
      const msg = await translateText('Booking request sent successfully!', language);
      setPopupMessage(msg);
    }

    setStartDate('');
    setEndDate('');
    setShowDateForm(false);
  };

  if (!vehicle) return <div style={{ color: 'white', textAlign: 'center', padding: '2rem' }}><Translate>Loading...</Translate></div>;

  return (
    <div className='scroll1' style={{ padding: '20px', color: 'white' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "none",
          border: "none",
          color: "white",
          fontSize: "1.2rem",
          marginBottom: '10px',
          cursor: 'pointer'
        }}
      >
        &larr; <Translate>Back</Translate>
      </button>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '500px',
          margin: '0 auto',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px 0 rgba(134, 141, 240, 0.37)',
        }}
      >
        <img
          src={vehicle.image_url || 'https://placehold.co/400x250/243b55/ffffff?text=Vehicle'}
          alt={vehicle.name}
          style={{ width: '100%', height: '250px', objectFit: 'cover', borderRadius: '10px' }}
        />
        <h2 style={{ marginTop: '15px' }}>{vehicle.name}</h2>
        <p><Translate>Type:</Translate> {vehicle.type}</p>
        <p><Translate>Status:</Translate> <Translate>{vehicle.status}</Translate></p>
        <p style={{ fontWeight: 'bold' }}>₹{vehicle.price_per_day}<Translate>/day</Translate></p>

        <button
          onClick={handleBooking}
          style={{
            marginTop: '20px',
            padding: '12px',
            borderRadius: '8px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          <Translate>Book This Vehicle</Translate>
        </button>
      </div>

      {showDateForm && !popupMessage && (
        <Popup
          onClose={() => {
            setShowDateForm(false);
            setStartDate('');
            setEndDate('');
          }}
          showConfirm={handleDateConfirm}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Translate>Start Date:</Translate>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{width: '100%', padding: '8px', marginTop: '5px'}} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Translate>End Date:</Translate>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{width: '100%', padding: '8px', marginTop: '5px'}} />
            </label>
          </div>
        </Popup>
      )}

      {popupMessage && (
        <Popup
          message={popupMessage}
          onClose={() => {
            setPopupMessage('');
            setPopupNav(null);
          }}
          navigateTo={popupNav}
        />
      )}
    </div>
  );
};

export default VehicleDetail;
