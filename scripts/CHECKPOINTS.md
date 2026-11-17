# Staging security ledger checkpoints

The host job runs every 15 minutes under a non-overlapping systemd timer. It uses the existing Coolify storage configuration for the private `jj-memorial-staging-backups` bucket. No R2 credentials are copied to the application or logs.

Install the two reviewed job files together in a root-owned directory. Pin the current `registry_instance.instance_id` in the systemd service argument. Apply migration 025 before running. The first operator-controlled run uses `--bootstrap`; regular scheduled runs must omit that flag. A missing remote checkpoint after bootstrap is an error, not permission to start a new history.

Each run reads the latest R2 checkpoint under `audit-checkpoints/jj-memorial-staging/`, verifies database identity, sequence, hashes and the anchored entry, then writes a unique JSON object and reads it back. Objects contain only schema version, time, instance ID, head ID/hash and the previous object's name. Database dump retention does not manage this separate prefix. The job never deletes or overwrites checkpoint objects.

The authenticated Management API reports the last job result and compares its anchor with the current database. Results expire after 30 minutes. The UI does not execute privileged operations or contact R2 directly. A manual hash-chain check refreshes the cached external status; it does not force a remote job.

Security boundary: this detects a database-only rewrite relative to retained R2 history. The same VPS administrator can access both the database and Coolify's R2 credentials. This is not immutable storage or independent administrator control. It cannot prove the absence of deleted R2 history or replace object locking / separate storage credentials and independent monitoring. The first checkpoint is a trust bootstrap, not retrospective proof.

Verification: `python scripts/test-checkpoint-ledger.py` tests append, rewrite, truncation, corruption, changed identity, untrusted object fields, missing checkpoints and provider failure. A deployment verification must also run the job twice against R2, confirm object readback and API status, and test corruption on an isolated restore database (never on the active ledger).
