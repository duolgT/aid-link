-- Clean up unverified accounts
-- PostgreSQL compatible
-- Run this manually if needed

-- Show unverified accounts before deletion
SELECT email, name, verified, created_at 
FROM organizations 
WHERE verified = FALSE OR verified IS NULL;

-- Delete unverified accounts
DELETE FROM organizations 
WHERE verified = FALSE OR verified IS NULL;

-- Show result
SELECT COUNT(*) as remaining_accounts FROM organizations;
