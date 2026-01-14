# RapidAPI Configuration Fix

## 🔴 Was war das Problem?

Du hattest **ZWEI Probleme**:

### 1. **Falsche RapidAPI subscribed** ❌
```
ERROR: 429 Too Many Requests
URL: https://local-business-data.p.rapidapi.com/search
```

Du hast die **falsche RapidAPI** abonniert:
- ❌ `local-business-data` API (FALSCH)
- ✅ `google-map-places` API (RICHTIG)

### 2. **Rate Limit erreicht** ⚠️
Die 429-Error bedeutet, dass du zu viele Requests gemacht hast (Rate Limit).

---

## ✅ Was wurde gefixt?

### 1. `.env` Konfiguration aktualisiert:

**Vorher (FALSCH):**
```bash
RAPIDAPI_HOST=local-business-data.p.rapidapi.com
RAPIDAPI_GOOGLE_MAPS_ENDPOINT=https://google-maps-data.p.rapidapi.com/search
```

**Nachher (RICHTIG):**
```bash
RAPIDAPI_HOST=google-map-places.p.rapidapi.com
RAPIDAPI_GOOGLE_MAPS_ENDPOINT=https://google-map-places.p.rapidapi.com/maps/search
```

### 2. Backend Server neu gestartet ✅

---

## 🚨 WICHTIG: Du musst die RICHTIGE RapidAPI abonnieren!

### Schritt 1: Gehe zur richtigen API

**RICHTIGE API:**
👉 https://rapidapi.com/letscrape-6bRBa3QguO5/api/google-map-places

**NICHT verwenden:**
❌ https://rapidapi.com/xyz/api/local-business-data

### Schritt 2: Subscribe

1. Klick auf **"Subscribe to Test"**
2. Wähle einen Plan:
   - **Basic (FREE):** 1,000 requests/month
   - **Pro:** 10,000 requests/month
   - **Ultra:** 100,000 requests/month

### Schritt 3: API Key kopieren

Nach dem Subscribe:
1. Gehe zu **"Endpoints"** Tab
2. Rechts siehst du **"Code Snippets"**
3. Kopiere den `X-RapidAPI-Key` Wert
4. **WICHTIG:** Dieser sollte der gleiche sein wie in deiner `.env` Datei!

### Schritt 4: Verify

Dein API Key in `.env`:
```bash
RAPIDAPI_KEY=4ad355fb9amsh394cd82b6cc14e0p1b698ejsncb588ef5a6e2
```

Stelle sicher, dass dieser Key für die **google-map-places** API registriert ist!

---

## 🧪 Teste die neue Konfiguration

### Test 1: Backend API Test
```bash
cd backend
./test_search.sh
```

**Erwartete Ausgabe:**
```
✅ Found 3 leads
✅ Status: completed
```

### Test 2: Frontend Test

1. Gehe zu `http://localhost:3000`
2. Wähle "Google Maps Bulk Search"
3. Eingeben:
   - Branche: `Restaurant`
   - Stadt: `Berlin`
   - Anzahl: `3`
4. Klick "Start Google Maps Search"

**Erwartetes Ergebnis:**
- Tabelle füllt sich mit Leads ✅
- Keine 429 Errors mehr ✅

---

## 🐛 Falls es immer noch nicht funktioniert:

### Problem: Immer noch 429 Error

**Mögliche Ursachen:**

1. **Rate Limit erreicht:**
   - Warte 1 Minute und versuche es erneut
   - Prüfe dein RapidAPI Dashboard: https://rapidapi.com/developer/dashboard
   - Sieh dir deine "Usage" Statistics an

2. **Falscher API Key:**
   - Stelle sicher, dass der Key in `.env` zum `google-map-places` API gehört
   - Erstelle einen neuen Key im RapidAPI Dashboard

3. **Nicht abonniert:**
   - Prüfe auf RapidAPI, ob du wirklich subscribed bist
   - Manchmal muss man die Seite neu laden

### Problem: 403 Error (Forbidden)

**Lösung:**
Du bist nicht zur API subscribed. Folge Schritt 1-3 oben.

### Problem: Invalid API Key

**Lösung:**
1. Gehe zu: https://rapidapi.com/developer/security
2. Kopiere deinen Application Key
3. Update `.env`:
   ```bash
   RAPIDAPI_KEY=dein-neuer-key-hier
   ```
4. Restart Backend:
   ```bash
   pkill -9 -f 'python main.py'
   cd backend && ./start_server.sh &
   ```

---

## 📊 Rate Limits (Free Tier)

**Google Map Places API (Free):**
- ✅ 1,000 requests/month
- ✅ ~33 requests/day
- ✅ Rate: 5 requests/second

**Tipps um Rate Limits zu vermeiden:**
1. Starte mit kleinen Searches (3-5 Leads)
2. Warte zwischen Tests
3. Upgrade auf Pro Plan wenn nötig

---

## ✅ Checklist

- [x] `.env` Konfiguration aktualisiert
- [x] Backend neu gestartet
- [ ] **Du musst:** Richtige RapidAPI abonnieren
- [ ] **Du musst:** API Key verifizieren
- [ ] Test mit `./test_search.sh`
- [ ] Test im Frontend

---

## 🆘 Hilfe benötigt?

Wenn du immer noch Probleme hast:

1. **Prüfe Backend Logs:**
   ```bash
   tail -f backend/server.log
   ```

2. **Teste manuell:**
   ```bash
   curl -X GET "https://google-map-places.p.rapidapi.com/maps/search?query=restaurant+Berlin&language=en&region=us" \
     -H "X-RapidAPI-Key: DEIN_API_KEY" \
     -H "X-RapidAPI-Host: google-map-places.p.rapidapi.com"
   ```

3. **Prüfe RapidAPI Dashboard:**
   https://rapidapi.com/developer/dashboard
   - Sieh dir "Usage" an
   - Prüfe "Active Subscriptions"

---

## 📝 Zusammenfassung

**Das Problem:**
- Falsche API verwendet (local-business-data statt google-map-places)
- Rate Limit erreicht (429 Error)

**Die Lösung:**
- ✅ `.env` Konfiguration aktualisiert
- ✅ Backend neu gestartet
- ⏳ **Du musst noch:** Richtige API auf RapidAPI abonnieren

**Nächste Schritte:**
1. Gehe zu https://rapidapi.com/letscrape-6bRBa3QguO5/api/google-map-places
2. Klick "Subscribe to Test"
3. Wähle FREE Plan
4. Teste mit `./test_search.sh`
5. Teste im Frontend

---

🎉 **Sobald du die richtige API abonniert hast, sollte alles funktionieren!**
