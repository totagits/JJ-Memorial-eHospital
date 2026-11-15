CREATE TABLE hospital_departments (
  code text PRIMARY KEY,
  name text NOT NULL UNIQUE
);
INSERT INTO hospital_departments VALUES
 ('opd','Internal Medicine / OPD'), ('emergency','Emergency & Triage'),
 ('maternal','Maternal & Women''s Health'), ('pediatrics','Pediatrics & Child Health'),
 ('nursing','Nursing Services'), ('lab','Diagnostic Laboratory'),
 ('pharmacy','Pharmacy & Therapeutics'), ('cardiology','Cardiology & Chronic Care'),
 ('surgery','General Surgery');

CREATE TABLE appointment_department_map (
  request_department text PRIMARY KEY,
  department_code text NOT NULL REFERENCES hospital_departments(code)
);
INSERT INTO appointment_department_map VALUES
 ('Internal Medicine & OPD','opd'), ('Pediatrics & Child Wellness','pediatrics'),
 ('Maternal & Prenatal Health','maternal'), ('Cardiology & Chronic Care','cardiology'),
 ('General Surgery Consult','surgery');

ALTER TABLE appointment_requests ADD CONSTRAINT appointment_department_fk
 FOREIGN KEY (department) REFERENCES appointment_department_map(request_department);

CREATE TABLE staff_department_memberships (
  username text NOT NULL REFERENCES registry_staff(username) ON DELETE CASCADE,
  department_code text NOT NULL REFERENCES hospital_departments(code),
  role text NOT NULL CHECK (role IN ('triage','clinician','nurse','lab_technician','lab_reviewer','pharmacist')),
  PRIMARY KEY (username, department_code, role)
);
