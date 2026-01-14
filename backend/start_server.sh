#!/bin/bash
# LeadScraper AI - Server Starter
# Automatically activates venv and starts the FastAPI server

cd "$(dirname "$0")"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ ERROR: .env file not found!"
    echo "   Please copy .env.example to .env and configure it"
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

echo "=========================================="
echo "Starting LeadScraper AI Backend Server"
echo "=========================================="
echo ""
echo "Server will be available at:"
echo "  - API: http://localhost:8000"
echo "  - Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start server
python main.py
