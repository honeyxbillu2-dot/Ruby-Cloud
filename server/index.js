const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'ruby-cloud-secret-2024';
const DB_FILE = path.join(__dirname, 'db.json');

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));

// ─── Simple JSON DB ──────────────────────────────────────────────────────────
const readDB = () => {
  if (!fs.existsSync(DB_FILE)) return initDB();
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
};
const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

const initDB = () => {
  const hashed = bcrypt.hashSync('muneebali786', 10);
  const data = {
    users: [
      { id: 'admin-001', username: 'Ruby Cloud Team', email: 'honeyxbillu2@gmail.com', password: hashed, is_admin: 1, avatar: '', created_at: new Date().toISOString() }
    ],
    paid_plans: [
      { id: 1, name: 'Dirt Plan', ram: '2 GB', cpu: '100%', storage: '10 GB SSD', location: 'Singapore', price: '180 PKR/month', discount: 0, sort_order: 1, is_active: 1 },
      { id: 2, name: 'Stone Plan', ram: '4 GB', cpu: '150%', storage: '20 GB SSD', location: 'Singapore', price: '360 PKR/month', discount: 0, sort_order: 2, is_active: 1 },
      { id: 3, name: 'Iron Plan', ram: '6 GB', cpu: '200%', storage: '30 GB SSD', location: 'Singapore', price: '540 PKR/month', discount: 0, sort_order: 3, is_active: 1 },
      { id: 4, name: 'Redstone Plan', ram: '8 GB', cpu: '250%', storage: '40 GB SSD', location: 'Singapore', price: '720 PKR/month', discount: 0, sort_order: 4, is_active: 1 },
      { id: 5, name: 'Gold Plan', ram: '10 GB', cpu: '250%', storage: '50 GB SSD', location: 'Singapore', price: '900 PKR/month', discount: 0, sort_order: 5, is_active: 1 },
      { id: 6, name: 'Amethyst', ram: '12 GB', cpu: '300%', storage: '60 GB SSD', location: 'Singapore', price: '1080 PKR/month', discount: 0, sort_order: 6, is_active: 1 },
      { id: 7, name: 'Emerald', ram: '16 GB', cpu: '350%', storage: '70 GB SSD', location: 'Singapore', price: '1440 PKR/month', discount: 0, sort_order: 7, is_active: 1 },
      { id: 8, name: 'Ruby', ram: '20 GB', cpu: '400%', storage: '80 GB SSD', location: 'Singapore', price: '1800 PKR/month', discount: 0, sort_order: 8, is_active: 1 },
      { id: 9, name: 'Black Ruby', ram: '32 GB', cpu: '500%', storage: '100 GB SSD', location: 'Singapore', price: '3000 PKR/month', discount: 0, sort_order: 9, is_active: 1 }
    ],
    tickets: [],
    chat_messages: [],
    location_settings: [
      { id: 1, location: 'France', is_available: 0, sort_order: 1 },
      { id: 2, location: 'Singapore', is_available: 1, sort_order: 2 },
      { id: 3, location: 'UAE', is_available: 0, sort_order: 3 }
    ],
    site_settings: [
      { id: 1, key: 'discord_members', value: '400+' }
    ],
    about_content: [],
    yt_partners: []
  };
  writeDB(data);
  return data;
};

// ─── Auth Middleware ─────────────────────────────────────────────────────────
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid token' }); }
};

// ─── AUTH ────────────────────────────────────────────────────────────────────
app.post('/api/auth/signup', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'All fields required' });
  const db = readDB();
  if (db.users.find(u => u.email === email)) return res.status(400).json({ error: 'Email already exists' });
  if (db.users.find(u => u.username === username)) return res.status(400).json({ error: 'Username already taken' });
  const user = { id: uuidv4(), username, email, password: bcrypt.hashSync(password, 10), is_admin: 0, avatar: '', created_at: new Date().toISOString() };
  db.users.push(user);
  writeDB(db);
  res.json({ message: 'Account created successfully' });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid email or password' });
  const token = jwt.sign({ id: user.id, email: user.email, username: user.username, isAdmin: user.is_admin === 1 }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, username: user.username, email: user.email, isAdmin: user.is_admin === 1, avatar: user.avatar } });
});

app.get('/api/auth/me', auth, (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json({ id: user.id, username: user.username, email: user.email, isAdmin: user.is_admin === 1, avatar: user.avatar });
});

// ─── USERS ───────────────────────────────────────────────────────────────────
app.get('/api/users', auth, (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  const db = readDB();
  res.json(db.users.map(u => ({ id: u.id, username: u.username, email: u.email, is_admin: u.is_admin, avatar: u.avatar, created_at: u.created_at })));
});

app.put('/api/users/:id', auth, (req, res) => {
  const db = readDB();
  const idx = db.users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const { username, email, avatar } = req.body;
  if (username) db.users[idx].username = username;
  if (email) db.users[idx].email = email;
  if (avatar !== undefined) db.users[idx].avatar = avatar;
  writeDB(db);
  const u = db.users[idx];
  res.json({ id: u.id, username: u.username, email: u.email, isAdmin: u.is_admin === 1, avatar: u.avatar });
});

app.put('/api/users/:id/admin', auth, (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  const db = readDB();
  const idx = db.users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.users[idx].is_admin = req.body.is_admin ? 1 : 0;
  writeDB(db);
  res.json({ success: true });
});

// ─── PLANS ───────────────────────────────────────────────────────────────────
app.get('/api/plans', (req, res) => {
  const db = readDB();
  res.json(db.paid_plans.filter(p => p.is_active === 1).sort((a, b) => a.sort_order - b.sort_order));
});

app.post('/api/plans', auth, (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  const db = readDB();
  const plan = { id: Date.now(), ...req.body, is_active: 1 };
  db.paid_plans.push(plan);
  writeDB(db);
  res.json(plan);
});

app.put('/api/plans/:id', auth, (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  const db = readDB();
  const idx = db.paid_plans.findIndex(p => p.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.paid_plans[idx] = { ...db.paid_plans[idx], ...req.body };
  writeDB(db);
  res.json({ success: true });
});

app.delete('/api/plans/:id', auth, (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  const db = readDB();
  db.paid_plans = db.paid_plans.filter(p => p.id != req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// ─── TICKETS ─────────────────────────────────────────────────────────────────
app.get('/api/tickets', auth, (req, res) => {
  const db = readDB();
  const tickets = req.user.isAdmin ? db.tickets : db.tickets.filter(t => t.user_id === req.user.id);
  res.json(tickets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
});

app.post('/api/tickets', auth, (req, res) => {
  const db = readDB();
  const ticket = { id: Date.now(), user_id: req.user.id, ...req.body, status: 'pending', created_at: new Date().toISOString() };
  db.tickets.push(ticket);
  writeDB(db);
  res.json(ticket);
});

app.put('/api/tickets/:id', auth, (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  const db = readDB();
  const idx = db.tickets.findIndex(t => t.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.tickets[idx] = { ...db.tickets[idx], ...req.body };
  writeDB(db);
  res.json({ success: true });
});

// ─── CHAT ─────────────────────────────────────────────────────────────────────
app.get('/api/chat', auth, (req, res) => {
  const db = readDB();
  res.json(db.chat_messages.slice(-50));
});

app.post('/api/chat', auth, (req, res) => {
  const db = readDB();
  const msg = { id: Date.now(), user_id: req.user.id, username: req.user.username, message: req.body.message, created_at: new Date().toISOString() };
  db.chat_messages.push(msg);
  writeDB(db);
  res.json(msg);
});

// ─── LOCATIONS ───────────────────────────────────────────────────────────────
app.get('/api/locations', (req, res) => {
  const db = readDB();
  res.json(db.location_settings.sort((a, b) => a.sort_order - b.sort_order));
});

app.put('/api/locations/:id', auth, (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  const db = readDB();
  const idx = db.location_settings.findIndex(l => l.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.location_settings[idx] = { ...db.location_settings[idx], ...req.body };
  writeDB(db);
  res.json({ success: true });
});

// ─── SETTINGS ────────────────────────────────────────────────────────────────
app.get('/api/settings', (req, res) => {
  const db = readDB();
  res.json(db.site_settings);
});

app.put('/api/settings/:key', auth, (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  const db = readDB();
  const idx = db.site_settings.findIndex(s => s.key === req.params.key);
  if (idx === -1) db.site_settings.push({ id: Date.now(), key: req.params.key, value: req.body.value });
  else db.site_settings[idx].value = req.body.value;
  writeDB(db);
  res.json({ success: true });
});

// ─── ABOUT ───────────────────────────────────────────────────────────────────
app.get('/api/about', (req, res) => {
  const db = readDB();
  res.json(db.about_content[0] || {});
});

// ─── USERS DELETE ────────────────────────────────────────────────────────────
app.delete('/api/users/:id', auth, (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  const db = readDB();
  db.users = db.users.filter(u => u.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// ─── YT PARTNERS ─────────────────────────────────────────────────────────────
app.get('/api/yt-partners', (req, res) => {
  const db = readDB();
  res.json(db.yt_partners.filter(p => p.is_active === 1));
});

app.post('/api/yt-partners', auth, (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  const db = readDB();
  const partner = { id: Date.now(), ...req.body, is_active: 1 };
  db.yt_partners.push(partner);
  writeDB(db);
  res.json(partner);
});

app.put('/api/yt-partners/:id', auth, (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  const db = readDB();
  const idx = db.yt_partners.findIndex(p => p.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.yt_partners[idx] = { ...db.yt_partners[idx], ...req.body };
  writeDB(db);
  res.json({ success: true });
});

app.delete('/api/yt-partners/:id', auth, (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  const db = readDB();
  db.yt_partners = db.yt_partners.filter(p => p.id != req.params.id);
  writeDB(db);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`🚀 Ruby Cloud Backend: http://localhost:${PORT}`);
  console.log(`👤 Admin: honeyxbillu2@gmail.com / muneebali786`);
});
