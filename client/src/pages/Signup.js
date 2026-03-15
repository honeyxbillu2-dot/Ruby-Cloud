import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FlameIcon = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} style={{ verticalAlign: 'middle', marginRight: '8px' }}>
    <defs>
      <linearGradient id="flameGrad2" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#FF2E00" />
        <stop offset="50%" stopColor="#FF6A00" />
        <stop offset="100%" stopColor="#FFD000" />
      </linearGradient>
    </defs>
    <path fill="url(#flameGrad2)" d="M12 23c-3.866 0-7-3.134-7-7 0-2.5 1.5-4.5 3-6.5s3-4.5 3-7.5c0 0 1 2 2 4s2 3.5 2 5.5c0 1-.5 2-1 3 1-1 2-2 2-4 0 0 1 1.5 1 3.5 0 3.866-2.134 7-5 7z" />
  </svg>
);

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(username, email, password);
      setSuccess('Account created successfully! Please check your email for a confirmation link (if required) then login.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
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
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '32px' }}>
          Join the best Minecraft hosting platform
        </p>
        <h2>Create Account</h2>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><FlameIcon size={14} /> Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Choose a username"
              required
            />
          </div>
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
              placeholder="Create a strong password"
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating account...' : <><FlameIcon size={16} /> Create Account</>}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
