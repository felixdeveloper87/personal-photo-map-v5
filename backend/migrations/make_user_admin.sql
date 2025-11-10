-- Migration: Make a user admin
-- This script updates a user's role to ROLE_ADMIN
-- Replace 'seu-email@exemplo.com' with the actual email of the user you want to make admin

-- Option 1: Update by email
UPDATE users 
SET role = 'ROLE_ADMIN' 
WHERE email = 'seu-email@exemplo.com';

-- Option 2: Update by user ID (uncomment and replace with actual ID)
-- UPDATE users 
-- SET role = 'ROLE_ADMIN' 
-- WHERE id = 1;

-- Verify the update
SELECT id, email, fullname, role 
FROM users 
WHERE role = 'ROLE_ADMIN' OR role = 'ADMIN';

