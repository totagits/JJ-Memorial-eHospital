CREATE TABLE virtual_visits (
  id uuid PRIMARY KEY,
  patient_mrn uuid NOT NULL REFERENCES registry_patients(mrn),
  reason text NOT NULL CHECK (char_length(btrim(reason)) BETWEEN 1 AND 500),
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','scheduled')),
  requested_at timestamptz NOT NULL DEFAULT now(),
  starts_at timestamptz,
  clinician text,
  scheduled_by text,
  scheduled_at timestamptz,
  CHECK ((status='requested' AND num_nonnulls(starts_at,clinician,scheduled_by,scheduled_at)=0)
      OR (status='scheduled' AND num_nonnulls(starts_at,clinician,scheduled_by,scheduled_at)=4))
);
CREATE UNIQUE INDEX virtual_visits_pending_patient ON virtual_visits (patient_mrn) WHERE status='requested';
CREATE INDEX virtual_visits_patient_date ON virtual_visits (patient_mrn,requested_at DESC,id);
