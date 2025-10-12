-- Add meeting_notes column to appointments table
ALTER TABLE public.appointments 
ADD COLUMN meeting_notes TEXT;