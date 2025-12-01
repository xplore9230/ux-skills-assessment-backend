<!-- 792f3905-ca85-4500-916d-e57b8ee38892 a04fcfc6-d8e5-448b-875d-865941a727d2 -->
# Fix Result Page & Restore AI Generation

## Problem

The result page renders "empty" (fallback content) because:

1.  **Premature Rendering**: The frontend forces the loading screen to close after 3 seconds (`setTimeout`), often before the AI has finished generating the response.
2.  **Potential Threading Issues**: The parallel execution in `rag.py` using `ThreadPoolExecutor` might be conflicting with ChromaDB's SQLite backend or the app context, causing the AI generation to fail or hang.
3.  **Missing Data**: When the frontend "gives up" waiting, it shows generic placeholders instead of the personalized AI content.

## Solution

### 1. Restore Reliability in `ResultsWrapper.tsx`

- **Remove the 3-second timeout**. The page should wait for the AI result to be ready (or for a definite error) before showing content.
- **Add a safety timeout** (e.g., 30-45 seconds) instead of a "fast" timeout, just to prevent infinite hanging.
- **Show Loading State**: Keep the `LoadingResultsPage` active until `aiResult.data` is available or `aiResult.error` occurs.

### 2. Revert Backend Parallelization (`rag.py`)

- **Revert to sequential calls**: Remove `concurrent.futures` and `ThreadPoolExecutor`. Run `retrieve_resources_for_user` and `generate_learning_path` sequentially to ensure stability with ChromaDB.
- **Keep other optimizations**: Retain the reduced `top_k` and reduced search counts (logic improvements), just execute them one after another.

### 3. Verify Data Flow

- Ensure `aiResult` from the hook is correctly passed to the `ResultsPage`.
- Verify error handling displays a user-friendly message if the AI actually fails (after the full wait).

## Files to Modify

1.  **client/src/pages/ResultsWrapper.tsx**

    - Remove `setTimeout(..., 3000)`.
    - Update loading logic to wait for `!isLoading` from the hook.

2.  **server_py/rag.py**

    - Remove `concurrent.futures`.
    - Restore sequential execution flow for `get_context`.

## Expected Outcome

- The loading screen will persist until the AI actually finishes (approx. 5-8 seconds based on backend logs).
- The result page will display the **full personalized AI content** (Hero, Roadmap, Resources) instead of placeholders.
- Stability will be restored.

### To-dos

- [ ] Create kv_cache table in Postgres schema with key, value, expiresAt
- [ ] Add psycopg2-binary and openai to requirements.txt
- [ ] Implement cache.py with Postgres-backed CacheClient class
- [ ] Define UserProfile, RetrieverContext, ResultPagePayload in types.py
- [ ] Implement profile signature bucketing and cache key generation
- [ ] Create openai_client.py with compose_result_page function
- [ ] Add caching layer to RAG retriever with 7-day TTL
- [ ] Implement POST /api/result/ai with full caching pipeline
- [ ] Create test script to verify cache hits/misses work correctly
- [ ] Create kv_cache table in Postgres schema with key, value, expiresAt
- [ ] Add psycopg2-binary and openai to requirements.txt
- [ ] Implement cache.py with Postgres-backed CacheClient class
- [ ] Define UserProfile, RetrieverContext, ResultPagePayload in types.py
- [ ] Implement profile signature bucketing and cache key generation
- [ ] Create openai_client.py with compose_result_page function
- [ ] Add caching layer to RAG retriever with 7-day TTL
- [ ] Implement POST /api/result/ai with full caching pipeline
- [ ] Create test script to verify cache hits/misses work correctly
- [ ] Reduce vector searches from 13+ to 2-3 total in rag.py
- [ ] Add timeout=30, max_tokens=2000, temperature=0.5 to OpenAI client
- [ ] Reduce RAG context size: limit resources to 5, truncate summaries to 100 chars
- [ ] Add performance logging and verify cache is working
- [ ] Add timing logs for RAG retrieval, OpenAI call, and total time