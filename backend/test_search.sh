#!/bin/bash
# Test the Deep Search Analyzer

cd "$(dirname "$0")"

# Activate virtual environment
source venv/bin/activate

echo "=========================================="
echo "Testing Deep Search Analyzer"
echo "=========================================="
echo ""

# Run test
python test_analyzer.py
