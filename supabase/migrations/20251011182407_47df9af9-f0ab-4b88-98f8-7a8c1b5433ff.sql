-- Insert 3 demo treatments for each patient
-- Patient 1: Benjamin Andrick
INSERT INTO treatments (patient_id, treatment, created_at) VALUES
(1, 'Dental Cleaning', '2024-03-15 10:00:00+00'),
(1, 'Cavity Filling - Tooth 14', '2024-06-20 14:30:00+00'),
(1, 'Routine Checkup', '2024-09-10 09:00:00+00');

-- Patient 2: Carlo Strauss
INSERT INTO treatments (patient_id, treatment, created_at) VALUES
(2, 'Teeth Whitening', '2024-02-28 11:00:00+00'),
(2, 'Crown Installation - Tooth 7', '2024-05-15 15:00:00+00'),
(2, 'Periodontal Cleaning', '2024-08-22 10:30:00+00');

-- Patient 3: Juan Wagner
INSERT INTO treatments (patient_id, treatment, created_at) VALUES
(3, 'Root Canal - Tooth 19', '2024-01-10 13:00:00+00'),
(3, 'Follow-up Examination', '2024-04-05 09:30:00+00'),
(3, 'Dental Cleaning', '2024-07-18 11:00:00+00');

-- Patient 4: Emily Davis
INSERT INTO treatments (patient_id, treatment, created_at) VALUES
(4, 'Dental Examination', '2024-03-01 10:00:00+00'),
(4, 'Fluoride Treatment', '2024-06-12 14:00:00+00'),
(4, 'Tooth Extraction - Wisdom Tooth', '2024-09-05 15:30:00+00');

-- Patient 5: James Wilson
INSERT INTO treatments (patient_id, treatment, created_at) VALUES
(5, 'Cavity Filling - Tooth 30', '2024-02-14 11:30:00+00'),
(5, 'Dental Cleaning', '2024-05-20 10:00:00+00'),
(5, 'X-Ray and Consultation', '2024-08-15 13:00:00+00');

-- Patient 6: Sarah Johnson
INSERT INTO treatments (patient_id, treatment, created_at) VALUES
(6, 'Orthodontic Consultation', '2024-01-25 09:00:00+00'),
(6, 'Dental Cleaning', '2024-04-30 10:30:00+00'),
(6, 'Cavity Filling - Tooth 12', '2024-07-22 14:00:00+00');

-- Patient 7: Robert Brown
INSERT INTO treatments (patient_id, treatment, created_at) VALUES
(7, 'Root Canal - Tooth 3', '2024-03-08 14:30:00+00'),
(7, 'Crown Installation - Tooth 3', '2024-04-22 15:00:00+00'),
(7, 'Follow-up Checkup', '2024-08-01 11:00:00+00');

-- Patient 8: Maria Garcia
INSERT INTO treatments (patient_id, treatment, created_at) VALUES
(8, 'Dental Cleaning', '2024-02-05 10:00:00+00'),
(8, 'Cavity Filling - Tooth 18', '2024-05-10 13:30:00+00'),
(8, 'Teeth Whitening', '2024-09-12 14:00:00+00');

-- Patient 9: David Lee
INSERT INTO treatments (patient_id, treatment, created_at) VALUES
(9, 'Emergency Tooth Repair', '2024-01-15 16:00:00+00'),
(9, 'Dental Bridge Installation', '2024-03-20 10:30:00+00'),
(9, 'Routine Checkup', '2024-07-08 09:00:00+00');

-- Patient 10: Jennifer Taylor
INSERT INTO treatments (patient_id, treatment, created_at) VALUES
(10, 'Dental Cleaning', '2024-04-02 11:00:00+00'),
(10, 'Gum Treatment', '2024-06-18 14:30:00+00'),
(10, 'Cavity Filling - Tooth 21', '2024-09-20 10:00:00+00');

-- Patient 11 (if exists)
INSERT INTO treatments (patient_id, treatment, created_at) 
SELECT 11, 'Dental Examination', '2024-02-12 09:30:00+00'
WHERE EXISTS (SELECT 1 FROM patients WHERE id = 11);

INSERT INTO treatments (patient_id, treatment, created_at)
SELECT 11, 'Cavity Filling - Tooth 8', '2024-05-25 13:00:00+00'
WHERE EXISTS (SELECT 1 FROM patients WHERE id = 11);

INSERT INTO treatments (patient_id, treatment, created_at)
SELECT 11, 'Dental Cleaning', '2024-08-30 10:30:00+00'
WHERE EXISTS (SELECT 1 FROM patients WHERE id = 11);