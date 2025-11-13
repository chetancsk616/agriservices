import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '/src/supabaseClient';
import './style.css';
import { LanguageContext } from './LanguageContext.jsx';
import { translateText } from './translationService.js';
import Translate from './Translation.jsx';
import { useAuth } from './AuthContext.jsx'; // NEW: Import useAuth

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
  const [sortOption, setSortOption] = useState('newest');
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupNav, setPopupNav] = useState(null);
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const { currentUser } = useAuth(); // NEW: Get the current user from context

  useEffect(() => {
    const fetchProducts = async () => {
      // choose order column and direction based on sortOption
      let column = 'created_at';
      let ascending = false;
      switch (sortOption) {
        case 'newest': column = 'created_at'; ascending = false; break;
        case 'oldest': column = 'created_at'; ascending = true; break;
        case 'price_asc': column = 'price'; ascending = true; break;
        case 'price_desc': column = 'price'; ascending = false; break;
        case 'name_asc': column = 'name'; ascending = true; break;
        case 'name_desc': column = 'name'; ascending = false; break;
        default: column = 'created_at'; ascending = false;
      }

      try {
        const { data, error } = await supabase.from('products').select('*').order(column, { ascending });
        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        // If server responds 400 (bad request), it's likely the sort column doesn't exist (e.g., created_at)
        // Fallback: try ordering by id, then finally a plain select without order.
        // eslint-disable-next-line no-console
        console.error('Error fetching products (ordered):', err);
        try {
          const { data: data2, error: err2 } = await supabase.from('products').select('*').order('id', { ascending: column === 'created_at' ? false : ascending });
          if (!err2) {
            setProducts(data2 || []);
            return;
          }
        } catch (e) {
          // ignore
        }

        // final fallback: select without order
        const { data: data3, error: err3 } = await supabase.from('products').select('*');
        if (err3) {
          // eslint-disable-next-line no-console
          console.error('Error fetching products (fallback):', err3);
          setProducts([]);
        } else {
          setProducts(data3 || []);
        }
      }
    };

    fetchProducts();
  }, [sortOption]);

  const handleAddToCart = async (pid) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const msg = await translateText("Please log in to add items to cart.", language);
      setPopupMessage(msg);
      setPopupNav('/farmerlogin');
      return;
    }

    // ... (rest of your handleAddToCart logic remains unchanged) ...
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

  // container/grid and header button styles moved to CSS classes

  return (
    <div className='scroll1'>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/main/0')}>&larr;</button>
        <div className="header-actions">
          {currentUser?.role === 'merchant' && (
            <button onClick={() => navigate('/add-product')} className="header-button"><Translate>Add Product</Translate></button>
          )}
          <button onClick={() => navigate('/cart')} className="header-button"><Translate>Cart</Translate></button>
        </div>
      </div>

      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding: '0 1.25rem'}}>
        <h1 className="page-title"><Translate>Shop Products</Translate></h1>
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
      <div className="product-grid">
        {products.map((p) => {
          return (
            <div key={p.id} className={`product-card ${hoveredCardId===p.id? 'hovered':''}`} onMouseEnter={() => setHoveredCardId(p.id)} onMouseLeave={() => setHoveredCardId(null)} onClick={() => navigate(`/product/${p.id}`)}>
              <div>
                <img
                  src={p.image_url || 'https://placehold.co/220x150/243b55/ffffff?text=Product'}
                  alt={p.name}
                  className="product-img"
                />
                <h3 className="card-title">{p.name}</h3>
              </div>
              <div>
                <p className="price">₹{p.price}</p>
                <div className="actions-col">
                  <button onClick={(e)=>{e.stopPropagation(); handleAddToCart(p.id);}} className="btn-add"><Translate>Add to Cart</Translate></button>
                  {(((currentUser?.role === 'merchant') && p.merchant_id === currentUser.id) || currentUser?.role === 'admin') && (
                    <button onClick={(e)=>{e.stopPropagation(); navigate(`/edit-product/${p.id}`);}} className="btn-edit"><Translate>Edit Product</Translate></button>
                  )}
                </div>
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