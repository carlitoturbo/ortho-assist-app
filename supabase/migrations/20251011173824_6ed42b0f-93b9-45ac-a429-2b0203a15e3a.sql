-- Insert patient data from appointments
INSERT INTO public.patients (first_name, last_name, phone, mail) VALUES
  ('Emily', 'Davis', '(555) 234-5678', 'emily.d@email.com'),
  ('James', 'Wilson', '(555) 345-6789', 'james.w@email.com'),
  ('Sarah', 'Johnson', '(555) 111-2222', 'sarah.j@email.com'),
  ('Robert', 'Brown', '(555) 567-8901', 'robert.b@email.com'),
  ('Maria', 'Garcia', '(555) 678-9012', 'maria.g@email.com'),
  ('David', 'Lee', '(555) 789-0123', 'david.l@email.com'),
  ('Jennifer', 'Taylor', '(555) 890-1234', 'jennifer.t@email.com'),
  ('Michael', 'Anderson', '(555) 901-2345', 'michael.a@email.com')
ON CONFLICT DO NOTHING;