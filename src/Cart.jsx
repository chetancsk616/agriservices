import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '/src/supabaseClient';

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

  const loadCart = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      setPopupMessage('Please login to view your cart.');
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
      setPopupMessage("Cart is empty or failed to load.");
      return;
    }

    const { data: prod, error: prodErr } = await supabase
      .from('products')
      .select('*')
      .in('id', cart.product_id);

    if (prodErr) {
      setPopupMessage("Error loading products.");
      return;
    }

    // Optional: sort `prod` to match the order in cart.product_id
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

    if (error) setPopupMessage("Update failed: " + error.message);
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
        style={{ width: 'fit-content', backgroundColor: 'rgba(255, 255, 255, 0)', border: 'none', fontSize: '25px', color: 'white' }}
        onClick={() => navigate("/products")}
      >
        &larr;
      </button>
      <h1 style={{ textAlign: 'center', color: 'white' }}>Your Cart</h1>

      <div id="cart-container" style={containerStyle}>
        {cartData === null ? (
          <p style={{ color: 'white' }}>Your cart is empty or failed to load.</p>
        ) : (
          products.map((p, i) => (
            <div className="cart-item" style={itemStyle} key={p.id}>
              <h3>{p.name}</h3>
              <p>Price: ₹{p.price}</p>
              <p>
                Quantity:&nbsp;
                <button onClick={() => handleQuantityChange(i, -1)}>-</button>&nbsp;
                <span>{cartData.quantity[i]}</span>&nbsp;
                <button onClick={() => handleQuantityChange(i, 1)}>+</button>
              </p>
              <p>Total: ₹{p.price * cartData.quantity[i]}</p>
            </div>
          ))
        )}
      </div>

      {cartData && (
        <div className="cart-total" style={{ marginLeft: '20px', marginTop: '20px', fontWeight: 'bold', color: 'white' }}>
          Total Price: ₹{total}
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
