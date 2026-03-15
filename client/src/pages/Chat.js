import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserList, setShowUserList] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({ username: '' });
  const [editAvatarPreview, setEditAvatarPreview] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadUsers();
  }, [user, navigate]);

  // Poll messages periodically
  useEffect(() => {
    if (!user) return;
    const iv = setInterval(() => {
      loadMessages();
      if (user.isAdmin) loadUsers();
    }, 3000); // 3 seconds poll
    return () => clearInterval(iv);
  }, [user, selectedUser]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      if (user) {
        await Promise.all([loadMessages(), loadUsers()]);
        setIsInitializing(false);
      }
    };
    init();
  }, [user, selectedUser]);

  const loadUsers = async () => {
    try {
      const { data, error } = await api
        .from('users')
        .select('*')
        .order('last_seen', { ascending: false, nullsFirst: false });

      if (error) throw error;
      const fetchedUsers = data || [];
      setUsers(fetchedUsers);

      // Auto-select admin for regular users if nothing selected
      if (!user.isAdmin && !selectedUser && fetchedUsers.length > 0) {
        const admin = fetchedUsers.find(u => u.is_admin);
        if (admin) setSelectedUser(admin);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const loadMessages = async () => {
    if (!user?.id) return;

    try {
      let query = api
        .from('chat_messages')
        .select('*, sender:users!sender_id(username, avatar), receiver:users!receiver_id(username, avatar)')
        .order('created_at', { ascending: true });

      if (user.isAdmin) {
        if (!selectedUser?.id) {
          setMessages([]);
          return;
        }
        query = query.or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${user.id})`);
      } else {
        query = query.or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const mapped = (data || []).map(m => {
        const isOwn = String(m.sender_id) === String(user.id);
        const senderName = isOwn ? 'You' : (m.sender?.username || 'Flame Cloud Team');
        const senderAvatar = m.sender?.avatar;

        return {
          id: m.id,
          senderId: m.sender_id,
          receiverId: m.receiver_id,
          senderName,
          senderAvatar,
          message: m.message,
          createdAt: m.created_at,
          isOwn
        };
      });
      setMessages(mapped);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const getAdminId = async () => {
    try {
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('is_admin', true)
        .limit(1)
        .single();

      // Handle the data carefully as it might be an array or object from the shim
      if (Array.isArray(data)) return data[0]?.id;
      return data?.id;
    } catch (err) {
      console.error('Error getting admin ID:', err);
      return null;
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    const msgText = newMessage.trim();
    setIsSending(true);
    setErrorMessage('');

    try {
      let receiverId = null;
      if (user.isAdmin) {
        receiverId = selectedUser?.id;
        if (!receiverId) {
          setErrorMessage('Please select a user to message.');
          setIsSending(false);
          return;
        }
      } else {
        receiverId = await getAdminId();
        if (!receiverId) {
          setErrorMessage('Support is currently offline. Please try again later.');
          setIsSending(false);
          return;
        }
      }

      console.log(`Sending message to ${receiverId}: ${msgText}`);

      const { error } = await api
        .from('chat_messages')
        .insert([{
          sender_id: user.id,
          receiver_id: receiverId,
          message: msgText
        }]);

      if (error) throw error;

      setNewMessage('');
      await loadMessages();
    } catch (err) {
      console.error('Error sending message:', err);
      setErrorMessage(err.message || 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  if (isInitializing || !user) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60vh',
        color: 'var(--primary)',
        fontSize: '1.2rem'
      }}>
        <div className="loader" style={{ marginRight: '10px' }}></div>
        <p>Initializing secure chat...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>💬 {user.isAdmin ? 'Support Messages' : 'Client Chat'}</h2>
        <p>{user.isAdmin ? 'Manage customer messages' : 'Chat with our support team'}</p>
      </div>

      <div className="card" style={{
        padding: '28px',
        borderRadius: '20px',
        background: 'rgba(15, 10, 8, 0.15)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,106,0,0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Logo */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '300px',
          height: '300px',
          opacity: 0.1,
          pointerEvents: 'none',
          zIndex: 0
        }}>
          <img src="/logo.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>

        <div style={{ display: 'flex', gap: '24px', height: '600px', position: 'relative', zIndex: 1 }}>
          {/* Contact Sidebar */}
          <div style={{
            width: '260px',
            background: 'rgba(20, 15, 10, 0.4)',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid rgba(255,106,0,0.1)'
          }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', color: '#fff' }}>{user.isAdmin ? 'Active Users' : 'Support Chat'}</h3>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {user.isAdmin ? (
                // Admin sees all users except themselves
                users.filter(u => u.id !== user.id).map(u => (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      marginBottom: '8px',
                      background: selectedUser?.id === u.id ? 'linear-gradient(135deg, rgba(255, 46, 0, 0.3), rgba(255, 106, 0, 0.4))' : 'rgba(255,106,0,0.05)',
                      border: selectedUser?.id === u.id ? '1px solid var(--primary)' : '1px solid transparent',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #FF2E00, #FF6A00)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0,
                      border: '2px solid rgba(255,255,255,0.1)'
                    }}>
                      {u.avatar ? <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (u.username?.charAt(0).toUpperCase() || '?')}
                    </div>
                    <span style={{ fontWeight: '600', color: '#fff', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {u.username}
                    </span>
                  </div>
                ))
              ) : (
                // Regular user only sees "Support" (Admin)
                users.filter(u => u.is_admin).map(u => (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      marginBottom: '8px',
                      background: 'linear-gradient(135deg, rgba(255, 46, 0, 0.2), rgba(255, 106, 0, 0.3))',
                      border: '1px solid var(--primary)',
                      borderRadius: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #FF2E00, #FF6A00)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0,
                      border: '2px solid rgba(255,255,255,0.1)'
                    }}>
                      {u.avatar ? <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'FC'}
                    </div>
                    <span style={{ fontWeight: '600', color: '#fff', fontSize: '0.9rem' }}>Flame Cloud Team</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Main Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '12px' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '20px' }}>💬</div>
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'flex-start',
                    marginBottom: '24px',
                    padding: '4px 8px'
                  }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: msg.isOwn ? 'var(--primary)' : '#5865f2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0,
                      border: '1px solid rgba(255,255,255,0.1)',
                      marginTop: '4px'
                    }}>
                      {msg.senderAvatar ? <img src={msg.senderAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (msg.senderName?.charAt(0).toUpperCase() || '🔥')}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '6px' }}>
                        <span style={{
                          fontWeight: '800',
                          color: msg.isOwn ? '#ff6a00' : '#8ba6ff',
                          fontSize: '0.95rem',
                          letterSpacing: '0.5px'
                        }}>
                          {msg.senderName}
                        </span>
                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{
                        color: 'rgba(255,255,255,0.9)',
                        margin: 0,
                        fontSize: '1.05rem',
                        lineHeight: '1.5',
                        wordBreak: 'break-word'
                      }}>
                        {msg.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '20px' }}>
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  padding: '16px 20px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255,106,0,0.2)',
                  borderRadius: '14px',
                  color: '#fff',
                  fontFamily: 'inherit',
                  outline: 'none',
                  fontSize: '1rem'
                }}
                disabled={isSending}
              />
              <button
                type="submit"
                disabled={isSending || !newMessage.trim()}
                style={{
                  background: 'linear-gradient(135deg, #FF4500, #FF6A00)',
                  border: 'none',
                  width: '60px',
                  height: '56px',
                  borderRadius: '14px',
                  color: '#fff',
                  cursor: isSending || !newMessage.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  boxShadow: '0 8px 25px rgba(255, 69, 0, 0.2)',
                  opacity: isSending ? 0.7 : 1
                }}
              >
                {isSending ? '...' : '➤'}
              </button>
            </form>
            {errorMessage && <div style={{ color: '#ff4b2b', marginTop: 12, textAlign: 'center', fontWeight: '600' }}>{errorMessage}</div>}
          </div>
        </div>
      </div>

      {/* Edit User Modal for Admins */}
      {editModalOpen && selectedUser && (
        <div className="modal-overlay" onClick={() => setEditModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <h3>Edit User — {selectedUser.username}</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const updates = { username: editData.username };
                if (editAvatarPreview) updates.avatar = editAvatarPreview;

                const { error } = await api
                  .from('users')
                  .update(updates)
                  .eq('id', selectedUser.id);

                if (!error) {
                  await loadUsers();
                  setEditModalOpen(false);
                  alert('User updated');
                } else {
                  alert('Update failed: ' + error.message);
                }
              } catch (err) {
                console.error(err);
                alert('Update failed');
              }
            }}>
              <div className="form-group">
                <label>Username</label>
                <input value={editData.username} onChange={e => setEditData({ ...editData, username: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Avatar (optional)</label>
                <input type="file" accept="image/*" onChange={e => {
                  const f = e.target.files && e.target.files[0];
                  if (!f) return;
                  const r = new FileReader();
                  r.onload = () => setEditAvatarPreview(r.result);
                  r.readAsDataURL(f);
                }} />
                {editAvatarPreview && <div style={{ marginTop: '8px' }}><img src={editAvatarPreview} alt="preview" style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover' }} /></div>}
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
