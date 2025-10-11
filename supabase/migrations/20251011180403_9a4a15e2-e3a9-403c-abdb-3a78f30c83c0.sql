-- Drop existing SELECT policies that require authentication
DROP POLICY IF EXISTS "Authenticated users can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can view all patients" ON patients;

-- Create public SELECT policies (allows anonymous access)
CREATE POLICY "Public users can view all appointments"
  ON appointments
  FOR SELECT
  USING (true);

CREATE POLICY "Public users can view all patients"
  ON patients
  FOR SELECT
  USING (true);