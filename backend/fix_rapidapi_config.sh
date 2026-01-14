#!/bin/bash
#
# Fix RapidAPI Configuration
# Updates .env file with correct Google Maps Places API settings
#

set -e

echo "============================================"
echo "FIX RAPIDAPI CONFIGURATION"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

cd "$(dirname "$0")"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "Please create .env from .env.example first:"
    echo "  cp .env.example .env"
    exit 1
fi

echo "📝 Backing up current .env..."
cp .env .env.backup
echo -e "${GREEN}✅ Backup created: .env.backup${NC}"
echo ""

echo "🔧 Updating RAPIDAPI_HOST..."
# Update RAPIDAPI_HOST
if grep -q "RAPIDAPI_HOST=" .env; then
    sed -i.tmp 's|RAPIDAPI_HOST=.*|RAPIDAPI_HOST=google-map-places.p.rapidapi.com|' .env
    rm -f .env.tmp
    echo -e "${GREEN}✅ Updated RAPIDAPI_HOST${NC}"
else
    echo "RAPIDAPI_HOST=google-map-places.p.rapidapi.com" >> .env
    echo -e "${GREEN}✅ Added RAPIDAPI_HOST${NC}"
fi

echo "🔧 Updating RAPIDAPI_GOOGLE_MAPS_ENDPOINT..."
# Update endpoint
if grep -q "RAPIDAPI_GOOGLE_MAPS_ENDPOINT=" .env; then
    sed -i.tmp 's|RAPIDAPI_GOOGLE_MAPS_ENDPOINT=.*|RAPIDAPI_GOOGLE_MAPS_ENDPOINT=https://google-map-places.p.rapidapi.com/maps/search|' .env
    rm -f .env.tmp
    echo -e "${GREEN}✅ Updated RAPIDAPI_GOOGLE_MAPS_ENDPOINT${NC}"
else
    echo "RAPIDAPI_GOOGLE_MAPS_ENDPOINT=https://google-map-places.p.rapidapi.com/maps/search" >> .env
    echo -e "${GREEN}✅ Added RAPIDAPI_GOOGLE_MAPS_ENDPOINT${NC}"
fi

echo ""
echo "============================================"
echo "CONFIGURATION SUMMARY"
echo "============================================"
echo ""
echo "Current RapidAPI settings:"
grep "RAPIDAPI" .env
echo ""
echo -e "${GREEN}✅ Configuration updated successfully!${NC}"
echo ""
echo "⚠️  IMPORTANT: You need to subscribe to the CORRECT RapidAPI:"
echo ""
echo "1. Go to: https://rapidapi.com/letscrape-6bRBa3QguO5/api/google-map-places"
echo "2. Click 'Subscribe to Test'"
echo "3. Select a plan (Free tier available)"
echo "4. Make sure your API key is the same in .env"
echo ""
echo "🔄 Next steps:"
echo "1. Restart the backend server:"
echo "   pkill -9 -f 'python main.py' && ./start_server.sh &"
echo "2. Test the API:"
echo "   ./test_search.sh"
echo ""
