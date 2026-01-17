# 🔧 Vercel Environment Variables Setup

## Required Environment Variables

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these 3 variables:

### 1. NEXT_PUBLIC_SUPABASE_URL
```
https://kljyofskcpwcmrlgiwxz.supabase.co
```

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
Get from: https://supabase.com/dashboard/project/kljyofskcpwcmrlgiwxz/settings/api
- Copy the **"anon"** / **"public"** key (NOT service_role!)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZi...
```

### 3. NEXT_PUBLIC_API_URL
```
https://leadscraper-backend.onrender.com
```

---

## After Adding Variables

1. Click **"Save"**
2. Go to **Deployments** tab
3. Click **"..."** menu on latest deployment
4. Click **"Redeploy"**
5. Wait 2-3 minutes

---

Your app will then connect to your Render backend! 🚀
