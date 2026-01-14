"""
Test script for AI Analysis (analyze_single method)
Tests PageSpeed Insights + Gemini AI integration
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from analyzer import DeepAnalyzer

def print_section(title):
    """Print a section header"""
    print("\n" + "="*80)
    print(f"  {title}")
    print("="*80)

def test_analyze_single():
    """Test the analyze_single method"""
    print_section("AI ANALYSIS TEST")
    
    # Initialize analyzer
    print("\n📦 Initializing DeepAnalyzer...")
    analyzer = DeepAnalyzer()
    
    # Test cases
    test_cases = [
        {
            "name": "Business WITH website",
            "url": "https://example.com",
            "map_data": {
                "name": "Example Restaurant",
                "type": "Restaurant",
                "address": "Bahnhofstrasse 1, 8001 Zürich",
                "full_address": "Bahnhofstrasse 1, 8001 Zürich, Switzerland",
                "phone": "+41 44 123 45 67",
                "phone_number": "+41 44 123 45 67",
                "rating": 4.2,
                "review_count": 150,
                "photo_count": 25,
                "google_id": "test-place-id-123",
                "place_id": "test-place-id-123"
            }
        },
        {
            "name": "Business WITHOUT website",
            "url": None,
            "map_data": {
                "name": "Local Bakery",
                "type": "Bakery",
                "address": "Musterstrasse 10, 8000 Zürich",
                "full_address": "Musterstrasse 10, 8000 Zürich, Switzerland",
                "phone": "+41 44 999 88 77",
                "phone_number": "+41 44 999 88 77",
                "rating": 3.8,
                "review_count": 45,
                "photo_count": 8,
                "google_id": "test-place-id-456",
                "place_id": "test-place-id-456"
            }
        }
    ]
    
    # Run tests
    for i, test_case in enumerate(test_cases, 1):
        print_section(f"TEST {i}: {test_case['name']}")
        
        print(f"\n📊 Input Data:")
        print(f"  URL: {test_case['url'] or '❌ NO WEBSITE'}")
        print(f"  Business: {test_case['map_data']['name']}")
        print(f"  Type: {test_case['map_data']['type']}")
        print(f"  Rating: {test_case['map_data']['rating']} ⭐")
        print(f"  Reviews: {test_case['map_data']['review_count']}")
        
        try:
            print(f"\n🤖 Running AI Analysis...")
            result = analyzer.analyze_single(
                url=test_case['url'],
                map_data=test_case['map_data'],
                bulk_analysis_id="test-bulk-id"
            )
            
            print(f"\n✅ Analysis Complete!")
            print(f"\n📈 Scores:")
            print(f"  UI Score: {result.get('ui_score', 'N/A')}/100")
            print(f"  SEO Score: {result.get('seo_score', 'N/A')}/100")
            print(f"  Tech Score: {result.get('tech_score', 'N/A')}/100")
            print(f"  Total Score: {result.get('total_score', 'N/A')}/100")
            print(f"  Google Speed Score: {result.get('google_speed_score', 'N/A')}/100")
            print(f"  Loading Time: {result.get('loading_time', 'N/A')}")
            
            print(f"\n🎯 Lead Info:")
            print(f"  Lead Strength: {result.get('lead_strength', 'N/A')}")
            print(f"  Tech Stack: {', '.join(result.get('tech_stack', ['Unknown']))}")
            
            print(f"\n📝 Database Fields:")
            print(f"  ID: {result.get('id', 'N/A')}")
            print(f"  Company: {result.get('company_name', 'N/A')}")
            print(f"  Website: {result.get('website', 'N/A')}")
            print(f"  Phone: {result.get('business_phone', 'N/A')}")
            print(f"  Address: {result.get('business_address', 'N/A')}")
            print(f"  Status: {result.get('status', 'N/A')}")
            
            # Show AI Report if available
            import json
            ai_report_str = result.get('ai_report')
            if ai_report_str:
                try:
                    ai_report = json.loads(ai_report_str)
                    print(f"\n🤖 AI Report:")
                    print(f"  Lead Quality: {ai_report.get('lead_quality', 'N/A')}")
                    
                    report_card = ai_report.get('report_card', {})
                    if report_card:
                        print(f"\n  Executive Summary:")
                        print(f"    {report_card.get('executive_summary', 'N/A')}")
                        
                        issues = report_card.get('issues_found', [])
                        if issues:
                            print(f"\n  Issues Found:")
                            for issue in issues[:3]:  # Show first 3
                                print(f"    - {issue}")
                        
                        recommendations = report_card.get('recommendations', [])
                        if recommendations:
                            print(f"\n  Recommendations:")
                            for rec in recommendations[:3]:  # Show first 3
                                print(f"    - {rec}")
                    
                    email_pitch = ai_report.get('email_pitch', {})
                    if email_pitch:
                        print(f"\n  📧 Email Pitch:")
                        print(f"    Subject: {email_pitch.get('subject', 'N/A')}")
                        body = email_pitch.get('body_text', 'N/A')
                        # Show first 200 chars
                        print(f"    Body (preview): {body[:200]}...")
                
                except json.JSONDecodeError:
                    print(f"\n  ⚠️  Could not parse AI report JSON")
            
            print(f"\n✅ TEST {i} PASSED")
            
        except Exception as e:
            print(f"\n❌ TEST {i} FAILED: {str(e)}")
            import traceback
            traceback.print_exc()
    
    print_section("ALL TESTS COMPLETE")

def check_env_vars():
    """Check if required environment variables are set"""
    print_section("ENVIRONMENT CHECK")
    
    required_vars = {
        "RAPIDAPI_KEY": "RapidAPI key for Google Maps data",
        "GEMINI_API_KEY": "Gemini AI key for analysis",
        "GOOGLE_CLOUD_API_KEY": "Google Cloud key for PageSpeed (optional)",
        "SUPABASE_URL": "Supabase URL",
        "SUPABASE_KEY": "Supabase key"
    }
    
    all_set = True
    for var, description in required_vars.items():
        value = os.getenv(var)
        if value:
            print(f"✅ {var}: Set ({len(value)} chars) - {description}")
        else:
            status = "⚠️  Optional" if "optional" in description.lower() else "❌ Missing"
            print(f"{status} {var}: Not set - {description}")
            if "optional" not in description.lower():
                all_set = False
    
    if all_set:
        print(f"\n✅ All required environment variables are set!")
    else:
        print(f"\n⚠️  Some required environment variables are missing.")
        print(f"    Make sure to configure your .env file.")
    
    return all_set

if __name__ == "__main__":
    print("\n" + "="*80)
    print("  LeadScraper AI - AI Analysis Test Suite")
    print("="*80)
    
    # Check environment
    env_ok = check_env_vars()
    
    if not env_ok:
        print("\n⚠️  Warning: Some environment variables are missing.")
        print("    Tests will run with fallback data where possible.")
        response = input("\nContinue anyway? (y/n): ")
        if response.lower() != 'y':
            print("Aborted.")
            sys.exit(1)
    
    # Run tests
    test_analyze_single()
    
    print("\n✅ Test suite complete!")
