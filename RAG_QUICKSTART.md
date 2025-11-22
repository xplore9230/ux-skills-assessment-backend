# RAG System Quick Start Guide

## Prerequisites

Before starting, ensure you have:

1. ✅ Python 3.8+ installed
2. ✅ All dependencies installed (see step 1 below)
3. ✅ Ollama installed and running
4. ✅ Internet connection (for scraping)

## Step-by-Step Setup

### Step 1: Install Dependencies

```bash
cd server_py
pip install -r requirements.txt
```

Expected output:
```
Successfully installed chromadb-0.4.22 sentence-transformers-2.3.1 beautifulsoup4-4.12.3 ...
```

### Step 2: Test RAG System

Before scraping, verify all components work:

```bash
python test_rag.py
```

Expected output:
```
✅ All tests passed! RAG system is ready.
```

If tests fail, check error messages and ensure dependencies are installed.

### Step 3: Run Initial Ingestion

**Option A: Scrape all sources (Recommended)**

This will scrape 100+ resources from all available sources (~10 minutes with rate limiting):

```bash
python ingest.py --scrape --sources all --limit 100
```

**Option B: Scrape specific sources**

Start with high-quality sources like Nielsen Norman Group and Laws of UX:

```bash
python ingest.py --scrape --sources nngroup,lawsofux --limit 50
```

**Option C: Add specific URLs manually**

If you want to start with specific articles:

```bash
python ingest.py --add-url "https://www.nngroup.com/articles/ten-usability-heuristics/" --source nngroup
python ingest.py --add-url "https://lawsofux.com/aesthetic-usability-effect/" --source lawsofux
```

### Step 4: Verify Knowledge Base

Check that resources were added:

```bash
python admin.py --stats
```

Expected output:
```
📊 Overview:
   Total unique resources: 45
   Total content chunks:   267

📂 Resources by Category:
   UX Fundamentals                : 89 chunks
   User Research & Validation     : 67 chunks
   ...
```

### Step 5: Test Semantic Search

Try searching the knowledge base:

```bash
python admin.py --search "usability testing"
```

Expected output:
```
Found 5 results:

1. A Beginner's Guide to Usability Testing
   Category:   User Research & Validation
   Difficulty: beginner
   ...
```

### Step 6: Test RAG Retrieval

Test the complete RAG pipeline:

```bash
python admin.py --test-rag --stage "Practitioner"
```

Expected output:
```
✓ Retrieved 5 resources:

1. Understanding User Research Methods
   Category:   User Research & Validation
   Difficulty: intermediate
   Relevance:  0.875
```

### Step 7: Start Python Server

Run the FastAPI server with RAG endpoints:

```bash
python main.py
```

Or with uvicorn:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Expected output:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
✓ Vector store initialized
✓ RAG system available
```

### Step 8: Test API Endpoints

In another terminal, test the RAG API:

```bash
# Test RAG stats
curl http://localhost:8000/api/rag/stats

# Test RAG search
curl -X POST http://localhost:8000/api/rag/search \
  -H "Content-Type: application/json" \
  -d '{"query": "usability testing", "top_k": 5}'
```

### Step 9: Start Full Application

Now start your Node.js server and access the app:

```bash
# In project root
npm run dev
```

The quiz app will now use RAG-enhanced recommendations!

## Ingestion Output Explained

When running ingestion, you'll see output like:

```
======================================================================
  UX RESOURCES INGESTION PIPELINE
======================================================================

✓ Vector store initialized at /path/to/.chroma
✓ Using embedding model: all-MiniLM-L6-v2
✓ Collection 'ux_resources' ready

──────────────────────────────────────────────────────────────────────
  SOURCE: NNGROUP
──────────────────────────────────────────────────────────────────────

📥 Processing 20 URLs from nngroup...

[1/20] https://www.nngroup.com/articles/ten-usability-heuristics/
  → Scraping NN/g: https://www.nngroup.com/articles/ten-usability-heuristics/
  ✓ Scraped: 10 Usability Heuristics for User Interface Design
  ✓ Added: 10 Usability Heuristics for User Interface Design (5 chunks)

[2/20] https://www.nngroup.com/articles/user-research-methods/
  → Scraping NN/g: https://www.nngroup.com/articles/user-research-methods/
  ✓ Scraped: When to Use Which User-Experience Research Methods
  ✓ Added: When to Use Which User-Experience Research Methods (8 chunks)
  
...

✓ Completed nngroup: 18/20 successful

======================================================================
  INGESTION SUMMARY
======================================================================

📊 Statistics:
   Total URLs processed: 45
   ✓ Successful:         42
   ⊗ Skipped (exists):   0
   ✗ Failed:             3

📚 By Source:
   nngroup             : 18
   lawsofux            : 19
   uxcollective        : 5

💾 Knowledge Base Status:
   Total resources:  42
   Total chunks:     245
```

## Common Issues & Solutions

### Issue: "RAG system not available"

**Cause**: Dependencies not installed or import error

**Solution**:
```bash
cd server_py
pip install -r requirements.txt
python -c "from rag import get_rag_retriever; print('OK')"
```

### Issue: "Failed to fetch URL"

**Cause**: Network issue or site structure changed

**Solution**:
- Check internet connection
- Try a different source
- Check if specific URL is accessible in browser
- Some sites may block bots (expected, skip those)

### Issue: "Collection already exists"

**Cause**: Running ingestion again with same data

**Solution**:
- This is normal! Duplicate resources are automatically skipped
- To reset: `python ingest.py --scrape --sources all --reset --limit 100`

### Issue: Slow ingestion

**Cause**: Rate limiting (by design)

**Solution**:
- This is expected! We wait 2 seconds between requests
- 50 resources = ~5 minutes
- Run overnight for large ingestions
- Or use `--limit 20` for smaller batches

### Issue: "No module named 'sentence_transformers'"

**Cause**: Dependencies not installed in correct environment

**Solution**:
```bash
# Check Python version
python --version  # Should be 3.8+

# Reinstall in correct environment
pip install --upgrade pip
pip install -r requirements.txt

# Verify
python -c "import sentence_transformers; print('OK')"
```

## Performance Tips

### For Faster Ingestion

1. **Parallel scraping** (future enhancement):
   - Currently sequential to respect rate limits
   - Can be parallelized across different sources

2. **Incremental updates**:
   - Already implemented! Re-running skips existing URLs
   - Add new sources without re-scraping old ones

3. **Selective scraping**:
   ```bash
   # Only scrape what you need
   python ingest.py --scrape --sources nngroup --limit 10
   ```

### For Better Search Results

1. **More resources = better results**:
   - Aim for 100+ resources across all categories
   - Diversity is key (multiple sources)

2. **Quality over quantity**:
   - Focus on authoritative sources
   - Nielsen Norman Group, Laws of UX, A List Apart

3. **Regular updates**:
   - Re-run monthly to get new articles
   - Remove outdated content periodically

## Maintenance Schedule

### Weekly (Optional)
```bash
# Check stats
python admin.py --stats

# Add new articles as they're published
python ingest.py --add-url [NEW_URL] --source [SOURCE]
```

### Monthly (Recommended)
```bash
# Scrape new content
python ingest.py --scrape --sources all --limit 50

# Check for issues
python admin.py --test-rag
```

### Quarterly (Recommended)
```bash
# Review and cleanup
python admin.py --stats
python admin.py --export --output backup.json

# Consider full refresh if needed
python ingest.py --scrape --sources all --reset --limit 200
```

## Next Steps

Once ingestion is complete:

1. ✅ Knowledge base populated
2. ✅ RAG system active
3. ✅ Python server running
4. ✅ Frontend can use RAG features

Now users will receive:
- 🎯 Personalized resource recommendations
- 📚 Context-aware learning paths  
- 🔍 Semantic search for UX topics
- 🤖 AI responses enriched with real UX content

## Advanced Usage

### Custom Resources

Add your own curated content:

```bash
# Add a book or course
python ingest.py --add-url "https://example.com/ux-course" --source custom
```

### Export/Backup

```bash
# Backup knowledge base
python admin.py --export --output backup_$(date +%Y%m%d).json
```

### Rebuild Index

If search quality degrades:

```bash
python admin.py --rebuild-index
```

### Clear and Reset

⚠️ **CAUTION: This deletes all data!**

```bash
python ingest.py --scrape --sources all --reset --limit 150
```

## Success Checklist

- [ ] Dependencies installed without errors
- [ ] `test_rag.py` passes all tests
- [ ] Ingestion completed with 50+ resources
- [ ] `admin.py --stats` shows populated database
- [ ] `admin.py --search` returns relevant results
- [ ] `admin.py --test-rag` retrieves resources
- [ ] Python server starts without RAG errors
- [ ] API endpoint `/api/rag/stats` returns data
- [ ] Frontend hooks can fetch RAG data

## Getting Help

If you encounter issues:

1. Check this guide first
2. Run diagnostics: `python test_rag.py`
3. Check logs in terminal output
4. Verify dependencies: `pip list | grep -E "chroma|sentence|beautiful"`
5. Test components individually (see RAG_SYSTEM_README.md)

## Resources

- Full documentation: `RAG_SYSTEM_README.md`
- API reference: `server_py/main.py` (RAG endpoints section)
- Frontend hooks: `client/src/hooks/useRAG.ts`
- Test suite: `server_py/test_rag.py`

---

**Happy building! 🚀**

Your UX Skills Assessment now has a powerful AI knowledge base that grows smarter over time.

