import asyncio
from analyzer import DeepAnalyzer
from main import BulkScanFilters

# Simuliere einen Filter: Suche schlechte Zahnärzte
filters = BulkScanFilters(
    max_rating=4.5,
    min_reviews=5,
    must_have_phone=True,
    website_status="Any"
)

async def test():
    analyzer = DeepAnalyzer()
    print("🚀 Starte Deep Search...")
    results = await analyzer.process_bulk_search(
        query="Zahnarzt Zürich",
        limit=5,
        filters=filters
    )
    print(f"✅ Gefunden: {len(results)} Leads")
    for r in results:
        print(f"- {r.get('business_name')} (Rating: {r.get('rating')})")

if __name__ == "__main__":
    asyncio.run(test())