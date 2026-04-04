# Quick Deploy Checklist for Vercel + Railway

## 🚀 What You Need to Do (In Order)

### Step 1: Prepare Your Repository
- [x] Frontend code is updated to use `NEXT_PUBLIC_API_URL`
- [x] Frontend builds successfully (`npm run build` passes)
- [x] Backend Python dependencies are in `requirements.txt`
- [x] Model files exist in `/model/xgboost_model.pkl` and `/model/preprocessor.pkl`

**Action**: Commit and push to GitHub:
```bash
cd D:\CS\Projexis-AI
git add .
git commit -m "prepare for Vercel and Railway deployment"
git push origin main
```

---

### Step 2: Deploy Frontend to Vercel (5 min)

1. Go to https://vercel.com and sign in/sign up (free)
2. Click **"Add New"** → **"Project"**
3. **Import** your GitHub repo
4. **Configure**:
   - **Root Directory**: `frontend`
   - **Framework**: Next.js (auto-detected)
5. **Environment Variables**: Add after deploy (see Step 4)
6. Click **"Deploy"** and wait for deployment to complete
7. **Copy your Vercel URL** from the dashboard (looks like `https://projexis-ai.vercel.app`)

---

### Step 3: Deploy Backend to Railway (8 min)

1. Go to https://railway.app and sign in/sign up (free)
2. Click **"New Project"**
3. Select **"Deploy from GitHub"**
4. **Connect** your GitHub account and select this repo
5. Railway auto-detects Python project
6. **Wait for build to finish**, then go to **"Settings"**
7. **Add Environment Variables**:
   ```
   GROQ_API_KEY=your_actual_groq_key_here
   ALLOWED_ORIGINS=https://your-vercel-url.vercel.app,http://localhost:3000
   ```
   (Replace `https://your-vercel-url.vercel.app` with your actual Vercel URL from Step 2)
8. Go to **"Deployments"** tab and wait for "Deploy" status to be green
9. **Copy your Railway URL** from the "Public URL" in the dashboard (looks like `https://projexis-api-production.up.railway.app`)

---

### Step 4: Link Vercel Frontend to Railway Backend (3 min)

1. Go to your **Vercel Project Dashboard**
2. Go to **"Settings"** → **"Environment Variables"**
3. **Add/Update** the variable:
   ```
   NEXT_PUBLIC_API_URL = https://your-railway-backend-url.up.railway.app
   ```
   (Use the Railway URL you copied in Step 3)
4. Click **"Save"**
5. Go to **"Deployments"** and click the latest deployment
6. Click **"Redeploy"** to rebuild with the new env var

---

### Step 5: Test Your Live App (2 min)

1. Open your Vercel URL: `https://your-vercel-url.vercel.app`
2. If frontend loads, great! ✅
3. Try to submit a profile:
   - Select skills, domain, subjects, interests
   - Click **"Generate Curriculum"**
4. If recommendations appear, backend is working! ✅
5. If you see an error:
   - Open browser **DevTools** (F12) → **Network** tab
   - Try submitting again and check the API call
   - Verify the endpoint URL matches your Railway backend URL

---

## 🔗 Your Live URLs (After Deployment)

| Component | URL |
|-----------|-----|
| **Frontend** | `https://your-project.vercel.app` |
| **Backend API** | `https://your-backend.up.railway.app` |
| **Backend Health Check** | `https://your-backend.up.railway.app/health` |

---

## 🆘 Troubleshooting

### "Failed to fetch recommendations" Error
- Check browser DevTools → Network tab
- Look at the failed request's URL — is it your Railway URL?
- Test the backend directly: visit `https://your-backend.up.railway.app/health` in your browser
- Should see: `{"status": "healthy", "models_loaded": true}`

### "CORS Error" in browser console
- Update Railway env var: `ALLOWED_ORIGINS=https://your-vercel-url.vercel.app`
- Redeploy the Railway backend after changing env vars

### "Models not loaded" from API
- Ensure `model/xgboost_model.pkl` and `model/preprocessor.pkl` exist in your repo
- If missing, run locally: `python train.py`
- Commit and push the model files

### Backend taking too long to respond
- Railway free tier may have startup delay
- Wait 30-60 seconds and try again
- Check Railway logs for errors in the dashboard

---

## 📋 Verification Checklist

After everything is deployed:

- [ ] Frontend loads at Vercel URL
- [ ] Backend `/health` endpoint returns 200 with `models_loaded: true`
- [ ] Can select skills/domain in frontend
- [ ] Can submit profile without CORS errors
- [ ] Recommendations load with projects
- [ ] Project cards show explanations and narratives
- [ ] All links and UI elements are interactive

---

## 💡 Pro Tips

1. **Keep your `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:8000`** for local testing
2. **Never commit actual API keys** to GitHub — use environment variables in Vercel/Railway dashboards
3. **Monitor costs**: Both Vercel and Railway free tiers are generous, but watch for overage
4. **Check logs regularly**: Vercel → Deployments, Railway → Deployments tabs

---

## Next Steps

Done with deployment? Consider:
- [ ] Set up a custom domain (both Vercel and Railway support this)
- [ ] Configure CI/CD so changes auto-deploy
- [ ] Add error tracking (e.g., Sentry)
- [ ] Monitor API performance and uptime

---

**Questions?** Check the full guide in `DEPLOYMENT.md`
