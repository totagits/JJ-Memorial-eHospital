import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import express from 'express';

const migrations = ['001_patient_registry.sql', '002_appointment_requests.sql', '003_clinician_schedule.sql', '004_triage.sql', '005_clinician_encounters.sql', '006_notification_outbox.sql', '007_department_memberships.sql', '008_department_workspaces.sql', '009_registry_instance.sql', '010_betty_boduo_clinician.sql', '011_staff_access_review.sql'];
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
  ...Array.from(departmentWork.keys(), role => [role, new Set(['department:work'])]),
  ['restricted', new Set()],
  ['super_admin', new Set(['staff:review'])],
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
  router.use('/schedule', requirePermission('schedule:manage'));

  router.get('/schedule', route(async (_req, res) => {
    const { rows } = await database.query(
      `SELECT s.id, s.clinician_id AS "clinicianId", s.starts_at AS "startsAt",
        v.id AS "visitId", v.status, v.patient_mrn AS "patientMrn",
        p.first_name AS "firstName", p.last_name AS "lastName", n.delivery_status AS "notificationStatus"
       FROM clinician_slots s LEFT JOIN scheduled_visits v ON s.id=v.slot_id
       LEFT JOIN registry_patients p ON p.mrn=v.patient_mrn
       LEFT JOIN patient_notification_outbox n ON n.visit_id=v.id AND n.event_type='visit_scheduled' AND n.channel='sms'
       WHERE (v.id IS NULL AND s.starts_at>now()) OR v.id IS NOT NULL
       ORDER BY CASE WHEN v.status='waiting_for_triage' THEN 0 ELSE 1 END, s.starts_at, s.id LIMIT 100`,
    );
    res.json(rows);
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
        "INSERT INTO patient_notification_outbox (visit_id,event_type,channel) VALUES ($1,'visit_scheduled','sms')", [visitId],
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
    const existing = await database.query('SELECT 1 FROM scheduled_visits WHERE id=$1', [req.params.id]);
    res.sendStatus(existing.rowCount ? 204 : 404);
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
              p.last_name AS "lastName", e.recorded_at AS "encounterAt"
       FROM scheduled_visits v
       JOIN clinician_encounters e ON e.visit_id=v.id
       JOIN registry_patients p ON p.mrn=v.patient_mrn
       JOIN clinician_slots s ON s.id=v.slot_id
       JOIN registry_staff staff ON staff.clinician_id=s.clinician_id AND staff.role='clinician'
       JOIN appointment_requests a ON a.id=v.request_id
       JOIN appointment_department_map dm ON dm.request_department=a.department
       JOIN staff_department_memberships m ON m.department_code=dm.department_code
         AND m.username=staff.username AND m.role='clinician'
       WHERE staff.username=$1 AND v.status='completed'
         AND EXISTS (SELECT 1 FROM department_work_items w WHERE w.visit_id=v.id AND w.state='completed')
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
                r.notes AS "recordedResult", c.notes AS "completionNotes", c.actor, c.occurred_at AS "completedAt"
         FROM scheduled_visits v JOIN clinician_slots s ON s.id=v.slot_id
         JOIN registry_staff staff ON staff.clinician_id=s.clinician_id AND staff.role='clinician'
         JOIN appointment_requests a ON a.id=v.request_id
         JOIN appointment_department_map dm ON dm.request_department=a.department
         JOIN staff_department_memberships m ON m.department_code=dm.department_code
           AND m.username=staff.username AND m.role='clinician'
         JOIN department_work_items w ON w.visit_id=v.id AND w.state='completed'
         JOIN department_work_events c ON c.work_id=w.id AND c.state='completed'
         LEFT JOIN department_work_events r ON r.work_id=w.id AND r.state='recorded'
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

  router.post('/encounters/:id/assessment', route(async (req, res) => {
    const { notes } = req.body ?? {};
    if (!uuid.test(req.params.id) || !maxText(notes, 2000) || !notes) return res.sendStatus(400);
    const { orders = {} } = req.body ?? {};
    if (!orders || typeof orders !== 'object' || Array.isArray(orders) ||
        Object.entries(orders).some(([code, instruction]) => !orderDepartments.includes(code) || !maxText(instruction, 1500))) {
      return res.sendStatus(400);
    }
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
                p.first_name AS "firstName",p.last_name AS "lastName", e.notes AS "recordedNotes"
         FROM department_work_items w
         JOIN staff_department_memberships m ON m.department_code=w.department_code AND m.username=$1 AND m.role=$2
         JOIN scheduled_visits v ON v.id=w.visit_id JOIN registry_patients p ON p.mrn=v.patient_mrn
         LEFT JOIN department_work_events e ON e.work_id=w.id AND e.state='recorded'
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
    const { notes } = req.body ?? {};
    if (!uuid.test(req.params.id) || !maxText(notes, 1500) || !notes) return res.sendStatus(400);
    const { username, role } = res.locals.staff;
    const { department, from, to } = departmentWork.get(role);
    const result = await transaction(database, async client => {
      const { rows: [item] } = await client.query(
        `SELECT w.state FROM department_work_items w
         JOIN staff_department_memberships m ON m.department_code=w.department_code AND m.username=$1 AND m.role=$2
         WHERE w.id=$3 AND w.department_code=$4 FOR UPDATE OF w,m`,
        [username, role, req.params.id, department],
      );
      if (!item) return 404;
      if (item.state !== from) return 409;
      await client.query(
        'INSERT INTO department_work_events(work_id,state,notes,actor) VALUES ($1,$2,$3,$4)',
        [req.params.id, to, notes, username],
      );
      await client.query('UPDATE department_work_items SET state=$2 WHERE id=$1', [req.params.id, to]);
      return 201;
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
