# ✅ Pre-Deployment Checklist

## Before deploying to Vercel, ensure:

### Backend (Server) Checklist

- [ ] All dependencies installed (`npm install` in `server/`)
- [ ] `server/vercel.json` exists and is configured
- [ ] Environment variables documented
- [ ] Database connection string ready (Neon PostgreSQL)
- [ ] Gmail App Password ready
- [ ] JWT_SECRET generated
- [ ] All API routes tested locally
- [ ] CORS configured for production frontend URL
- [ ] No hardcoded localhost URLs
- [ ] Server exports Express app (`export default app`)

### Frontend (Client) Checklist

- [ ] All dependencies installed (`npm install` in `client/`)
- [ ] `client/vercel.json` exists
- [ ] Build command works locally (`npm run build`)
- [ ] No hardcoded localhost URLs
- [ ] API URL configured to use env variable
- [ ] All routes in App.jsx working
- [ ] PWA manifest configured
- [ ] Icons in `public/` folder
- [ ] Service worker registered

### Database Checklist

- [ ] Neon PostgreSQL database created
- [ ] Database connection URL copied
- [ ] SSL mode set to `verify-full`
- [ ] Tables can be created automatically via code
- [ ] Database is not suspended

### Environment Variables Ready

#### Backend (.env)
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_EXPIRES_IN=3h
GMAIL_USER=...
GMAIL_APP_PASSWORD=...
EMAIL_FROM=...
FRONTEND_URL=...
```

#### Frontend (.env)
```
VITE_API_URL=https://your-backend.vercel.app/api
VITE_DATABASE_NAME=aidlink_kakuma
VITE_DATABASE_VERSION=2
```

### Git Repository

- [ ] All changes committed
- [ ] All changes pushed to GitHub
- [ ] Repository is public or Vercel has access
- [ ] No sensitive data in repository
- [ ] `.gitignore` excludes `.env` files
- [ ] README.md updated

### Testing

- [ ] Backend health endpoint works (`/api/health`)
- [ ] Frontend builds without errors
- [ ] Email sending tested locally
- [ ] Database queries tested
- [ ] Authentication flow tested
- [ ] All pages load without errors

## Deployment Order

1. ✅ Deploy **Backend** first
2. ✅ Copy backend URL
3. ✅ Deploy **Frontend** with backend URL
4. ✅ Update backend FRONTEND_URL
5. ✅ Redeploy backend with updated CORS
6. ✅ Configure ignored build steps
7. ✅ Test full application

## Post-Deployment

- [ ] Test registration with any email
- [ ] Verify email received
- [ ] Test login
- [ ] Test dashboard access
- [ ] Test all public pages
- [ ] Test map functionality
- [ ] Test offline features
- [ ] Check browser console for errors
- [ ] Monitor Vercel function logs

## Common Issues & Solutions

### Backend

**Issue**: Database connection timeout
- **Fix**: Check DATABASE_URL, ensure database not suspended

**Issue**: CORS errors
- **Fix**: Update FRONTEND_URL in backend env, redeploy

**Issue**: Email not sending
- **Fix**: Check Gmail credentials, verify app password

### Frontend

**Issue**: API calls fail
- **Fix**: Verify VITE_API_URL is correct, includes `/api`

**Issue**: Build fails
- **Fix**: Check all dependencies, run `npm install`

**Issue**: Blank page
- **Fix**: Check console for errors, verify routes

## Useful Commands

### Local Testing

```bash
# Backend
cd server
npm install
npm start

# Frontend
cd client
npm install
npm run dev
```

### Build Testing

```bash
# Frontend
cd client
npm run build
npm run preview
```

### Git Commands

```bash
# Check status
git status

# Commit changes
git add .
git commit -m "Prepare for deployment"

# Push to GitHub
git push origin main
```

## Support Resources

- Vercel Docs: https://vercel.com/docs
- Neon Docs: https://neon.tech/docs
- Node.js Docs: https://nodejs.org/docs

## Ready to Deploy?

If all checkboxes are ticked ✅, you're ready to deploy!

Follow the **VERCEL_DEPLOYMENT_GUIDE.md** for step-by-step instructions.
