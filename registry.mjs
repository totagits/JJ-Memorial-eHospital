import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import express from 'express';

const migrations = ['001_patient_registry.sql', '002_appointment_requests.sql'];
const departments = new Set(['Internal Medicine & OPD', 'Pediatrics & Child Wellness',
  'Maternal & Prenatal Health', 'Cardiology & Chronic Care', 'General Surgery Consult']);
const clinicians = new Set(['USR-001', 'USR-002']);
const times = new Set(['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM']);
const maxText = (value, limit) => typeof value === 'string' && value === value.trim()
  && value.length <= limit && !value.includes('\0');
const cookie = '__Host-jj_registry';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const hash = value => createHash('sha256').update(value).digest('hex');
const cookieOptions = { httpOnly: true, secure: true, sameSite: 'strict', path: '/' };

async function transaction(database, operation) {
  const client = await database.connect();
  try {
    await client.query('BEGIN');
    const result = await operation(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

export async function migrateRegistry(database) {
  await transaction(database, async client => {
    await client.query('SELECT pg_advisory_xact_lock(5728101)');
    await client.query('CREATE TABLE IF NOT EXISTS registry_migrations (version integer PRIMARY KEY)');
    const { rows } = await client.query('SELECT version FROM registry_migrations');
    const applied = new Set(rows.map(row => row.version));
    for (const [index, file] of migrations.entries()) {
      const version = index + 1;
      if (applied.has(version)) continue;
      await client.query(await readFile(new URL('./migrations/' + file, import.meta.url), 'utf8'));
      await client.query('INSERT INTO registry_migrations VALUES ($1)', [version]);
    }
  });
}

export function registryRoutes(database, origin) {
  const router = express.Router();
  router.use(express.json({ limit: '4kb' }));
  router.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    if (!database || !origin) return res.sendStatus(503);
    if (req.method === 'POST' && req.get('origin') !== origin) return res.sendStatus(403);
    next();
  });

  const route = handler => (req, res, next) => handler(req, res).catch(next);
  const sessionHash = req => {
    const token = (req.get('cookie') || '').match(/(?:^|;\s*)__Host-jj_registry=([0-9a-f]{64})(?:;|$)/)?.[1];
    return token ? hash(token) : null;
  };

  router.post('/session', route(async (req, res) => {
    const { username, accessKey } = req.body ?? {};
    if (typeof username !== 'string' || !/^[a-z0-9._-]{3,64}$/.test(username) ||
        typeof accessKey !== 'string' || !/^[0-9a-f]{64}$/.test(accessKey)) return res.sendStatus(401);
    const { rows: [staff] } = await database.query(
      'SELECT username, role FROM registry_staff WHERE username=$1 AND password_hash=$2',
      [username, hash(accessKey)],
    );
    if (!staff) return res.sendStatus(401);
    const token = randomBytes(32).toString('hex');
    await transaction(database, async client => {
      await client.query('DELETE FROM registry_sessions WHERE expires_at <= now() OR token_hash=$1', [sessionHash(req)]);
      await client.query(
        "INSERT INTO registry_sessions VALUES ($1,$2,now()+interval '8 hours')", [hash(token), staff.username],
      );
    });
    res.cookie(cookie, token, { ...cookieOptions, maxAge: 8 * 3600 * 1000 }).json(staff);
  }));

  router.post('/appointments', route(async (req, res) => {
    const { id, firstName, lastName, phone, email, department, clinicianId, date, timeSlot, reason } = req.body ?? {};
    const parsed = typeof date === 'string' ? new Date(date) : new Date(NaN);
    const validDate = Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
    const today = new Date().toISOString().slice(0, 10);
    const horizon = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);
    if (typeof id !== 'string' || !uuid.test(id) ||
        !maxText(firstName, 80) || !firstName || !maxText(lastName, 80) || !lastName ||
        !maxText(phone, 32) || !/^[+0-9 ().-]+$/.test(phone) || !/^\d{7,15}$/.test(phone.replace(/\D/g, '')) ||
        !maxText(email, 254) || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ||
        !departments.has(department) || (clinicianId !== '' && !clinicians.has(clinicianId)) ||
        !validDate || date < today || date > horizon || !times.has(timeSlot) ||
        !maxText(reason, 500) || !reason) return res.sendStatus(400);
    await transaction(database, async client => {
      const result = await client.query(
        'INSERT INTO appointment_requests (id,first_name,last_name,phone,email,department,clinician_id,requested_date,requested_time,reason) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (id) DO NOTHING',
        [id, firstName, lastName, phone, email || null, department, clinicianId || null, date, timeSlot, reason],
      );
      if (result.rowCount) await client.query(
        "INSERT INTO appointment_request_audit (request_id,actor,status) VALUES ($1,'public','pending')", [id],
      );
    });
    res.status(202).json({ id, status: 'received' });
  }));

  router.use((req, res, next) => {
    database.query(
      'SELECT s.username, s.role FROM registry_sessions t JOIN registry_staff s USING (username) WHERE t.token_hash=$1 AND t.expires_at>now()',
      [sessionHash(req)],
    ).then(({ rows: [staff] }) => {
      if (!staff) return res.sendStatus(401);
      res.locals.staff = staff;
      next();
    }).catch(next);
  });
  router.get('/session', (_req, res) => res.json(res.locals.staff));
  router.post('/logout', route(async (req, res) => {
    await database.query('DELETE FROM registry_sessions WHERE token_hash=$1', [sessionHash(req)]);
    res.clearCookie(cookie, cookieOptions).sendStatus(204);
  }));

  router.post('/patients', route(async (req, res) => {
    const { username, role } = res.locals.staff;
    if (role !== 'registrar') return res.sendStatus(403);
    const { firstName, lastName, birthDate } = req.body ?? {};
    if (![firstName, lastName].every(name => typeof name === 'string' && name.trim().length > 0 && name.trim().length <= 80) ||
        typeof birthDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return res.sendStatus(400);
    const parsed = new Date(birthDate);
    if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== birthDate ||
        birthDate < '1900-01-01' || parsed > new Date()) return res.sendStatus(400);
    const patient = await transaction(database, async client => {
      const mrn = randomUUID();
      const { rows: [record] } = await client.query(
        'INSERT INTO registry_patients (mrn,first_name,last_name,birth_date) VALUES ($1,$2,$3,$4) RETURNING mrn, first_name AS "firstName", last_name AS "lastName", birth_date::text AS "birthDate"',
        [mrn, firstName.trim(), lastName.trim(), birthDate],
      );
      await client.query("INSERT INTO registry_audit (actor,action,mrn) VALUES ($1,'registered',$2)", [username, mrn]);
      return record;
    });
    res.status(201).json(patient);
  }));
  router.get('/patients/:mrn', route(async (req, res) => {
    const { username, role } = res.locals.staff;
    if (role !== 'registrar' && role !== 'viewer') return res.sendStatus(403);
    if (!uuid.test(req.params.mrn)) return res.sendStatus(400);
    const patient = await transaction(database, async client => {
      const { rows: [record] } = await client.query(
        'SELECT mrn, first_name AS "firstName", last_name AS "lastName", birth_date::text AS "birthDate" FROM registry_patients WHERE mrn=$1',
        [req.params.mrn],
      );
      if (record) await client.query("INSERT INTO registry_audit (actor,action,mrn) VALUES ($1,'viewed',$2)", [username, record.mrn]);
      return record;
    });
    if (!patient) return res.sendStatus(404);
    res.json(patient);
  }));
  router.get('/appointments', route(async (_req, res) => {
    if (res.locals.staff.role !== 'registrar') return res.sendStatus(403);
    const { rows } = await database.query(
      `SELECT id, first_name AS "firstName", last_name AS "lastName", phone, email, department, clinician_id AS "clinicianId",
        requested_date::text AS date, requested_time AS "timeSlot", reason, patient_mrn AS "patientMrn", status
       FROM appointment_requests WHERE status IN ('pending','contacted')
       ORDER BY CASE WHEN status='pending' THEN 0 ELSE 1 END, created_at DESC, id LIMIT 50`,
    );
    res.json(rows);
  }));
  router.post('/appointments/:id/review', route(async (req, res) => {
    const { username, role } = res.locals.staff;
    if (role !== 'registrar') return res.sendStatus(403);
    const { id } = req.params;
    const { status, patientMrn } = req.body ?? {};
    if (!uuid.test(id) || !['contacted', 'closed'].includes(status) ||
        (patientMrn !== '' && (typeof patientMrn !== 'string' || !uuid.test(patientMrn)))) return res.sendStatus(400);
    const result = await transaction(database, async client => {
      const { rows: [current] } = await client.query(
        'SELECT status, patient_mrn FROM appointment_requests WHERE id=$1 FOR UPDATE', [id],
      );
      if (!current) return 404;
      const mrn = patientMrn || current.patient_mrn;
      if (current.status === status && current.patient_mrn === mrn) return 204;
      if (current.status === 'closed') return 409;
      if (mrn && !(await client.query('SELECT 1 FROM registry_patients WHERE mrn=$1', [mrn])).rowCount) return 400;
      await client.query('UPDATE appointment_requests SET status=$2, patient_mrn=$3 WHERE id=$1', [id, status, mrn]);
      await client.query(
        'INSERT INTO appointment_request_audit (request_id,actor,status,patient_mrn) VALUES ($1,$2,$3,$4)', [id, username, status, mrn],
      );
      return 204;
    });
    res.sendStatus(result);
  }));
  router.use((_req, res) => res.sendStatus(404));
  router.use((error, _req, res, _next) => {
    if (error.status === 400 || error.status === 413) return res.sendStatus(error.status);
    console.error('Patient registry request failed');
    res.sendStatus(503);
  });
  return router;
}
