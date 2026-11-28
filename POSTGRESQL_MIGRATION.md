# PostgreSQL Migration Guide - AidLink Kakuma

## ✅ Migration Complete

Your AidLink project has been successfully migrated from MySQL to PostgreSQL (Neon)!

## 🔄 What Changed

### 1. Database Configuration
- **From**: MySQL with `mysql2` package
- **To**: PostgreSQL (Neon) with `pg` package
- **Connection**: Now uses `DATABASE_URL` with SSL

### 2. Query Syntax Updated
All database queries have been updated from MySQL syntax to PostgreSQL:
- **Parameter binding**: `?` → `$1, $2, $3` (positional parameters)
- **JSON fields**: `JSON` → `JSONB` (better performance)
- **Date functions**: `NOW()` → `CURRENT_TIMESTAMP`
- **Case-insensitive search**: `LIKE` → `ILIKE`
- **Result handling**: `result[0].rows` → `result.rows[0]`
- **Affected rows**: `affectedRows` → `rowCount`
- **Auto-update timestamp**: Triggers instead of `ON UPDATE CURRENT_TIMESTAMP`

### 3. Models Updated
All models have been rewritten for PostgreSQL:
- ✅ `Organization.js`
- ✅ `PendingRegistration.js`
- ✅ `Report.js`
- ✅ `Service.js`
- ✅ `EmergencyGuide.js`

### 4. Production URLs
All localhost URLs replaced with production URLs:
- **Backend API**: `https://aidlinkkakuma.vercel.app/api`
- **Frontend**: `https://aidlinkkakuma.vercel.app`

## 🗄️ Database Setup

### Option 1: Automatic (Recommended)
The server will automatically create all tables on first run:

```bash
cd server
npm start
```

### Option 2: Manual
Run the SQL script directly on your Neon database:

```bash
psql YOUR_DATABASE_URL -f init-postgres.sql
```

Or use the Neon web interface SQL editor and paste the contents of `server/init-postgres.sql`.

## 📦 Environment Variables

### Server `.env`
```env
PORT=3000
NODE_ENV=production
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=3h

# PostgreSQL Database Configuration (Neon)
DATABASE_URL=your_postgres_connection_url_here

# Resend Email Configuration
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM=AidLink Kakuma <onboarding@resend.dev>

# Frontend URL (Production)
FRONTEND_URL=https://aidlinkkakuma.vercel.app
```

### Client `.env`
```env
# Backend API URL (Production)
VITE_API_URL=https://aidlinkkakuma.vercel.app/api

# Database Configuration (IndexedDB for offline storage)
VITE_DATABASE_NAME=aidlink_kakuma
VITE_DATABASE_VERSION=2
```

## 🚀 Deployment to Vercel

### Backend Deployment
1. Push your code to GitHub
2. Import the `server` folder as a new Vercel project
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `RESEND_API_KEY`
   - `EMAIL_FROM`
   - `FRONTEND_URL`
   - `NODE_ENV=production`

### Frontend Deployment
1. Import the `client` folder as a new Vercel project
2. Add environment variable:
   - `VITE_API_URL=https://aidlinkkakuma.vercel.app/api`
3. Build command: `npm run build`
4. Output directory: `dist`

## ✨ Features Retained

All features remain intact after migration:
- ✅ Two-stage email verification
- ✅ 6-digit verification codes
- ✅ Password reset with 6-digit codes
- ✅ JWT authentication
- ✅ Report management
- ✅ Service directory
- ✅ Emergency guides
- ✅ Offline-first IndexedDB
- ✅ PWA with mobile responsiveness
- ✅ Dashboard with hamburger menu

## 🧪 Testing

### Local Testing
```bash
# Terminal 1 - Start backend
cd server
npm start

# Terminal 2 - Start frontend
cd client
npm run dev
```

### Production Testing
1. Visit `https://aidlinkkakuma.vercel.app`
2. Register with `uhuribhang211@gmail.com`
3. Check email for verification code
4. Test login and dashboard

## 📊 Database Tables

All tables created in PostgreSQL:
1. **organizations** - Verified user accounts
2. **pending_registrations** - Awaiting email verification
3. **reports** - Community reports
4. **services** - Aid services directory
5. **emergency_guides** - Emergency procedures

## 🔧 Troubleshooting

### Connection Issues
If you see PostgreSQL connection errors:
1. Check DATABASE_URL is correct
2. Ensure SSL mode is enabled
3. Verify Neon database is active

### Migration Errors
If old MySQL queries appear:
1. Clear node_modules: `rm -rf node_modules`
2. Reinstall: `npm install`
3. Restart server

## 📝 Next Steps

1. ✅ Test registration flow
2. ✅ Test login and authentication
3. ✅ Test report submission
4. ✅ Test dashboard on mobile
5. ✅ Monitor Neon database usage
6. 🔄 Set up domain for email verification (optional)

## 🎉 Success!

Your AidLink Kakuma platform is now running on:
- **Frontend**: React + Vite + PWA
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL (Neon)
- **Email**: Resend
- **Hosting**: Vercel

All production-ready! 🚀
