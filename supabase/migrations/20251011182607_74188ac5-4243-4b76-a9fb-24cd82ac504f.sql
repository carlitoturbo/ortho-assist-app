-- Enable RLS on appointments table
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for treatments table to allow public read access
CREATE POLICY "Public users can view all treatments"
ON treatments
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert treatments"
ON treatments
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update treatments"
ON treatments
FOR UPDATE
USING (true);

CREATE POLICY "Authenticated users can delete treatments"
ON treatments
FOR DELETE
USING (true);