# 🚀 Vercel Deployment Guide - AidLink Kakuma

Complete step-by-step guide to deploy both backend and frontend to Vercel.

---

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ GitHub account with your code pushed
- ✅ Vercel account (free tier works fine)
- ✅ Neon PostgreSQL database credentials
- ✅ Gmail App Password configured
- ✅ All environment variables ready

---

## 🎯 Deployment Strategy

We'll deploy in this order:
1. **Backend First** → Get the API URL
2. **Frontend Second** → Use the backend API URL
3. **Configure Build Triggers** → Prevent unnecessary rebuilds

---

## 🔧 Step 1: Deploy the Backend (Server)

### 1.1 Go to Vercel Dashboard

1. Visit https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**

### 1.2 Import Repository

1. Click **"Import Git Repository"**
2. Select your **`aid-link`** repository
3. Click **"Import"**

### 1.3 Configure Backend Project

**Project Settings:**
- **Project Name**: `aidlink-kakuma-api` (or your choice)
- **Framework Preset**: Other
- **Root Directory**: Click **"Edit"** → Select **`server`** folder ✅
- **Build Command**: Leave empty (not needed for Node.js)
- **Output Directory**: Leave empty
- **Install Command**: `npm install`

### 1.4 Add Environment Variables

Click **"Environment Variables"** and add these:

```env
NODE_ENV=production
PORT=3000

# PostgreSQL Database (Neon)
DATABASE_URL=postgresql://neondb_owner:npg_SNQn8cfbF5vu@ep-bold-union-bg8t4nut-pooler.c-9.eu-central-1.aws.neon.tech/neondb?sslmode=verify-full

# JWT Secret
JWT_SECRET=1ee5594773bf990f59a15b970623da75c4f1eb7bfcbe03b329695bb89a4c4ec7218c39e49a19ced8968efbf811fdc777d8d9156d6e2b930940acab8862a54937
JWT_EXPIRES_IN=3h

# Gmail SMTP
GMAIL_USER=uhuribhang211@gmail.com
GMAIL_APP_PASSWORD=ieoyvtsngzltcwyw
EMAIL_FROM=AidLink Kakuma <uhuribhang211@gmail.com>

# Frontend URL (leave empty for now, will update after frontend deploy)
FRONTEND_URL=https://aidlinkkakuma.vercel.app
```

**Important Notes:**
- Select **"Production"** for all variables
- Do NOT check "Automatically expose System Environment Variables"
- Click **"Add"** after each variable

### 1.5 Deploy Backend

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Once deployed, you'll see: **"Your project has been successfully deployed!"**

### 1.6 Copy Your Backend URL

Your backend URL will be something like:
- `https://aidlink-kakuma-api.vercel.app`
- Or: `https://aidlink-kakuma-api-<your-username>.vercel.app`

**📝 Write this down! You'll need it for the frontend.**

### 1.7 Test Your Backend

Visit: `https://your-backend-url.vercel.app/api/health`

You should see:
```json
{
  "success": true,
  "message": "AidLink API is running",
  "timestamp": "2026-11-28T..."
}
```

✅ **Backend deployed successfully!**

---

## 🎨 Step 2: Deploy the Frontend (Client)

### 2.1 Create New Project

1. Go back to Vercel Dashboard
2. Click **"Add New..."** → **"Project"** again
3. Select the **same** `aid-link` repository

### 2.2 Configure Frontend Project

**Project Settings:**
- **Project Name**: `aidlinkkakuma` (or your choice)
- **Framework Preset**: Vite (should auto-detect)
- **Root Directory**: Click **"Edit"** → Select **`client`** folder ✅
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 2.3 Add Environment Variables

Click **"Environment Variables"** and add:

```env
# Backend API URL (use the URL from Step 1.6)
VITE_API_URL=https://aidlink-kakuma-api.vercel.app/api

# IndexedDB Configuration
VITE_DATABASE_NAME=aidlink_kakuma
VITE_DATABASE_VERSION=2
```

**Replace `aidlink-kakuma-api.vercel.app` with YOUR actual backend URL!**

### 2.4 Deploy Frontend

1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. Once done, you'll get your frontend URL!

### 2.5 Get Your Frontend URL

Your frontend URL will be:
- `https://aidlinkkakuma.vercel.app`
- Or: `https://aidlinkkakuma-<your-username>.vercel.app`

### 2.6 Update Backend CORS

**Important!** Update your backend's `FRONTEND_URL`:

1. Go to your **backend project** in Vercel
2. Go to **Settings** → **Environment Variables**
3. Find `FRONTEND_URL`
4. Click **"Edit"**
5. Update value to your frontend URL: `https://aidlinkkakuma.vercel.app`
6. Click **"Save"**
7. Go to **Deployments** tab
8. Click **"..."** on latest deployment → **"Redeploy"** → **"Redeploy"**

### 2.7 Test Your Frontend

1. Visit your frontend URL
2. Try registering with any email address
3. Check if verification email arrives
4. Test login and dashboard

✅ **Frontend deployed successfully!**

---

## ⚙️ Step 3: Prevent Unnecessary Rebuilds

This step saves build minutes and prevents both projects from rebuilding on every push.

### 3.1 Configure Backend Build Trigger

1. Open your **Backend Project** in Vercel
2. Go to **Settings** → **Git**
3. Scroll to **"Ignored Build Step"**
4. Select **"Custom"** from dropdown
5. Enter this command:
   ```bash
   git diff --quiet HEAD^ HEAD ./
   ```
6. Click **"Save"**

### 3.2 Configure Frontend Build Trigger

1. Open your **Frontend Project** in Vercel
2. Go to **Settings** → **Git**
3. Scroll to **"Ignored Build Step"**
4. Select **"Custom"** from dropdown
5. Enter this command:
   ```bash
   git diff --quiet HEAD^ HEAD ./
   ```
6. Click **"Save"**

**What this does:**
- Backend only rebuilds when files in `server/` folder change
- Frontend only rebuilds when files in `client/` folder change
- Saves build minutes and deployment time

---

## 🔒 Step 4: Security & CORS Configuration

### 4.1 Verify CORS Settings

Your backend should already have CORS configured to accept your frontend URL.

If you have issues, check `server/server.js`:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://aidlinkkakuma.vercel.app',
  credentials: true
}));
```

### 4.2 Database Security

✅ Your Neon PostgreSQL already has SSL enabled
✅ Connection uses `sslmode=verify-full`
✅ No database credentials exposed in frontend

---

## 🧪 Step 5: Test Your Deployed App

### Test Checklist:

- [ ] Visit frontend URL - Homepage loads
- [ ] Click "Find Services" - Services page works
- [ ] Click "Emergency Guide" - Emergency guides load
- [ ] Click "Community Challenges" - Documentation loads
- [ ] Click "Report an Issue" - Report form loads
- [ ] Register with ANY email address
- [ ] Check email for 6-digit verification code
- [ ] Verify account with code
- [ ] Login with verified account
- [ ] Access dashboard
- [ ] Submit a test report
- [ ] Logout
- [ ] Test "Forgot Password"
- [ ] Test password reset with code
- [ ] Test map (online)
- [ ] Test map download for offline use

---

## 📊 Deployment URLs

Your app is now live at:

**Frontend (Public):**
```
https://aidlinkkakuma.vercel.app
```

**Backend (API):**
```
https://aidlink-kakuma-api.vercel.app/api
```

**Health Check:**
```
https://aidlink-kakuma-api.vercel.app/api/health
```

---

## 🔧 Troubleshooting

### Backend Issues

**"Module not found" error:**
- Make sure `server/` is set as Root Directory
- Check `server/package.json` has all dependencies
- Redeploy after fixing

**Database connection timeout:**
- Verify `DATABASE_URL` in environment variables
- Check Neon database is active (not suspended)
- Ensure SSL mode is `sslmode=verify-full`

**CORS errors:**
- Update `FRONTEND_URL` in backend env variables
- Match exact frontend URL (with https://)
- Redeploy backend after updating

### Frontend Issues

**"Failed to fetch" on API calls:**
- Verify `VITE_API_URL` is correct
- Must include `/api` at the end
- Must use backend Vercel URL, not localhost

**Build fails:**
- Check `client/` is set as Root Directory
- Verify all dependencies in `client/package.json`
- Check build command is `npm run build`

**Blank page after deployment:**
- Check browser console for errors
- Verify `dist/` output directory
- Check all routes in `App.jsx`

### Email Issues

**Verification emails not sending:**
- Check Gmail App Password is correct
- Verify `GMAIL_USER` and `GMAIL_APP_PASSWORD` in backend env
- Check backend logs in Vercel dashboard
- Remember: Gmail SMTP has 500 emails/day limit

---

## 🚀 Post-Deployment Tasks

### 1. Custom Domain (Optional)

Add your own domain:
1. Go to Frontend Project → **Settings** → **Domains**
2. Add your domain (e.g., `aidlinkkakuma.com`)
3. Update DNS records at your registrar
4. Update `FRONTEND_URL` in backend env variables

### 2. Set Up Monitoring

Vercel provides:
- **Analytics**: Project → Analytics tab
- **Logs**: Project → Logs tab (view errors)
- **Speed Insights**: Enable in project settings

### 3. Email Domain (Recommended)

For production:
1. Buy domain ($10-15/year)
2. Add to Resend
3. Configure DNS records
4. Update `EMAIL_FROM` in backend env
5. Switch back to Resend email service

---

## 📝 Environment Variables Summary

### Backend Environment Variables

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=<your_neon_postgres_url>
JWT_SECRET=<your_jwt_secret>
JWT_EXPIRES_IN=3h
GMAIL_USER=<your_gmail>
GMAIL_APP_PASSWORD=<your_app_password>
EMAIL_FROM=AidLink Kakuma <your_email>
FRONTEND_URL=<your_frontend_vercel_url>
```

### Frontend Environment Variables

```env
VITE_API_URL=<your_backend_vercel_url>/api
VITE_DATABASE_NAME=aidlink_kakuma
VITE_DATABASE_VERSION=2
```

---

## ✅ Deployment Complete!

Your AidLink Kakuma platform is now live! 🎉

**What you have:**
- ✅ Production backend on Vercel
- ✅ Production frontend on Vercel
- ✅ PostgreSQL database on Neon
- ✅ Email verification working
- ✅ Offline map support
- ✅ PWA enabled
- ✅ Mobile responsive
- ✅ All features working

**Next Steps:**
1. Share the frontend URL with your team
2. Test thoroughly with real users
3. Monitor logs for any issues
4. Consider custom domain for branding
5. Plan email domain setup for production

---

## 🆘 Need Help?

### Vercel Resources
- Docs: https://vercel.com/docs
- Support: https://vercel.com/support
- Status: https://www.vercel-status.com

### Quick Fixes

**Redeploy Backend:**
```
1. Go to Backend Project
2. Deployments tab
3. Latest deployment → "..." → Redeploy
```

**Redeploy Frontend:**
```
1. Go to Frontend Project
2. Deployments tab  
3. Latest deployment → "..." → Redeploy
```

**View Logs:**
```
1. Go to Project
2. Click on deployment
3. View Function Logs (backend)
4. View Build Logs (both)
```

---

**Deployment Guide by AidLink Team**  
Updated: November 28, 2026
