-- Clean up unverified accounts from old system
-- Run this manually: mysql -u root aidlink_kakuma < cleanup_unverified.sql

-- Show unverified accounts before deletion
SELECT '=== UNVERIFIED ACCOUNTS TO BE DELETED ===' as '';
SELECT email, name, is_verified, created_at 
FROM organizations 
WHERE is_verified = 0 OR is_verified IS NULL OR is_verified = FALSE;

-- Delete unverified accounts
DELETE FROM organizations 
WHERE is_verified = 0 OR is_verified IS NULL OR is_verified = FALSE;

-- Show result
SELECT '=== CLEANUP COMPLETE ===' as '';
SELECT COUNT(*) as remaining_accounts FROM organizations;
