CREATE TABLE clinician_slots (
  id uuid PRIMARY KEY,
  clinician_id text NOT NULL,
  starts_at timestamptz NOT NULL,
  UNIQUE (clinician_id, starts_at)
);

CREATE TABLE scheduled_visits (
  id uuid PRIMARY KEY,
  request_id uuid NOT NULL UNIQUE REFERENCES appointment_requests(id),
  slot_id uuid NOT NULL UNIQUE REFERENCES clinician_slots(id),
  patient_mrn uuid NOT NULL REFERENCES registry_patients(mrn),
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','waiting_for_triage')),
  scheduled_by text NOT NULL,
  scheduled_at timestamptz NOT NULL DEFAULT now(),
  checked_in_by text,
  checked_in_at timestamptz
);
CREATE INDEX scheduled_visits_patient ON scheduled_visits (patient_mrn);
