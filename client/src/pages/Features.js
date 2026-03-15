import React, { useState } from 'react';

// SVG Icon Components with red outline style
const RocketIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF2E00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF2E00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <rect x="9" y="9" width="6" height="7" rx="1" />
    <circle cx="12" cy="11" r="1" fill="#FF2E00" />
    <line x1="12" y1="12" x2="12" y2="14" />
  </svg>
);

const LightningIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF2E00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF2E00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    <circle cx="12" cy="12" r="2" fill="#FF2E00" />
  </svg>
);

const ClockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF2E00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ChatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF2E00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <line x1="8" y1="9" x2="16" y2="9" />
    <line x1="8" y1="13" x2="14" y2="13" />
  </svg>
);

const GearIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF2E00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const SSDIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF2E00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="8" width="16" height="8" rx="2" />
    <line x1="8" y1="12" x2="8" y2="12" />
    <line x1="12" y1="12" x2="12" y2="12" />
    <line x1="16" y1="12" x2="16" y2="12" />
    <circle cx="8" cy="12" r="1" fill="#FF2E00" />
    <circle cx="12" cy="12" r="1" fill="#FF2E00" />
    <circle cx="16" cy="12" r="1" fill="#FF2E00" />
  </svg>
);

const ChartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF2E00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const WrenchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF2E00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const SignalIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF2E00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20h.01" />
    <path d="M7 20v-4" />
    <path d="M12 20v-8" />
    <path d="M17 20V8" />
    <path d="M22 4v16" />
  </svg>
);

const StarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF2E00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// Icon box style
const iconBoxStyle = {
  width: '40px',
  height: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: '2px solid #FF2E00',
  borderRadius: '10px',
  boxShadow: '0 0 12px rgba(255, 46, 0, 0.4)'
};

const Features = () => {
  return (
    <div className="features-container">
      {/* Hero Title Section */}
      <h1 className="features-hero-title">
        <span className="title-white">RUBY</span>
        <span className="title-cyan">FEATURES</span>
      </h1>
      <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '40px' }}>
        Everything you need for the perfect Minecraft server experience
      </p>

      {/* Main Feature Layout */}
      <div className="features-main-layout">
        {/* Left: Floating Console and Icons */}
        <div className="floating-console-wrapper">
          <div className="console-card">
            <div className="console-header">RUBY CLOUD</div>

            <div className="console-line">
              <div className="dot dot-green"></div>
              <div className="line-bars"></div>
            </div>
            <div className="console-line">
              <div className="dot dot-blue"></div>
              <div className="line-bars"></div>
            </div>
            <div className="console-line">
              <div className="dot dot-orange"></div>
              <div className="line-bars"></div>
            </div>
            <div className="console-line">
              <div className="dot dot-green"></div>
              <div className="line-bars"></div>
            </div>
          </div>

          {/* Floating Icons Around the card */}
          <div className="floating-icon icon-cpu" style={iconBoxStyle}><GearIcon /></div>
          <div className="floating-icon icon-shield" style={iconBoxStyle}><ShieldIcon /></div>
          <div className="floating-icon icon-ssd" style={iconBoxStyle}><SSDIcon /></div>
        </div>

        {/* Right: Feature Cards Grid */}
        <div className="futuristic-cards-grid">
          <div className="futuristic-card">
            <div className="card-icon-container" style={iconBoxStyle}><RocketIcon /></div>
            <div className="card-content">
              <h4>AMD RYZEN POWERED</h4>
              <span className="highlight">Premium Performance</span>
            </div>
          </div>

          <div className="futuristic-card">
            <div className="card-icon-container" style={iconBoxStyle}><ShieldIcon /></div>
            <div className="card-content">
              <h4>DDOS PROTECTION</h4>
              <span className="highlight">Online, Always</span>
            </div>
          </div>

          <div className="futuristic-card">
            <div className="card-icon-container" style={iconBoxStyle}><LightningIcon /></div>
            <div className="card-content">
              <h4>LAG IS NO MORE</h4>
              <span className="highlight">Smooth Gameplay</span>
            </div>
          </div>

          <div className="futuristic-card">
            <div className="card-icon-container" style={iconBoxStyle}><GlobeIcon /></div>
            <div className="card-content">
              <h4>MULTIPLE LOCATIONS</h4>
              <span className="highlight">UAE • India • Germany</span>
            </div>
          </div>

          <div className="futuristic-card">
            <div className="card-icon-container" style={iconBoxStyle}><ClockIcon /></div>
            <div className="card-content">
              <h4>INSTANT SETUP</h4>
              <span className="highlight">60 Seconds</span>
            </div>
          </div>

          <div className="futuristic-card">
            <div className="card-icon-container" style={iconBoxStyle}><ChatIcon /></div>
            <div className="card-content">
              <h4>24/7 SUPPORT</h4>
              <span className="highlight">Always Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-icon-box" style={iconBoxStyle}><ChartIcon /></div>
          <span className="stat-num">99.9%</span>
          <span className="stat-text">Uptime</span>
        </div>
        <div className="stat-item">
          <div className="stat-icon-box" style={iconBoxStyle}><WrenchIcon /></div>
          <span className="stat-num">24/7</span>
          <span className="stat-text">Support</span>
        </div>
        <div className="stat-item">
          <div className="stat-icon-box" style={iconBoxStyle}><SignalIcon /></div>
          <span className="stat-num">&lt;20MS</span>
          <span className="stat-text">Latency</span>
        </div>
        <div className="stat-item">
          <div className="stat-icon-box" style={iconBoxStyle}><StarIcon /></div>
          <span className="stat-num">400+</span>
          <span className="stat-text">Happy Users</span>
        </div>
      </div>
    </div>
  );
};

export default Features;

