import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '/src/supabaseClient';
import './style.css';

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
        <button onClick={handleClose}>OK</button>
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
      setPopupMessage("Please log in to add items to cart.");
      setPopupNav('/login');
      return;
    }
  
    const { data: cartData, error: fetchError } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', user.id)
      .single();
  
    let newProductIds = [pid];
    let newQuantities = [1];
  
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
        setPopupMessage('Failed to update cart.');
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from('cart')
        .insert([{
          user_id: user.id,
          product_id: newProductIds,
          quantity: newQuantities
        }]);
  
      if (insertError) {
        setPopupMessage('Failed to add to cart.');
        return;
      }
    }
  
    setPopupMessage('Item added to cart.');
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
        style={{
          color: "white",
          width: "fit-content",
          backgroundColor: "rgba(255, 255, 255, 0)",
          border: "outset rgba(255, 255, 255, 0)",
          fontSize: "20px"
        }}
        onClick={() => navigate("/main/0")}
      >
        &larr;
      </button>
      <button
        onClick={() => navigate("/cart")}
        style={{
          color: "white",
          width: "fit-content",
          backgroundColor: "rgba(255, 255, 255, 0)",
          border: "outset rgba(255, 255, 255, 0)",
          fontSize: "20px"
        }}
      >
        Cart
      </button>

      <h1 style={{ textAlign: 'center' }}>Shop Products</h1>

      <div style={containerStyle}>
        {products.map((p) => {
          const cardStyle = {
            padding: '10px',
            borderRadius: '8px',
            margin: '10px',
            width: '220px',
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
              <img
                src={p.image_url || 'https://via.placeholder.com/150'}
                alt={p.name}
                style={{ width: '100%', height: '150px', objectFit: 'contain' }}
              />
              <h3
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {p.name}
              </h3>
              <p style={{ fontWeight: 'bold' }}>₹{p.price}</p>
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
                  marginTop: '10px',
                }}
              >
                Add to Cart
              </button>
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
