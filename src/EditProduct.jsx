import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '/src/supabaseClient';
import { useAuth } from './AuthContext.jsx';
import { LanguageContext } from './LanguageContext.jsx';
import { translateText } from './translationService.js';
import Translate from './Translation.jsx';
import './style.css';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { language } = useContext(LanguageContext);

  const [form, setForm] = useState({ name: '', discription: '', price: '', image_url: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (error) {
        setMessage('Unable to load product');
        return;
      }
      // authorize: allow merchant owner or admin to edit
      const isOwner = data.merchant_id ? data.merchant_id === currentUser?.id : false;
      if (!(currentUser?.role === 'merchant' && isOwner) && currentUser?.role !== 'admin') {
        setMessage('Access denied');
        return;
      }

      setForm({
        name: data.name || '',
        discription: data.discription || '',
        price: data.price != null ? String(data.price) : '',
        image_url: data.image_url || '',
      });
    };
    load();
  }, [id, currentUser]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const payload = {
      name: form.name,
      discription: form.discription,
      price: form.price ? parseFloat(form.price) : null,
      image_url: form.image_url || null,
    };

    // ensure we don't send id
    if ('id' in payload) delete payload.id;

    const { data, error } = await supabase.from('products').update(payload).eq('id', id).select();

    if (error) {
      const prefix = await translateText('Failed to update product: ', language);
      setMessage(prefix + error.message);
      setLoading(false);
      return;
    }

    const success = await translateText('Product updated successfully.', language);
    setMessage(success);
    setLoading(false);
    setTimeout(() => navigate('/products'), 800);
  };

  if (message === 'Access denied') {
    return (
      <div className="box">
        <h2><Translate>Access denied</Translate></h2>
        <p><Translate>You are not authorized to edit this product.</Translate></p>
      </div>
    );
  }

  return (
    <div className="box form-panel">
      <button type="button" className="back-btn" onClick={() => navigate(-1)}>&larr;</button>
      <h1><Translate>Edit Product</Translate></h1>

      <form onSubmit={handleSubmit}>
        <label>
          <Translate>Product Name</Translate>
          <input id="name" value={form.name} onChange={handleChange} required />
        </label>

        <label>
          <Translate>Description</Translate>
          <textarea id="discription" value={form.discription} onChange={handleChange} rows={4} cols={90} />
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
            {loading ? <Translate>Updating...</Translate> : <Translate>Update Product</Translate>}
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

export default EditProduct;
