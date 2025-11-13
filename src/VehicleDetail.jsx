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
  <div className="popup-actions">
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

  if (!vehicle) return <div className="loading-box"><Translate>Loading...</Translate></div>;

  return (
    <div className='scroll1'>
      <button onClick={() => navigate(-1)} className="back-btn">&larr; <Translate>Back</Translate></button>

      <div className="detail-panel">
        <img src={vehicle.image_url || 'https://placehold.co/400x250/243b55/ffffff?text=Vehicle'} alt={vehicle.name} className="detail-img" />
  <h2 className="detail-title">{vehicle.name}</h2>
        <p><Translate>Type:</Translate> {vehicle.type}</p>
        <p><Translate>Status:</Translate> <Translate>{vehicle.status}</Translate></p>
        <p className="price">₹{vehicle.price_per_day}<Translate>/day</Translate></p>

  <button onClick={handleBooking} className="btn-add mt-20"><Translate>Book This Vehicle</Translate></button>
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
          <div className="form-column">
            <label className="label-column">
              <Translate>Start Date:</Translate>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </label>
            <label className="label-column">
              <Translate>End Date:</Translate>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
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
