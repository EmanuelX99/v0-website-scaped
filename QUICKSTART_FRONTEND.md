# 🚀 QuickStart: Frontend-Backend Integration

## Was wurde implementiert?

✅ **Frontend (`app/page.tsx`):**
- `handleBulkSearch()` Funktion erstellt
- API-Call an Backend implementiert
- Response-Mapping zu Frontend-Format
- Error-Handling mit User-Feedback

✅ **Form Component (`components/analysis-form.tsx`):**
- `onBulkSearch` Callback hinzugefügt
- Echte API-Calls statt Mock-Daten
- Alle Filter werden korrekt an Backend übergeben
- Form wird nach erfolgreichem Search geleert

✅ **Backend Integration:**
- API-Endpoint funktioniert: `POST /api/v1/analyses/bulk-search`
- CORS konfiguriert für `localhost:3000`
- Response-Format passt zum Frontend

---

## 🎯 So testest du es:

### 1. Backend starten (falls nicht läuft)

```bash
cd backend
./start_server.sh &
```

**Test:** `curl http://127.0.0.1:8000/` sollte `{"status": "running"}` zurückgeben

### 2. Frontend starten

**In einem NEUEN Terminal:**

```bash
cd /Users/emanuel/v0-website-scaped-1
npm run dev
```

### 3. Browser öffnen

Gehe zu: **http://localhost:3000**

### 4. Google Maps Bulk Search testen

1. Wähle "Google Maps Bulk Search" im Dropdown
2. Eingeben:
   - **Branche:** `Restaurant` (oder `Cafe`, `Zahnarzt`)
   - **Stadt:** `Berlin` (oder `Zürich`, `München`)
   - **Anzahl:** `3` (klein halten für Tests)
3. **(Optional)** Advanced Filters öffnen und setzen
4. Klick auf **"Start Google Maps Search"**
5. **Warte...**
6. 🎉 Tabelle füllt sich mit Ergebnissen!

---

## 🔍 Was passiert im Hintergrund?

```
Frontend Form 
    → handleBulkSearch() 
    → fetch("http://127.0.0.1:8000/api/v1/analyses/bulk-search") 
    → Backend (main.py) 
    → analyzer.py (RapidAPI + Filters) 
    → Response zurück 
    → Frontend updated die Tabelle
```

---

## 🐛 Fehler beheben

### "Failed to fetch"
- **Ursache:** Backend läuft nicht
- **Fix:** `cd backend && ./start_server.sh &`

### "No leads found"
- **Ursache:** Filter zu streng
- **Fix:** Setze alle Filter auf "Any"

### API Error in Console
- **Fix:** Öffne Browser DevTools (F12) → Console
- Dort siehst du detaillierte Logs

---

## 📊 Daten prüfen

**Browser Console (F12 → Console):**
```
Starting bulk search... {industry: "Restaurant", ...}
API response: {status: "completed", totalFound: 3, ...}
Successfully added 3 analyses
```

**Backend Test:**
```bash
cd backend
./test_frontend_integration.sh
```

---

## ✅ Checklist

- [ ] Backend läuft auf Port 8000
- [ ] Frontend läuft auf Port 3000
- [ ] Browser zeigt die UI an
- [ ] Google Maps Bulk Search Formular sichtbar
- [ ] Nach "Start Google Maps Search" füllt sich die Tabelle

---

## 📁 Wichtige Dateien

| Datei | Änderung |
|-------|----------|
| `app/page.tsx` | `handleBulkSearch()` Funktion hinzugefügt |
| `components/analysis-form.tsx` | `onBulkSearch` Prop & API-Call |
| `backend/main.py` | Bereits fertig (Phase 4) |
| `backend/analyzer.py` | Bereits fertig (Phase 4) |

---

## 🎉 Fertig!

Wenn alles funktioniert, kannst du jetzt:
- Nach Restaurants in Berlin suchen
- Filter setzen (z.B. nur < 4.5 Rating)
- Ergebnisse in der Tabelle sehen
- Potential Leads sehen (Score < 60)

**Phase 5 ist komplett! 🚀**

**Nächster Schritt:** Phase 6 (AI & Website Analysis)
- Gemini AI für echte Scores
- Email-Extraktion aus Websites
- Tech Stack Detection
- PageSpeed Integration
