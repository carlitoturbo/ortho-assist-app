-- Insert 4 demo appointments for the coming days
INSERT INTO appointments (patient_id, appointment_date, appointment_time, treatment, duration_minutes, status, notes)
VALUES
  (1, CURRENT_DATE + INTERVAL '1 day', '09:00:00', 'Dental Cleaning', 60, 'confirmed', 'Regular checkup and cleaning'),
  (4, CURRENT_DATE + INTERVAL '1 day', '14:00:00', 'Tooth Filling', 45, 'pending', 'Cavity treatment'),
  (6, CURRENT_DATE + INTERVAL '2 days', '10:30:00', 'Root Canal', 90, 'confirmed', 'Follow-up appointment'),
  (8, CURRENT_DATE + INTERVAL '2 days', '15:00:00', 'Orthodontic Consultation', 30, 'pending', 'Initial consultation for braces');