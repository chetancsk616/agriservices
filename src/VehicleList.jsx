import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '/src/supabaseClient';
import './style.css';
import { LanguageContext } from './LanguageContext.jsx';
import { translateText } from './translationService.js';
import Translate from './Translation.jsx';

// It's good practice to have a shared Popup component, but defining it here is fine.
const Popup = ({ message, onClose, navigateTo, children, showConfirm }) => {
  const navigate = useNavigate();
  const handleClose = () => {
    onClose();
    if (navigateTo) setTimeout(() => navigate(navigateTo), 100);
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

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);

  // State for popups and booking flow
  const [popupMessage, setPopupMessage] = useState('');
  const [popupNav, setPopupNav] = useState(null);
  const [bookingVehicleId, setBookingVehicleId] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchVehicles = async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'Available');

      if (error) console.error('Error fetching vehicles:', error);
      else setVehicles(data);
    };

    fetchVehicles();
  }, []);

  const handleBookClick = async (vehicleId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const msg = await translateText('Please log in to book a vehicle.', language);
      setPopupMessage(msg);
      setPopupNav('/farmerlogin');
      return;
    }
    setBookingVehicleId(vehicleId); // Open the date selection popup
  };

  const handleConfirmBooking = async () => {
    if (!startDate || !endDate) {
      const msg = await translateText('Please select both start and end dates.', language);
      setPopupMessage(msg);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // Should not happen if they got this far

    const { error } = await supabase.from('bookings').insert([{
      user_id: user.id,
      vehicle_id: bookingVehicleId,
      start_date: startDate,
      end_date: endDate,
      status: 'Pending',
    }]);

    setBookingVehicleId(null); // Close date popup
    setStartDate('');
    setEndDate('');

    if (error) {
      const msg = await translateText('Failed to book vehicle. Please try again.', language);
      setPopupMessage(msg);
    } else {
      const msg = await translateText('Booking request sent successfully!', language);
      setPopupMessage(msg);
    }
  };

  const containerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '20px',
    padding: '20px',
  };

  return (
    <div className='scroll1'>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
        <button
          onClick={() => navigate("/main/0")}
          style={{ background: 'none', border: 'none', color: 'white', fontSize: '30px', cursor: 'pointer' }}
        >
          &larr;
        </button>
        <button
          onClick={() => navigate("/mybookings")}
          style={{
            color: "white",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid white",
            borderRadius: '8px',
            fontSize: "1rem",
            padding: '0.5rem 1rem',
            cursor: "pointer"
          }}
        >
          <Translate>My Bookings</Translate>
        </button>
      </div>

      <h1 style={{ textAlign: 'center' }}><Translate>Available Vehicles</Translate></h1>

      <div style={containerStyle}>
        {vehicles.map((v) => (
          <div
            key={v.id}
            style={{
              padding: '1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: hoveredCardId === v.id ? '0 8px 32px 0 rgba(134, 141, 240, 0.37)' : '0 2px 5px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.1)',
              transform: hoveredCardId === v.id ? 'scale(1.02)' : 'scale(1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
            onMouseEnter={() => setHoveredCardId(v.id)}
            onMouseLeave={() => setHoveredCardId(null)}
          >
            <div onClick={() => navigate(`/vehicle/${v.id}`)}>
              <img
                src={v.image_url || 'https://placehold.co/220x150/243b55/ffffff?text=Vehicle'}
                alt={v.name}
                style={{ width: '100%', height: '150px', objectFit: 'contain', borderRadius: '4px' }}
              />
              <h3 style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.5rem' }}>
                {v.name}
              </h3>
              <p style={{ fontWeight: 'bold' }}>₹{v.price_per_day}<Translate>/day</Translate></p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleBookClick(v.id);
              }}
              style={{ padding: '8px', borderRadius: '5px', background: '#007bff', color: 'white', border: 'none', marginTop: '10px', cursor: 'pointer' }}
            >
              <Translate>Book Now</Translate>
            </button>
          </div>
        ))}
      </div>

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

      {bookingVehicleId && (
        <Popup
          onClose={() => setBookingVehicleId(null)}
          showConfirm={handleConfirmBooking}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ marginTop: 0 }}><Translate>Select Booking Dates</Translate></h3>
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Translate>Start Date:</Translate>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Translate>End Date:</Translate>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </label>
          </div>
        </Popup>
      )}
    </div>
  );
};

export default VehicleList;
