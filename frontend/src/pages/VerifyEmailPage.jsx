import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }
    verifyEmail(token);
  }, []);

  const verifyEmail = async (token) => {
    try {
      const res = await api.get(`/api/auth/verify-email?token=${token}`);
      setStatus('success');
      setMessage(res.data.message);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.detail || 'Verification failed');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.logo}>Price Optimization Tool</h2>
        {status === 'verifying' && (
          <p style={styles.message}>Verifying your email...</p>
        )}
        {status === 'success' && (
          <>
            <p style={styles.success}>{message}</p>
            <button style={styles.btn} onClick={() => navigate('/login')}>
              Go to Login
            </button>
          </>
        )}
        {status === 'error' && (
          <>
            <p style={styles.error}>{message}</p>
            <button style={styles.btn} onClick={() => navigate('/login')}>
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: '#2a2a2a', borderRadius: '12px', padding: '40px', width: '400px', border: '1px solid #333', textAlign: 'center' },
  logo: { color: '#00D4AA', marginBottom: '24px' },
  message: { color: '#aaa', fontSize: '16px' },
  success: { color: '#00D4AA', fontSize: '16px', marginBottom: '20px' },
  error: { color: '#ff4444', fontSize: '16px', marginBottom: '20px' },
  btn: { padding: '10px 24px', backgroundColor: '#00D4AA', border: 'none', color: '#000', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
};