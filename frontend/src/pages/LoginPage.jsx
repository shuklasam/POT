import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const payload = isRegister
        ? { username: form.username, email: form.email, password: form.password }
        : { email: form.email, password: form.password };

      const res = await api.post(endpoint, payload);
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logo}>Price Optimization Tool</div>
        <p style={styles.subtitle}>
          {isRegister ? 'Create your account' : 'Sign in to your account'}
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div style={styles.field}>
              <label style={styles.label}>Username</label>
              <input
                style={styles.input}
                name="username"
                placeholder="Enter username"
                value={form.username}
                onChange={handleChange}
                required
                minLength={3}
              />
            </div>
          )}
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              name="email"
              type="email"
              placeholder="Enter email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              name="password"
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
            />
          </div>

          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Please wait...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <p style={styles.toggle}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <span
            style={styles.toggleLink}
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
          >
            {isRegister ? ' Login' : ' Register'}
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#1a1a1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#2a2a2a',
    borderRadius: '12px',
    padding: '40px',
    width: '400px',
    border: '1px solid #333',
  },
  logo: {
    color: '#00D4AA',
    fontSize: '22px',
    fontWeight: 'bold',
    marginBottom: '8px',
    textAlign: 'center',
  },
  subtitle: {
    color: '#aaa',
    textAlign: 'center',
    marginBottom: '24px',
    fontSize: '14px',
  },
  field: {
    marginBottom: '16px',
  },
  label: {
    color: '#ccc',
    fontSize: '13px',
    display: 'block',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #444',
    borderRadius: '6px',
    color: 'white',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  btn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#00D4AA',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '8px',
  },
  error: {
    backgroundColor: '#ff4444',
    color: 'white',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '13px',
  },
  toggle: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '13px',
  },
  toggleLink: {
    color: '#00D4AA',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};