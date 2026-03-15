import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Lazy load pages for better performance
const About = lazy(() => import('./pages/About'));
const PaidPlans = lazy(() => import('./pages/PaidPlans'));
const YTPartners = lazy(() => import('./pages/YTPartners'));
const Features = lazy(() => import('./pages/Features'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const Chat = lazy(() => import('./pages/Chat'));

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-container">
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <img src="/logo.png" alt="Ruby Cloud" style={{ width: '80px', height: '80px', marginBottom: '20px' }} />
          <p>Loading Ruby Cloud...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="auth-container">
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <img src="/logo.png" alt="Ruby Cloud" style={{ width: '60px', height: '60px', marginBottom: '20px' }} />
          <p>Loading Page...</p>
        </div>
      </div>
    }>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="about" element={<About />} />
          <Route path="paid-plans" element={<PaidPlans />} />
          <Route path="yt-partners" element={<YTPartners />} />
          <Route path="features" element={<Features />} />
          <Route path="chat" element={<Chat />} />
          <Route path="admin" element={user?.isAdmin ? <AdminPanel /> : <Navigate to="/dashboard" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
