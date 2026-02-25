import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import AddProductModal from '../components/AddProductModal';
import DemandForecastModal from '../components/DemandForecastModal';
import Fuse from 'fuse.js';

export default function ProductPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showForecastModal, setShowForecastModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [showDemandCol, setShowDemandCol] = useState(false);
  const [selected, setSelected] = useState([]);
  const [debouncedSearch , setDebouncedSearch] = useState('');
  const timeref = useRef(null);

  useEffect(() => {
    fetchProducts();
  },[]);

// debounced effect =
  useEffect(() =>{
    const handler = setTimeout(()=>{
      setDebouncedSearch(search);
    },1000);
    return () => clearTimeout(timeref.current);
  },[search]);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.detail || 'Delete failed');
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setShowAddModal(true);
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelected(selected.length === filtered.length ? [] : filtered.map((p) => p.product_id));
  };
// this is my fuzzy search function =
//  const fuse = new Fuse(products, {
//   keys: ['name', 'category', 'description'],  // fields to search in
//   threshold: 0.4,  // 0 = exact match, 1 = match anything
// });
// used useMemo to prevent re-rendering, only renders when products changes=
// implementing debounced search inside fuse logic =
  const fuse = useMemo(()=> new Fuse(products, {
    keys: ['name', 'category', 'description'],  // fields to search in
    threshold: 0.4,  // 0 = exact match, 1 = match anything
  }),[products]);

  const filtered = debouncedSearch
  ? fuse.search(debouncedSearch)
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
          <button style={styles.backBtn} onClick={() => navigate('/')}>← Back</button>
          <span style={styles.divider}>|</span>
          <span style={styles.pageTitle}>Create and Manage Product</span>
          <label style={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={showDemandCol}
              onChange={() => setShowDemandCol(!showDemandCol)}
              style={{ display: 'none' }}
            />
            <div style={{ ...styles.toggle, backgroundColor: showDemandCol ? '#00D4AA' : '#444' }}>
              <div style={{ ...styles.toggleKnob, transform: showDemandCol ? 'translateX(20px)' : 'translateX(0)' }} />
            </div>
            <span style={styles.toggleText}>With Demand Forecast</span>
          </label>
        </div>
        <div style={styles.toolbarRight}>
          <input
            style={styles.search}
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span style={styles.categoryLabel}>Category:</span>
          <select style={styles.select} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button style={styles.addBtn} onClick={() => { setEditProduct(null); setShowAddModal(true); }}>
            + Add New Products
          </button>
          <button style={styles.forecastBtn} onClick={() => setShowForecastModal(true)}>
            📊 Demand Forecast
          </button>
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
                <th style={styles.th}>
                  <input
                    type="checkbox"
                    checked={selected.length === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th style={styles.th}>Product Name</th>
                <th style={styles.th}>Product Category</th>
                <th style={styles.th}>Cost Price</th>
                <th style={styles.th}>Selling Price</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Available Stock</th>
                <th style={styles.th}>Units Sold</th>
                {showDemandCol && <th style={styles.th}>Calculated Demand</th>}
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr
                  key={p.product_id}
                  style={{
                    ...(i % 2 === 0 ? styles.trEven : styles.trOdd),
                    ...(selected.includes(p.product_id) ? styles.trSelected : {}),
                  }}
                >
                  <td style={styles.td}>
                    <input
                      type="checkbox"
                      checked={selected.includes(p.product_id)}
                      onChange={() => toggleSelect(p.product_id)}
                    />
                  </td>
                  <td style={styles.td}>{p.name}</td>
                  <td style={styles.td}>{p.category}</td>
                  <td style={styles.td}>$ {p.cost_price}</td>
                  <td style={styles.td}>$ {p.selling_price}</td>
                  <td style={styles.tdDesc}>{p.description}</td>
                  <td style={styles.td}>{p.stock_available?.toLocaleString()}</td>
                  <td style={styles.td}>{p.units_sold?.toLocaleString()}</td>
                  {showDemandCol && (
                    <td style={styles.tdAccent}>
                      {p.demand_forecast ? parseFloat(p.demand_forecast).toLocaleString() : '-'}
                    </td>
                  )}
                  <td style={styles.td}>
                    <button style={styles.iconBtn} title="View">👁</button>
                    <button style={styles.editBtn} title="Edit" onClick={() => handleEdit(p)}>✏️</button>
                    <button style={styles.iconBtnRed} title="Delete" onClick={() => handleDelete(p.product_id)}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      
      <div style={styles.footer}>
        <button style={styles.cancelBtn} onClick={() => navigate('/')}>Cancel</button>
        <button style={styles.saveBtn}>Save</button>
      </div>

      
      {showAddModal && (
        <AddProductModal
          product={editProduct}
          onClose={() => { setShowAddModal(false); setEditProduct(null); }}
          onSave={fetchProducts}
        />
      )}
      {showForecastModal && (
        <DemandForecastModal
          onClose={() => setShowForecastModal(false)}
          selectedIds={selected}
          allProducts={products}
        />
      )}
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
  toolbar: { backgroundColor: '#111', padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #333' },
  toolbarLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  toolbarRight: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  backBtn: { backgroundColor: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '14px' },
  divider: { color: '#444' },
  pageTitle: { fontSize: '15px', fontWeight: 'bold' },
  toggleLabel: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
  toggle: { width: '40px', height: '20px', borderRadius: '10px', position: 'relative', transition: 'background 0.3s' },
  toggleKnob: { width: '16px', height: '16px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: '2px', transition: 'transform 0.3s' },
  toggleText: { color: '#aaa', fontSize: '13px' },
  search: { backgroundColor: '#222', border: '1px solid #444', borderRadius: '6px', padding: '6px 12px', color: 'white', fontSize: '13px', width: '160px' },
  categoryLabel: { color: '#aaa', fontSize: '13px' },
  select: { backgroundColor: '#222', border: '1px solid #444', borderRadius: '6px', padding: '6px 12px', color: 'white', fontSize: '13px' },
  addBtn: { backgroundColor: '#00D4AA', border: 'none', color: '#000', padding: '7px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' },
  forecastBtn: { backgroundColor: '#333', border: '1px solid #555', color: 'white', padding: '7px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  tableWrapper: { flex: 1, overflowX: 'auto', padding: '0 32px' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '8px' },
  thead: { backgroundColor: '#222' },
  th: { padding: '14px 12px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold', color: 'white', borderBottom: '1px solid #333', whiteSpace: 'nowrap' },
  td: { padding: '11px 12px', fontSize: '13px', color: 'white', borderBottom: '1px solid #222', whiteSpace: 'nowrap' },
  tdDesc: { padding: '11px 12px', fontSize: '12px', color: '#ccc', borderBottom: '1px solid #222', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  tdAccent: { padding: '11px 12px', fontSize: '13px', color: '#00D4AA', fontWeight: 'bold', borderBottom: '1px solid #222', backgroundColor: '#0a2e28' },
  trEven: { backgroundColor: '#1a1a1a' },
  trOdd: { backgroundColor: '#1f1f1f' },
  trSelected: { backgroundColor: '#0a2e28' },
  loading: { color: '#aaa', textAlign: 'center', padding: '40px' },
  footer: { padding: '16px 32px', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #333', backgroundColor: '#111' },
  cancelBtn: { padding: '8px 20px', backgroundColor: 'transparent', border: '1px solid #555', color: 'white', borderRadius: '6px', cursor: 'pointer' },
  saveBtn: { padding: '8px 20px', backgroundColor: '#00D4AA', border: 'none', color: '#000', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  iconBtn: { background: 'none',border: 'none',cursor: 'pointer', fontSize: '16px',padding: '4px 8px',marginRight: '4px',filter: 'brightness(0) invert(1)',},
  editBtn: { background: 'none',border: 'none',cursor: 'pointer', fontSize: '16px',padding: '4px 8px',marginRight: '4px',},
  iconBtnRed: { background: 'rgba(255,68,68,0.2)',border: 'none',cursor: 'pointer', fontSize: '16px',padding: '4px 8px',borderRadius: '4px',color: 'white',},
};