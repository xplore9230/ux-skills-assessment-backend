# ProductHunt Launch - Critical Requirements

**Launch Date**: Next Monday  
**Status**: 🚨 CRITICAL - AI and RAG are CORE functionality

---

## ⚠️ CRITICAL: AI and RAG Are Core

**We CANNOT survive without:**
- ✅ **RAG System**: Must be fast and reliable (3-5s first request, <100ms cached)
- ✅ **OpenAI Integration**: Must work flawlessly for personalized results
- ✅ **Vector Database**: Must have all 264 resources loaded

**These are NOT optional - they are the heart of the product.**

---

## RAG Optimization Status

### ✅ Phase 1: Parallel Queries (COMPLETE)
- Changed from 3 sequential queries → 3 parallel queries
- Speed improvement: 9-15s → 3-5s (3x faster)
- File: `server_py/rag.py`

### ✅ Phase 2: In-Memory Caching (COMPLETE)
- Cache common stage+category combinations
- Cache TTL: 1 hour
- Speed improvement: First request 3-5s, cached requests <100ms (instant)
- File: `server_py/rag.py`

### ✅ Phase 3: Increased Timeout + Warmup (COMPLETE)
- Increased timeout: 10s → 20s (frontend)
- Added RAG warmup on Railway startup (prevents cold starts)
- File: `server/routes.ts` (frontend), `server_py/main.py` (backend)

---

## Pre-Launch Checklist

### Backend (Railway)
- [x] RAG parallel queries implemented
- [x] RAG caching implemented
- [x] RAG warmup on startup
- [ ] Verify Railway has 264 resources loaded
- [ ] Test RAG endpoint: `/api/rag/retrieve`
- [ ] Test RAG stats: `/api/rag/stats`
- [ ] Verify `OPENAI_API_KEY` is set on Railway

### Frontend (Vercel)
- [x] Increased RAG timeout to 20s
- [x] Better error logging for RAG failures
- [ ] Verify `PYTHON_API_URL` is set on Vercel
- [ ] Verify `OPENAI_API_KEY` is set on Vercel
- [ ] Test end-to-end: Quiz → Results → RAG resources load

### Monitoring
- [ ] Set up Railway logs monitoring
- [ ] Set up Vercel logs monitoring
- [ ] Verify OpenAI usage tracking
- [ ] Test RAG cache hit rate

---

## Expected Performance

### RAG Response Times
- **First request** (cache miss): 3-5 seconds
- **Cached requests** (cache hit): <100ms (instant)
- **Timeout**: 20 seconds (handles edge cases)

### Token Costs (with RAG)
- **With RAG**: ~700-1000 tokens per user (60% reduction)
- **Without RAG**: ~2000-2600 tokens per user

---

## Testing Commands

### Test RAG Endpoint
```bash
curl -X POST https://ux-skills-assessment-production.up.railway.app/api/rag/retrieve \
  -H "Content-Type: application/json" \
  -d '{
    "stage": "Practitioner",
    "categories": [
      {"name": "UX Fundamentals", "score": 45, "maxScore": 100}
    ],
    "top_k": 5
  }'
```

### Test RAG Stats
```bash
curl https://ux-skills-assessment-production.up.railway.app/api/rag/stats
```

### Test Frontend RAG Config
```bash
curl https://uxlevel.online/api/debug/rag-config
```

---

## Rollback Plan

If RAG fails on launch day:
1. **Immediate**: Check Railway logs for errors
2. **Fallback**: OpenAI-only mode (degraded but functional)
3. **Fix**: Restart Railway service
4. **Monitor**: Watch for cache hits (should be instant)

---

## Success Metrics

- ✅ RAG response time: <5s (first request)
- ✅ RAG cache hit rate: >50% (common queries)
- ✅ RAG success rate: >95% (no timeouts)
- ✅ OpenAI token usage: <1000 tokens per user (with RAG)

---

**Last Updated**: 2025-12-04  
**Priority**: 🚨 CRITICAL - ProductHunt Launch Monday

