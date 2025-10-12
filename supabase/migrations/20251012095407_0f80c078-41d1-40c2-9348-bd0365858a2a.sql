-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can upload recordings" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view recordings" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete recordings" ON storage.objects;

-- Create new policies that allow public access (matching the pattern of other tables in the project)
CREATE POLICY "Public users can upload recordings"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'appointment-recordings');

CREATE POLICY "Public users can view recordings"
ON storage.objects
FOR SELECT
USING (bucket_id = 'appointment-recordings');

CREATE POLICY "Public users can delete recordings"
ON storage.objects
FOR DELETE
USING (bucket_id = 'appointment-recordings');