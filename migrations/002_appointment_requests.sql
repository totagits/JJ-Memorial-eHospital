CREATE TABLE appointment_requests (
  id uuid PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL,
  email text,
  department text NOT NULL,
  clinician_id text,
  requested_date date NOT NULL,
  requested_time text NOT NULL,
  reason text NOT NULL,
  patient_mrn uuid REFERENCES registry_patients(mrn),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','contacted','closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX appointment_requests_queue ON appointment_requests (status, created_at DESC, id);
CREATE INDEX appointment_requests_patient ON appointment_requests (patient_mrn);

CREATE TABLE appointment_request_audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  request_id uuid NOT NULL REFERENCES appointment_requests(id),
  actor text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending','contacted','closed')),
  patient_mrn uuid REFERENCES registry_patients(mrn),
  occurred_at timestamptz NOT NULL DEFAULT now()
);
