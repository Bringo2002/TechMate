-- Drop existing constraint first
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_user_id_fkey;

-- Now add the correct one pointing to profiles
ALTER TABLE public.projects 
ADD CONSTRAINT projects_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) 
ON DELETE CASCADE;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
