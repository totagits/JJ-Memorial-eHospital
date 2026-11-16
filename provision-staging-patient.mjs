import { createHash, randomBytes } from 'node:crypto';
import pg from 'pg';

const [username, mrn, ...extra] = process.argv.slice(2);
const host = 'jjmemorial-staging.totag.network';
const connectionString = process.env.DATABASE_URL;
if (!/^[a-z0-9._-]{3,64}$/.test(username ?? '') ||
    !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(mrn ?? '') || extra.length ||
    !connectionString || !(process.env.COOLIFY_FQDN === host || process.env.COOLIFY_URL === 'https://' + host) ||
    new URL(connectionString).pathname !== '/jj_memorial_staging') {
  console.error('Run in the staging app container: node provision-staging-patient.mjs <username> <synthetic-mrn>');
  process.exit(2);
}

const key = randomBytes(32).toString('hex');
const database = new pg.Client({ connectionString, connectionTimeoutMillis: 5000 });
try {
  await database.connect();
  const linked = await database.query(
    "INSERT INTO patient_portal_accounts(username,patient_mrn,key_hash) SELECT $1,mrn,$3 FROM registry_patients WHERE mrn=$2 AND first_name='Synthetic'",
    [username, mrn, createHash('sha256').update(key).digest('hex')],
  );
  if (!linked.rowCount) throw new Error('Synthetic record not found.');
  console.log('Patient account created:', username);
  console.log('Access key (shown once):', key);
} catch (error) {
  console.error(error.code === '23505' ? 'Username or patient record already linked.' :
    error.message === 'Synthetic record not found.' ? error.message : 'Patient provisioning failed.');
  process.exitCode = 1;
} finally { await database.end().catch(() => {}); }
