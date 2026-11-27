# Clean Up Unverified Accounts

## Problem
The email `uhuribhang21@gmail.com` was created with the OLD system and is marked as unverified. It needs to be removed so you can register fresh with the new two-stage system.

## Solution

### Option 1: Run SQL Script (Recommended)
```bash
cd server
mysql -u root aidlink_kakuma < cleanup_unverified.sql
```

### Option 2: Manual SQL Command
```bash
mysql -u root aidlink_kakuma
```

Then run:
```sql
-- Check unverified accounts
SELECT email, name, is_verified, created_at 
FROM organizations 
WHERE is_verified = 0 OR is_verified IS NULL OR is_verified = FALSE;

-- Delete unverified accounts
DELETE FROM organizations 
WHERE is_verified = 0 OR is_verified IS NULL OR is_verified = FALSE;

-- Verify cleanup
SELECT COUNT(*) as remaining_accounts FROM organizations;
```

### Option 3: Delete Specific Email
```sql
DELETE FROM organizations WHERE email = 'uhuribhang21@gmail.com';
```

## After Cleanup

1. **Restart the server** (if running)
2. **Register again** with any email (use `uhuribhang211@gmail.com` for testing)
3. **Check email** for 6-digit code
4. **Verify** the code
5. **Account created** ✅

## Verify It Worked

```sql
-- Should show ONLY verified accounts
SELECT email, name, is_verified FROM organizations;

-- Should be empty (no pending registrations yet)
SELECT email, name FROM pending_registrations;
```
