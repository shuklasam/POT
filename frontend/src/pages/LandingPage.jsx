import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <span style={styles.logo}>Price Optimization Tool</span>
        <div style={styles.navRight}>
          <span style={styles.welcome}>
            Welcome, <span style={styles.username}>{user.username}</span>
          </span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={styles.hero}>
        <h1 style={styles.title}>Price Optimization Tool</h1>
        <p style={styles.subtitle}>
          A powerful tool to manage products, forecast demand,
          and optimize pricing strategies for your business.
        </p>

        {/* Cards */}
        <div style={styles.cards}>
          <div style={styles.card} onClick={() => navigate('/products')}>
            <div style={styles.cardIcon}>📦</div>
            <h2 style={styles.cardTitle}>Create and Manage Product</h2>
            <p style={styles.cardDesc}>
              Create, view, update, and delete products. Search and filter
              by category with demand forecast visualization.
            </p>
            <span style={styles.arrow}>→</span>
          </div>

          <div style={styles.card} onClick={() => navigate('/optimization')}>
            <div style={styles.cardIcon}>📊</div>
            <h2 style={styles.cardTitle}>Pricing Optimization</h2>
            <p style={styles.cardDesc}>
              View optimized prices for all products based on demand
              forecasts and market conditions.
            </p>
            <span style={styles.arrow}>→</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#1a1a1a',
    color: 'white',
  },
  navbar: {
    backgroundColor: '#111',
    padding: '16px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #333',
  },
  logo: {
    color: '#00D4AA',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  welcome: {
    color: '#aaa',
    fontSize: '14px',
  },
  username: {
    color: '#00D4AA',
    fontWeight: 'bold',
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #444',
    color: '#aaa',
    padding: '6px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  hero: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '80px',
    paddingBottom: '60px',
    paddingLeft: '24px',
    paddingRight: '24px',
  },
  title: {
    fontSize: '42px',
    fontWeight: 'bold',
    marginBottom: '16px',
    textAlign: 'center',
  },
  subtitle: {
    color: '#aaa',
    fontSize: '16px',
    textAlign: 'center',
    maxWidth: '600px',
    marginBottom: '60px',
    lineHeight: '1.6',
  },
  cards: {
    display: 'flex',
    gap: '32px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'white',
    color: '#111',
    borderRadius: '12px',
    padding: '40px',
    width: '300px',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  cardIcon: {
    fontSize: '40px',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    margin: '0',
  },
  cardDesc: {
    fontSize: '14px',
    color: '#555',
    lineHeight: '1.6',
    margin: '0',
    flex: 1,
  },
  arrow: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginTop: '8px',
  },
};