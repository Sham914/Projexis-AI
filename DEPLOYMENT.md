# Projexis AI — Deployment Guide

## Overview
This app consists of:
- **Frontend**: Next.js 19 (deployed to Vercel)
- **Backend**: FastAPI Python service (deployed separately)

---

## Step 1: Deploy Frontend to Vercel

### 1.1 Prerequisites
- Vercel account (free tier available at vercel.com)
- GitHub account with this repo pushed

### 1.2 Deploy Process

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Import your GitHub repository
4. **Select the `frontend/` folder** as the root directory
5. Configure Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   ```
   (Replace `https://your-backend-url.com` with your actual backend URL from Step 2)
6. Click **Deploy**

Your frontend will be live at `https://your-project.vercel.app`

---

## Step 2: Deploy Backend to Railway (Recommended)

Railway.app is ideal for Python apps and integrates well with Vercel.

### 2.1 Prerequisites
- Railway account (free tier available at railway.app)
- Your GitHub repository

### 2.2 Deploy Process

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Select **"Deploy from GitHub"**
4. Connect your GitHub account and select this repository
5. Railway will auto-detect the Python project
6. **Configuration** in Railway dashboard:
   - Add environment variables:
     ```
     GROQ_API_KEY=your_actual_groq_key
     ALLOWED_ORIGINS=https://your-project.vercel.app,http://localhost:3000
     ```
   - Set **Start Command**: `uvicorn api:app --host 0.0.0.0 --port ${PORT}`
7. Click **Deploy**

Your backend will be live at `https://your-backend-railway.up.railway.app`

### 2.3 Copy Your Backend URL
Once deployed on Railway, you'll get a URL like `https://projexis-api-production.up.railway.app`. Copy this URL.

---

## Step 3: Update Frontend Environment Variable

After your backend is live on Railway:

1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Update `NEXT_PUBLIC_API_URL` to your Railway backend URL:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-railway.up.railway.app
   ```
4. Redeploy the frontend (Vercel will auto-redeploy on env var change)

---

## Step 4: Update Frontend Code (if needed)

Your frontend already makes calls to `http://localhost:8000/api/recommend`. In production, it should use the environment variable.

Check `frontend/src/app/page.tsx` line ~73:

**Change from:**
```javascript
const res = await fetch("http://localhost:8000/api/recommend", {
```

**To:**
```javascript
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recommend`, {
```

---

## Verifying Deployment

1. **Frontend**: Visit `https://your-project.vercel.app`
2. **Backend Health Check**: Visit `https://your-backend.up.railway.app/health`
3. **Test the full flow**: Use the frontend to submit a profile and verify recommendations load

---

## Troubleshooting

### CORS Errors
If you see CORS errors in the browser console:
- Make sure `ALLOWED_ORIGINS` on Railway includes your Vercel frontend URL
- Redeploy the backend after updating env vars

### Backend Returns 500 Error
- Check Railway logs for Python errors
- Ensure `python train.py` was run (model files must exist)
- Verify `GROQ_API_KEY` is set if you want AI explanations

### Frontend Can't Find API
- Verify `NEXT_PUBLIC_API_URL` is set in Vercel project
- Check the browser's Network tab to see the actual request URL
- Ensure backend is running and responding to `/health` endpoint

---

## Alternative Backend Platforms

If you prefer not to use Railway, other Python-friendly options:
- **Render.com** (similar to Railway)
- **Heroku** (classic, but paid after free tier)
- **Azure App Service** (more complex but scalable)
- **AWS Lambda** (requires serverless FastAPI wrapper)

---

## Local Development

To test locally before deploying:

1. **Terminal 1 — Backend**:
   ```bash
   cd D:\CS\Projexis-AI
   python api.py
   ```

2. **Terminal 2 — Frontend**:
   ```bash
   cd D:\CS\Projexis-AI\frontend
   npm run dev
   ```

3. Visit `http://localhost:3000`

---

## Production Checklist

- [ ] Vercel account created & frontend repo connected
- [ ] Railway account created & backend repo connected
- [ ] `GROQ_API_KEY` added to Railway environment
- [ ] `ALLOWED_ORIGINS` includes Vercel frontend URL on Railway
- [ ] `NEXT_PUBLIC_API_URL` points to Railway backend on Vercel
- [ ] Frontend calls use `process.env.NEXT_PUBLIC_API_URL` (not hardcoded localhost)
- [ ] Model files exist in `/model/` directory
- [ ] Backend test: `GET /health` returns 200
- [ ] Frontend test: Can submit profile and see recommendations

---

Happy deploying! 🚀
