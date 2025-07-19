import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '/src/supabaseClient';
import './style.css';

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const navigate = useNavigate();

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

  const handleBooking = async (vehicleId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please log in to book a vehicle.');
      navigate('/login');
      return;
    }

    const startDate = prompt('Enter start date (YYYY-MM-DD)');
    const endDate = prompt('Enter end date (YYYY-MM-DD)');
    if (!startDate || !endDate) return;

    const { error: bookingError } = await supabase.from('bookings').insert([
      {
        user_id: user.id,
        vehicle_id: vehicleId,
        start_date: startDate,
        end_date: endDate,
        status: 'Pending',
      },
    ]);

    if (bookingError) alert('Failed to book vehicle');
    else alert('Booking requested!');
  };

  const containerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: '20px',
  };

  return (
    <div className='scroll1'>
      <button
        onClick={() => navigate("/main/0")}
        style={{
          color: "white",
          backgroundColor: "rgba(255, 255, 255, 0)",
          border: "outset rgba(255, 255, 255, 0)",
          fontSize: "20px"
        }}
      >
        &larr;
      </button>
      <button
        onClick={() => navigate("/mybookings")}
        style={{
          color: "white",
          backgroundColor: "rgba(255, 255, 255, 0)",
          border: "outset rgba(255, 255, 255, 0)",
          fontSize: "20px"
        }}
      >
        My Bookings
      </button>

      <h1 style={{ textAlign: 'center' }}>Available Vehicles</h1>

      <div style={containerStyle}>
        {vehicles.map((v) => {
          const cardStyle = {
            padding: '10px',
            borderRadius: '8px',
            margin: '10px',
            width: '220px',
            cursor: 'pointer',
            boxShadow:
              hoveredCardId === v.id
                ? '0 8px 32px 0 rgba(134, 141, 240, 0.37)'
                : '0 2px 5px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.1)',
            transform: hoveredCardId === v.id ? 'scale(1.02)' : 'scale(1)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          };

          return (
            <div
              key={v.id}
              style={cardStyle}
              onMouseEnter={() => setHoveredCardId(v.id)}
              onMouseLeave={() => setHoveredCardId(null)}
              onClick={() => navigate(`/vehicle/${v.id}`)}
            >
              <img
                src={v.image_url || 'https://via.placeholder.com/150'}
                alt={v.name}
                style={{ width: '100%', height: '150px', objectFit: 'contain' }}
              />
              <h3 style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {v.name}
              </h3>
              <p style={{ fontWeight: 'bold' }}>₹{v.price_per_day}/day</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBooking(v.id);
                }}
                style={{
                  padding: '8px',
                  borderRadius: '5px',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  marginTop: '10px',
                }}
              >
                Book Now
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VehicleList;
