-- Manual Organization Verification Script
-- Use this to verify an organization account that completed email verification
-- but is showing as unverified

-- 1. Check current status of organizations
SELECT 
  id,
  name,
  email,
  sector,
  verified,
  created_at,
  CASE 
    WHEN verified = TRUE THEN '✅ Verified'
    WHEN verified = FALSE THEN '❌ Not Verified'
    ELSE '⚠️ NULL'
  END as status
FROM organizations
ORDER BY created_at DESC;

-- 2. Verify a specific organization by email
-- Replace 'organization@email.com' with the actual email
-- UPDATE organizations 
-- SET verified = TRUE 
-- WHERE email = 'organization@email.com' AND verified = FALSE;

-- 3. Verify all organizations (use with caution - only if all completed verification)
-- UPDATE organizations 
-- SET verified = TRUE 
-- WHERE verified = FALSE OR verified IS NULL;

-- 4. Check reports waiting for this organization
-- Replace 'organization-id-here' with actual organization ID
-- SELECT 
--   id,
--   title,
--   category,
--   status,
--   created_at
-- FROM reports
-- WHERE organization_id = 'organization-id-here'
-- ORDER BY created_at DESC;
