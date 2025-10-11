-- Create appointments table
CREATE TABLE public.appointments (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  patient_id bigint NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  treatment text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  duration_minutes integer NOT NULL,
  notes text
);

-- Enable Row Level Security
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for appointments
CREATE POLICY "Authenticated users can view all appointments"
ON public.appointments
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert appointments"
ON public.appointments
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update appointments"
ON public.appointments
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete appointments"
ON public.appointments
FOR DELETE
TO authenticated
USING (true);

-- Create index for better query performance
CREATE INDEX idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);