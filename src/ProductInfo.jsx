import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '/src/supabaseClient';
import './style.css';

const Popup = ({ message, onClose, navigateTo }) => {
  const navigate = useNavigate();
  const handleClose = () => {
    onClose();
    if (navigateTo) setTimeout(() => navigate(navigateTo), 100);
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

export default function ProductInfo() {
  const { id } = useParams();
  const nav = useNavigate();
  const [p, setP] = useState(null);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupNav, setPopupNav] = useState(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      if (!error) setP(data);
    })();
  }, [id]);

  const addCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setPopupMessage('Please log in to add items to cart.');
      setPopupNav('/farmerlogin');
      return;
    }

    const { data: cartData, error: fetchError } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', user.id)
      .single();

    let newProductIdArray = [parseInt(id)];
    let newQuantityArray = [1];

    if (!fetchError && cartData) {
      const productIndex = cartData.product_id.indexOf(parseInt(id));
      if (productIndex !== -1) {
        // product already in cart; update quantity
        newProductIdArray = [...cartData.product_id];
        newQuantityArray = [...cartData.quantity];
        newQuantityArray[productIndex]++;
      } else {
        // add new product
        newProductIdArray = [...cartData.product_id, parseInt(id)];
        newQuantityArray = [...cartData.quantity, 1];
      }

      const { error: updateError } = await supabase
        .from('cart')
        .update({
          product_id: newProductIdArray,
          quantity: newQuantityArray,
        })
        .eq('user_id', user.id);

      if (updateError) {
        setPopupMessage('Unable to update cart.');
        return;
      }
    } else {
      // no cart row exists for user
      const { error: insertError } = await supabase
        .from('cart')
        .insert([
          {
            user_id: user.id,
            product_id: newProductIdArray,
            quantity: newQuantityArray,
          },
        ]);

      if (insertError) {
        setPopupMessage('Unable to add to cart.');
        return;
      }
    }

    setPopupMessage('Item added to cart.');
    setPopupNav('/cart');
  };

  if (!p) return <div style={{ padding: 20, color: 'white' }}>Loading…</div>;

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20, fontFamily: 'sans-serif', color: 'white' }} className='scroll1'>
      <button onClick={() => nav("/products")} style={{ color: "white", background: "none", border: "none", marginBottom: '10px' }}>&larr;</button>
      <img src={p.image_url || 'https://via.placeholder.com/300'} alt={p.name} style={{ width: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: '10px' }} />
      <h2>{p.name}</h2>
      <h3 style={{ color: '#4caf50' }}>₹{p.price}</h3>
      <p style={{ whiteSpace: 'pre-wrap' }}>{p.discription}</p>
      <button onClick={addCart} style={{ marginTop: '20px', padding: '10px 20px', borderRadius: '6px', background: '#28a745', color: 'white', border: 'none', fontSize: '16px' }}>
        Add to Cart
      </button>

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
}
