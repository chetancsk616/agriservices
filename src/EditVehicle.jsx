import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '/src/supabaseClient';
import { useAuth } from './AuthContext.jsx';
import { LanguageContext } from './LanguageContext.jsx';
import { translateText } from './translationService.js';
import Translate from './Translation.jsx';
import './style.css';

const EditVehicle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { language } = useContext(LanguageContext);

  const [form, setForm] = useState({ name: '', type: '', status: 'Available', price_per_day: '', image_url: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from('vehicles').select('*').eq('id', id).single();
      if (error) {
        setMessage('Unable to load vehicle');
        return;
      }

      // allow merchant owner or admin to edit; if merchant_id exists enforce ownership for merchants
      const isOwner = data.merchant_id ? data.merchant_id === currentUser?.id : false;
      if (!(currentUser?.role === 'merchant' && isOwner) && currentUser?.role !== 'admin') {
        setMessage('Access denied');
        return;
      }

      setForm({
        name: data.name || '',
        type: data.type || '',
        status: data.status || 'Available',
        price_per_day: data.price_per_day != null ? String(data.price_per_day) : '',
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
      type: form.type || null,
      status: form.status || 'Available',
      price_per_day: form.price_per_day ? parseFloat(form.price_per_day) : null,
      image_url: form.image_url || null,
    };

    if ('id' in payload) delete payload.id;

    const { data, error } = await supabase.from('vehicles').update(payload).eq('id', id).select();

    if (error) {
      const prefix = await translateText('Failed to update vehicle: ', language);
      setMessage(prefix + error.message);
      setLoading(false);
      return;
    }

    const success = await translateText('Vehicle updated successfully.', language);
    setMessage(success);
    setLoading(false);
    setTimeout(() => navigate('/vehicles'), 800);
  };

  if (message === 'Access denied') {
    return (
      <div className="box">
        <h2><Translate>Access denied</Translate></h2>
        <p><Translate>You are not authorized to edit this vehicle.</Translate></p>
      </div>
    );
  }

  return (
    <div className="box form-panel">
      <button type="button" className="back-btn" onClick={() => navigate(-1)}>&larr;</button>
      <h1><Translate>Edit Vehicle</Translate></h1>

      <form onSubmit={handleSubmit}>
        <label>
          <Translate>Vehicle Name</Translate>
          <input id="name" value={form.name} onChange={handleChange} required />
        </label>

        <label>
          <Translate>Type</Translate>
          <input id="type" value={form.type} onChange={handleChange} />
        </label>

        <label>
          <Translate>Status</Translate>
          <select id="status" value={form.status} onChange={handleChange}>
            <option value="Available">Available</option>
            <option value="Unavailable">Unavailable</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </label>

        <label>
          <Translate>Price per Day</Translate>
          <input id="price_per_day" type="number" step="0.01" value={form.price_per_day} onChange={handleChange} required />
        </label>

        <label>
          <Translate>Image URL</Translate>
          <input id="image_url" value={form.image_url} onChange={handleChange} />
        </label>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-add">{loading ? <Translate>Updating...</Translate> : <Translate>Update Vehicle</Translate>}</button>
          <button type="button" onClick={() => navigate('/vehicles')} className="header-button"><Translate>Cancel</Translate></button>
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

export default EditVehicle;
