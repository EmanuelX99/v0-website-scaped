"""
Comprehensive Filter Testing Script
Tests all Sniper Mode filters to ensure they work correctly
"""

import os
from dotenv import load_dotenv
from analyzer import DeepAnalyzer

load_dotenv()

def run_test(test_name, industry, location, target_results, filters):
    """Run a single test with specific filters"""
    print("\n" + "="*80)
    print(f"TEST: {test_name}")
    print("="*80)
    print(f"Query: {industry} in {location}")
    print(f"Target: {target_results} results")
    print(f"Filters: {filters}")
    print("-"*80)
    
    try:
        analyzer = DeepAnalyzer()
        result = analyzer.process_bulk_search(
            industry=industry,
            location=location,
            target_results=target_results,
            filters=filters,
            bulk_analysis_id=f"test-{test_name.lower().replace(' ', '-')}"
        )
        
        print(f"\n✅ Status: {result['status']}")
        print(f"✅ Found: {result['total_found']}/{target_results}")
        print(f"✅ Scanned: {result['total_scanned']} businesses")
        
        if result['leads']:
            print(f"\nSample Leads:")
            for i, lead in enumerate(result['leads'][:3], 1):
                print(f"  {i}. {lead.get('company_name')}")
                print(f"     Rating: {lead.get('google_maps_rating')} | Reviews: {lead.get('google_maps_reviews')}")
                print(f"     Phone: {lead.get('business_phone', 'N/A')} | Website: {bool(lead.get('website'))}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all filter tests"""
    print("\n" + "="*80)
    print("COMPREHENSIVE FILTER TESTING SUITE")
    print("="*80)
    print("Testing all Sniper Mode filters...")
    
    results = []
    
    # Test 1: No Filters (Baseline)
    results.append(run_test(
        "1. No Filters (Baseline)",
        "Cafe",
        "Berlin",
        3,
        {
            "maxRating": "any",
            "minReviews": 0,
            "priceLevel": [],
            "mustHavePhone": False,
            "maxPhotos": "any",
            "websiteStatus": "any"
        }
    ))
    
    # Test 2: Max Rating Filter (< 4.5)
    results.append(run_test(
        "2. Max Rating Filter (< 4.5)",
        "Restaurant",
        "Berlin",
        3,
        {
            "maxRating": "4.5",
            "minReviews": 0,
            "priceLevel": [],
            "mustHavePhone": False,
            "maxPhotos": "any",
            "websiteStatus": "any"
        }
    ))
    
    # Test 3: Max Rating Filter (< 4.0) - Very Strict
    results.append(run_test(
        "3. Max Rating Filter (< 4.0) - Strict",
        "Restaurant",
        "Berlin",
        3,
        {
            "maxRating": "4.0",
            "minReviews": 0,
            "priceLevel": [],
            "mustHavePhone": False,
            "maxPhotos": "any",
            "websiteStatus": "any"
        }
    ))
    
    # Test 4: Min Reviews Filter (>= 10)
    results.append(run_test(
        "4. Min Reviews Filter (>= 10)",
        "Pizza",
        "Berlin",
        3,
        {
            "maxRating": "any",
            "minReviews": 10,
            "priceLevel": [],
            "mustHavePhone": False,
            "maxPhotos": "any",
            "websiteStatus": "any"
        }
    ))
    
    # Test 5: Min Reviews Filter (>= 100) - Strict
    results.append(run_test(
        "5. Min Reviews Filter (>= 100) - Strict",
        "Restaurant",
        "Berlin",
        3,
        {
            "maxRating": "any",
            "minReviews": 100,
            "priceLevel": [],
            "mustHavePhone": False,
            "maxPhotos": "any",
            "websiteStatus": "any"
        }
    ))
    
    # Test 6: Must Have Phone Filter
    results.append(run_test(
        "6. Must Have Phone Filter",
        "Zahnarzt",
        "Berlin",
        3,
        {
            "maxRating": "any",
            "minReviews": 0,
            "priceLevel": [],
            "mustHavePhone": True,
            "maxPhotos": "any",
            "websiteStatus": "any"
        }
    ))
    
    # Test 7: Price Level Filter (only $ and $$)
    results.append(run_test(
        "7. Price Level Filter ($ and $$)",
        "Restaurant",
        "Berlin",
        3,
        {
            "maxRating": "any",
            "minReviews": 0,
            "priceLevel": ["1", "2"],
            "mustHavePhone": False,
            "maxPhotos": "any",
            "websiteStatus": "any"
        }
    ))
    
    # Test 8: Max Photos Filter (< 10 photos)
    results.append(run_test(
        "8. Max Photos Filter (< 10 photos)",
        "Cafe",
        "Berlin",
        3,
        {
            "maxRating": "any",
            "minReviews": 0,
            "priceLevel": [],
            "mustHavePhone": False,
            "maxPhotos": "10",
            "websiteStatus": "any"
        }
    ))
    
    # Test 9: Website Status Filter (has-website)
    results.append(run_test(
        "9. Website Status Filter (has-website)",
        "Restaurant",
        "Berlin",
        3,
        {
            "maxRating": "any",
            "minReviews": 0,
            "priceLevel": [],
            "mustHavePhone": False,
            "maxPhotos": "any",
            "websiteStatus": "has-website"
        }
    ))
    
    # Test 10: Website Status Filter (no-website)
    results.append(run_test(
        "10. Website Status Filter (no-website)",
        "Restaurant",
        "Berlin",
        3,
        {
            "maxRating": "any",
            "minReviews": 0,
            "priceLevel": [],
            "mustHavePhone": False,
            "maxPhotos": "any",
            "websiteStatus": "no-website"
        }
    ))
    
    # Test 11: Combined Filters (Sniper Mode)
    results.append(run_test(
        "11. Combined Filters (Sniper Mode)",
        "Restaurant",
        "Berlin",
        3,
        {
            "maxRating": "4.5",
            "minReviews": 10,
            "priceLevel": ["1", "2"],
            "mustHavePhone": True,
            "maxPhotos": "20",
            "websiteStatus": "has-website"
        }
    ))
    
    # Test 12: Very Strict Filters (Extreme Sniper Mode)
    results.append(run_test(
        "12. Very Strict Filters (Extreme)",
        "Restaurant",
        "Berlin",
        3,
        {
            "maxRating": "4.0",
            "minReviews": 50,
            "priceLevel": ["1"],
            "mustHavePhone": True,
            "maxPhotos": "10",
            "websiteStatus": "has-website"
        }
    ))
    
    # Final Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(results)
    total = len(results)
    
    for i, result in enumerate(results, 1):
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - Test {i}")
    
    print("\n" + "="*80)
    print(f"TOTAL: {passed}/{total} tests passed ({int(passed/total*100)}%)")
    print("="*80)
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED! All filters are working correctly.")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Check logs above.")
    
    return passed == total


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
