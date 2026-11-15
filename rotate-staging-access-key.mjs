import { createHash, randomBytes } from 'node:crypto';
import pg from 'pg';

const [username] = process.argv.slice(2);

if (!/^[a-z0-9._-]{3,64}$/.test(username ?? '')) {
  console.error('Usage: node rotate-staging-access-key.mjs <username>');
  process.exit(2);
}

const stagingHost = 'jjmemorial-staging.totag.network';
const connectionString = process.env.DATABASE_URL;
if (!connectionString ||
    !(process.env.COOLIFY_FQDN === stagingHost || process.env.COOLIFY_URL === 'https://' + stagingHost) ||
    new URL(connectionString).pathname !== '/jj_memorial_staging') {
  console.error('Run from the J & J Memorial staging app container with its staging database.');
  process.exit(2);
}

const key = randomBytes(32).toString('hex');
const passwordHash = createHash('sha256').update(key).digest('hex');
const database = new pg.Client({ connectionString, connectionTimeoutMillis: 5000 });

try {
  await database.connect();
  await database.query('BEGIN');

  const updated = await database.query(
    'UPDATE registry_staff SET password_hash=$2 WHERE username=$1',
    [username, passwordHash],
  );
  if (!updated.rowCount) {
    await database.query('ROLLBACK');
    console.error('Account not found:', username);
    process.exitCode = 1;
  } else {
    await database.query('DELETE FROM registry_sessions WHERE username=$1', [username]);
    await database.query('COMMIT');
    console.log('Access key rotated for:', username);
    console.log('New access key (shown once):', key);
  }
} catch (error) {
  await database.query('ROLLBACK').catch(() => {});
  console.error('Access key rotation failed.');
  process.exitCode = 1;
} finally {
  await database.end().catch(() => {});
}
