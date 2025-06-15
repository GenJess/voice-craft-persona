
-- Create a new migration to update RLS policies for the resumes storage bucket
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Drop the old, restrictive policies on the resumes bucket
DROP POLICY IF EXISTS "Allow authenticated uploads to resumes" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own resumes" ON storage.objects;

-- Create a new, permissive policy to allow all public access to the resumes bucket
CREATE POLICY "Public access for resumes" ON storage.objects
  FOR ALL
  TO public
  USING (bucket_id = 'resumes')
  WITH CHECK (bucket_id = 'resumes');
