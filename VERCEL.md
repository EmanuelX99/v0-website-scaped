# Vercel Deployment Configuration for LeadScraper AI

## Quick Deploy

### 1. Connect Repository
1. Go to https://vercel.com
2. Click **"Add New Project"**
3. Import `EmanuelX99/v0-website-scaped`

### 2. Configure Project

**Framework:** Next.js (auto-detected)

**Root Directory:** `.` (root)

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### 3. Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```bash
# Supabase (Public Keys)
NEXT_PUBLIC_SUPABASE_URL=https://kljyofskcpwcmrlgiwxz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>

# Backend API (from Render)
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

### 4. Deploy
Click **"Deploy"** and wait 2-3 minutes.

---

## Post-Deployment

### Update Supabase Auth URLs
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel URL:
   ```
   Site URL: https://your-app.vercel.app
   Redirect URLs: https://your-app.vercel.app/**
   ```

### Update API Endpoints in Code

You need to update hardcoded `localhost:8000` URLs to use environment variable:

**Files to update:**
- `app/page.tsx` (line ~227)
- `components/report-modal.tsx` (line ~28)

**Change:**
```typescript
// Old
const response = await fetch('http://localhost:8000/api/...')

// New
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const response = await fetch(`${apiUrl}/api/...`)
```

---

## Custom Domain (Optional)

1. Go to Vercel Project → Settings → Domains
2. Add your domain (e.g., `app.leadscraper.ai`)
3. Follow DNS configuration instructions
4. Update Supabase redirect URLs with new domain

---

## Monitoring

**Analytics:** Vercel Dashboard → Analytics  
**Logs:** Vercel Dashboard → Deployments → View Function Logs  
**Performance:** Vercel Speed Insights (automatic)

---

## Scaling

**Hobby Plan (Free):**
- Unlimited deployments
- 100 GB bandwidth
- Good for MVP/testing

**Pro Plan ($20/month):**
- Team collaboration
- Advanced analytics
- 1 TB bandwidth
- Recommended for production

---

## Troubleshooting

**Build fails:**
- Check Node.js version (18+ required)
- Verify all dependencies in package.json

**Runtime errors:**
- Check Function Logs in Vercel
- Verify environment variables are set

**API calls fail:**
- Check NEXT_PUBLIC_API_URL is correct
- Verify Render backend is running
- Check browser console for CORS errors
