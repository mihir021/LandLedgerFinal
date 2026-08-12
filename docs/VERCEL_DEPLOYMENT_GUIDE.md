# 🚀 Deploying LandLedger to Vercel (All-in-One Fullstack Deployment)

This project is pre-configured to deploy **both the React Frontend and Express.js Backend API together on Vercel** under a single project URL!

---

## ⚡ Option 1: Deploying via Vercel Dashboard (Easiest — 2 Minutes)

1. **Push your code to GitHub** (if not already pushed).
2. Go to **[vercel.com/new](https://vercel.com/new)** and log in with GitHub.
3. Select your **`LandLedger`** repository and click **Import**.
4. Configure Project Settings:
   - **Framework Preset**: `Vite` (Vercel will detect it automatically)
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables** and add:
   - `MONGODB_URI`: *Your MongoDB Atlas connection string*
   - `JWT_SECRET`: *A secure random string (e.g. `landledger_jwt_production_secret_2026`)*
   - `NODE_ENV`: `production`
   - `CLOUDINARY_CLOUD_NAME`: *(Optional for image uploads)*
   - `CLOUDINARY_API_KEY`: *(Optional)*
   - `CLOUDINARY_API_SECRET`: *(Optional)*
6. Click **Deploy**! 🎉

---

## 🛠️ Option 2: Deploying via Vercel CLI (From Terminal)

1. Install Vercel CLI (if not installed):
   ```bash
   npm i -g vercel
   ```
2. Log in to Vercel:
   ```bash
   vercel login
   ```
3. Run deployment in the project root:
   ```bash
   vercel
   ```
4. For Production release:
   ```bash
   vercel --prod
   ```

---

## 🔍 How it Works Under the Hood

- **Frontend**: Vite builds static React assets into `dist/`.
- **Backend API**: Vercel automatically runs `/api/index.js` as a serverless function for all `/api/*` endpoints.
- **Routing**: `vercel.json` rewrites all `/api/*` requests to the serverless backend and all SPA page routes to `/index.html`.
