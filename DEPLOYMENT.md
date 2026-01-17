# 🚀 Deployment Guide - Render & Vercel

## Phase 9: Production Deployment

---

## 📦 **Backend Deployment (Render.com)**

### **1. Prepare Render Account**
1. Go to https://render.com
2. Sign up / Log in
3. Click **"New +"** → **"Web Service"**

### **2. Connect GitHub Repository**
1. Connect your GitHub account
2. Select repository: `EmanuelX99/v0-website-scaped`
3. Branch: `main`
4. Root Directory: `backend`

### **3. Configure Web Service**

**Basic Settings:**
- **Name:** `leadscraper-api` (or your choice)
- **Region:** Frankfurt (EU Central) or closest to you
- **Branch:** `main`
- **Root Directory:** `backend`

**Build & Deploy:**
- **Runtime:** `Python 3.11`
- **Build Command:** `./render-build.sh`
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

**Instance Type:**
- Start with **Free** tier (for testing)
- Upgrade to **Starter ($7/month)** for production

### **4. Environment Variables**

Click **"Environment"** and add these:

```bash
# Supabase
SUPABASE_URL=https://kljyofskcpwcmrlgiwxz.supabase.co
SUPABASE_KEY=your_service_role_key_here
SUPABASE_JWT_SECRET=your_jwt_secret_here

# Google APIs
GEMINI_API_KEY=your_gemini_key_here
GOOGLE_PAGESPEED_API_KEY=your_pagespeed_key_here

# RapidAPI
RAPIDAPI_KEY=your_rapidapi_key_here

# Python
PYTHON_VERSION=3.11.0
```

### **5. Deploy**
1. Click **"Create Web Service"**
2. Wait for build (5-10 minutes first time)
3. Note your backend URL: `https://leadscraper-api.onrender.com`

---

## 🌐 **Frontend Deployment (Vercel)**

### **1. Prepare Vercel Account**
1. Go to https://vercel.com
2. Sign up / Log in with GitHub
3. Click **"Add New..."** → **"Project"**

### **2. Import Repository**
1. Select: `EmanuelX99/v0-website-scaped`
2. Click **"Import"**

### **3. Configure Project**

**Framework Preset:** Next.js (auto-detected)

**Build Settings:**
- **Root Directory:** `.` (leave as root)
- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install` (default)

### **4. Environment Variables**

Click **"Environment Variables"** and add:

```bash
# Supabase (Frontend)
NEXT_PUBLIC_SUPABASE_URL=https://kljyofskcpwcmrlgiwxz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Backend API (from Render)
NEXT_PUBLIC_API_URL=https://leadscraper-api.onrender.com
```

### **5. Deploy**
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Your app is live: `https://your-app.vercel.app`

---

## 🔧 **Post-Deployment Configuration**

### **Update Frontend API Calls**

After deployment, you need to update API endpoints in your code to use the Render backend URL instead of `localhost:8000`.

**Files to update:**
- `app/page.tsx` (line ~227, ~252)
- `components/report-modal.tsx` (line ~28)

**Change from:**
```typescript
http://localhost:8000/api/...
```

**To:**
```typescript
process.env.NEXT_PUBLIC_API_URL + '/api/...'
// or directly:
https://your-backend.onrender.com/api/...
```

### **Update Supabase Auth Redirect URLs**

1. Go to Supabase Dashboard
2. Authentication → URL Configuration
3. Add your Vercel URL to **Site URL** and **Redirect URLs**:
   ```
   https://your-app.vercel.app
   ```

---

## ✅ **Verification Checklist**

### **Backend (Render)**
- [ ] Build completed successfully
- [ ] All environment variables set
- [ ] Health check endpoint working: `https://your-api.onrender.com/`
- [ ] Playwright browser installed (check logs)

### **Frontend (Vercel)**
- [ ] Build completed successfully
- [ ] Environment variables set
- [ ] Login page accessible
- [ ] Can authenticate with Supabase

### **Integration**
- [ ] Frontend can reach backend API
- [ ] CORS working (no browser errors)
- [ ] Authentication flow works end-to-end
- [ ] Google Maps search works
- [ ] PDF download works

---

## 🐛 **Troubleshooting**

### **Backend Issues**

**Problem:** Build fails with Playwright error
**Solution:** Check that `render-build.sh` is executable and runs correctly

**Problem:** 500 errors on API calls
**Solution:** Check Render logs → Environment tab → View logs

**Problem:** CORS errors
**Solution:** Verify `allow_origins=["*"]` in `main.py`

### **Frontend Issues**

**Problem:** Login doesn't work
**Solution:** Check Supabase redirect URLs include your Vercel domain

**Problem:** API calls fail
**Solution:** Verify `NEXT_PUBLIC_API_URL` environment variable is set

**Problem:** Build fails
**Solution:** Check Node.js version compatibility (use Node 18+)

---

## 📊 **Monitoring**

### **Render**
- Dashboard → Your Service → Logs
- Monitor CPU/Memory usage
- Check deployment history

### **Vercel**
- Project → Analytics
- Monitor function execution
- Check build logs

### **Supabase**
- Database → Usage
- Auth → Users
- Monitor API requests

---

## 💰 **Cost Estimation**

### **Monthly Costs (Estimated)**

| Service | Tier | Cost |
|---------|------|------|
| **Render** | Free | $0 |
| **Render** | Starter | $7/month |
| **Vercel** | Hobby | $0 |
| **Vercel** | Pro | $20/month |
| **Supabase** | Free | $0 (2GB DB, 50k users) |
| **Supabase** | Pro | $25/month |
| **Google APIs** | Pay-as-you-go | ~$5-20/month |
| **RapidAPI** | Basic | ~$10-50/month |

**Total (Free Tier):** $15-70/month (APIs only)  
**Total (Paid Tier):** $47-120/month

---

## 🎉 **Next Steps After Deployment**

1. **Custom Domain:** Add your own domain in Vercel
2. **SSL Certificate:** Automatically handled by Vercel/Render
3. **Monitoring:** Set up error tracking (Sentry)
4. **Analytics:** Add Google Analytics or Plausible
5. **Backup:** Set up daily database backups in Supabase
6. **Rate Limiting:** Add API rate limiting for production
7. **Caching:** Implement Redis for performance

---

## 📝 **Environment Variables Summary**

### **Backend (.env on Render)**
```bash
SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_JWT_SECRET=
GEMINI_API_KEY=
GOOGLE_PAGESPEED_API_KEY=
RAPIDAPI_KEY=
PYTHON_VERSION=3.11.0
```

### **Frontend (.env.local for Vercel)**
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=
```

---

**Status:** Ready for Deployment ✅  
**Last Updated:** 2026-01-17  
**Version:** Phase 9
