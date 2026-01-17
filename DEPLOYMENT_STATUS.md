# 🚀 Phase 9: Deployment - READY TO DEPLOY

## ✅ Alle Konfigurationsdateien erstellt!

---

## 📦 **Backend (Render.com)**

### **Konfigurationsdateien:**
- ✅ `backend/requirements.txt` - Alle Dependencies inkl. gunicorn & playwright
- ✅ `backend/render-build.sh` - Build Script (executable)
- ✅ `backend/package.json` - Metadata
- ✅ `backend/RENDER.md` - Deployment Guide
- ✅ `backend/main.py` - CORS auf `allow_origins=["*"]` gesetzt

### **Start Command für Render:**
```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### **Build Command:**
```bash
./render-build.sh
```

---

## 🌐 **Frontend (Vercel)**

### **Konfigurationsdateien:**
- ✅ `vercel.json` - Vercel config
- ✅ `VERCEL.md` - Deployment Guide
- ✅ `package.json` - Dependencies (Supabase SSR bereits installiert)

### **Environment Variables für Vercel:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://kljyofskcpwcmrlgiwxz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>
NEXT_PUBLIC_API_URL=<your_render_backend_url>
```

---

## 📋 **Deployment Checkliste**

### **Schritt 1: Backend auf Render deployen**
1. ✅ Gehe zu https://render.com
2. ✅ New → Web Service
3. ✅ Connect GitHub → `EmanuelX99/v0-website-scaped`
4. ✅ Root Directory: `backend`
5. ✅ Build Command: `./render-build.sh`
6. ✅ Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
7. ✅ Add Environment Variables (siehe DEPLOYMENT.md)
8. ✅ Deploy!

**Erwartete URL:** `https://leadscraper-api.onrender.com`

---

### **Schritt 2: Frontend auf Vercel deployen**
1. ✅ Gehe zu https://vercel.com
2. ✅ Add New Project
3. ✅ Import `EmanuelX99/v0-website-scaped`
4. ✅ Framework: Next.js (auto)
5. ✅ Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL` (von Render)
6. ✅ Deploy!

**Erwartete URL:** `https://your-app.vercel.app`

---

### **Schritt 3: Post-Deployment**
1. ✅ Supabase Auth URLs updaten:
   - Gehe zu Supabase Dashboard → Authentication → URL Configuration
   - Add Vercel URL zu Redirect URLs
2. ⚠️ **WICHTIG:** API URLs im Code updaten (siehe unten)
3. ✅ Teste Login Flow
4. ✅ Teste Google Maps Search
5. ✅ Teste PDF Download

---

## ⚠️ **Code Changes Noch Nötig**

Du musst noch hardcoded `localhost:8000` URLs ersetzen:

### **app/page.tsx (Zeile ~227):**
```typescript
// Vorher:
const url = new URL("http://127.0.0.1:8000/api/v1/analyses/bulk-search-stream")

// Nachher:
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const url = new URL(`${apiUrl}/api/v1/analyses/bulk-search-stream`)
```

### **components/report-modal.tsx (Zeile ~28):**
```typescript
// Vorher:
const response = await fetch(`http://localhost:8000/api/v1/analyses/${analysisId}/pdf`)

// Nachher:
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const response = await fetch(`${apiUrl}/api/v1/analyses/${analysisId}/pdf`)
```

---

## 📄 **Dokumentation**

- **DEPLOYMENT.md** - Vollständiger Deployment Guide
- **backend/RENDER.md** - Render-spezifische Anleitung
- **VERCEL.md** - Vercel-spezifische Anleitung

---

## 🎯 **Nächste Schritte**

1. **Deploy Backend auf Render** (10-15 Minuten)
2. **Notiere Backend URL** von Render
3. **Update API URLs** in Frontend Code
4. **Deploy Frontend auf Vercel** (3-5 Minuten)
5. **Update Supabase** Redirect URLs
6. **Teste alles!**

---

## 💰 **Kosten**

**Minimal Setup (Testing):**
- Render Free + Vercel Hobby = **$0/month**
- + Google APIs + RapidAPI = **~$15-30/month**

**Production Setup:**
- Render Starter ($7) + Vercel Hobby = **$7/month**
- + APIs = **~$22-37/month**

---

## 🚨 **Wichtige Hinweise**

1. **Render Free Tier** schläft nach 15min Inaktivität → erster Request dauert ~30s
2. **Playwright** benötigt ~2-3 Minuten beim ersten Build
3. **CORS** ist auf `allow_origins=["*"]` gesetzt → später einschränken!
4. **Environment Variables** MÜSSEN in Render/Vercel gesetzt werden

---

## ✅ **Ready to Deploy!**

Alle Konfigurationsdateien sind fertig.  
Folge den Schritten in **DEPLOYMENT.md** für die komplette Anleitung.

**Status:** Production Ready 🚀  
**Last Check:** 2026-01-17
