# RAG System for UX Resources

## Overview

This RAG (Retrieval-Augmented Generation) system enhances the UX Skills Assessment with AI-powered, personalized resource recommendations. It scrapes UX content from authoritative sources, stores it in a vector database, and uses semantic search to provide context-aware suggestions.

## Architecture

```
┌─────────────────┐
│  Web Scrapers   │  → Scrape UX content from authoritative sources
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Content Chunks │  → Split into semantic chunks with metadata
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   ChromaDB      │  → Vector database with embeddings
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  RAG Retriever  │  → Semantic search & learning paths
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Ollama + AI    │  → Context-enriched responses
└─────────────────┘
```

## Setup

### 1. Install Python Dependencies

```bash
cd server_py
pip install -r requirements.txt
```

This installs:
- `chromadb` - Vector database
- `sentence-transformers` - Embedding model
- `beautifulsoup4` - Web scraping
- `markdownify` - HTML to Markdown conversion

### 2. Initialize the Knowledge Base

Run the ingestion pipeline to scrape and store resources:

```bash
# Scrape from all sources (recommended for first time)
python ingest.py --scrape --sources all --limit 100

# Or scrape from specific sources
python ingest.py --scrape --sources nngroup,lawsofux --limit 50
```

**Available sources:**
- `nngroup` - Nielsen Norman Group articles
- `lawsofux` - Laws of UX principles
- `uxcollective` - UX Collective (Medium)
- `smashing` - Smashing Magazine
- `alistapart` - A List Apart

### 3. Verify Setup

Check knowledge base statistics:

```bash
python admin.py --stats
```

Test semantic search:

```bash
python admin.py --search "usability testing"
```

## Usage

### Command Line Tools

#### Ingestion Pipeline (`ingest.py`)

**Scrape from multiple sources:**
```bash
python ingest.py --scrape --sources nngroup,lawsofux --limit 30
```

**Add a specific URL:**
```bash
python ingest.py --add-url https://www.nngroup.com/articles/ten-usability-heuristics/ --source nngroup
```

**Reset and rebuild (⚠️ CAUTION!):**
```bash
python ingest.py --scrape --sources all --reset --limit 150
```

#### Admin Tool (`admin.py`)

**View statistics:**
```bash
python admin.py --stats
```

**Search the knowledge base:**
```bash
python admin.py --search "wireframing" --category "UX Fundamentals" --limit 5
```

**Test RAG retrieval:**
```bash
python admin.py --test-rag --stage "Practitioner"
```

**Export resources:**
```bash
python admin.py --export --output resources_backup.json
```

**Rebuild index:**
```bash
python admin.py --rebuild-index
```

### API Endpoints

#### Search Resources
```http
POST /api/rag/search
Content-Type: application/json

{
  "query": "usability testing methods",
  "category": "User Research & Validation",
  "difficulty": "intermediate",
  "top_k": 10
}
```

#### Generate Learning Path
```http
POST /api/rag/learning-path
Content-Type: application/json

{
  "stage": "Practitioner",
  "categories": [
    {"name": "User Research & Validation", "score": 40, "maxScore": 100},
    {"name": "UX Fundamentals", "score": 60, "maxScore": 100}
  ]
}
```

#### Get Knowledge Base Stats
```http
GET /api/rag/stats
```

#### Get Resources by Category
```http
GET /api/rag/resources/User%20Research%20%26%20Validation?difficulty=intermediate&limit=10
```

### Frontend Integration

#### Using RAG Hooks

**Semantic Search:**
```typescript
import { useRAGSearch } from '@/hooks/useRAG';

function SearchComponent() {
  const { results, isLoading, error, search } = useRAGSearch();
  
  const handleSearch = () => {
    search('usability testing', 'User Research & Validation', 'intermediate', 10);
  };
  
  return (
    <div>
      <button onClick={handleSearch}>Search</button>
      {isLoading && <p>Loading...</p>}
      {results.map(resource => (
        <div key={resource.resource_id}>
          <h3>{resource.title}</h3>
          <p>{resource.content_preview}</p>
        </div>
      ))}
    </div>
  );
}
```

**Learning Paths:**
```typescript
import { useLearningPath } from '@/hooks/useRAG';

function LearningPathComponent({ stage, categories }) {
  const { learningPaths, isLoading, error } = useLearningPath(stage, categories);
  
  return (
    <div>
      {learningPaths.map(path => (
        <div key={path.weak_area}>
          <h2>{path.weak_area}</h2>
          <p>Score: {path.current_score}/{path.max_score}</p>
          {path.resources.map(resource => (
            <a key={resource.resource_id} href={resource.url}>
              {resource.title}
            </a>
          ))}
        </div>
      ))}
    </div>
  );
}
```

**Knowledge Base Stats:**
```typescript
import { useRAGStats } from '@/hooks/useRAG';

function StatsComponent() {
  const { stats, isLoading, error } = useRAGStats();
  
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  
  return (
    <div>
      <p>Total Resources: {stats?.total_resources}</p>
      <p>Total Chunks: {stats?.total_chunks}</p>
    </div>
  );
}
```

## How It Works

### 1. Content Scraping

Scrapers fetch UX articles from authoritative sources:

- **Rate limiting**: 2 seconds between requests
- **Respectful crawling**: Follows robots.txt
- **Error handling**: Graceful failures with logging
- **User-Agent**: Identifies bot for transparency

### 2. Content Processing

Raw HTML is converted to structured data:

- **Cleaning**: Removes ads, navigation, footers
- **Markdown conversion**: Preserves formatting
- **Metadata extraction**: Title, author, date, tags
- **Category mapping**: Auto-assigns to 5 quiz categories
- **Difficulty classification**: Beginner/Intermediate/Advanced

### 3. Chunking

Long articles are split into semantic chunks:

- **Chunk size**: 300-500 words
- **Overlap**: 50 words for context preservation
- **Paragraph-aware**: Respects semantic boundaries
- **Metadata preserved**: Each chunk retains resource info

### 4. Embedding & Storage

Content is vectorized and stored:

- **Model**: `all-MiniLM-L6-v2` (fast, efficient)
- **Database**: ChromaDB (persistent, local)
- **Metadata filtering**: Category, difficulty, source
- **Deduplication**: Prevents duplicate storage

### 5. Retrieval

Semantic search finds relevant resources:

- **Query building**: From weak category names
- **Difficulty matching**: Based on career stage
- **Relevance ranking**: Cosine similarity scores
- **Deduplication**: Returns unique resources only

### 6. AI Enhancement

Retrieved context enriches Ollama prompts:

- **Context injection**: Top 5-10 relevant resources
- **Prompt engineering**: Instructs AI to reference sources
- **Token limiting**: Stays within model limits
- **Fallback mode**: Works without RAG if unavailable

## Knowledge Base Management

### Categories

Resources are organized into 5 categories matching the quiz:

1. **UX Fundamentals** - User flows, wireframes, IA, heuristics
2. **UI Craft & Visual Design** - Typography, color, layout, design systems
3. **User Research & Validation** - Interviews, testing, personas, research methods
4. **Product Thinking & Strategy** - Product design, metrics, prioritization, roadmaps
5. **Collaboration & Communication** - Stakeholders, presentations, teamwork, handoffs

### Difficulty Levels

- **Beginner**: Introduction, basics, getting started content
- **Intermediate**: Practical techniques, standard practices
- **Advanced**: Expert topics, optimization, systems thinking

### Quality Assurance

**Monitoring:**
- Track scraping success/failure rates
- Monitor chunk sizes and distribution
- Check category balance
- Validate embedding quality

**Maintenance:**
- Update scrapers when site structures change
- Re-scrape content periodically (monthly)
- Remove outdated resources
- Add new sources as they emerge

## Performance

### Speed

- **Initial scraping**: ~2 minutes for 50 resources (with rate limiting)
- **Embedding**: ~5 seconds for 50 resources
- **Semantic search**: <100ms for 10 results
- **API response**: <500ms total (including RAG)

### Storage

- **Per resource**: ~5-15 chunks
- **Per chunk**: ~2KB storage + 384-dim embedding
- **100 resources**: ~50MB total (includes embeddings)
- **Scalability**: Tested up to 1000 resources

## Troubleshooting

### RAG system not available

**Error**: `RAG system not available - using fallback mode`

**Solution**: Ensure dependencies are installed:
```bash
pip install chromadb sentence-transformers beautifulsoup4 markdownify
```

### No resources retrieved

**Error**: Empty search results

**Solutions**:
1. Check if knowledge base is populated: `python admin.py --stats`
2. If empty, run ingestion: `python ingest.py --scrape --sources all --limit 50`
3. Verify ChromaDB directory exists: `.chroma/`

### Scraping errors

**Error**: `Error fetching URL`

**Solutions**:
1. Check internet connection
2. Verify URL is accessible
3. Check if site structure changed (update scraper)
4. Respect rate limits (wait between requests)

### Import errors

**Error**: `ModuleNotFoundError: No module named 'rag'`

**Solution**: Ensure you're in the correct directory:
```bash
cd server_py
python -c "import rag; print('RAG available')"
```

## Best Practices

### Ethical Scraping

✅ **DO:**
- Respect robots.txt
- Use rate limiting (2+ seconds between requests)
- Identify your bot with User-Agent
- Cache content (don't re-scrape)
- Only scrape publicly available content

❌ **DON'T:**
- Scrape behind paywalls
- Ignore robots.txt
- Make rapid-fire requests
- Scrape user-generated content without permission

### Content Quality

✅ **DO:**
- Verify scraped content is complete
- Check for missing images/diagrams (note in metadata)
- Validate category assignments
- Remove boilerplate/ads

❌ **DON'T:**
- Store low-quality content
- Include navigation/footer text
- Keep duplicate content
- Ignore scraping errors

### Knowledge Base Maintenance

**Weekly:**
- Check for new articles on key sources
- Monitor scraping success rates

**Monthly:**
- Re-scrape top sources for new content
- Review and update category mappings
- Check for broken URLs

**Quarterly:**
- Evaluate resource quality and relevance
- Consider adding new sources
- Update difficulty classifications

## Extending the System

### Adding New Sources

1. Create new scraper in `server_py/scraper.py`:

```python
class NewSourceScraper(BaseScraper):
    def __init__(self):
        super().__init__("New Source", "https://newsource.com")
    
    def scrape_article(self, url: str) -> Optional[UXResource]:
        # Implement scraping logic
        pass
```

2. Register in `ScraperFactory`:

```python
SCRAPERS = {
    'nngroup': NNGroupScraper,
    'newsource': NewSourceScraper,  # Add here
}
```

3. Test:

```bash
python ingest.py --add-url https://newsource.com/article --source newsource
```

### Custom Categories

Update `CategoryMapper` in `knowledge_base.py`:

```python
CATEGORY_KEYWORDS = {
    "Your New Category": [
        "keyword1", "keyword2", "keyword3"
    ]
}
```

### Adjusting Chunk Size

Modify `ContentChunker` parameters in `ingest.py`:

```python
chunker = ContentChunker(
    chunk_size=700,  # Increase for longer chunks
    overlap=100,     # More overlap for better context
    min_chunk_size=150
)
```

## Future Enhancements

- [ ] Automatic content freshness detection
- [ ] Multi-language support
- [ ] Image/diagram scraping and OCR
- [ ] User feedback loop for relevance scoring
- [ ] A/B testing of different embedding models
- [ ] Integration with more UX resource databases
- [ ] Automated quality scoring for resources
- [ ] Personalized resource recommendations based on user history

## Support

For issues or questions:

1. Check logs in terminal output
2. Run diagnostics: `python admin.py --stats`
3. Test search: `python admin.py --search "test query"`
4. Verify setup: `python -c "from rag import get_rag_retriever; print('OK')"`

## License

This RAG system respects the copyright of all scraped content. Resources are indexed for search only, not redistributed. All credit goes to original authors and publishers.

