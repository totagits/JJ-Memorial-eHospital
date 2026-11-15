import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import express from 'express';

const migration = new URL('./migrations/001_patient_registry.sql', import.meta.url);
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
    const applied = await client.query('SELECT 1 FROM registry_migrations WHERE version = 1');
    if (applied.rowCount) return;
    await client.query(await readFile(migration, 'utf8'));
    await client.query('INSERT INTO registry_migrations VALUES (1)');
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
  router.use((_req, res) => res.sendStatus(404));
  router.use((error, _req, res, _next) => {
    if (error.status === 400 || error.status === 413) return res.sendStatus(error.status);
    console.error('Patient registry request failed');
    res.sendStatus(503);
  });
  return router;
}
