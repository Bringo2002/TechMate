-- ============================================================================
-- TechMate Status Column Debugger
-- Run this to find which table is missing 'status'
-- ============================================================================

SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('projects', 'orders', 'deliverables', 'invoices', 'requests', 'responses', 'support_tickets') 
AND column_name = 'status'
ORDER BY table_name;

-- Also check if tables exist at all
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_name IN ('projects', 'orders', 'deliverables', 'invoices', 'requests', 'responses', 'support_tickets');
