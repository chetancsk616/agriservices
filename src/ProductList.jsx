import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '/src/supabaseClient';
import './style.css';
import { LanguageContext } from './LanguageContext.jsx';
import { translateText } from './translationService.js';
import Translate from './Translation.jsx';

const Popup = ({ message, onClose, navigateTo }) => {
  const navigate = useNavigate();

  const handleClose = () => {
    onClose();
    if (navigateTo) {
      setTimeout(() => navigate(navigateTo), 100);
    }
  };

  if (!message) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <p>{message}</p>
        <button onClick={handleClose}><Translate>OK</Translate></button>
      </div>
    </div>
  );
};

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupNav, setPopupNav] = useState(null);
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) console.error('Error fetching products:', error);
      else setProducts(data);
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (pid) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const msg = await translateText("Please log in to add items to cart.", language);
      setPopupMessage(msg);
      setPopupNav('/farmerlogin'); // Updated to farmer login
      return;
    }

    const { data: cartData, error: fetchError } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!fetchError && cartData) {
      const productIds = cartData.product_id || [];
      const quantities = cartData.quantity || [];
      const index = productIds.indexOf(pid);

      if (index !== -1) {
        quantities[index]++;
      } else {
        productIds.push(pid);
        quantities.push(1);
      }

      const { error: updateError } = await supabase
        .from('cart')
        .update({
          product_id: productIds,
          quantity: quantities
        })
        .eq('user_id', user.id);

      if (updateError) {
        const msg = await translateText('Failed to update cart.', language);
        setPopupMessage(msg);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from('cart')
        .insert([{
          user_id: user.id,
          product_id: [pid],
          quantity: [1]
        }]);

      if (insertError) {
        const msg = await translateText('Failed to add to cart.', language);
        setPopupMessage(msg);
        return;
      }
    }

    const msg = await translateText('Item added to cart.', language);
    setPopupMessage(msg);
  };

  const containerStyle = {
    display: 'grid', // Using grid for better consistency
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '20px',
    padding: '20px',
  };

  return (
    <div className='scroll1'>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
        <button
          style={{
            color: "white",
            background: "none",
            border: "none",
            fontSize: "30px",
            cursor: "pointer"
          }}
          onClick={() => navigate("/main/0")}
        >
          &larr;
        </button>
        <button
          onClick={() => navigate("/cart")}
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
          <Translate>Cart</Translate>
        </button>
      </div>

      <h1 style={{ textAlign: 'center' }}><Translate>Shop Products</Translate></h1>

      <div style={containerStyle}>
        {products.map((p) => {
          const cardStyle = {
            padding: '1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow:
              hoveredCardId === p.id
                ? '0 8px 32px 0 rgba(134, 141, 240, 0.37)'
                : '0 2px 5px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.1)',
            transform: hoveredCardId === p.id ? 'scale(1.02)' : 'scale(1)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          };

          return (
            <div
              key={p.id}
              style={cardStyle}
              onMouseEnter={() => setHoveredCardId(p.id)}
              onMouseLeave={() => setHoveredCardId(null)}
              onClick={() => navigate(`/product/${p.id}`)}
            >
              <div>
                <img
                  src={p.image_url || 'https://placehold.co/220x150/243b55/ffffff?text=Product'}
                  alt={p.name}
                  style={{ width: '100%', height: '150px', objectFit: 'contain', borderRadius: '4px' }}
                />
                <h3
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginTop: '0.5rem',
                    marginBottom: '0.5rem'
                  }}
                >
                  {p.name} {/* Product names from DB are not translated */}
                </h3>
              </div>
              <div>
                <p style={{ fontWeight: 'bold', margin: '0 0 10px 0' }}>₹{p.price}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(p.id);
                  }}
                  style={{
                    padding: '8px',
                    borderRadius: '5px',
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    width: '100%',
                    cursor: 'pointer'
                  }}
                >
                  <Translate>Add to Cart</Translate>
                </button>
              </div>
            </div>
          );
        })}
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
    </div>
  );
};

export default ProductList;
