"""
LeadScraper AI - Deep Search Analyzer
Core business logic for finding high-value leads
"""

import os
import uuid
import logging
from typing import List, Dict, Optional, Any
from datetime import datetime

import requests
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger(__name__)


class DeepAnalyzer:
    """
    Main analyzer class for the Deep Search Engine
    Implements the pagination loop and Sniper Mode filters
    """
    
    def __init__(self):
        """Initialize the analyzer with API clients"""
        # Load environment variables explicitly
        load_dotenv()
        
        # RapidAPI Configuration
        self.rapidapi_key = os.getenv("RAPIDAPI_KEY")
        self.rapidapi_host = os.getenv("RAPIDAPI_HOST", "local-business-data.p.rapidapi.com")
        
        # Gemini AI Configuration
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        self.gemini_model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        
        # Supabase Configuration
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
        
        if not supabase_url:
            logger.error("SUPABASE_URL not found in environment")
            raise ValueError("SUPABASE_URL must be set in .env file")
        
        if not supabase_key:
            logger.error("SUPABASE_KEY not found in environment")
            raise ValueError("SUPABASE_KEY must be set in .env file")
        
        logger.info(f"Initializing Supabase client with URL: {supabase_url}")
        logger.info(f"Supabase key length: {len(supabase_key)}")
        
        try:
            # Try to create client
            self.supabase: Client = create_client(supabase_url, supabase_key)
            # Test the connection
            self.supabase.table("analyses").select("id").limit(1).execute()
            logger.info("✅ Supabase client created and tested successfully")
        except Exception as e:
            logger.error(f"⚠️  Supabase connection issue: {str(e)}")
            logger.warning("Continuing without database - leads will not be saved!")
            self.supabase = None  # Set to None to handle gracefully
        
        # Safety limits
        self.max_scan_limit = int(os.getenv("MAX_SCAN_LIMIT", 1000))
        self.rapidapi_timeout = int(os.getenv("RAPIDAPI_TIMEOUT", 30))
        
        logger.info("DeepAnalyzer initialized successfully")
    
    def process_bulk_search(
        self,
        industry: str,
        location: str,
        target_results: int,
        filters: Dict[str, Any],
        bulk_analysis_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Main Deep Search loop - finds leads matching filters using pagination
        
        Args:
            industry: Search keyword (e.g., "Zahnarzt", "Restaurant")
            location: City/Location (e.g., "Zürich", "Berlin")
            target_results: Number of leads to find (1-1000)
            filters: Sniper Mode filters dictionary
            bulk_analysis_id: UUID of the bulk analysis job
        
        Returns:
            Dictionary with results and statistics
        """
        logger.info(f"Starting bulk search: {industry} in {location}, target: {target_results}")
        
        # Initialize counters
        found_leads = []
        scanned_count = 0
        page_count = 0
        next_page_token = None
        
        # Build search query
        query = f"{industry} {location}"
        
        # Pagination loop
        while len(found_leads) < target_results and scanned_count < self.max_scan_limit:
            page_count += 1
            logger.info(f"Fetching page {page_count} (found: {len(found_leads)}/{target_results})")
            
            # Fetch page from RapidAPI
            try:
                businesses, next_token = self._fetch_google_maps_page(
                    query=query,
                    next_page_token=next_page_token
                )
            except Exception as e:
                logger.error(f"Failed to fetch page {page_count}: {str(e)}")
                break
            
            # Update next page token
            next_page_token = next_token
            
            # Check if we got results
            if not businesses:
                logger.warning("No more results from API")
                break
            
            scanned_count += len(businesses)
            logger.info(f"Scanned {len(businesses)} businesses (total scanned: {scanned_count})")
            
            # Apply Sniper Filters and save valid leads
            for business in businesses:
                # Check if we've reached target
                if len(found_leads) >= target_results:
                    break
                
                # Apply filters
                if not self._passes_filters(business, filters):
                    continue
                
                # Valid lead! Save to database
                try:
                    lead_data = self._save_lead_to_database(
                        business=business,
                        industry=industry,
                        bulk_analysis_id=bulk_analysis_id
                    )
                    found_leads.append(lead_data)
                    logger.info(f"✅ Lead saved: {business.get('name', 'Unknown')} ({len(found_leads)}/{target_results})")
                except Exception as e:
                    logger.error(f"Failed to save lead: {str(e)}")
                    continue
            
            # Check termination conditions
            if not next_page_token:
                logger.info("No more pages available")
                break
            
            if scanned_count >= self.max_scan_limit:
                logger.warning(f"Reached max scan limit: {self.max_scan_limit}")
                break
        
        # Final statistics
        result = {
            "total_found": len(found_leads),
            "total_scanned": scanned_count,
            "pages_fetched": page_count,
            "leads": found_leads,
            "status": "completed" if len(found_leads) >= target_results else "partial"
        }
        
        logger.info(f"Bulk search completed: {result['total_found']}/{target_results} leads found")
        return result
    
    def _fetch_google_maps_page(
        self,
        query: str,
        next_page_token: Optional[str] = None
    ) -> tuple[List[Dict], Optional[str]]:
        """
        Fetch a page of results from RapidAPI Google Maps
        
        Args:
            query: Search query
            next_page_token: Pagination token from previous request
        
        Returns:
            Tuple of (businesses list, next_page_token)
        """
        url = "https://local-business-data.p.rapidapi.com/search"
        
        headers = {
            "x-rapidapi-key": self.rapidapi_key,
            "x-rapidapi-host": self.rapidapi_host
        }
        
        params = {
            "query": query,
            "limit": "20",  # RapidAPI limit per page
            "language": "de",
            "region": "ch"
        }
        
        # Add pagination token if available
        if next_page_token:
            params["next_page_token"] = next_page_token
        
        try:
            response = requests.get(
                url,
                headers=headers,
                params=params,
                timeout=self.rapidapi_timeout
            )
            response.raise_for_status()
            
            data = response.json()
            
            # Extract businesses and next token
            businesses = data.get("data", [])
            next_token = data.get("next_page_token")
            
            return businesses, next_token
            
        except requests.exceptions.RequestException as e:
            logger.error(f"RapidAPI request failed: {str(e)}")
            raise
    
    def _passes_filters(self, business: Dict, filters: Dict[str, Any]) -> bool:
        """
        Apply Sniper Mode filters to a business
        
        Args:
            business: Business data from Google Maps
            filters: Filter criteria
        
        Returns:
            True if business passes all filters, False otherwise
        """
        business_name = business.get("name", "Unknown")
        
        # Extract business data
        rating = business.get("rating")
        review_count = business.get("review_count", 0)
        phone = business.get("phone_number") or business.get("phone")
        website = business.get("website")
        # RapidAPI uses 'photos_sample' or 'photo_count' field
        photo_count = business.get("photo_count", len(business.get("photos_sample", [])))
        business_status = business.get("business_status")
        # RapidAPI uses "OPEN" not "OPERATIONAL"
        is_operational = business_status in ["OPEN", "OPERATIONAL"] if business_status else True
        
        logger.debug(f"Checking {business_name}: rating={rating}, reviews={review_count}, phone={bool(phone)}, website={bool(website)}, photos={photo_count}, status={business_status}")
        
        # Filter 1: Max Rating
        max_rating = filters.get("maxRating", "any")
        if max_rating and max_rating != "any":
            if rating is not None:
                max_rating_float = float(max_rating)
                if rating > max_rating_float:
                    logger.debug(f"Filtered out: Rating {rating} > {max_rating_float}")
                    return False
        
        # Filter 2: Min Reviews
        min_reviews = filters.get("minReviews")
        if min_reviews and min_reviews > 0:
            if review_count < min_reviews:
                logger.debug(f"Filtered out: Reviews {review_count} < {min_reviews}")
                return False
        
        # Filter 3: Price Level
        price_level = filters.get("priceLevel", [])
        if price_level and len(price_level) > 0 and "any" not in price_level:
            business_price = str(business.get("price_level", ""))
            if business_price and business_price not in price_level:
                logger.debug(f"Filtered out: Price level {business_price} not in {price_level}")
                return False
        
        # Filter 4: Must Have Phone
        must_have_phone = filters.get("mustHavePhone", False)
        if must_have_phone and not phone:
            logger.debug("Filtered out: No phone number")
            return False
        
        # Filter 5: Max Photos
        max_photos = filters.get("maxPhotos", "any")
        if max_photos and max_photos != "any":
            max_photos_int = int(max_photos)
            if photo_count > max_photos_int:
                logger.debug(f"Filtered out: Photos {photo_count} > {max_photos_int}")
                return False
        
        # Filter 6: Website Status
        website_status = filters.get("websiteStatus", "any")
        if website_status and website_status != "any":
            if website_status == "has-website" and not website:
                logger.debug("Filtered out: No website (required)")
                return False
            elif website_status == "no-website" and website:
                logger.debug("Filtered out: Has website (excluded)")
                return False
        
        # Filter 7: Operational Status (implicit)
        # Only filter out if explicitly marked as NOT operational
        # (many businesses don't have this field, so we default to operational)
        if business_status and not is_operational:
            logger.debug(f"Filtered out: Not operational (status: {business_status})")
            return False
        
        # All filters passed
        logger.debug(f"✅ {business_name} passed all filters")
        return True
    
    def _save_lead_to_database(
        self,
        business: Dict,
        industry: str,
        bulk_analysis_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Save a valid lead to Supabase database
        
        Args:
            business: Business data from Google Maps
            industry: Industry category
            bulk_analysis_id: UUID of the bulk analysis job
        
        Returns:
            Saved lead data with ID
        """
        # Generate unique ID
        lead_id = str(uuid.uuid4())
        
        # Extract and clean data
        company_name = business.get("name", "Unknown Business")
        business_address = business.get("full_address") or business.get("address", "")
        business_phone = business.get("phone_number") or business.get("phone")
        website = business.get("website", "")
        rating = business.get("rating")
        review_count = business.get("review_count", 0)
        photo_count = len(business.get("photos", []))
        place_id = business.get("google_id") or business.get("place_id")
        
        # Calculate initial scores (placeholder - will be enhanced with AI later)
        total_score = self._calculate_initial_score(business)
        lead_strength = self._calculate_lead_strength(total_score, website)
        
        # Prepare data for database
        lead_data = {
            "id": lead_id,
            "website": website or f"no-website-{place_id}",
            "company_name": company_name,
            "email": "",  # Will be extracted later from website
            "business_phone": business_phone,
            "business_address": business_address,
            "industry": industry,
            "company_size": None,  # Unknown for now
            
            # Scores (initial placeholders)
            "ui_score": 0,
            "seo_score": 0,
            "tech_score": 0,
            "total_score": total_score,
            
            # Status
            "status": "completed" if not website else "analyzing",
            "last_checked": datetime.utcnow().isoformat(),
            "source": "Google Maps",
            
            # Technical details (placeholders)
            "tech_stack": [],
            "has_ads_pixel": False,
            "google_speed_score": 0,
            "loading_time": "0s",
            "copyright_year": datetime.utcnow().year,
            
            # Lead classification
            "lead_strength": lead_strength,
            
            # Google Maps specific
            "google_maps_rating": float(rating) if rating else None,
            "google_maps_reviews": review_count,
            "google_maps_photo_count": photo_count,
            "google_maps_place_id": place_id,
            
            # Relationships
            "bulk_analysis_id": bulk_analysis_id,
            
            # Timestamps
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # Insert into Supabase (upsert to handle duplicates)
        if self.supabase is None:
            logger.warning(f"Supabase not available - returning lead data without saving: {lead_id}")
            return lead_data
        
        try:
            response = self.supabase.table("analyses").upsert(
                lead_data,
                on_conflict="google_maps_place_id"
            ).execute()
            
            logger.debug(f"✅ Lead saved to database: {lead_id}")
            return lead_data
            
        except Exception as e:
            logger.error(f"⚠️  Database insert failed: {str(e)}")
            # Return data anyway (graceful degradation)
            return lead_data
    
    def _calculate_initial_score(self, business: Dict) -> int:
        """
        Calculate initial quality score based on Google Maps data
        Lower score = better lead (more problems to fix)
        
        Args:
            business: Business data
        
        Returns:
            Score 0-100 (lower is better for our use case)
        """
        score = 100  # Start with perfect score
        
        # Deduct points for problems (more problems = better lead)
        rating = business.get("rating")
        if rating and rating < 4.0:
            score -= 20  # Low rating = problem
        
        photo_count = len(business.get("photos", []))
        if photo_count < 10:
            score -= 15  # Few photos = problem
        
        if not business.get("website"):
            score -= 30  # No website = big problem
        
        review_count = business.get("review_count", 0)
        if review_count < 20:
            score -= 10  # Few reviews = less established
        
        # Ensure score is in range 0-100
        return max(0, min(100, score))
    
    def _calculate_lead_strength(self, total_score: int, website: str) -> str:
        """
        Calculate lead strength classification
        
        Args:
            total_score: Overall quality score
            website: Website URL (if any)
        
        Returns:
            "strong" | "medium" | "weak"
        """
        # Strong leads: Low score (lots of problems) + has website/budget
        if total_score < 50 and website:
            return "strong"
        
        # Medium leads: Some problems or potential
        elif total_score < 70:
            return "medium"
        
        # Weak leads: High score (not much to fix)
        else:
            return "weak"
    
    def analyze_website_with_ai(self, website_url: str) -> Dict[str, Any]:
        """
        Analyze a website using Gemini AI
        
        Args:
            website_url: URL to analyze
        
        Returns:
            Analysis results with scores and issues
        """
        # TODO: Implement Gemini AI website analysis
        # This will be implemented in Phase 5
        logger.info(f"AI analysis placeholder for: {website_url}")
        
        return {
            "ui_score": 50,
            "seo_score": 50,
            "tech_score": 50,
            "issues": ["Placeholder: Full AI analysis pending"]
        }


# Singleton instance
_analyzer_instance = None

def get_analyzer() -> DeepAnalyzer:
    """Get or create the analyzer singleton instance"""
    global _analyzer_instance
    if _analyzer_instance is None:
        _analyzer_instance = DeepAnalyzer()
    return _analyzer_instance
