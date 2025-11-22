# RAG System Commands Cheat Sheet

Quick reference for all RAG system commands.

## 🚀 Initial Setup

```bash
# Install dependencies
cd server_py
pip install -r requirements.txt

# Test installation
python test_rag.py

# First-time ingestion (100+ resources, ~10 min)
python ingest.py --scrape --sources all --limit 100
```

## 📥 Ingestion Commands

```bash
# Scrape from all sources
python ingest.py --scrape --sources all --limit 100

# Scrape from specific sources
python ingest.py --scrape --sources nngroup,lawsofux --limit 50

# Add single URL
python ingest.py --add-url "https://www.nngroup.com/articles/ten-usability-heuristics/" --source nngroup

# Reset and rebuild (⚠️ DELETES ALL DATA)
python ingest.py --scrape --sources all --reset --limit 150
```

### Available Sources
- `nngroup` - Nielsen Norman Group
- `lawsofux` - Laws of UX
- `uxcollective` - UX Collective (Medium)
- `smashing` - Smashing Magazine
- `alistapart` - A List Apart
- `all` - All sources

## 🔍 Admin Commands

```bash
# View knowledge base statistics
python admin.py --stats

# Search the knowledge base
python admin.py --search "usability testing"

# Search with category filter
python admin.py --search "wireframing" --category "UX Fundamentals" --limit 5

# Test RAG retrieval
python admin.py --test-rag --stage "Practitioner"

# Export resources
python admin.py --export --output backup.json

# Rebuild index
python admin.py --rebuild-index

# Clear database (⚠️ CAUTION!)
python admin.py --clear
```

## 🖥️ Server Commands

```bash
# Start Python/FastAPI server
python main.py

# Or with uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# In another terminal: Start Node server
cd ..  # Back to project root
npm run dev
```

## 🧪 Testing Commands

```bash
# Run full test suite
python test_rag.py

# Test specific import
python -c "from rag import get_rag_retriever; print('OK')"

# Test vector store
python -c "from vector_store import get_vector_store; print('OK')"
```

## 🌐 API Commands (curl)

```bash
# Get RAG stats
curl http://localhost:8000/api/rag/stats

# Semantic search
curl -X POST http://localhost:8000/api/rag/search \
  -H "Content-Type: application/json" \
  -d '{"query": "usability testing", "top_k": 5}'

# Search with filters
curl -X POST http://localhost:8000/api/rag/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "user research",
    "category": "User Research & Validation",
    "difficulty": "intermediate",
    "top_k": 10
  }'

# Generate learning path
curl -X POST http://localhost:8000/api/rag/learning-path \
  -H "Content-Type: application/json" \
  -d '{
    "stage": "Practitioner",
    "categories": [
      {"name": "User Research & Validation", "score": 40, "maxScore": 100},
      {"name": "UX Fundamentals", "score": 60, "maxScore": 100}
    ]
  }'

# Get resources by category
curl "http://localhost:8000/api/rag/resources/User%20Research%20%26%20Validation?difficulty=intermediate&limit=10"
```

## 🔄 Maintenance Commands

```bash
# Weekly: Add new articles
python ingest.py --add-url [NEW_URL] --source [SOURCE]

# Monthly: Update content
python ingest.py --scrape --sources all --limit 50

# Quarterly: Backup and review
python admin.py --export --output backup_$(date +%Y%m%d).json
python admin.py --stats
```

## 🐛 Troubleshooting Commands

```bash
# Check Python version (need 3.8+)
python --version

# Verify dependencies
pip list | grep -E "chroma|sentence|beautiful"

# Test imports
python -c "import chromadb, sentence_transformers; print('OK')"

# Check ChromaDB directory
ls -la .chroma/

# View recent logs
tail -f /path/to/logs  # If you set up logging
```

## 💡 Common Workflows

### Daily Development
```bash
cd server_py
python admin.py --stats
python main.py  # Start backend
# In another terminal: npm run dev  # Start frontend
```

### Adding New Content
```bash
python ingest.py --add-url [URL] --source [SOURCE]
python admin.py --stats  # Verify added
python admin.py --search [TOPIC]  # Test search
```

### Testing RAG Features
```bash
python test_rag.py  # Run tests
python admin.py --test-rag --stage "Practitioner"  # Test retrieval
curl http://localhost:8000/api/rag/stats  # Test API
```

### Monthly Maintenance
```bash
# Backup
python admin.py --export --output backup_$(date +%Y%m%d).json

# Update
python ingest.py --scrape --sources all --limit 50

# Verify
python admin.py --stats
python admin.py --search "recent topic"
```

### Emergency Reset
```bash
# ⚠️ This deletes everything!
python admin.py --clear
python ingest.py --scrape --sources all --reset --limit 150
python admin.py --stats
```

## 📝 Quick Tips

- Ingestion takes time due to rate limiting (2s between requests)
- Duplicate resources are automatically skipped
- RAG system works offline once ingested
- All data stored locally in `.chroma/` directory
- Failed URLs are logged and skipped
- Search uses semantic similarity, not keywords

## 🎯 Success Indicators

After setup, you should see:
- ✅ `python test_rag.py` - All tests pass
- ✅ `python admin.py --stats` - 50+ resources
- ✅ `python admin.py --search "test"` - Returns results
- ✅ `curl http://localhost:8000/api/rag/stats` - Returns JSON
- ✅ Python server starts with "RAG system available"

## 📚 Documentation

- Full guide: `RAG_SYSTEM_README.md`
- Setup guide: `RAG_QUICKSTART.md`
- Summary: `RAG_IMPLEMENTATION_SUMMARY.md`
- This file: `RAG_COMMANDS_CHEATSHEET.md`

---

**Quick Start**: `pip install -r requirements.txt && python test_rag.py && python ingest.py --scrape --sources all --limit 100`

