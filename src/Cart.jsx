import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '/src/supabaseClient';
import { LanguageContext } from './LanguageContext.jsx';
import { translateText } from './translationService.js';
import Translate from './Translation.jsx';

const Popup = ({ message, onClose, navigateTo }) => {
  const navigate = useNavigate();
  if (!message) return null;

  const handleClose = () => {
    onClose();
    if (navigateTo) setTimeout(() => navigate(navigateTo), 100);
  };

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <p>{message}</p>
        <button onClick={handleClose}>OK</button>
      </div>
    </div>
  );
};

const Cart = () => {
  const [cartData, setCartData] = useState(null);
  const [products, setProducts] = useState([]);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupNav, setPopupNav] = useState(null);
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);

  const loadCart = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      const msg = await translateText('Please login to view your cart.', language);
      setPopupMessage(msg);
      setPopupNav("/main/3");
      return;
    }

    const { data: cart, error: cartError } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (cartError || !cart || !cart.product_id?.length) {
      setCartData(null);
      return;
    }

    const { data: prod, error: prodErr } = await supabase
      .from('products')
      .select('*')
      .in('id', cart.product_id);

    if (prodErr) {
      const msg = await translateText("Error loading products.", language);
      setPopupMessage(msg);
      return;
    }

    const sortedProducts = cart.product_id.map(pid => prod.find(p => p.id === pid));

    setCartData(cart);
    setProducts(sortedProducts);
  };

  const updateCart = async (newProductIds, newQuantities) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('cart')
      .update({ product_id: newProductIds, quantity: newQuantities })
      .eq('user_id', user.id);

    if (error) {
        const msg = await translateText("Update failed: ", language);
        setPopupMessage(msg + error.message);
    }
  };

  const handleQuantityChange = async (index, delta) => {
    const newQuantities = [...cartData.quantity];
    const newProductIds = [...cartData.product_id];

    if (delta === -1 && newQuantities[index] === 1) {
      newQuantities.splice(index, 1);
      newProductIds.splice(index, 1);
    } else {
      newQuantities[index] += delta;
    }

    await updateCart(newProductIds, newQuantities);
    loadCart();
  };

  useEffect(() => {
    loadCart();
  }, []);

  const containerStyle = {
    padding: '20px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  };

  const itemStyle = {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    color: 'white',
  };

  const total = products.reduce((sum, p, i) => sum + (p?.price || 0) * (cartData?.quantity[i] || 0), 0);

  return (
    <div className='scroll1'>
      <button
        type="button"
        className="back-btn"
        onClick={() => navigate("/products")}
      >
        &larr;
      </button>
      <h1 className="page-title"><Translate>Your Cart</Translate></h1>

      <div id="cart-container" className="cart-grid">
        {cartData === null ? (
          <p className="booking-empty"><Translate>Your cart is empty.</Translate></p>
        ) : (
          products.map((p, i) => (
            <div className="cart-item" key={p.id}>
              <h3>{p.name}</h3>
              <p><Translate>Price:</Translate> ₹{p.price}</p>
              <p>
                <Translate>Quantity:</Translate>&nbsp;
                <button onClick={() => handleQuantityChange(i, -1)}>-</button>&nbsp;
                <span>{cartData.quantity[i]}</span>&nbsp;
                <button onClick={() => handleQuantityChange(i, 1)}>+</button>
              </p>
              <p><Translate>Total:</Translate> ₹{p.price * cartData.quantity[i]}</p>
            </div>
          ))
        )}
      </div>

      {cartData && products.length > 0 && (
        <div className="cart-total">
          <Translate>Total Price:</Translate> ₹{total}
        </div>
      )}

      <Popup
        message={popupMessage}
        onClose={() => {
          setPopupMessage('');
          setPopupNav(null);
        }}
        navigateTo={popupNav}
      />
    </div>
  );
};

export default Cart;
