import { createHash, randomBytes } from 'node:crypto';
import pg from 'pg';

const [username, role, ...assignments] = process.argv.slice(2);
const roles = new Set(['registrar', 'viewer', 'restricted', 'triage', 'clinician',
  'nurse', 'lab_technician', 'lab_reviewer', 'pharmacist', 'super_admin', 'cashier', 'billing']);
const departmentForRole = new Map([
  ['nurse', 'nursing'], ['lab_technician', 'lab'], ['lab_reviewer', 'lab'], ['pharmacist', 'pharmacy'],
]);
const clinicianId = role === 'clinician' ? assignments.shift() : null;
const departments = [...new Set(assignments)];
const scoped = departmentForRole.has(role) || role === 'triage' || role === 'clinician';

if (!/^[a-z0-9._-]{3,64}$/.test(username ?? '') || !roles.has(role) ||
    (role === 'clinician' && !['USR-001', 'USR-002', 'USR-BETTY-BODUO'].includes(clinicianId)) ||
    (clinicianId === 'USR-BETTY-BODUO' && (departments.length !== 1 || departments[0] !== 'opd')) ||
    scoped !== Boolean(departments.length) ||
    (departmentForRole.has(role) && (departments.length !== 1 || departments[0] !== departmentForRole.get(role))) ||
    departments.some(code => !/^[a-z]+$/.test(code))) {
  console.error('Usage: node provision-staging-staff.mjs <username> <role> [clinician-id] [department-code ...]');
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
const hash = createHash('sha256').update(key).digest('hex');
const database = new pg.Client({ connectionString, connectionTimeoutMillis: 5000 });
try {
  await database.connect();
  await database.query('BEGIN');
  await database.query('INSERT INTO registry_staff(username,password_hash,role,clinician_id) VALUES ($1,$2,$3,$4)',
    [username, hash, role, clinicianId]);
  if (departments.length) {
    await database.query(
      'INSERT INTO staff_department_memberships(username,department_code,role) SELECT $1, code, $2 FROM unnest($3::text[]) AS code',
      [username, role, departments],
    );
  }
  await database.query('COMMIT');
  console.log('Account created:', username);
  console.log('Access key (shown once):', key);
} catch (error) {
  await database.query('ROLLBACK').catch(() => {});
  console.error(error.code === '23505' ? 'That username already exists.' :
    error.code === '23503' ? 'A department code was not found.' : 'Staff provisioning failed.');
  process.exitCode = 1;
} finally {
  await database.end().catch(() => {});
}
