#!/bin/bash
# LeadScraper AI - Server Starter
# Automatically activates venv and starts the FastAPI server

cd "$(dirname "$0")"

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
