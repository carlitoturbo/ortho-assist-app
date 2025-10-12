-- Add transcription column to appointments table
ALTER TABLE public.appointments 
ADD COLUMN transcription TEXT;