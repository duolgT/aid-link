# Two-Stage Email Verification System

## Overview
AidLink now uses a **two-stage registration process** to ensure only verified emails create actual accounts in the database.

## How It Works

### Stage 1: Pending Registration
When a user registers:
1. Data is stored in `pending_registrations` table (NOT in `organizations`)
2. A 6-digit verification code is generated
3. Verification email is sent with the code
4. Code expires in 10 minutes
5. **NO account is created yet**

### Stage 2: Account Creation
When user enters the verification code:
1. System finds the pending registration
2. Validates the code and expiration
3. **NOW creates the actual account** in `organizations` table
4. Account is marked as `is_verified: true` immediately
5. Pending registration is deleted
6. Welcome email is sent

## Database Schema

### pending_registrations Table
```sql
CREATE TABLE pending_registrations (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,  -- Already hashed
  sector VARCHAR(100) NOT NULL,
  verification_code VARCHAR(6) NOT NULL,
  verification_token VARCHAR(255),
  verification_expires DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### organizations Table
```sql
-- Only verified accounts exist here
-- is_verified is always TRUE for new accounts
-- verification fields can be NULL
```

## Benefits

✅ **No unverified accounts in production database**
- Only verified emails create accounts
- Keeps `organizations` table clean

✅ **Automatic cleanup**
- Expired pending registrations are deleted after 24 hours
- Cleanup runs every hour automatically

✅ **Prevents duplicate registrations**
- If email exists in `organizations`: Error "already exists"
- If email exists in `pending_registrations`: Old pending deleted, new code sent

✅ **Better security**
- Can't login without verifying email first
- Verification code expires in 10 minutes

## API Endpoints

### POST /api/auth/register
**Before:** Created account immediately
**Now:** Creates pending registration, sends code

Response:
```json
{
  "success": true,
  "message": "Registration initiated. Please check your email...",
  "data": {
    "email": "org@example.com",
    "name": "Organization Name",
    "emailSent": true,
    "expiresIn": "10 minutes"
  }
}
```

### POST /api/auth/verify-code
**Before:** Updated existing account to verified
**Now:** Creates new verified account

Request:
```json
{
  "email": "org@example.com",
  "code": "123456"
}
```

Response:
```json
{
  "success": true,
  "message": "Email verified successfully! Your account has been created...",
  "data": {
    "email": "org@example.com",
    "name": "Organization Name"
  }
}
```

### POST /api/auth/resend-verification
**Before:** Looked in `organizations` table
**Now:** Looks in `pending_registrations` table

## Edge Cases Handled

1. **Email already registered and verified**
   - Returns: "Organization with this email already exists"

2. **Email has pending registration**
   - Deletes old pending
   - Creates new pending with new code

3. **Expired verification code**
   - Returns: "Invalid or expired verification code"
   - User can request new code via `/resend-verification`

4. **Invalid verification code**
   - Returns: "Invalid or expired verification code"

5. **Account created between stages**
   - Pending deleted, returns: "Organization already exists. Please login."

## Cleanup Process

Automatic cleanup runs every hour:
```javascript
// Deletes pending registrations older than 24 hours
await PendingRegistration.deleteExpired();
```

## Migration from Old System

If you have unverified accounts in the `organizations` table from the old system:

```sql
-- Option 1: Delete all unverified accounts
DELETE FROM organizations WHERE is_verified = FALSE;

-- Option 2: Mark them as verified (if testing)
UPDATE organizations SET is_verified = TRUE WHERE is_verified = FALSE;
```

## Testing

### Test with Resend Free Tier
Only sends to account owner email: `uhuribhang211@gmail.com`

### Manual Code Check
If email isn't working, get code from database:
```sql
SELECT email, verification_code, verification_expires 
FROM pending_registrations 
ORDER BY created_at DESC 
LIMIT 1;
```

## Files Changed

1. `server/models/PendingRegistration.js` - New model
2. `server/controllers/authController.js` - Updated logic
3. `server/config/db.js` - Added pending_registrations table
4. `server/server.js` - Added cleanup job
5. `server/migrations/add_pending_registrations.sql` - Migration script

## User Flow

```
User fills registration form
         ↓
POST /api/auth/register
         ↓
Data saved to pending_registrations
         ↓
Email sent with 6-digit code
         ↓
User checks email
         ↓
User enters code on verify-code page
         ↓
POST /api/auth/verify-code
         ↓
Account created in organizations table
         ↓
Pending registration deleted
         ↓
Welcome email sent
         ↓
User can now login
```

## Important Notes

⚠️ **User cannot login until verification is complete**
- No JWT token is issued during registration
- Must verify email first, then login

⚠️ **Code expires in 10 minutes**
- User must verify quickly
- Can request new code via "Resend Code" button

⚠️ **Free tier email limitation**
- Resend only sends to `uhuribhang211@gmail.com`
- Use this email for testing
