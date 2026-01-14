"""
Debug RapidAPI responses to see raw data structure
"""

import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

rapidapi_key = os.getenv("RAPIDAPI_KEY")
rapidapi_host = os.getenv("RAPIDAPI_HOST", "local-business-data.p.rapidapi.com")

url = "https://local-business-data.p.rapidapi.com/search"

headers = {
    "x-rapidapi-key": rapidapi_key,
    "x-rapidapi-host": rapidapi_host
}

params = {
    "query": "Cafe Berlin",
    "limit": "5",
    "language": "de",
    "region": "de"
}

print("Fetching from RapidAPI...")
print(f"Query: {params['query']}")
print("\n" + "="*80 + "\n")

try:
    response = requests.get(url, headers=headers, params=params, timeout=30)
    response.raise_for_status()
    
    data = response.json()
    
    print(f"Status: {response.status_code}")
    print(f"Businesses found: {len(data.get('data', []))}")
    print("\n" + "="*80 + "\n")
    
    # Show first business in detail
    if data.get("data"):
        print("FIRST BUSINESS (raw data):")
        print(json.dumps(data["data"][0], indent=2))
        
        print("\n" + "="*80 + "\n")
        print("KEY FIELDS CHECK:")
        biz = data["data"][0]
        print(f"  name: {biz.get('name')}")
        print(f"  rating: {biz.get('rating')}")
        print(f"  review_count: {biz.get('review_count')}")
        print(f"  phone: {biz.get('phone_number') or biz.get('phone')}")
        print(f"  website: {biz.get('website')}")
        print(f"  business_status: {biz.get('business_status')}")
        print(f"  photos: {len(biz.get('photos', []))} photos")
        
    else:
        print("⚠️  No businesses returned")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
