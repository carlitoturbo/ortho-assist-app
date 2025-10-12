-- Create storage bucket for audio recordings
INSERT INTO storage.buckets (id, name, public)
VALUES ('appointment-recordings', 'appointment-recordings', false);

-- Create RLS policies for audio recordings bucket
CREATE POLICY "Authenticated users can upload recordings"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'appointment-recordings');

CREATE POLICY "Authenticated users can view recordings"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'appointment-recordings');

CREATE POLICY "Authenticated users can delete recordings"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'appointment-recordings');