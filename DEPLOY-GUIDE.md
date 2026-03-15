# Ruby Cloud - Deployment Guide

## Step 1: Supabase Setup

1. [supabase.com](https://supabase.com) pe jao → New Project banao
2. SQL Editor kholo
3. `supabase-schema.sql` ka poora content paste karo → Run karo
4. Authentication > Users me jao → "Add User" karo:
   - Email: `honeyxbillu2@gmail.com`
   - Password: `muneebali786`
5. Us user ki ID copy karo, phir SQL Editor me run karo:
   ```sql
   INSERT INTO public.users (id, username, email, is_admin)
   VALUES ('<PASTE_USER_ID_HERE>', 'Ruby Cloud Team', 'honeyxbillu2@gmail.com', 1);
   ```
6. Project Settings > API se copy karo:
   - `Project URL` → ye hai `SUPABASE_URL`
   - `service_role` key → ye hai `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 2: GitHub

```bash
git init
git add .
git commit -m "Ruby Cloud - Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ruby-cloud.git
git push -u origin main
```

---

## Step 3: Vercel Deployment

1. [vercel.com](https://vercel.com) pe jao → "Add New Project"
2. GitHub repo import karo
3. Settings > Environment Variables me ye add karo:

| Variable | Value |
|----------|-------|
| `REACT_APP_API_URL` | `https://your-project.vercel.app/api` |
| `SUPABASE_URL` | `https://cmtgotqtjpnxcmcugupa.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard se copy karo (service_role key) |
| `FRONTEND_URL` | `https://your-project.vercel.app` |

4. Deploy karo!
5. Deploy hone ke baad jo URL mile (e.g. `ruby-cloud.vercel.app`), woh `REACT_APP_API_URL` aur `FRONTEND_URL` me update karo

---

## Local Development

```bash
# Backend (port 5000)
cd server
npm install
node index.js

# Frontend (port 3000)
cd client
npm install
npm start
```
