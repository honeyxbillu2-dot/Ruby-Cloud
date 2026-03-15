import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

const About = () => {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    try {
      const { data, error } = await api
        .from('about_content')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is 'not found'
      if (data) {
        setAbout(data);
      }
    } catch (err) {
      console.error('Error fetching about:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="page-header">
        <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'linear-gradient(135deg, #ff0040, #dc143c, #ff1493)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          <img src="/logo.png" alt="" style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
          About Ruby Cloud
        </h2>
        <p>Premium Gaming Server Hosting Platform</p>
      </div>

      {/* Main About Section - Two Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '60px',
        alignItems: 'start',
        marginBottom: '60px',
        '@media (max-width: 1024px)': {
          gridTemplateColumns: '1fr',
          gap: '40px'
        }
      }}>
        {/* LEFT SIDE - Team Hierarchy */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          alignItems: 'flex-start'
        }}>
          {/* Founder Card - Top Left (Highlighted) */}
          <div
            onMouseEnter={() => setHoveredCard('founder')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              background: 'linear-gradient(165deg, rgba(255, 46, 0, 0.12), rgba(255, 106, 0, 0.06))',
              backdropFilter: 'blur(14px)',
              border: '1px solid rgba(255, 46, 0, 0.25)',
              borderRadius: '18px',
              padding: '28px',
              width: '100%',
              maxWidth: '360px',
              textAlign: 'center',
              alignSelf: 'center',
              position: 'relative',
              overflow: 'visible',
              transition: 'all 0.25s ease',
              transform: hoveredCard === 'founder' ? 'translateY(-8px) scale(1.02)' : 'scale(1)',
              boxShadow: hoveredCard === 'founder'
                ? '0 18px 48px rgba(255, 46, 0, 0.24), 0 0 30px rgba(255, 106, 0, 0.14)'
                : '0 8px 26px rgba(255, 46, 0, 0.12)'
            }}>
            {/* Flame Founder badge (outside box, glowing gradient text) */}
            <div style={{ position: 'absolute', top: '-44px', left: '50%', transform: 'translateX(-50%)', zIndex: 3 }}>
              <div style={{
                display: 'inline-block',
                padding: '6px 14px',
                background: 'rgba(10,6,4,0.28)',
                border: '1px solid rgba(255,46,0,0.18)',
                borderRadius: '18px',
                boxShadow: '0 12px 36px rgba(255,60,10,0.18), 0 0 30px rgba(255,110,20,0.12)'
              }}>
                <span style={{
                  background: 'linear-gradient(90deg,#FF2E00,#FF6A00,#FFD000)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  letterSpacing: '0.6px',
                  whiteSpace: 'nowrap',
                  display: 'inline-block'
                }}>Ruby Founder</span>
              </div>
            </div>

            {/* Glow background */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(255, 46, 0, 0.2) 0%, transparent 70%)',
              pointerEvents: 'none',
              opacity: hoveredCard === 'founder' ? 1 : 0.5,
              transition: 'opacity 0.3s ease'
            }}></div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 8px 30px rgba(255, 46, 0, 0.36)',
                border: '3px solid rgba(255, 106, 0, 0.22)',
                background: 'linear-gradient(180deg, rgba(30,18,10,0.7), rgba(20,12,8,0.6))'
              }}>
                <img src="/Honey...!.png" alt="Honey...!" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo.png' }} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #FF2E00, #FF6A00)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: '0.65rem',
                fontWeight: '800',
                letterSpacing: '1.8px',
                marginBottom: '6px',
                textTransform: 'uppercase'
              }}>
                Founder & Visionary
              </div>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '800',
                color: 'var(--text-primary)',
                marginBottom: '8px'
              }}>
                {'[Honey...!]'}
              </h3>
              <p style={{
                color: 'var(--text-muted)',
                fontSize: '0.95rem',
                lineHeight: '1.4',
                margin: 0
              }}>
                {about?.founder_bio ? about.founder_bio : 'Ruby Founder'}
              </p>
            </div>
          </div>

          {/* Owner & Management Cards - Bottom Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            width: '100%',
            marginTop: '22px',
            maxWidth: '620px',
            marginRight: 'auto'
          }}>
            {/* Owner Card - Left */}
            <div
              onMouseEnter={() => setHoveredCard('owner')}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                background: 'transparent',
                border: hoveredCard === 'owner' ? '1px solid rgba(255,106,0,0.18)' : '1px solid rgba(255,106,0,0.08)',
                borderRadius: '18px',
                padding: '30px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'visible',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: hoveredCard === 'owner' ? 'translateY(-8px) scale(1.02)' : 'translateY(0)',
                boxShadow: hoveredCard === 'owner'
                  ? '0 20px 48px rgba(255, 106, 0, 0.12), inset 0 2px 10px rgba(255,46,0,0.02)'
                  : '0 6px 22px rgba(0,0,0,0.42)'
              }}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Flame Owner badge (outside box, glowing gradient text) */}
                <div style={{ position: 'absolute', top: '-52px', left: '50%', transform: 'translateX(-50%)', zIndex: 6 }}>
                  <div style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    background: 'rgba(22,14,10,0.6)',
                    border: '1px solid rgba(255,120,40,0.16)',
                    borderRadius: '24px',
                    boxShadow: '0 14px 40px rgba(255,80,10,0.14)'
                  }}>
                    <span style={{
                      background: 'linear-gradient(90deg,#FF2E00,#FF6A00,#FFD000)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      fontWeight: 900,
                      fontSize: '1rem',
                      whiteSpace: 'nowrap',
                      display: 'inline-block'
                    }}>Ruby Owner</span>
                  </div>
                </div>

                <div style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 10px 30px rgba(255, 106, 0, 0.30)',
                  border: '2px solid rgba(255, 208, 0, 0.2)',
                  background: 'linear-gradient(180deg, rgba(30,18,10,0.7), rgba(20,12,8,0.6))'
                }}>
                  <img src="/Venox...!.png" alt="Venox...!" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo.png' }} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #FF6A00, #FFD000)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: '0.65rem',
                  fontWeight: '700',
                  letterSpacing: '1.5px',
                  marginBottom: '6px',
                  textTransform: 'uppercase'
                }}>
                  Operations Head
                </div>
                <h4 style={{
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  marginBottom: '8px'
                }}>
                  {about?.owner_name || '[Venox...!]'}
                </h4>
                <p style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  lineHeight: '1.5',
                  margin: 0
                }}>
                  Ruby Owner
                </p>
              </div>
            </div>

            {/* Management Card - Right */}
            <div
              onMouseEnter={() => setHoveredCard('management')}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                background: 'transparent',
                border: hoveredCard === 'management' ? '1px solid rgba(255,106,0,0.18)' : '1px solid rgba(255,106,0,0.08)',
                borderRadius: '18px',
                padding: '30px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'visible',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: hoveredCard === 'management' ? 'translateY(-8px) scale(1.02)' : 'translateY(0)',
                boxShadow: hoveredCard === 'management'
                  ? '0 20px 48px rgba(255, 106, 0, 0.12), inset 0 2px 10px rgba(255,46,0,0.02)'
                  : '0 6px 22px rgba(0,0,0,0.42)'
              }}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Flame Management badge (outside box, glowing gradient text) */}
                <div style={{ position: 'absolute', top: '-52px', left: '50%', transform: 'translateX(-50%)', zIndex: 6 }}>
                  <div style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    background: 'rgba(22,14,10,0.6)',
                    border: '1px solid rgba(255,120,40,0.16)',
                    borderRadius: '24px',
                    boxShadow: '0 14px 40px rgba(255,80,10,0.14)'
                  }}>
                    <span style={{
                      background: 'linear-gradient(90deg,#FF2E00,#FF6A00,#FFD000)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      fontWeight: 900,
                      fontSize: '1rem',
                      whiteSpace: 'nowrap',
                      display: 'inline-block'
                    }}>Ruby CEO</span>
                  </div>
                </div>

                <div style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 10px 30px rgba(255, 106, 0, 0.30)',
                  border: '2px solid rgba(255, 106, 0, 0.2)',
                  background: 'linear-gradient(180deg, rgba(30,18,10,0.7), rgba(20,12,8,0.6))'
                }}>
                  <img src="/image.jpg" alt="B!LLU...!" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo.png' }} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #FF2E00, #FF6A00)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: '0.65rem',
                  fontWeight: '700',
                  letterSpacing: '1.5px',
                  marginBottom: '6px',
                  textTransform: 'uppercase'
                }}>
                  Support Lead
                </div>
                <h4 style={{
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  marginBottom: '8px'
                }}>
                  {about?.management_name || '[B ! L L U...!]'}
                </h4>
                <p style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  lineHeight: '1.5',
                  margin: 0
                }}>
                  Ruby CEO
                </p>
              </div>
            </div>

            {/* Admin Card */}
            <div
              onMouseEnter={() => setHoveredCard('admin')}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                background: 'transparent',
                border: hoveredCard === 'admin' ? '1px solid rgba(255,106,0,0.18)' : '1px solid rgba(255,106,0,0.08)',
                borderRadius: '18px',
                padding: '30px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'visible',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: hoveredCard === 'admin' ? 'translateY(-8px) scale(1.02)' : 'translateY(0)',
                boxShadow: hoveredCard === 'admin'
                  ? '0 20px 48px rgba(255, 106, 0, 0.12)'
                  : '0 6px 22px rgba(0,0,0,0.42)',
                gridColumn: '1 / -1'
              }}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ position: 'absolute', top: '-52px', left: '50%', transform: 'translateX(-50%)', zIndex: 6 }}>
                  <div style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    background: 'rgba(22,14,10,0.6)',
                    border: '1px solid rgba(255,120,40,0.16)',
                    borderRadius: '24px',
                    boxShadow: '0 14px 40px rgba(255,80,10,0.14)'
                  }}>
                    <span style={{
                      background: 'linear-gradient(90deg,#ff0040,#dc143c,#ff1493)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      fontWeight: 900,
                      fontSize: '1rem',
                      whiteSpace: 'nowrap',
                      display: 'inline-block'
                    }}>Ruby Admin</span>
                  </div>
                </div>
                <div style={{
                  width: '84px', height: '84px', borderRadius: '50%', overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 10px 30px rgba(220, 20, 60, 0.30)',
                  border: '2px solid rgba(255, 20, 147, 0.2)',
                  background: 'linear-gradient(180deg, rgba(30,18,10,0.7), rgba(20,12,8,0.6))'
                }}>
                  <img src="/OpBhaiCraft.png" alt="OpBhaiCraft" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo.png' }} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #ff0040, #ff1493)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text', fontSize: '0.65rem', fontWeight: '700',
                  letterSpacing: '1.5px', marginBottom: '6px', textTransform: 'uppercase'
                }}>
                  Admin
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  OpBhaiCraft
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
                  Ruby Admin
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT SIDE - Company Story */}
        <div>
          <div style={{
            background: 'linear-gradient(165deg, rgba(20, 12, 8, 0.95), rgba(30, 18, 10, 0.85))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 106, 0, 0.2)',
            borderRadius: '24px',
            padding: '40px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Glow effect */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(255, 46, 0, 0.1) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}></div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{
                fontSize: '1.6rem',
                fontWeight: '800',
                color: 'var(--text-primary)',
                marginBottom: '28px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'linear-gradient(135deg, #ff0040, #dc143c, #ff1493)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                <img src="/logo.png" alt="" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                About Ruby Cloud
              </h2>

              {/* Key Features */}
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'grid', gap: '14px' }}>
                  {[
                    {
                      icon: (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF2E00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                      ),
                      text: 'Ultra-Fast NVMe SSD Servers'
                    },
                    {
                      icon: (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF2E00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                          <circle cx="12" cy="12" r="2" fill="#FF2E00" />
                          <circle cx="6" cy="8" r="1" fill="#FF2E00" />
                          <circle cx="18" cy="16" r="1" fill="#FF2E00" />
                        </svg>
                      ),
                      text: 'Global Server Locations'
                    },
                    {
                      icon: (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF2E00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          <rect x="9" y="9" width="6" height="7" rx="1" />
                          <circle cx="12" cy="11" r="1" fill="#FF2E00" />
                          <line x1="12" y1="12" x2="12" y2="14" />
                        </svg>
                      ),
                      text: 'DDoS Protection'
                    },
                    {
                      icon: (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF2E00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                      ),
                      text: 'Full Control Panel Access'
                    },
                    {
                      icon: (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF2E00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="6" y="11" width="12" height="6" rx="2" />
                          <path d="M8 11V9a4 4 0 0 1 8 0v2" />
                          <circle cx="9" cy="14" r="1" fill="#FF2E00" />
                          <circle cx="15" cy="14" r="1" fill="#FF2E00" />
                          <path d="M4 8l2-2m14 0l-2-2M6 18l-2 2m14 0l2-2" />
                        </svg>
                      ),
                      text: 'Optimized Gaming Hardware'
                    },
                    {
                      icon: (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF2E00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                          <polyline points="10 17 15 12 10 7" />
                          <line x1="15" y1="12" x2="3" y2="12" />
                          <circle cx="7" cy="6" r="2" />
                          <line x1="7" y1="6" x2="7" y2="3" />
                        </svg>
                      ),
                      text: 'One-Click Mod Installations'
                    },
                    {
                      icon: (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF2E00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                          <path d="M20 6l2 2-2 2" />
                          <circle cx="20" cy="8" r="4" strokeWidth="1" />
                          <polyline points="19 7 20 8 22 6" />
                        </svg>
                      ),
                      text: '99.9% Uptime Guarantee'
                    },
                    {
                      icon: (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF2E00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                          <circle cx="12" cy="5" r="2" />
                          <path d="M10 5h4" />
                        </svg>
                      ),
                      text: '24/7 Premium Support'
                    }
                  ].map((feature, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '8px 12px',
                      background: 'transparent',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateX(8px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}>
                      <div className="about-icon-box" style={{
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'transparent',
                        border: '2px solid #FF2E00',
                        borderRadius: '10px',
                        boxShadow: '0 0 12px rgba(255, 46, 0, 0.3)'
                      }}>{feature.icon}</div>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default About;
