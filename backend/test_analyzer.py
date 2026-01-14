"""
Test script for the DeepAnalyzer
Tests the core search and filter logic
"""

import os
from dotenv import load_dotenv

# Load environment variables first
load_dotenv()

from analyzer import DeepAnalyzer

def test_analyzer():
    """Test the analyzer with a simple search"""
    print("\n" + "=" * 60)
    print("Testing DeepAnalyzer")
    print("=" * 60)
    
    try:
        # Initialize analyzer
        print("\n1. Initializing analyzer...")
        analyzer = DeepAnalyzer()
        print("✅ Analyzer initialized successfully")
        
        # Test search with filters
        print("\n2. Running test search: 'Pizza Berlin' (limit: 5)")
        print("   Filters: max_rating=4.5, min_reviews=10, must_have_phone=True")
        
        filters = {
            "maxRating": "4.5",
            "minReviews": 10,
            "priceLevel": [],
            "mustHavePhone": True,
            "maxPhotos": "any",
            "websiteStatus": "any"
        }
        
        result = analyzer.process_bulk_search(
            industry="Pizza",
            location="Berlin",
            target_results=5,
            filters=filters,
            bulk_analysis_id="test-123"
        )
        
        # Display results
        print("\n" + "=" * 60)
        print("SEARCH RESULTS")
        print("=" * 60)
        print(f"Status: {result['status']}")
        print(f"Total Found: {result['total_found']}")
        print(f"Total Scanned: {result['total_scanned']}")
        print(f"Pages Fetched: {result['pages_fetched']}")
        
        if result['leads']:
            print(f"\n✅ Found {len(result['leads'])} leads:")
            for i, lead in enumerate(result['leads'][:3], 1):  # Show first 3
                print(f"\n  Lead {i}:")
                print(f"  - Name: {lead.get('company_name', 'N/A')}")
                print(f"  - Rating: {lead.get('google_maps_rating', 'N/A')}")
                print(f"  - Reviews: {lead.get('google_maps_reviews', 'N/A')}")
                print(f"  - Phone: {lead.get('business_phone', 'N/A')}")
                print(f"  - Address: {lead.get('business_address', 'N/A')[:50]}...")
                print(f"  - Score: {lead.get('total_score', 'N/A')}")
                print(f"  - Lead Strength: {lead.get('lead_strength', 'N/A')}")
        else:
            print("\n⚠️  No leads found matching criteria")
        
        print("\n" + "=" * 60)
        print("✅ Test completed successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_analyzer()
