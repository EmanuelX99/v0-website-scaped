#!/bin/bash
#
# Test Frontend-Backend Integration
# Tests the bulk search endpoint with the exact format the frontend sends
#

set -e

echo "============================================"
echo "FRONTEND-BACKEND INTEGRATION TEST"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if server is running
echo "Checking if backend is running..."
if ! curl -s http://127.0.0.1:8000/ > /dev/null 2>&1; then
    echo -e "${RED}❌ Backend is not running!${NC}"
    echo "Please start the backend first:"
    echo "  cd backend && ./start_server.sh &"
    exit 1
fi
echo -e "${GREEN}✅ Backend is running${NC}"
echo ""

# Test 1: Simple search (matching frontend default behavior)
echo "============================================"
echo "TEST 1: Simple Search (No Filters)"
echo "============================================"
curl -X POST http://127.0.0.1:8000/api/v1/analyses/bulk-search \
  -H "Content-Type: application/json" \
  -d '{
    "industry": "Cafe",
    "location": "Berlin",
    "targetResults": 3,
    "filters": {
      "maxRating": "any",
      "minReviews": 0,
      "priceLevel": [],
      "mustHavePhone": false,
      "maxPhotos": "any",
      "websiteStatus": "any"
    }
  }' | jq '.'
echo ""

# Test 2: Search with filters (matching frontend form with all filters)
echo "============================================"
echo "TEST 2: Search with Filters (Sniper Mode)"
echo "============================================"
curl -X POST http://127.0.0.1:8000/api/v1/analyses/bulk-search \
  -H "Content-Type: application/json" \
  -d '{
    "industry": "Restaurant",
    "location": "Berlin",
    "targetResults": 3,
    "filters": {
      "maxRating": "4.5",
      "minReviews": 10,
      "priceLevel": ["1", "2"],
      "mustHavePhone": true,
      "maxPhotos": "20",
      "websiteStatus": "has-website"
    }
  }' | jq '.'
echo ""

# Test 3: Check response structure matches frontend expectations
echo "============================================"
echo "TEST 3: Response Structure Validation"
echo "============================================"
echo "Checking if response has all required fields for frontend..."

RESPONSE=$(curl -s -X POST http://127.0.0.1:8000/api/v1/analyses/bulk-search \
  -H "Content-Type: application/json" \
  -d '{
    "industry": "Pizza",
    "location": "Berlin",
    "targetResults": 1,
    "filters": {
      "maxRating": "any",
      "minReviews": 0,
      "priceLevel": [],
      "mustHavePhone": false,
      "maxPhotos": "any",
      "websiteStatus": "any"
    }
  }')

# Check required fields
REQUIRED_FIELDS=("analysisId" "status" "totalFound" "totalScanned" "leads" "message")
ALL_PRESENT=true

for field in "${REQUIRED_FIELDS[@]}"; do
    if echo "$RESPONSE" | jq -e ".$field" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Field '$field' present${NC}"
    else
        echo -e "${RED}❌ Field '$field' missing${NC}"
        ALL_PRESENT=false
    fi
done

echo ""

# Check lead structure if any leads returned
LEAD_COUNT=$(echo "$RESPONSE" | jq '.leads | length')
if [ "$LEAD_COUNT" -gt 0 ]; then
    echo "Checking first lead structure..."
    LEAD_FIELDS=("id" "website" "companyName" "email" "location" "uiScore" "seoScore" "techScore" "totalScore" "status" "lastChecked" "techStack" "hasAdsPixel" "googleSpeedScore" "loadingTime" "copyrightYear")
    
    for field in "${LEAD_FIELDS[@]}"; do
        if echo "$RESPONSE" | jq -e ".leads[0].$field" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Lead field '$field' present${NC}"
        else
            echo -e "${YELLOW}⚠️  Lead field '$field' missing (might be optional)${NC}"
        fi
    done
else
    echo -e "${YELLOW}⚠️  No leads returned, skipping lead structure check${NC}"
fi

echo ""
echo "============================================"
echo "INTEGRATION TEST SUMMARY"
echo "============================================"

if [ "$ALL_PRESENT" = true ]; then
    echo -e "${GREEN}✅ All required fields present!${NC}"
    echo -e "${GREEN}✅ Frontend-Backend integration is ready!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start the frontend: cd .. && npm run dev"
    echo "2. Open http://localhost:3000 in your browser"
    echo "3. Try a Google Maps Bulk Search"
else
    echo -e "${RED}❌ Some fields are missing${NC}"
    echo "Please check the backend implementation"
fi
