# LeadScraper AI - Architecture Documentation

## Table of Contents
1. [Project Goal](#project-goal)
2. [Tech Stack](#tech-stack)
3. [API Specification](#api-specification)
4. [Database Schema](#database-schema)
5. [Logic Flow](#logic-flow)
6. [Environment Variables](#environment-variables)

---

## Project Goal

**LeadScraper AI** is a B2B SaaS platform that enables agencies to find high-value leads on Google Maps using deep filtering capabilities.

### Core Value Proposition
- **"Sniper Mode"**: Advanced filtering system to identify "problematic" leads (e.g., low ratings, no website, poor visuals) that are prime candidates for selling digital services
- **AI-Powered Analysis**: Automated website analysis using Gemini 1.5 Flash to assess UI, SEO, and technical quality
- **Lead Scoring**: Intelligent lead strength classification (weak/medium/strong) based on website quality and advertising presence

### Target Users
- Digital marketing agencies
- Web development agencies
- SEO consultants
- Freelancers offering website improvement services

### Key Features
1. **Bulk Google Maps Search**: Search businesses by industry and location with advanced filters
2. **Deep Website Analysis**: Automated analysis of website performance, SEO, and technical quality
3. **Lead Qualification**: Identify businesses with improvement potential (low scores, outdated sites, ads presence)
4. **Export & Reporting**: CSV export and detailed analysis reports for outreach

---

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **State Management**: React Hooks (useState, useEffect)

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Validation**: Pydantic v2
- **Server**: Uvicorn (ASGI)
- **Async Support**: Python asyncio

### Database
- **Primary DB**: Supabase (PostgreSQL 15+)
- **ORM/Query**: Supabase Python Client (or SQLAlchemy for complex queries)

### External APIs
- **Google Maps Data**: RapidAPI (Google Maps Data API)
- **AI Analysis**: Google Gemini 1.5 Flash
- **Performance Metrics**: Google PageSpeed Insights API
- **Web Scraping**: BeautifulSoup4 / Playwright (for website analysis)

### Infrastructure
- **Hosting**: TBD (Vercel for frontend, Railway/Render/Fly.io for backend)
- **Environment**: Python virtual environment
- **Package Management**: pip / poetry

---

## API Specification

### Base URL
```
http://localhost:8000/api/v1
```

### Endpoints

#### 1. Bulk Google Maps Search (`POST /api/v1/analyses/bulk-search`)

**Request Body Schema (Pydantic Model: `BulkScanRequest`)**

Based on the frontend form in `components/analysis-form.tsx`, the exact structure is:

```python
from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum

class MaxRatingEnum(str, Enum):
    ANY = "any"
    LESS_THAN_48 = "4.8"
    LESS_THAN_45 = "4.5"
    LESS_THAN_40 = "4.0"
    LESS_THAN_35 = "3.5"

class MaxPhotosEnum(str, Enum):
    ANY = "any"
    LESS_THAN_5 = "5"
    LESS_THAN_10 = "10"
    LESS_THAN_20 = "20"

class WebsiteStatusEnum(str, Enum):
    ANY = "any"
    HAS_WEBSITE = "has-website"
    NO_WEBSITE = "no-website"

class SniperFilters(BaseModel):
    """Advanced filters for 'Sniper Mode' - finding problematic leads"""
    maxRating: Optional[MaxRatingEnum] = Field(default="any", description="Maximum rating threshold")
    minReviews: Optional[int] = Field(default=None, ge=0, description="Minimum number of reviews")
    priceLevel: Optional[List[str]] = Field(default=[], description="Price levels: ['1', '2', '3', '4'] or ['any']")
    mustHavePhone: Optional[bool] = Field(default=False, description="Only businesses with phone numbers")
    maxPhotos: Optional[MaxPhotosEnum] = Field(default="any", description="Maximum photo count threshold")
    websiteStatus: Optional[WebsiteStatusEnum] = Field(default="any", description="Website presence filter")

class BulkScanRequest(BaseModel):
    """Request model matching frontend AnalysisForm component"""
    industry: str = Field(..., min_length=1, description="Search keyword (e.g., 'Zahnarzt', 'Restaurant')")
    location: str = Field(..., min_length=1, description="City/Location (e.g., 'Zürich', 'Berlin')")
    targetResults: int = Field(..., ge=1, le=1000, description="Number of leads to find (1-1000)")
    filters: Optional[SniperFilters] = Field(default_factory=SniperFilters, description="Sniper Mode filters")
```

**Example Request (matching frontend):**
```json
{
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
}
```

**Note:** The frontend currently doesn't include `operationalStatus` or `unclaimed` filters. These can be added in Phase 2 if needed.

**Response Schema (`BulkScanResponse`)**

```python
class BulkScanResponse(BaseModel):
    analysisId: str = Field(..., description="UUID of the bulk analysis job")
    status: str = Field(..., description="'processing' | 'completed' | 'failed'")
    totalFound: int = Field(..., ge=0, description="Number of leads found matching filters")
    totalScanned: int = Field(..., ge=0, description="Total businesses scanned from Google Maps")
    leads: List["AnalysisResponse"] = Field(default_factory=list, description="Array of Analysis objects")
    message: str = Field(..., description="Status message")
```

#### 2. Analysis Response Model (`AnalysisResponse`)

This model **exactly matches** the `Analysis` interface in `app/page.tsx`:

```python
class AnalysisResponse(BaseModel):
    """Response model matching frontend Analysis interface"""
    id: str
    website: str
    companyName: str
    email: str
    phone: Optional[str] = None  # Maps to 'business_phone' in database
    location: str  # Maps to 'business_address' in database
    industry: Optional[str] = None
    companySize: Optional[str] = Field(None, pattern="^(1-10|11-50|50\\+)$")
    
    # Scores (0-100)
    uiScore: int = Field(..., ge=0, le=100)
    seoScore: int = Field(..., ge=0, le=100)
    techScore: int = Field(..., ge=0, le=100)
    performanceScore: Optional[int] = Field(None, ge=0, le=100)
    securityScore: Optional[int] = Field(None, ge=0, le=100)
    mobileScore: Optional[int] = Field(None, ge=0, le=100)
    totalScore: int = Field(..., ge=0, le=100)
    
    # Status & Metadata
    status: str = Field(..., pattern="^(completed|analyzing|failed)$")
    lastChecked: str  # ISO 8601 timestamp or relative time string
    issues: List[str] = Field(default_factory=list)
    source: Optional[str] = Field(default="Google Maps", pattern="^(Google Maps|Manual Input|CSV Import)$")
    
    # Technical Details
    techStack: List[str] = Field(default_factory=list)
    hasAdsPixel: bool = False
    googleSpeedScore: int = Field(..., ge=0, le=100)
    loadingTime: str  # e.g., "2.5s"
    copyrightYear: int = Field(..., ge=1900, le=2100)
    
    # Lead Classification
    leadStrength: Optional[str] = Field(None, pattern="^(weak|medium|strong)$")
    
    # Google Maps Specific (optional, for future use)
    googleMapsRating: Optional[float] = Field(None, ge=0, le=5)
    googleMapsReviews: Optional[int] = Field(None, ge=0)
    googleMapsPriceLevel: Optional[int] = Field(None, ge=1, le=4)
    googleMapsPhotoCount: Optional[int] = Field(None, ge=0)
    googleMapsPlaceId: Optional[str] = None
```

#### 3. Single Website Analysis (`POST /api/v1/analyses/single`)

**Request:**
```json
{
  "website": "example.com"
}
```

**Response:** Same `AnalysisResponse` object.

#### 4. Get Analysis Status (`GET /api/v1/analyses/{analysisId}`)

**Response:**
```json
{
  "id": "uuid",
  "status": "processing",
  "progress": {
    "scanned": 50,
    "found": 12,
    "target": 25
  },
  "leads": [],
  "createdAt": "2024-01-01T00:00:00Z",
  "completedAt": null
}
```

#### 5. List All Analyses (`GET /api/v1/analyses`)

**Query Parameters:**
- `limit`: int (default: 50, max: 100)
- `offset`: int (default: 0)
- `status`: str (optional: "completed" | "analyzing" | "failed")
- `leadStrength`: str (optional: "weak" | "medium" | "strong")

**Response:**
```json
{
  "analyses": [...],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

---

## Database Schema

### Supabase PostgreSQL Schema

#### Table: `analyses`

This schema **exactly matches** the frontend `Analysis` interface and includes all fields displayed in the results table:

```sql
-- Main analyses table - stores individual lead analysis results
CREATE TABLE analyses (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Business Information (from Google Maps)
  website VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  business_phone VARCHAR(50),  -- Maps to 'phone' in frontend
  business_address TEXT NOT NULL,  -- Maps to 'location' in frontend
  industry VARCHAR(100),
  company_size VARCHAR(10) CHECK (company_size IN ('1-10', '11-50', '50+')),
  
  -- Quality Scores (0-100)
  ui_score INTEGER NOT NULL DEFAULT 0 CHECK (ui_score >= 0 AND ui_score <= 100),
  seo_score INTEGER NOT NULL DEFAULT 0 CHECK (seo_score >= 0 AND seo_score <= 100),
  tech_score INTEGER NOT NULL DEFAULT 0 CHECK (tech_score >= 0 AND tech_score <= 100),
  performance_score INTEGER CHECK (performance_score >= 0 AND performance_score <= 100),
  security_score INTEGER CHECK (security_score >= 0 AND security_score <= 100),
  mobile_score INTEGER CHECK (mobile_score >= 0 AND mobile_score <= 100),
  total_score INTEGER NOT NULL DEFAULT 0 CHECK (total_score >= 0 AND total_score <= 100),
  
  -- Status & Metadata
  status VARCHAR(20) NOT NULL DEFAULT 'analyzing' CHECK (status IN ('analyzing', 'completed', 'failed')),
  last_checked TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source VARCHAR(50) DEFAULT 'Google Maps' CHECK (source IN ('Google Maps', 'Manual Input', 'CSV Import')),
  
  -- Technical Analysis Results
  tech_stack TEXT[] DEFAULT '{}',  -- Array of detected technologies
  has_ads_pixel BOOLEAN NOT NULL DEFAULT FALSE,
  google_speed_score INTEGER NOT NULL DEFAULT 0 CHECK (google_speed_score >= 0 AND google_speed_score <= 100),
  loading_time VARCHAR(20) DEFAULT '0s',  -- e.g., "2.5s"
  copyright_year INTEGER NOT NULL CHECK (copyright_year >= 1900 AND copyright_year <= 2100),
  
  -- Lead Classification
  lead_strength VARCHAR(10) CHECK (lead_strength IN ('weak', 'medium', 'strong')),
  
  -- Google Maps Specific Data (for filtering and reference)
  google_maps_rating DECIMAL(2,1) CHECK (google_maps_rating >= 0 AND google_maps_rating <= 5),
  google_maps_reviews INTEGER DEFAULT 0,
  google_maps_price_level INTEGER CHECK (google_maps_price_level >= 1 AND google_maps_price_level <= 4),
  google_maps_photo_count INTEGER DEFAULT 0,
  google_maps_place_id VARCHAR(255) UNIQUE,
  
  -- Relationships
  bulk_analysis_id UUID REFERENCES bulk_analyses(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_analyses_status ON analyses(status);
CREATE INDEX idx_analyses_total_score ON analyses(total_score);
CREATE INDEX idx_analyses_lead_strength ON analyses(lead_strength);
CREATE INDEX idx_analyses_industry ON analyses(industry);
CREATE INDEX idx_analyses_bulk_analysis_id ON analyses(bulk_analysis_id);
CREATE INDEX idx_analyses_google_maps_place_id ON analyses(google_maps_place_id);
CREATE INDEX idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX idx_analyses_has_ads_pixel ON analyses(has_ads_pixel) WHERE has_ads_pixel = TRUE;
```

#### Table: `analysis_issues`

Normalized table for storing issues (alternative to storing as TEXT[] array):

```sql
CREATE TABLE analysis_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  issue_text TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analysis_issues_analysis_id ON analysis_issues(analysis_id);
CREATE INDEX idx_analysis_issues_severity ON analysis_issues(severity);
```

**Note:** For simplicity, you can also store `issues` as a `TEXT[]` array in the `analyses` table. The normalized approach allows for better querying and analytics.

#### Table: `bulk_analyses`

Tracks bulk search jobs:

```sql
CREATE TABLE bulk_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Search Parameters
  industry VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  target_results INTEGER NOT NULL CHECK (target_results > 0 AND target_results <= 1000),
  
  -- Filters (stored as JSONB for flexibility)
  filters JSONB DEFAULT '{}',
  
  -- Status & Progress
  status VARCHAR(20) NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  total_scanned INTEGER DEFAULT 0,
  total_found INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Error handling
  error_message TEXT
);

CREATE INDEX idx_bulk_analyses_status ON bulk_analyses(status);
CREATE INDEX idx_bulk_analyses_created_at ON bulk_analyses(created_at DESC);
```

### Field Mapping: Frontend ↔ Database

| Frontend (`Analysis` interface) | Database (`analyses` table) |
|--------------------------------|------------------------------|
| `id` | `id` |
| `website` | `website` |
| `companyName` | `company_name` |
| `email` | `email` |
| `phone` | `business_phone` |
| `location` | `business_address` |
| `industry` | `industry` |
| `companySize` | `company_size` |
| `uiScore` | `ui_score` |
| `seoScore` | `seo_score` |
| `techScore` | `tech_score` |
| `performanceScore` | `performance_score` |
| `securityScore` | `security_score` |
| `mobileScore` | `mobile_score` |
| `totalScore` | `total_score` |
| `status` | `status` |
| `lastChecked` | `last_checked` |
| `issues` | `analysis_issues` table (or `issues` TEXT[] if denormalized) |
| `source` | `source` |
| `techStack` | `tech_stack` (TEXT[]) |
| `hasAdsPixel` | `has_ads_pixel` |
| `googleSpeedScore` | `google_speed_score` |
| `loadingTime` | `loading_time` |
| `copyrightYear` | `copyright_year` |
| `leadStrength` | `lead_strength` |

---

## Logic Flow

### Deep Search Engine - "Sniper Mode" Algorithm

#### Overview
The backend implements a **pagination loop** that fetches businesses from RapidAPI Google Maps until it finds enough leads matching the strict "Sniper Filters". **Filtering happens FIRST** on raw API data before any expensive website analysis.

#### Step-by-Step Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. RECEIVE REQUEST                                          │
│    ├─ Validate BulkScanRequest (Pydantic)                  │
│    ├─ Create bulk_analysis record (status: 'processing')    │
│    └─ Return analysisId immediately (async processing)     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. INITIALIZE SEARCH                                         │
│    ├─ Set pagination_token = None                           │
│    ├─ Set found_leads = []                                  │
│    ├─ Set scanned_count = 0                                 │
│    └─ Set target_count = request.targetResults               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. PAGINATION LOOP (while len(found_leads) < target_count) │
│                                                              │
│    ┌────────────────────────────────────────────────────┐   │
│    │ 3.1 FETCH PAGE FROM RAPIDAPI                       │   │
│    │    ├─ Call RapidAPI Google Maps Search endpoint    │   │
│    │    ├─ Query: industry + location                  │   │
│    │    ├─ Include pagination_token if available        │   │
│    │    └─ Receive: businesses[] + next_page_token     │   │
│    └────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│    ┌────────────────────────────────────────────────────┐   │
│    │ 3.2 APPLY SNIPER FILTERS (Filter First!)          │   │
│    │    For each business in businesses[]:              │   │
│    │                                                     │   │
│    │    ├─ Check maxRating:                             │   │
│    │    │   if filters.maxRating != "any":              │   │
│    │    │     if business.rating > float(filters.maxRating): │
│    │    │       continue  # Skip                        │   │
│    │    │                                                 │   │
│    │    ├─ Check minReviews:                            │   │
│    │    │   if filters.minReviews and                   │   │
│    │    │      business.review_count < filters.minReviews: │
│    │    │     continue  # Skip                          │   │
│    │    │                                                 │   │
│    │    ├─ Check priceLevel:                            │   │
│    │    │   if filters.priceLevel and len > 0:          │   │
│    │    │     if "any" in filters.priceLevel:           │   │
│    │    │       pass  # No filter                       │   │
│    │    │     elif business.price_level not in filters.priceLevel: │
│    │    │       continue  # Skip                       │   │
│    │    │                                                 │   │
│    │    ├─ Check mustHavePhone:                          │   │
│    │    │   if filters.mustHavePhone and not business.phone: │
│    │    │     continue  # Skip                          │   │
│    │    │                                                 │   │
│    │    ├─ Check maxPhotos:                              │   │
│    │    │   if filters.maxPhotos != "any":              │   │
│    │    │     max_photos_int = int(filters.maxPhotos)    │   │
│    │    │     if business.photo_count > max_photos_int:  │   │
│    │    │       continue  # Skip                        │   │
│    │    │                                                 │   │
│    │    ├─ Check websiteStatus:                          │   │
│    │    │   if filters.websiteStatus == "has-website":   │   │
│    │    │     if not business.website:                  │   │
│    │    │       continue  # Skip                        │   │
│    │    │   elif filters.websiteStatus == "no-website":  │   │
│    │    │     if business.website:                      │   │
│    │    │       continue  # Skip                        │   │
│    │    │                                                 │   │
│    │    └─ If ALL filters pass → Add to found_leads[]   │   │
│    │                                                      │   │
│    └─ Update scanned_count += len(businesses)            │   │
│                          ↓                                   │
│    ┌────────────────────────────────────────────────────┐   │
│    │ 3.3 PROCESS VALID LEADS (Parallel, up to target)  │   │
│    │    For each lead in found_leads[]:                 │   │
│    │                                                     │   │
│    │    ├─ Extract website URL (if exists)               │   │
│    │    │                                                 │   │
│    │    ├─ Run Website Analysis Pipeline:               │   │
│    │    │   ├─ PageSpeed Insights API                    │   │
│    │    │   │   → googleSpeedScore, loadingTime         │   │
│    │    │   ├─ Web Scraping (BeautifulSoup/Playwright)  │   │
│    │    │   │   → techStack, copyrightYear, hasAdsPixel │   │
│    │    │   └─ Gemini AI Analysis                       │   │
│    │    │       → uiScore, seoScore, techScore, issues[] │   │
│    │    │                                                 │   │
│    │    ├─ Extract Contact Info:                        │   │
│    │    │   ├─ Email (from website scraping)            │   │
│    │    │   └─ Phone (from Google Maps data)           │   │
│    │    │                                                 │   │
│    │    ├─ Calculate Scores:                            │   │
│    │    │   totalScore = round(                         │   │
│    │    │     (uiScore + seoScore + techScore +         │   │
│    │    │      (performanceScore or 0) +                 │   │
│    │    │      (securityScore or 0) +                    │   │
│    │    │      (mobileScore or 0)) / 6                  │   │
│    │    │   )                                            │   │
│    │    │                                                 │   │
│    │    ├─ Calculate leadStrength:                      │   │
│    │    │   if totalScore < 50 and hasAdsPixel:         │   │
│    │    │     leadStrength = "strong"                   │   │
│    │    │   elif totalScore < 60 or hasAdsPixel:        │   │
│    │    │     leadStrength = "medium"                    │   │
│    │    │   else:                                        │   │
│    │    │     leadStrength = "weak"                     │   │
│    │    │                                                 │   │
│    │    └─ Save to analyses table                       │   │
│    │                                                      │   │
│    └─ Update bulk_analysis.total_found                    │   │
│                          ↓                                   │
│    ┌────────────────────────────────────────────────────┐   │
│    │ 3.4 CHECK TERMINATION CONDITIONS                    │   │
│    │    ├─ If len(found_leads) >= target_count:         │   │
│    │    │   BREAK (success)                             │   │
│    │    ├─ If next_page_token IS NULL:                  │   │
│    │    │   BREAK (no more results)                     │   │
│    │    ├─ If scanned_count > MAX_SCAN_LIMIT (1000):    │   │
│    │    │   BREAK (safety limit)                        │   │
│    │    └─ Otherwise: Continue loop with next_page_token │   │
│    └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. FINALIZE                                                  │
│    ├─ Update bulk_analysis:                                │
│    │   ├─ status = 'completed'                            │
│    │   ├─ total_scanned = scanned_count                    │
│    │   ├─ total_found = len(found_leads)                  │
│    │   └─ completed_at = NOW()                            │
│    └─ Return response with all leads                       │
└─────────────────────────────────────────────────────────────┘
```

#### Filter Logic Implementation (Python Pseudocode)

```python
def apply_sniper_filters(business: dict, filters: SniperFilters) -> bool:
    """
    Apply all sniper filters to a business.
    Returns True if business passes all filters, False otherwise.
    """
    # Max Rating Filter
    if filters.maxRating and filters.maxRating != "any":
        max_rating = float(filters.maxRating)
        if business.get("rating", 5.0) > max_rating:
            return False
    
    # Min Reviews Filter
    if filters.minReviews and filters.minReviews > 0:
        if business.get("review_count", 0) < filters.minReviews:
            return False
    
    # Price Level Filter
    if filters.priceLevel and len(filters.priceLevel) > 0:
        if "any" not in filters.priceLevel:
            business_price_level = str(business.get("price_level", ""))
            if business_price_level not in filters.priceLevel:
                return False
    
    # Must Have Phone Filter
    if filters.mustHavePhone:
        if not business.get("phone"):
            return False
    
    # Max Photos Filter
    if filters.maxPhotos and filters.maxPhotos != "any":
        max_photos = int(filters.maxPhotos)
        if business.get("photo_count", 0) > max_photos:
            return False
    
    # Website Status Filter
    if filters.websiteStatus and filters.websiteStatus != "any":
        has_website = bool(business.get("website"))
        if filters.websiteStatus == "has-website" and not has_website:
            return False
        elif filters.websiteStatus == "no-website" and has_website:
            return False
    
    return True  # All filters passed
```

#### Lead Strength Calculation

```python
def calculate_lead_strength(total_score: int, has_ads_pixel: bool) -> str:
    """
    Calculate lead strength based on score and ads pixel presence.
    Strong leads = low score + ads pixel (spending money but site is bad)
    """
    if total_score < 50 and has_ads_pixel:
        return "strong"  # High priority: spending on ads but site is terrible
    elif total_score < 60 or has_ads_pixel:
        return "medium"  # Moderate priority: either low score or has budget
    else:
        return "weak"  # Lower priority: decent site or no ad spend
```

#### Website Analysis Pipeline

For each valid lead with a website:

1. **PageSpeed Insights API**
   ```python
   # Input: Website URL
   # Output: googleSpeedScore (0-100), loadingTime (seconds)
   response = pagespeed_api.runpagespeed(url=website_url)
   googleSpeedScore = response["lighthouseResult"]["categories"]["performance"]["score"] * 100
   loadingTime = response["lighthouseResult"]["audits"]["speed-index"]["displayValue"]
   ```

2. **Web Scraping** (BeautifulSoup4/Playwright)
   ```python
   # Extract techStack from:
   # - Meta tags (generator, powered-by)
   # - Script sources (jQuery, React, WordPress)
   # - HTML structure patterns
   
   # Extract copyrightYear from footer
   # Detect hasAdsPixel (Facebook Pixel, Google Analytics, etc.)
   ```

3. **Gemini AI Analysis**
   ```python
   # Prompt: "Analyze this website HTML and provide:
   # - UI Score (0-100): Design quality, modern patterns
   # - SEO Score (0-100): Meta tags, structured data, optimization
   # - Tech Score (0-100): Code quality, security, best practices
   # - List critical issues (array of strings)"
   
   response = gemini_client.generate_content(prompt + html_content)
   # Parse response to extract scores and issues
   ```

4. **Calculate Total Score**
   ```python
   scores = [ui_score, seo_score, tech_score]
   if performance_score:
       scores.append(performance_score)
   if security_score:
       scores.append(security_score)
   if mobile_score:
       scores.append(mobile_score)
   
   total_score = round(sum(scores) / len(scores))
   ```

---

## Environment Variables

### Required Environment Variables

Create a `.env` file in the backend root directory:

```bash
# ============================================
# Database (Supabase)
# ============================================
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ============================================
# RapidAPI (Google Maps)
# ============================================
RAPIDAPI_KEY=your-rapidapi-key
RAPIDAPI_HOST=google-maps-data.p.rapidapi.com
RAPIDAPI_GOOGLE_MAPS_ENDPOINT=https://google-maps-data.p.rapidapi.com/search

# ============================================
# Google APIs
# ============================================
GOOGLE_PAGESPEED_API_KEY=your-google-pagespeed-api-key
GOOGLE_PAGESPEED_ENDPOINT=https://www.googleapis.com/pagespeedonline/v5/runPagespeed

# ============================================
# Gemini AI
# ============================================
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-1.5-flash

# ============================================
# Application Configuration
# ============================================
API_HOST=0.0.0.0
API_PORT=8000
API_ENV=development  # development | production
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# ============================================
# Rate Limiting & Timeouts
# ============================================
RAPIDAPI_RATE_LIMIT_PER_MINUTE=60
PAGESPEED_RATE_LIMIT_PER_MINUTE=400
GEMINI_RATE_LIMIT_PER_MINUTE=60

RAPIDAPI_TIMEOUT=30
PAGESPEED_TIMEOUT=60
GEMINI_TIMEOUT=30
WEBSITE_SCRAPING_TIMEOUT=15

# ============================================
# Safety Limits
# ============================================
MAX_SCAN_LIMIT=1000  # Maximum businesses to scan per bulk search
MAX_CONCURRENT_ANALYSES=5  # Parallel website analyses

# ============================================
# Logging
# ============================================
LOG_LEVEL=INFO  # DEBUG | INFO | WARNING | ERROR
```

### Optional Environment Variables

```bash
# ============================================
# Redis (for caching and job queues - optional)
# ============================================
REDIS_URL=redis://localhost:6379
REDIS_TTL=3600  # Cache TTL in seconds

# ============================================
# Sentry (error tracking - optional)
# ============================================
SENTRY_DSN=your-sentry-dsn

# ============================================
# Email (for notifications - optional)
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Environment-Specific Files

- `.env.development` - Development environment
- `.env.production` - Production environment
- `.env.local` - Local overrides (gitignored)

---

## Implementation Notes

### API Rate Limits & Best Practices

1. **RapidAPI Google Maps:**
   - Typical limit: 60 requests/minute
   - Implement exponential backoff on 429 errors
   - Cache pagination tokens

2. **Google PageSpeed Insights:**
   - Free tier: 25,000 requests/day
   - Paid tier: Higher limits
   - Batch requests when possible

3. **Gemini AI:**
   - Free tier: 15 RPM (requests per minute)
   - Paid tier: Higher limits
   - Batch analysis requests

### Error Handling

- **RapidAPI Rate Limit Exceeded**: Wait and retry with exponential backoff
- **Invalid Google Maps Query**: Validate input before API call
- **Website Unreachable**: Mark lead as `status='failed'`, continue processing
- **Database Connection Lost**: Retry with connection pool
- **Gemini API Timeout**: Use fallback scoring algorithm, log error

### Security Considerations

1. **API Keys**: Never expose in frontend code, store in environment variables
2. **Input Validation**: Validate all user inputs (Pydantic models)
3. **Rate Limiting**: Implement per-user rate limits
4. **CORS**: Configure allowed origins, don't use wildcard in production
5. **Database**: Use connection pooling, implement row-level security (Supabase RLS)

---

## Next Steps (Phase 1 Implementation)

1. ✅ Create `ARCHITECTURE.md` (this document)
2. ⏭️ Set up FastAPI project structure
3. ⏭️ Implement Pydantic models (`BulkScanRequest`, `AnalysisResponse`)
4. ⏭️ Create database migrations (Supabase)
5. ⏭️ Implement RapidAPI Google Maps integration
6. ⏭️ Implement filter logic (Sniper Mode)
7. ⏭️ Implement website analysis pipeline
8. ⏭️ Implement Gemini AI integration
9. ⏭️ Create API endpoints
10. ⏭️ Add error handling and logging
11. ⏭️ Write tests
12. ⏭️ Deploy backend

---

## Future Enhancements (Phase 2+)

1. **Caching Layer**: Redis for frequently accessed data
2. **Webhook Support**: Notify frontend when bulk search completes
3. **Export Formats**: CSV export endpoint, PDF report generation
4. **Advanced Filtering**: Geographic radius, business hours, review sentiment
5. **Analytics Dashboard**: Track search success rates, monitor API usage
6. **Operational Status Filter**: Add "unclaimed" and "closed" filters to frontend
