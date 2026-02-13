-- ============================================================================
-- TechMate Column Migrations
-- Run AFTER production_schema.sql to add missing columns to existing tables
-- Safe to run multiple times (uses IF NOT EXISTS checks)
-- ============================================================================

-- ============================================================================
-- PROFILES: Add new columns if they don't exist
-- ============================================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='username') THEN
    ALTER TABLE profiles ADD COLUMN username TEXT UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='phone') THEN
    ALTER TABLE profiles ADD COLUMN phone TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='bio') THEN
    ALTER TABLE profiles ADD COLUMN bio TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='company') THEN
    ALTER TABLE profiles ADD COLUMN company TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='job_title') THEN
    ALTER TABLE profiles ADD COLUMN job_title TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='location') THEN
    ALTER TABLE profiles ADD COLUMN location TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='website') THEN
    ALTER TABLE profiles ADD COLUMN website TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='timezone') THEN
    ALTER TABLE profiles ADD COLUMN timezone TEXT DEFAULT 'UTC';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
    ALTER TABLE profiles ADD COLUMN role TEXT NOT NULL DEFAULT 'user';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='user_type') THEN
    ALTER TABLE profiles ADD COLUMN user_type TEXT NOT NULL DEFAULT 'individual';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_admin') THEN
    ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_active') THEN
    ALTER TABLE profiles ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='email_verified') THEN
    ALTER TABLE profiles ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='last_login_at') THEN
    ALTER TABLE profiles ADD COLUMN last_login_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='deleted_at') THEN
    ALTER TABLE profiles ADD COLUMN deleted_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='metadata') THEN
    ALTER TABLE profiles ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- ============================================================================
-- BUSINESSES: Add new columns if they don't exist
-- ============================================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='businesses' AND column_name='deleted_at') THEN
    ALTER TABLE businesses ADD COLUMN deleted_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='businesses' AND column_name='is_active') THEN
    ALTER TABLE businesses ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='businesses' AND column_name='is_verified') THEN
     ALTER TABLE businesses ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='businesses' AND column_name='metadata') THEN
    ALTER TABLE businesses ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- ============================================================================
-- PROJECTS: Add new columns if they don't exist
-- ============================================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='business_id') THEN
    ALTER TABLE projects ADD COLUMN business_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='budget') THEN
    ALTER TABLE projects ADD COLUMN budget NUMERIC(12,2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='spent') THEN
    ALTER TABLE projects ADD COLUMN spent NUMERIC(12,2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='progress') THEN
    ALTER TABLE projects ADD COLUMN progress INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='health_score') THEN
    ALTER TABLE projects ADD COLUMN health_score INTEGER DEFAULT 100;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='payment_status') THEN
    ALTER TABLE projects ADD COLUMN payment_status TEXT DEFAULT 'unpaid';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='started_at') THEN
    ALTER TABLE projects ADD COLUMN started_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='completed_at') THEN
    ALTER TABLE projects ADD COLUMN completed_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='deleted_at') THEN
    ALTER TABLE projects ADD COLUMN deleted_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='metadata') THEN
    ALTER TABLE projects ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='deliverables') THEN
    ALTER TABLE projects ADD COLUMN deliverables JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- ============================================================================
-- ORDERS: Add new columns if they don't exist
-- ============================================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='progress') THEN
    ALTER TABLE orders ADD COLUMN progress INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='health_score') THEN
    ALTER TABLE orders ADD COLUMN health_score INTEGER DEFAULT 100;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='started_at') THEN
    ALTER TABLE orders ADD COLUMN started_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='completed_at') THEN
    ALTER TABLE orders ADD COLUMN completed_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='next_milestone') THEN
    ALTER TABLE orders ADD COLUMN next_milestone TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='deleted_at') THEN
    ALTER TABLE orders ADD COLUMN deleted_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='metadata') THEN
    ALTER TABLE orders ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='spent') THEN
    ALTER TABLE orders ADD COLUMN spent NUMERIC(12,2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='project_id') THEN
    ALTER TABLE orders ADD COLUMN project_id UUID;
  END IF;
END $$;

-- ============================================================================
-- DELIVERABLES: Add missing columns
-- ============================================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deliverables' AND column_name='project_id') THEN
    ALTER TABLE deliverables ADD COLUMN project_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deliverables' AND column_name='deleted_at') THEN
    ALTER TABLE deliverables ADD COLUMN deleted_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deliverables' AND column_name='metadata') THEN
    ALTER TABLE deliverables ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- ============================================================================
-- REQUESTS: Fix accepted_response_id type if needed
-- ============================================================================
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='requests' AND column_name='accepted_response_id' AND data_type != 'uuid'
  ) THEN
    ALTER TABLE requests DROP COLUMN accepted_response_id;
    ALTER TABLE requests ADD COLUMN accepted_response_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='requests' AND column_name='deleted_at') THEN
    ALTER TABLE requests ADD COLUMN deleted_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='requests' AND column_name='metadata') THEN
    ALTER TABLE requests ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='requests' AND column_name='is_public') THEN
    ALTER TABLE requests ADD COLUMN is_public BOOLEAN DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='requests' AND column_name='is_active') THEN
    ALTER TABLE requests ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- ============================================================================
-- RESPONSES: Add missing columns
-- ============================================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='responses' AND column_name='deleted_at') THEN
    ALTER TABLE responses ADD COLUMN deleted_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='responses' AND column_name='metadata') THEN
    ALTER TABLE responses ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- ============================================================================
-- MESSAGES: Add missing columns
-- ============================================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='thread_id') THEN
    ALTER TABLE messages ADD COLUMN thread_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='request_id') THEN
    ALTER TABLE messages ADD COLUMN request_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='project_id') THEN
    ALTER TABLE messages ADD COLUMN project_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='deleted_at') THEN
    ALTER TABLE messages ADD COLUMN deleted_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='metadata') THEN
    ALTER TABLE messages ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='is_read') THEN
    ALTER TABLE messages ADD COLUMN is_read BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='read_at') THEN
    ALTER TABLE messages ADD COLUMN read_at TIMESTAMPTZ;
  END IF;
END $$;

-- ============================================================================
-- INVOICES: Add missing columns
-- ============================================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='deleted_at') THEN
    ALTER TABLE invoices ADD COLUMN deleted_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='metadata') THEN
    ALTER TABLE invoices ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='project_id') THEN
    ALTER TABLE invoices ADD COLUMN project_id UUID;
  END IF;
END $$;

-- ============================================================================
-- NOTIFICATIONS: Check required columns
-- ============================================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='is_read') THEN
     ALTER TABLE notifications ADD COLUMN is_read BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='metadata') THEN
     ALTER TABLE notifications ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- ============================================================================
-- SERVICE_CATEGORIES: Add missing columns if needed
-- ============================================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='service_categories' AND column_name='is_active') THEN
     ALTER TABLE service_categories ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='service_categories' AND column_name='sort_order') THEN
     ALTER TABLE service_categories ADD COLUMN sort_order INTEGER DEFAULT 0;
  END IF;
END $$;

-- ============================================================================
-- ACTIVITY_LOGS: Add missing columns if needed
-- ============================================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='activity_logs' AND column_name='metadata') THEN
     ALTER TABLE activity_logs ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='activity_logs' AND column_name='user_id') THEN
     ALTER TABLE activity_logs ADD COLUMN user_id UUID;
  END IF;
END $$;

-- ============================================================================
-- SUPPORT_TICKETS: Add missing columns if needed
-- ============================================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='support_tickets' AND column_name='deleted_at') THEN
     ALTER TABLE support_tickets ADD COLUMN deleted_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='support_tickets' AND column_name='metadata') THEN
     ALTER TABLE support_tickets ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
   IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='support_tickets' AND column_name='assigned_to') THEN
     ALTER TABLE support_tickets ADD COLUMN assigned_to UUID;
  END IF;
END $$;

-- ============================================================================
-- Done! All columns should now exist for RLS policies and functions
-- ============================================================================
SELECT 'Column migrations complete!' AS status;
