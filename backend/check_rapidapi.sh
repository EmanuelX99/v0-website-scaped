#!/bin/bash
#
# Check RapidAPI Configuration
#

set -e

echo "============================================"
echo "RAPIDAPI CONFIGURATION CHECK"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

cd "$(dirname "$0")"

# Load .env
if [ -f ".env" ]; then
    source .env
else
    echo -e "${RED}❌ .env file not found!${NC}"
    exit 1
fi

echo "📊 Current Configuration:"
echo "  RAPIDAPI_KEY: ${RAPIDAPI_KEY:0:10}...${RAPIDAPI_KEY: -10}"
echo "  RAPIDAPI_HOST: $RAPIDAPI_HOST"
echo ""

# Test API call
echo "🧪 Testing API connection..."
echo ""

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X GET "https://${RAPIDAPI_HOST}/maps/search?query=restaurant+Berlin&limit=1&language=en&region=us" \
  -H "X-RapidAPI-Key: ${RAPIDAPI_KEY}" \
  -H "X-RapidAPI-Host: ${RAPIDAPI_HOST}")

HTTP_STATUS=$(echo "$RESPONSE" | grep HTTP_STATUS | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "Response Status: $HTTP_STATUS"
echo ""

if [ "$HTTP_STATUS" == "200" ]; then
    echo -e "${GREEN}✅ SUCCESS! API is working correctly!${NC}"
    echo ""
    echo "Sample response:"
    echo "$BODY" | python3 -m json.tool | head -20
    echo ""
    echo -e "${GREEN}🎉 Your RapidAPI configuration is correct!${NC}"
    echo "You can now use the bulk search feature."
    
elif [ "$HTTP_STATUS" == "403" ]; then
    echo -e "${RED}❌ 403 FORBIDDEN${NC}"
    echo ""
    echo "This means you are NOT subscribed to this API!"
    echo ""
    echo "🔧 To fix:"
    echo "1. Go to: https://rapidapi.com/letscrape-6bRBa3QguO5/api/google-map-places"
    echo "2. Click 'Subscribe to Test'"
    echo "3. Choose FREE plan (1,000 requests/month)"
    echo "4. After subscribing, run this script again"
    echo ""
    echo "Response:"
    echo "$BODY"
    
elif [ "$HTTP_STATUS" == "429" ]; then
    echo -e "${YELLOW}⚠️  429 TOO MANY REQUESTS${NC}"
    echo ""
    echo "You've exceeded the rate limit."
    echo "Wait a minute and try again."
    echo ""
    echo "Response:"
    echo "$BODY"
    
elif [ "$HTTP_STATUS" == "401" ]; then
    echo -e "${RED}❌ 401 UNAUTHORIZED${NC}"
    echo ""
    echo "Your API key is invalid!"
    echo ""
    echo "🔧 To fix:"
    echo "1. Go to: https://rapidapi.com/developer/security"
    echo "2. Copy your Application Key"
    echo "3. Update RAPIDAPI_KEY in .env"
    echo ""
    echo "Response:"
    echo "$BODY"
    
else
    echo -e "${RED}❌ UNEXPECTED ERROR (Status: $HTTP_STATUS)${NC}"
    echo ""
    echo "Response:"
    echo "$BODY"
fi

echo ""
echo "============================================"
