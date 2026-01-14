#!/bin/bash
# LeadScraper AI - Test Runner
# Automatically activates venv and runs tests

cd "$(dirname "$0")"

# Activate virtual environment
source venv/bin/activate

# Run tests
python test_apis.py

# Deactivate is automatic when script ends
