# 🚀 Vercel Deployment Guide for MedVision AI

MedVision AI is configured for instant, zero-configuration deployment to **Vercel** with full SPA routing, serverless API functions, and automatic cloud edge diagnostics.

---

## Method 1: One-Click Git Deployment (Recommended)

1. Ensure the latest code is pushed to your GitHub repository:
   ```bash
   git push origin main
   ```
2. Open your browser and go to **[vercel.com/new](https://vercel.com/new)**.
3. Select and import your GitHub repository: **`RADMAX-AI`** (or `thamaraiselvang2025aids-oss/RADMAX-AI`).
4. **Project Settings**:
   * **Framework Preset**: `Vite` (Auto-detected).
   * **Root Directory**: Leave as `./` (or select `frontend` — both work thanks to dual `vercel.json` configurations).
   * **Build Command**: `cd frontend && npm install && npm run build` (Auto-configured).
   * **Output Directory**: `frontend/dist` (Auto-configured).
5. Click **Deploy**.
6. Vercel will build and assign you a live HTTPS URL (e.g., `https://radmax-ai.vercel.app`).

---

## Method 2: Deploy from Terminal (Vercel CLI)

If you have the Vercel CLI or want to deploy directly from PowerShell/Terminal:

1. Log in to Vercel:
   ```bash
   npx vercel login
   ```
2. Deploy to Preview:
   ```bash
   npx vercel
   ```
   * *Set up and deploy?* -> `Y`
   * *Which scope?* -> Select your personal account or team
   * *Link to existing project?* -> `N`
   * *Project name?* -> `radmax-ai` (or press Enter)
   * *In which directory is your code located?* -> `./` (press Enter)
3. Deploy to Production:
   ```bash
   npx vercel --prod
   ```

---

## Optional: Connecting a Remote Python GPU Backend

By default, Vercel runs Serverless API functions for `/api/v1/patients`, `/api/v1/studies`, and `/api/v1/inference` with cloud edge saliency mapping and lesion localization.

If you have hosted your Python PyTorch backend (e.g., on [Render](https://render.com), [Railway](https://railway.app), or [Fly.io](https://fly.io)):
1. In your Vercel Project Dashboard, go to **Settings** -> **Environment Variables**.
2. Add a new variable:
   * **Key**: `PYTHON_BACKEND_URL`
   * **Value**: Your backend URL (e.g., `https://radmax-ai-backend.onrender.com`).
3. Redeploy. Vercel's serverless functions will automatically proxy requests to your live PyTorch engine.

---

## Architecture on Vercel

```mermaid
graph TD
    User([Browser Client]) --> CDN[Vercel Global Edge CDN]
    CDN --> Static[Compiled PACS Studio Frontend (frontend/dist)]
    CDN --> API[Vercel Serverless Functions (/api/*)]
    API -->|Fallback / Edge| Serverless[Edge Diagnostics & Seed Records]
    API -.->|Optional Proxy| RemoteGPU[Remote Python PyTorch Engine]
```
