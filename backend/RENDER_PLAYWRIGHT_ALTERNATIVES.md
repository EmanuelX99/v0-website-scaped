# Alternative: Render ohne Playwright

Falls Playwright auf Render weiterhin Probleme macht, hier die Alternative:

## Option 1: Playwright deaktivieren

In `backend/requirements.txt` kommentiere Playwright aus:
```
# playwright==1.41.0  # Deaktiviert für Render
```

In `backend/render-build.sh` entferne Playwright Installation komplett:
```bash
#!/usr/bin/env bash
set -o errexit

echo "🚀 Starting Render build process..."
pip install -r requirements.txt
echo "✅ Build complete! (Playwright skipped)"
```

**Dein Code fällt automatisch auf `requests` zurück** - kein Code-Change nötig!

---

## Option 2: Docker Container auf Render

Render bietet auch Docker Deployments mit Root-Rechten an.

Erstelle `Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install -r requirements.txt

# Install Playwright + deps (als Root)
RUN playwright install chromium
RUN playwright install-deps

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Dann in Render: **New → Docker Deployment**

---

## Empfehlung

Probiere erst den aktuellen Fix. Wenn es immer noch nicht geht:
- Für MVP: **Option 1** (Playwright deaktivieren)
- Für Production: **Option 2** (Docker mit Root)

Die meisten Websites funktionieren auch ohne Playwright perfekt! 🚀
