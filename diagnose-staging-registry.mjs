import pg from 'pg';

const [mrn] = process.argv.slice(2);
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set.');
  process.exit(2);
}
const url = new URL(connectionString);
if (url.pathname !== '/jj_memorial_staging') {
  console.error('Unexpected database name:', url.pathname.replace(/^\//, '') || '(empty)');
  process.exit(2);
}
if (mrn && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(mrn)) {
  console.error('Optional MRN must be a UUID.');
  process.exit(2);
}

const database = new pg.Client({ connectionString, connectionTimeoutMillis: 5000 });
try {
  await database.connect();
  const { rows: [meta] } = await database.query(
    `SELECT current_database() AS database,
            (SELECT instance_id FROM registry_instance WHERE singleton=true) AS "instanceId",
            (SELECT count(*)::int FROM registry_patients) AS "patientCount",
            (SELECT count(*)::int FROM appointment_requests) AS "appointmentRequestCount"`,
  );
  console.log('Registry database:', meta.database);
  console.log('Registry instance:', meta.instanceId);
  console.log('Patient count:', meta.patientCount);
  console.log('Appointment request count:', meta.appointmentRequestCount);

  if (mrn) {
    const { rows: [patient] } = await database.query(
      'SELECT mrn, first_name, last_name, birth_date::text AS birth_date FROM registry_patients WHERE mrn=$1',
      [mrn],
    );
    console.log(patient ? 'MRN found:' : 'MRN not found:', mrn);
    if (patient) console.log(`${patient.first_name} ${patient.last_name} | DOB ${patient.birth_date}`);
  }
} catch {
  console.error('Registry diagnostic failed.');
  process.exitCode = 1;
} finally {
  await database.end().catch(() => {});
}
