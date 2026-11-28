-- Fix verified column for existing accounts
-- This ensures all accounts that completed verification are properly marked as verified
-- PostgreSQL compatible

-- Show current state
SELECT 
  email, 
  name, 
  verified, 
  created_at,
  CASE 
    WHEN verified = TRUE THEN 'Verified'
    WHEN verified = FALSE THEN 'Not Verified'
    ELSE 'NULL (should be TRUE)'
  END as status
FROM organizations
ORDER BY created_at DESC;

-- If you have accounts that completed email verification but are showing as not verified,
-- you can manually set them as verified:
-- UPDATE organizations SET verified = TRUE WHERE email = 'specific@email.com';

-- To verify all existing accounts (use with caution):
-- UPDATE organizations SET verified = TRUE WHERE verified IS NULL OR verified = FALSE;
