import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import ProductPage from './pages/ProductPage';
import OptimizationPage from './pages/OptimizationPage';
import VerifyEmailPage from './pages/VerifyEmailPage';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
 // return token ? children : <Navigate to="/login" replace />;
 // instead of this simple logic we are also checking if token expires or not because we can go to landingpage if token is just present there even if it is expired.
  if (!token) return <Navigate to="/login" replace />;
 // now checking if token is expired or not = 
  try {
    const payload = JSON.parse(atob(token.split('.')[1])); // decode JWT payload atob = base64 is decoding .split is giving the payload
    const isExpired = payload.exp * 1000 < Date.now();
    if (isExpired) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return <Navigate to="/login" replace />;
    }
  } catch {
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <LandingPage />
          </ProtectedRoute>
        } />
        <Route path="/products" element={
          <ProtectedRoute>
            <ProductPage />
          </ProtectedRoute>
        } />
        <Route path="/optimization" element={
          <ProtectedRoute>
            <OptimizationPage />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;