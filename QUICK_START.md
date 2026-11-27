# 🚀 AidLink Backend - Quick Start Guide

## For Your Friend (Backend Dev)

Hey! Here's everything you need to get the backend running in 2 minutes.

---

## ⚡ Super Quick Start

```bash
# 1. Go to server directory
cd server

# 2. Install dependencies
npm install

# 3. Start the server
npm run dev
```

That's it! Server runs on `http://localhost:5000`

---

## 🧪 Test It Works

Open a new terminal:

```bash
# Health check
curl http://localhost:5000/api/health
```

You should see:
```json
{
  "success": true,
  "message": "AidLink API is running",
  "timestamp": "2026-11-27T10:00:00.000Z"
}
```

---

## 📋 What's Already Done

✅ **9 API Endpoints**
- Organization registration & login
- Anonymous report submission  
- Organization dashboard
- Batch offline sync

✅ **Security**
- JWT authentication
- Password hashing (bcrypt)
- Input validation

✅ **Documentation**
- Complete API docs (`API_DOCUMENTATION.md`)
- Test scripts (Unix & Windows)
- Integration examples

---

## 🔥 Quick API Test

```bash
# 1. Register an organization
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "UNHCR",
    "email": "test@unhcr.org",
    "password": "secure123",
    "sector": "Protection"
  }'

# Save the token and org ID from response

# 2. Submit a report
curl -X POST http://localhost:5000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "category": "water",
    "title": "Water supply interruption",
    "description": "Water taps have been dry for two days in block C",
    "organizationId": "PASTE-ORG-ID-HERE",
    "urgency": "high"
  }'

# 3. Get organization reports (use token from step 1)
curl http://localhost:5000/api/reports/org \
  -H "Authorization: Bearer YOUR-TOKEN-HERE"
```

---

## 📁 Important Files

| File | What It Does |
|------|-------------|
| `server/server.js` | Main entry point |
| `server/routes/*.js` | API route definitions |
| `server/controllers/*.js` | Business logic |
| `server/config/db.js` | Database (in-memory for now) |
| `server/.env` | Configuration (PORT, JWT_SECRET) |

---

## 🔧 Common Commands

```bash
# Start with auto-reload
npm run dev

# Start production mode
npm start

# Run test script (Unix/Mac/Linux)
./test-api.sh

# Run test script (Windows)
test-api.bat
```

---

## 📚 Full Documentation

Need details? Check these files:

1. **`BACKEND_SUMMARY.md`** - Complete implementation overview
2. **`API_DOCUMENTATION.md`** - All endpoints with examples  
3. **`server/README.md`** - API reference
4. **`server/SETUP.md`** - Detailed setup guide

---

## 🎯 For Production

Before deploying:

1. Replace `config/db.js` with real database (MongoDB/PostgreSQL)
2. Set strong `JWT_SECRET` in production `.env`
3. Enable HTTPS
4. Add rate limiting
5. Set up logging

---

## 💡 Tips

- **In-memory database**: Data resets when server restarts (by design)
- **CORS enabled**: Frontend can call from any origin
- **JWT expires in 7 days**: Configurable in `.env`
- **All passwords hashed**: Using bcrypt with 10 rounds

---

## 🆘 Troubleshooting

**Server won't start?**
```bash
# Check if port 5000 is available
netstat -ano | findstr :5000  # Windows
lsof -i :5000                  # Mac/Linux

# Try different port in .env
PORT=3000
```

**Can't install dependencies?**
```bash
# Delete node_modules and try again
rm -rf node_modules package-lock.json
npm install
```

---

## ✅ You're All Set!

The backend is **complete, tested, and pushed to GitHub** on branch `bhang`.

Ready for frontend integration! 🎉

---

**Questions?** Check the full docs or ping me!
