# 🧪 Testing the Result Diversification Feature

## Quick Test Guide

### **Test 1: Same Search, Different Results**

1. **Open your app:** http://localhost:3000 (or https://v0-website-scaped.vercel.app)

2. **Run first search:**
   - Industry: `Restaurant`
   - Location: `Zürich`
   - Click "Start Search"
   - **Write down the first 5 business names**

3. **Run second search (SAME parameters):**
   - Industry: `Restaurant`
   - Location: `Zürich`
   - Click "Start Search"
   - **Compare the results**

### **Expected Result:**
✅ Different businesses appear  
✅ Different order even if some overlap  
✅ Still relevant results (high ratings)

---

## What You Should See in Backend Logs

```bash
tail -f backend/server.log
```

**Look for these lines:**
```
⏳ Calling RapidAPI: https://local-business-data.p.rapidapi.com/search
   Query: Restaurant Zürich
   Offset: 0 | Limit: 20                    ← First search starts at 0
✅ RapidAPI done: 20 businesses found
   🎯 Hybrid ranking applied                 ← NEW! Scoring with randomness
   🎲 Results shuffled (kept top 5 stable)   ← NEW! Shuffling positions 6-20
```

**Second search:**
```
   Offset: 20 | Limit: 40                   ← Different offset!
   🎯 Hybrid ranking applied
   🎲 Results shuffled
```

---

## Advanced Tests

### **Test 2: Verify Offset Pagination**

Run 3 consecutive searches:
- Search 1 → Should show offset: 0
- Search 2 → Should show offset: 20
- Search 3 → Should show offset: 40

**Check:** Each search fetches from a different "page" of results.

---

### **Test 3: Quality Preservation**

Compare ratings across multiple searches:
- Top 5 results should have ratings ≥ 4.0 stars
- Businesses with websites prioritized
- High review counts appear near top

**Check:** Diversification doesn't sacrifice quality!

---

### **Test 4: Cost Verification**

Go to: https://rapidapi.com/dashboard

**Check your usage:**
- Each search = 1 API call
- NOT 3 API calls (despite fetching from different offsets)
- Cost same as before ✅

---

## Troubleshooting

### **Problem: Results still look the same**

**Possible causes:**
1. Backend not restarted after code update
2. Caching in browser
3. Offset not incrementing

**Solution:**
```bash
# Restart backend
cd /Users/emanuel/v0-website-scaped-1/backend
pkill -f "uvicorn main:app"
./start_server.sh

# Clear browser cache
# Or open in Incognito mode
```

---

### **Problem: Lower quality results**

**Adjustment needed:**
Edit `backend/analyzer.py` line ~390:

```python
# Increase quality weight, reduce randomness
score = (
    0.45 * norm_rating +      # 45% instead of 35%
    0.25 * norm_reviews +
    0.25 * has_website +
    0.05 * random.random()    # 5% instead of 15%
)
```

---

### **Problem: Not enough variety**

**Adjustment needed:**
Edit `backend/analyzer.py` line ~390:

```python
# Increase randomness weight
score = (
    0.30 * norm_rating +
    0.20 * norm_reviews +
    0.20 * has_website +
    0.30 * random.random()    # 30% random!
)
```

---

## Performance Check

Run this in terminal:
```bash
time curl -X POST http://localhost:8000/api/v1/analyses/bulk-search-stream \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "industry": "Restaurant",
    "location": "Zürich",
    "targetResults": 5,
    "filters": {}
  }'
```

**Expected time:** ~10-15 seconds (same as before)

If it's slower, the new code might have issues.

---

## Success Criteria

✅ Different results every search  
✅ Top results still high quality (4+ stars)  
✅ Same API cost (1 credit per search)  
✅ No errors in logs  
✅ Response time unchanged  

---

## Rollback Plan

If something breaks, disable the feature:

**Edit `backend/analyzer.py` line ~159:**

```python
# Comment out these lines:
# if businesses:
#     businesses = self._apply_hybrid_ranking(businesses)

# And this:
# if businesses and len(businesses) > 5:
#     businesses = self._shuffle_results(businesses, keep_top_n=5)
```

Then restart backend. System returns to original behavior.

---

**Need help?** Check `backend/RESULT_DIVERSIFICATION.md` for full documentation.
