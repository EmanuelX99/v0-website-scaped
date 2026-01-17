#!/usr/bin/env bash
# Render.com Build Script for LeadScraper AI Backend
# This script runs during deployment on Render

set -o errexit  # Exit on error

echo "🚀 Starting Render build process..."

# Install Python dependencies
echo "📦 Installing Python packages..."
pip install -r requirements.txt

# Install Playwright browser (Chromium) - WITHOUT system dependencies
echo "🌐 Installing Playwright Chromium browser..."
playwright install chromium --with-deps || playwright install chromium

echo "✅ Build complete! Ready to start server."
echo "⚠️  Note: If Playwright fails at runtime, it will fallback to requests library."
