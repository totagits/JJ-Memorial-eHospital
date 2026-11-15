ALTER TABLE registry_staff DROP CONSTRAINT registry_staff_role_check;
ALTER TABLE registry_staff ADD CHECK (role IN ('registrar','viewer','restricted','triage'));
ALTER TABLE scheduled_visits DROP CONSTRAINT scheduled_visits_status_check;
ALTER TABLE scheduled_visits ADD CHECK (status IN ('scheduled','waiting_for_triage','triaged'));
CREATE TABLE triage_assessments (
  visit_id uuid PRIMARY KEY REFERENCES scheduled_visits(id),
  notes text NOT NULL CHECK (char_length(notes) BETWEEN 1 AND 2000),
  recorded_by text NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now()
);
