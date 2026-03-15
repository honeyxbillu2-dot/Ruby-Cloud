import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

const Tickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const { data, error } = await api
        .from('tickets')
        .select('*')
        .eq('user_id', user.id) // RLS should handle this too, but explicit filter is good
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (err) {
      console.error('Error loading tickets:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      alert('Please fill all fields!');
      return;
    }
    setLoading(true);
    try {
      const { error } = await api
        .from('tickets')
        .insert([{
          user_id: user.id,
          email: user.email, // Store email for admin convenience
          subject: subject.trim(),
          message: message.trim(),
          status: 'open'
        }]);

      if (!error) {
        setShowModal(false);
        setSubject('');
        setMessage('');
        loadTickets();
      } else {
        throw error;
      }
    } catch (err) {
      console.error('Error creating ticket:', err);
      alert('Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FF6A00';
      case 'in-progress': return '#FFD000';
      case 'resolved': return '#10b981';
      default: return '#FF6A00';
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>🎫 Support Tickets</h2>
        <p>Track your support requests</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          ➕ Create New Ticket
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🎫</div>
          <h3>No Tickets Yet</h3>
          <p>Create a ticket to get support from our team</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => (
                <tr key={ticket.id}>
                  <td>#{ticket.id}</td>
                  <td>{ticket.subject}</td>
                  <td>
                    <span className="badge" style={{ borderColor: getStatusColor(ticket.status), color: getStatusColor(ticket.status) }}>
                      {ticket.status}
                    </span>
                  </td>
                  <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setSelectedTicket(ticket)}
                      style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>🎫 Create Support Ticket</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Brief description of your issue"
                  required
                />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe your issue in detail"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Ticket Modal */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>🎫 Ticket #{selectedTicket.id}</h3>
            <div style={{ background: 'rgba(255, 106, 0, 0.05)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Subject</p>
              <p style={{ color: 'var(--text-primary)', fontWeight: '600', marginBottom: '16px' }}>{selectedTicket.subject}</p>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Status</p>
              <span className="badge" style={{ borderColor: getStatusColor(selectedTicket.status), color: getStatusColor(selectedTicket.status) }}>
                {selectedTicket.status}
              </span>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Your Message</p>
              <p style={{ color: 'var(--text-primary)', lineHeight: '1.6' }}>{selectedTicket.message}</p>
            </div>

            {selectedTicket.adminResponse && (
              <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Admin Response</p>
                <p style={{ color: 'var(--text-primary)', lineHeight: '1.6' }}>{selectedTicket.admin_response}</p>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setSelectedTicket(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;
