# Quick Start: Deploy to Vercel

## 🚀 Fast Deployment Steps

### 1. Deploy Python Backend (5 minutes)

**Option A: Railway (Recommended)**
```bash
# 1. Go to railway.app and sign up
# 2. New Project → Deploy from GitHub
# 3. Select your repo → Add Service
# 4. Set Root Directory: server_py
# 5. Railway auto-detects Python
# 6. Copy the deployment URL (e.g., https://your-app.railway.app)
```

**Option B: Render**
```bash
# 1. Go to render.com and sign up
# 2. New Web Service → Connect GitHub
# 3. Root Directory: server_py
# 4. Build: pip install -r requirements.txt
# 5. Start: uvicorn main:app --host 0.0.0.0 --port $PORT
# 6. Copy the deployment URL
```

### 2. Deploy Frontend to Vercel (3 minutes)

**Via Dashboard:**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure:
   - Framework: **Other**
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
4. Add Environment Variable:
   - Key: `VITE_PYTHON_API_URL`
   - Value: `https://your-python-backend.railway.app` (from step 1)
5. Click **Deploy**

**Via CLI:**
```bash
npm i -g vercel
vercel login
vercel
# When prompted, add VITE_PYTHON_API_URL=https://your-backend-url
vercel --prod
```

### 3. Update Python Backend CORS

Edit `server_py/main.py` line 52:
```python
"https://your-app.vercel.app",  # Add your Vercel URL
```

Then redeploy your Python backend.

### 4. Test

Visit your Vercel URL and complete the quiz. Check browser console for any errors.

## ✅ Checklist

- [ ] Python backend deployed and accessible
- [ ] Vercel project created and deployed
- [ ] `VITE_PYTHON_API_URL` environment variable set
- [ ] Python backend CORS updated with Vercel domain
- [ ] Test quiz completion and results page
- [ ] Check browser console for errors

## 🔧 Troubleshooting

**CORS Errors?**
- Verify Python backend CORS includes your Vercel domain
- Check that `VITE_PYTHON_API_URL` is set correctly

**API Not Working?**
- Test Python backend URL directly in browser
- Check Python backend logs
- Verify environment variable is set in Vercel dashboard

**Build Fails?**
- Run `npm run build` locally to check for errors
- Check Vercel build logs
- Ensure all dependencies are in `package.json`

## 📚 Full Guide

See `VERCEL_DEPLOYMENT.md` for detailed instructions.

