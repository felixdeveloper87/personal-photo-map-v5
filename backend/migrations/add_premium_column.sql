-- Migration: Add premium column to users table
-- This migration ensures the premium column exists without losing any user data
-- Date: 2024

-- Check if column exists and add it if not
DO $$ 
BEGIN
    -- Check if the premium column already exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'premium'
    ) THEN
        -- Add the premium column with default value false
        ALTER TABLE users 
        ADD COLUMN premium BOOLEAN NOT NULL DEFAULT false;
        
        RAISE NOTICE 'Premium column added successfully to users table';
    ELSE
        RAISE NOTICE 'Premium column already exists in users table';
    END IF;
END $$;

-- Verify the column exists and show current state
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_name = 'users' 
AND column_name = 'premium';

