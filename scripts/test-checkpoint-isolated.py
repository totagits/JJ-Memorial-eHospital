"""Destructive tamper simulation, restricted to the explicitly named disposable test DB."""
import importlib.util
import json
import pathlib

spec = importlib.util.spec_from_file_location('checkpoint', pathlib.Path(__file__).with_name('checkpoint-ledger.py'))
job = importlib.util.module_from_spec(spec)
spec.loader.exec_module(job)
target = 'jj_memorial_checkpoint_test_20261117'
command = ('test "$POSTGRES_DB" = jj_memorial_staging && export PGPASSWORD="$POSTGRES_PASSWORD" && '
           'exec psql -X -qAt -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d ' + target)
job.sql = lambda query: job.run(['docker', 'exec', '-i', job.DATABASE_CONTAINER, 'sh', '-c', command], query)
assert job.sql('SELECT current_database();') == target
instance = job.sql('SELECT instance_id FROM registry_instance WHERE singleton;')
job.sql("ALTER TABLE security_ledger DISABLE TRIGGER USER; UPDATE security_ledger SET actor='isolated-tamper-test' WHERE id=1;")
assert job.main(instance) == 1
assert job.sql('SELECT error_code FROM security_checkpoint_status;') == 'ledger_chain_mismatch'
print('PASS: isolated content corruption rejected')
job.sql("""DO $$ DECLARE r record; prior text := repeat('0',64); next_hash text;
BEGIN
  FOR r IN SELECT * FROM security_ledger ORDER BY id LOOP
    next_hash := encode(digest(convert_to(jsonb_build_array(r.id,extract(epoch FROM r.occurred_at),r.actor,r.event,r.outcome,prior)::text,'UTF8'),'sha256'),'hex');
    UPDATE security_ledger SET previous_hash=prior,entry_hash=next_hash WHERE id=r.id;
    prior := next_hash;
  END LOOP;
END $$;
ALTER TABLE security_ledger ENABLE TRIGGER USER;""")
assert job.main(instance) == 1
assert job.sql('SELECT error_code FROM security_checkpoint_status;') == 'external_checkpoint_mismatch'
print('PASS: internally consistent rewrite rejected against retained R2 checkpoint')
