CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE security_ledger (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  occurred_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  actor text NOT NULL,
  event text NOT NULL,
  outcome text NOT NULL,
  previous_hash text NOT NULL,
  entry_hash text NOT NULL
);
CREATE FUNCTION chain_security_event() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE prior text; prior_id bigint;
BEGIN
  PERFORM pg_advisory_xact_lock(5728124);
  SELECT entry_hash,id INTO prior,prior_id FROM security_ledger ORDER BY id DESC LIMIT 1;
  NEW.id := COALESCE(prior_id,0)+1;
  NEW.previous_hash := COALESCE(prior,repeat('0',64));
  NEW.entry_hash := encode(digest(convert_to(jsonb_build_array(NEW.id,extract(epoch FROM NEW.occurred_at),NEW.actor,NEW.event,NEW.outcome,NEW.previous_hash)::text,'UTF8'),'sha256'),'hex');
  RETURN NEW;
END $$;
CREATE TRIGGER security_event_chain BEFORE INSERT ON security_ledger FOR EACH ROW EXECUTE FUNCTION chain_security_event();
CREATE FUNCTION prevent_security_event_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Security ledger entries are append only'; END $$;
CREATE TRIGGER security_event_immutable BEFORE UPDATE OR DELETE OR TRUNCATE ON security_ledger FOR EACH STATEMENT EXECUTE FUNCTION prevent_security_event_change();
