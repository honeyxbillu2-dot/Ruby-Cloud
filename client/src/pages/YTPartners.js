import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

const YTPartners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const { data, error } = await api
        .from('yt_partners')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      const normalized = (data || []).map(p => ({
        id: p.id,
        name: p.name,
        logo: p.logo,
        channel_url: p.channel_link || '#',
        description: p.description || '',
        isFeatured: p.is_featured || false
      }));
      setPartners(normalized);
    } catch (err) {
      console.error('Error fetching partners:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p>Loading partners...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>🎬 YouTube Partners</h2>
        <p>Join our community of content creators</p>
      </div>

      {partners.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🎥</div>
          <h3>No Partners Yet</h3>
          <p>Check back soon for featured YouTube partners!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <div style={{ width: 420 }}>
            {partners.map(partner => (
              <a key={partner.id} href={partner.channel_url} target="_blank" rel="noopener noreferrer" className="partner-card" style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '16px 18px', borderRadius: 16, border: '1px solid rgba(255,106,0,0.12)', marginBottom: 14, textDecoration: 'none', color: 'inherit', background: 'rgba(0,0,0,0.04)', transition: 'all 0.3s ease', position: 'relative' }}>
                {/* Featured Star Badge */}
                {partner.isFeatured && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.1))',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 215, 0, 0.4)',
                    animation: 'starPulse 2s ease-in-out infinite'
                  }}>
                    <span style={{ fontSize: '0.85rem' }}>⭐</span>
                    <span style={{
                      color: '#FFD700',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      textShadow: '0 0 10px rgba(255, 215, 0, 0.6)'
                    }}>Star</span>
                  </div>
                )}
                <div className="partner-image-container" style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', flex: '0 0 80px', transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(255, 106, 0, 0.2)' }}>
                  {partner.logo ? <img src={partner.logo} alt={partner.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: 'rgba(0,0,0,0.15)' }} />}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.05rem' }}>{partner.name}</div>
                  {partner.description ? (
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: 8, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{partner.description}</div>
                  ) : null}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Partner invitation removed as requested */}
    </div>
  );
};

export default YTPartners;
