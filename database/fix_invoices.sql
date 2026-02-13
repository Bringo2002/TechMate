-- ============================================================================
-- TechMate Targeted Fix: Invoices Table
-- Run this to fix "column new.invoice_number does not exist" error
-- ============================================================================

-- Add invoice_number if missing
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_number TEXT;

-- Add uniqueness constraint if missing
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invoices_invoice_number_key') THEN
    ALTER TABLE invoices ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);
  END IF;
END $$;

-- Add other potentially missing columns for invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(12,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS sent_date TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_date TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_reference TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Populate empty invoice numbers to avoid Not Null errors if we were to enforce it
UPDATE invoices SET invoice_number = 'INV-' || substr(id::text, 1, 8) 
WHERE invoice_number IS NULL;

-- Now safe to set NOT NULL if desired, but we'll leave it nullable for now to be safe
-- ALTER TABLE invoices ALTER COLUMN invoice_number SET NOT NULL;

SELECT 'Invoices table patched successfully!' as status;
