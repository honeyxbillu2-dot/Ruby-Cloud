const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// Load .env only in local dev (Vercel injects env vars directly)
try { require('dotenv').config(); } catch (e) {}

const app = express();
const PORT = process.env.PORT || 5000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

app.use(cors({
  origin: (origin, callback) => {
    // Allow Vercel domains, localhost, and configured FRONTEND_URL
    const allowed = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:5000'
    ].filter(Boolean);
    if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// ─── AUTH MIDDLEWARE ──────────────────────────────────────────
const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });

  // Get profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  req.user = {
    id: user.id,
    email: user.email,
    username: profile?.username || user.email,
    isAdmin: profile?.is_admin === 1
  };
  next();
};

// ─── AUTH ─────────────────────────────────────────────────────
app.post('/api/auth/signup', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: 'All fields required' });

  // Check username taken
  const { data: existing } = await supabase
    .from('users').select('id').eq('username', username).single();
  if (existing) return res.status(400).json({ error: 'Username already taken' });

  const { data, error } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true
  });
  if (error) return res.status(400).json({ error: error.message });

  await supabase.from('users').insert([{
    id: data.user.id, username, email, is_admin: 0, avatar: ''
  }]);

  res.json({ message: 'Account created successfully' });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: 'Invalid email or password' });

  const { data: profile } = await supabase
    .from('users').select('*').eq('id', data.user.id).single();

  res.json({
    token: data.session.access_token,
    user: {
      id: data.user.id,
      username: profile?.username || email,
      email: data.user.email,
      isAdmin: profile?.is_admin === 1,
      avatar: profile?.avatar || ''
    }
  });
});

app.get('/api/auth/me', auth, async (req, res) => {
  const { data: profile } = await supabase
    .from('users').select('*').eq('id', req.user.id).single();
  if (!profile) return res.status(404).json({ error: 'Not found' });
  res.json({
    id: profile.id,
    username: profile.username,
    email: profile.email,
    isAdmin: profile.is_admin === 1,
    avatar: profile.avatar || ''
  });
});

// ─── USERS ────────────────────────────────────────────────────
app.get('/api/users', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  const { data } = await supabase.from('users').select('id,username,email,is_admin,avatar,created_at').order('created_at', { ascending: false });
  res.json(data || []);
});

app.put('/api/users/:id/admin', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  await supabase.from('users').update({ is_admin: req.body.is_admin ? 1 : 0 }).eq('id', req.params.id);
  res.json({ success: true });
});

app.delete('/api/users/:id', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  await supabase.from('users').delete().eq('id', req.params.id);
  res.json({ success: true });
});

// ─── PLANS ────────────────────────────────────────────────────
app.get('/api/plans', async (req, res) => {
  const { data } = await supabase.from('paid_plans').select('*').eq('is_active', 1).order('sort_order');
  res.json(data || []);
});

app.post('/api/plans', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  const { data } = await supabase.from('paid_plans').insert([{ ...req.body, is_active: 1 }]).select().single();
  res.json(data);
});

app.put('/api/plans/:id', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  await supabase.from('paid_plans').update(req.body).eq('id', req.params.id);
  res.json({ success: true });
});

app.delete('/api/plans/:id', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  await supabase.from('paid_plans').delete().eq('id', req.params.id);
  res.json({ success: true });
});

// ─── LOCATIONS ────────────────────────────────────────────────
app.get('/api/locations', async (req, res) => {
  const { data } = await supabase.from('location_settings').select('*').order('sort_order');
  res.json(data || []);
});

app.put('/api/locations/:id', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  await supabase.from('location_settings').update(req.body).eq('id', req.params.id);
  res.json({ success: true });
});

// ─── TICKETS ──────────────────────────────────────────────────
app.get('/api/tickets', auth, async (req, res) => {
  let query = supabase.from('tickets').select('*').order('created_at', { ascending: false });
  if (!req.user.isAdmin) query = query.eq('user_id', req.user.id);
  const { data } = await query;
  res.json(data || []);
});

app.post('/api/tickets', auth, async (req, res) => {
  const { data } = await supabase.from('tickets').insert([{ ...req.body, user_id: req.user.id, status: 'pending' }]).select().single();
  res.json(data);
});

app.put('/api/tickets/:id', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  await supabase.from('tickets').update(req.body).eq('id', req.params.id);
  res.json({ success: true });
});

// ─── CHAT ─────────────────────────────────────────────────────
app.get('/api/chat', auth, async (req, res) => {
  const { data } = await supabase.from('chat_messages').select('*').order('created_at').limit(50);
  res.json(data || []);
});

app.post('/api/chat', auth, async (req, res) => {
  const { data } = await supabase.from('chat_messages').insert([{
    user_id: req.user.id, username: req.user.username, message: req.body.message
  }]).select().single();
  res.json(data);
});

// ─── SETTINGS ─────────────────────────────────────────────────
app.get('/api/settings', async (req, res) => {
  const { data } = await supabase.from('site_settings').select('*');
  res.json(data || []);
});

app.put('/api/settings/:key', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  await supabase.from('site_settings').upsert({ key: req.params.key, value: req.body.value }, { onConflict: 'key' });
  res.json({ success: true });
});

// ─── YT PARTNERS ──────────────────────────────────────────────
app.get('/api/yt-partners', async (req, res) => {
  const { data } = await supabase.from('yt_partners').select('*').eq('is_active', 1).order('sort_order');
  res.json(data || []);
});

app.post('/api/yt-partners', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  const { data } = await supabase.from('yt_partners').insert([{ ...req.body, is_active: 1 }]).select().single();
  res.json(data);
});

app.put('/api/yt-partners/:id', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  await supabase.from('yt_partners').update(req.body).eq('id', req.params.id);
  res.json({ success: true });
});

app.delete('/api/yt-partners/:id', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  await supabase.from('yt_partners').delete().eq('id', req.params.id);
  res.json({ success: true });
});

// Local dev server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Ruby Cloud Supabase Backend: http://localhost:${PORT}`);
  });
}

module.exports = app;
