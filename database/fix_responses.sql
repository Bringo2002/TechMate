-- ============================================================================
-- TechMate Targeted Fix: Responses Table
-- Run this individually in Supabase SQL Editor
-- ============================================================================

-- Force add columns with standard SQL
ALTER TABLE responses ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE responses ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE responses ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Double check other potential missing columns
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Verify
SELECT * FROM information_schema.columns 
WHERE table_name = 'responses' 
AND column_name IN ('deleted_at', 'metadata');
