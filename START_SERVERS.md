# How to Start AidLink Servers

## Prerequisites
1. MySQL must be running
2. Database `aidlink_kakuma` must exist
3. All migrations must be run

## Step 1: Start Backend Server

Open a terminal in the project root:

```bash
cd server
npm start
```

**Expected output**:
```
✅ Server running on port 3000
✅ Connected to MySQL: aidlink_kakuma
```

If you see connection errors, check:
- MySQL is running
- Database password in `server/.env` is correct
- Database `aidlink_kakuma` exists

## Step 2: Start Frontend Server

Open a **new terminal** in the project root:

```bash
cd client
npm run dev
```

**Expected output**:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5174/
  ➜  Network: use --host to expose
```

## Step 3: Test Report Submission

1. Go to http://localhost:5174/report
2. Fill in the form and submit
3. Open browser console (F12)
4. Look for: `✅ Report submitted to backend`

If you see errors like "Failed to fetch" or "Network error":
- Backend is not running
- Check backend terminal for errors
- Verify port 3000 is not blocked

## Quick Test Commands

### Test Backend is Running
```bash
curl http://localhost:3000/api/health
```

Should return: `{"status":"ok"}`

### Test Database Connection
```bash
mysql -u root -p aidlink_kakuma -e "SELECT COUNT(*) FROM reports;"
```

## Common Issues

### Backend Won't Start
- Check MySQL password in `server/.env`
- Ensure MySQL service is running
- Check port 3000 is not in use: `netstat -ano | findstr :3000`

### Reports Stay as "Pending submission"
- Backend is not running
- Check browser console for errors
- Verify `VITE_API_URL=http://localhost:3000/api` in `client/.env`

### Organizations Can't See Reports
- Backend is running but reports aren't being sent
- Check backend console for POST /api/reports logs
- Clear browser storage and try again
