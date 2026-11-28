# 🔧 Backend Error Fix - Vercel Function Invocation Failed

## Error Message:
```
A server error has occurred
FUNCTION_INVOCATION_FAILED
```

This error occurs when your Vercel serverless function crashes or times out.

## Common Causes & Solutions:

### 1. Database Connection Timeout ⏱️

**Problem**: PostgreSQL connection takes too long in cold starts

**Solution**: Add timeout and connection retry logic

Update your `server/config/db.js`:

```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // 10 seconds timeout
});
```

### 2. Missing Environment Variables 🔑

**Problem**: Required env variables not set in Vercel

**Check these in Vercel Dashboard → Your Project → Settings → Environment Variables:**

Required variables:
- ✅ `DATABASE_URL`
- ✅ `JWT_SECRET`
- ✅ `GMAIL_USER`
- ✅ `GMAIL_APP_PASSWORD`
- ✅ `EMAIL_FROM`
- ✅ `FRONTEND_URL`
- ✅ `NODE_ENV=production`

### 3. Cold Start Initialization ❄️

**Problem**: Database initialization takes too long on cold start

**Solution**: Make initialization optional for health check

Create `server/api/health.js`:

```javascript
export default function handler(req, res) {
  res.status(200).json({
    success: true,
    message: 'AidLink API is running',
    timestamp: new Date().toISOString()
  });
}
```

This provides a fast health check without database initialization.

### 4. Vercel Serverless Config ⚙️

**Update `server/vercel.json`:**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node",
      "config": {
        "maxDuration": 10
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 5. Check Vercel Function Logs 📋

**How to view logs:**

1. Go to your backend project in Vercel
2. Click on the latest deployment
3. Click **"View Function Logs"**
4. Look for error messages

Common errors in logs:
- `Connection timeout` → Database issue
- `Module not found` → Missing dependency
- `Environment variable undefined` → Missing env variable

### 6. Database Not Suspended 💤

**Check Neon Database:**

1. Go to https://neon.tech
2. Check your database status
3. If suspended, wake it up
4. Redeploy backend

### 7. Try Simple Health Check First

Create a minimal API endpoint that doesn't connect to database:

`server/api/ping.js`:
```javascript
export default (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
}
```

Then test: `https://aidlinkkakumabackend.vercel.app/api/ping`

## 🚀 Quick Fix Steps

### Step 1: Check Environment Variables

Go to Vercel:
1. Project → Settings → Environment Variables
2. Verify ALL variables are set
3. Check for typos in variable names

### Step 2: View Logs

1. Deployments tab → Latest deployment
2. Click on deployment
3. View Function Logs
4. Find the actual error message

### Step 3: Redeploy

1. Deployments tab
2. Latest deployment → "..." → Redeploy
3. Watch logs during deployment

### Step 4: Test Database Connection

Create `server/api/db-test.js`:
```javascript
import { testConnection } from '../config/db.js';

export default async function handler(req, res) {
  try {
    const isConnected = await testConnection();
    res.json({ 
      success: isConnected, 
      message: isConnected ? 'Database connected' : 'Database connection failed' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
}
```

Test: `https://aidlinkkakumabackend.vercel.app/api/db-test`

## 🔍 Debugging Checklist

- [ ] All environment variables set in Vercel
- [ ] Database is active (not suspended)
- [ ] Database URL is correct (with sslmode=verify-full)
- [ ] Function logs checked for errors
- [ ] Latest code deployed
- [ ] Node version compatible (use 18.x or 20.x)

## 💡 Most Likely Issue

Based on the error, it's probably one of these:

1. **Database connection timeout** (70% chance)
   - Solution: Check DATABASE_URL, verify database is active

2. **Missing environment variables** (20% chance)
   - Solution: Verify all env vars in Vercel

3. **Cold start timeout** (10% chance)
   - Solution: Optimize initialization, increase maxDuration

## 🆘 If Still Not Working

1. **Check Vercel Function Logs** (most important!)
2. Create a minimal `/api/ping` endpoint
3. Test database connection separately
4. Verify all environment variables
5. Check Neon database is not suspended
6. Try redeploying with fresh environment variables

## 📞 Get Actual Error Message

The key is to look at Function Logs in Vercel. That will tell you exactly what's failing:

```
Vercel Dashboard 
  → Your Backend Project 
  → Deployments 
  → Latest Deployment 
  → View Function Logs
```

The logs will show:
- Database connection errors
- Missing dependencies
- Environment variable issues
- Actual error stack trace

**This will tell you exactly what to fix!**
