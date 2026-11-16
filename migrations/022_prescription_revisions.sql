ALTER TABLE encounter_prescriptions ADD COLUMN revision integer NOT NULL DEFAULT 1 CHECK (revision > 0);

CREATE TABLE prescription_revisions (
  work_id uuid NOT NULL REFERENCES encounter_prescriptions(work_id),
  revision integer NOT NULL CHECK (revision > 0),
  medication text NOT NULL,
  directions text NOT NULL,
  return_notes text NOT NULL,
  returned_by text NOT NULL,
  returned_at timestamptz NOT NULL,
  resubmitted_by text NOT NULL,
  resubmitted_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (work_id, revision)
);
