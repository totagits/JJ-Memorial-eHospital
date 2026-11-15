ALTER TABLE registry_staff DROP CONSTRAINT registry_staff_role_check;
ALTER TABLE registry_staff ADD CHECK (role IN ('registrar','viewer','restricted','triage','clinician','nurse','lab_technician','lab_reviewer','pharmacist'));

CREATE TABLE department_work_items (
  id uuid PRIMARY KEY,
  visit_id uuid NOT NULL REFERENCES clinician_encounters(visit_id),
  department_code text NOT NULL REFERENCES hospital_departments(code),
  instruction text NOT NULL CHECK (char_length(instruction) BETWEEN 1 AND 1500),
  state text NOT NULL DEFAULT 'pending' CHECK (state IN ('pending','recorded','completed')),
  requested_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (visit_id, department_code)
);
CREATE INDEX department_work_items_queue ON department_work_items (department_code, state, requested_at);
CREATE TABLE department_work_events (
  work_id uuid NOT NULL REFERENCES department_work_items(id),
  state text NOT NULL CHECK (state IN ('recorded','completed')),
  notes text NOT NULL CHECK (char_length(notes) BETWEEN 1 AND 1500),
  actor text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (work_id, state)
);
