CREATE TABLE patient_visit_releases (
  visit_id uuid PRIMARY KEY REFERENCES clinician_encounters(visit_id),
  summary text NOT NULL CHECK (char_length(btrim(summary)) BETWEEN 1 AND 1500),
  encounter_type text NOT NULL CHECK (encounter_type IN ('OPD', 'EMERGENCY', 'INPATIENT', 'FOLLOWUP')),
  released_by text NOT NULL,
  released_at timestamptz NOT NULL DEFAULT now()
);
