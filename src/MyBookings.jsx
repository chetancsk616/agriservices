import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '/src/supabaseClient';

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
        <div style={{ marginTop: '10px' }}>
          {showConfirm ? (
            <>
              <button onClick={showConfirm}>Confirm</button>
              <button onClick={handleClose} style={{ marginLeft: '10px' }}>Cancel</button>
            </>
          ) : (
            <button onClick={handleClose}>OK</button>
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
  const navigate = useNavigate();

  const loadBookings = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      setPopupMessage('Please login to view your bookings.');
      setPopupNav("/farmerlogin");
      return;
    }

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        vehicles (
          name,
          type,
          price_per_day,
          image_url
        )
      `)
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
      .eq('id', cancelId); // Make sure this id matches the correct row
  
    if (error) {
      setPopupMessage('Failed to cancel booking');
    } else {
      setPopupMessage('Booking cancelled successfully');
      loadBookings(); // Re-fetch bookings to reflect changes
    }
  
    setCancelId(null); // Reset the cancel state
  };
  

  const containerStyle = {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  };

  const itemStyle = {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '10px',
    margin: '10px 0',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    color: 'white',
  };

  const total = bookings.reduce((sum, b) => {
    const days =
      (new Date(b.end_date) - new Date(b.start_date)) / (1000 * 60 * 60 * 24) + 1;
    return sum + (b.vehicles?.price_per_day || 0) * days;
  }, 0);

  return (
    <div className='scroll1'>
      <button
        type="button"
        style={{ width: 'fit-content', backgroundColor: 'rgba(255, 255, 255, 0)', border: 'outset rgba(255, 255, 255, 0)' }}
        onClick={() => navigate("/vehicles")}
      >
        <span style={{ fontSize: '30px', color: 'white' }}>&larr;</span>
      </button>

      <h1 style={{ textAlign: 'center', color: 'white' }}>Your Bookings</h1>

      <div id="booking-container" style={containerStyle}>
        {bookings.length === 0 ? (
          <p style={{ color: 'white' }}>No bookings found.</p>
        ) : (
          bookings.map((b) => (
            <div key={b.id} style={itemStyle}>
              <img
                src={b.vehicles?.image_url || 'https://via.placeholder.com/400x250'}
                alt={b.vehicles?.name}
                style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '6px' }}
              />
              <h3>{b.vehicles?.name}</h3>
              <p>Type: {b.vehicles?.type}</p>
              <p>Status: {b.status}</p>
              <p>From: {b.start_date}</p>
              <p>To: {b.end_date}</p>
              <p>₹{b.vehicles?.price_per_day} /day</p>

              {['Pending', 'Confirmed'].includes(b.status) && (
                <button
                  onClick={() => setCancelId(b.id)}
                  style={{
                    marginTop: '10px',
                    padding: '6px 12px',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                  }}
                >
                  Cancel Booking
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {bookings.length > 0 && (
        <div className="booking-total" style={{ marginLeft: '20px', marginTop: '20px', fontWeight: 'bold', color: 'white' }}>
          Total Booking Cost: ₹{total}
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
          message="Are you sure you want to cancel this booking?"
          onClose={() => setCancelId(null)}
          showConfirm={handleCancelBooking}
        />
      )}
    </div>
  );
};

export default MyBookings;
