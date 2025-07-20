import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '/src/supabaseClient';
import './style.css';
import { LanguageContext } from './LanguageContext.jsx';
import { translateText } from './translationService.js';
import Translate from './Translation.jsx';

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
        <button onClick={handleClose}><Translate>OK</Translate></button>
      </div>
    </div>
  );
};

export default function ProductInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupNav, setPopupNav] = useState(null);
  const { language } = useContext(LanguageContext);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      if (!error) setProduct(data);
    };
    fetchProduct();
  }, [id]);

  const addCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const msg = await translateText('Please log in to add items to cart.', language);
      setPopupMessage(msg);
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
        newProductIdArray = [...cartData.product_id];
        newQuantityArray = [...cartData.quantity];
        newQuantityArray[productIndex]++;
      } else {
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
        const msg = await translateText('Unable to update cart.', language);
        setPopupMessage(msg);
        return;
      }
    } else {
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
        const msg = await translateText('Unable to add to cart.', language);
        setPopupMessage(msg);
        return;
      }
    }
    const msg = await translateText('Item added to cart.', language);
    setPopupMessage(msg);
    setPopupNav('/cart');
  };

  if (!product) {
    return (
        <div style={{ padding: 20, color: 'white', textAlign: 'center' }}>
            <Translate>Loading…</Translate>
        </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20, fontFamily: 'sans-serif', color: 'white' }} className='scroll1'>
      <button onClick={() => navigate("/products")} style={{ color: "white", background: "none", border: "none", marginBottom: '10px', fontSize: '30px' }}>&larr;</button>
      <img src={product.image_url || 'https://placehold.co/600x400/243b55/ffffff?text=Product'} alt={product.name} style={{ width: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: '10px' }} />
      <h2>{product.name}</h2> {/* Dynamic content from DB - should not be translated */}
      <h3 style={{ color: '#4caf50' }}>₹{product.price}</h3>
      <p style={{ whiteSpace: 'pre-wrap' }}>{product.discription}</p> {/* Dynamic content from DB */}
      <button onClick={addCart} style={{ marginTop: '20px', padding: '10px 20px', borderRadius: '6px', background: '#28a745', color: 'white', border: 'none', fontSize: '16px', cursor: 'pointer' }}>
        <Translate>Add to Cart</Translate>
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
