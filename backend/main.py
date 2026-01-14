"""
LeadScraper AI - FastAPI Backend
Main application file with API endpoints
"""

import os
import uuid
from datetime import datetime
from enum import Enum
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ============================================
# Pydantic Models - API Contract
# ============================================


class MaxRatingEnum(str, Enum):
    """Maximum rating threshold options"""
    ANY = "any"
    LESS_THAN_48 = "4.8"
    LESS_THAN_45 = "4.5"
    LESS_THAN_40 = "4.0"
    LESS_THAN_35 = "3.5"


class MaxPhotosEnum(str, Enum):
    """Maximum photo count threshold options"""
    ANY = "any"
    LESS_THAN_5 = "5"
    LESS_THAN_10 = "10"
    LESS_THAN_20 = "20"


class WebsiteStatusEnum(str, Enum):
    """Website presence filter options"""
    ANY = "any"
    HAS_WEBSITE = "has-website"
    NO_WEBSITE = "no-website"


class SniperFilters(BaseModel):
    """Advanced filters for 'Sniper Mode' - finding problematic leads"""
    maxRating: Optional[MaxRatingEnum] = Field(
        default="any", description="Maximum rating threshold"
    )
    minReviews: Optional[int] = Field(
        default=None, ge=0, description="Minimum number of reviews"
    )
    priceLevel: Optional[List[str]] = Field(
        default=[], description="Price levels: ['1', '2', '3', '4'] or ['any']"
    )
    mustHavePhone: Optional[bool] = Field(
        default=False, description="Only businesses with phone numbers"
    )
    maxPhotos: Optional[MaxPhotosEnum] = Field(
        default="any", description="Maximum photo count threshold"
    )
    websiteStatus: Optional[WebsiteStatusEnum] = Field(
        default="any", description="Website presence filter"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "maxRating": "4.5",
                "minReviews": 10,
                "priceLevel": ["1", "2"],
                "mustHavePhone": True,
                "maxPhotos": "10",
                "websiteStatus": "has-website"
            }
        }


class BulkScanRequest(BaseModel):
    """Request model matching frontend AnalysisForm component"""
    industry: str = Field(
        ..., min_length=1, description="Search keyword (e.g., 'Zahnarzt', 'Restaurant')"
    )
    location: str = Field(
        ..., min_length=1, description="City/Location (e.g., 'Zürich', 'Berlin')"
    )
    targetResults: int = Field(
        ..., ge=1, le=1000, description="Number of leads to find (1-1000)"
    )
    filters: Optional[SniperFilters] = Field(
        default_factory=SniperFilters, description="Sniper Mode filters"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "industry": "Zahnarzt",
                "location": "Zürich",
                "targetResults": 25,
                "filters": {
                    "maxRating": "4.5",
                    "minReviews": 10,
                    "priceLevel": ["1", "2"],
                    "mustHavePhone": True,
                    "maxPhotos": "10",
                    "websiteStatus": "has-website"
                }
            }
        }


class AnalysisResponse(BaseModel):
    """Response model matching frontend Analysis interface"""
    id: str
    website: str
    companyName: str
    email: str
    phone: Optional[str] = None
    location: str
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
    lastChecked: str
    issues: List[str] = Field(default_factory=list)
    source: Optional[str] = Field(
        default="Google Maps", pattern="^(Google Maps|Manual Input|CSV Import)$"
    )
    
    # Technical Details
    techStack: List[str] = Field(default_factory=list)
    hasAdsPixel: bool = False
    googleSpeedScore: int = Field(..., ge=0, le=100)
    loadingTime: str
    copyrightYear: int = Field(..., ge=1900, le=2100)
    
    # Lead Classification
    leadStrength: Optional[str] = Field(None, pattern="^(weak|medium|strong)$")
    
    # Google Maps Specific (optional)
    googleMapsRating: Optional[float] = Field(None, ge=0, le=5)
    googleMapsReviews: Optional[int] = Field(None, ge=0)
    googleMapsPriceLevel: Optional[int] = Field(None, ge=1, le=4)
    googleMapsPhotoCount: Optional[int] = Field(None, ge=0)
    googleMapsPlaceId: Optional[str] = None


class BulkScanResponse(BaseModel):
    """Response model for bulk scan endpoint"""
    analysisId: str = Field(..., description="UUID of the bulk analysis job")
    status: str = Field(..., description="'processing' | 'completed' | 'failed'")
    totalFound: int = Field(..., ge=0, description="Number of leads found matching filters")
    totalScanned: int = Field(..., ge=0, description="Total businesses scanned from Google Maps")
    leads: List[AnalysisResponse] = Field(
        default_factory=list, description="Array of Analysis objects"
    )
    message: str = Field(..., description="Status message")


# ============================================
# FastAPI Application
# ============================================

app = FastAPI(
    title="LeadScraper AI API",
    description="B2B SaaS API for finding high-value leads on Google Maps",
    version="1.0.0"
)

# CORS Middleware Configuration
cors_origins = os.getenv(
    "CORS_ORIGINS", "http://localhost:3000,http://localhost:3001"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# API Endpoints
# ============================================


@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "message": "LeadScraper AI API",
        "status": "running",
        "version": "1.0.0"
    }


@app.post("/api/v1/analyses/bulk-search", response_model=BulkScanResponse)
async def bulk_search(request: BulkScanRequest):
    """
    Bulk Google Maps Search endpoint
    
    Searches Google Maps for businesses matching the specified criteria
    and applies Sniper Mode filters to find high-value leads.
    """
    # Generate analysis ID
    analysis_id = str(uuid.uuid4())
    
    # Print received filters to console (for debugging)
    print("=" * 60)
    print("BULK SEARCH REQUEST RECEIVED")
    print("=" * 60)
    print(f"Analysis ID: {analysis_id}")
    print(f"Industry: {request.industry}")
    print(f"Location: {request.location}")
    print(f"Target Results: {request.targetResults}")
    print("\n--- SNIPER FILTERS ---")
    print(f"Max Rating: {request.filters.maxRating}")
    print(f"Min Reviews: {request.filters.minReviews}")
    print(f"Price Level: {request.filters.priceLevel}")
    print(f"Must Have Phone: {request.filters.mustHavePhone}")
    print(f"Max Photos: {request.filters.maxPhotos}")
    print(f"Website Status: {request.filters.websiteStatus}")
    print("=" * 60)
    
    # Return dummy response (to prove connection works)
    return BulkScanResponse(
        analysisId=analysis_id,
        status="processing",
        totalFound=0,
        totalScanned=0,
        leads=[],
        message=f"Bulk search initiated for {request.industry} in {request.location}. Processing..."
    )


@app.get("/api/v1/analyses")
async def list_analyses(
    limit: int = Query(default=50, ge=1, le=100, description="Number of results to return"),
    offset: int = Query(default=0, ge=0, description="Number of results to skip"),
    status: Optional[str] = Query(
        default=None, 
        description="Filter by status: 'completed' | 'analyzing' | 'failed'"
    ),
    leadStrength: Optional[str] = Query(
        default=None,
        description="Filter by lead strength: 'weak' | 'medium' | 'strong'"
    )
):
    """
    List all analyses
    
    Returns a paginated list of analysis results with optional filtering.
    """
    # TODO: Implement database query
    # For now, return empty list
    return {
        "analyses": [],
        "total": 0,
        "limit": limit,
        "offset": offset
    }


@app.get("/api/v1/analyses/{analysis_id}")
async def get_analysis_status(analysis_id: str):
    """
    Get analysis status by ID
    
    Returns the current status and progress of a bulk analysis job.
    """
    # TODO: Implement database query
    # For now, return dummy response
    return {
        "id": analysis_id,
        "status": "processing",
        "progress": {
            "scanned": 0,
            "found": 0,
            "target": 0
        },
        "leads": [],
        "createdAt": datetime.utcnow().isoformat() + "Z",
        "completedAt": None
    }


# ============================================
# Application Entry Point
# ============================================

if __name__ == "__main__":
    import uvicorn
    
    # Get configuration from environment variables
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", 8000))
    
    print(f"Starting LeadScraper AI API server on {host}:{port}")
    print(f"CORS origins: {cors_origins}")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,  # Auto-reload on code changes (development)
        log_level=os.getenv("LOG_LEVEL", "info").lower()
    )
