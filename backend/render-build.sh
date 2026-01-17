#!/usr/bin/env bash
# Render.com Build Script for LeadScraper AI Backend
# This script runs during deployment on Render

set -o errexit  # Exit on error

echo "🚀 Starting Render build process..."

# Install Python dependencies
echo "📦 Installing Python packages..."
pip install -r requirements.txt

# Install Playwright browser (Chromium)
echo "🌐 Installing Playwright Chromium browser..."
playwright install chromium

# Install system dependencies for Playwright
echo "🔧 Installing Playwright system dependencies..."
playwright install-deps

echo "✅ Build complete! Ready to start server."
