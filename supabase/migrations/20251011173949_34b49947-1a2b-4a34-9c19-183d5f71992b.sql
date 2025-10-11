-- Create RLS policies for patients table
-- Allow authenticated users to view all patients
CREATE POLICY "Authenticated users can view all patients"
ON public.patients
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert patients
CREATE POLICY "Authenticated users can insert patients"
ON public.patients
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update patients
CREATE POLICY "Authenticated users can update patients"
ON public.patients
FOR UPDATE
TO authenticated
USING (true);

-- Allow authenticated users to delete patients
CREATE POLICY "Authenticated users can delete patients"
ON public.patients
FOR DELETE
TO authenticated
USING (true);