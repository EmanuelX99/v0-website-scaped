# Phase 5 Complete: Frontend-Backend Integration

## ✅ Completed Tasks

### 1. Frontend Updates (`app/page.tsx`)

**Added `handleBulkSearch` function:**
- Accepts industry, location, targetResults, and filters
- Converts frontend filter format to backend API format
- Makes POST request to `/api/v1/analyses/bulk-search`
- Handles response and updates `analyses` and `leads` state
- Provides error handling with user-friendly alerts

**Key Features:**
- Proper type conversion (string to int for minReviews, targetResults)
- Maps backend response fields to frontend Analysis interface
- Automatically generates leads for low-scoring analyses (<60)
- Logs requests and responses for debugging

### 2. Form Component Updates (`components/analysis-form.tsx`)

**Added `onBulkSearch` callback:**
- New optional prop in `AnalysisFormProps` interface
- Updated `handleGoogleMapsScan` to call real API instead of mock data
- Passes all filter values to the API
- Clears form and resets filters on successful search
- Shows loading state during API call

**Filter State Mapping:**
```typescript
{
  maxRating: string        // "any" | "4.8" | "4.5" | "4.0" | "3.5"
  minReviews: string       // converted to int
  priceLevel: string[]     // ["1", "2", "3", "4"] or []
  mustHavePhone: boolean   // true | false
  maxPhotos: string        // "any" | "5" | "10" | "20"
  websiteStatus: string    // "any" | "has-website" | "no-website"
}
```

### 3. Backend Integration

**API Endpoint:** `POST http://127.0.0.1:8000/api/v1/analyses/bulk-search`

**Request Format (matches frontend):**
```json
{
  "industry": "Restaurant",
  "location": "Berlin",
  "targetResults": 25,
  "filters": {
    "maxRating": "4.5",
    "minReviews": 10,
    "priceLevel": ["1", "2"],
    "mustHavePhone": true,
    "maxPhotos": "20",
    "websiteStatus": "has-website"
  }
}
```

**Response Format:**
```json
{
  "analysisId": "uuid",
  "status": "completed" | "partial" | "failed",
  "totalFound": 3,
  "totalScanned": 20,
  "leads": [
    {
      "id": "uuid",
      "website": "example.com",
      "companyName": "Example AG",
      "email": "info@example.com",
      "phone": "+41 44 123 45 67",
      "location": "Zürich, Switzerland",
      "industry": "Restaurant",
      "companySize": "1-10",
      "uiScore": 45,
      "seoScore": 42,
      "techScore": 50,
      "totalScore": 46,
      "status": "completed",
      "lastChecked": "2024-01-14T12:00:00Z",
      "issues": [],
      "source": "Google Maps",
      "techStack": ["WordPress"],
      "hasAdsPixel": true,
      "googleSpeedScore": 35,
      "loadingTime": "3.2s",
      "copyrightYear": 2020,
      "leadStrength": "medium",
      "googleMapsRating": 4.2,
      "googleMapsReviews": 150,
      "googleMapsPriceLevel": 2,
      "googleMapsPhotoCount": 25,
      "googleMapsPlaceId": "ChIJxxxxxx"
    }
  ],
  "message": "Found 3 leads matching criteria"
}
```

### 4. CORS Configuration

**Backend CORS settings:**
- Allows origins: `http://localhost:3000`, `http://localhost:3001`
- Allows all methods and headers
- Credentials enabled

**Note:** In production, restrict CORS origins to your actual frontend domain!

### 5. Test Script

Created `test_frontend_integration.sh` to verify:
- ✅ Backend is running
- ✅ API endpoint responds correctly
- ✅ Response structure matches frontend expectations
- ✅ All required fields are present

---

## 🚀 How to Test

### Step 1: Start Backend

```bash
cd backend
./start_server.sh &
```

**Verify it's running:**
```bash
curl http://127.0.0.1:8000/
# Expected: {"message": "LeadScraper AI API", "status": "running", "version": "1.0.0"}
```

### Step 2: Test API (Optional)

```bash
cd backend
./test_frontend_integration.sh
```

This will:
- Test simple search
- Test with filters
- Validate response structure

### Step 3: Start Frontend

In a **new terminal**:

```bash
cd /Users/emanuel/v0-website-scaped-1
npm run dev
```

**Expected output:**
```
> next dev
> ⚡️ Ready on http://localhost:3000
```

### Step 4: Test in Browser

1. Open `http://localhost:3000`
2. Switch to "Google Maps Bulk Search" mode
3. Enter search criteria:
   - **Industry:** "Cafe" or "Restaurant"
   - **Location:** "Berlin" or "Zürich"
   - **Count:** 3 (start small for testing)
4. **(Optional)** Open "Advanced Filters" and set some filters
5. Click "Start Google Maps Search"
6. Watch the table fill with results!

---

## 📊 Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER ACTION                                                  │
│    User fills form and clicks "Start Google Maps Search"       │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. FRONTEND (analysis-form.tsx)                                │
│    handleGoogleMapsScan() → calls onBulkSearch()               │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. FRONTEND (page.tsx)                                          │
│    handleBulkSearch() → fetch("http://127.0.0.1:8000/...")     │
│    - Converts filter types (string → int)                       │
│    - Sends JSON request                                         │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. BACKEND (main.py)                                            │
│    POST /api/v1/analyses/bulk-search                            │
│    - Validates request (Pydantic)                               │
│    - Calls analyzer.process_bulk_search()                       │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. BACKEND (analyzer.py)                                        │
│    DeepAnalyzer.process_bulk_search()                           │
│    - Fetches from RapidAPI                                      │
│    - Applies Sniper Filters                                     │
│    - Returns matching leads                                     │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. BACKEND (main.py)                                            │
│    - Converts DB format → Frontend format                       │
│    - Returns BulkScanResponse                                   │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. FRONTEND (page.tsx)                                          │
│    - Receives response                                          │
│    - Updates analyses state                                     │
│    - Updates leads state (if score < 60)                        │
│    - Table re-renders with new data                             │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. UI UPDATE                                                    │
│    User sees results in the table! 🎉                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Problem: "Failed to fetch" or network error

**Cause:** Backend not running or CORS issue

**Solution:**
1. Check backend is running: `curl http://127.0.0.1:8000/`
2. Check CORS settings in `backend/main.py`
3. Make sure frontend is making request to correct URL (127.0.0.1, not localhost)

### Problem: API returns "Invalid API key"

**Cause:** Environment variables not loaded or incorrect Supabase credentials

**Solution:**
1. Check `.env` file exists in `backend/` directory
2. Verify `SUPABASE_URL` and `SUPABASE_KEY` are correct
3. Restart backend: `pkill -9 -f "python main.py" && ./start_server.sh &`

### Problem: No leads found (totalFound: 0)

**Possible causes:**
1. **Filters too strict:** Try setting all filters to "any" first
2. **RapidAPI quota exceeded:** Check your RapidAPI dashboard
3. **Location not found:** Try different locations (Berlin, Zürich, München)

**Debug steps:**
```bash
# Test with no filters
curl -X POST http://127.0.0.1:8000/api/v1/analyses/bulk-search \
  -H "Content-Type: application/json" \
  -d '{
    "industry": "Restaurant",
    "location": "Berlin",
    "targetResults": 3,
    "filters": {
      "maxRating": "any",
      "minReviews": 0,
      "priceLevel": [],
      "mustHavePhone": false,
      "maxPhotos": "any",
      "websiteStatus": "any"
    }
  }'
```

### Problem: Response structure doesn't match frontend

**Cause:** Backend response format changed

**Solution:**
1. Check `backend/main.py` line 264-296 (field mapping)
2. Ensure all frontend fields are mapped from backend fields
3. Check console logs in browser dev tools for detailed error

---

## 🔍 Browser Console Debugging

Open browser DevTools (F12) → Console tab

You'll see logs like:
```
Starting bulk search... {industry: "Restaurant", location: "Berlin", ...}
Request body: {...}
API response: {...}
Successfully added 3 analyses
```

If errors occur, they'll appear here too!

---

## 📋 Field Mapping Reference

| Frontend (`Analysis`) | Backend (`AnalysisResponse`) | Database (`analyses`) |
|----------------------|------------------------------|----------------------|
| `id` | `id` | `id` |
| `website` | `website` | `website` |
| `companyName` | `companyName` | `company_name` |
| `email` | `email` | `email` |
| `phone` | `phone` | `business_phone` |
| `location` | `location` | `business_address` |
| `industry` | `industry` | `industry` |
| `companySize` | `companySize` | `company_size` |
| `uiScore` | `uiScore` | `ui_score` |
| `seoScore` | `seoScore` | `seo_score` |
| `techScore` | `techScore` | `tech_score` |
| `performanceScore` | `performanceScore` | `performance_score` |
| `securityScore` | `securityScore` | `security_score` |
| `mobileScore` | `mobileScore` | `mobile_score` |
| `totalScore` | `totalScore` | `total_score` |
| `status` | `status` | `status` |
| `lastChecked` | `lastChecked` | `last_checked` |
| `issues` | `issues` | `analysis_issues` table |
| `source` | `source` | `source` |
| `techStack` | `techStack` | `tech_stack` (array) |
| `hasAdsPixel` | `hasAdsPixel` | `has_ads_pixel` |
| `googleSpeedScore` | `googleSpeedScore` | `google_speed_score` |
| `loadingTime` | `loadingTime` | `loading_time` |
| `copyrightYear` | `copyrightYear` | `copyright_year` |
| N/A | `leadStrength` | `lead_strength` |
| N/A | `googleMapsRating` | `google_maps_rating` |
| N/A | `googleMapsReviews` | `google_maps_reviews` |
| N/A | `googleMapsPriceLevel` | `google_maps_price_level` |
| N/A | `googleMapsPhotoCount` | `google_maps_photo_count` |
| N/A | `googleMapsPlaceId` | `google_maps_place_id` |

---

## ⏭️ Next Steps (Phase 6)

Now that the frontend and backend are connected, the next phase will implement:

### Phase 6: AI & Website Analysis

1. **Gemini AI Integration**
   - Analyze website HTML
   - Generate UI/SEO/Tech scores
   - Extract critical issues

2. **Website Scraping**
   - Extract email addresses
   - Detect tech stack (WordPress, React, etc.)
   - Find copyright year
   - Detect ads pixels (Facebook, Google)

3. **PageSpeed Integration**
   - Get real performance scores
   - Measure loading times
   - Calculate mobile scores

4. **Background Processing**
   - Implement async job queue
   - Allow partial results (show leads as they're found)
   - Add progress tracking

---

## 📝 Summary

✅ **Frontend → Backend integration complete**
✅ **API contract validated**
✅ **Response structure matches expectations**
✅ **Filter mapping working correctly**
✅ **CORS configured**
✅ **Error handling implemented**

**Current limitations:**
- Scores are placeholders (Phase 6 will add real AI analysis)
- Email extraction not implemented yet
- Tech stack detection not implemented yet
- Website analysis is simulated

**The system is ready for Phase 6!** 🚀
