import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '/src/supabaseClient';
import { useAuth } from './AuthContext.jsx';
import { LanguageContext } from './LanguageContext.jsx';
import { translateText } from './translationService.js';
import Translate from './Translation.jsx';
import './style.css';

const AddProduct = () => {
  const { currentUser } = useAuth();
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', discription: '', price: '', image_url: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!currentUser || currentUser.role !== 'merchant') {
    return (
      <div className="box">
        <h2><Translate>Access denied</Translate></h2>
        <p><Translate>You must be logged in as a merchant to add products.</Translate></p>
        <button onClick={() => navigate('/merchantlogin')}><Translate>Merchant Login</Translate></button>
      </div>
    );
  }

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!form.name || !form.price) {
      const msg = await translateText('Please provide at least a name and price.', language);
      setMessage(msg);
      setLoading(false);
      return;
    }

    const payload = {
      name: form.name,
      discription: form.discription,
      price: form.price ? parseFloat(form.price) : null,
      image_url: form.image_url || null,
      merchant_id: currentUser.id,
    };

  if ('id' in payload) delete payload.id;

  console.log('AddProduct payload (about to insert):', payload);

  // return the inserted row representation so we can verify the inserted id/server behavior
  const { data, error } = await supabase.from('products').insert([payload]).select();

  // eslint-disable-next-line no-console
  console.log('AddProduct insert result:', { data, error });

    if (error) {
      const prefix = await translateText('Failed to add product: ', language);
      setMessage(prefix + error.message);
      setLoading(false);
      return;
    }

    const success = await translateText('Product added successfully.', language);
    setMessage(success);
    setLoading(false);
    // navigate to product list after a moment
    setTimeout(() => navigate('/products'), 900);
  };

  return (
    <div className="box form-panel">
      <button type="button" className="back-btn" onClick={() => navigate(-1)}>&larr;</button>
      <h1><Translate>Add Product</Translate></h1>

      <form onSubmit={handleSubmit}>
        <label>
          <Translate>Product Name</Translate>
          <input id="name" value={form.name} onChange={handleChange} required />
        </label>

        <label>
          <Translate>Description</Translate>
          <textarea id="discription" value={form.discription} onChange={handleChange} rows={4} cols={90}/>
        </label>

        <label>
          <Translate>Price</Translate>
          <input id="price" type="number" step="0.01" value={form.price} onChange={handleChange} required />
        </label>

        <label>
          <Translate>Image URL</Translate>
          <input id="image_url" value={form.image_url} onChange={handleChange} />
        </label>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-add">
            {loading ? <Translate>Adding...</Translate> : <Translate>Add Product</Translate>}
          </button>
          <button type="button" onClick={() => navigate('/products')} className="header-button"><Translate>Cancel</Translate></button>
        </div>
      </form>

      {message && (
        <div className="popup-box">
          <p>{message}</p>
        </div>
      )}
    </div>
  );
};

export default AddProduct;
