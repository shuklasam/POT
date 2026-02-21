import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import ProductPage from './pages/ProductPage';
import OptimizationPage from './pages/OptimizationPage';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
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