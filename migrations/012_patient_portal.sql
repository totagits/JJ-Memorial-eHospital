CREATE TABLE patient_portal_accounts (
  username text PRIMARY KEY,
  patient_mrn uuid NOT NULL UNIQUE REFERENCES registry_patients(mrn),
  key_hash text NOT NULL
);
CREATE TABLE patient_portal_sessions (
  token_hash text PRIMARY KEY,
  username text NOT NULL REFERENCES patient_portal_accounts(username) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);
CREATE INDEX patient_portal_sessions_expiry ON patient_portal_sessions(expires_at);
