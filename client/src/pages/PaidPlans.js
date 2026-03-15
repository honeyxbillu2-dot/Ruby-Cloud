import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

const PaidPlans = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [locationSettings, setLocationSettings] = useState([]);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customPlan, setCustomPlan] = useState({ ram: 1, cpu: 50, ssd: 5 });
  const [discordMembers, setDiscordMembers] = useState('400+');
  const [showFlags, setShowFlags] = useState(false);

  // Custom Plan Pricing
  const RAM_PRICE = 50; // PKR per GB
  const SSD_PRICE = 6;  // PKR per GB
  const CPU_PRICE = 1; // PKR per 1%

  const calculateCustomPrice = () => {
    return Math.round((customPlan.ram * RAM_PRICE) + (customPlan.ssd * SSD_PRICE) + (customPlan.cpu * CPU_PRICE));
  };

  const STATIC_PLANS = [
    { id: 1, name: 'Dirt Plan', ram: '2 GB', cpu: '100%', storage: '10 GB SSD', price: '180 PKR/month', location: 'Singapore', discount: 0, sort_order: 1, is_active: 1 },
    { id: 2, name: 'Stone Plan', ram: '4 GB', cpu: '150%', storage: '20 GB SSD', price: '360 PKR/month', location: 'Singapore', discount: 0, sort_order: 2, is_active: 1 },
    { id: 3, name: 'Iron Plan', ram: '6 GB', cpu: '200%', storage: '30 GB SSD', price: '540 PKR/month', location: 'Singapore', discount: 0, sort_order: 3, is_active: 1 },
    { id: 4, name: 'Redstone Plan', ram: '8 GB', cpu: '250%', storage: '40 GB SSD', price: '720 PKR/month', location: 'Singapore', discount: 0, sort_order: 4, is_active: 1 },
    { id: 5, name: 'Gold Plan', ram: '10 GB', cpu: '250%', storage: '50 GB SSD', price: '900 PKR/month', location: 'Singapore', discount: 0, sort_order: 5, is_active: 1 },
    { id: 6, name: 'Amethyst', ram: '12 GB', cpu: '300%', storage: '60 GB SSD', price: '1080 PKR/month', location: 'Singapore', discount: 0, sort_order: 6, is_active: 1 },
    { id: 7, name: 'Emerald', ram: '16 GB', cpu: '350%', storage: '70 GB SSD', price: '1440 PKR/month', location: 'Singapore', discount: 0, sort_order: 7, is_active: 1 },
    { id: 8, name: 'Ruby', ram: '20 GB', cpu: '400%', storage: '80 GB SSD', price: '1800 PKR/month', location: 'Singapore', discount: 0, sort_order: 8, is_active: 1 },
    { id: 9, name: 'Black Ruby', ram: '32 GB', cpu: '500%', storage: '100 GB SSD', price: '3000 PKR/month', location: 'Singapore', discount: 0, sort_order: 9, is_active: 1 },
  ];

  useEffect(() => {
    // Fetch paid plans and location settings from server (SQLite-backed)
    const fetchPlans = async () => {
      try {
        const { data, error } = await api
          .from('paid_plans')
          .select('*')
          .eq('is_active', 1)
          .order('sort_order', { ascending: true });

        if (error) throw error;

        const sortedPlans = (data || []).sort((a, b) => {
          if (a.sort_order !== undefined && b.sort_order !== undefined && a.sort_order !== b.sort_order) {
            return a.sort_order - b.sort_order;
          }
          const namePriority = { 'bronze': 1, 'silver': 2, 'gold': 3, 'platinum': 4, 'amethyst': 5, 'diamond': 6, 'emerald': 7, 'ruby': 8, 'black ruby': 9 };
          const getNamePriority = (name) => {
            const lower = name.toLowerCase();
            for (const key in namePriority) { if (lower.includes(key)) return namePriority[key]; }
            return 99;
          };
          const prioA = getNamePriority(a.name);
          const priob = getNamePriority(b.name);
          if (prioA !== priob) return prioA - priob;
          const getRamValue = (ramStr) => { const val = parseInt(ramStr); return isNaN(val) ? 0 : val; };
          return getRamValue(a.ram) - getRamValue(b.ram);
        });

        // Use DB plans if available, otherwise fallback to static plans
        setPlans(sortedPlans.length > 0 ? sortedPlans : STATIC_PLANS);
      } catch (err) {
        console.error('Failed to load plans', err);
        setPlans(STATIC_PLANS);
      }
    };

    const fetchLocationSettings = async () => {
      try {
        const { data, error } = await api
          .from('location_settings')
          .select('*')
          .order('sort_order', { ascending: true });

        if (error) throw error;
        setLocationSettings(data || []);
      } catch (err) {
        console.error('Failed to load locations', err);
        setLocationSettings([
          { location: 'UAE', is_available: true },
          { location: 'Germany', is_available: false },
          { location: 'Singapore', is_available: false }
        ]);
      }
    };

    const fetchSettings = async () => {
      try {
        const { data } = await api
          .from('site_settings')
          .select('value')
          .eq('key', 'discord_members')
          .single();

        if (data) {
          setDiscordMembers(data.value);
        }
      } catch (err) {
        // ignore
      }
    };

    fetchPlans();
    fetchLocationSettings();
    fetchSettings();
  }, []);

  const isLocationAvailable = (location) => {
    // Singapore = always available (show plans), UAE = always coming soon
    if (location === 'Singapore') return true;
    if (location === 'UAE') return false;
    const loc = locationSettings.find(l => l.location === location);
    return loc ? Boolean(loc.is_available) : false;
  };

  const DISCORD_ORDER_LINK = 'https://discord.gg/CX7ZZgRZQA';

  const handlePlanClick = (plan) => {
    if (!isLocationAvailable(plan.location)) {
      setSelectedPlan(plan);
      setShowComingSoonModal(true);
      return;
    }
    // Redirect to Discord ticket section
    window.open(DISCORD_ORDER_LINK, '_blank', 'noopener,noreferrer');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!screenshot) {
      alert('Please upload payment screenshot!');
      return;
    }
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        // Submit order to server so admin panel (SQLite) can see it
        // Submit order as a ticket
        try {
          const { error } = await api
            .from('tickets')
            .insert([{
              user_id: user.id,
              user_email: user.email,
              username: user.username,
              subject: `Plan Order: ${selectedPlan.name}`,
              message: `Plan: ${selectedPlan.name}\nRAM: ${selectedPlan.ram}\nCPU: ${selectedPlan.cpu}\nPrice: ${selectedPlan.price}\n\nPayment Screenshot Attached`,
              screenshot: base64Image,
              category: 'order',
              status: 'pending'
            }]);

          if (error) throw error;
        } catch (dbErr) {
          throw new Error('Failed to submit order: ' + dbErr.message);
        }

        setSuccess('✅ Order submitted successfully! We will verify and activate your server within 24 hours.');
        setScreenshot(null);
        setScreenshotPreview(null);
      };
      reader.readAsDataURL(screenshot);
    } catch (err) {
      alert('Error submitting order. Please try again.');
      console.error('Order submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPlanEmoji = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('black ruby')) return '🖤';
    if (lowerName.includes('ruby')) return '💎';
    if (lowerName.includes('emerald')) return '💚';
    if (lowerName.includes('amethyst')) return '💜';
    if (lowerName.includes('diamond')) return '💠';
    if (lowerName.includes('platinum')) return '🔮';
    if (lowerName.includes('gold plan')) return '🥇';
    if (lowerName.includes('redstone')) return '🔴';
    if (lowerName.includes('iron')) return '⚙️';
    if (lowerName.includes('stone')) return '🪨';
    if (lowerName.includes('dirt')) return '🟫';
    if (lowerName.includes('gold')) return '🥇';
    if (lowerName.includes('silver')) return '🥈';
    if (lowerName.includes('bronze')) return '🥉';
    return '⭐';
  };

  const getPlanIcon = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('black ruby')) return '/black-ruby.png';
    if (lowerName.includes('ruby')) return '/ruby.png';
    if (lowerName.includes('emerald')) return '/Emerald.webp';
    if (lowerName.includes('amethyst')) return '/amethyst.png';
    if (lowerName.includes('gold plan')) return '/Gold.png';
    if (lowerName.includes('redstone')) return '/Redstone.png';
    if (lowerName.includes('iron')) return '/Iron.png';
    if (lowerName.includes('stone')) return '/Stone.png';
    if (lowerName.includes('dirt')) return '/Dirt.png';
    return null;
  };

  const getRankStyle = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('black ruby')) return { bg: 'linear-gradient(135deg, #ff0040, #8b0000, #2d0a0a)' };
    if (lowerName.includes('amethyst')) return { bg: 'linear-gradient(135deg, #9b59b6, #8e44ad, #6c3483)' };
    if (lowerName.includes('ruby')) return { bg: 'linear-gradient(135deg, #ef4444, #dc2626)' };
    if (lowerName.includes('diamond')) return { bg: 'linear-gradient(135deg, #60a5fa, #3b82f6)' };
    if (lowerName.includes('emerald')) return { bg: 'linear-gradient(135deg, #34d399, #10b981)' };
    if (lowerName.includes('platinum')) return { bg: 'linear-gradient(135deg, #a78bfa, #8b5cf6)' };
    if (lowerName.includes('redstone')) return { bg: 'linear-gradient(135deg, #ef4444, #b91c1c)' };
    if (lowerName.includes('gold plan')) return { bg: 'linear-gradient(135deg, #fbbf24, #f59e0b)' };
    if (lowerName.includes('iron')) return { bg: 'linear-gradient(135deg, #94a3b8, #64748b)' };
    if (lowerName.includes('stone')) return { bg: 'linear-gradient(135deg, #9ca3af, #6b7280)' };
    if (lowerName.includes('dirt')) return { bg: 'linear-gradient(135deg, #a16207, #92400e)' };
    if (lowerName.includes('gold')) return { bg: 'linear-gradient(135deg, #fbbf24, #f59e0b)' };
    if (lowerName.includes('silver')) return { bg: 'linear-gradient(135deg, #94a3b8, #64748b)' };
    if (lowerName.includes('bronze')) return { bg: 'linear-gradient(135deg, #f97316, #ea580c)' };
    return { bg: 'linear-gradient(135deg, #FF6A00, #FF2E00)' };
  };

  return (
    <div>
      <div className="page-header">
        <h2>💰 Premium Server Plans</h2>
        <p>Select a location to view available plans</p>
      </div>

      {success && <div className="alert alert-success">{success}</div>}

      {/* Location Flags Selection */}
      {!selectedLocation && (
        <div className="location-flags-container">
          <div className="flags-bg-logo">
            <img src="/logo.png" alt="" className="flags-logo-img" />
          </div>

          {/* Choose Location Button - Shows first */}
          {!showFlags && (
            <div style={{ textAlign: 'center', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
              <button
                onClick={() => setShowFlags(true)}
                className="flame-location-btn"
                style={{
                  background: 'none !important',
                  backgroundColor: 'transparent !important',
                  backgroundImage: 'none !important',
                  padding: '18px 50px',
                  borderRadius: '50px',
                  border: '2px solid #FF6A00',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  color: 'transparent',
                  boxShadow: '0 0 20px rgba(255, 106, 0, 0.4), 0 0 40px rgba(255, 46, 0, 0.2)',
                  animation: 'flameGlow 3s ease-in-out infinite alternate'
                }}
              >
                <span style={{
                  background: 'linear-gradient(135deg, #ff0040, #dc143c, #ff1493, #ff69b4)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  display: 'inline-block',
                }}>
                  🌍 Choose Your Location
                </span>
              </button>
            </div>
          )}

          {/* Blur Overlay with Flags Modal */}
          {showFlags && (
            <div
              className="flags-modal-overlay"
              onClick={() => setShowFlags(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'fadeIn 0.3s ease'
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  textAlign: 'center',
                  animation: 'scaleIn 0.3s ease'
                }}
              >
                <h3 style={{ marginBottom: '50px', fontSize: '1.6rem' }}>
                  <span style={{ marginRight: '10px' }}>🌍</span>
                  <span style={{
                    background: 'linear-gradient(135deg, #FF2E00, #FF6A00, #FFD000)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: '800'
                  }}>Select Server Location</span>
                </h3>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '80px', flexWrap: 'wrap' }}>
                  {/* France */}
                  <div
                    onClick={() => { setSelectedLocation('France'); setShowFlags(false); }}
                    style={{ cursor: 'pointer', textAlign: 'center', position: 'relative', transition: 'transform 0.3s ease' }}
                    className="flag-item"
                  >
                    {!isLocationAvailable('France') && (
                      <span style={{ position: 'absolute', top: '-12px', right: '-25px', background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', color: '#000', padding: '8px 16px', borderRadius: '14px', fontSize: '0.95rem', fontWeight: '700', zIndex: 10 }}>Soon</span>
                    )}
                    <img src="/france-flag.png" alt="France" style={{ width: '160px', height: '110px', borderRadius: '12px', transition: 'transform 0.3s ease', background: 'transparent', objectFit: 'cover' }} />
                    <p style={{ color: '#fff', marginTop: '14px', fontWeight: '700', fontSize: '1.25rem' }}>France</p>
                  </div>

                  {/* Singapore - Middle */}
                  <div
                    onClick={() => { setSelectedLocation('Singapore'); setShowFlags(false); }}
                    style={{ cursor: 'pointer', textAlign: 'center', position: 'relative', transition: 'transform 0.3s ease' }}
                    className="flag-item"
                  >

                    <img src="/singapore-flag.png" alt="Singapore" style={{ width: '160px', height: '110px', borderRadius: '12px', transition: 'transform 0.3s ease', background: 'transparent', objectFit: 'cover' }} />
                    <p style={{ color: '#fff', marginTop: '14px', fontWeight: '700', fontSize: '1.25rem' }}>Singapore</p>
                  </div>

                  {/* UAE - Right */}
                  <div
                    onClick={() => { setSelectedLocation('UAE'); setShowFlags(false); }}
                    style={{ cursor: 'pointer', textAlign: 'center', position: 'relative', transition: 'transform 0.3s ease' }}
                    className="flag-item"
                  >
                    <span style={{ position: 'absolute', top: '-12px', right: '-25px', background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', color: '#000', padding: '8px 16px', borderRadius: '14px', fontSize: '0.95rem', fontWeight: '700', zIndex: 10 }}>Soon</span>
                    <img src="/uae-flag.webp" alt="UAE" style={{ width: '180px', height: '125px', borderRadius: '12px', transition: 'transform 0.3s ease', background: 'transparent', objectFit: 'cover', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }} />
                    <p style={{ color: '#fff', marginTop: '14px', fontWeight: '700', fontSize: '1.25rem' }}>UAE</p>
                  </div>
                </div>
                <p style={{ marginTop: '40px', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Click anywhere to close</p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="quick-actions-grid" style={{ marginTop: '50px', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
            <div className="quick-action-card">
              <div className="quick-action-icon" style={{ background: 'transparent', border: '2px solid #FF2E00' }}>
                <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#FF2E00" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h4>99.9% Uptime</h4>
              <p>Guaranteed server availability</p>
            </div>

            <div className="quick-action-card">
              <div className="quick-action-icon" style={{ background: 'transparent', border: '2px solid #FF2E00' }}>
                <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#FF2E00" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h4>24/7 Support</h4>
              <p>Always here to help you</p>
            </div>

            <div className="quick-action-card">
              <div className="quick-action-icon" style={{ background: 'transparent', border: '2px solid #FF2E00' }}>
                <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#FF2E00" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </div>
              <h4>Global Network</h4>
              <p>Servers worldwide</p>
            </div>

            <a href="https://discord.gg/6XG84R7AKa" target="_blank" rel="noopener noreferrer" className="quick-action-card">
              <div className="quick-action-icon" style={{ background: 'transparent', border: '2px solid #FF2E00' }}>
                <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#FF2E00" strokeWidth="1.5">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                </svg>
              </div>
              <h4>{discordMembers} Members</h4>
              <p>Join our community</p>
            </a>
          </div>

          {/* Why Choose Section */}
          <div className="card" style={{ marginBottom: '40px', position: 'relative', zIndex: 1 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><img src="/logo.png" alt="" style={{ width: '28px', height: '28px' }} /> Why Choose Ruby Cloud?</h3>
            <div className="features-mini-grid">
              <div className="feature-mini">
                <span className="feature-mini-icon" style={{ background: 'transparent', border: '2px solid #FF2E00' }}>
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#FF2E00" strokeWidth="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                </span>
                <div>
                  <h5>Instant Setup</h5>
                  <p>Server ready in minutes</p>
                </div>
              </div>
              <div className="feature-mini">
                <span className="feature-mini-icon" style={{ background: 'transparent', border: '2px solid #FF2E00' }}>
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#FF2E00" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                </span>
                <div>
                  <h5>DDoS Protection</h5>
                  <p>Enterprise-grade security</p>
                </div>
              </div>
              <div className="feature-mini">
                <span className="feature-mini-icon" style={{ background: 'transparent', border: '2px solid #FF2E00' }}>
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#FF2E00" strokeWidth="1.5"><rect x="4" y="4" width="16" height="16" rx="2" /><line x1="4" y1="10" x2="20" y2="10" /></svg>
                </span>
                <div>
                  <h5>NVMe Storage</h5>
                  <p>Lightning fast SSDs</p>
                </div>
              </div>
              <div className="feature-mini">
                <span className="feature-mini-icon" style={{ background: 'transparent', border: '2px solid #FF2E00' }}>
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#FF2E00" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                </span>
                <div>
                  <h5>UAE Servers</h5>
                  <p>Low latency gaming</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plans Grid - Only show when location is selected */}
      {selectedLocation && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <button className="btn btn-secondary" onClick={() => setSelectedLocation(null)}>
              ← Back to Locations
            </button>
            <span style={{ marginLeft: '15px', color: 'var(--text-primary)', fontWeight: '600' }}>
              {selectedLocation === 'UAE' && '🇦🇪'}
              {selectedLocation === 'Germany' && '🇩🇪'}
              {selectedLocation === 'Singapore' && '🇸🇬'}
              {' '}{selectedLocation} Servers
            </span>
          </div>

          {!isLocationAvailable(selectedLocation) ? (
            <>
              {plans.filter(p => p.location === selectedLocation).length === 0 ? (
                <div className="coming-soon-container">
                  <div className="coming-soon-content">
                    <div className="coming-soon-icon">🚀</div>
                    <h2>Coming Soon!</h2>
                    <p>{selectedLocation} servers are under development.</p>
                    <p>We're working hard to bring you the best gaming experience!</p>
                    <button className="btn btn-primary" onClick={() => setSelectedLocation(null)} style={{ marginTop: '20px' }}>
                      ← Check Other Locations
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ background: 'rgba(255, 106, 0, 0.1)', border: '1px solid rgba(255, 106, 0, 0.3)', borderRadius: '12px', padding: '12px 20px', marginBottom: '20px', textAlign: 'center' }}>
                    <span style={{ color: 'var(--warning)', fontWeight: '600' }}>⚠️ {selectedLocation} servers coming soon - Plans shown for preview only</span>
                  </div>
                  <div className="plans-grid">
                    {plans.filter(p => p.location === selectedLocation).map(plan => {
                      const style = getRankStyle(plan.name);
                      return (
                        <div key={plan.id} className="plan-card" onClick={() => handlePlanClick(plan)} style={{ cursor: 'pointer', opacity: 0.85 }}>
                          <h3 style={{ background: style.bg, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {getPlanIcon(plan.name) && <img src={getPlanIcon(plan.name)} alt="" className="plan-icon" />}
                            {plan.name}
                          </h3>
                          <div className="spec">
                            <span className="spec-label"><span className="spec-emoji ram-emoji">💾</span> RAM</span>
                            <span className="spec-value">{plan.ram}</span>
                          </div>
                          <div className="spec">
                            <span className="spec-label"><span className="spec-emoji cpu-emoji">⚙️</span> CPU</span>
                            <span className="spec-value">{plan.cpu}</span>
                          </div>
                          <div className="spec">
                            <span className="spec-label"><span className="spec-emoji storage-emoji">💿</span> Storage</span>
                            <span className="spec-value">{plan.storage}</span>
                          </div>
                          <div className="spec">
                            <span className="spec-label"><span className="spec-emoji location-emoji">🌍</span> Location</span>
                            <span className="spec-value">{plan.location}</span>
                          </div>
                          <div className="spec">
                            <span className="spec-label"><span className="spec-emoji ddos-emoji">🛡️</span> DDoS</span>
                            <span className="spec-value">Protected</span>
                          </div>
                          <div className="price">{plan.price}</div>
                          <button className="btn btn-secondary" style={{ width: '100%', marginTop: '20px' }}>
                            🚀 Coming Soon
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <div className="plans-grid">
                {(selectedLocation === 'Singapore' ? plans.filter(p => p.location === 'Singapore') : plans.filter(p => p.location === selectedLocation)).map(plan => {
                  const style = getRankStyle(plan.name);
                  return (
                    <div key={plan.id} className="plan-card" onClick={() => handlePlanClick(plan)} style={{ cursor: 'pointer', position: 'relative' }}>
                      {plan.discount > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: '15px',
                          right: '15px',
                          background: 'linear-gradient(135deg, #00C853, #00E676, #69F0AE)',
                          color: '#000',
                          padding: '8px 14px',
                          borderRadius: '20px',
                          fontWeight: '800',
                          fontSize: '0.9rem',
                          boxShadow: '0 4px 15px rgba(0, 200, 83, 0.5)',
                          zIndex: 10
                        }}>
                          {plan.discount}% OFF
                        </div>
                      )}
                      <h3 style={{ background: style.bg, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {getPlanIcon(plan.name) ? (
                          <img
                            src={getPlanIcon(plan.name)}
                            alt=""
                            className="plan-icon"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            style={plan.name.toLowerCase().includes('black ruby') ? {
                              filter: 'drop-shadow(0 0 15px #ff0040) drop-shadow(0 0 30px #ff0040) drop-shadow(0 0 45px #8b0000)',
                              animation: 'blackRubyGlow 2s ease-in-out infinite alternate',
                              width: '42px',
                              height: '42px'
                            } : {}}
                          />
                        ) : (
                          <span style={{ fontSize: '1.4rem', WebkitTextFillColor: 'initial' }}>{getPlanEmoji(plan.name)}</span>
                        )}
                        {plan.name}
                      </h3>
                      <div className="spec">
                        <span className="spec-label"><span className="spec-emoji ram-emoji">💾</span> NVMe RAM</span>
                        <span className="spec-value">{plan.ram}</span>
                      </div>
                      <div className="spec">
                        <span className="spec-label"><span className="spec-emoji cpu-emoji">💎</span> Ryzen 9 CPU</span>
                        <span className="spec-value">{plan.cpu}</span>
                      </div>
                      <div className="spec">
                        <span className="spec-label"><span className="spec-emoji storage-emoji">🚀</span> Gen4 SSD</span>
                        <span className="spec-value">{plan.storage}</span>
                      </div>
                      <div className="spec">
                        <span className="spec-label"><span className="spec-emoji location-emoji">🌏</span> Node Location</span>
                        <span className="spec-value">{plan.location}</span>
                      </div>
                      <div className="spec">
                        <span className="spec-label"><span className="spec-emoji ddos-emoji">🛡️</span> DDoS</span>
                        <span className="spec-value">Protected</span>
                      </div>
                      <div className="price">{plan.price}</div>
                      <button className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }}>
                        🛒 Order Now
                      </button>
                    </div>
                  );
                })}

              </div>

              {/* Flame Custom Plan Card - Before Premium Plans Include */}
              <div style={{ marginTop: '30px', marginBottom: '30px' }}>
                <p className="custom-alert">
                  ⚠️ Alert: If you want to make custom plan, the price will be higher than normal plans
                </p>
                <div
                  className="plan-card"
                  style={{
                    position: 'relative',
                    background: 'linear-gradient(165deg, rgba(255, 46, 0, 0.15), rgba(255, 106, 0, 0.1), rgba(26, 26, 46, 0.95))',
                    border: '2px solid rgba(255, 106, 0, 0.5)',
                    width: '100%',
                    maxWidth: '100%',
                    padding: '25px 30px'
                  }}
                >
                  <h3 className="custom-plan-header" style={{ background: 'linear-gradient(135deg, #FF2E00, #FF6A00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    <img src="/logo.png" alt="" style={{ width: '28px', height: '28px' }} />
                    Custom Ruby Plan
                    <span>- Create your own Ruby Plan</span>
                  </h3>
                  <div className="custom-plan-grid">
                    {/* RAM Input */}
                    <div className="custom-input-card">
                      <span style={{ background: 'transparent', border: '2px solid #FF2E00', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#FF2E00" strokeWidth="1.5"><rect x="4" y="4" width="16" height="16" rx="2" /><line x1="4" y1="10" x2="20" y2="10" /></svg>
                      </span>
                      <div style={{ flex: 1 }}>
                        <h5 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.9rem' }}>RAM (GB)</h5>
                        <input
                          type="text"
                          value={customPlan.ram}
                          onClick={(e) => { e.stopPropagation(); if (customPlan.ram === 0) e.target.select(); }}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            setCustomPlan({ ...customPlan, ram: val === '' ? 0 : parseInt(val) });
                          }}
                          onBlur={(e) => {
                            if (customPlan.ram < 1) setCustomPlan({ ...customPlan, ram: 1 });
                          }}
                          style={{
                            width: '80px',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 106, 0, 0.3)',
                            background: 'rgba(0,0,0,0.3)',
                            color: 'var(--primary-light)',
                            fontSize: '1rem',
                            fontWeight: '600',
                            outline: 'none',
                            marginTop: '5px'
                          }}
                        />
                      </div>
                    </div>

                    {/* CPU Input */}
                    <div className="custom-input-card">
                      <span style={{ background: 'transparent', border: '2px solid #FF2E00', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#FF2E00" strokeWidth="1.5"><rect x="4" y="4" width="16" height="16" rx="2" /><circle cx="12" cy="12" r="3" /></svg>
                      </span>
                      <div style={{ flex: 1 }}>
                        <h5 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.9rem' }}>CPU (%)</h5>
                        <input
                          type="text"
                          value={customPlan.cpu}
                          onClick={(e) => { e.stopPropagation(); if (customPlan.cpu === 0) e.target.select(); }}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            setCustomPlan({ ...customPlan, cpu: val === '' ? 0 : parseInt(val) });
                          }}
                          onBlur={(e) => {
                            if (customPlan.cpu < 50) setCustomPlan({ ...customPlan, cpu: 50 });
                          }}
                          style={{
                            width: '80px',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 106, 0, 0.3)',
                            background: 'rgba(0,0,0,0.3)',
                            color: 'var(--primary-light)',
                            fontSize: '1rem',
                            fontWeight: '600',
                            outline: 'none',
                            marginTop: '5px'
                          }}
                        />
                      </div>
                    </div>

                    {/* SSD Input */}
                    <div className="custom-input-card">
                      <span style={{ background: 'transparent', border: '2px solid #FF2E00', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#FF2E00" strokeWidth="1.5"><rect x="4" y="4" width="16" height="16" rx="2" /><line x1="4" y1="10" x2="20" y2="10" /></svg>
                      </span>
                      <div style={{ flex: 1 }}>
                        <h5 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.9rem' }}>SSD (GB)</h5>
                        <input
                          type="text"
                          value={customPlan.ssd}
                          onClick={(e) => { e.stopPropagation(); if (customPlan.ssd === 0) e.target.select(); }}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            setCustomPlan({ ...customPlan, ssd: val === '' ? 0 : parseInt(val) });
                          }}
                          onBlur={(e) => {
                            if (customPlan.ssd < 5) setCustomPlan({ ...customPlan, ssd: 5 });
                          }}
                          style={{
                            width: '80px',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 106, 0, 0.3)',
                            background: 'rgba(0,0,0,0.3)',
                            color: 'var(--primary-light)',
                            fontSize: '1rem',
                            fontWeight: '600',
                            outline: 'none',
                            marginTop: '5px'
                          }}
                        />
                      </div>
                    </div>

                    {/* Order Button with Price */}
                    <div
                      className="custom-order-btn-group"
                      onClick={() => {
                        window.open(DISCORD_ORDER_LINK, '_blank', 'noopener,noreferrer');
                      }}
                    >
                      <span style={{ background: 'linear-gradient(135deg, #FF2E00, #FF6A00)', border: 'none', borderRadius: '14px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" /></svg>
                      </span>
                      <div>
                        <h5 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '700' }}>Order Now</h5>
                        <p style={{ margin: '5px 0 0 0', color: 'var(--success)', fontWeight: '800', fontSize: '1.4rem' }}>{calculateCustomPrice()} PKR</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="extra-info">
                <h4>✨ All Premium Plans Include</h4>
                <ul>
                  <li>24/7 Expert Support via Discord & Tickets</li>
                  <li>AMD Ryzen 9 Processors for Maximum Performance</li>
                  <li>Enterprise DDoS Protection</li>
                  <li>Instant Server Setup after Payment Verification</li>
                  <li>Full FTP & SFTP Access</li>
                  <li>Automatic Backups</li>
                </ul>
              </div>
            </>
          )}
        </>
      )}

      {/* Order Modal */}
      {showModal && selectedPlan && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <h3>🛒 Order {selectedPlan.name}</h3>

            {success ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✅</div>
                <p style={{ color: 'var(--success)', fontSize: '1.1rem' }}>{success}</p>
                <button className="btn btn-primary" style={{ marginTop: '24px' }} onClick={() => setShowModal(false)}>
                  Close
                </button>
              </div>
            ) : (
              <>
                <div style={{ background: 'linear-gradient(135deg, rgba(255, 106, 0, 0.1), rgba(255, 46, 0, 0.05))', padding: '20px', borderRadius: '16px', marginBottom: '24px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Plan:</span>
                    <span style={{ color: 'var(--primary-light)', fontWeight: '700' }}>{selectedPlan.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>RAM / CPU:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{selectedPlan.ram} / {selectedPlan.cpu}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Price:</span>
                    <span style={{ color: 'var(--success)', fontWeight: '800', fontSize: '1.2rem' }}>{selectedPlan.price}</span>
                  </div>
                </div>

                {/* Payment Method Selection */}
                {!selectedPaymentMethod ? (
                  <div style={{ marginBottom: '24px' }}>
                    <p style={{ color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '20px', textAlign: 'center' }}>
                      💳 Select Payment Method
                    </p>

                    {/* UBL Bank - Top with Green Gradient */}
                    <div style={{ marginBottom: '20px' }}>
                      <button
                        className="payment-btn ubl"
                        onClick={() => setSelectedPaymentMethod('UBLBank')}
                        style={{
                          width: '100%',
                          padding: '24px 32px',
                          background: 'linear-gradient(135deg, #00C853, #00E676, #69F0AE)',
                          border: 'none',
                          borderRadius: '20px',
                          color: '#000',
                          fontSize: '1.2rem',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          boxShadow: '0 8px 25px rgba(0, 200, 83, 0.5)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src="/bankislami.png" alt="Bank Transfer" style={{ width: '80px', height: '36px', objectFit: 'contain', background: '#fff', borderRadius: '6px', padding: '2px 6px' }} />
                          <span>Bank Transfer</span>
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: '600', opacity: 0.8 }}>All Pakistan Bank Transfers Available</span>
                      </button>
                    </div>

                    {/* Row 1 - Mobile Wallets */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
                      <button
                        className="payment-btn nayapay"
                        onClick={() => setSelectedPaymentMethod('NayaPaisa')}
                        style={{
                          width: '100%',
                          padding: '16px 24px',
                          background: 'linear-gradient(135deg, #FF6A00, #FF8C00, #FFA500)',
                          border: 'none',
                          borderRadius: '50px',
                          color: '#fff',
                          fontSize: '1rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '12px',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          boxShadow: '0 4px 15px rgba(255, 106, 0, 0.4)'
                        }}
                      >
                        <img src="/nayapay.png" alt="NayaPay" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                        NayaPay
                      </button>

                      <button
                        className="payment-btn sadapay"
                        onClick={() => setSelectedPaymentMethod('SadaPaisa')}
                        style={{
                          width: '100%',
                          padding: '16px 24px',
                          background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                          border: 'none',
                          borderRadius: '50px',
                          color: '#fff',
                          fontSize: '1rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '12px',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
                        }}
                      >
                        <img src="/sadapay.png" alt="SadaPay" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                        SadaPay
                      </button>

                      <button
                        className="payment-btn easypaisa"
                        onClick={() => setSelectedPaymentMethod('EasyPaisa')}
                        style={{
                          width: '100%',
                          padding: '16px 24px',
                          background: 'linear-gradient(135deg, #00c853, #009624)',
                          border: 'none',
                          borderRadius: '50px',
                          color: '#fff',
                          fontSize: '1rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '12px',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          boxShadow: '0 4px 15px rgba(0, 200, 83, 0.4)'
                        }}
                      >
                        <img src="/easypaisa.png" alt="EasyPaisa" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                        EasyPaisa
                      </button>
                    </div>

                    {/* Row 2 - Banks */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <a
                        className="payment-btn other"
                        href="https://discord.gg/6XG84R7AKa"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          width: '100%',
                          padding: '16px 24px',
                          background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                          border: 'none',
                          borderRadius: '50px',
                          color: '#1a1a2e',
                          fontSize: '1rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '12px',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          boxShadow: '0 4px 15px rgba(251, 191, 36, 0.4)',
                          textDecoration: 'none'
                        }}
                      >
                        <span style={{ fontSize: '1.5rem' }}>💬</span>
                        Other Payments
                      </a>
                    </div>

                    <div className="modal-actions" style={{ marginTop: '24px' }}>
                      <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setSelectedPaymentMethod(null)}
                      style={{
                        background: 'linear-gradient(135deg, #FF2E00 0%, #FF6A00 50%, #FF2E00 100%)',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        marginBottom: '16px',
                        fontSize: '0.95rem',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        fontWeight: '700',
                        boxShadow: '0 4px 20px rgba(255, 70, 0, 0.4)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.boxShadow = '0 8px 35px rgba(255, 70, 0, 0.7), 0 0 20px rgba(255, 106, 0, 0.5)'}
                      onMouseLeave={(e) => e.target.style.boxShadow = '0 4px 20px rgba(255, 70, 0, 0.4)'}
                    >
                      ← Change Payment Method
                    </button>

                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                      <p style={{ color: 'var(--warning)', fontWeight: '700', fontSize: '1rem', marginBottom: '16px', background: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                        ⚠️ MUST TAKE SCREENSHOT AFTER PAYMENT
                      </p>

                      {selectedPaymentMethod === 'EasyPaisa' && (
                        <>
                          <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', display: 'inline-block', marginBottom: '16px' }}>
                            <img src="/qr-code.png" alt="Payment QR Code" style={{ width: '200px', height: 'auto' }} />
                          </div>
                          <p style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1.1rem', marginBottom: '4px' }}>
                            ADEEL MUBARIK
                          </p>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            EasyPaisa Account
                          </p>
                        </>
                      )}

                      {selectedPaymentMethod === 'SadaPaisa' && (
                        <>
                          <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '24px', borderRadius: '16px', marginBottom: '16px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                            <img src="/sadapay.png" alt="SadaPay" style={{ width: '60px', height: '60px', marginBottom: '16px', objectFit: 'contain' }} />
                            <p style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1.3rem', marginBottom: '12px' }}>
                              03241401310
                            </p>
                            <p style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '1rem' }}>
                              Adeel Mubarik
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '8px' }}>
                              SadaPay Account
                            </p>
                          </div>
                        </>
                      )}

                      {selectedPaymentMethod === 'NayaPaisa' && (
                        <>
                          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '24px', borderRadius: '16px', marginBottom: '16px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                            <img src="/nayapay.png" alt="NayaPay" style={{ width: '60px', height: '60px', marginBottom: '16px', objectFit: 'contain' }} />
                            <p style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1.3rem', marginBottom: '12px' }}>
                              03241401310
                            </p>
                            <p style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '1rem' }}>
                              Adeel Mubarik
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '8px' }}>
                              NayaPay Account
                            </p>
                          </div>
                        </>
                      )}

                      {selectedPaymentMethod === 'UBLBank' && (
                        <>
                          <div style={{ background: 'linear-gradient(135deg, rgba(0, 200, 83, 0.15), rgba(0, 230, 118, 0.1))', padding: '28px', borderRadius: '20px', marginBottom: '16px', border: '2px solid rgba(0, 200, 83, 0.4)' }}>
                            <p style={{ color: '#00E676', fontSize: '1rem', marginBottom: '20px', fontWeight: '700' }}>
                              🏦 All Pakistan Bank Transfers Available
                            </p>

                            {/* Scan QR Code Button */}
                            <button
                              onClick={() => setShowQRModal(true)}
                              style={{
                                width: '100%',
                                padding: '16px 24px',
                                background: 'linear-gradient(135deg, #FF2E00, #FF6A00, #FFD000)',
                                border: 'none',
                                borderRadius: '14px',
                                color: '#fff',
                                fontSize: '1.1rem',
                                fontWeight: '800',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                marginBottom: '20px',
                                boxShadow: '0 6px 25px rgba(255, 70, 0, 0.5)',
                                transition: 'all 0.3s ease'
                              }}
                              onMouseEnter={(e) => e.target.style.boxShadow = '0 10px 40px rgba(255, 70, 0, 0.7)'}
                              onMouseLeave={(e) => e.target.style.boxShadow = '0 6px 25px rgba(255, 70, 0, 0.5)'}
                            >
                              📱 Scan QR Code
                            </button>

                            <p style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1.3rem', marginBottom: '8px' }}>
                              Adeel Mubarik - 5186
                            </p>
                            <p style={{ color: '#00E676', fontSize: '0.95rem', marginTop: '12px', fontWeight: '600' }}>
                              UBL Digital Account
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', marginBottom: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                        📸 Upload Payment Screenshot
                      </label>

                      <div
                        style={{
                          border: '2px dashed var(--glass-border)',
                          borderRadius: '16px',
                          padding: '30px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          background: screenshotPreview ? 'transparent' : 'rgba(255, 106, 0, 0.05)'
                        }}
                        onClick={() => document.getElementById('screenshot-input').click()}
                      >
                        {screenshotPreview ? (
                          <img src={screenshotPreview} alt="Screenshot Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '12px' }} />
                        ) : (
                          <>
                            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📤</div>
                            <p style={{ color: 'var(--text-muted)' }}>Click to upload screenshot</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '8px' }}>PNG, JPG up to 5MB</p>
                          </>
                        )}
                      </div>

                      <input type="file" id="screenshot-input" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                    </div>

                    <div className="modal-actions">
                      <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                      <button className="btn btn-success" onClick={handleSubmit} disabled={!screenshot || loading}>
                        {loading ? '⏳ Submitting...' : '✅ Submit Order'}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Coming Soon Modal for Germany/Singapore */}
      {showComingSoonModal && selectedPlan && (
        <div className="modal-overlay" onClick={() => setShowComingSoonModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px', textAlign: 'center' }}>
            <div style={{ fontSize: '5rem', marginBottom: '20px', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '3px solid #FF2E00', borderRadius: '20px', boxShadow: '0 0 20px rgba(255, 46, 0, 0.4)', margin: '0 auto 20px' }}>🚀</div>
            <h2 style={{ background: 'linear-gradient(135deg, #FF6A00, #FFD000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '16px' }}>Coming Soon!</h2>

            <div style={{ background: 'linear-gradient(135deg, rgba(255, 106, 0, 0.1), rgba(255, 46, 0, 0.05))', padding: '20px', borderRadius: '16px', marginBottom: '24px', border: '1px solid var(--glass-border)' }}>
              <p style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1.2rem', marginBottom: '8px' }}>{selectedPlan.name}</p>
              <p style={{ color: 'var(--text-muted)' }}>{selectedPlan.ram} RAM • {selectedPlan.cpu} CPU</p>
              <p style={{ color: 'var(--success)', fontWeight: '700', fontSize: '1.1rem', marginTop: '8px' }}>{selectedPlan.price}</p>
            </div>

            <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>{selectedPlan.location} servers are under development.</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>We'll notify you when this location becomes available!</p>

            <div className="modal-actions" style={{ justifyContent: 'center', marginTop: '24px' }}>
              <button className="btn btn-secondary" onClick={() => setShowComingSoonModal(false)}>Close</button>
              <button className="btn btn-primary" onClick={() => { setShowComingSoonModal(false); setSelectedLocation('UAE'); }}>
                Check UAE Plans
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Plan Modal */}
      {showCustomModal && (
        <div className="modal-overlay" onClick={() => setShowCustomModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <h3 style={{ background: 'linear-gradient(135deg, #FF2E00, #FF6A00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>🔥</span> Flame Custom Plan
            </h3>

            <div style={{ background: 'linear-gradient(135deg, rgba(255, 46, 0, 0.1), rgba(255, 106, 0, 0.05))', padding: '24px', borderRadius: '16px', marginBottom: '24px', border: '1px solid rgba(255, 106, 0, 0.3)' }}>

              {/* RAM Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: 'var(--text-secondary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span>🔲</span> RAM (GB)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={customPlan.ram}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setCustomPlan({ ...customPlan, ram: Math.max(1, Math.floor(val)) });
                    }}
                    style={{
                      flex: 1,
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '2px solid rgba(255, 106, 0, 0.3)',
                      background: 'rgba(0,0,0,0.3)',
                      color: 'var(--primary-light)',
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      outline: 'none'
                    }}
                  />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', minWidth: '80px' }}>× {RAM_PRICE} PKR</span>
                  <span style={{ color: 'var(--success)', fontWeight: '700', minWidth: '90px' }}>= {customPlan.ram * RAM_PRICE} PKR</span>
                </div>
              </div>

              {/* CPU Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: 'var(--text-secondary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span>🔳</span> CPU (%)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={customPlan.cpu}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setCustomPlan({ ...customPlan, cpu: Math.max(1, Math.floor(val)) });
                    }}
                    style={{
                      flex: 1,
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '2px solid rgba(255, 106, 0, 0.3)',
                      background: 'rgba(0,0,0,0.3)',
                      color: 'var(--primary-light)',
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      outline: 'none'
                    }}
                  />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', minWidth: '80px' }}>× {CPU_PRICE} PKR</span>
                  <span style={{ color: 'var(--success)', fontWeight: '700', minWidth: '90px' }}>= {Math.round(customPlan.cpu * CPU_PRICE)} PKR</span>
                </div>
              </div>

              {/* SSD Input */}
              <div>
                <label style={{ color: 'var(--text-secondary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span>💾</span> SSD Storage (GB)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={customPlan.ssd}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setCustomPlan({ ...customPlan, ssd: Math.max(1, Math.floor(val)) });
                    }}
                    style={{
                      flex: 1,
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '2px solid rgba(255, 106, 0, 0.3)',
                      background: 'rgba(0,0,0,0.3)',
                      color: 'var(--primary-light)',
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      outline: 'none'
                    }}
                  />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', minWidth: '80px' }}>× {SSD_PRICE} PKR</span>
                  <span style={{ color: 'var(--success)', fontWeight: '700', minWidth: '90px' }}>= {customPlan.ssd * SSD_PRICE} PKR</span>
                </div>
              </div>
            </div>

            {/* Total Price */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 200, 83, 0.15), rgba(0, 230, 118, 0.1))',
              padding: '20px',
              borderRadius: '16px',
              marginBottom: '24px',
              border: '2px solid rgba(0, 200, 83, 0.4)',
              textAlign: 'center'
            }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Total Monthly Price</p>
              <p style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #00C853, #00E676)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {calculateCustomPrice()} PKR
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '8px' }}>
                {customPlan.ram} GB RAM + {customPlan.cpu}% CPU + {customPlan.ssd} GB SSD
              </p>
            </div>

            {/* Summary */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: '0.95rem' }}>📋 Your Custom Plan</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>RAM:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{customPlan.ram} GB</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>CPU:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{customPlan.cpu}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Storage:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{customPlan.ssd} GB SSD</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Location:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{selectedLocation}</span>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowCustomModal(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                style={{ background: 'linear-gradient(135deg, #FF2E00, #FF6A00)' }}
                onClick={() => {
                  setShowCustomModal(false);
                  setSelectedPlan({
                    name: 'Flame Custom Plan',
                    ram: `${customPlan.ram} GB`,
                    cpu: `${customPlan.cpu}%`,
                    storage: `${customPlan.ssd} GB SSD`,
                    price: `${calculateCustomPrice()} PKR/month`,
                    location: selectedLocation
                  });
                  setShowModal(true);
                }}
              >
                🛒 Order Custom Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Full Screen Modal */}
      {showQRModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowQRModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            backdropFilter: 'blur(10px)'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(165deg, rgba(20, 12, 8, 0.98), rgba(30, 18, 10, 0.95))',
              padding: '40px',
              borderRadius: '30px',
              textAlign: 'center',
              border: '2px solid rgba(255, 106, 0, 0.4)',
              boxShadow: '0 0 60px rgba(255, 70, 0, 0.3)',
              maxWidth: '90vw'
            }}
          >
            <h3 style={{
              color: '#fff',
              fontSize: '1.5rem',
              marginBottom: '24px',
              background: 'linear-gradient(135deg, #FF2E00, #FF6A00, #FFD000)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              📱 Scan QR Code to Pay
            </h3>

            <div style={{
              background: '#fff',
              padding: '30px',
              borderRadius: '24px',
              display: 'inline-block',
              marginBottom: '24px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
            }}>
              <img
                src="/ubl-qr.png"
                alt="QR Code"
                style={{
                  width: '280px',
                  height: '280px',
                  objectFit: 'contain'
                }}
              />
            </div>

            <p style={{ color: '#fff', fontWeight: '700', fontSize: '1.4rem', marginBottom: '8px' }}>
              Adeel Mubarik - 5186
            </p>
            <p style={{ color: '#00E676', fontSize: '1rem', fontWeight: '600', marginBottom: '24px' }}>
              UBL Digital Account
            </p>

            <button
              onClick={() => setShowQRModal(false)}
              style={{
                padding: '14px 40px',
                background: 'linear-gradient(135deg, #FF2E00, #FF6A00)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(255, 70, 0, 0.5)'
              }}
            >
              ✕ Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaidPlans;
