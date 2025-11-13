import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '/src/supabaseClient';
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

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupNav, setPopupNav] = useState(null);
  const [cancelId, setCancelId] = useState(null);
  const [cancelPopupMessage, setCancelPopupMessage] = useState('');
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);

  // Translate the confirmation popup message
  useEffect(() => {
    const getCancelMessage = async () => {
      const msg = await translateText("Are you sure you want to cancel this booking?", language);
      setCancelPopupMessage(msg);
    };
    getCancelMessage();
  }, [language]);


  const loadBookings = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      const msg = await translateText('Please login to view your bookings.', language);
      setPopupMessage(msg);
      setPopupNav("/farmerlogin");
      return;
    }

    const { data, error } = await supabase
      .from('bookings')
      .select(`*, vehicles (name, type, price_per_day, image_url)`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading bookings:', error);
      return;
    }

    setBookings(data);
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancelBooking = async () => {
    if (!cancelId) return;

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'Cancelled' })
      .eq('id', cancelId);

    if (error) {
      const msg = await translateText('Failed to cancel booking', language);
      setPopupMessage(msg);
    } else {
      const msg = await translateText('Booking cancelled successfully', language);
      setPopupMessage(msg);
      loadBookings();
    }

    setCancelId(null);
  };

  // layout and item styling moved to CSS classes

  const total = bookings.reduce((sum, b) => {
    const days = (new Date(b.end_date) - new Date(b.start_date)) / (1000 * 60 * 60 * 24) + 1;
    return sum + (b.vehicles?.price_per_day || 0) * days;
  }, 0);

  return (
    <div className='scroll1'>

      <button type="button" className="back-btn" onClick={() => navigate('/vehicles')}>&larr;</button>

      <h1 className="page-title"><Translate>Your Bookings</Translate></h1>

      <div id="booking-container" className="booking-grid">
        {bookings.length === 0 ? (
          <p className="booking-empty"><Translate>No bookings found.</Translate></p>
        ) : (
          bookings.map((b) => (
            <div key={b.id} className="booking-card">
              <img src={b.vehicles?.image_url || 'https://placehold.co/400x250/243b55/ffffff?text=Vehicle'} alt={b.vehicles?.name} className="booking-img" />
              <h3 className="card-title">{b.vehicles?.name}</h3>
              <p><Translate>Type:</Translate> {b.vehicles?.type}</p>
              <p><Translate>Status:</Translate> <Translate>{b.status}</Translate></p>
              <p><Translate>From:</Translate> {b.start_date}</p>
              <p><Translate>To:</Translate> {b.end_date}</p>
              <p>₹{b.vehicles?.price_per_day} <Translate>/day</Translate></p>

              {['Pending', 'Confirmed'].includes(b.status) && (
                <button onClick={() => setCancelId(b.id)} className="btn-danger btn-cancel"><Translate>Cancel Booking</Translate></button>
              )}
            </div>
          ))
        )}
      </div>

      {bookings.length > 0 && (
        <div className="booking-total">
          <Translate>Total Booking Cost:</Translate> ₹{total}
        </div>
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

      {cancelId && (
        <Popup
          message={cancelPopupMessage}
          onClose={() => setCancelId(null)}
          showConfirm={handleCancelBooking}
        />
      )}
    </div>
  );
};

export default MyBookings;
