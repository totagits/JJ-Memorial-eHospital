CREATE TABLE security_checkpoint_status (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  checked_at timestamptz NOT NULL,
  state text NOT NULL CHECK (state IN ('verified','failed')),
  instance_id text NOT NULL,
  head_id bigint,
  head_hash text,
  object_key text,
  error_code text,
  CHECK (state <> 'verified' OR (head_id IS NOT NULL AND head_hash IS NOT NULL AND object_key IS NOT NULL))
);
