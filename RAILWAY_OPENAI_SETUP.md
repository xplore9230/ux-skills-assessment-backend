# Railway OpenAI API Key Setup

## How to Check if OPENAI_API_KEY is Set on Railway

### Step 1: Access Railway Dashboard

1. Go to [Railway Dashboard](https://railway.app)
2. Select your project
3. Click on your backend service

### Step 2: Check Environment Variables

1. Go to the **Variables** tab (or **Settings** → **Variables**)
2. Look for `OPENAI_API_KEY` in the list
3. If it's not there, you need to add it

### Step 3: Add OPENAI_API_KEY (if missing)

1. In the **Variables** tab, click **+ New Variable**
2. Set:
   - **Variable Name**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI API key (starts with `sk-proj-...`)
3. Click **Add** or **Save**
4. Railway will automatically redeploy with the new variable

### Step 4: Verify It's Working

After adding the variable and redeployment:

1. Check Railway logs for:
   ```
   [OpenAI] API key not configured  ← Should NOT appear
   [OpenAI] generateJSON: Calling API...  ← Should appear when endpoints are called
   ```

2. Test an endpoint that uses OpenAI:
   - `/api/v2/skill-analysis`
   - `/api/v2/resources`
   - `/api/v2/improvement-plan`

3. Check your OpenAI dashboard for usage reports

## Required Environment Variables for Railway

Make sure these are set in Railway:

### Required:
- `OPENAI_API_KEY` - Your OpenAI API key (for AI-powered features)
- `PORT` - Auto-set by Railway (usually 8000 or dynamic)

### Optional but Recommended:
- `OLLAMA_HOST` - If using Ollama for local AI
- `USE_PREGENERATED` - Set to `true` for faster responses
- `PYTHON_API_URL` - If Node.js needs to call Python backend
- `RAG_API_URL` - Alternative name for Python API URL

## Quick Check Command

If you have Railway CLI installed:

```bash
railway variables
```

This will list all environment variables for your service.

## Troubleshooting

### Issue: OpenAI still not working after adding key

1. **Check variable name**: Must be exactly `OPENAI_API_KEY` (case-sensitive)
2. **Check for typos**: No spaces, no quotes in Railway dashboard
3. **Redeploy**: Railway should auto-redeploy, but you can trigger manually
4. **Check logs**: Look for `[OpenAI]` messages in Railway logs

### Issue: Variable not showing in logs

- Railway environment variables are loaded at startup
- If you added it after deployment, trigger a redeploy
- Check that the variable is set for the correct service/environment

## Security Note

- Never commit `.env` files to git
- Railway variables are encrypted and secure
- Use Railway's Variables tab, not hardcoded values in code

