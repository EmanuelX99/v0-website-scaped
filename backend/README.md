# LeadScraper AI - Backend

FastAPI backend for LeadScraper AI SaaS platform.

## Setup

### 1. Python Environment

Erstelle und aktiviere ein Virtual Environment:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# oder: venv\Scripts\activate  # Windows
```

### 2. Dependencies installieren

```bash
pip install -r requirements.txt
```

### 3. Environment Variables

Kopiere `.env.example` zu `.env` und fülle die API Keys aus:

```bash
cp .env.example .env
```

Dann öffne `.env` und füge deine API Keys hinzu:

- **Supabase**: `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **RapidAPI**: `RAPIDAPI_KEY`, `RAPIDAPI_HOST`
- **Gemini AI**: `GEMINI_API_KEY`
- **PageSpeed Insights** (optional): `GOOGLE_PAGESPEED_API_KEY`

#### API Keys erhalten:

**Supabase:**
1. Gehe zu [supabase.com](https://supabase.com)
2. Erstelle ein neues Projekt
3. Gehe zu Settings → API
4. Kopiere die URL und Keys

**RapidAPI (Google Maps):**
1. Gehe zu [rapidapi.com](https://rapidapi.com)
2. Suche nach "Google Maps Data"
3. Abonniere den Plan (Free tier verfügbar)
4. Kopiere deinen API Key

**Gemini AI:**
1. Gehe zu [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Erstelle einen neuen API Key
3. Kopiere den Key

**PageSpeed Insights (optional):**
1. Gehe zu [Google Cloud Console](https://console.cloud.google.com)
2. Aktiviere PageSpeed Insights API
3. Erstelle einen API Key

### 4. Datenbank Setup

Führe das SQL-Skript in Supabase aus:

1. Öffne Supabase Dashboard → SQL Editor
2. Erstelle eine neue Query
3. Kopiere den SQL-Code aus dem Root-Verzeichnis (wurde bereits erstellt)
4. Führe das Script aus

### 5. API Verification

Teste alle Verbindungen:

```bash
python test_apis.py
```

Dieser Test prüft:
- ✅ Supabase Verbindung
- ✅ RapidAPI Google Maps
- ✅ Gemini AI
- ✅ PageSpeed Insights (optional)

### 6. Server starten

```bash
python main.py
```

Der Server läuft auf: `http://localhost:8000`

API-Dokumentation: `http://localhost:8000/docs`

## Entwicklung

### Auto-Reload

Der Server startet mit Auto-Reload. Änderungen am Code werden automatisch erkannt.

### Testing

```bash
pytest
```

### Code Formatting

```bash
black .
ruff check .
```

## API Endpoints

- `GET /` - Health check
- `POST /api/v1/analyses/bulk-search` - Bulk Google Maps Search
- `GET /api/v1/analyses` - List all analyses
- `GET /api/v1/analyses/{id}` - Get analysis by ID

Siehe `ARCHITECTURE.md` im Root-Verzeichnis für vollständige API-Spezifikation.

## Troubleshooting

### Import Errors

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Supabase Connection Error

- Prüfe ob die URL korrekt ist (inkl. `https://`)
- Prüfe ob der Key korrekt kopiert wurde (keine Leerzeichen)
- Prüfe ob das SQL-Schema ausgeführt wurde

### RapidAPI Rate Limit

- Free tier: 100 requests/month
- Upgrade auf Paid plan für mehr Requests

### Gemini API Quota

- Free tier: 15 RPM (requests per minute)
- Warte 60 Sekunden zwischen Tests

## Support

Bei Problemen siehe `ARCHITECTURE.md` oder öffne ein Issue.
