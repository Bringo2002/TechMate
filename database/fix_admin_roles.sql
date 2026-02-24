-- Migration to fix admin role and is_admin flag synchronization
-- The user has role="admin" but is_admin=false, which breaks the is_admin() function.

-- 1. Update the is_admin() function to check for BOTH is_admin=true OR role='admin'
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND (is_admin = true OR role = 'admin')
      AND (deleted_at IS NULL OR NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'deleted_at'
      ))
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. Synchronize the profiles table for any existing users
-- If role is 'admin', set is_admin to true
UPDATE profiles 
SET is_admin = true 
WHERE role = 'admin' AND is_admin = false;

-- If is_admin is true, set role to 'admin'
UPDATE profiles
SET role = 'admin'
WHERE is_admin = true AND role != 'admin';
