import { useState, useEffect } from 'react';
import api from '../api';

export default function AddProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState({
    name: '',
    category: '',
    cost_price: '',
    selling_price: '',
    description: '',
    stock_available: '',
    units_sold: '',
    customer_rating: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        category: product.category || '',
        cost_price: product.cost_price || '',
        selling_price: product.selling_price || '',
        description: product.description || '',
        stock_available: product.stock_available || '',
        units_sold: product.units_sold || '',
        customer_rating: product.customer_rating || '',
      });
    }
  }, [product]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        category: form.category,
        cost_price: parseFloat(form.cost_price),
        selling_price: parseFloat(form.selling_price),
        description: form.description,
        stock_available: parseInt(form.stock_available) || 0,
        units_sold: parseInt(form.units_sold) || 0,
        customer_rating: form.customer_rating ? parseFloat(form.customer_rating) : null,
      };

      if (product) {
        await api.put(`/api/products/${product.product_id}`, payload);
      } else {
        await api.post('/api/products', payload);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <h3 style={styles.title}>{product ? 'Edit Product' : 'Add New Products'}</h3>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {/* Fields */}
        <div style={styles.field}>
          <label style={styles.label}>Product Name :</label>
          <input style={styles.input} name="name" placeholder="Enter Product Name" value={form.name} onChange={handleChange} />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Product Category :</label>
          <input style={styles.input} name="category" placeholder="Enter Product Category" value={form.category} onChange={handleChange} />
        </div>

        <div style={styles.row}>
          <div style={styles.halfField}>
            <label style={styles.label}>Cost Price :</label>
            <input style={styles.input} name="cost_price" type="number" placeholder="xx,xxx,xxx" value={form.cost_price} onChange={handleChange} />
          </div>
          <div style={styles.halfField}>
            <label style={styles.label}>Selling Price :</label>
            <input style={styles.input} name="selling_price" type="number" placeholder="xx,xxx,xxx" value={form.selling_price} onChange={handleChange} />
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Description :</label>
          <textarea style={styles.textarea} name="description" placeholder="Enter Description" value={form.description} onChange={handleChange} />
        </div>

        <div style={styles.row}>
          <div style={styles.halfField}>
            <label style={styles.label}>Available Stock :</label>
            <input style={styles.input} name="stock_available" type="number" placeholder="xx,xxx,xxx" value={form.stock_available} onChange={handleChange} />
          </div>
          <div style={styles.halfField}>
            <label style={styles.label}>Units Sold :</label>
            <input style={styles.input} name="units_sold" type="number" placeholder="xx,xxx,xxx" value={form.units_sold} onChange={handleChange} />
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Customer Rating (1-5) :</label>
          <input style={styles.input} name="customer_rating" type="number" placeholder="e.g. 4.5" min="1" max="5" step="0.1" value={form.customer_rating} onChange={handleChange} />
        </div>

        {/* Buttons */}
        <div style={styles.btnRow}>
          <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={styles.addBtn} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : product ? 'Update' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#1e1e1e', borderRadius: '10px', padding: '28px', width: '500px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #333' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { color: 'white', margin: 0, fontSize: '18px' },
  closeBtn: { background: 'none', border: 'none', color: '#aaa', fontSize: '18px', cursor: 'pointer' },
  field: { marginBottom: '14px' },
  halfField: { flex: 1 },
  row: { display: 'flex', gap: '16px', marginBottom: '14px' },
  label: { color: '#aaa', fontSize: '12px', display: 'block', marginBottom: '6px' },
  input: { width: '100%', padding: '9px 12px', backgroundColor: '#2a2a2a', border: '1px solid #444', borderRadius: '6px', color: 'white', fontSize: '13px', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '9px 12px', backgroundColor: '#2a2a2a', border: '1px solid #444', borderRadius: '6px', color: 'white', fontSize: '13px', boxSizing: 'border-box', height: '80px', resize: 'vertical' },
  btnRow: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' },
  cancelBtn: { padding: '8px 20px', backgroundColor: 'transparent', border: '1px solid #555', color: 'white', borderRadius: '6px', cursor: 'pointer' },
  addBtn: { padding: '8px 20px', backgroundColor: '#00D4AA', border: 'none', color: '#000', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  error: { backgroundColor: '#ff4444', color: 'white', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' },
};