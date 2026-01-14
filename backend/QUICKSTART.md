# LeadScraper AI - Quick Start Guide

## ✅ Setup Complete!

All API connections have been verified and are working.

## 🚀 Start the Backend Server

### Option 1: Using the starter script (Recommended)

```bash
cd backend
./start_server.sh
```

### Option 2: Manual start

```bash
cd backend
source venv/bin/activate
python main.py
```

## 🌐 Access the API

Once the server is running:

- **API Endpoint**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs (Swagger UI)
- **Alternative Docs**: http://localhost:8000/redoc

## 🧪 Test the API

### Option 1: Using the browser

Open: http://localhost:8000/docs

Click on any endpoint and use the "Try it out" button.

### Option 2: Using curl

```bash
# Health check
curl http://localhost:8000

# Test bulk search endpoint (dummy response)
curl -X POST http://localhost:8000/api/v1/analyses/bulk-search \
  -H "Content-Type: application/json" \
  -d '{
    "industry": "Zahnarzt",
    "location": "Zürich",
    "targetResults": 25,
    "filters": {
      "maxRating": "4.5",
      "minReviews": 10,
      "priceLevel": ["1", "2"],
      "mustHavePhone": true,
      "maxPhotos": "10",
      "websiteStatus": "has-website"
    }
  }'
```

## 🔄 Run Tests Again

```bash
cd backend
./run_tests.sh
```

## 📊 Current Status

✅ **Supabase**: Connected and ready
✅ **RapidAPI**: Subscribed and working
✅ **Gemini AI**: Responding to requests
✅ **PageSpeed Insights**: Working

## 🎯 Next Steps

1. Start the backend server
2. Test the API endpoints
3. Connect your frontend (Next.js)
4. Start implementing the actual business logic

## 🛑 Stop the Server

Press `Ctrl + C` in the terminal where the server is running.

## 📚 Documentation

- Full Architecture: `../ARCHITECTURE.md`
- Detailed Setup: `README.md`
- API Specification: Check `/docs` when server is running

---

**Need Help?**

Run the setup guide again:
```bash
python setup_guide.py
```

Run API tests:
```bash
./run_tests.sh
```
