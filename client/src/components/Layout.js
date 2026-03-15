import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

const Layout = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updates = {};
      if (profileData.username && profileData.username !== user?.username) updates.username = profileData.username;

      // Note: Updating email in Auth system requires validation. 
      // For now, we update the display email in 'users' table.
      if (profileData.email && profileData.email !== user?.email) updates.email = profileData.email;

      if (avatarPreview) updates.avatar = avatarPreview;

      if (Object.keys(updates).length > 0) {
        const { error } = await api
          .from('users')
          .update(updates)
          .eq('id', user.id);

        if (error) throw error;

        // Refresh user context
        const { data: fresh } = await api
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (fresh) {
          updateUser({
            ...fresh,
            isAdmin: fresh.is_admin,
            username: fresh.username,
            email: fresh.email,
            avatar: fresh.avatar
          });
        }
      }

      setShowProfileModal(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile: ' + (err.message || 'Unknown error'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const fileInputRef = React.useRef();

  return (
    <div className="app-layout">
      {/* Fire Sparks / Embers */}
      <div className="fire-sparks">
        {[...Array(20)].map((_, i) => <div key={i} className="spark"></div>)}
      </div>

      <header className="top-navbar">
        <div className="navbar-brand" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}>
          <img src="/logo.png" alt="🔥" className="brand-logo" style={{ width: '50px', height: '50px', objectFit: 'contain', transition: 'transform 0.3s ease' }} />
          <div className="brand-text" style={{ transition: 'transform 0.3s ease' }}>
            <h1>Ruby Cloud</h1>
            <span>Premium Minecraft Hosting</span>
          </div>
        </div>

        <nav className="navbar-menu">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <div className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/paid-plans" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <div className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <span>Paid Plans</span>
          </NavLink>

          <NavLink to="/yt-partners" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <div className="nav-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#FF0000">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
              </svg>
            </div>
            <span>YT Partners</span>
          </NavLink>

          <NavLink to="/features" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <div className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M2 12h20" />
              </svg>
            </div>
            <span>Features</span>
          </NavLink>

          <NavLink to="/about" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <div className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <span>About</span>
          </NavLink>

          <NavLink to="/chat" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <div className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <span>Chat</span>
          </NavLink>

          {user?.isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => `nav-item admin-item ${isActive ? 'active' : ''}`}>
              <div className="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </div>
              <span>Admin</span>
            </NavLink>
          )}
        </nav>

        <div className="navbar-user">
          {user ? (
            <>
              <div className="user-info" onClick={() => { setAvatarPreview(user?.avatar || null); setShowProfileModal(true); }} style={{ cursor: 'pointer' }}>
                <div className="user-avatar">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.username} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    (user?.username ? user.username.charAt(0).toUpperCase() : '🔥')
                  )}
                </div>
                <span className="user-name">{user?.username || user?.email}</span>
              </div>
              <button className="logout-btn" onClick={logout}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <NavLink to="/login" className="btn btn-secondary" style={{ padding: '8px 16px' }}>Sign In</NavLink>
              <NavLink to="/signup" className="btn btn-primary" style={{ padding: '8px 16px' }}>Sign Up</NavLink>
            </div>
          )}
        </div>
      </header>

      <main className="main-content-top">
        {/* Background Logo */}
        <div className="page-bg-logo">
          <img src="/logo.png" alt="" />
        </div>
        <Outlet />
      </main>

      {/* Floating Buttons Container - Right Side */}
      <div className="floating-buttons-right">

        {/* Client Chat Button (for users) / Users Button (for admin) */}
        {user?.isAdmin ? (
          <button className="float-btn users-btn" onClick={() => navigate('/chat')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>Users</span>
          </button>
        ) : (
          <button className="float-btn chat-btn" onClick={() => navigate('/chat')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>Client Chat</span>
          </button>
        )}
      </div>

      {/* Discord Button - Bottom Right */}
      <a href="https://discord.gg/6XG84R7AKa" target="_blank" rel="noopener noreferrer" className="discord-float-btn">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      </a>

      {/* Profile Settings Modal */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <h3>⚙️ Profile Settings</h3>

            <div style={{ background: 'linear-gradient(135deg, rgba(255, 106, 0, 0.1), rgba(255, 46, 0, 0.05))', padding: '20px', borderRadius: '16px', marginBottom: '24px', textAlign: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#fff',
                  margin: '0 auto 12px',
                  border: '3px solid var(--primary)'
                }}>
                  {avatarPreview || user?.avatar ? (
                    <img src={avatarPreview || user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>{user?.username?.charAt(0).toUpperCase()}</div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => fileInputRef.current?.click()} style={{ padding: '8px 10px' }}>Upload Photo</button>
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
                </div>
              </div>
              <p style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1.2rem' }}>{user?.username}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user?.email}</p>
            </div>

            <form onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label>👤 Username</label>
                <input
                  type="text"
                  value={profileData.username}
                  onChange={e => setProfileData({ ...profileData, username: e.target.value })}
                  placeholder="Enter new username"
                />
              </div>

              <div className="form-group">
                <label>📧 Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                  placeholder="Enter new email"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowProfileModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">💾 Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
