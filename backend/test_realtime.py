"""
Test the API in real-time with debug output
"""

import requests
import json

url = "http://localhost:8000/api/v1/analyses/bulk-search"

data = {
    "industry": "Cafe",
    "location": "Berlin",
    "targetResults": 2,
    "filters": {
        "maxRating": "any",
        "minReviews": 0,
        "mustHavePhone": False,
        "websiteStatus": "any"
    }
}

print("Sending request to:", url)
print("Data:", json.dumps(data, indent=2))
print("\n" + "="*60 + "\n")

try:
    response = requests.post(url, json=data, timeout=60)
    result = response.json()
    
    print("Response:")
    print(json.dumps(result, indent=2))
    
    if result.get("status") == "failed":
        print("\n❌ Request failed!")
    elif result.get("total Found") == 0:
        print("\n⚠️  No leads found - filters might be too strict")
    else:
        print(f"\n✅ Found {result.get('totalFound')} leads!")
        
except Exception as e:
    print(f"❌ Error: {e}")
