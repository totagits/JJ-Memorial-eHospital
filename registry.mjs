import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import express from 'express';

const migrations = ['001_patient_registry.sql', '002_appointment_requests.sql', '003_clinician_schedule.sql', '004_triage.sql', '005_clinician_encounters.sql', '006_notification_outbox.sql', '007_department_memberships.sql', '008_department_workspaces.sql', '009_registry_instance.sql', '010_betty_boduo_clinician.sql', '011_staff_access_review.sql', '012_patient_portal.sql', '013_appointment_changes.sql', '014_appointment_notification_events.sql', '015_patient_lab_releases.sql', '016_patient_visit_releases.sql', '017_prescriptions.sql', '018_patient_billing.sql', '019_billing_role.sql', '020_virtual_visits.sql', '021_patient_vitals.sql', '022_prescription_revisions.sql', '023_management_role.sql', '024_security_ledger.sql', '025_security_checkpoints.sql'];
const departments = new Set(['Internal Medicine & OPD', 'Pediatrics & Child Wellness',
  'Maternal & Prenatal Health', 'Cardiology & Chronic Care', 'General Surgery Consult']);
const clinicians = new Set(['USR-001', 'USR-002']);
const schedulableClinicians = new Set([...clinicians, 'USR-BETTY-BODUO']);
const times = new Set(['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM']);
const maxText = (value, limit) => typeof value === 'string' && value === value.trim()
  && value.length <= limit && !value.includes('\0');
const cookie = '__Host-jj_registry';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const hash = value => createHash('sha256').update(value).digest('hex');
const cookieOptions = { httpOnly: true, secure: true, sameSite: 'strict', path: '/' };
// Management gets audit metadata only; patient references are masked.
const managementAuditSql = `WITH events AS (
  SELECT 'SEC-' || l.id AS id,l.occurred_at AS "occurredAt",l.actor,l.event AS action,l.outcome,
    CASE WHEN l.event='staff_login' THEN 'login' WHEN l.event LIKE '%_export' THEN 'export' ELSE 'other' END AS category,
    'Security' AS module,'Security ledger' AS source,NULL::text AS "patientReference"
  FROM security_ledger l
  UNION ALL
  SELECT 'REG-' || a.id,a.occurred_at,a.actor,a.action,'success',
    CASE WHEN a.action='viewed' THEN 'access' ELSE 'registration' END,
    'Patient registry','Operational audit','…' || right(a.mrn::text,8)
  FROM registry_audit a
), enriched AS (
  SELECT e.*,s.role AS "currentRole" FROM events e LEFT JOIN registry_staff s ON s.username=e.actor
)`;

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
    await client.query(
      'INSERT INTO registry_instance(singleton, instance_id) VALUES (true, $1) ON CONFLICT (singleton) DO NOTHING',
      [randomUUID()],
    );
  });
}

const departmentWork = new Map([
  ['nurse', { department: 'nursing', from: 'pending', to: 'completed' }],
  ['lab_technician', { department: 'lab', from: 'pending', to: 'recorded' }],
  ['lab_reviewer', { department: 'lab', from: 'recorded', to: 'completed' }],
  ['pharmacist', { department: 'pharmacy', from: 'pending', to: 'completed' }],
]);
const orderDepartments = ['nursing', 'lab', 'pharmacy'];

const staffPermissions = new Map([
  ['registrar', new Set(['patients:read', 'patients:create', 'appointments:manage', 'schedule:manage'])],
  ['viewer', new Set(['patients:read'])],
  ['triage', new Set(['triage:manage'])],
  ['clinician', new Set(['encounters:assigned'])],
  ['management', new Set(['management:read'])],
  ['cashier', new Set(['billing:read', 'billing:payment'])],
  ['billing', new Set(['billing:read', 'billing:issue'])],
  ...Array.from(departmentWork.keys(), role => [role, new Set(['department:work'])]),
  ['restricted', new Set()],
  ['super_admin', new Set(['staff:review', 'management:read'])],
]);

function requirePermission(permission) {
  return (_req, res, next) => {
    if (!staffPermissions.get(res.locals.staff?.role)?.has(permission)) return res.sendStatus(403);
    next();
  };
}

export function registryRoutes(database, origin) {
  const router = express.Router();
  router.use(express.json({ limit: '16kb' }));
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

  const portalCookie = '__Host-jj_patient';
  const portalSession = req => {
    const token = (req.get('cookie') || '').match(/(?:^|;\s*)__Host-jj_patient=([0-9a-f]{64})(?:;|$)/)?.[1];
    return token ? hash(token) : null;
  };
  router.post('/patient-portal/session', route(async (req, res) => {
    const { username, accessKey } = req.body ?? {};
    if (typeof username !== 'string' || !/^[a-z0-9._-]{3,64}$/.test(username) ||
        typeof accessKey !== 'string' || !/^[0-9a-f]{64}$/.test(accessKey)) return res.sendStatus(401);
    const token = randomBytes(32).toString('hex');
    const signedIn = await transaction(database, async client => {
      const account = await client.query(
        'SELECT 1 FROM patient_portal_accounts WHERE username=$1 AND key_hash=$2 FOR SHARE', [username, hash(accessKey)],
      );
      if (!account.rowCount) return false;
      await client.query('DELETE FROM patient_portal_sessions WHERE expires_at<=now() OR token_hash=$1', [portalSession(req)]);
      await client.query("INSERT INTO patient_portal_sessions VALUES($1,$2,now()+interval '1 hour')", [hash(token), username]);
      return true;
    });
    if (!signedIn) return res.sendStatus(401);
    res.cookie(portalCookie, token, { ...cookieOptions, maxAge: 3600000 }).sendStatus(204);
  }));

  router.get('/patient-portal/me', route(async (req, res) => {
    if (Object.keys(req.query).length) return res.sendStatus(400);
    const profile = await transaction(database, async client => {
      const { rows: [patient] } = await client.query(
        `SELECT a.username, p.mrn, p.first_name AS "firstName", p.last_name AS "lastName"
         FROM patient_portal_sessions t JOIN patient_portal_accounts a USING(username)
         JOIN registry_patients p ON p.mrn=a.patient_mrn WHERE t.token_hash=$1 AND t.expires_at>now()
         FOR SHARE OF a`, [portalSession(req)],
      );
      if (!patient) return null;
      const { rows: appointments } = await client.query(
        `SELECT v.id,r.department,s.starts_at AS "startsAt",v.status,
                (SELECT json_build_object('kind',c.kind,'status',c.status)
                   FROM appointment_changes c WHERE c.visit_id=v.id
                   ORDER BY c.requested_at DESC,c.id LIMIT 1) AS "change"
         FROM scheduled_visits v JOIN clinician_slots s ON s.id=v.slot_id
         JOIN appointment_requests r ON r.id=v.request_id
         WHERE v.patient_mrn=$1 AND v.status IN ('scheduled','cancelled') AND s.starts_at>=now()
         ORDER BY s.starts_at,v.id LIMIT 50`, [patient.mrn],
      );
      await client.query("INSERT INTO registry_audit(actor,action,mrn) VALUES($1,'viewed',$2)", ['patient:' + patient.username, patient.mrn]);
      delete patient.username;
      const { rows: labResults } = await client.query(
        `SELECT w.id,r.summary,r.released_at AS "releasedAt"
         FROM patient_lab_releases r JOIN department_work_items w ON w.id=r.work_id
         JOIN scheduled_visits v ON v.id=w.visit_id
         WHERE v.patient_mrn=$1 AND w.department_code='lab' AND w.state='completed'
         ORDER BY r.released_at DESC,w.id LIMIT 50`, [patient.mrn],
      );
      const { rows: visits } = await client.query(
        `SELECT v.id, a.department, r.encounter_type AS "encounterType",
                e.recorded_at AS "encounterAt", r.summary, r.released_at AS "releasedAt"
         FROM patient_visit_releases r JOIN clinician_encounters e USING(visit_id)
         JOIN scheduled_visits v ON v.id=e.visit_id JOIN appointment_requests a ON a.id=v.request_id
         WHERE v.patient_mrn=$1 AND v.status='completed'
         ORDER BY e.recorded_at DESC,v.id LIMIT 100`, [patient.mrn],
      );
      const { rows: prescriptions } = await client.query(
        `SELECT w.id, rx.medication, rx.directions, rx.status
         FROM encounter_prescriptions rx JOIN department_work_items w ON w.id=rx.work_id
         JOIN scheduled_visits v ON v.id=w.visit_id
         WHERE v.patient_mrn=$1 AND v.status='completed'
           AND rx.status IN ('dispensed','clarification')
         ORDER BY w.requested_at DESC,w.id LIMIT 100`, [patient.mrn]);
      const { rows: invoices } = await client.query(
        `SELECT i.id, i.currency, i.description, i.amount_minor AS "amountMinor", i.issued_at AS "issuedAt",
                r.id AS "receiptId", r.recorded_at AS "paidAt"
         FROM staging_invoices i LEFT JOIN staging_receipts r ON r.invoice_id=i.id
         WHERE i.patient_mrn=$1 ORDER BY i.issued_at DESC,i.id LIMIT 100`, [patient.mrn]);
      const { rows: virtualVisits } = await client.query(
        `SELECT id, reason, status, requested_at AS "requestedAt", starts_at AS "startsAt"
         FROM virtual_visits WHERE patient_mrn=$1 ORDER BY requested_at DESC,id LIMIT 50`, [patient.mrn]);
      const { rows: vitals } = await client.query(
        `SELECT w.id, r.temperature_c::float8 AS "temperatureC", r.pulse_bpm AS "pulseBpm",
                r.recorded_at AS "recordedAt"
         FROM patient_vital_readings r JOIN department_work_items w ON w.id=r.work_id
         JOIN scheduled_visits v ON v.id=w.visit_id WHERE v.patient_mrn=$1
         ORDER BY r.recorded_at DESC,w.id LIMIT 100`, [patient.mrn]);
      return { ...patient, appointments, labResults, visits, prescriptions, invoices, virtualVisits, vitals };
    });
    if (!profile) return res.sendStatus(401);
    res.json(profile);
  }));

  router.post('/patient-portal/appointments/:id/change', route(async (req, res) => {
    const { kind } = req.body ?? {};
    if (!uuid.test(req.params.id) || !['cancel','reschedule'].includes(kind)) return res.sendStatus(400);
    const result = await transaction(database, async client => {
      const { rows: [account] } = await client.query(
        `SELECT a.username,a.patient_mrn FROM patient_portal_sessions t
         JOIN patient_portal_accounts a USING(username)
         WHERE t.token_hash=$1 AND t.expires_at>now() FOR SHARE OF a`, [portalSession(req)],
      );
      if (!account) return 401;
      const { rows: [visit] } = await client.query(
        `SELECT v.status,v.slot_id,s.starts_at FROM scheduled_visits v JOIN clinician_slots s ON s.id=v.slot_id
         WHERE v.id=$1 AND v.patient_mrn=$2 FOR UPDATE OF v`, [req.params.id, account.patient_mrn],
      );
      if (!visit) return 404;
      if (visit.status !== 'scheduled' || visit.starts_at <= new Date()) return 409;
      const inserted = await client.query(
        `INSERT INTO appointment_changes(id,visit_id,kind,requested_by,original_slot_id)
         VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
        [randomUUID(), req.params.id, kind, account.username, visit.slot_id],
      );
      return inserted.rowCount ? 201 : 409;
    });
    res.sendStatus(result);
  }));
  router.post('/patient-portal/virtual-visits', route(async (req, res) => {
    const { reason } = req.body ?? {};
    if (!maxText(reason, 500) || !reason) return res.sendStatus(400);
    const result = await database.query(
      `INSERT INTO virtual_visits(id,patient_mrn,reason)
       SELECT $1,a.patient_mrn,$2 FROM patient_portal_sessions t
       JOIN patient_portal_accounts a USING(username)
       WHERE t.token_hash=$3 AND t.expires_at>now() ON CONFLICT DO NOTHING`,
      [randomUUID(),reason,portalSession(req)]);
    if (result.rowCount) return res.sendStatus(201);
    const session = await database.query(
      'SELECT 1 FROM patient_portal_sessions WHERE token_hash=$1 AND expires_at>now()', [portalSession(req)]);
    res.sendStatus(session.rowCount ? 409 : 401);
  }));
  router.post('/patient-portal/logout', route(async (req, res) => {
    await database.query('DELETE FROM patient_portal_sessions WHERE token_hash=$1', [portalSession(req)]);
    res.clearCookie(portalCookie, cookieOptions).sendStatus(204);
  }));
  router.use('/patient-portal', (_req, res) => res.sendStatus(404));

  router.post('/session', route(async (req, res) => {
    const { username, accessKey } = req.body ?? {};
    if (typeof username !== 'string' || !/^[a-z0-9._-]{3,64}$/.test(username) ||
        typeof accessKey !== 'string' || !/^[0-9a-f]{64}$/.test(accessKey)) return res.sendStatus(401);
    const { rows: [staff] } = await database.query(
      'SELECT username, role FROM registry_staff WHERE username=$1 AND password_hash=$2',
      [username, hash(accessKey)],
    );
    if (!staff) {
      await database.query("INSERT INTO security_ledger(actor,event,outcome) VALUES('unauthenticated','staff_login','denied')");
      return res.sendStatus(401);
    }
    const token = randomBytes(32).toString('hex');
    await transaction(database, async client => {
      await client.query('DELETE FROM registry_sessions WHERE expires_at <= now() OR token_hash=$1', [sessionHash(req)]);
      await client.query(
        "INSERT INTO registry_sessions VALUES ($1,$2,now()+interval '8 hours')", [hash(token), staff.username],
      );
      await client.query("INSERT INTO security_ledger(actor,event,outcome) VALUES($1,'staff_login','success')", [staff.username]);
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
  router.get('/workspace/metrics', route(async (_req, res) => {
    const { role, username } = res.locals.staff;
    if (departmentWork.has(role)) {
      const { department, from } = departmentWork.get(role);
      const { rows: [counts] } = await database.query(
        `SELECT count(*) FILTER (WHERE w.state=$4)::int AS waiting,
                count(*) FILTER (WHERE w.state='completed')::int AS completed,
                count(*) FILTER (WHERE e.actor=$1 AND e.state=$5)::int AS personal
         FROM department_work_items w
         JOIN staff_department_memberships m ON m.department_code=w.department_code AND m.username=$1 AND m.role=$2
         LEFT JOIN department_work_events e ON e.work_id=w.id AND e.state=$5
         WHERE w.department_code=$3`, [username,role,department,from,departmentWork.get(role).to]);
      return res.json([
        { label: 'Awaiting your role', value: counts.waiting },
        { label: 'Completed in department', value: counts.completed },
        { label: 'Actions recorded by you', value: counts.personal },
      ]);
    }
    if (role === 'clinician' || role === 'triage') {
      const { rows: [counts] } = await database.query(
        `SELECT count(*) FILTER (WHERE v.status=$3)::int AS waiting,
                count(*) FILTER (WHERE v.status='completed')::int AS completed,
                count(*) FILTER (WHERE t.recorded_by=$1)::int AS assessed
         FROM scheduled_visits v JOIN clinician_slots s ON s.id=v.slot_id
         JOIN registry_staff staff ON staff.username=$1 AND staff.role=$2
         JOIN appointment_requests a ON a.id=v.request_id
         JOIN appointment_department_map dm ON dm.request_department=a.department
         JOIN staff_department_memberships m ON m.department_code=dm.department_code
           AND m.username=staff.username AND m.role=staff.role
         LEFT JOIN triage_assessments t ON t.visit_id=v.id
         WHERE ($2='triage' OR s.clinician_id=staff.clinician_id)`,
        [username,role,role === 'triage' ? 'waiting_for_triage' : 'triaged']);
      return res.json([
        { label: role === 'triage' ? 'Waiting for triage' : 'Ready for consultation', value: counts.waiting },
        role === 'triage' ? { label: 'Assessments recorded by you', value: counts.assessed }
          : { label: 'Completed assigned visits', value: counts.completed },
      ]);
    }
    if (role === 'billing' || role === 'cashier') {
      const { rows } = await database.query(
        `SELECT i.currency, count(*)::int AS invoices, count(r.id)::int AS receipts,
                COALESCE(sum(i.amount_minor) FILTER (WHERE r.id IS NULL),0)::text AS outstanding,
                COALESCE(sum(i.amount_minor) FILTER (WHERE r.id IS NOT NULL),0)::text AS settled
         FROM staging_invoices i LEFT JOIN staging_receipts r ON r.invoice_id=i.id
         GROUP BY i.currency ORDER BY i.currency`);
      return res.json(rows.flatMap(row => [
        { label: row.currency + ' outstanding', value: (Number(row.outstanding)/100).toFixed(2) },
        { label: row.currency + ' settled', value: (Number(row.settled)/100).toFixed(2) },
        { label: row.currency + ' invoices', value: row.invoices },
        { label: row.currency + ' receipts', value: row.receipts },
      ]));
    }
    if (role === 'super_admin') {
      const { rows: [counts] } = await database.query(
        `SELECT (SELECT count(*)::int FROM registry_staff) AS accounts,
                (SELECT count(*)::int FROM registry_audit WHERE action='registered') AS registrations,
                (SELECT count(*)::int FROM registry_audit WHERE action='viewed') AS record_views`);
      return res.json([
        { label: 'Staff accounts', value: counts.accounts },
        { label: 'Registration audit events', value: counts.registrations },
        { label: 'Patient record view events', value: counts.record_views },
      ]);
    }
    if (role === 'registrar') {
      const { rows: [counts] } = await database.query(
        `SELECT (SELECT count(*)::int FROM appointment_requests WHERE status='pending') AS pending,
                (SELECT count(*)::int FROM scheduled_visits WHERE status='waiting_for_triage') AS waiting,
                (SELECT count(*)::int FROM registry_audit WHERE actor=$1 AND action='registered') AS registered`, [username]);
      return res.json([
        { label: 'Pending appointment requests', value: counts.pending },
        { label: 'Checked in for triage', value: counts.waiting },
        { label: 'Registrations recorded by you', value: counts.registered },
      ]);
    }
    res.sendStatus(403);
  }));

  router.get('/workspace/trends', route(async (_req, res) => {
    const { role, username } = res.locals.staff;
    const department = departmentWork.get(role);
    const trends = department ? {
      label: 'Work events you recorded',
      sql: `SELECT e.occurred_at AS stamp FROM department_work_events e
            JOIN department_work_items w ON w.id=e.work_id
            JOIN staff_department_memberships m ON m.department_code=w.department_code AND m.username=$1 AND m.role=$2
            WHERE e.actor=$1 AND w.department_code=$3
            UNION ALL
            SELECT r.returned_at AS stamp FROM prescription_revisions r
            JOIN department_work_items w ON w.id=r.work_id
            JOIN staff_department_memberships m ON m.department_code=w.department_code AND m.username=$1 AND m.role=$2
            WHERE r.returned_by=$1 AND w.department_code=$3`,
      params: [username,role,department.department],
    } : {
      clinician: { label: 'Encounters you recorded', sql: 'SELECT recorded_at AS stamp FROM clinician_encounters WHERE recorded_by=$1', params: [username] },
      triage: { label: 'Triage assessments you recorded', sql: 'SELECT recorded_at AS stamp FROM triage_assessments WHERE recorded_by=$1', params: [username] },
      registrar: { label: 'Patient registrations you recorded', sql: "SELECT occurred_at AS stamp FROM registry_audit WHERE actor=$1 AND action='registered'", params: [username] },
      billing: { label: 'Invoices you issued', sql: 'SELECT issued_at AS stamp FROM staging_invoices WHERE issued_by=$1', params: [username] },
      cashier: { label: 'Payments you recorded', sql: 'SELECT recorded_at AS stamp FROM staging_receipts WHERE recorded_by=$1', params: [username] },
      management: { label: 'Completed clinical encounters', sql: 'SELECT recorded_at AS stamp FROM clinician_encounters', params: [] },
      super_admin: { label: 'Registry audit events', sql: 'SELECT occurred_at AS stamp FROM registry_audit', params: [] },
    }[role];
    if (!trends) return res.sendStatus(403);
    const { rows } = await database.query(
      `WITH days AS (
         SELECT (now() AT TIME ZONE 'Africa/Monrovia')::date - offset_day AS day
         FROM generate_series(0,6) AS offsets(offset_day)
       ), counts AS (
         SELECT (stamp AT TIME ZONE 'Africa/Monrovia')::date AS day, count(*)::int AS total
         FROM (${trends.sql}) events
         WHERE stamp >= ((SELECT min(day) FROM days)::timestamp AT TIME ZONE 'Africa/Monrovia')
         GROUP BY 1
       )
       SELECT days.day::text AS day, COALESCE(counts.total,0) AS value
       FROM days LEFT JOIN counts USING (day) ORDER BY days.day`, trends.params);
    res.json({ label: trends.label, days: rows });
  }));

  router.get('/workspace/security-ledger', requirePermission('management:read'), route(async (_req, res) => {
    const { rows } = await database.query(
      'SELECT id::text,occurred_at AS "occurredAt",actor,event,outcome FROM security_ledger ORDER BY id DESC LIMIT 100');
    res.json(rows);
  }));
  router.get('/workspace/security-ledger/checkpoint', requirePermission('management:read'), route(async (_req, res) => {
    const { rows: [checkpoint] } = await database.query(`
      SELECT checked_at AS "checkedAt", head_id::text AS "headId", object_key AS "objectKey",
        CASE WHEN state = 'failed' THEN 'failed'
          WHEN instance_id <> (SELECT instance_id FROM registry_instance WHERE singleton)
            OR (head_id > 0 AND head_hash IS DISTINCT FROM (SELECT entry_hash FROM security_ledger WHERE id=head_id))
            OR (head_id = 0 AND head_hash <> repeat('0',64)) THEN 'mismatch'
          WHEN checked_at < now() - interval '30 minutes' THEN 'overdue'
          ELSE 'verified' END AS status
      FROM security_checkpoint_status WHERE singleton`);
    res.json(checkpoint || { status: 'not_configured' });
  }));
  router.post('/workspace/security-ledger/verify', requirePermission('management:read'), route(async (_req, res) => {
    const { rows: [result] } = await database.query(
      `WITH checked AS (
        SELECT *, COALESCE(lag(entry_hash) OVER (ORDER BY id),repeat('0',64)) AS expected_previous,
          row_number() OVER (ORDER BY id) AS expected_id
        FROM security_ledger
      )
      SELECT count(*)::int AS entries,
        count(*) FILTER (WHERE id <> expected_id OR previous_hash <> expected_previous OR entry_hash <>
          encode(digest(convert_to(jsonb_build_array(id,extract(epoch FROM occurred_at),actor,event,outcome,previous_hash)::text,'UTF8'),'sha256'),'hex'))::int AS failures
      FROM checked`);
    res.json(result);
  }));
  router.get('/workspace/security-ledger/export', requirePermission('management:read'), route(async (_req, res) => {
    const rows = await transaction(database, async client => {
      const result = await client.query('SELECT id::text,occurred_at,actor,event,outcome,previous_hash,entry_hash FROM security_ledger ORDER BY id LIMIT 10000');
      await client.query("INSERT INTO security_ledger(actor,event,outcome) VALUES($1,'security_ledger_export','generated')", [res.locals.staff.username]);
      return result.rows;
    });
    res.attachment('staging-security-ledger.json').json(rows);
  }));

  router.get('/workspace/audit-summary', requirePermission('management:read'), route(async (_req, res) => {
    const { rows } = await database.query(
      `SELECT action, count(*)::int AS count, max(occurred_at) AS "latestAt"
       FROM registry_audit GROUP BY action ORDER BY action`);
    res.json(rows);
  }));
  router.get('/workspace/audit-events', requirePermission('management:read'), route(async (_req, res) => {
    const { rows: [{ dashboard }] } = await database.query(managementAuditSql + `
      SELECT jsonb_build_object(
        'total',count(*)::int,
        'logins',count(*) FILTER(WHERE category='login')::int,
        'accesses',count(*) FILTER(WHERE category='access')::int,
        'registrations',count(*) FILTER(WHERE category='registration')::int,
        'exports',count(*) FILTER(WHERE category='export')::int,
        'denied',count(*) FILTER(WHERE outcome='denied')::int,
        'modules',COALESCE((SELECT jsonb_agg(to_jsonb(m)) FROM (SELECT module AS name,count(*)::int AS value FROM enriched GROUP BY module ORDER BY module) m),'[]'::jsonb),
        'events',COALESCE((SELECT jsonb_agg(to_jsonb(r)) FROM (SELECT * FROM enriched ORDER BY "occurredAt" DESC,id DESC LIMIT 1000) r),'[]'::jsonb)
      ) AS dashboard FROM enriched`);
    res.json(dashboard);
  }));
  router.post('/workspace/audit-events/export', requirePermission('management:read'), route(async (req, res) => {
    if (!['csv','json'].includes(req.body?.format)) return res.sendStatus(400);
    const result = await transaction(database, async client => {
      const { rows } = await client.query(managementAuditSql + ' SELECT * FROM enriched ORDER BY "occurredAt" DESC,id DESC LIMIT 10001');
      if (rows.length > 10000) return null;
      await client.query("INSERT INTO security_ledger(actor,event,outcome) VALUES($1,'audit_events_export','generated')", [res.locals.staff.username]);
      return rows;
    });
    if (!result) return res.status(409).json({ error: 'Export exceeds the 10,000-event limit.' });
    res.json({ events: result, generatedAt: new Date().toISOString(), scope: 'Recorded staging audit metadata; patient references masked.' });
  }));

  router.get('/workspace/management', requirePermission('management:read'), route(async (_req, res) => {
    const { rows: [counts] } = await database.query(
      `SELECT (SELECT count(*)::int FROM scheduled_visits WHERE status='waiting_for_triage') AS triage,
              (SELECT count(*)::int FROM scheduled_visits WHERE status='completed') AS encounters,
              (SELECT count(*)::int FROM department_work_items WHERE state<>'completed') AS department,
              (SELECT count(*)::int FROM virtual_visits WHERE status='requested') AS virtual,
              (SELECT count(*)::int FROM staging_invoices i WHERE NOT EXISTS
                (SELECT 1 FROM staging_receipts r WHERE r.invoice_id=i.id)) AS invoices`);
    res.json([
      { label: 'Patients waiting for triage', value: counts.triage },
      { label: 'Completed encounters', value: counts.encounters },
      { label: 'Open department work items', value: counts.department },
      { label: 'Virtual visits awaiting scheduling', value: counts.virtual },
      { label: 'Outstanding invoices', value: counts.invoices },
    ]);
  }));

  router.get('/session', route(async (_req, res) => {
    const staff = res.locals.staff;
    const { rows } = await database.query(
      `SELECT d.code, d.name, m.role FROM staff_department_memberships m
       JOIN hospital_departments d ON d.code=m.department_code WHERE m.username=$1 ORDER BY d.name, m.role`,
      [staff.username],
    );
    res.json({ ...staff, departments: rows });
  }));
  router.post('/logout', route(async (req, res) => {
    await database.query('DELETE FROM registry_sessions WHERE token_hash=$1', [sessionHash(req)]);
    res.clearCookie(cookie, cookieOptions).sendStatus(204);
  }));

  router.post('/patients', requirePermission('patients:create'), route(async (req, res) => {
    const { username } = res.locals.staff;
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
  router.get('/patients/:mrn', requirePermission('patients:read'), route(async (req, res) => {
    const { username } = res.locals.staff;
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
  router.get('/appointments', requirePermission('appointments:manage'), route(async (_req, res) => {
    const { rows } = await database.query(
      `SELECT id, first_name AS "firstName", last_name AS "lastName", phone, email, department, clinician_id AS "clinicianId",
        requested_date::text AS date, requested_time AS "timeSlot", reason, patient_mrn AS "patientMrn", status
       FROM appointment_requests a WHERE status IN ('pending','contacted')
       AND NOT EXISTS (SELECT 1 FROM scheduled_visits v WHERE v.request_id=a.id)
       ORDER BY CASE WHEN status='pending' THEN 0 ELSE 1 END, created_at DESC, id LIMIT 50`,
    );
    res.json(rows);
  }));
  router.post('/appointments/:id/review', requirePermission('appointments:manage'), route(async (req, res) => {
    const { username } = res.locals.staff;
    const { id } = req.params;
    const { status, patientMrn } = req.body ?? {};
    if (!uuid.test(id) || !['contacted', 'closed'].includes(status) ||
        (patientMrn !== '' && (typeof patientMrn !== 'string' || !uuid.test(patientMrn)))) return res.sendStatus(400);
    const result = await transaction(database, async client => {
      const { rows: [current] } = await client.query(
        'SELECT status, patient_mrn FROM appointment_requests WHERE id=$1 FOR UPDATE', [id],
      );
      if (!current) return 404;
      if ((await client.query('SELECT 1 FROM scheduled_visits WHERE request_id=$1', [id])).rowCount) return 409;
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
  router.get('/virtual-visits', requirePermission('schedule:manage'), route(async (_req, res) => {
    const { rows } = await database.query(
      `SELECT v.id,v.reason,p.first_name AS "firstName",p.last_name AS "lastName"
       FROM virtual_visits v JOIN registry_patients p ON p.mrn=v.patient_mrn
       WHERE v.status='requested' ORDER BY v.requested_at,v.id LIMIT 50`);
    res.json(rows);
  }));

  router.post('/virtual-visits/:id/schedule', requirePermission('schedule:manage'), route(async (req, res) => {
    const { clinician, startsAt } = req.body ?? {};
    const starts = typeof startsAt === 'string' && startsAt.endsWith('Z') ? Date.parse(startsAt) : NaN;
    if (!uuid.test(req.params.id) || !maxText(clinician, 64) || !clinician ||
        !Number.isFinite(starts) || starts <= Date.now()) return res.sendStatus(400);
    const result = await database.query(
      `UPDATE virtual_visits v SET status='scheduled', starts_at=$2,
         clinician=$3, scheduled_by=$4, scheduled_at=now()
       WHERE v.id=$1 AND v.status='requested' AND EXISTS (
         SELECT 1 FROM registry_staff s JOIN staff_department_memberships m USING(username)
         WHERE s.username=$3 AND s.role='clinician' AND m.role='clinician' AND m.department_code='opd')`,
      [req.params.id,new Date(starts).toISOString(),clinician,res.locals.staff.username]);
    res.sendStatus(result.rowCount ? 204 : 409);
  }));

  router.get('/virtual-visits/assigned', requirePermission('encounters:assigned'), route(async (_req, res) => {
    const { rows } = await database.query(
      `SELECT v.id,v.reason,v.starts_at AS "startsAt",p.first_name AS "firstName",p.last_name AS "lastName"
       FROM virtual_visits v JOIN registry_patients p ON p.mrn=v.patient_mrn
       JOIN staff_department_memberships m ON m.username=v.clinician AND m.role='clinician' AND m.department_code='opd'
       WHERE v.status='scheduled' AND v.clinician=$1 ORDER BY v.starts_at,v.id LIMIT 50`,
      [res.locals.staff.username]);
    res.json(rows);
  }));

  router.use('/schedule', requirePermission('schedule:manage'));

  router.get('/schedule', route(async (_req, res) => {
    const { rows } = await database.query(
      `SELECT s.id, s.clinician_id AS "clinicianId", s.starts_at AS "startsAt",
        v.id AS "visitId", v.status, v.patient_mrn AS "patientMrn",
        p.first_name AS "firstName", p.last_name AS "lastName", n.delivery_status AS "notificationStatus"
       FROM clinician_slots s LEFT JOIN scheduled_visits v ON s.id=v.slot_id AND v.status<>'cancelled'
       LEFT JOIN registry_patients p ON p.mrn=v.patient_mrn
       LEFT JOIN LATERAL (
         SELECT delivery_status FROM patient_notification_outbox WHERE visit_id=v.id AND channel='sms'
         ORDER BY queued_at DESC,id DESC LIMIT 1
       ) n ON true
       WHERE (v.id IS NULL AND s.starts_at>now()) OR v.id IS NOT NULL
       ORDER BY CASE WHEN v.status='waiting_for_triage' THEN 0 ELSE 1 END, s.starts_at, s.id LIMIT 100`,
    );
    res.json(rows);
  }));

  router.get('/schedule/notifications', route(async (_req, res) => {
    const { rows } = await database.query(
      `SELECT n.id,n.event_type AS "eventType",n.delivery_status AS "deliveryStatus",
              n.queued_at AS "queuedAt",s.starts_at AS "startsAt",v.patient_mrn AS "patientMrn"
       FROM patient_notification_outbox n JOIN scheduled_visits v ON v.id=n.visit_id
       JOIN clinician_slots s ON s.id=n.slot_id
       ORDER BY n.queued_at DESC,n.id DESC LIMIT 50`,
    );
    res.json(rows);
  }));

  router.get('/schedule/changes', route(async (_req, res) => {
    const { rows } = await database.query(
      `SELECT c.id,c.kind,v.patient_mrn AS "patientMrn",p.first_name AS "firstName",p.last_name AS "lastName",
              s.starts_at AS "startsAt",s.clinician_id AS "clinicianId"
       FROM appointment_changes c JOIN scheduled_visits v ON v.id=c.visit_id
       JOIN registry_patients p ON p.mrn=v.patient_mrn JOIN clinician_slots s ON s.id=v.slot_id
       WHERE c.status='pending' ORDER BY c.requested_at,c.id LIMIT 50`,
    );
    res.json(rows);
  }));
  router.post('/schedule/changes/:id/decision', route(async (req, res) => {
    const { decision, slotId } = req.body ?? {};
    if (!uuid.test(req.params.id) || !['approve','decline'].includes(decision) ||
        (slotId != null && (typeof slotId !== 'string' || !uuid.test(slotId)))) return res.sendStatus(400);
    const result = await transaction(database, async client => {
      const { rows: [change] } = await client.query(
        `SELECT c.kind,c.status,c.visit_id,v.status AS visit_status,v.slot_id,s.clinician_id,s.starts_at
         FROM appointment_changes c JOIN scheduled_visits v ON v.id=c.visit_id
         JOIN clinician_slots s ON s.id=v.slot_id WHERE c.id=$1 FOR UPDATE OF v,c`, [req.params.id],
      );
      if (!change) return 404;
      if (change.status !== 'pending') return 409;
      let replacement = null;
      if (decision === 'approve') {
        if (change.visit_status !== 'scheduled' || change.starts_at <= new Date()) return 409;
        if (change.kind === 'cancel') {
          await client.query("UPDATE scheduled_visits SET status='cancelled' WHERE id=$1", [change.visit_id]);
        } else {
          if (!slotId || slotId === change.slot_id) return 400;
          const slot = await client.query(
            'SELECT 1 FROM clinician_slots WHERE id=$1 AND clinician_id=$2 AND starts_at>now() FOR UPDATE',
            [slotId, change.clinician_id],
          );
          if (!slot.rowCount || (await client.query(
            "SELECT 1 FROM scheduled_visits WHERE slot_id=$1 AND status<>'cancelled'", [slotId],
          )).rowCount) return 409;
          await client.query('UPDATE scheduled_visits SET slot_id=$2 WHERE id=$1', [change.visit_id, slotId]);
          replacement = slotId;
        }
      }
      await client.query(
        'UPDATE appointment_changes SET status=$2,decided_by=$3,decided_at=now(),replacement_slot_id=$4 WHERE id=$1',
        [req.params.id, decision === 'approve' ? 'approved' : 'declined', res.locals.staff.username, replacement],
      );
      if (decision === 'approve') {
        await client.query(
          "UPDATE patient_notification_outbox SET delivery_status='superseded' WHERE visit_id=$1 AND delivery_status='pending'",
          [change.visit_id],
        );
        await client.query(
          "INSERT INTO patient_notification_outbox (visit_id,event_type,channel,change_id,slot_id) VALUES ($1,$2,'sms',$3,$4)",
          [change.visit_id, change.kind === 'cancel' ? 'visit_cancelled' : 'visit_rescheduled',
            req.params.id, replacement ?? change.slot_id],
        );
      }
      return 204;
    });
    res.sendStatus(result);
  }));

  router.post('/schedule/slots', route(async (req, res) => {
    const { clinicianId, date, timeSlot } = req.body ?? {};
    if (!schedulableClinicians.has(clinicianId) || !times.has(timeSlot) ||
        typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.sendStatus(400);
    const [clock, period] = timeSlot.split(' ');
    const [hour, minute] = clock.split(':').map(Number);
    const utcHour = hour % 12 + (period === 'PM' ? 12 : 0);
    const start = new Date(date + 'T' + String(utcHour).padStart(2,'0') + ':' + String(minute).padStart(2,'0') + ':00Z');
    if (!Number.isFinite(start.getTime()) || start.toISOString().slice(0, 10) !== date ||
        start.getTime() <= Date.now() || start.getTime() > Date.now() + 365 * 86400000) return res.sendStatus(400);
    const result = await database.query(
      'INSERT INTO clinician_slots (id,clinician_id,starts_at) VALUES($1,$2,$3) ON CONFLICT (clinician_id,starts_at) DO NOTHING',
      [randomUUID(), clinicianId, start],
    );
    res.sendStatus(result.rowCount ? 201 : 409);
  }));

  router.post('/schedule/visits', route(async (req, res) => {
    const { requestId, slotId } = req.body ?? {};
    if (typeof requestId !== 'string' || !uuid.test(requestId) ||
        typeof slotId !== 'string' || !uuid.test(slotId)) return res.sendStatus(400);
    const username = res.locals.staff.username;
    const result = await transaction(database, async client => {
      const { rows: [request] } = await client.query(
        'SELECT status, patient_mrn, department FROM appointment_requests WHERE id=$1 FOR UPDATE', [requestId],
      );
      if (!request) return 404;
      const { rows: [existing] } = await client.query('SELECT slot_id FROM scheduled_visits WHERE request_id=$1', [requestId]);
      if (existing) return existing.slot_id === slotId ? 204 : 409;
      if (request.status !== 'contacted' || !request.patient_mrn) return 409;
      const slot = await client.query('SELECT clinician_id FROM clinician_slots WHERE id=$1 AND starts_at>now() FOR UPDATE', [slotId]);
      if (!slot.rowCount) return 409;
      if (slot.rows[0].clinician_id === 'USR-BETTY-BODUO' && request.department !== 'Internal Medicine & OPD') return 409;
      const visitId = randomUUID();
      const inserted = await client.query(
        'INSERT INTO scheduled_visits (id,request_id,slot_id,patient_mrn,scheduled_by) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING',
        [visitId, requestId, slotId, request.patient_mrn, username],
      );
      if (!inserted.rowCount) return 409;
      await client.query(
        "INSERT INTO patient_notification_outbox (visit_id,event_type,channel,slot_id) VALUES ($1,'visit_scheduled','sms',$2)", [visitId, slotId],
      );
      return 201;
    });
    res.sendStatus(result);
  }));

  router.post('/schedule/visits/:id/check-in', route(async (req, res) => {
    if (!uuid.test(req.params.id)) return res.sendStatus(400);
    const result = await database.query(
      `UPDATE scheduled_visits SET status='waiting_for_triage',checked_in_by=$2,checked_in_at=now()
       WHERE id=$1 AND status='scheduled'`, [req.params.id, res.locals.staff.username],
    );
    if (result.rowCount) return res.sendStatus(204);
    const existing = await database.query('SELECT status FROM scheduled_visits WHERE id=$1', [req.params.id]);
    res.sendStatus(!existing.rowCount ? 404 : existing.rows[0].status === 'cancelled' ? 409 : 204);
  }));
  router.use('/triage', requirePermission('triage:manage'));
  router.get('/triage', route(async (_req, res) => {
    const { rows } = await database.query(
      `SELECT v.id, v.patient_mrn AS "patientMrn", p.first_name AS "firstName",
              p.last_name AS "lastName", d.name AS "department", v.checked_in_at AS "checkedInAt"
       FROM scheduled_visits v JOIN registry_patients p ON p.mrn=v.patient_mrn
       JOIN appointment_requests req ON req.id=v.request_id
       JOIN appointment_department_map dm ON dm.request_department=req.department
       JOIN hospital_departments d ON d.code=dm.department_code
       JOIN staff_department_memberships m ON m.department_code=dm.department_code
         AND m.username=$1 AND m.role='triage'
       WHERE v.status='waiting_for_triage' ORDER BY v.checked_in_at, v.id LIMIT 100`, [res.locals.staff.username],
    );
    res.json(rows);
  }));
  router.post('/triage/:id/assessment', route(async (req, res) => {
    const { notes } = req.body ?? {};
    if (!uuid.test(req.params.id) || !maxText(notes, 2000) || !notes) return res.sendStatus(400);
    const result = await transaction(database, async client => {
      const { rows: [visit] } = await client.query(
        `SELECT v.status FROM scheduled_visits v
         JOIN appointment_requests req ON req.id=v.request_id
         JOIN appointment_department_map dm ON dm.request_department=req.department
         JOIN staff_department_memberships m ON m.department_code=dm.department_code
           AND m.username=$2 AND m.role='triage'
         WHERE v.id=$1 FOR UPDATE OF v, m`,
        [req.params.id, res.locals.staff.username],
      );
      if (!visit) return 404;
      if (visit.status !== 'waiting_for_triage') return 409;
      await client.query('INSERT INTO triage_assessments (visit_id,notes,recorded_by) VALUES ($1,$2,$3)',
        [req.params.id, notes, res.locals.staff.username]);
      await client.query("UPDATE scheduled_visits SET status='triaged' WHERE id=$1", [req.params.id]);
      return 201;
    });
    res.sendStatus(result);
  }));
  router.use('/encounters', requirePermission('encounters:assigned'));
  router.get('/encounters', route(async (_req, res) => {
    const { rows } = await database.query(
      `SELECT v.id, v.patient_mrn AS "patientMrn", p.first_name AS "firstName",
              p.last_name AS "lastName", d.name AS "department", v.checked_in_at AS "checkedInAt", a.notes AS "triageNotes"
       FROM scheduled_visits v JOIN registry_patients p ON p.mrn=v.patient_mrn
       JOIN triage_assessments a ON a.visit_id=v.id
       JOIN clinician_slots s ON s.id=v.slot_id
       JOIN registry_staff staff ON staff.clinician_id=s.clinician_id
       JOIN appointment_requests req ON req.id=v.request_id
       JOIN appointment_department_map dm ON dm.request_department=req.department
       JOIN hospital_departments d ON d.code=dm.department_code
       JOIN staff_department_memberships m ON m.department_code=dm.department_code
         AND m.username=$1 AND m.role='clinician'
       WHERE staff.username=$1 AND staff.role='clinician' AND v.status='triaged'
       ORDER BY a.recorded_at, v.id LIMIT 100`, [res.locals.staff.username],
    );
    res.json(rows);
  }));
  router.get('/encounters/results', route(async (_req, res) => {
    const { rows } = await database.query(
      `SELECT v.id, v.patient_mrn AS "patientMrn", p.first_name AS "firstName",
              p.last_name AS "lastName", e.recorded_at AS "encounterAt", pr.released_at AS "visitReleasedAt",
              EXISTS (SELECT 1 FROM department_work_items w WHERE w.visit_id=v.id AND w.state='completed') AS "hasResults"
       FROM scheduled_visits v
       JOIN clinician_encounters e ON e.visit_id=v.id
       JOIN registry_patients p ON p.mrn=v.patient_mrn
       JOIN clinician_slots s ON s.id=v.slot_id
       JOIN registry_staff staff ON staff.clinician_id=s.clinician_id AND staff.role='clinician'
       JOIN appointment_requests a ON a.id=v.request_id
       JOIN appointment_department_map dm ON dm.request_department=a.department
       JOIN staff_department_memberships m ON m.department_code=dm.department_code
         AND m.username=staff.username AND m.role='clinician'
       LEFT JOIN patient_visit_releases pr ON pr.visit_id=v.id
       WHERE staff.username=$1 AND v.status='completed'
       ORDER BY e.recorded_at DESC,v.id LIMIT 50`, [res.locals.staff.username],
    );
    res.json(rows);
  }));

  router.get('/encounters/:id/results', route(async (req, res) => {
    if (!uuid.test(req.params.id)) return res.sendStatus(400);
    const username = res.locals.staff.username;
    const results = await transaction(database, async client => {
      const { rows } = await client.query(
        `SELECT w.department_code AS department, w.instruction, v.patient_mrn AS "patientMrn",
                r.notes AS "recordedResult", c.notes AS "completionNotes", c.actor, c.occurred_at AS "completedAt", pr.released_at AS "patientReleasedAt",
                rx.status AS "prescriptionStatus", rx.medication, rx.directions, rx.revision
         FROM scheduled_visits v JOIN clinician_slots s ON s.id=v.slot_id
         JOIN registry_staff staff ON staff.clinician_id=s.clinician_id AND staff.role='clinician'
         JOIN appointment_requests a ON a.id=v.request_id
         JOIN appointment_department_map dm ON dm.request_department=a.department
         JOIN staff_department_memberships m ON m.department_code=dm.department_code
           AND m.username=staff.username AND m.role='clinician'
         JOIN department_work_items w ON w.visit_id=v.id AND w.state='completed'
         JOIN department_work_events c ON c.work_id=w.id AND c.state='completed'
         LEFT JOIN department_work_events r ON r.work_id=w.id AND r.state='recorded'
         LEFT JOIN patient_lab_releases pr ON pr.work_id=w.id
         LEFT JOIN encounter_prescriptions rx ON rx.work_id=w.id
         WHERE v.id=$1 AND staff.username=$2 AND v.status='completed'
         ORDER BY w.department_code`, [req.params.id, username],
      );
      if (rows.length) await client.query(
        "INSERT INTO registry_audit (actor,action,mrn) VALUES ($1,'viewed',$2)", [username, rows[0].patientMrn],
      );
      return rows;
    });
    if (!results.length) return res.sendStatus(404);
    res.json(results);
  }));

  router.post('/encounters/:id/prescription/resubmit', route(async (req, res) => {
    const { medication, directions, revision } = req.body ?? {};
    if (!uuid.test(req.params.id) || !maxText(medication, 160) || !medication ||
        !maxText(directions, 500) || !directions || !Number.isInteger(revision) || revision < 1) return res.sendStatus(400);
    const username = res.locals.staff.username;
    const result = await transaction(database, async client => {
      const { rows: [item] } = await client.query(
        `SELECT w.id,w.state,rx.status,rx.medication,rx.directions,rx.revision
         FROM scheduled_visits v JOIN clinician_slots s ON s.id=v.slot_id
         JOIN registry_staff staff ON staff.clinician_id=s.clinician_id AND staff.role='clinician'
         JOIN appointment_requests a ON a.id=v.request_id
         JOIN appointment_department_map dm ON dm.request_department=a.department
         JOIN staff_department_memberships m ON m.department_code=dm.department_code
           AND m.username=staff.username AND m.role='clinician'
         JOIN department_work_items w ON w.visit_id=v.id AND w.department_code='pharmacy'
         JOIN encounter_prescriptions rx ON rx.work_id=w.id
         WHERE v.id=$1 AND staff.username=$2 AND v.status='completed' FOR UPDATE OF w,rx,m,staff`,
        [req.params.id, username]);
      if (!item) return 404;
      if (item.state !== 'completed' || item.status !== 'clarification' || item.revision !== revision) return 409;
      const archived = await client.query(
        `INSERT INTO prescription_revisions (work_id,revision,medication,directions,return_notes,returned_by,returned_at,resubmitted_by)
         SELECT work_id,$2,$3,$4,notes,actor,occurred_at,$5
         FROM department_work_events WHERE work_id=$1 AND state='completed'`,
        [item.id,revision,item.medication,item.directions,username]);
      if (!archived.rowCount) return 409;
      await client.query("DELETE FROM department_work_events WHERE work_id=$1 AND state='completed'", [item.id]);
      await client.query(
        "UPDATE encounter_prescriptions SET medication=$2,directions=$3,status='pending',revision=revision+1 WHERE work_id=$1",
        [item.id,medication,directions]);
      await client.query(
        "UPDATE department_work_items SET state='pending',instruction=$2,requested_at=now() WHERE id=$1",
        [item.id,medication + ' - ' + directions]);
      return 204;
    });
    res.sendStatus(result);
  }));

  router.post('/encounters/:id/results/release', route(async (req, res) => {
    const { summary } = req.body ?? {};
    if (!uuid.test(req.params.id) || !maxText(summary, 1500) || !summary) return res.sendStatus(400);
    const username = res.locals.staff.username;
    const result = await transaction(database, async client => {
      const { rows: [work] } = await client.query(
        `SELECT w.id FROM scheduled_visits v JOIN clinician_slots s ON s.id=v.slot_id
         JOIN registry_staff staff ON staff.clinician_id=s.clinician_id AND staff.role='clinician'
         JOIN appointment_requests a ON a.id=v.request_id
         JOIN appointment_department_map dm ON dm.request_department=a.department
         JOIN staff_department_memberships m ON m.department_code=dm.department_code
           AND m.username=staff.username AND m.role='clinician'
         JOIN department_work_items w ON w.visit_id=v.id AND w.department_code='lab' AND w.state='completed'
         JOIN department_work_events e ON e.work_id=w.id AND e.state='completed'
         WHERE v.id=$1 AND staff.username=$2 AND v.status='completed' FOR SHARE OF w,m,staff`,
        [req.params.id, username],
      );
      if (!work) return 404;
      const released = await client.query(
        'INSERT INTO patient_lab_releases (work_id,summary,released_by) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
        [work.id, summary, username],
      );
      return released.rowCount ? 201 : 409;
    });
    res.sendStatus(result);
  }));

  router.post('/encounters/:id/visit-release', route(async (req, res) => {
    const { summary, encounterType } = req.body ?? {};
    if (!uuid.test(req.params.id) || !maxText(summary, 1500) || !summary.trim() ||
        !['OPD', 'EMERGENCY', 'INPATIENT', 'FOLLOWUP'].includes(encounterType)) return res.sendStatus(400);
    const username = res.locals.staff.username;
    const result = await transaction(database, async client => {
      const { rowCount } = await client.query(
        `SELECT v.id FROM scheduled_visits v JOIN clinician_encounters e ON e.visit_id=v.id
         JOIN clinician_slots s ON s.id=v.slot_id
         JOIN registry_staff staff ON staff.clinician_id=s.clinician_id AND staff.role='clinician'
         JOIN appointment_requests a ON a.id=v.request_id
         JOIN appointment_department_map dm ON dm.request_department=a.department
         JOIN staff_department_memberships m ON m.department_code=dm.department_code
           AND m.username=staff.username AND m.role='clinician'
         WHERE v.id=$1 AND staff.username=$2 AND v.status='completed' FOR SHARE OF v,m,staff`,
        [req.params.id, username],
      );
      if (!rowCount) return 404;
      const released = await client.query(
        `INSERT INTO patient_visit_releases (visit_id,summary,encounter_type,released_by)
         VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
        [req.params.id, summary.trim(), encounterType, username],
      );
      return released.rowCount ? 201 : 409;
    });
    res.sendStatus(result);
  }));

  router.post('/encounters/:id/assessment', route(async (req, res) => {
    const { notes } = req.body ?? {};
    if (!uuid.test(req.params.id) || !maxText(notes, 2000) || !notes) return res.sendStatus(400);
    const { orders = {} } = req.body ?? {};
    if (!orders || typeof orders !== 'object' || Array.isArray(orders) ||
        Object.entries(orders).some(([code, instruction]) => !orderDepartments.includes(code) || !maxText(instruction, 1500))) {
      return res.sendStatus(400);
    }
    const { medication = '', directions = '' } = req.body ?? {};
    if (!maxText(medication, 160) || !maxText(directions, 500) ||
        Boolean(medication) !== Boolean(directions) || (medication && orders.pharmacy)) return res.sendStatus(400);
    const username = res.locals.staff.username;
    const result = await transaction(database, async client => {
      const { rows: [visit] } = await client.query(
        `SELECT v.status FROM scheduled_visits v
         JOIN clinician_slots s ON s.id=v.slot_id
         JOIN registry_staff staff ON staff.clinician_id=s.clinician_id
         JOIN appointment_requests req ON req.id=v.request_id
         JOIN appointment_department_map dm ON dm.request_department=req.department
         JOIN staff_department_memberships m ON m.department_code=dm.department_code
           AND m.username=staff.username AND m.role='clinician'
         WHERE v.id=$1 AND staff.username=$2 AND staff.role='clinician' FOR UPDATE OF v, m, staff`,
        [req.params.id, username],
      );
      if (!visit) return 404;
      if (visit.status !== 'triaged') return 409;
      await client.query('INSERT INTO clinician_encounters (visit_id,notes,recorded_by) VALUES ($1,$2,$3)',
        [req.params.id, notes, username]);
      for (const [department, instruction] of Object.entries(orders)) {
        if (!instruction) continue;
        await client.query(
          'INSERT INTO department_work_items(id,visit_id,department_code,instruction) VALUES ($1,$2,$3,$4)',
          [randomUUID(), req.params.id, department, instruction],
        );
      }
      if (medication) {
        const workId = randomUUID();
        await client.query(
          "INSERT INTO department_work_items(id,visit_id,department_code,instruction) VALUES ($1,$2,'pharmacy',$3)",
          [workId, req.params.id, medication + ' - ' + directions]);
        await client.query(
          'INSERT INTO encounter_prescriptions (work_id,medication,directions) VALUES ($1,$2,$3)',
          [workId, medication, directions]);
      }
      await client.query("UPDATE scheduled_visits SET status='completed' WHERE id=$1", [req.params.id]);
      return 201;
    });
    res.sendStatus(result);
  }));
  router.use('/department-work', requirePermission('department:work'));
  router.get('/department-work', route(async (_req, res) => {
    const { username, role } = res.locals.staff;
    const { department, from } = departmentWork.get(role);
    const params = [username, role, department, from];
    const [{ rows: items }, { rows: [counts] }] = await Promise.all([
      database.query(
        `SELECT w.id,w.instruction,w.requested_at AS "requestedAt",v.patient_mrn AS "patientMrn",
                p.first_name AS "firstName",p.last_name AS "lastName", e.notes AS "recordedNotes", rx.work_id IS NOT NULL AS "isPrescription"
         FROM department_work_items w
         JOIN staff_department_memberships m ON m.department_code=w.department_code AND m.username=$1 AND m.role=$2
         JOIN scheduled_visits v ON v.id=w.visit_id JOIN registry_patients p ON p.mrn=v.patient_mrn
         LEFT JOIN department_work_events e ON e.work_id=w.id AND e.state='recorded'
         LEFT JOIN encounter_prescriptions rx ON rx.work_id=w.id
         WHERE w.department_code=$3 AND w.state=$4 ORDER BY w.requested_at,w.id LIMIT 50`, params),
      database.query(
        `SELECT count(*) FILTER (WHERE w.state=$4)::int AS waiting,
                count(*) FILTER (WHERE w.state='completed')::int AS completed
         FROM department_work_items w JOIN staff_department_memberships m
          ON m.department_code=w.department_code AND m.username=$1 AND m.role=$2
         WHERE w.department_code=$3`, params),
    ]);
    res.json({ items, counts });
  }));

  router.post('/department-work/:id/record', route(async (req, res) => {
    const { notes, disposition, temperatureC, pulseBpm } = req.body ?? {};
    if (!uuid.test(req.params.id) || !maxText(notes, 1500) || !notes) return res.sendStatus(400);
    const { username, role } = res.locals.staff;
    const hasVitals = temperatureC !== undefined || pulseBpm !== undefined;
    if (hasVitals && role !== 'nurse') return res.sendStatus(403);
    if (hasVitals && (!Number.isFinite(temperatureC) || temperatureC < 20 || temperatureC > 50 ||
        !Number.isInteger(pulseBpm) || pulseBpm < 1 || pulseBpm > 350)) return res.sendStatus(400);
    const { department, from, to } = departmentWork.get(role);
    const result = await transaction(database, async client => {
      const { rows: [item] } = await client.query(
        `SELECT w.state, EXISTS (SELECT 1 FROM encounter_prescriptions rx WHERE rx.work_id=w.id) AS prescription FROM department_work_items w
         JOIN staff_department_memberships m ON m.department_code=w.department_code AND m.username=$1 AND m.role=$2
         WHERE w.id=$3 AND w.department_code=$4 FOR UPDATE OF w,m`,
        [username, role, req.params.id, department],
      );
      if (!item) return 404;
      if (item.state !== from) return 409;
      if (item.prescription) {
        if (role !== 'pharmacist' || !['dispensed','clarification'].includes(disposition)) return 400;
        await client.query('UPDATE encounter_prescriptions SET status=$2 WHERE work_id=$1', [req.params.id, disposition]);
      } else if (disposition !== undefined) return 400;
      await client.query(
        'INSERT INTO department_work_events(work_id,state,notes,actor) VALUES ($1,$2,$3,$4)',
        [req.params.id, to, notes, username],
      );
      if (hasVitals) await client.query(
        'INSERT INTO patient_vital_readings(work_id,temperature_c,pulse_bpm,recorded_by) VALUES ($1,$2,$3,$4)',
        [req.params.id, temperatureC, pulseBpm, username],
      );
      await client.query('UPDATE department_work_items SET state=$2 WHERE id=$1', [req.params.id, to]);
      return 201;
    });
    res.sendStatus(result);
  }));
  router.use('/billing', requirePermission('billing:read'));
  router.get('/billing/:mrn', route(async (req, res) => {
    if (!uuid.test(req.params.mrn)) return res.sendStatus(400);
    const { rows } = await database.query(
      `SELECT i.id, i.currency, i.description, i.amount_minor AS "amountMinor", i.issued_at AS "issuedAt",
              r.id AS "receiptId", r.recorded_at AS "paidAt", p.first_name AS "firstName", p.last_name AS "lastName"
       FROM staging_invoices i JOIN registry_patients p ON p.mrn=i.patient_mrn
       LEFT JOIN staging_receipts r ON r.invoice_id=i.id
       WHERE i.patient_mrn=$1 ORDER BY i.issued_at DESC,i.id LIMIT 100`, [req.params.mrn]);
    res.json(rows);
  }));

  router.post('/billing/invoices', requirePermission('billing:issue'), route(async (req, res) => {
    const { id, mrn, currency, description, amountMinor } = req.body ?? {};
    if (!uuid.test(id ?? '') || !uuid.test(mrn ?? '') || !['USD','LRD'].includes(currency) ||
        !maxText(description, 240) || !description || !Number.isSafeInteger(amountMinor) ||
        amountMinor < 1 || amountMinor > 2147483647) return res.sendStatus(400);
    const result = await transaction(database, async client => {
      const { rowCount } = await client.query(
        `INSERT INTO staging_invoices(id,patient_mrn,currency,description,amount_minor,issued_by)
         SELECT $1,mrn,$3,$4,$5,$6 FROM registry_patients WHERE mrn=$2 AND first_name='Synthetic'
         ON CONFLICT DO NOTHING`, [id,mrn,currency,description,amountMinor,res.locals.staff.username]);
      if (rowCount) return 201;
      const existing = await client.query(
        `SELECT 1 FROM staging_invoices WHERE id=$1 AND patient_mrn=$2 AND currency=$3
         AND description=$4 AND amount_minor=$5 AND issued_by=$6`,
        [id,mrn,currency,description,amountMinor,res.locals.staff.username]);
      return existing.rowCount ? 200 : 409;
    });
    res.sendStatus(result);
  }));

  router.post('/billing/invoices/:id/payment', requirePermission('billing:payment'), route(async (req, res) => {
    if (!uuid.test(req.params.id)) return res.sendStatus(400);
    const result = await transaction(database, async client => {
      const { rowCount } = await client.query(
        `INSERT INTO staging_receipts(id,invoice_id,recorded_by)
         SELECT $1,i.id,$3 FROM staging_invoices i JOIN registry_patients p ON p.mrn=i.patient_mrn
         WHERE i.id=$2 AND p.first_name='Synthetic' ON CONFLICT (invoice_id) DO NOTHING`,
        [randomUUID(),req.params.id,res.locals.staff.username]);
      return rowCount ? 201 : 409;
    });
    res.sendStatus(result);
  }));

  router.get('/admin/staff', requirePermission('staff:review'), route(async (req, res) => {
    const after = req.query.after ?? '';
    if (typeof after !== 'string' || (after && !/^[a-z0-9._-]{3,64}$/.test(after))) return res.sendStatus(400);
    const { rows } = await database.query(
      `SELECT s.username, s.role, s.clinician_id AS "clinicianId",
        COALESCE((SELECT json_agg(json_build_object('name',d.name,'role',m.role) ORDER BY d.name,m.role)
          FROM staff_department_memberships m JOIN hospital_departments d ON d.code=m.department_code
          WHERE m.username=s.username),'[]'::json) AS departments
       FROM registry_staff s WHERE s.username>$1 ORDER BY s.username LIMIT 51`, [after],
    );
    const staff = rows.slice(0, 50);
    res.json({ staff, next: rows.length > 50 ? staff.at(-1).username : null });
  }));
  router.use((_req, res) => res.sendStatus(404));
  router.use((error, _req, res, _next) => {
    if (error.status === 400 || error.status === 413) return res.sendStatus(error.status);
    console.error('Patient registry request failed');
    res.sendStatus(503);
  });
  return router;
}
