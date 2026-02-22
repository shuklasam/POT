import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Fuse from 'fuse.js';

export default function OptimizationPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchOptimized();
  }, []);

  const fetchOptimized = async () => {
    try {
      const res = await api.get('/api/products/optimized');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fuse = new Fuse(products, {
    keys: ['name', 'category', 'description'],
    threshold: 0.4,
  });

  const filtered = search
    ? fuse.search(search)
        .map((result) => result.item)
        .filter((p) => category ? p.category === category : true)
  : products.filter((p) => category ? p.category === category : true);

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <span style={styles.logo}>Price Optimization Tool</span>
        <div style={styles.navRight}>
          <span style={styles.welcome}>
            Welcome, <span style={styles.username}>{user.username}</span>
          </span>
          <div style={styles.avatar}>👤</div>
        </div>
      </nav>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.toolbarLeft}>
          <button style={styles.backBtn} onClick={() => navigate('/')}>
            ← Back
          </button>
          <span style={styles.pageTitle}>Pricing Optimization</span>
        </div>
        <div style={styles.toolbarRight}>
          <input
            style={styles.search}
            placeholder="🔍 Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span style={styles.categoryLabel}>Category:</span>
          <select
            style={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableWrapper}>
        {loading ? (
          <p style={styles.loading}>Loading...</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Product Name</th>
                <th style={styles.th}>Product Category</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Cost Price</th>
                <th style={styles.th}>Selling Price</th>
                <th style={styles.th}>Optimized Price</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.product_id} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                  <td style={styles.td}>{p.name}</td>
                  <td style={styles.td}>{p.category}</td>
                  <td style={styles.td}>{p.description}</td>
                  <td style={styles.td}>$ {p.cost_price}</td>
                  <td style={styles.tdMuted}>$ {p.selling_price}</td>
                  <td style={styles.tdAccent}>$ {p.optimized_price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <button style={styles.cancelBtn} onClick={() => navigate('/')}>Cancel</button>
        <button style={styles.saveBtn}>Save</button>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#1a1a1a', color: 'white', display: 'flex', flexDirection: 'column' },
  navbar: { backgroundColor: '#111', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #333' },
  logo: { color: '#00D4AA', fontSize: '18px', fontWeight: 'bold' },
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  welcome: { color: '#aaa', fontSize: '14px' },
  username: { color: '#00D4AA', fontWeight: 'bold' },
  avatar: { fontSize: '24px' },
  toolbar: { backgroundColor: '#111', padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #333' },
  toolbarLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  toolbarRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  backBtn: { backgroundColor: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '14px' },
  pageTitle: { fontSize: '16px', fontWeight: 'bold' },
  search: { backgroundColor: '#222', border: '1px solid #444', borderRadius: '6px', padding: '6px 12px', color: 'white', fontSize: '13px', width: '180px' },
  categoryLabel: { color: '#aaa', fontSize: '13px' },
  select: { backgroundColor: '#222', border: '1px solid #444', borderRadius: '6px', padding: '6px 12px', color: 'white', fontSize: '13px' },
  tableWrapper: { flex: 1, overflowX: 'auto', padding: '0 32px' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '8px' },
  thead: { backgroundColor: '#222' },
  th: { padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold', color: 'white', borderBottom: '1px solid #333' },
  td: { padding: '12px 16px', fontSize: '13px', color: 'white', borderBottom: '1px solid #222' },
  tdMuted: { padding: '12px 16px', fontSize: '13px', color: '#888', borderBottom: '1px solid #222' },
  tdAccent: { padding: '12px 16px', fontSize: '13px', color: '#00D4AA', fontWeight: 'bold', borderBottom: '1px solid #222' },
  trEven: { backgroundColor: '#1a1a1a' },
  trOdd: { backgroundColor: '#1f1f1f' },
  loading: { color: '#aaa', textAlign: 'center', padding: '40px' },
  footer: { padding: '16px 32px', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #333', backgroundColor: '#111' },
  cancelBtn: { padding: '8px 20px', backgroundColor: 'transparent', border: '1px solid #555', color: 'white', borderRadius: '6px', cursor: 'pointer' },
  saveBtn: { padding: '8px 20px', backgroundColor: '#00D4AA', border: 'none', color: '#000', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
};