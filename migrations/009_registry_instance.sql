CREATE TABLE registry_instance (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  instance_id text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
