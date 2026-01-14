"""
LeadScraper AI - Setup Guide
Interactive guide to help you get all required API keys
"""

import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

def check_env_var(var_name, default_value):
    """Check if environment variable is set and not default"""
    value = os.getenv(var_name)
    if not value:
        return False, "❌ NOT SET"
    elif value == default_value:
        return False, "⚠️  STILL DEFAULT VALUE"
    else:
        return True, "✅ CONFIGURED"

print("\n" + "=" * 80)
print("LeadScraper AI - Setup Guide")
print("=" * 80)
print("\nChecking your .env configuration...\n")

# Check all required keys
checks = [
    # Supabase
    ("SUPABASE_URL", "https://your-project.supabase.co", "Supabase Project URL"),
    ("SUPABASE_KEY", "your-supabase-anon-key", "Supabase Anon Key"),
    ("SUPABASE_SERVICE_ROLE_KEY", "your-service-role-key", "Supabase Service Role Key"),
    
    # RapidAPI
    ("RAPIDAPI_KEY", "your-rapidapi-key", "RapidAPI Key"),
    
    # Gemini AI
    ("GEMINI_API_KEY", "your-gemini-api-key", "Gemini AI Key"),
    
    # PageSpeed (optional)
    ("GOOGLE_PAGESPEED_API_KEY", "your-google-pagespeed-api-key", "PageSpeed Insights Key (Optional)"),
]

all_configured = True
for var_name, default, description in checks:
    is_configured, status = check_env_var(var_name, default)
    print(f"{status} - {description}")
    print(f"   Variable: {var_name}")
    if not is_configured:
        all_configured = False
    print()

print("=" * 80)

if all_configured:
    print("✅ All API keys are configured!")
    print("\nYou can now run: python test_apis.py")
else:
    print("⚠️  Some API keys need to be configured")
    print("\nFollow this guide to get your API keys:")
    print()
    
    print("=" * 80)
    print("1. SUPABASE (Database)")
    print("=" * 80)
    print("1. Go to: https://supabase.com")
    print("2. Sign up / Log in")
    print("3. Create a new project")
    print("4. Go to: Settings → API")
    print("5. Copy:")
    print("   - Project URL → SUPABASE_URL")
    print("   - anon/public key → SUPABASE_KEY")
    print("   - service_role key → SUPABASE_SERVICE_ROLE_KEY")
    print()
    
    print("=" * 80)
    print("2. RAPIDAPI (Google Maps)")
    print("=" * 80)
    print("1. Go to: https://rapidapi.com")
    print("2. Sign up / Log in")
    print("3. Search for: 'Google Maps Data'")
    print("4. Subscribe to a plan (Free tier available)")
    print("5. Copy your API Key → RAPIDAPI_KEY")
    print()
    
    print("=" * 80)
    print("3. GEMINI AI (Google)")
    print("=" * 80)
    print("1. Go to: https://makersuite.google.com/app/apikey")
    print("2. Sign in with Google account")
    print("3. Click 'Create API Key'")
    print("4. Copy the key → GEMINI_API_KEY")
    print()
    
    print("=" * 80)
    print("4. PAGESPEED INSIGHTS (Optional)")
    print("=" * 80)
    print("1. Go to: https://console.cloud.google.com")
    print("2. Create a new project (or select existing)")
    print("3. Enable 'PageSpeed Insights API'")
    print("4. Go to: APIs & Services → Credentials")
    print("5. Create API Key")
    print("6. Copy the key → GOOGLE_PAGESPEED_API_KEY")
    print()
    
    print("=" * 80)
    print("HOW TO ADD KEYS TO .ENV FILE")
    print("=" * 80)
    print(f"1. Open the .env file:")
    print(f"   nano .env")
    print(f"   (or use any text editor)")
    print()
    print(f"2. Replace the example values with your real keys")
    print()
    print(f"3. Save the file")
    print()
    print(f"4. Run: python test_apis.py")
    print()

print("=" * 80)
print("\nNeed help? Check backend/README.md for detailed instructions")
print("=" * 80)
