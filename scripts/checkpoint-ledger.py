#!/usr/bin/env python3
"""Host-side staging-only checkpoint job. Requires Docker and existing Coolify R2 storage.

Usage: checkpoint-ledger.py EXPECTED_REGISTRY_INSTANCE_UUID
The instance must be pinned by the operator, never automatically replaced.
"""
import datetime
import json
import pathlib
import re
import subprocess
import sys

DATABASE_CONTAINER = 'insytwxzs6qbiaskyfltkjcr'
ZERO = '0' * 64


def run(args, body):
    result = subprocess.run(args, input=body, text=True, capture_output=True, timeout=90)
    if result.returncode:
        raise RuntimeError('command_failed')
    return result.stdout.strip()


def sql(query):
    # Check the target before every operation; password stays inside the container.
    command = ('test "$POSTGRES_DB" = jj_memorial_staging && '
               'export PGPASSWORD="$POSTGRES_PASSWORD" && '
               'exec psql -X -qAt -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"')
    return run(['docker', 'exec', '-i', DATABASE_CONTAINER, 'sh', '-c', command], query)


def remote(mode, checkpoint=None):
    php = pathlib.Path(__file__).with_name('checkpoint-r2.php').read_text()
    # Execute reviewed source through php -r; stdin carries checkpoint data only.
    return json.loads(run(['docker', 'exec', '-i', 'coolify', 'php', '-r', php.removeprefix('<?php')],
                          json.dumps({'mode': mode, 'checkpoint': checkpoint})))


def validate_anchor(checkpoint, instance):
    if not isinstance(checkpoint, dict) or checkpoint.get('schema') != 1 or checkpoint.get('instanceId') != instance:
        raise RuntimeError('checkpoint_identity_mismatch')
    head = checkpoint.get('headId')
    if not isinstance(head, str) or not re.fullmatch(r'0|[1-9][0-9]*', head) or int(head) > 9223372036854775807:
        raise RuntimeError('invalid_checkpoint_head')
    if not isinstance(checkpoint.get('headHash'), str) or not re.fullmatch('[0-9a-f]{64}', checkpoint['headHash']):
        raise RuntimeError('invalid_checkpoint_hash')
    if head == '0' and checkpoint['headHash'] != ZERO:
        raise RuntimeError('invalid_empty_checkpoint')
    return int(head)


def compare(snapshot, checkpoint, instance):
    if snapshot['instanceId'] != instance:
        raise RuntimeError('database_identity_mismatch')
    if snapshot['failures']:
        raise RuntimeError('ledger_chain_mismatch')
    if checkpoint is not None:
        head = validate_anchor(checkpoint, instance)
        if head and snapshot['anchorHash'] != checkpoint['headHash']:
            raise RuntimeError('external_checkpoint_mismatch')
        if int(snapshot['headId']) < head:
            raise RuntimeError('ledger_truncated')


def literal(value):
    return 'NULL' if value is None else "'" + str(value).replace("'", "''") + "'"


def record(instance, state, head=None, digest=None, key=None, error=None):
    values = ','.join(literal(v) for v in [state, instance, head, digest, key, error])
    sql('INSERT INTO security_checkpoint_status(singleton,checked_at,state,instance_id,head_id,head_hash,object_key,error_code) '
        'VALUES(true,clock_timestamp(),' + values + ') ON CONFLICT(singleton) DO UPDATE SET '
        'checked_at=EXCLUDED.checked_at,state=EXCLUDED.state,instance_id=EXCLUDED.instance_id,'
        'head_id=EXCLUDED.head_id,head_hash=EXCLUDED.head_hash,object_key=EXCLUDED.object_key,error_code=EXCLUDED.error_code;')


def main(instance, bootstrap=False):
    if not re.fullmatch('[0-9a-f-]{36}', instance):
        raise ValueError('Expected pinned registry instance UUID')
    try:
        latest = remote('latest')
        anchor = latest['checkpoint']
        if anchor is None and not bootstrap:
            raise RuntimeError('external_checkpoint_missing')
        anchor_id = validate_anchor(anchor, instance) if anchor is not None else 0
        # One MVCC snapshot: new events may append after this query without invalidating it.
        snapshot = json.loads(sql("""WITH checked AS (
          SELECT *, COALESCE(lag(entry_hash) OVER (ORDER BY id),repeat('0',64)) AS expected_previous,
            row_number() OVER (ORDER BY id) AS expected_id FROM security_ledger
        ) SELECT json_build_object(
          'instanceId',(SELECT instance_id FROM registry_instance WHERE singleton),
          'headId',COALESCE((SELECT id::text FROM checked ORDER BY id DESC LIMIT 1),'0'),
          'headHash',COALESCE((SELECT entry_hash FROM checked ORDER BY id DESC LIMIT 1),repeat('0',64)),
          'anchorHash',(SELECT entry_hash FROM checked WHERE id=""" + str(anchor_id) + """),
          'failures',count(*) FILTER (WHERE id <> expected_id OR previous_hash <> expected_previous OR entry_hash <>
            encode(digest(convert_to(jsonb_build_array(id,extract(epoch FROM occurred_at),actor,event,outcome,previous_hash)::text,'UTF8'),'sha256'),'hex'))
        ) FROM checked;"""))
        compare(snapshot, anchor, instance)
        checkpoint = {key: snapshot[key] for key in ('instanceId', 'headId', 'headHash')}
        checkpoint.update(schema=1, capturedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),
                          previousCheckpoint=latest['key'])
        saved = remote('put', checkpoint)
        record(instance, 'verified', checkpoint['headId'], checkpoint['headHash'], saved['key'])
        print('CHECKPOINT_VERIFIED head=' + checkpoint['headId'] + ' key=' + saved['key'])
    except Exception as error:
        code = str(error) if str(error) in {'checkpoint_identity_mismatch', 'invalid_checkpoint_head',
            'invalid_checkpoint_hash', 'invalid_empty_checkpoint', 'database_identity_mismatch',
            'ledger_chain_mismatch', 'external_checkpoint_mismatch', 'external_checkpoint_missing', 'ledger_truncated'} else 'checkpoint_unavailable'
        try:
            record(instance, 'failed', error=code)
        except Exception:
            pass  # Dashboard also expires old results if the database/job is unavailable.
        print('CHECKPOINT_FAILED ' + code, file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1], bootstrap='--bootstrap' in sys.argv[2:]))
