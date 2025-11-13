import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '/src/supabaseClient';
import './style.css';
import { LanguageContext } from './LanguageContext.jsx';
import { translateText } from './translationService.js';
import { useAuth } from './AuthContext.jsx';
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

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [sortOption, setSortOption] = useState('newest');
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const { currentUser } = useAuth();

  // State for popups and booking flow
  const [popupMessage, setPopupMessage] = useState('');
  const [popupNav, setPopupNav] = useState(null);
  const [bookingVehicleId, setBookingVehicleId] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchVehicles = async () => {
      let column = 'created_at';
      let ascending = false;
      switch (sortOption) {
        case 'newest': column = 'created_at'; ascending = false; break;
        case 'oldest': column = 'created_at'; ascending = true; break;
        case 'price_asc': column = 'price_per_day'; ascending = true; break;
        case 'price_desc': column = 'price_per_day'; ascending = false; break;
        case 'name_asc': column = 'name'; ascending = true; break;
        case 'name_desc': column = 'name'; ascending = false; break;
        default: column = 'created_at'; ascending = false;
      }

      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('status', 'Available')
          .order(column, { ascending });
        if (error) throw error;
        setVehicles(data || []);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error fetching vehicles (ordered):', err);
        // fallback to ordering by id or bare select
        try {
          const { data: d2, error: e2 } = await supabase.from('vehicles').select('*').eq('status', 'Available').order('id', { ascending: column === 'created_at' ? false : ascending });
          if (!e2) {
            setVehicles(d2 || []);
            return;
          }
        } catch (e) {
          // ignore
        }

        const { data: d3, error: e3 } = await supabase.from('vehicles').select('*').eq('status', 'Available');
        if (e3) {
          // eslint-disable-next-line no-console
          console.error('Error fetching vehicles (fallback):', e3);
          setVehicles([]);
        } else {
          setVehicles(d3 || []);
        }
      }
    };

    fetchVehicles();
  }, [sortOption]);

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

  return (
    <div className='scroll1'>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/main/0')}>&larr;</button>
        <div className="header-actions">
          <button onClick={() => navigate('/mybookings')} className="header-button"><Translate>My Bookings</Translate></button>
          {currentUser?.role === 'merchant' && (
            <button onClick={() => navigate('/add-vehicle')} className="header-button"><Translate>Add Vehicle</Translate></button>
          )}
        </div>
      </div>

      <h1 className="page-title"><Translate>Available Vehicles</Translate></h1>

      <div style={{display:'flex', justifyContent:'flex-end', padding: '0 1.25rem', marginTop: '-1.2rem'}}>
        <div style={{display:'flex', alignItems:'center', gap: '0.5rem'}}>
          <label style={{color:'var(--muted)'}}><Translate>Sort:</Translate></label>
          <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name A–Z</option>
            <option value="name_desc">Name Z–A</option>
          </select>
        </div>
      </div>

      <div className="vehicle-grid">
        {vehicles.map((v) => (
            <div key={v.id} className={`vehicle-card ${hoveredCardId===v.id? 'hovered':''}`} onMouseEnter={() => setHoveredCardId(v.id)} onMouseLeave={() => setHoveredCardId(null)}>
            <div onClick={() => navigate(`/vehicle/${v.id}`)}>
              <img src={v.image_url || 'https://placehold.co/220x150/243b55/ffffff?text=Vehicle'} alt={v.name} className="vehicle-img" />
              <h3 className="card-title">{v.name}</h3>
              <p className="price">₹{v.price_per_day}<Translate>/day</Translate></p>
            </div>
            <div className="actions-col">
              <button onClick={(e)=>{ e.stopPropagation(); handleBookClick(v.id); }} className="btn-add"><Translate>Book Now</Translate></button>
              {(((currentUser?.role === 'merchant') && v.merchant_id === currentUser.id) || currentUser?.role === 'admin') && (
                <button onClick={(e)=>{ e.stopPropagation(); navigate(`/edit-vehicle/${v.id}`); }} className="btn-edit"><Translate>Edit Vehicle</Translate></button>
              )}
            </div>
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
          <div className="form-column">
              <h3 className="no-top"><Translate>Select Booking Dates</Translate></h3>
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
    </div>
  );
};

export default VehicleList;
