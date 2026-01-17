# 🔑 JWT Secret Setup - Schritt-für-Schritt Anleitung

## Problem
Der "Legacy JWT secret (still used)" funktioniert **NUR zum Verifizieren** von Tokens, nicht zum Erstellen.
Das Backend braucht diesen Secret, um Tokens zu validieren.

---

## ✅ Schritt 1: JWT Secret aus Supabase holen

### 1.1 Öffne dein Supabase Dashboard
```
https://supabase.com/dashboard/project/kljyofskcpwcmrlgiwxz/settings/api
```

### 1.2 Scroll nach unten zur Sektion "JWT Settings"

Du siehst dort:
- **Legacy JWT secret (still used)** ← DAS brauchst du!
- Access token expiry time
- Refresh token expiry time

### 1.3 Kopiere den Secret

1. Klicke auf **"Reveal"** Button neben "Legacy JWT secret (still used)"
2. Der Secret ist eine **lange Base64-kodierte Zeichenkette** (ca. 80-100 Zeichen)
3. Kopiere ihn komplett (z.B.: `GQeAQFUT5R1X6mIk8XUA4htIlNhPw3fOjjTin6vHrgBvELVEckwt1...`)

---

## ✅ Schritt 2: JWT Secret in Backend eintragen

### 2.1 Öffne die Datei
```bash
backend/.env
```

### 2.2 Finde oder füge die Zeile hinzu:
```bash
SUPABASE_JWT_SECRET=your_jwt_secret_here
```

### 2.3 Ersetze `your_jwt_secret_here` mit dem kopierten Secret
```bash
SUPABASE_JWT_SECRET=GQeAQFUT5R1X6mIk8XUA4htIlNhPw3fOjjTin6vHrgBvELVEckwt1/vCXBKBo/l2jw9Jt/SqFoXpjV3XkJZfig==
```

### 2.4 Speichere die Datei

---

## ✅ Schritt 3: Backend neu starten

### Terminal öffnen und ausführen:
```bash
cd /Users/emanuel/v0-website-scaped-1/backend
python main.py
```

Oder automatisch:
```bash
# Backend stoppen
lsof -ti :8000 | xargs kill -9

# Backend starten
cd /Users/emanuel/v0-website-scaped-1/backend && python main.py
```

---

## ✅ Schritt 4: Testen

1. Öffne http://localhost:3000
2. Login (falls nicht eingeloggt)
3. Starte einen Google Maps Bulk Search
4. **Es sollte jetzt funktionieren!** 🎉

---

## 🔍 Überprüfen ob JWT Secret korrekt ist

### Test im Terminal:
```bash
cd /Users/emanuel/v0-website-scaped-1/backend
grep "SUPABASE_JWT_SECRET" .env
```

**Erwartetes Ergebnis:**
```
SUPABASE_JWT_SECRET=GQeAQFUT5R1X6mIk8XUA4htIlNhPw3fOjjTin6vHrgBvELVEckwt1/vCXBKBo/l2jw9Jt/SqFoXpjV3XkJZfig==
```

Wenn der Secret da ist ✅ → Backend neu starten
Wenn der Secret fehlt ❌ → Zurück zu Schritt 2

---

## 📝 Zusammenfassung

Der **Legacy JWT secret** wird verwendet um:
- ✅ Tokens zu **verifizieren** (prüfen ob sie echt sind)
- ✅ User-Authentifizierung im Backend
- ✅ Signatur der Tokens zu validieren

**Wichtig:**
- Dieser Secret ist **NICHT** für neue JWT Signing Keys (das ist was Supabase jetzt empfiehlt)
- Aber er funktioniert **noch** und ist einfacher zu implementieren
- Für Production würdest du später auf JWT Signing Keys umsteigen

---

## ⚠️ Troubleshooting

### Problem: "401 Unauthorized" trotz korrektem Secret

**Lösung 1: Frontend neu laden**
```bash
# Browser: Strg+Shift+R (Hard Refresh)
# Oder: Logout & Login erneut
```

**Lösung 2: Token im Browser löschen**
```javascript
// Browser Console (F12):
localStorage.clear()
// Dann neu einloggen
```

**Lösung 3: Backend Logs checken**
```bash
tail -f /Users/emanuel/v0-website-scaped-1/backend/server.log
```

Suche nach:
- `✅ Authenticated user:` → Funktioniert!
- `❌ JWT validation error:` → Problem mit Token/Secret

---

## 🎯 Nächste Schritte nach erfolgreichem Test

1. ✅ RLS Migration in Supabase ausführen (siehe `backend/migrations/001_enable_rls.sql`)
2. ✅ Erste echte Bulk Search testen
3. ✅ PDF Download testen
4. ✅ Sign Out testen
5. ✅ Deployment vorbereiten

---

**Status aktuell:**
- ✅ Backend läuft auf :8000
- ✅ Frontend läuft auf :3000
- ✅ JWT Secret Schema ist korrekt konfiguriert
- ⚠️  JWT Secret muss nur noch eingefügt werden (falls nicht schon geschehen)

Viel Erfolg! 🚀
