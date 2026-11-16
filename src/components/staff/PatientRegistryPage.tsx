import React, { useEffect, useState } from 'react';

type Staff = {
  username: string;
  role: 'registrar' | 'viewer' | 'restricted' | 'triage' | 'clinician' | DepartmentRole;
  departments?: { code: string; name: string; role: string }[];
};
type DepartmentRole = 'nurse' | 'lab_technician' | 'lab_reviewer' | 'pharmacist';
const departmentLabels: Record<DepartmentRole, { title: string; action: string }> = {
  nurse: { title: 'Nursing Services', action: 'Record care completed' },
  lab_technician: { title: 'Diagnostic Laboratory', action: 'Record result for review' },
  lab_reviewer: { title: 'Diagnostic Laboratory', action: 'Release reviewed result' },
  pharmacist: { title: 'Pharmacy & Therapeutics', action: 'Record dispensing completed' },
};
const isDepartmentRole = (role: Staff['role']): role is DepartmentRole => Object.hasOwn(departmentLabels, role);
type WorkQueue = {
  items: { id: string; instruction: string; patientMrn: string; firstName: string; lastName: string; recordedNotes: string | null }[];
  counts: { waiting: number; completed: number };
};

type Patient = { mrn: string; firstName: string; lastName: string; birthDate: string };

type AppointmentRequest = {
  id: string; firstName: string; lastName: string; phone: string; email: string | null;
  department: string; clinicianId: string | null; date: string; timeSlot: string; reason: string;
  patientMrn: string | null; status: 'pending' | 'contacted';
};

type ScheduleSlot = {
  id: string; clinicianId: string; startsAt: string; visitId: string | null;
  status: 'scheduled' | 'waiting_for_triage' | 'triaged' | 'completed' | null;
  notificationStatus: 'pending' | 'sent' | 'failed' | null;
  patientMrn: string | null; firstName: string | null; lastName: string | null;
};

const clinicianNames: Record<string, string> = {
  'USR-001': 'Dr. J. Saydee Kollie',
  'USR-002': 'Dr. Evelyn Sirleaf-Gbotoe',
};
const scheduleTimes = ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM'];
const scheduleDate = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Monrovia' });
const describeSlot = (slot: ScheduleSlot) => clinicianNames[slot.clinicianId] + ' | ' + scheduleDate.format(new Date(slot.startsAt));
const scheduleInput = 'mt-1 block min-h-11 rounded-md border border-slate-400 px-2';
const scheduleButton = 'min-h-11 rounded-md bg-teal-800 px-4 font-semibold text-white disabled:opacity-50';

async function request<T>(route: string, body?: Record<string, string>): Promise<T> {
  const response = await fetch('/api/registry' + route, {
    cache: 'no-store',
    ...(body && { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  });
  if (!response.ok) {
    const messages: Record<number, string> = {
      400: 'Check the submitted details and try again.',
      401: 'Sign in with a valid staging staff account.',
      403: 'Your staff role cannot perform this action.',
      404: 'The requested record could not be found.',
      409: 'The request or slot changed, or a required review is missing. Refresh and try again.',
    };
    throw new Error(messages[response.status] ?? 'The registry is temporarily unavailable.');
  }
  return response.headers.get('content-type')?.includes('application/json') ? response.json() : undefined as T;
}

function AppointmentQueue() {
  const [items, setItems] = useState<AppointmentRequest[] | null>(null);
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function update(action?: () => Promise<void>) {
    setBusy(true);
    setMessage('');
    try {
      if (action) await action();
      const [queue, schedule] = await Promise.all([
        request<AppointmentRequest[]>('/appointments'), request<ScheduleSlot[]>('/schedule'),
      ]);
      setItems(queue);
      setSlots(schedule);
      if (action) setMessage('Request updated.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The queue is unavailable.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 sm:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Appointment requests</h2>
        <button type="button" disabled={busy} className="min-h-11 rounded-md border border-slate-400 px-4" onClick={() => void update()}>
          {items ? 'Refresh appointments and calendar' : 'Load appointments and calendar'}
        </button>
      </div>
      <p role="status" className="mt-2">{message}</p>
      <form className="mt-4 flex flex-wrap items-end gap-3 border-y border-slate-200 py-4" onSubmit={event => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        void update(() => request('/schedule/slots', {
          clinicianId: String(data.get('clinicianId')), date: String(data.get('date')), timeSlot: String(data.get('timeSlot')),
        }));
      }}>
        <label>Clinician
          <select name="clinicianId" className={scheduleInput}>
            {Object.entries(clinicianNames).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        </label>
        <label>Date (Monrovia)
          <input name="date" type="date" min={new Date().toISOString().slice(0, 10)} required className={scheduleInput} />
        </label>
        <label>Time
          <select name="timeSlot" className={scheduleInput}>
            {scheduleTimes.map(time => <option key={time}>{time}</option>)}
          </select>
        </label>
        <button disabled={busy} className={scheduleButton}>Publish slot</button>
      </form>
      {items && <div className="mt-5 space-y-3">
        <h3 className="font-semibold">Clinician calendar and triage handoff</h3>
        {slots.length === 0 && <p>No slots or visits.</p>}
        {slots.map(slot => (
          <article key={slot.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 p-3">
            <div>
              <p className="font-medium">{describeSlot(slot)}</p>
              <p>{slot.status === 'waiting_for_triage' ? 'Waiting for triage' : slot.status === 'completed' ? 'Visit completed' : slot.status === 'triaged' ? 'Triage recorded' : slot.visitId ? 'Scheduled' : 'Open'}
                {slot.firstName && ' | ' + slot.firstName + ' ' + slot.lastName}
              </p>
              {slot.notificationStatus && <p className="text-sm">SMS delivery: {slot.notificationStatus}</p>}
              {slot.patientMrn && <p className="break-all text-xs text-slate-600">MRN {slot.patientMrn}</p>}
            </div>
            {slot.status === 'scheduled' && <button type="button" disabled={busy} className={scheduleButton}
              onClick={() => void update(() => request('/schedule/visits/' + slot.visitId + '/check-in', {}))}>
              Check in for triage
            </button>}
          </article>
        ))}
        <h3 className="pt-3 font-semibold">Requests awaiting scheduling</h3>
      </div>}
      {items?.length === 0 && <p className="mt-3">No open requests.</p>}
      {items && items.length > 0 && <ul className="mt-4 space-y-4">
        {items.map(item => (
          <li key={item.id} className="rounded-md border border-slate-200 p-4">
            <h3 className="font-semibold">{item.firstName} {item.lastName}</h3>
            <p>{item.department} | {item.date} at {item.timeSlot} | {item.status}</p>
            <p>Preferred clinician {item.clinicianId === 'USR-001' ? 'Dr. J. Saydee Kollie' : item.clinicianId === 'USR-002' ? 'Dr. Evelyn Sirleaf-Gbotoe' : 'None'}</p>
            <p className="break-words">{item.phone}{item.email && ' | ' + item.email}</p>
            <p className="break-words">{item.reason}</p>
            <p className="break-all text-xs text-slate-600">Reference {item.id}</p>
            <form className="mt-3 flex flex-wrap items-end gap-2" onSubmit={event => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              void update(() => request('/appointments/' + item.id + '/review', {
                patientMrn: String(data.get('patientMrn')).trim(),
                status: String(data.get('status')),
              }));
            }}>
              <label>Patient MRN (optional)
                <input name="patientMrn" key={item.patientMrn ?? ''} defaultValue={item.patientMrn ?? ''} maxLength={36}
                  className="mt-1 block min-h-11 rounded-md border border-slate-400 px-2" />
              </label>
              <label>Disposition
                <select name="status" className="mt-1 block min-h-11 rounded-md border border-slate-400 px-2">
                  <option value="contacted">Contacted</option>
                  <option value="closed">Closed</option>
                </select>
              </label>
              <button disabled={busy} className="min-h-11 rounded-md bg-teal-800 px-4 font-semibold text-white disabled:opacity-50">Save review</button>
            </form>
            {item.status === 'contacted' && item.patientMrn && slots.some(slot => !slot.visitId) && (
              <form className="mt-3 flex flex-wrap items-end gap-2" onSubmit={event => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                void update(() => request('/schedule/visits', { requestId: item.id, slotId: String(data.get('slotId')) }));
              }}>
                <label>Open slot
                  <select name="slotId" required className={scheduleInput}>
                    <option value="">Select a slot</option>
                    {slots.filter(slot => !slot.visitId).map(slot => <option key={slot.id} value={slot.id}>{describeSlot(slot)}</option>)}
                  </select>
                </label>
                <button disabled={busy} className={scheduleButton}>Schedule visit</button>
              </form>
            )}
          </li>
        ))}
      </ul>}
    </section>
  );
}

type TriageVisit = { id: string; patientMrn: string; firstName: string; lastName: string; checkedInAt: string; department: string; triageNotes?: string };

function AssessmentWorkspace({ clinician = false }: { clinician?: boolean }) {
  const endpoint = clinician ? '/encounters' : '/triage';
  const [queue, setQueue] = useState<TriageVisit[] | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function update(assessment?: { id: string; notes: string; orders?: Record<string, string> }) {
    setBusy(true);
    setMessage('');
    try {
      if (assessment) await request(endpoint + '/' + assessment.id + '/assessment', { notes: assessment.notes, ...(assessment.orders && { orders: assessment.orders }) });
      setQueue(await request<TriageVisit[]>(endpoint));
      if (assessment) setMessage('Assessment recorded.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Triage queue unavailable.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">{clinician ? 'Clinician workspace' : 'Triage workspace'}</h2>
      <button type="button" disabled={busy} className={scheduleButton} onClick={() => void update()}>Refresh waiting queue</button>
      <p role="status">{message}</p>
      {queue?.length === 0 && <p>{clinician ? 'No assigned visits ready for consultation.' : 'No patients waiting for triage.'}</p>}
      {queue?.map(visit => (
        <form key={visit.id} className="space-y-3 rounded-lg border border-slate-200 bg-white p-5" onSubmit={event => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const orders = clinician ? Object.fromEntries(['nursing', 'lab', 'pharmacy'].map(code => [code, String(data.get(code)).trim()])) : undefined;
          void update({ id: visit.id, notes: String(data.get('notes')).trim(), orders });
        }}>
          <h3 className="font-semibold">{visit.firstName} {visit.lastName}</h3>
          <p className="text-sm">{visit.department}</p>
          <p className="break-all text-sm">MRN {visit.patientMrn}</p>
          <p className="text-sm">Checked in {scheduleDate.format(new Date(visit.checkedInAt))} (Monrovia)</p>
          {clinician && <p className="whitespace-pre-wrap break-words"><strong>Triage notes</strong>{' '}{visit.triageNotes}</p>}
          <label className="block">{clinician ? 'Encounter notes' : 'Assessment notes'}
            <textarea name="notes" required maxLength={2000} rows={4} className="mt-1 block w-full rounded-md border border-slate-400 p-2" />
          </label>
          {clinician && <fieldset className="space-y-2">
            <legend className="font-medium">Department requests (optional)</legend>
            {Object.entries({ nursing: 'Nursing instructions', lab: 'Laboratory order', pharmacy: 'Pharmacy instructions' }).map(([code, label]) => (
              <label className="block" key={code}>{label}
                <textarea name={code} maxLength={1500} rows={2} className="mt-1 block w-full rounded-md border border-slate-400 p-2" />
              </label>
            ))}
          </fieldset>}
          <button disabled={busy} className={scheduleButton}>{clinician ? 'Complete encounter' : 'Record assessment'}</button>
        </form>
      ))}
    </section>
  );
}

function DepartmentWorkspace({ role, analytics }: { role: DepartmentRole; analytics: boolean }) {
  const [queue, setQueue] = useState<WorkQueue | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function load(action?: { id: string; notes: string }) {
    setBusy(true);
    setMessage('');
    try {
      if (action) await request('/department-work/' + action.id + '/record', { notes: action.notes });
      setQueue(await request<WorkQueue>('/department-work'));
      if (action) setMessage('Work recorded.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Department workspace unavailable.');
    } finally { setBusy(false); }
  }

  return <section className="space-y-4">
    <h2 className="text-xl font-semibold">{departmentLabels[role].title} {analytics ? 'analytics' : 'work queue'}</h2>
    <button type="button" className={scheduleButton} disabled={busy} onClick={() => void load()}>
      {queue ? 'Refresh' : 'Load ' + (analytics ? 'analytics' : 'queue')}
    </button>
    <p role="status">{message}</p>
    {analytics && queue && <dl className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-lg border border-slate-200 bg-white p-5"><dt>Awaiting this role</dt><dd className="text-3xl font-bold">{queue.counts.waiting}</dd></div>
      <div className="rounded-lg border border-slate-200 bg-white p-5"><dt>Completed in department</dt><dd className="text-3xl font-bold">{queue.counts.completed}</dd></div>
    </dl>}
    {!analytics && queue?.items.length === 0 && <p>No work awaiting this role.</p>}
    {!analytics && queue?.items.map(item => <form key={item.id} className="space-y-3 rounded-lg border border-slate-200 bg-white p-5" onSubmit={event => {
      event.preventDefault();
      const notes = String(new FormData(event.currentTarget).get('notes')).trim();
      void load({ id: item.id, notes });
    }}>
      <h3 className="font-semibold">{item.firstName} {item.lastName}</h3>
      <p className="break-all text-sm">MRN {item.patientMrn}</p>
      <p className="whitespace-pre-wrap break-words"><strong>Request</strong>{' '}{item.instruction}</p>
      {item.recordedNotes && <p className="whitespace-pre-wrap break-words"><strong>Recorded result</strong>{' '}{item.recordedNotes}</p>}
      <label className="block">Work notes
        <textarea name="notes" required maxLength={1500} rows={3} className="mt-1 block w-full rounded-md border border-slate-400 p-2" />
      </label>
      <button disabled={busy} className={scheduleButton}>{departmentLabels[role].action}</button>
    </form>)}
  </section>;
}

type ResultVisit = { id: string; patientMrn: string; firstName: string; lastName: string; encounterAt: string };
type DepartmentResult = {
  department: string; instruction: string; recordedResult: string | null;
  completionNotes: string; actor: string; completedAt: string;
};
const resultLabels: Record<string, string> = { nursing: 'Nursing Services', lab: 'Diagnostic Laboratory', pharmacy: 'Pharmacy' };

function ClinicianResults() {
  const [visits, setVisits] = useState<ResultVisit[] | null>(null);
  const [selected, setSelected] = useState<{ id: string; rows: DepartmentResult[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function load(id?: string) {
    setBusy(true);
    setMessage('');
    setSelected(null);
    try {
      if (id) setSelected({ id, rows: await request<DepartmentResult[]>('/encounters/' + id + '/results') });
      else setVisits(await request<ResultVisit[]>('/encounters/results'));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Results unavailable.');
    } finally { setBusy(false); }
  }

  return <section className="space-y-4">
    <h2 className="text-xl font-semibold">Department results</h2>
    <button type="button" className={scheduleButton} disabled={busy} onClick={() => void load()}>{visits ? 'Refresh results' : 'Load results'}</button>
    <p role="status">{message}</p>
    {visits?.length === 0 && <p>No completed department work for your assigned visits.</p>}
    {visits?.map(visit => <article key={visit.id} className="space-y-2 rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="font-semibold">{visit.firstName} {visit.lastName}</h3>
      <p className="break-all text-sm">MRN {visit.patientMrn} | {scheduleDate.format(new Date(visit.encounterAt))} (Monrovia)</p>
      <button type="button" className={scheduleButton} disabled={busy} onClick={() => void load(visit.id)}>View department results</button>
      {selected?.id === visit.id && selected.rows.map(result => <section key={result.department} className="space-y-2 border-t border-slate-200 pt-3">
        <h4 className="font-semibold">{resultLabels[result.department] ?? result.department}</h4>
        <p className="whitespace-pre-wrap break-words"><strong>Request</strong>{' '}{result.instruction}</p>
        {result.recordedResult && <p className="whitespace-pre-wrap break-words"><strong>Released result</strong>{' '}{result.recordedResult}</p>}
        <p className="whitespace-pre-wrap break-words"><strong>{result.recordedResult ? 'Review notes' : 'Completion notes'}</strong>{' '}{result.completionNotes}</p>
        <p className="text-sm">Completed by {result.actor} on {scheduleDate.format(new Date(result.completedAt))} (Monrovia)</p>
      </section>)}
    </article>)}
  </section>;
}

export function PatientRegistryPage() {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [section, setSection] = useState('workflow');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(true);
  const input = 'mt-1 min-h-11 w-full rounded-md border border-slate-400 bg-white px-3 py-2';
  const button = 'mt-4 min-h-11 rounded-md bg-teal-800 px-4 font-semibold text-white disabled:opacity-50';

  useEffect(() => {
    let active = true;
    request<Staff>('/session')
      .then(result => { if (active) setStaff(result); })
      .catch(() => {})
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, []);

  async function perform(action: () => Promise<void>) {
    setBusy(true);
    setStatus('');
    try {
      await action();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'The request failed.');
    } finally {
      setBusy(false);
    }
  }

  function submit(action: (data: FormData) => Promise<void>) {
    return (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      if (data.has('accessKey')) event.currentTarget.reset();
      void perform(() => action(data));
    };
  }

  const sections = staff && (isDepartmentRole(staff.role) ? [
    { id: 'workflow', label: 'Work queue' }, { id: 'analytics', label: 'Workload analytics' },
  ] : staff.role === 'registrar' ? [
    { id: 'workflow', label: 'Registration and lookup' }, { id: 'appointments', label: 'Appointments and calendar' },
  ] : staff.role === 'clinician' ? [
    { id: 'workflow', label: 'Assigned encounters' }, { id: 'results', label: 'Department results' },
  ] : staff.role === 'restricted' ? [] : [
    { id: 'workflow', label: staff.role === 'viewer' ? 'Patient lookup' : staff.role === 'triage' ? 'Triage queue' : 'Assigned encounters' },
  ]);

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900">
      <div className={staff ? "mx-auto max-w-7xl" : "mx-auto max-w-3xl"}>
        <a href="/" className="font-semibold text-teal-800 underline">J &amp; J Memorial homepage</a>
        <h1 className="mt-5 text-3xl font-bold">Staging patient registry</h1>
        <p className="mt-2 text-slate-700">Use synthetic patient data only.</p>
        {staff && <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p>Signed in as <strong>{staff.username}</strong> ({staff.role})</p>
            {staff.departments?.some(department => department.role === staff.role)
              ? <p className="text-sm">{staff.departments.filter(department => department.role === staff.role).map(department => department.name).join(', ')}</p>
              : (staff.role === 'clinician' || staff.role === 'triage' || isDepartmentRole(staff.role)) && <p className="text-sm">No department assigned for this role.</p>}
          </div>
          <button disabled={busy} className="min-h-11 rounded-md border border-slate-400 px-4" onClick={() => void perform(async () => {
            await request('/logout', {});
            setStaff(null);
            setSection('workflow');
            setPatient(null);
          })}>Sign out</button>
        </div>}
        <p role="status" className="my-4 text-slate-800">{status}</p>
        {!staff ? (
          <form className="max-w-md space-y-4 rounded-lg border border-slate-200 bg-white p-5" onSubmit={submit(async data => {
            await request<Staff>('/session', {
              username: String(data.get('username')).trim().toLowerCase(),
              accessKey: String(data.get('accessKey')).trim(),
            });
            setStaff(await request<Staff>('/session'));
          })}>
            <h2 className="text-xl font-semibold">Staff sign-in</h2>
            <label className="block">Username<input className={input} name="username" autoComplete="username" required /></label>
            <label className="block">Access key<input className={input} name="accessKey" type="password" autoComplete="current-password" required /></label>
            <button className={button} disabled={busy}>Sign in</button>
          </form>
        ) : (
          <div className="grid gap-5 md:grid-cols-[14rem_minmax(0,1fr)]">
            <nav aria-label="Staff workspace" className="self-start rounded-lg border border-slate-200 bg-white p-3">
              <p className="mb-2 px-2 text-sm font-semibold">Workspace</p>
              {sections?.map(item => <button key={item.id} type="button" aria-current={section === item.id ? 'page' : undefined}
                className={'mb-1 block min-h-11 w-full rounded-md px-2 text-left text-sm ' + (section === item.id ? 'bg-teal-100 font-semibold text-teal-950' : 'hover:bg-slate-100')}
                onClick={() => setSection(item.id)}>{item.label}</button>)}
              {sections?.length === 0 && <p className="px-2 text-sm">No workflows assigned.</p>}
            </nav>
            <div>
            {isDepartmentRole(staff.role) ? <DepartmentWorkspace key={staff.role} role={staff.role} analytics={section === 'analytics'} />
            : staff.role === 'registrar' && section === 'appointments' ? <AppointmentQueue />
            : staff.role === 'triage' ? <AssessmentWorkspace /> : staff.role === 'clinician' ? (section === 'results' ? <ClinicianResults /> : <AssessmentWorkspace clinician />) : staff.role === 'restricted' ? <p>Your staff role has no patient registry access.</p> : (
          <div className="grid gap-5 sm:grid-cols-2">
            {staff.role === 'registrar' && (
              <form className="space-y-3 rounded-lg border border-slate-200 bg-white p-5" onSubmit={submit(async data => {
                setPatient(null);
                setPatient(await request<Patient>('/patients', {
                  firstName: String(data.get('firstName')), lastName: String(data.get('lastName')), birthDate: String(data.get('birthDate')),
                }));
                setStatus('Patient registered.');
              })}>
                <h2 className="text-xl font-semibold">Register a patient</h2>
                <label className="block">First name<input className={input} name="firstName" required maxLength={80} /></label>
                <label className="block">Last name<input className={input} name="lastName" required maxLength={80} /></label>
                <label className="block">Date of birth<input className={input} name="birthDate" type="date" required /></label>
                <button className={button} disabled={busy}>Register patient</button>
              </form>
            )}
            <form className="space-y-3 rounded-lg border border-slate-200 bg-white p-5" onSubmit={submit(async data => {
              setPatient(null);
              setPatient(await request<Patient>('/patients/' + encodeURIComponent(String(data.get('mrn')).trim())));
              setStatus('Patient found.');
            })}>
              <h2 className="text-xl font-semibold">Find a patient</h2>
              <label className="block">Medical record number<input className={input} name="mrn" required maxLength={36} /></label>
              <button className={button} disabled={busy}>Find patient</button>
            </form>
            {patient && (
              <section className="rounded-lg border border-teal-200 bg-white p-5 sm:col-span-2">
                <h2 className="text-xl font-semibold">{patient.firstName} {patient.lastName}</h2>
                <p className="mt-2 break-all">Medical record number <strong className="font-mono">{patient.mrn}</strong></p>
                <p>Date of birth {patient.birthDate}</p>
              </section>
            )}
          </div>
            )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
