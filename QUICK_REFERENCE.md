# Vector Database - Quick Reference

## Current Stats (Live)

**Total Resources**: 264

### Category Distribution:
- Product Thinking & Strategy: 83 (31%)
- UX Fundamentals: 63 (24%)
- Collaboration & Communication: 58 (22%)
- UI Craft & Visual Design: 37 (14%) ✅
- User Research & Validation: 23 (9%) ✅

### Top Sources:
- Podcasts: 158 resources
- NN/g: 44 resources
- YouTube: 15 resources

---

## Quick Commands

### Check Stats
```bash
cd server_py && python3 admin.py --stats
```

### Scrape Articles
```bash
python3 server_py/scrape_articles.py --category all
```

### Run Social Scraper
```bash
python3 server_py/run_social_scraper.py
```

### Import Knowledge Bank
```bash
node scripts/export-knowledge-bank.mjs
python3 server_py/import_knowledge_bank.py
```

---

## Files Created

- `server_py/article_sources.json` - Article URLs by category
- `server_py/scrape_articles.py` - Article scraper
- `server_py/import_knowledge_bank.py` - Knowledge bank importer
- `scripts/export-knowledge-bank.mjs` - Knowledge bank exporter
- `server_py/social_config.json` - Updated with new sources

---

**Last Updated**: December 3, 2025

