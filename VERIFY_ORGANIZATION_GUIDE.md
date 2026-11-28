# How to Verify an Organization Account

## Problem
When trying to sync offline reports, you see this error:
```
Failed to submit report: Organization account must be verified to receive reports
```

This means the organization exists in the database but `verified = FALSE`.

---

## Solution 1: Use the Admin API (Recommended for Testing)

### Step 1: Verify the Organization via API

**Endpoint:** `POST https://aidlinkkakumabackend.vercel.app/api/admin/verify-organization`

**Request Body:**
```json
{
  "email": "organization@email.com"
}
```

**Using curl:**
```bash
curl -X POST https://aidlinkkakumabackend.vercel.app/api/admin/verify-organization \
  -H "Content-Type: application/json" \
  -d '{"email":"your-org-email@example.com"}'
```

**Using JavaScript (Browser Console or Node):**
```javascript
fetch('https://aidlinkkakumabackend.vercel.app/api/admin/verify-organization', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'your-org-email@example.com' })
})
.then(res => res.json())
.then(data => console.log(data));
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Organization verified successfully",
  "data": {
    "email": "organization@email.com",
    "name": "Organization Name",
    "verified": true
  }
}
```

---

## Solution 2: Direct Database Update (SQL)

### Step 1: Connect to your Neon PostgreSQL database

```bash
psql postgresql://neondb_owner:npg_SNQn8cfbF5vu@ep-bold-union-a08t4nut-pooler.c-9.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

### Step 2: Check current organization status

```sql
SELECT 
  id,
  name,
  email,
  sector,
  verified,
  created_at
FROM organizations
ORDER BY created_at DESC;
```

### Step 3: Verify specific organization by email

```sql
UPDATE organizations 
SET verified = TRUE 
WHERE email = 'your-org-email@example.com';
```

### Step 4: Verify the update

```sql
SELECT email, name, verified 
FROM organizations 
WHERE email = 'your-org-email@example.com';
```

---

## Solution 3: Check All Organizations (via API)

**Endpoint:** `GET https://aidlinkkakumabackend.vercel.app/api/admin/organizations`

**Using curl:**
```bash
curl https://aidlinkkakumabackend.vercel.app/api/admin/organizations
```

**Expected Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "...",
      "name": "Red Cross",
      "email": "redcross@example.com",
      "sector": "Health",
      "verified": false,
      "created_at": "2024-11-28T..."
    },
    {
      "id": "...",
      "name": "UNHCR",
      "email": "unhcr@example.com",
      "sector": "Protection",
      "verified": true,
      "created_at": "2024-11-27T..."
    }
  ]
}
```

---

## After Verification

### Step 1: Verify the Organization is Active
Check in browser console:
```javascript
fetch('https://aidlinkkakumabackend.vercel.app/api/organizations')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Step 2: Trigger Manual Sync in Frontend

1. Open the AidLink app
2. You should see the sync banner: "You have 1 offline reports waiting to sync"
3. Click **"Sync Now"** button
4. Reports should sync successfully
5. Green success message appears: "✅ All reports synced successfully!"

---

## Why Does This Happen?

The two-stage email verification system works like this:

1. **User Registers** → Account saved in `pending_registrations` table
2. **User Verifies Email** (enters 6-digit code) → Account moved to `organizations` table with `verified = TRUE`

**Bug:** The authController.js was using `is_verified` instead of `verified`, so when the account was created, it set `is_verified = TRUE` but the database column is named `verified`, so it remained `FALSE`.

**Fix:** We corrected the column name in authController.js (commit 859d666), but existing accounts created before the fix need manual verification.

---

## Automated Fix (Future Registrations)

The bug is now fixed in the code. All NEW registrations after commit `859d666` will automatically be verified when users enter their verification code.

---

## Testing the Fix

1. Register a NEW organization account
2. Complete email verification (enter 6-digit code)
3. Login to the account
4. Submit a report (online or offline)
5. Report should sync immediately (if online) or when connection restored (if offline)
6. No "pending verification" message should appear

---

## Security Note

**⚠️ Important:** In production, the `/api/admin/*` endpoints should be protected with admin authentication. For now, they're open for testing purposes.

To secure them:
1. Create an admin authentication middleware
2. Add admin role to organizations table
3. Require admin JWT token for admin routes

---

## Quick Verification Script

Save this as `verify-org.js` and run with Node.js:

```javascript
const email = 'your-org-email@example.com'; // Change this

fetch('https://aidlinkkakumabackend.vercel.app/api/admin/verify-organization', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email })
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    console.log('✅ Organization verified:', data.data.name);
  } else {
    console.error('❌ Verification failed:', data.message);
  }
})
.catch(err => console.error('❌ Error:', err));
```

Run it:
```bash
node verify-org.js
```

---

## Contact & Support

If you continue to have issues:
1. Check the organization email is correct
2. Verify the organization exists in the database
3. Check browser console for detailed error messages
4. Ensure backend is deployed and accessible

---

**Documentation Updated:** November 28, 2024  
**Related Commits:** `859d666`, `ad7df60`, `b66cbfa`
