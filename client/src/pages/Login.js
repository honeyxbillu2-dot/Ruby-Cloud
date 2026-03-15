import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FlameIcon = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} style={{ verticalAlign: 'middle', marginRight: '8px' }}>
    <defs>
      <linearGradient id="flameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#FF2E00" />
        <stop offset="50%" stopColor="#FF6A00" />
        <stop offset="100%" stopColor="#FFD000" />
      </linearGradient>
    </defs>
    <path fill="url(#flameGrad)" d="M12 23c-3.866 0-7-3.134-7-7 0-2.5 1.5-4.5 3-6.5s3-4.5 3-7.5c0 0 1 2 2 4s2 3.5 2 5.5c0 1-.5 2-1 3 1-1 2-2 2-4 0 0 1 1.5 1 3.5 0 3.866-2.134 7-5 7z" />
  </svg>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      // For now, navigate to dashboard - admin check can be added later
      navigate('/dashboard');
    } catch (err) {
      if (err.message?.includes('Email not confirmed')) {
        setError('Please check your email and confirm your account before logging in. (Or tell the admin to disable email confirmation)');
      } else {
        setError(err.message || 'Invalid credentials. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" onClick={() => navigate('/')} style={{ cursor: 'alias' }}>
      <div className="auth-card" onClick={(e) => e.stopPropagation()} style={{ cursor: 'default', position: 'relative' }}>
        <button
          onClick={() => navigate('/')}
          className="btn-icon"
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: 'var(--text-muted)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}
        >
          ✕
        </button>
        <div className="logo-text">
          <img src="/logo.png" alt="Ruby Cloud" style={{ width: '50px', height: '50px', verticalAlign: 'middle', marginRight: '10px' }} />
          Ruby Cloud
        </div>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '40px', fontSize: '0.95rem', position: 'relative', zIndex: 1 }}>
          Premium Minecraft Server Hosting
        </p>
        <h2>Welcome Back</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1 }}>
          <div className="form-group">
            <label><FlameIcon size={14} /> Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label><FlameIcon size={14} /> Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Signing in...' : <><FlameIcon size={16} /> Sign In</>}
          </button>
        </form>

        <p className="auth-link">
          New here? <Link to="/signup">Create an Account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
