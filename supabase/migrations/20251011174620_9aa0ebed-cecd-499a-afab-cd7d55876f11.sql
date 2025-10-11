-- Insert appointments data, matching patients by name
INSERT INTO public.appointments (patient_id, appointment_date, appointment_time, treatment, status, duration_minutes)
VALUES
  -- Emily Davis - Today 14:00
  ((SELECT id FROM public.patients WHERE first_name = 'Emily' AND last_name = 'Davis'), '2025-01-11', '14:00', 'Checkup', 'pending', 30),
  
  -- James Wilson - Today 15:30
  ((SELECT id FROM public.patients WHERE first_name = 'James' AND last_name = 'Wilson'), '2025-01-11', '15:30', 'Filling', 'confirmed', 45),
  
  -- Sarah Johnson - Today 09:00
  ((SELECT id FROM public.patients WHERE first_name = 'Sarah' AND last_name = 'Johnson'), '2025-01-11', '09:00', 'Cleaning', 'confirmed', 60),
  
  -- Robert Brown - Today 11:00
  ((SELECT id FROM public.patients WHERE first_name = 'Robert' AND last_name = 'Brown'), '2025-01-11', '11:00', 'Root Canal', 'confirmed', 90),
  
  -- Maria Garcia - Tomorrow 10:30
  ((SELECT id FROM public.patients WHERE first_name = 'Maria' AND last_name = 'Garcia'), '2025-01-12', '10:30', 'Crown Fitting', 'pending', 60),
  
  -- David Lee - Tomorrow 14:00
  ((SELECT id FROM public.patients WHERE first_name = 'David' AND last_name = 'Lee'), '2025-01-12', '14:00', 'Extraction', 'confirmed', 45),
  
  -- Jennifer Taylor - 15/03/2025 09:30
  ((SELECT id FROM public.patients WHERE first_name = 'Jennifer' AND last_name = 'Taylor'), '2025-03-15', '09:30', 'Crown', 'confirmed', 75),
  
  -- Michael Anderson - 15/03/2025 13:00
  ((SELECT id FROM public.patients WHERE first_name = 'Michael' AND last_name = 'Anderson'), '2025-03-15', '13:00', 'Cleaning', 'pending', 45);