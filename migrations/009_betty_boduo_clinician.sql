ALTER TABLE registry_staff DROP CONSTRAINT registry_staff_clinician_id_check;
ALTER TABLE registry_staff ADD CHECK (clinician_id IN ('USR-001','USR-002','USR-BETTY-BODUO'));
