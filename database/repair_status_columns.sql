-- ============================================================================
-- TechMate Status Column Repair
-- Run this if indexes.sql fails with "column 'status' does not exist"
-- ============================================================================

DO $$ 
BEGIN

  -- 1. PROJECTS
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='status') THEN
     ALTER TABLE projects ADD COLUMN status TEXT NOT NULL DEFAULT 'planning';
  END IF;

  -- 2. ORDERS
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='status') THEN
     ALTER TABLE orders ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';
  END IF;

  -- 3. DELIVERABLES
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deliverables' AND column_name='status') THEN
     ALTER TABLE deliverables ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';
  END IF;

  -- 4. INVOICES
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='status') THEN
     ALTER TABLE invoices ADD COLUMN status TEXT NOT NULL DEFAULT 'draft';
  END IF;

  -- 5. REQUESTS
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='requests' AND column_name='status') THEN
     ALTER TABLE requests ADD COLUMN status TEXT NOT NULL DEFAULT 'draft';
  END IF;

  -- 6. RESPONSES
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='responses' AND column_name='status') THEN
     ALTER TABLE responses ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';
  END IF;

  -- 7. SUPPORT TICKETS (Already covered, but good to double check)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='support_tickets' AND column_name='status') THEN
     ALTER TABLE support_tickets ADD COLUMN status TEXT DEFAULT 'open';
  END IF;

END $$;

SELECT 'Status columns checked and repaired!' as result;
