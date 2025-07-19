import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '/src/supabaseClient';
import './style.css';

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

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);

  const [popupMessage, setPopupMessage] = useState('');
  const [popupNav, setPopupNav] = useState(null);
  const [showDateForm, setShowDateForm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
      setPopupMessage('Please log in to book a vehicle.');
      setPopupNav('/login');
      return;
    }

    setShowDateForm(true); // Show date input popup
  };

  const handleDateConfirm = async () => {
    if (!startDate || !endDate) {
      setPopupMessage('Please fill both start and end dates.');
      setShowDateForm(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setPopupMessage('Session expired. Please log in again.');
      setPopupNav('/login');
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
      setPopupMessage('Failed to book vehicle.');
    } else {
      setPopupMessage('Booking requested!');
    }

    setStartDate('');
    setEndDate('');
    setShowDateForm(false);
  };

  if (!vehicle) return <div style={{ color: 'white' }}>Loading...</div>;

  return (
    <div className='scroll1' style={{ padding: '20px', color: 'white' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          backgroundColor: "rgba(255, 255, 255, 0)",
          border: "outset rgba(255, 255, 255, 0)",
          color: "white",
          fontSize: "20px",
          marginBottom: '10px'
        }}
      >
        &larr; Back
      </button>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '400px',
          margin: '0 auto',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px 0 rgba(134, 141, 240, 0.37)',
        }}
      >
        <img
          src={vehicle.image_url || 'https://via.placeholder.com/400x250'}
          alt={vehicle.name}
          style={{ width: '100%', height: '250px', objectFit: 'cover', borderRadius: '10px' }}
        />
        <h2 style={{ marginTop: '15px' }}>{vehicle.name}</h2>
        <p>Type: {vehicle.type}</p>
        <p>Status: {vehicle.status}</p>
        <p style={{ fontWeight: 'bold' }}>₹{vehicle.price_per_day}/day</p>

        <button
          onClick={handleBooking}
          style={{
            marginTop: '20px',
            padding: '10px',
            borderRadius: '6px',
            background: '#007bff',
            color: 'white',
            border: 'none',
          }}
        >
          Book This Vehicle
        </button>
      </div>

      {/* Show booking date input popup only when user has clicked to book */}
      {showDateForm && !popupMessage && (
        <Popup
          onClose={() => {
            setShowDateForm(false);
            setStartDate('');
            setEndDate('');
          }}
          showConfirm={handleDateConfirm}
        >
          <label>
            Start Date:
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>
          <br />
          <label>
            End Date:
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </label>
        </Popup>
      )}

      {/* Show message popup only if there's a message */}
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
