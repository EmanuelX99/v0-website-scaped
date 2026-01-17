# Render.com Configuration for LeadScraper AI Backend

## Quick Deploy Settings

### Service Configuration
- **Type:** Web Service
- **Environment:** Python 3.11
- **Region:** Frankfurt (EU Central)
- **Branch:** main
- **Root Directory:** backend

### Build & Deploy Commands
```bash
# Build Command
./render-build.sh

# Start Command  
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Health Check
- **Path:** /
- **Expected Status:** 200

### Auto-Deploy
- ✅ Enabled (deploys on git push)

---

## Environment Variables Required

```bash
# Supabase
SUPABASE_URL=https://kljyofskcpwcmrlgiwxz.supabase.co
SUPABASE_KEY=<service_role_key>
SUPABASE_JWT_SECRET=<jwt_secret>

# Google APIs
GEMINI_API_KEY=<your_key>
GOOGLE_PAGESPEED_API_KEY=<your_key>

# RapidAPI
RAPIDAPI_KEY=<your_key>

# Python
PYTHON_VERSION=3.11.0
```

---

## Deployment Steps

1. **Create New Web Service** on Render.com
2. **Connect GitHub** repository
3. **Configure as above**
4. **Add environment variables**
5. **Deploy!**

Render will:
- Clone your repo
- Run `render-build.sh`
- Install dependencies
- Install Playwright browser
- Start the server

---

## Monitoring

Check logs at:
```
https://dashboard.render.com/web/<your-service-id>/logs
```

---

## Scaling

**Free Tier:**
- 512 MB RAM
- Sleeps after 15min inactivity
- Good for testing

**Starter ($7/month):**
- 512 MB RAM
- Always on
- Recommended for production

**Standard ($25/month):**
- 2 GB RAM
- Better performance
- For heavy usage
