import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const req = async (method, path, body) => {
  const token = localStorage.getItem('ruby_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  return res.json();
};

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tickets');
  const [locations, setLocations] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({});
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [newPlanData, setNewPlanData] = useState({ name: '', ram: '', cpu: '', storage: '', price: '', location: 'France', discount: 0 });

  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [partners, setPartners] = useState([]);
  const [screenshotModalSrc, setScreenshotModalSrc] = useState(null);
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (!user.isAdmin) { navigate('/dashboard'); return; }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [locsRes, plansRes, ticketsRes, usersRes, partnersRes] = await Promise.all([
        req('GET', '/locations'),
        req('GET', '/plans'),
        req('GET', '/tickets'),
        req('GET', '/users'),
        req('GET', '/yt-partners')
      ]);
      setLocations(Array.isArray(locsRes) ? locsRes : []);
      setPlans(Array.isArray(plansRes) ? plansRes : []);
      setTickets(Array.isArray(ticketsRes) ? ticketsRes : []);
      setUsers(Array.isArray(usersRes) ? usersRes : []);
      setPartners(Array.isArray(partnersRes) ? partnersRes : []);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationToggle = async (location) => {
    try {
      await req('PUT', `/locations/${location.id}`, { is_available: location.is_available ? 0 : 1 });
      loadData();
    } catch (err) { console.error('Error updating location:', err); }
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan.id);
    setFormData({ ...plan, discount: plan.discount || 0 });
  };

  const handleSavePlan = async () => {
    try {
      await req('PUT', `/plans/${editingPlan}`, formData);
      setEditingPlan(null);
      loadData();
    } catch (err) { console.error('Error saving plan:', err); }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    try {
      await req('DELETE', `/plans/${id}`);
      loadData();
    } catch (err) { console.error('Error deleting plan:', err); }
  };

  const handleAddPlan = async () => {
    if (!newPlanData.name || !newPlanData.ram || !newPlanData.price) {
      alert('Name, RAM, and Price are required!');
      return;
    }
    try {
      await req('POST', '/plans', { ...newPlanData, is_active: 1, sort_order: plans.length + 1 });
      setShowAddPlanModal(false);
      setNewPlanData({ name: '', ram: '', cpu: '', storage: '', price: '', location: 'France', discount: 0 });
      loadData();
    } catch (err) { console.error('Error adding plan:', err); }
  };

  const handleRestoreDefaults = async () => {
    if (!window.confirm('Restore default plans? Ye existing plans delete nahi karega, sirf missing plans add karega.')) return;
    const defaults = [
      { name: 'Dirt Plan', ram: '2 GB', cpu: '50%', storage: '10 GB SSD', location: 'Singapore', price: '200 PKR/month', discount: 0, sort_order: 1, is_active: 1 },
      { name: 'Stone Plan', ram: '4 GB', cpu: '75%', storage: '20 GB SSD', location: 'Singapore', price: '350 PKR/month', discount: 0, sort_order: 2, is_active: 1 },
      { name: 'Iron Plan', ram: '6 GB', cpu: '100%', storage: '30 GB SSD', location: 'Singapore', price: '500 PKR/month', discount: 0, sort_order: 3, is_active: 1 },
      { name: 'Redstone Plan', ram: '8 GB', cpu: '150%', storage: '40 GB SSD', location: 'Singapore', price: '700 PKR/month', discount: 0, sort_order: 4, is_active: 1 },
      { name: 'Gold Plan', ram: '10 GB', cpu: '200%', storage: '50 GB SSD', location: 'Singapore', price: '900 PKR/month', discount: 0, sort_order: 5, is_active: 1 },
      { name: 'Amethyst', ram: '12 GB', cpu: '250%', storage: '60 GB SSD', location: 'Singapore', price: '1100 PKR/month', discount: 0, sort_order: 6, is_active: 1 },
      { name: 'Emerald', ram: '16 GB', cpu: '300%', storage: '80 GB SSD', location: 'Singapore', price: '1400 PKR/month', discount: 0, sort_order: 7, is_active: 1 },
      { name: 'Ruby', ram: '20 GB', cpu: '400%', storage: '100 GB SSD', location: 'Singapore', price: '1800 PKR/month', discount: 0, sort_order: 8, is_active: 1 },
      { name: 'Black Ruby', ram: '32 GB', cpu: '500%', storage: '150 GB SSD', location: 'Singapore', price: '2800 PKR/month', discount: 0, sort_order: 9, is_active: 1 }
    ];
    for (const plan of defaults) {
      const exists = plans.find(p => p.name === plan.name && p.location === plan.location);
      if (!exists) await req('POST', '/plans', plan);
    }
    loadData();
    alert('Default plans restored!');
  };

  const handleUpdateTicket = async (ticketId, updates) => {
    try {
      await req('PUT', `/tickets/${ticketId}`, updates);
      loadData();
    } catch (e) { console.error(e); }
  };

  // YT Partners
  const [editingPartner, setEditingPartner] = useState(null);
  const [partnerForm, setPartnerForm] = useState({ name: '', link: '', logo: '', isFeatured: false });
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [partnerLogoPreview, setPartnerLogoPreview] = useState(null);

  const handleSavePartner = async () => {
    try {
      const payload = { name: partnerForm.name, channel_link: partnerForm.link, logo: partnerForm.logo, is_featured: partnerForm.isFeatured ? 1 : 0, is_active: 1 };
      if (editingPartner !== null) {
        await req('PUT', `/yt-partners/${editingPartner}`, payload);
      } else {
        await req('POST', '/yt-partners', payload);
      }
      setEditingPartner(null);
      setPartnerForm({ name: '', link: '', logo: '', isFeatured: false });
      setShowPartnerModal(false);
      loadData();
    } catch (e) { console.error(e); }
  };

  const handleDeletePartner = async (id) => {
    if (!window.confirm('Delete this partner?')) return;
    try {
      await req('DELETE', `/yt-partners/${id}`);
      loadData();
    } catch (e) { console.error(e); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await req('DELETE', `/users/${id}`);
      loadData();
    } catch (e) { console.error(e); }
  };

  const handleToggleAdmin = async (u) => {
    const newStatus = u.is_admin === 1 ? 0 : 1;
    if (!window.confirm(`Are you sure you want to ${newStatus === 1 ? 'promote' : 'demote'} ${u.username || u.email}?`)) return;
    try {
      await req('PUT', `/users/${u.id}/admin`, { is_admin: newStatus });
      loadData();
      alert(`User ${newStatus === 1 ? 'promoted to' : 'demoted from'} Admin!`);
    } catch (e) { console.error(e); }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px 20px' }}><p>Loading admin panel...</p></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>⚙️ Admin Panel</h2>
        <p>Manage your hosting platform</p>
      </div>

      <div className="admin-tabs">
        <button className={activeTab === 'tickets' ? 'active' : ''} onClick={() => setActiveTab('tickets')}>🎫 Tickets/Orders</button>
        <button className={activeTab === 'plans' ? 'active' : ''} onClick={() => setActiveTab('plans')}>💎 Paid Plans</button>
        <button className={activeTab === 'locations' ? 'active' : ''} onClick={() => setActiveTab('locations')}>🌍 Locations</button>
        <button className={activeTab === 'partners' ? 'active' : ''} onClick={() => setActiveTab('partners')}>▶️ YT Partners</button>
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>👥 Users</button>
      </div>

      {/* LOCATIONS TAB */}
      {activeTab === 'locations' && (
        <div className="card">
          <h3>🌍 Location Settings</h3>
          <div style={{ marginTop: '20px' }}>
            {locations.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No locations found</p>
            ) : (
              locations.map(loc => (
                <div key={loc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,0,64,0.05)', borderRadius: '8px', marginBottom: '12px', border: '1px solid rgba(255,0,64,0.2)' }}>
                  <span style={{ fontWeight: '600' }}>{loc.location}</span>
                  <button
                    className={`btn ${loc.is_available ? 'btn-success' : 'btn-danger'}`}
                    onClick={() => handleLocationToggle(loc)}
                    style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                  >
                    {loc.is_available ? '✓ Available' : '✗ Disabled'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* PLANS TAB */}
      {activeTab === 'plans' && (
        <div className="card">
          <h3>💎 Hosting Plans</h3>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '12px' }}>
            <button className="btn btn-secondary" onClick={handleRestoreDefaults} style={{ padding: '8px 12px' }}>Restore Default Plans</button>
            <button className="btn btn-primary" onClick={() => setShowAddPlanModal(true)} style={{ padding: '8px 12px' }}>+ Add New Plan</button>
          </div>
          <div style={{ marginTop: '20px', overflowX: 'auto' }}>
            {plans.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No plans found</p>
            ) : (
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Plan Name</th>
                    <th>RAM</th>
                    <th>CPU</th>
                    <th>Price</th>
                    <th>Location</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map(plan => (
                    <tr key={plan.id}>
                      <td>{plan.name}</td>
                      <td>{plan.ram}</td>
                      <td>{plan.cpu}</td>
                      <td>{plan.price}</td>
                      <td>{plan.location}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-secondary" onClick={() => handleEditPlan(plan)} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Edit</button>
                          <button className="btn btn-danger" onClick={() => handleDeletePlan(plan.id)} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TICKETS TAB */}
      {activeTab === 'tickets' && (
        <div className="card">
          <h3>🎫 Tickets & Orders</h3>
          <div style={{ marginTop: '16px' }}>
            {tickets.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No tickets found</p>
            ) : (
              tickets.map(t => (
                <div key={t.id} style={{ border: '1px solid rgba(0,0,0,0.06)', padding: '12px', borderRadius: 8, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <strong>{t.subject || 'Ticket'}</strong>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t.user_email || t.user_id}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div>Status: <strong>{t.status || 'open'}</strong></div>
                      <div style={{ marginTop: 8 }}>
                        <select defaultValue={t.status || 'open'} onChange={e => handleUpdateTicket(t.id, { status: e.target.value })}>
                          <option value="pending">pending</option>
                          <option value="open">open</option>
                          <option value="in_progress">in_progress</option>
                          <option value="resolved">resolved</option>
                          <option value="closed">closed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: 10 }}>{t.message}</div>
                  {t.screenshot && (
                    <div style={{ marginTop: 12 }}>
                      <img src={t.screenshot} alt="screenshot" style={{ maxWidth: 220, maxHeight: 140, borderRadius: 8, cursor: 'pointer', border: '1px solid rgba(0,0,0,0.06)' }} onClick={() => { setScreenshotModalSrc(t.screenshot); setShowScreenshotModal(true); }} />
                    </div>
                  )}
                  <div style={{ marginTop: 12 }}>
                    <label style={{ display: 'block', fontSize: '0.9rem' }}>Admin Response</label>
                    <textarea defaultValue={t.admin_response || ''} onBlur={e => handleUpdateTicket(t.id, { admin_response: e.target.value })} style={{ width: '100%', minHeight: 80 }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* PARTNERS TAB */}
      {activeTab === 'partners' && (
        <div className="card">
          <h3>▶️ YouTube Partners</h3>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button className="btn btn-primary" onClick={() => { setEditingPartner(null); setPartnerForm({ name: '', link: '', logo: '', isFeatured: false }); setPartnerLogoPreview(null); setShowPartnerModal(true); }}>+ Add Partner</button>
          </div>
          <div>
            {partners.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No partners yet</p>
            ) : (
              partners.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 8, marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {p.logo && <img src={p.logo} alt={p.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />}
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{p.channel_link}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary" onClick={() => { setEditingPartner(p.id); setPartnerForm({ name: p.name, link: p.channel_link, logo: p.logo, isFeatured: !!p.is_featured }); setPartnerLogoPreview(p.logo); setShowPartnerModal(true); }}>Edit</button>
                    <button className="btn btn-danger" onClick={() => handleDeletePartner(p.id)}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="card">
          <h3>👥 Users Management</h3>
          <div style={{ marginTop: 12 }}>
            {users.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No users found</p>
            ) : (
              users.map(u => (
                <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', border: '1px solid rgba(255,0,64,0.1)', background: 'rgba(255,0,64,0.03)', borderRadius: 8, marginBottom: 10, alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{u.email}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      {u.username} • <span style={{ color: u.is_admin ? 'var(--primary)' : 'inherit', fontWeight: u.is_admin ? 'bold' : 'normal' }}>{u.is_admin ? 'ADMIN' : 'Standard User'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className={`btn ${u.is_admin ? 'btn-secondary' : 'btn-success'}`} onClick={() => handleToggleAdmin(u)} style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                      {u.is_admin ? 'Remove Admin' : 'Make Admin'}
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDeleteUser(u.id)} style={{ padding: '6px 14px', fontSize: '0.85rem' }}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* EDIT PLAN MODAL */}
      {editingPlan && (
        <div className="modal-overlay" onClick={() => setEditingPlan(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Edit Plan</h3>
            {['name', 'ram', 'cpu', 'storage', 'price'].map(field => (
              <div className="form-group" key={field}>
                <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                <input type="text" value={formData[field] || ''} onChange={e => setFormData({ ...formData, [field]: e.target.value })} />
              </div>
            ))}
            <div className="form-group">
              <label>Location</label>
              <select value={formData.location || ''} onChange={e => setFormData({ ...formData, location: e.target.value })}>
                <option value="France">France</option>
                <option value="Singapore">Singapore</option>
                <option value="UAE">UAE</option>
              </select>
            </div>
            <div className="form-group">
              <label>Discount (%)</label>
              <input type="number" value={formData.discount || 0} onChange={e => setFormData({ ...formData, discount: Number(e.target.value) })} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setEditingPlan(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSavePlan}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD PLAN MODAL */}
      {showAddPlanModal && (
        <div className="modal-overlay" onClick={() => setShowAddPlanModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>➕ Add New Plan</h3>
            {['name', 'ram', 'cpu', 'storage', 'price'].map(field => (
              <div className="form-group" key={field}>
                <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                <input type="text" placeholder={field === 'ram' ? 'e.g. 4 GB' : field === 'price' ? 'e.g. 500 PKR/month' : ''} value={newPlanData[field] || ''} onChange={e => setNewPlanData({ ...newPlanData, [field]: e.target.value })} />
              </div>
            ))}
            <div className="form-group">
              <label>Location</label>
              <select value={newPlanData.location} onChange={e => setNewPlanData({ ...newPlanData, location: e.target.value })}>
                <option value="France">🇫🇷 France</option>
                <option value="Singapore">🇸🇬 Singapore</option>
                <option value="UAE">🇦🇪 UAE</option>
              </select>
            </div>
            <div className="form-group">
              <label>Discount (%)</label>
              <input type="number" value={newPlanData.discount || 0} onChange={e => setNewPlanData({ ...newPlanData, discount: Number(e.target.value) })} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowAddPlanModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddPlan}>Add Plan</button>
            </div>
          </div>
        </div>
      )}

      {/* PARTNER MODAL */}
      {showPartnerModal && (
        <div className="modal-overlay" onClick={() => setShowPartnerModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editingPartner !== null ? 'Edit Partner' : 'Add Partner'}</h3>
            <div className="form-group">
              <label>Name</label>
              <input type="text" value={partnerForm.name} onChange={e => setPartnerForm({ ...partnerForm, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Channel Link</label>
              <input type="text" value={partnerForm.link} onChange={e => setPartnerForm({ ...partnerForm, link: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Logo (Upload)</label>
              <input type="file" accept="image/*" onChange={e => {
                const f = e.target.files && e.target.files[0];
                if (!f) return;
                const r = new FileReader();
                r.onload = () => { setPartnerForm({ ...partnerForm, logo: r.result }); setPartnerLogoPreview(r.result); };
                r.readAsDataURL(f);
              }} style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,0,64,0.2)', color: '#fff' }} />
              {(partnerLogoPreview || partnerForm.logo) && (
                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center' }}>
                  <img src={partnerLogoPreview || partnerForm.logo} alt="preview" style={{ width: '120px', height: 'auto', maxHeight: '80px', objectFit: 'contain', borderRadius: '6px' }} />
                </div>
              )}
            </div>
            <div className="form-group">
              <label><input type="checkbox" checked={!!partnerForm.isFeatured} onChange={e => setPartnerForm({ ...partnerForm, isFeatured: e.target.checked })} /> Featured</label>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowPartnerModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSavePartner}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* SCREENSHOT MODAL */}
      {showScreenshotModal && (
        <div className="modal-overlay" onClick={() => setShowScreenshotModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '90%', padding: 12 }}>
            <img src={screenshotModalSrc} alt="screenshot full" style={{ width: '100%', height: 'auto', borderRadius: 8 }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn btn-secondary" onClick={() => setShowScreenshotModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
