-- ============================================================================
-- TechMate Database Debugger
-- Run this to inspect exactly what columns exist on the troubled tables
-- ============================================================================

-- Check if tables are actually tables or views
SELECT table_schema, table_name, table_type 
FROM information_schema.tables 
WHERE table_name IN ('support_tickets', 'responses', 'notifications');

-- List all columns for these tables
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name IN ('support_tickets', 'responses', 'notifications')
ORDER BY table_name, ordinal_position;
