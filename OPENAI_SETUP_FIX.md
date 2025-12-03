# OpenAI API Key Setup - Fix for Missing Usage Reports

## Problem Identified

**Issue**: OpenAI is not being called, so you're not seeing usage reports for your API key "UXR"

**Root Cause**: The `OPENAI_API_KEY` environment variable is not set in the `.env` file

## Current Status

✅ `.env` file exists  
✅ `dotenv/config` is imported in `server/index-dev.ts`  
❌ `OPENAI_API_KEY` is missing from `.env`  
❌ OpenAI endpoints are falling back to templates instead of calling API

## Fix Required

### Step 1: Add Your OpenAI API Key to `.env`

Edit the `.env` file in the project root and replace the placeholder:

```env
OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY_HERE
```

**Important**: 
- Replace `sk-proj-YOUR_ACTUAL_KEY_HERE` with your actual OpenAI API key
- The key should start with `sk-proj-` for OpenAI projects
- Keep the key secret - `.env` is already in `.gitignore`

### Step 2: Restart the Development Server

After adding the key, restart your Node.js server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 3: Verify OpenAI is Working

Check the server logs when making a request. You should see:

```
[OpenAI] generateJSON: Calling API with model: gpt-4o-mini
[OpenAI] generateJSON: Success, parsing response...
```

If you see `[OpenAI] API key not configured` or `[OpenAI] generateJSON: No client available`, the key is still not being loaded.

## Endpoints That Use OpenAI

These endpoints will start using OpenAI once the key is configured:

1. **`/api/v2/skill-analysis`** - Generates personalized action items
2. **`/api/v2/resources`** - AI-powered resource selection
3. **`/api/v2/deep-insights`** - Generates skill relationships and insights
4. **`/api/v2/improvement-plan`** - Creates 3-week personalized plans

## Verification

After adding the key and restarting:

1. **Check OpenAI Dashboard**: Usage should appear within a few minutes
2. **Check Server Logs**: Should see `[OpenAI] generateJSON: Calling API...`
3. **Test an Endpoint**: Make a request to `/api/v2/skill-analysis` and check logs

## Current Behavior (Without Key)

- ✅ Server starts successfully (graceful fallback)
- ✅ Endpoints return template-based responses
- ❌ No OpenAI API calls
- ❌ No usage reports
- ❌ Less personalized content

## After Fix

- ✅ OpenAI API calls will be made
- ✅ Usage reports will appear in OpenAI dashboard
- ✅ More personalized, AI-generated content
- ✅ Better resource recommendations

## Troubleshooting

If OpenAI still doesn't work after adding the key:

1. **Check .env file location**: Must be in project root (same level as `package.json`)
2. **Check key format**: Should be `sk-proj-...` (no quotes, no spaces)
3. **Restart server**: Environment variables are loaded at startup
4. **Check logs**: Look for `[OpenAI]` messages in console
5. **Verify key is valid**: Test with a simple curl request to OpenAI API

## Security Note

The `.env` file is already in `.gitignore`, so your API key won't be committed to git. Never commit API keys to version control.

