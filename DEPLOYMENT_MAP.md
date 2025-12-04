# Deployment Map - Repository Structure

## ⚠️ CRITICAL: Read This Before Making Changes

This document maps every file to its deployment target. **Always verify which repository you're in before pushing changes.**

---

## Repository Overview

### 📦 `ux-skills-assessment` (Frontend Repository)
- **GitHub**: https://github.com/xplore9230/ux-skills-assessment
- **Deploys to**: Vercel (Production)
- **Purpose**: Frontend React app + Node.js serverless functions

### 🔧 `ux-skills-assessment-backend` (Backend Repository)
- **GitHub**: https://github.com/xplore9230/ux-skills-assessment-backend
- **Deploys to**: Railway (Production)
- **Purpose**: Python FastAPI backend only

---

## File-to-Deployment Mapping

### Frontend Repository (`ux-skills-assessment`)

| File/Directory | Deployment Target | Notes |
|---------------|-------------------|-------|
| `client/` | ✅ Vercel | React frontend app |
| `server/` | ✅ Vercel | Node.js serverless functions |
| `server/routes.ts` | ✅ Vercel | **API routes deployed to production** |
| `server/app.ts` | ✅ Vercel | Express app entry point |
| `server/storage.ts` | ✅ Vercel | Storage utilities |
| `vercel.json` | ✅ Vercel | Vercel configuration |
| `package.json` | ✅ Vercel | Node.js dependencies |

**⚠️ WARNING**: Changes to `server/routes.ts` in this repo **WILL** be deployed to Vercel production.

---

### Backend Repository (`ux-skills-assessment-backend`)

| File/Directory | Deployment Target | Notes |
|---------------|-------------------|-------|
| `server_py/` | ✅ Railway | Python FastAPI backend |
| `server_py/main.py` | ✅ Railway | FastAPI app entry point |
| `server_py/routes.py` | ✅ Railway | FastAPI routes |
| `server_py/rag.py` | ✅ Railway | RAG system |
| `server_py/vector_store.py` | ✅ Railway | ChromaDB vector store |
| `Dockerfile` | ✅ Railway | Docker build config |
| `railway.json` | ✅ Railway | Railway configuration |
| `server/` | ❌ **NOT DEPLOYED** | **Local development only** |
| `server/routes.ts` | ❌ **NOT DEPLOYED** | **Does NOT deploy to Vercel** |
| `client/` | ❌ **NOT DEPLOYED** | **Local development only** |

**⚠️ CRITICAL WARNING**: 
- The `server/` directory in this repo is **NOT deployed to Vercel**
- Changes to `server/routes.ts` here will **NOT** affect production
- For Vercel deployments, use the **frontend repository** (`ux-skills-assessment`)

---

## Quick Decision Tree

### "I need to modify Node.js API routes (`server/routes.ts`)"

```
Are you in ux-skills-assessment-backend?
├─ YES → ❌ STOP! This won't deploy to Vercel
│         → Switch to: ux-skills-assessment repository
│         → Make changes there
│
└─ NO (in ux-skills-assessment)
   └─ ✅ CORRECT! Changes will deploy to Vercel
```

### "I need to modify Python backend (`server_py/`)"

```
Are you in ux-skills-assessment-backend?
├─ YES → ✅ CORRECT! Changes will deploy to Railway
│
└─ NO (in ux-skills-assessment)
   └─ ❌ STOP! Python code doesn't exist here
      → Switch to: ux-skills-assessment-backend repository
```

### "I need to modify React frontend (`client/`)"

```
Are you in ux-skills-assessment?
├─ YES → ✅ CORRECT! Changes will deploy to Vercel
│
└─ NO (in ux-skills-assessment-backend)
   └─ ❌ STOP! Frontend code here is not deployed
      → Switch to: ux-skills-assessment repository
```

---

## Deployment Flow

```
┌─────────────────────────────────────────────────────────┐
│  ux-skills-assessment (Frontend Repo)                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │  client/ (React)                                   │  │
│  │  server/routes.ts (Node.js API)                    │  │
│  │  └─→ Push to GitHub                                 │  │
│  │      └─→ Vercel auto-deploys                        │  │
│  │         └─→ Production: uxlevel.online             │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  ux-skills-assessment-backend (Backend Repo)            │
│  ┌───────────────────────────────────────────────────┐  │
│  │  server_py/ (Python FastAPI)                       │  │
│  │  └─→ Push to GitHub                                 │  │
│  │      └─→ Railway auto-deploys                      │  │
│  │         └─→ Production: Railway URL                │  │
│  │                                                      │  │
│  │  server/ (Node.js) ❌ NOT DEPLOYED                  │  │
│  │  client/ (React) ❌ NOT DEPLOYED                    │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Modifying `server/routes.ts` in backend repo
- **What happens**: Changes are pushed but never deployed
- **Why**: Backend repo's `server/` directory is not deployed
- **Fix**: Use frontend repo (`ux-skills-assessment`)

### ❌ Mistake 2: Assuming both repos deploy the same code
- **What happens**: Changes appear in one repo but not production
- **Why**: Each repo has different deployment targets
- **Fix**: Always check which repo you're in before pushing

### ❌ Mistake 3: Not verifying deployment target
- **What happens**: Changes go to wrong platform
- **Why**: No validation before push
- **Fix**: Use this document to verify before committing

---

## Verification Checklist

Before pushing changes, verify:

- [ ] Which repository am I in? (`git remote -v`)
- [ ] Which file am I modifying?
- [ ] Where does this file deploy? (Check table above)
- [ ] Is this the correct repository for my changes?
- [ ] Have I tested locally?
- [ ] Will this deploy to the right platform?

---

## Need Help?

If you're unsure:
1. Check `git remote -v` to see which repo you're in
2. Check this document for file-to-deployment mapping
3. Ask: "Where does this file deploy?"
4. Verify before pushing

---

**Last Updated**: 2025-12-04  
**Maintained By**: Development Team

