"""
LeadScraper AI - Deep Search Analyzer
Core business logic for finding high-value leads
"""

import os
import uuid
import logging
import json
import re
from typing import List, Dict, Optional, Any
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

import requests
from supabase import create_client, Client
from dotenv import load_dotenv
import google.generativeai as genai

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
        
        # Thread-safety lock for parallel processing
        self._print_lock = threading.Lock()
        
        # RapidAPI Configuration
        self.rapidapi_key = os.getenv("RAPIDAPI_KEY")
        self.rapidapi_host = os.getenv("RAPIDAPI_HOST", "local-business-data.p.rapidapi.com")
        
        # Gemini AI Configuration
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        self.gemini_model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        
        # Initialize Gemini if API key is available
        if self.gemini_api_key:
            genai.configure(api_key=self.gemini_api_key)
            logger.info(f"✅ Gemini AI configured with model: {self.gemini_model}")
        else:
            logger.warning("⚠️  GEMINI_API_KEY not found - AI analysis will be limited")
        
        # Google PageSpeed Configuration
        self.google_cloud_api_key = os.getenv("GOOGLE_CLOUD_API_KEY") or os.getenv("GOOGLE_PAGESPEED_API_KEY")
        self.pagespeed_endpoint = os.getenv("GOOGLE_PAGESPEED_ENDPOINT", "https://www.googleapis.com/pagespeedonline/v5/runPagespeed")
        
        if self.google_cloud_api_key:
            logger.info("✅ Google PageSpeed API configured")
        else:
            logger.warning("⚠️  GOOGLE_CLOUD_API_KEY not found - PageSpeed analysis will be skipped")
        
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
        bulk_analysis_id: Optional[str] = None,
        stream_callback: Optional[callable] = None
    ) -> Dict[str, Any]:
        """
        Main Deep Search loop - finds leads matching filters using pagination
        
        Args:
            industry: Search keyword (e.g., "Zahnarzt", "Restaurant")
            location: City/Location (e.g., "Zürich", "Berlin")
            target_results: Number of leads to find (1-1000)
            filters: Sniper Mode filters dictionary
            bulk_analysis_id: UUID of the bulk analysis job
            stream_callback: Optional callback function for streaming results (called for each completed lead)
        
        Returns:
            Dictionary with results and statistics (includes stream_events if callback provided)
        """
        print("\n" + "🚀 "*30)
        print(f"🚀 BULK SEARCH STARTED")
        print(f"   Industry: {industry}")
        print(f"   Location: {location}")
        print(f"   Target: {target_results} leads")
        print("🚀 "*30 + "\n")
        
        logger.info(f"Starting bulk search: {industry} in {location}, target: {target_results}")
        
        # Initialize counters
        found_leads = []
        scanned_count = 0
        page_count = 0
        next_page_token = None
        
        # Build search query
        query = f"{industry} {location}"
        print(f"🔍 Search Query: {query}\n")
        
        # Pagination loop
        while len(found_leads) < target_results and scanned_count < self.max_scan_limit:
            page_count += 1
            print(f"\n📄 Page {page_count} | Progress: {len(found_leads)}/{target_results} leads found")
            logger.info(f"Fetching page {page_count} (found: {len(found_leads)}/{target_results})")
            
            # Fetch page from RapidAPI
            try:
                businesses, next_token = self._fetch_google_maps_page(
                    query=query,
                    next_page_token=next_page_token
                )
            except Exception as e:
                print(f"❌ Failed to fetch page {page_count}: {str(e)}")
                logger.error(f"Failed to fetch page {page_count}: {str(e)}")
                break
            
            # Update next page token
            next_page_token = next_token
            
            # Check if we got results
            if not businesses:
                print("⚠️  No more results from API")
                logger.warning("No more results from API")
                break
            
            scanned_count += len(businesses)
            print(f"   Scanned: {len(businesses)} businesses (total: {scanned_count})")
            logger.info(f"Scanned {len(businesses)} businesses (total scanned: {scanned_count})")
            
            # Apply Sniper Filters to collect valid businesses
            print(f"\n🔍 Applying Sniper Filters...")
            passed_businesses = []
            
            for idx, business in enumerate(businesses, 1):
                # Check if we've reached target
                if len(found_leads) >= target_results:
                    print(f"   🎯 Target reached! Stopping scan.")
                    break
                
                business_name = business.get('name', 'Unknown')
                
                # Apply filters
                if not self._passes_filters(business, filters):
                    continue
                
                print(f"   ✅ {idx}. {business_name[:40]} - PASSED filters")
                passed_businesses.append(business)
                
                # Stop collecting if we have enough to reach target
                if len(passed_businesses) + len(found_leads) >= target_results:
                    break
            
            if len(passed_businesses) == 0:
                print(f"   ⚠️  No businesses passed filters on this page")
                continue
            
            # Process leads in parallel (3 at a time)
            print(f"\n🚀 Processing {len(passed_businesses)} leads in parallel (max 3 concurrent)...")
            
            def analyze_business(business):
                """Helper function to analyze a single business (thread-safe)"""
                business_name = business.get('name', 'Unknown')
                try:
                    website = business.get("website")
                    
                    if website:
                        # Full AI Analysis (PageSpeed + Security + Gemini)
                        lead_data = self.analyze_single(
                            url=website,
                            map_data=business,
                            bulk_analysis_id=None,
                            industry=industry
                        )
                    else:
                        # No website - save basic data without AI analysis
                        print(f"   ⏭️  {business_name[:40]}: No website - saving basic data only")
                        lead_data = self._save_lead_to_database(
                            business=business,
                            industry=industry,
                            bulk_analysis_id=None
                        )
                    
                    return {"success": True, "data": lead_data, "name": business_name}
                except Exception as e:
                    logger.error(f"Failed to process {business_name}: {str(e)}")
                    return {"success": False, "error": str(e), "name": business_name}
            
            # Use ThreadPoolExecutor for parallel processing
            with ThreadPoolExecutor(max_workers=3) as executor:
                # Submit all businesses to the thread pool
                futures = {executor.submit(analyze_business, biz): biz for biz in passed_businesses}
                
                # Process results as they complete
                for future in as_completed(futures):
                    result = future.result()
                    
                    if result["success"]:
                        found_leads.append(result["data"])
                        print(f"   💾 Lead complete! {result['name'][:40]} ({len(found_leads)}/{target_results})")
                        logger.info(f"✅ Lead saved: {result['name']} ({len(found_leads)}/{target_results})")
                        
                        # Call streaming callback if provided (for real-time updates)
                        if stream_callback:
                            try:
                                stream_callback(result["data"])
                            except Exception as e:
                                logger.error(f"Stream callback error: {str(e)}")
                    else:
                        print(f"   ❌ Analysis failed: {result['name'][:40]} - {result['error'][:80]}")
                    
                    # Check if we've reached target
                    if len(found_leads) >= target_results:
                        break
            
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
        
        # Print final summary
        print("\n" + "🏁 "*30)
        print(f"🏁 BULK SEARCH COMPLETE")
        print(f"   Status: {result['status'].upper()}")
        print(f"   Found: {result['total_found']}/{target_results} leads")
        print(f"   Scanned: {result['total_scanned']} businesses")
        print(f"   Pages: {result['pages_fetched']}")
        print("🏁 "*30 + "\n")
        
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
        # Use the configured endpoint URL (from .env)
        # Local Business Data API uses /search (not /maps/search)
        url = f"https://{self.rapidapi_host}/search"
        
        headers = {
            "x-rapidapi-key": self.rapidapi_key,
            "x-rapidapi-host": self.rapidapi_host
        }
        
        params = {
            "query": query,
            "limit": "20",  # Max results per page
            "language": "de",
            "region": "ch"
        }
        
        # Local Business Data API uses 'offset' instead of 'next_page_token'
        # For now, we'll handle pagination differently if needed
        # (this API doesn't provide a next_page_token)
        
        print(f"⏳ Calling RapidAPI: {url}")
        print(f"   Query: {query}")
        
        try:
            response = requests.get(
                url,
                headers=headers,
                params=params,
                timeout=15  # 15 second timeout
            )
            response.raise_for_status()
            
            response_data = response.json()
            
            # Local Business Data API returns data under 'data' key
            businesses = response_data.get("data", [])
            
            print(f"✅ RapidAPI done: {len(businesses)} businesses found")
            
            # This API doesn't provide next_page_token
            # We return None to stop pagination after first page
            next_token = None
            
            return businesses, next_token
            
        except requests.exceptions.Timeout:
            print(f"❌ RapidAPI Timeout after 15s")
            logger.error(f"RapidAPI timeout for query: {query}")
            return [], None
            
        except requests.exceptions.RequestException as e:
            print(f"❌ RapidAPI Error: {str(e)}")
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
        
        # Extract business data (Local Business Data API format)
        rating = business.get("rating")
        review_count = business.get("review_count", 0)
        phone = business.get("phone_number")  # Local Business Data uses 'phone_number'
        website = business.get("website")
        # Use photo_count field directly
        photo_count = business.get("photo_count", 0)
        business_status = business.get("business_status")
        # Business status: "OPEN", "CLOSED", etc.
        is_operational = business_status == "OPEN" if business_status else True
        
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
        
        # Extract and clean data (Local Business Data API format)
        company_name = business.get("name", "Unknown Business")
        business_address = business.get("full_address", "")
        business_phone = business.get("phone_number")
        website = business.get("website", "")
        rating = business.get("rating")
        review_count = business.get("review_count", 0)
        photo_count = business.get("photo_count", 0)
        place_id = business.get("place_id") or business.get("google_id")
        
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
            
            # Timestamps
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # Only add bulk_analysis_id if it's provided (optional relationship)
        if bulk_analysis_id:
            lead_data["bulk_analysis_id"] = bulk_analysis_id
        
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
    
    def analyze_single(
        self,
        url: Optional[str],
        map_data: Dict[str, Any],
        bulk_analysis_id: Optional[str] = None,
        industry: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Complete AI analysis combining PageSpeed Insights and Gemini AI
        
        Args:
            url: Website URL (can be None/Empty)
            map_data: Business data from Google Maps
            bulk_analysis_id: UUID of the bulk analysis job
        
        Returns:
            Complete analysis with scores, report, and pitch
        """
        print("\n" + "="*60)
        print(f"🔍 Starting AI Analysis")
        print(f"   Business: {map_data.get('name', 'Unknown')}")
        print(f"   Website: {url if url else '❌ NO WEBSITE'}")
        print("="*60)
        
        logger.info(f"Starting AI analysis for: {map_data.get('name', 'Unknown')}")
        
        # Clean URL
        url = url.strip() if url else None
        has_website = bool(url and url != "")
        
        # Step 1: PageSpeed Insights (if website exists)
        pagespeed_data = None
        if has_website:
            print("\n📊 Step 1/4: PageSpeed Insights")
            pagespeed_data = self._fetch_pagespeed_data(url)
        else:
            print("\n📊 Step 1/4: PageSpeed (skipped - no website)")
        
        # Step 2: Security Header Audit (if website exists)
        security_data = None
        if has_website:
            print("\n🔒 Step 2/4: Security Header Audit")
            security_data = self._fetch_website_for_security_check(url)
        else:
            print("\n🔒 Step 2/4: Security Audit (skipped - no website)")
        
        # Step 3: Gemini AI Analysis
        print("\n🤖 Step 3/4: Gemini AI Analysis")
        gemini_data = self._analyze_with_gemini(url, map_data, pagespeed_data, security_data)
        
        # Step 4: Merge all data
        print("\n🔗 Step 4/4: Merging Data & Saving")
        complete_analysis = self._merge_analysis_data(
            url=url,
            map_data=map_data,
            pagespeed_data=pagespeed_data,
            security_data=security_data,
            gemini_data=gemini_data,
            bulk_analysis_id=bulk_analysis_id,
            industry=industry
        )

        # Build API-friendly issues list (not persisted to Supabase)
        issues_for_ui: List[str] = []
        if security_data and security_data.get("security_issues"):
            issues_for_ui.extend(security_data.get("security_issues", [])[:3])

        if has_website:
            if pagespeed_data is None:
                issues_for_ui.append("PageSpeed: Timeout / Unavailable")
            else:
                ps = pagespeed_data.get("performance_score")
                if isinstance(ps, int) and ps < 50:
                    issues_for_ui.append(f"Low PageSpeed score ({ps}/100)")

        issues_for_ui.extend(gemini_data.get("report_card", {}).get("issues_found", []) or [])

        # De-duplicate while preserving order
        deduped: List[str] = []
        seen = set()
        for issue in issues_for_ui:
            if not issue or not isinstance(issue, str):
                continue
            if issue in seen:
                continue
            seen.add(issue)
            deduped.append(issue)
        issues_for_ui = deduped[:10]
        
        # Step 4: Save to database
        if self.supabase:
            try:
                print("💾 Saving to Supabase...")
                self.supabase.table("analyses").upsert(
                    complete_analysis,
                    on_conflict="google_maps_place_id"
                ).execute()
                print(f"✅ Saved to database: {complete_analysis['id']}")
                logger.info(f"✅ Analysis saved to database: {complete_analysis['id']}")
            except Exception as e:
                print(f"⚠️  Database save failed: {str(e)[:100]}")
                logger.error(f"⚠️  Failed to save analysis: {str(e)}")
        else:
            print("⏭️  Supabase not available, skipping save")
        
        print("\n✅ AI Analysis Complete!")
        print("="*60 + "\n")

        api_analysis = dict(complete_analysis)
        api_analysis["issues"] = issues_for_ui
        return api_analysis
    
    def _fetch_website_for_security_check(self, url: str) -> Optional[Dict[str, Any]]:
        """
        Fetch website to perform security header audit
        
        Args:
            url: Website URL to check
        
        Returns:
            Dict with security_score and security_issues, or None if failed
        """
        print(f"⏳ Fetching website for security audit: {url[:50]}...")
        
        try:
            # Fetch the website with a reasonable timeout
            response = requests.get(
                url,
                timeout=10,
                allow_redirects=True,
                headers={
                    'User-Agent': 'Mozilla/5.0 (compatible; LeadScraperBot/1.0; +security-audit)'
                }
            )
            
            # Calculate security score based on headers
            security_data = self._calculate_security_score(response)
            
            score = security_data['security_score']
            issues_count = len(security_data['security_issues'])
            print(f"✅ Security audit done: Score={score}/100, Issues={issues_count}")
            
            return security_data
            
        except requests.exceptions.Timeout:
            print(f"❌ Security check timeout after 10s")
            logger.warning(f"Security check timeout for: {url}")
            return {
                "security_score": None,
                "security_issues": ["Could not perform security audit - Website timeout"]
            }
        
        except requests.exceptions.RequestException as e:
            print(f"❌ Security check failed: {str(e)[:80]}")
            logger.warning(f"Security check failed for {url}: {str(e)}")
            return {
                "security_score": None,
                "security_issues": [f"Could not perform security audit - {str(e)[:100]}"]
            }
    
    def _calculate_security_score(self, response: requests.Response) -> Dict[str, Any]:
        """
        Professional Security Header Audit - calculates security score based on HTTP headers
        
        Args:
            response: The requests.Response object from the website fetch
        
        Returns:
            Dict with security_score (0-100) and list of security_issues
        """
        score = 100
        issues = []
        
        # Get the URL to check protocol
        url = response.url
        
        # Critical Check: Must be HTTPS
        if not url.startswith('https://'):
            logger.warning(f"Security check failed: Not HTTPS - {url}")
            return {
                "security_score": 0,
                "security_issues": ["Critical: Website uses HTTP instead of HTTPS - All data is transmitted unencrypted"]
            }
        
        # Get headers (case-insensitive access)
        headers = {k.lower(): v for k, v in response.headers.items()}
        
        # Check 1: Strict-Transport-Security (HSTS)
        if 'strict-transport-security' not in headers:
            score -= 20
            issues.append("Missing HSTS Header - Vulnerable to SSL Stripping Attacks")
            logger.debug("Security issue: Missing HSTS")
        
        # Check 2: Clickjacking Protection (X-Frame-Options OR CSP with frame-ancestors)
        has_frame_options = 'x-frame-options' in headers
        csp = headers.get('content-security-policy', '')
        has_csp_frame = 'frame-ancestors' in csp.lower()
        
        if not has_frame_options and not has_csp_frame:
            score -= 20
            issues.append("Missing Clickjacking Protection - No X-Frame-Options or CSP frame-ancestors")
            logger.debug("Security issue: No clickjacking protection")
        
        # Check 3: X-Content-Type-Options (MIME Sniffing Protection)
        if 'x-content-type-options' not in headers:
            score -= 10
            issues.append("Missing X-Content-Type-Options - Vulnerable to MIME Sniffing Attacks")
            logger.debug("Security issue: Missing X-Content-Type-Options")
        elif headers.get('x-content-type-options', '').lower() != 'nosniff':
            score -= 5
            issues.append("X-Content-Type-Options present but not set to 'nosniff'")
        
        # Check 4: Information Disclosure (X-Powered-By, Server headers with versions)
        if 'x-powered-by' in headers:
            score -= 10
            powered_by = headers['x-powered-by']
            issues.append(f"Information Disclosure: X-Powered-By header reveals '{powered_by}'")
            logger.debug(f"Security issue: X-Powered-By header present: {powered_by}")
        
        if 'server' in headers:
            server_value = headers['server']
            # Check if server header contains version numbers (e.g., "nginx/1.18.0", "Apache/2.4.41")
            if any(char.isdigit() for char in server_value):
                score -= 10
                issues.append(f"Information Disclosure: Server header reveals version '{server_value}'")
                logger.debug(f"Security issue: Server header with version: {server_value}")
        
        # Check 5: Content-Security-Policy (bonus check - presence is good)
        if 'content-security-policy' not in headers:
            score -= 10
            issues.append("Missing Content-Security-Policy - No protection against XSS and injection attacks")
            logger.debug("Security issue: Missing CSP")
        
        # Check 6: Referrer-Policy (bonus check)
        if 'referrer-policy' not in headers:
            score -= 5
            issues.append("Missing Referrer-Policy - May leak sensitive information in URLs")
            logger.debug("Security issue: Missing Referrer-Policy")
        
        # Check 7: Permissions-Policy (bonus check for modern sites)
        if 'permissions-policy' not in headers and 'feature-policy' not in headers:
            score -= 5
            issues.append("Missing Permissions-Policy - No control over browser features")
            logger.debug("Security issue: Missing Permissions-Policy")
        
        # Ensure score never goes below 0
        score = max(0, score)
        
        # If no issues, add positive message
        if not issues:
            issues.append("Excellent security configuration - All recommended headers present")
        
        logger.info(f"✅ Security audit complete: Score={score}/100, Issues={len(issues)}")
        
        return {
            "security_score": score,
            "security_issues": issues
        }
    
    def _fetch_pagespeed_data(self, url: str) -> Optional[Dict[str, Any]]:
        """
        Fetch performance metrics from Google PageSpeed Insights (Desktop only)
        
        Args:
            url: Website URL to analyze
        
        Returns:
            PageSpeed data or None if failed
        """
        if not self.google_cloud_api_key:
            print("⏭️  PageSpeed API key not available, skipping...")
            logger.warning("PageSpeed API key not available, skipping...")
            return None
        
        print(f"⏳ Calling PageSpeed Insights (desktop) for: {url[:50]}...")
        
        try:
            params = {
                "url": url,
                "key": self.google_cloud_api_key,
                "strategy": "desktop",  # Desktop-only for reliability
                "category": "performance",
            }
            
            response = requests.get(
                self.pagespeed_endpoint,
                params=params,
                timeout=45  # Generous timeout for better success rate
            )
            
            if response.status_code != 200:
                print(f"⚠️  PageSpeed returned status {response.status_code}")
                logger.warning(f"PageSpeed API returned {response.status_code} for {url}")
                return None
            
            data = response.json()
            
            # Extract key metrics
            lighthouse_result = data.get("lighthouseResult", {})
            categories = lighthouse_result.get("categories", {})
            performance = categories.get("performance", {})
            
            # Score is 0-1, convert to 0-100
            performance_score = int(performance.get("score", 0) * 100)
            
            # Extract loading time from audits
            audits = lighthouse_result.get("audits", {})
            speed_index = audits.get("speed-index", {})
            loading_time = speed_index.get("displayValue", "N/A")
            
            print(f"✅ PageSpeed done: Score={performance_score}/100, Time={loading_time}")
            logger.info(f"✅ PageSpeed score (desktop): {performance_score}/100, Loading: {loading_time}")
            
            return {
                "performance_score": performance_score,
                "loading_time": loading_time,
                "strategy": "desktop",
                "lighthouse_data": lighthouse_result
            }
            
        except requests.exceptions.Timeout:
            print(f"❌ PageSpeed timeout after 45s")
            logger.warning(f"PageSpeed timeout for: {url} - site too slow, skipping")
            return None
            
        except Exception as e:
            print(f"❌ PageSpeed Error: {str(e)[:100]}")
            logger.error(f"PageSpeed fetch failed: {str(e)}")
            return None
    
    def _analyze_with_gemini(
        self,
        url: Optional[str],
        map_data: Dict[str, Any],
        pagespeed_data: Optional[Dict[str, Any]],
        security_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Analyze business with Gemini AI
        
        Args:
            url: Website URL (can be None)
            map_data: Google Maps business data
            pagespeed_data: PageSpeed Insights data (can be None)
            security_data: Security audit data (can be None)
        
        Returns:
            Gemini analysis with scores, report, and pitch
        """
        if not self.gemini_api_key:
            print("⏭️  Gemini API key not available, using fallback...")
            logger.warning("Gemini API key not available, returning fallback data...")
            return self._get_fallback_analysis(url, map_data)
        
        print(f"⏳ Calling Gemini AI for: {map_data.get('name', 'Unknown')[:50]}...")
        
        try:
            # Construct prompt
            prompt = self._build_gemini_prompt(url, map_data, pagespeed_data, security_data)
            
            # Call Gemini with timeout handling
            model = genai.GenerativeModel(self.gemini_model)
            
            # Gemini doesn't support timeout parameter directly, but we can catch exceptions
            response = model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.3,  # Lower temperature for more consistent JSON
                    "max_output_tokens": 4096,  # Increased to prevent truncation
                    "top_p": 0.95,
                    "top_k": 40,
                }
            )
            
            # Parse response
            response_text = response.text
            logger.debug(f"Gemini raw response length: {len(response_text)} chars")
            
            # DEBUG: Print FULL response
            print(f"📝 Gemini FULL raw response ({len(response_text)} chars):")
            print(response_text)
            print("=" * 80)
            
            # Clean and parse JSON
            gemini_data = self._parse_gemini_response(response_text)
            
            # Check if parsing failed (returns None)
            if gemini_data is None:
                print(f"❌ Gemini JSON Parse Failed - using fallback")
                return self._get_fallback_analysis(url, map_data)
            
            print(f"✅ Gemini done: Lead Quality = {gemini_data.get('lead_quality', 'Unknown')}")
            logger.info(f"✅ Gemini analysis complete: Lead Quality = {gemini_data.get('lead_quality', 'Unknown')}")
            
            return gemini_data
            
        except json.JSONDecodeError as e:
            print(f"❌ Gemini JSON Parse Error: {str(e)[:100]}")
            logger.error(f"Gemini JSON parsing failed: {str(e)}")
            return self._get_fallback_analysis(url, map_data)
            
        except Exception as e:
            print(f"❌ Gemini Error: {str(e)[:100]}")
            logger.error(f"Gemini analysis failed: {str(e)}")
            return self._get_fallback_analysis(url, map_data)
    
    def _build_gemini_prompt(
        self,
        url: Optional[str],
        map_data: Dict[str, Any],
        pagespeed_data: Optional[Dict[str, Any]],
        security_data: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Build the Gemini AI prompt
        
        Args:
            url: Website URL
            map_data: Google Maps data
            pagespeed_data: PageSpeed data
            security_data: Security audit data
        
        Returns:
            Complete prompt string
        """
        # Extract business info
        business_name = map_data.get("name", "Unknown Business")
        business_type = map_data.get("type", "Unknown")
        address = map_data.get("full_address") or map_data.get("address", "No address")
        rating = map_data.get("rating", "N/A")
        reviews = map_data.get("review_count", 0)
        
        # Build context
        website_context = f"Website: {url}" if url else "⚠️ KEIN WEBSITE VORHANDEN!"
        pagespeed_context = ""
        if pagespeed_data:
            score = pagespeed_data.get("performance_score", "N/A")
            loading = pagespeed_data.get("loading_time", "N/A")
            pagespeed_context = f"\nPageSpeed Score: {score}/100, Loading Time: {loading}"
        
        # Build security context
        security_context = ""
        if security_data:
            sec_score = security_data.get("security_score", "N/A")
            sec_issues = security_data.get("security_issues", [])
            security_context = f"\nSecurity Score: {sec_score}/100"
            if sec_issues:
                security_context += f"\nSecurity Issues: {', '.join(sec_issues[:3])}"
        
        prompt = f"""Analysiere dieses Business und erstelle einen Lead-Report.

Business: {business_name}
Typ: {business_type}
Adresse: {address}
{website_context}
Rating: {rating} ({reviews} Bewertungen){pagespeed_context}{security_context}

WICHTIG:
- Antworte NUR mit einem JSON-Objekt (keine Markdown-Codeblocks, kein Text davor/danach).
- Alle scores muessen INTEGER sein (0-100).
- Nutze die AUTOMATISCHEN SIGNale oben:
  - Wenn PageSpeed Score fehlt/Timeout: erwaehne das als Issue.
  - Wenn Security Issues existieren: uebernimm sie in issues_found (mind. 1-2 davon).
- Bitte NICHT immer die gleichen Score-Zahlen verwenden; schaetze realistisch je Website/Quelle.

JSON Format:

{{
  "lead_quality": "High|Medium|Low",
  "tech_stack": ["..."],
  "scores": {{
    "ui": 0,
    "ux": 0,
    "seo": 0,
    "content": 0,
    "total": 0
  }},
  "report_card": {{
    "executive_summary": "Kurze Zusammenfassung (<= 160 Zeichen)",
    "issues_found": ["..."],
    "recommendations": ["..."]
  }},
  "email_pitch": {{
    "subject": "Betreff (<= 80 Zeichen)",
    "body_text": "Email Text (<= 300 Zeichen)"
  }}
}}
"""
        
        return prompt
    
    def _parse_gemini_response(self, response_text: str) -> Dict[str, Any]:
        """
        Parse Gemini response and extract JSON with robust error handling
        
        Args:
            response_text: Raw response from Gemini
        
        Returns:
            Parsed JSON data or None if parsing fails
        """
        try:
            # Remove markdown code blocks if present
            cleaned = response_text.strip()
            cleaned = re.sub(r'^```json\s*', '', cleaned)
            cleaned = re.sub(r'^```\s*', '', cleaned)
            cleaned = re.sub(r'\s*```$', '', cleaned)
            cleaned = cleaned.strip()
            
            # Try to fix common JSON issues
            # Replace smart quotes with regular quotes
            cleaned = cleaned.replace('"', '"').replace('"', '"')
            cleaned = cleaned.replace(''', "'").replace(''', "'")
            
            # Try to find JSON object if there's extra text
            if not cleaned.startswith('{'):
                # Find first { and last }
                start = cleaned.find('{')
                end = cleaned.rfind('}')
                if start != -1 and end != -1:
                    cleaned = cleaned[start:end+1]
            
            # Check if JSON is truncated (incomplete closing braces)
            if cleaned.count('{') > cleaned.count('}'):
                logger.warning("JSON appears truncated - attempting repair")
                # Try to close the JSON properly
                missing_braces = cleaned.count('{') - cleaned.count('}')
                cleaned += '}' * missing_braces
            
            # Handle unterminated strings
            # Count quotes to see if string is not closed
            quote_count = cleaned.count('"') - cleaned.count('\\"')
            if quote_count % 2 != 0:
                logger.warning("Unterminated string detected - attempting repair")
                # Try to close the string and JSON
                cleaned += '"}'
            
            # Try to parse JSON
            data = json.loads(cleaned)
            
            # Validate required fields
            required_fields = ["lead_quality", "scores", "report_card", "email_pitch"]
            for field in required_fields:
                if field not in data:
                    logger.warning(f"Missing required field: {field}")
                    raise ValueError(f"Missing required field: {field}")
            
            # Validate nested structures
            if not isinstance(data.get("scores"), dict):
                raise ValueError("scores must be a dict")
            if not isinstance(data.get("report_card"), dict):
                raise ValueError("report_card must be a dict")
            if not isinstance(data.get("email_pitch"), dict):
                raise ValueError("email_pitch must be a dict")
            
            logger.info("✅ Successfully parsed Gemini JSON response")
            return data
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini response: {str(e)}")
            logger.debug(f"Cleaned response (first 500 chars): {cleaned[:500] if 'cleaned' in locals() else 'N/A'}")
            logger.debug(f"Raw response length: {len(response_text)} chars")
            # Don't raise - return None to trigger fallback
            return None
        except Exception as e:
            logger.error(f"Failed to parse Gemini response: {str(e)}")
            logger.debug(f"Raw response (first 500 chars): {response_text[:500]}")
            # Don't raise - return None to trigger fallback
            return None
    
    def _get_fallback_analysis(
        self,
        url: Optional[str],
        map_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate fallback analysis when Gemini is not available
        
        Args:
            url: Website URL
            map_data: Google Maps data
        
        Returns:
            Fallback analysis data
        """
        business_name = map_data.get("name", "Unknown Business")
        has_website = bool(url)
        rating = map_data.get("rating", 5.0)
        
        # Determine lead quality based on simple heuristics
        if not has_website:
            lead_quality = "High"
            main_issue = "Keine Website vorhanden"
        elif rating and rating < 4.0:
            lead_quality = "High"
            main_issue = "Niedrige Bewertung und Verbesserungspotenzial"
        else:
            lead_quality = "Medium"
            main_issue = "Optimierungspotenzial vorhanden"
        
        return {
            "lead_quality": lead_quality,
            "tech_stack": ["Unknown"],
            "scores": {
                "ui": 50,
                "ux": 50,
                "seo": 50,
                "content": 50,
                "total": 50
            },
            "report_card": {
                "executive_summary": f"{business_name} hat {main_issue}. Eine professionelle Website könnte die Online-Präsenz deutlich verbessern.",
                "issues_found": [
                    main_issue,
                    "Analyse nur mit Basis-Daten durchgeführt",
                    "Detaillierte Analyse benötigt AI-Integration"
                ],
                "recommendations": [
                    "Professionelle Website erstellen oder optimieren",
                    "SEO-Optimierung durchführen",
                    "Mobile Performance verbessern"
                ]
            },
            "email_pitch": {
                "subject": f"Website-Potenzial für {business_name}",
                "body_text": f"Guten Tag,\n\nich habe {business_name} auf Google Maps gefunden und festgestellt: {main_issue}. In Ihrer Branche ist eine professionelle Online-Präsenz heute unverzichtbar. Wir helfen Unternehmen wie Ihrem, mehr Kunden online zu gewinnen. Haben Sie 15 Minuten für ein kurzes Gespräch?\n\nMit freundlichen Grüßen"
            }
        }
    
    def _merge_analysis_data(
        self,
        url: Optional[str],
        map_data: Dict[str, Any],
        pagespeed_data: Optional[Dict[str, Any]],
        security_data: Optional[Dict[str, Any]],
        gemini_data: Dict[str, Any],
        bulk_analysis_id: Optional[str],
        industry: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Merge all analysis data into final format
        
        Args:
            url: Website URL
            map_data: Google Maps data
            pagespeed_data: PageSpeed data
            security_data: Security audit data
            gemini_data: Gemini analysis data
            bulk_analysis_id: Bulk analysis ID
        
        Returns:
            Complete analysis data ready for database
        """
        # Generate ID
        analysis_id = str(uuid.uuid4())
        
        # Extract map data (Local Business Data API format)
        company_name = map_data.get("name", "Unknown Business")
        business_address = map_data.get("full_address", "")
        business_phone = map_data.get("phone_number")
        rating = map_data.get("rating")
        review_count = map_data.get("review_count", 0)
        photo_count = map_data.get("photo_count", 0)
        place_id = map_data.get("place_id") or map_data.get("google_id")
        # Use provided industry or fall back to map_data type
        industry = industry or map_data.get("type", "Unknown")
        
        # Extract Gemini scores
        scores = gemini_data.get("scores", {})
        ui_score = scores.get("ui", 50)
        ux_score = scores.get("ux", 50)
        seo_score = scores.get("seo", 50)
        content_score = scores.get("content", 50)
        total_score = scores.get("total", 50)
        
        # Extract PageSpeed score
        performance_score = pagespeed_data.get("performance_score") if pagespeed_data else None
        loading_time = pagespeed_data.get("loading_time", "N/A") if pagespeed_data else "N/A"
        
        # Calculate Google Speed Score (use PageSpeed if available, otherwise estimate)
        google_speed_score = performance_score if performance_score is not None else max(0, total_score - 20)
        
        # Extract Security score
        security_score = security_data.get("security_score") if security_data else None
        security_issues = security_data.get("security_issues", []) if security_data else []
        
        # Extract tech stack
        tech_stack = gemini_data.get("tech_stack", ["Unknown"])
        
        # Extract report card and merge with security issues
        report_card = gemini_data.get("report_card", {})
        issues_found = report_card.get("issues_found", [])
        
        # Add security issues to the issues list (prioritize security issues)
        if security_issues:
            # Add top security issues to the beginning of the list
            issues_found = security_issues[:2] + issues_found
            logger.info(f"Merged {len(security_issues)} security issues into analysis report")
        
        # Determine lead strength
        lead_quality = gemini_data.get("lead_quality", "Medium")
        lead_strength_map = {"High": "strong", "Medium": "medium", "Low": "weak"}
        lead_strength = lead_strength_map.get(lead_quality, "medium")
        
        # Build complete analysis
        complete_analysis = {
            "id": analysis_id,
            "website": url or f"no-website-{place_id}",
            "company_name": company_name,
            "email": "",  # To be extracted from website scraping
            "business_phone": business_phone,
            "business_address": business_address,
            "industry": industry,
            "company_size": None,
            
            # Scores
            "ui_score": ui_score,
            "seo_score": seo_score,
            "tech_score": ux_score,  # Map UX to tech_score
            "performance_score": performance_score,
            "security_score": security_score,  # Calculated from Security Header Audit
            "mobile_score": None,
            "total_score": total_score,
            
            # Status
            "status": "completed",
            "last_checked": datetime.utcnow().isoformat(),
            "source": "Google Maps",
            
            # Technical details
            "tech_stack": tech_stack,
            "has_ads_pixel": False,  # To be detected in website scraping
            "google_speed_score": google_speed_score,
            "loading_time": loading_time,
            "copyright_year": datetime.utcnow().year,  # To be extracted from website
            
            # Lead classification
            "lead_strength": lead_strength,
            
            # Google Maps specific
            "google_maps_rating": float(rating) if rating else None,
            "google_maps_reviews": review_count,
            "google_maps_photo_count": photo_count,
            "google_maps_place_id": place_id,
            
            # AI Analysis - Temporarily commented out (column doesn't exist in Supabase yet)
            # "ai_report": json.dumps(gemini_data, ensure_ascii=False),
            
            # Timestamps
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # Only add bulk_analysis_id if it's provided (optional relationship)
        if bulk_analysis_id:
            complete_analysis["bulk_analysis_id"] = bulk_analysis_id
        
        return complete_analysis


# Singleton instance
_analyzer_instance = None

def get_analyzer() -> DeepAnalyzer:
    """Get or create the analyzer singleton instance"""
    global _analyzer_instance
    if _analyzer_instance is None:
        _analyzer_instance = DeepAnalyzer()
    return _analyzer_instance
