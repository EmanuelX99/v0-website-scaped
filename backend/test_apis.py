"""
LeadScraper AI - API Verification Script
Tests all external API connections and services
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ============================================
# Test 1: Supabase Connection
# ============================================

def test_supabase():
    """Test Supabase database connection"""
    print("\n" + "=" * 60)
    print("TEST 1: Supabase Connection")
    print("=" * 60)
    
    try:
        from supabase import create_client, Client
        
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        
        if not supabase_url or not supabase_key:
            print("❌ FAILED: SUPABASE_URL or SUPABASE_KEY not set in .env")
            return False
        
        print(f"URL: {supabase_url}")
        print(f"Key: {supabase_key[:20]}...")
        
        # Create client
        supabase: Client = create_client(supabase_url, supabase_key)
        
        # Test query: Try to select from analyses table (or check health)
        try:
            response = supabase.table("analyses").select("id").limit(1).execute()
            print(f"✅ SUCCESS: Connected to Supabase")
            print(f"   Database accessible (analyses table exists)")
            return True
        except Exception as query_error:
            # Table might not exist yet, but connection works
            if "does not exist" in str(query_error).lower():
                print(f"⚠️  WARNING: Connected but 'analyses' table not found")
                print(f"   Run the SQL schema script in Supabase SQL Editor")
                return True
            else:
                raise query_error
                
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


# ============================================
# Test 2: RapidAPI (Google Maps)
# ============================================

def test_rapidapi():
    """Test RapidAPI Google Maps connection"""
    print("\n" + "=" * 60)
    print("TEST 2: RapidAPI (Google Maps)")
    print("=" * 60)
    
    try:
        import requests
        
        rapidapi_key = os.getenv("RAPIDAPI_KEY")
        rapidapi_host = os.getenv("RAPIDAPI_HOST")
        rapidapi_endpoint = os.getenv("RAPIDAPI_GOOGLE_MAPS_ENDPOINT")
        
        if not rapidapi_key or not rapidapi_host:
            print("❌ FAILED: RAPIDAPI_KEY or RAPIDAPI_HOST not set in .env")
            return False
        
        print(f"Host: {rapidapi_host}")
        print(f"Key: {rapidapi_key[:20]}...")
        print(f"Endpoint: {rapidapi_endpoint}")
        
        # Make test request for "Pizza Berlin"
        headers = {
            "X-RapidAPI-Key": rapidapi_key,
            "X-RapidAPI-Host": rapidapi_host
        }
        
        params = {
            "query": "Pizza Berlin",
            "limit": "5"
        }
        
        print("\nSending test request: 'Pizza Berlin' (limit: 5)...")
        
        response = requests.get(
            rapidapi_endpoint,
            headers=headers,
            params=params,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            
            # Check if we got results
            if "data" in data and len(data.get("data", [])) > 0:
                results_count = len(data.get("data", []))
                print(f"✅ SUCCESS: RapidAPI Google Maps working")
                print(f"   Found {results_count} results for 'Pizza Berlin'")
                
                # Show first result
                first_result = data["data"][0]
                print(f"\n   Sample result:")
                print(f"   - Name: {first_result.get('name', 'N/A')}")
                print(f"   - Rating: {first_result.get('rating', 'N/A')}")
                print(f"   - Address: {first_result.get('address', 'N/A')}")
                return True
            else:
                print(f"⚠️  WARNING: API responded but no results found")
                print(f"   Response: {data}")
                return True  # API works, just no results
        else:
            print(f"❌ FAILED: HTTP {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


# ============================================
# Test 3: Gemini AI
# ============================================

def test_gemini():
    """Test Gemini AI connection"""
    print("\n" + "=" * 60)
    print("TEST 3: Gemini AI (Google Generative AI)")
    print("=" * 60)
    
    try:
        import google.generativeai as genai
        
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        gemini_model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        
        if not gemini_api_key:
            print("❌ FAILED: GEMINI_API_KEY not set in .env")
            return False
        
        print(f"API Key: {gemini_api_key[:20]}...")
        print(f"Model: {gemini_model}")
        
        # Configure Gemini
        genai.configure(api_key=gemini_api_key)
        
        # Create model instance
        model = genai.GenerativeModel(gemini_model)
        
        # Send test prompt
        print("\nSending test prompt: 'Hello'...")
        
        response = model.generate_content("Hello")
        
        if response and response.text:
            print(f"✅ SUCCESS: Gemini AI responding")
            print(f"\n   Test Response:")
            print(f"   {response.text[:200]}...")
            return True
        else:
            print(f"⚠️  WARNING: Gemini responded but no text content")
            return False
            
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


# ============================================
# Test 4: Google PageSpeed Insights
# ============================================

def test_pagespeed():
    """Test Google PageSpeed Insights API"""
    print("\n" + "=" * 60)
    print("TEST 4: Google PageSpeed Insights API")
    print("=" * 60)
    
    try:
        import requests
        
        pagespeed_api_key = os.getenv("GOOGLE_PAGESPEED_API_KEY")
        pagespeed_endpoint = os.getenv(
            "GOOGLE_PAGESPEED_ENDPOINT",
            "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
        )
        
        if not pagespeed_api_key:
            print("⚠️  SKIPPED: GOOGLE_PAGESPEED_API_KEY not set in .env")
            print("   (This is optional - you can continue without it)")
            return True
        
        print(f"API Key: {pagespeed_api_key[:20]}...")
        print(f"Endpoint: {pagespeed_endpoint}")
        
        # Test with example.com
        params = {
            "url": "https://example.com",
            "key": pagespeed_api_key,
            "strategy": "mobile"
        }
        
        print("\nTesting with URL: https://example.com...")
        
        response = requests.get(
            pagespeed_endpoint,
            params=params,
            timeout=60
        )
        
        if response.status_code == 200:
            data = response.json()
            
            # Extract performance score
            if "lighthouseResult" in data:
                performance_score = data["lighthouseResult"]["categories"]["performance"]["score"]
                score_percentage = int(performance_score * 100)
                
                print(f"✅ SUCCESS: PageSpeed Insights API working")
                print(f"   Performance Score for example.com: {score_percentage}/100")
                return True
            else:
                print(f"⚠️  WARNING: API responded but unexpected format")
                return True
        else:
            print(f"❌ FAILED: HTTP {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


# ============================================
# Main Test Runner
# ============================================

def main():
    """Run all API tests"""
    print("\n" + "=" * 60)
    print("LeadScraper AI - API Verification")
    print("=" * 60)
    print("Testing all external API connections...")
    
    # Check if .env exists
    if not os.path.exists(".env"):
        print("\n❌ ERROR: .env file not found!")
        print("   Please copy .env.example to .env and fill in your API keys")
        sys.exit(1)
    
    # Run tests
    results = {
        "Supabase": test_supabase(),
        "RapidAPI": test_rapidapi(),
        "Gemini AI": test_gemini(),
        "PageSpeed": test_pagespeed()
    }
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    for service, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {service}")
    
    # Overall result
    total_tests = len(results)
    passed_tests = sum(results.values())
    
    print("\n" + "=" * 60)
    if passed_tests == total_tests:
        print(f"✅ ALL TESTS PASSED ({passed_tests}/{total_tests})")
        print("=" * 60)
        print("\n🎉 Your environment is ready!")
        print("You can now run: python main.py")
        sys.exit(0)
    else:
        print(f"⚠️  SOME TESTS FAILED ({passed_tests}/{total_tests})")
        print("=" * 60)
        print("\n⚠️  Please fix the failed tests before proceeding")
        print("Check your .env file and API credentials")
        sys.exit(1)


if __name__ == "__main__":
    main()
