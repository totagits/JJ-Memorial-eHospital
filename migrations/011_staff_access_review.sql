ALTER TABLE registry_staff DROP CONSTRAINT registry_staff_role_check;
ALTER TABLE registry_staff ADD CHECK (role IN ('registrar','viewer','restricted','triage','clinician','nurse','lab_technician','lab_reviewer','pharmacist','super_admin'));
