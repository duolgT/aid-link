-- Verification script to check database setup

-- Check if database exists
SELECT 'Database exists' as status, DATABASE() as current_database;

-- Check organizations table structure
DESCRIBE organizations;

-- Check reports table structure
DESCRIBE reports;

-- Check services table structure
DESCRIBE services;

-- Check emergency_guides table structure
DESCRIBE emergency_guides;

-- Count records in each table
SELECT 
  'organizations' as table_name, 
  COUNT(*) as record_count 
FROM organizations
UNION ALL
SELECT 
  'reports' as table_name, 
  COUNT(*) as record_count 
FROM reports
UNION ALL
SELECT 
  'services' as table_name, 
  COUNT(*) as record_count 
FROM services
UNION ALL
SELECT 
  'emergency_guides' as table_name, 
  COUNT(*) as record_count 
FROM emergency_guides;

-- Show recent organizations
SELECT 
  id, 
  name, 
  email, 
  sector, 
  is_verified,
  created_at 
FROM organizations 
ORDER BY created_at DESC 
LIMIT 5;
