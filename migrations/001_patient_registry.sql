CREATE TABLE registry_staff (
  username text PRIMARY KEY,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('registrar', 'viewer', 'restricted'))
);

CREATE TABLE registry_sessions (
  token_hash text PRIMARY KEY,
  username text NOT NULL REFERENCES registry_staff ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);

CREATE TABLE registry_patients (
  mrn uuid PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  birth_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE registry_audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor text NOT NULL,
  action text NOT NULL CHECK (action IN ('registered', 'viewed')),
  mrn uuid NOT NULL REFERENCES registry_patients,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
