-- ============================================================
-- RUBY CLOUD - SUPABASE COMPLETE SQL SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================================

-- ─── USERS TABLE ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  is_admin INTEGER DEFAULT 0,
  avatar TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PAID PLANS TABLE ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.paid_plans (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  ram TEXT NOT NULL,
  cpu TEXT NOT NULL,
  storage TEXT NOT NULL,
  location TEXT NOT NULL,
  price TEXT NOT NULL,
  discount INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 99,
  is_active INTEGER DEFAULT 1
);

-- ─── LOCATION SETTINGS TABLE ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.location_settings (
  id BIGSERIAL PRIMARY KEY,
  location TEXT NOT NULL UNIQUE,
  is_available INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 99
);

-- ─── TICKETS TABLE ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tickets (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT,
  username TEXT,
  subject TEXT,
  message TEXT,
  screenshot TEXT,
  category TEXT DEFAULT 'general',
  status TEXT DEFAULT 'pending',
  admin_response TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CHAT MESSAGES TABLE ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SITE SETTINGS TABLE ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.site_settings (
  id BIGSERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL
);

-- ─── YT PARTNERS TABLE ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.yt_partners (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  channel_link TEXT,
  logo TEXT,
  is_featured INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 99
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Location Settings
INSERT INTO public.location_settings (location, is_available, sort_order) VALUES
  ('France', 0, 1),
  ('Singapore', 1, 2),
  ('UAE', 0, 3)
ON CONFLICT (location) DO NOTHING;

-- Default Plans (Singapore) - Updated Prices
INSERT INTO public.paid_plans (name, ram, cpu, storage, location, price, discount, sort_order, is_active) VALUES
  ('Dirt Plan',     '2 GB',  '100%', '10 GB SSD', 'Singapore', '180 PKR/month',  0, 1, 1),
  ('Stone Plan',    '4 GB',  '150%', '20 GB SSD', 'Singapore', '360 PKR/month',  0, 2, 1),
  ('Iron Plan',     '6 GB',  '200%', '30 GB SSD', 'Singapore', '540 PKR/month',  0, 3, 1),
  ('Redstone Plan', '8 GB',  '250%', '40 GB SSD', 'Singapore', '720 PKR/month',  0, 4, 1),
  ('Gold Plan',     '10 GB', '250%', '50 GB SSD', 'Singapore', '900 PKR/month',  0, 5, 1),
  ('Amethyst',      '12 GB', '300%', '60 GB SSD', 'Singapore', '1080 PKR/month', 0, 6, 1),
  ('Emerald',       '16 GB', '350%', '70 GB SSD', 'Singapore', '1440 PKR/month', 0, 7, 1),
  ('Ruby',          '20 GB', '400%', '80 GB SSD', 'Singapore', '1800 PKR/month', 0, 8, 1),
  ('Black Ruby',    '32 GB', '500%', '100 GB SSD','Singapore', '3000 PKR/month', 0, 9, 1)
ON CONFLICT DO NOTHING;

-- Site Settings
INSERT INTO public.site_settings (key, value) VALUES
  ('discord_members', '400+')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paid_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yt_partners ENABLE ROW LEVEL SECURITY;

-- Public read for plans, locations, settings, partners
CREATE POLICY "Public read plans" ON public.paid_plans FOR SELECT USING (true);
CREATE POLICY "Public read locations" ON public.location_settings FOR SELECT USING (true);
CREATE POLICY "Public read settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public read partners" ON public.yt_partners FOR SELECT USING (true);

-- Users: read own profile
CREATE POLICY "Users read own" ON public.users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users update own" ON public.users FOR UPDATE USING (auth.uid()::text = id::text);

-- Tickets: users manage own tickets
CREATE POLICY "Users read own tickets" ON public.tickets FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users insert tickets" ON public.tickets FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Chat: authenticated users
CREATE POLICY "Auth read chat" ON public.chat_messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth insert chat" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- ============================================================
-- ADMIN POLICIES (service_role bypasses RLS automatically)
-- ============================================================
-- Admin user insert karo Supabase Auth se manually:
-- Email: honeyxbillu2@gmail.com
-- Password: muneebali786
-- Phir is query run karo (auth.users se id copy karke):
--
-- INSERT INTO public.users (id, username, email, is_admin)
-- VALUES ('<AUTH_USER_ID>', 'Ruby Cloud Team', 'honeyxbillu2@gmail.com', 1);
