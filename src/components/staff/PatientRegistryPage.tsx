import { Activity, ArrowUpRight, LayoutDashboard } from 'lucide-react';
import React, { useEffect, useState } from 'react';

type Staff = {
  username: string;
  role: 'registrar' | 'viewer' | 'restricted' | 'triage' | 'clinician' | 'super_admin' | 'cashier' | 'billing' | 'management' | DepartmentRole;
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
  items: { id: string; instruction: string; patientMrn: string; firstName: string; lastName: string; recordedNotes: string | null; isPrescription: boolean }[];
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
  notificationStatus: 'pending' | 'sent' | 'failed' | 'superseded' | null;
  patientMrn: string | null; firstName: string | null; lastName: string | null;
};

const clinicianNames: Record<string, string> = {
  'USR-001': 'Dr. J. Saydee Kollie',
  'USR-BETTY-BODUO': 'Betty Boduo (OPD)',
  'USR-002': 'Dr. Evelyn Sirleaf-Gbotoe',
};
const scheduleTimes = ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM'];
const scheduleDate = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Monrovia' });
const describeSlot = (slot: ScheduleSlot) => clinicianNames[slot.clinicianId] + ' | ' + scheduleDate.format(new Date(slot.startsAt));
const scheduleInput = 'mt-1 block min-h-11 rounded-md border border-slate-400 px-2';
const scheduleButton = 'min-h-11 rounded-md bg-teal-800 px-4 font-semibold text-white disabled:opacity-50';

async function request<T>(route: string, body?: Record<string, string | number | Record<string, string>>): Promise<T> {
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

type NotificationEvent = {
  id: string; eventType: string; deliveryStatus: string; startsAt: string; patientMrn: string;
};

function AppointmentNotifications() {
  const [events, setEvents] = useState<NotificationEvent[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    setBusy(true);
    setMessage('');
    try {
      setEvents(await request<NotificationEvent[]>('/schedule/notifications'));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Notifications unavailable.');
    } finally { setBusy(false); }
  }

  return <section className="space-y-4">
    <h2 className="text-xl font-semibold">Appointment notifications</h2>
    <p>Pending events are queued for SMS delivery.</p>
    <button type="button" className={scheduleButton} disabled={busy} onClick={() => void load()}>{events ? 'Refresh notifications' : 'Load notifications'}</button>
    <p role="status">{message}</p>
    {events?.length === 0 && <p>No notification events.</p>}
    {events?.map(event => <article key={event.id} className="rounded-md border border-slate-200 bg-white p-4">
      <h3 className="font-semibold">{event.eventType === 'visit_scheduled' ? 'Appointment scheduled' : event.eventType === 'visit_rescheduled' ? 'Appointment rescheduled' : 'Appointment cancelled'}</h3>
      <p className="break-all text-sm">MRN {event.patientMrn} | {scheduleDate.format(new Date(event.startsAt))} (Monrovia)</p>
      <p className="text-sm">SMS delivery: {event.deliveryStatus}</p>
    </article>)}
  </section>;
}

type AppointmentChange = { id: string; kind: 'cancel' | 'reschedule'; patientMrn: string;
  firstName: string; lastName: string; startsAt: string; clinicianId: string };

function AppointmentQueue() {
  const [items, setItems] = useState<AppointmentRequest[] | null>(null);
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [changes, setChanges] = useState<AppointmentChange[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function update(action?: () => Promise<void>) {
    setBusy(true);
    setMessage('');
    try {
      if (action) await action();
      const [queue, schedule, pendingChanges] = await Promise.all([
        request<AppointmentRequest[]>('/appointments'), request<ScheduleSlot[]>('/schedule'),
        request<AppointmentChange[]>('/schedule/changes'),
      ]);
      setItems(queue);
      setSlots(schedule);
      setChanges(pendingChanges);
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
      {items && <section className="mt-5 space-y-3" aria-labelledby="appointment-changes">
        <h3 id="appointment-changes" className="font-semibold">Patient appointment changes</h3>
        {changes.length === 0 && <p>No requests awaiting review.</p>}
        {changes.map(change => <form key={change.id} className="space-y-3 rounded-md border border-slate-200 p-4" onSubmit={event => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          void update(() => request('/schedule/changes/' + change.id + '/decision', {
            decision: 'approve', ...(data.get('slotId') && { slotId: String(data.get('slotId')) }),
          }));
        }}>
          <p className="font-medium">{change.firstName} {change.lastName} | {change.kind === 'cancel' ? 'Cancellation' : 'Reschedule'}</p>
          <p className="break-all text-sm">MRN {change.patientMrn} | {scheduleDate.format(new Date(change.startsAt))} (Monrovia)</p>
          {change.kind === 'reschedule' && <label className="block">Replacement slot with the same clinician
            <select name="slotId" className={scheduleInput} required>
              <option value="">Select an open slot</option>
              {slots.filter(slot => !slot.visitId && slot.clinicianId === change.clinicianId).map(slot =>
                <option value={slot.id} key={slot.id}>{describeSlot(slot)}</option>)}
            </select>
          </label>}
          <div className="flex flex-wrap gap-2">
            <button type="submit" className={scheduleButton} disabled={busy}>Approve request</button>
            <button type="button" className="min-h-11 rounded-md border border-slate-400 px-4" disabled={busy}
              onClick={() => void update(() => request('/schedule/changes/' + change.id + '/decision', { decision: 'decline' }))}>
              Decline request
            </button>
          </div>
        </form>)}
      </section>}
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
            <p>Preferred clinician {item.clinicianId ? clinicianNames[item.clinicianId] ?? item.clinicianId : 'None'}</p>
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
                    {slots.filter(slot => !slot.visitId && (slot.clinicianId !== 'USR-BETTY-BODUO' || item.department === 'Internal Medicine & OPD')).map(slot => <option key={slot.id} value={slot.id}>{describeSlot(slot)}</option>)}
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
  const [selectedVisit, setSelectedVisit] = useState('');
  const [queue, setQueue] = useState<TriageVisit[] | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function update(assessment?: { id: string; notes: string; orders?: Record<string, string>; medication?: string; directions?: string }) {
    setBusy(true);
    setMessage('');
    try {
      if (assessment) await request(endpoint + '/' + assessment.id + '/assessment', { notes: assessment.notes, ...(assessment.orders && { orders: assessment.orders, medication: assessment.medication ?? "", directions: assessment.directions ?? "" }) });
      setQueue(await request<TriageVisit[]>(endpoint));
      if (assessment) setMessage('Assessment recorded.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Triage queue unavailable.');
    } finally {
      setBusy(false);
    }
  }

  const selected = queue?.find(visit => visit.id === selectedVisit) ?? queue?.[0];

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">{clinician ? 'Clinician workspace' : 'Triage workspace'}</h2>
      <button type="button" disabled={busy} className={scheduleButton} onClick={() => void update()}>Refresh waiting queue</button>
      <p role="status">{message}</p>
      {queue?.length === 0 && <p>{clinician ? 'No assigned visits ready for consultation.' : 'No patients waiting for triage.'}</p>}
      {selected && <div className="grid gap-5 lg:grid-cols-[minmax(14rem,1fr)_minmax(0,2fr)]">
        <aside className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">{clinician ? 'Assigned encounters' : 'Triage worklist'}</h3>
          <ul className="space-y-2">
            {queue?.map(visit => <li key={visit.id}>
              <button type="button" aria-pressed={selected.id === visit.id} onClick={() => setSelectedVisit(visit.id)}
                className={'w-full rounded-lg border p-3 text-left ' + (selected.id === visit.id ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:bg-slate-50')}>
                <span className="block font-semibold">{visit.firstName} {visit.lastName}</span>
                <span className="block text-sm text-slate-600">{visit.department}</span>
                <span className="block break-all text-xs text-slate-600">{visit.patientMrn}</span>
              </button>
            </li>)}
          </ul>
        </aside>
        {[selected].map(visit => (
        <form key={visit.id} className="space-y-3 rounded-lg border border-slate-200 bg-white p-5" onSubmit={event => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const orders = clinician ? Object.fromEntries(['nursing', 'lab', 'pharmacy'].map(code => [code, String(data.get(code)).trim()])) : undefined;
          const medication = String(data.get('medication') ?? '').trim();
          const directions = String(data.get('directions') ?? '').trim();
          if (Boolean(medication) !== Boolean(directions) || (medication && orders?.pharmacy)) {
            setMessage('Enter both prescription fields and leave general pharmacy instructions blank for a prescription.');
            return;
          }
          void update({ id: visit.id, notes: String(data.get('notes')).trim(), orders, medication, directions });
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
          {clinician && <fieldset className="space-y-2">
            <legend className="font-medium">Prescription (optional)</legend>
            <label className="block">Medication<input name="medication" maxLength={160} className="mt-1 block w-full rounded-md border border-slate-400 p-2" /></label>
            <label className="block">Directions<textarea name="directions" maxLength={500} rows={2} className="mt-1 block w-full rounded-md border border-slate-400 p-2" /></label>
          </fieldset>}
          <button disabled={busy} className={scheduleButton}>{clinician ? 'Complete encounter' : 'Record assessment'}</button>
        </form>
      ))}
      </div>}
    </section>
  );
}

function DepartmentWorkspace({ role, analytics }: { role: DepartmentRole; analytics: boolean }) {
  const [selectedId, setSelectedId] = useState('');
  const [search, setSearch] = useState('');
  const [queue, setQueue] = useState<WorkQueue | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function load(action?: { id: string; notes: string; disposition?: string; vitals?: { temperatureC: number; pulseBpm: number } }) {
    setBusy(true);
    setMessage('');
    try {
      if (action) await request('/department-work/' + action.id + '/record', { notes: action.notes, ...(action.disposition && { disposition: action.disposition }), ...action.vitals });
      setQueue(await request<WorkQueue>('/department-work'));
      if (action) setMessage('Work recorded.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Department workspace unavailable.');
    } finally { setBusy(false); }
  }

  const query = search.trim().toLowerCase();
  const visibleItems = queue?.items.filter(item =>
    [item.firstName + ' ' + item.lastName, item.patientMrn, item.instruction].some(value => value.toLowerCase().includes(query))
  ) ?? [];
  const selected = visibleItems.find(item => item.id === selectedId) ?? visibleItems[0];

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
    {!analytics && queue && queue.items.length > 0 && <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(14rem,1fr)_minmax(0,2fr)]">
      <aside className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="font-semibold">Worklist ({visibleItems.length})</h3>
        <label className="block text-sm font-medium">Search worklist
          <input type="search" className={scheduleInput + ' w-full'} value={search} onChange={event => setSearch(event.target.value)} />
        </label>
        {visibleItems.length === 0 && <p className="text-sm text-slate-600">No matching work items.</p>}
        <ul className="space-y-2">
          {visibleItems.map(item => <li key={item.id}>
            <button type="button" aria-pressed={selected?.id === item.id} onClick={() => setSelectedId(item.id)}
              className={'w-full rounded-lg border p-3 text-left ' + (selected?.id === item.id ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:bg-slate-50')}>
              <span className="block font-semibold">{item.firstName} {item.lastName}</span>
              <span className="block break-all text-xs text-slate-600">{item.patientMrn}</span>
              <span className="mt-1 line-clamp-2 block break-words text-sm">{item.instruction}</span>
            </button>
          </li>)}
        </ul>
      </aside>
      {selected && [selected].map(item => <form key={item.id} className="space-y-3 rounded-lg border border-slate-200 bg-white p-5" onSubmit={event => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const notes = String(data.get('notes')).trim();
      const temperature = String(data.get('temperatureC') ?? '').trim();
      const pulse = String(data.get('pulseBpm') ?? '').trim();
      if (Boolean(temperature) !== Boolean(pulse)) {
        setMessage('Enter both vital readings or leave both blank.');
        return;
      }
      const vitals = temperature && pulse ? { temperatureC: Number(temperature), pulseBpm: Number(pulse) } : undefined;
      void load({ id: item.id, notes, vitals, disposition: item.isPrescription ? String(data.get('disposition')) : undefined });
    }}>
      <h3 className="font-semibold">{item.firstName} {item.lastName}</h3>
      <p className="break-all text-sm">MRN {item.patientMrn}</p>
      <p className="whitespace-pre-wrap break-words"><strong>Request</strong>{' '}{item.instruction}</p>
      {item.recordedNotes && <p className="whitespace-pre-wrap break-words"><strong>Recorded result</strong>{' '}{item.recordedNotes}</p>}
      {item.isPrescription && <label className="block">Prescription disposition
        <select name="disposition" required defaultValue="" className="mt-1 block w-full rounded-md border border-slate-400 p-2">
          <option value="" disabled>Select disposition</option>
          <option value="dispensed">Dispensed</option>
          <option value="clarification">Returned for clarification</option>
        </select>
      </label>}
      {role === 'nurse' && <fieldset className="flex flex-wrap gap-3">
        <legend className="font-medium">Vital readings (optional)</legend>
        <label>Temperature (°C)<input name="temperatureC" type="number" min="20" max="50" step="0.1" className={scheduleInput} /></label>
        <label>Pulse (bpm)<input name="pulseBpm" type="number" min="1" max="350" step="1" className={scheduleInput} /></label>
      </fieldset>}
      <label className="block">Work notes
        <textarea name="notes" required maxLength={1500} rows={3} className="mt-1 block w-full rounded-md border border-slate-400 p-2" />
      </label>
      <button disabled={busy} className={scheduleButton}>{item.isPrescription ? 'Record prescription disposition' : departmentLabels[role].action}</button>
    </form>)}
    </div>}
  </section>;
}

const clinicianWorkstations = [
  { id: 'comms', label: 'Internal Staff Comms' },
  { id: 'bi', label: 'Executive Intelligence (BI)' },
  { id: 'hmis', label: 'Command Center & HMIS' },
  { id: 'workflow', label: 'Clinical Charts (OPD EMR)', available: true },
  { id: 'triage', label: 'Triage & Nursing Vitals' },
  { id: 'adt', label: 'Inpatient Wards & Beds (ADT)' },
  { id: 'results', label: 'Diagnostic Laboratory (LIS)', available: true },
  { id: 'blood', label: 'Blood Bank & Transfusion' },
  { id: 'imaging', label: 'Radiology & Imaging (PACS)' },
  { id: 'equipment', label: 'Equipment & Resources' },
  { id: 'pharmacy', label: 'Pharmacy & Drug Dispense' },
  { id: 'insurance', label: 'Insurance Verification' },
  { id: 'inventory', label: 'Inventory & Procurement' },
  { id: 'rosters', label: 'Staff Scheduling & Rosters' },
  { id: 'facilities', label: 'Biomedical & Facilities' },
  { id: 'quality', label: 'Quality & Safety Incidents' },
];

const pharmacyWorkstations = clinicianWorkstations
  .filter(item => !['bi', 'workflow', 'triage', 'imaging'].includes(item.id))
  .flatMap(item => item.id === 'pharmacy'
    ? [{ ...item, available: true }, { id: 'analytics', label: 'Pharmacy workload analytics', available: true }]
    : [{ ...item, available: false }]);

type ResultVisit = { id: string; patientMrn: string; firstName: string; lastName: string; encounterAt: string; hasResults: boolean; visitReleasedAt: string | null };
type DepartmentResult = {
  department: string; instruction: string; recordedResult: string | null;
  completionNotes: string; actor: string; completedAt: string; patientReleasedAt: string | null;
  prescriptionStatus: string | null; medication: string | null; directions: string | null; revision: number | null;
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

  async function release(id: string, summary: string) {
    setBusy(true);
    setMessage('');
    try {
      await request('/encounters/' + id + '/results/release', { summary });
      setMessage('Summary released to the patient portal.');
      setSelected(current => current?.id === id ? {
        id, rows: current.rows.map(row => row.department === 'lab' ? { ...row, patientReleasedAt: new Date().toISOString() } : row),
      } : current);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Release failed.');
    } finally { setBusy(false); }
  }

  async function resubmitPrescription(id: string, revision: number, form: FormData) {
    setBusy(true);
    setMessage('');
    try {
      await request('/encounters/' + id + '/prescription/resubmit', {
        revision, medication: String(form.get('medication')).trim(), directions: String(form.get('directions')).trim(),
      });
      setSelected(null);
      setVisits(await request<ResultVisit[]>('/encounters/results'));
      setMessage('Corrected prescription sent back to pharmacy.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Prescription resubmission failed.');
    } finally { setBusy(false); }
  }

  async function releaseVisit(id: string, form: FormData) {
    setBusy(true);
    setMessage('');
    try {
      await request('/encounters/' + id + '/visit-release', {
        summary: String(form.get('summary')).trim(),
        encounterType: String(form.get('encounterType')),
      });
      setVisits(current => current?.map(visit => visit.id === id
        ? { ...visit, visitReleasedAt: new Date().toISOString() } : visit) ?? null);
      setMessage('Visit summary released to the patient portal.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Visit release failed.');
    } finally { setBusy(false); }
  }

  return <section className="space-y-4">
    <h2 className="text-xl font-semibold">Department results</h2>
    <button type="button" className={scheduleButton} disabled={busy} onClick={() => void load()}>{visits ? 'Refresh results' : 'Load results'}</button>
    <p role="status">{message}</p>
    {visits?.length === 0 && <p>No completed assigned visits.</p>}
    {visits?.map(visit => <article key={visit.id} className="space-y-2 rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="font-semibold">{visit.firstName} {visit.lastName}</h3>
      <p className="break-all text-sm">MRN {visit.patientMrn} | {scheduleDate.format(new Date(visit.encounterAt))} (Monrovia)</p>
      {visit.hasResults && <button type="button" className={scheduleButton} disabled={busy} onClick={() => void load(visit.id)}>View department results</button>}
      {visit.visitReleasedAt ? <p className="font-medium text-teal-800">Visit summary released to patient portal</p>
        : <form className="space-y-3 border-t border-slate-200 pt-3" onSubmit={event => {
            event.preventDefault();
            void releaseVisit(visit.id, new FormData(event.currentTarget));
          }}>
            <label className="block">Encounter type
              <select name="encounterType" required defaultValue="" className="ml-2 rounded-md border border-slate-400 p-2">
                <option value="" disabled>Select encounter type</option>
                <option value="OPD">OPD</option>
                <option value="EMERGENCY">Emergency</option>
                <option value="INPATIENT">Inpatient</option>
                <option value="FOLLOWUP">Follow-up</option>
              </select>
            </label>
            <label className="block">Patient-facing visit summary
              <textarea name="summary" required maxLength={1500} rows={3} className="mt-1 block w-full rounded-md border border-slate-400 p-2" />
            </label>
            <label className="flex items-center gap-2"><input type="checkbox" required /> I reviewed this visit summary for the patient portal.</label>
            <button disabled={busy} className={scheduleButton}>Release visit summary</button>
          </form>}

      {selected?.id === visit.id && selected.rows.map(result => <section key={result.department} className="space-y-2 border-t border-slate-200 pt-3">
        <h4 className="font-semibold">{resultLabels[result.department] ?? result.department}</h4>
        <p className="whitespace-pre-wrap break-words"><strong>Request</strong>{' '}{result.instruction}</p>
        {result.recordedResult && <p className="whitespace-pre-wrap break-words"><strong>Released result</strong>{' '}{result.recordedResult}</p>}
        <p className="whitespace-pre-wrap break-words"><strong>{result.recordedResult ? 'Review notes' : 'Completion notes'}</strong>{' '}{result.completionNotes}</p>
        <p className="text-sm">Completed by {result.actor} on {scheduleDate.format(new Date(result.completedAt))} (Monrovia)</p>
        {result.prescriptionStatus === 'clarification' && result.revision !== null && <form className="space-y-3 rounded-md bg-slate-50 p-3" onSubmit={event => {
          event.preventDefault();
          void resubmitPrescription(visit.id, result.revision!, new FormData(event.currentTarget));
        }}>
          <h5 className="font-semibold">Correct returned prescription</h5>
          <label className="block">Medication<input name="medication" required maxLength={160} defaultValue={result.medication ?? ''} className={scheduleInput} /></label>
          <label className="block">Directions<textarea name="directions" required maxLength={500} defaultValue={result.directions ?? ''} className={scheduleInput} /></label>
          <button className={scheduleButton} disabled={busy}>Resubmit to pharmacy</button>
        </form>}
        {result.department === 'lab' && (result.patientReleasedAt
          ? <p className="font-medium text-teal-800">Released to patient portal</p>
          : <form className="space-y-3 rounded-md bg-slate-50 p-3" onSubmit={event => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              void release(visit.id, String(data.get('summary')).trim());
            }}>
              <label className="block font-medium">Patient-facing summary
                <textarea name="summary" required maxLength={1500} rows={3} className="mt-1 block w-full rounded-md border border-slate-400 p-2" />
              </label>
              <label className="flex items-center gap-2"><input type="checkbox" required /> I reviewed this summary for the patient portal.</label>
              <button disabled={busy} className={scheduleButton}>Release summary to patient</button>
            </form>)}

      </section>)}
    </article>)}
  </section>;
}

type BillingRecord = {
  id: string; firstName: string; lastName: string; currency: string; description: string;
  amountMinor: number; issuedAt: string; receiptId: string | null; paidAt: string | null;
};

const billingWorkstations = [
  ...clinicianWorkstations.filter(item => ['comms','bi','hmis','equipment','pharmacy','insurance'].includes(item.id)),
  { id: 'workflow', label: 'Billing & Invoicing', available: true },
  { id: 'ledger', label: 'General Ledger & Accounts' },
  { id: 'inventory', label: 'Inventory & Procurement' },
  { id: 'hr', label: 'HR, Staff & Payroll' },
  ...clinicianWorkstations.filter(item => ['rosters','facilities','quality'].includes(item.id)),
];

function CashierWorkspace({ role }: { role: 'billing' | 'cashier' }) {
  const [mrn, setMrn] = useState('');
  const [records, setRecords] = useState<BillingRecord[]>([]);
  const [document, setDocument] = useState<{ record: BillingRecord; receipt: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [draftId, setDraftId] = useState(() => crypto.randomUUID());

  async function run(action?: () => Promise<string>) {
    setBusy(true);
    setMessage('');
    try {
      const status = action ? await action() : '';
      setRecords(await request<BillingRecord[]>('/billing/' + encodeURIComponent(mrn.trim())));
      setMessage(status);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Billing request failed.');
    } finally { setBusy(false); }
  }

  return <section className="space-y-4">
    <style>{`@media print {
      body:has(#billing-document) > :not(:has(#billing-document)),
      body :has(#billing-document) > :not(:has(#billing-document)):not(#billing-document) {
        display: none !important;
      }
      body:has(#billing-document), body :has(#billing-document) {
        display: block !important;
        width: auto !important;
        max-width: none !important;
        height: auto !important;
        min-height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: visible !important;
      }
      #billing-document { margin: 0 !important; break-inside: avoid; }
    }`}</style>
    <h2 className="text-xl font-semibold">Billing &amp; Invoicing</h2>
    <form className="space-y-3 rounded-lg border border-slate-200 bg-white p-5" onSubmit={event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      if (role === 'cashier' || (event.nativeEvent as SubmitEvent).submitter?.getAttribute('value') === 'lookup') {
        void run();
        return;
      }
      const amount = String(form.get('amount')).trim();
      if (!/^\d{1,8}(\.\d{1,2})?$/.test(amount)) {
        setMessage('Enter an amount with up to two decimal places.');
        return;
      }
      const [whole, cents = ''] = amount.split('.');
      const amountMinor = Number(whole) * 100 + Number(cents.padEnd(2, '0'));
      void run(async () => {
        await request('/billing/invoices', { id: draftId, mrn: mrn.trim(), currency: String(form.get('currency')),
          description: String(form.get('description')).trim(), amountMinor });
        setDraftId(crypto.randomUUID());
        return 'Invoice issued.';
      });
    }}>
      <label className="block">Patient MRN<input value={mrn} onChange={event => {
        setMrn(event.target.value); setRecords([]); setDocument(null);
      }} required maxLength={36} className={scheduleInput} /></label>
      <button disabled={busy} formNoValidate value="lookup" className={scheduleButton}>Find invoices</button>
      {role === 'billing' && <>
      <label className="block">Charge description<input name="description" required maxLength={240} className={scheduleInput} /></label>
      <label className="block">Settlement currency<select name="currency" className={scheduleInput}><option>USD</option><option>LRD</option></select></label>
      <label className="block">Amount<input name="amount" required inputMode="decimal" className={scheduleInput} /></label>
      <button disabled={busy} className={scheduleButton}>Issue staging invoice</button>
      </>}
    </form>
    <p role="status">{message}</p>
    {records.map(record => <article key={record.id} className="space-y-2 rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="font-semibold">{record.description}</h3>
      <p>{record.currency} {(record.amountMinor / 100).toFixed(2)} · {record.receiptId ? 'Paid' : 'Outstanding'}</p>
      <div className="flex flex-wrap gap-2">
        <button className={scheduleButton} onClick={() => setDocument({ record, receipt: false })}>View invoice</button>
        {record.receiptId
          ? <button className={scheduleButton} onClick={() => setDocument({ record, receipt: true })}>View receipt</button>
          : role === 'cashier' && <button className={scheduleButton} disabled={busy} onClick={() => void run(async () => {
              await request('/billing/invoices/' + record.id + '/payment', {});
              setDocument(null);
              return 'Full staging payment recorded.';
            })}>Record full staging payment</button>}
      </div>
    </article>)}
    {document && <>
      <button className={scheduleButton} onClick={() => window.print()}>Print {document.receipt ? 'receipt' : 'invoice'}</button>
      <article id="billing-document" className="space-y-5 rounded-xl border border-teal-900 bg-white p-8">
        <header className="border-b-4 border-teal-800 pb-4">
          <p className="text-2xl font-bold text-teal-900">J &amp; J Memorial Health Center</p>
          <p>VOA East Community, Monrovia, Liberia</p>
          <p>contact@jjmemorial.totag.network</p>
        </header>
        <p className="font-semibold text-teal-800">STAGING · SYNTHETIC TEST DOCUMENT</p>
        <h3 className="text-xl font-bold">{document.receipt ? 'Payment receipt' : 'Invoice'}</h3>
        <p>{document.record.firstName} {document.record.lastName}</p>
        <p className="break-all">Invoice reference {document.record.id}</p>
        {document.receipt && <p className="break-all">Receipt reference {document.record.receiptId}</p>}
        <p>{scheduleDate.format(new Date(document.receipt ? document.record.paidAt! : document.record.issuedAt))} (Monrovia)</p>
        <div className="flex flex-wrap justify-between gap-2 border-y border-slate-200 py-4">
          <p>{document.record.description}</p>
          <p className="font-bold">{document.record.currency} {(document.record.amountMinor / 100).toFixed(2)}</p>
        </div>
        <p className="font-semibold">{document.record.receiptId ? 'Paid in full' : 'Payment outstanding'}</p>
      </article>
    </>}
  </section>;
}

type VirtualVisit = { id: string; reason: string; firstName: string; lastName: string; startsAt?: string };

function VirtualVisitWorkspace({ clinician }: { clinician: boolean }) {
  const [visits, setVisits] = useState<VirtualVisit[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function load(visit?: VirtualVisit, form?: FormData) {
    setBusy(true);
    setMessage('');
    try {
      if (visit && form) {
        await request('/virtual-visits/' + visit.id + '/schedule', {
          clinician: String(form.get('clinician')).trim().toLowerCase(),
          startsAt: String(form.get('startsAt')) + ':00Z',
        });
        setMessage('Virtual visit scheduled.');
      }
      setVisits(await request<VirtualVisit[]>(clinician ? '/virtual-visits/assigned' : '/virtual-visits'));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Virtual visits are unavailable.');
    } finally { setBusy(false); }
  }

  return <section className="space-y-4">
    <h2 className="text-xl font-semibold">{clinician ? 'Assigned virtual visits' : 'Virtual visit requests'}</h2>
    <button className={scheduleButton} disabled={busy} onClick={() => void load()}>{visits ? 'Refresh' : 'Load virtual visits'}</button>
    <p role="status">{message}</p>
    {visits?.length === 0 && <p>No virtual visits in this queue.</p>}
    {visits?.map(visit => <article key={visit.id} className="space-y-3 rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="font-semibold">{visit.firstName} {visit.lastName}</h3>
      <p className="whitespace-pre-wrap break-words">{visit.reason}</p>
      {clinician ? <p>{visit.startsAt && scheduleDate.format(new Date(visit.startsAt))} (Monrovia)</p> : <form className="space-y-3" onSubmit={event => {
        event.preventDefault();
        void load(visit, new FormData(event.currentTarget));
      }}>
        <label className="block">OPD clinician username<input name="clinician" required maxLength={64} className={scheduleInput} /></label>
        <label className="block">Date and time (Monrovia)<input name="startsAt" required type="datetime-local" className={scheduleInput} /></label>
        <button className={scheduleButton} disabled={busy}>Schedule virtual visit</button>
      </form>}
    </article>)}
  </section>;
}

const roleTitles: Record<Staff['role'], string> = {
  clinician: 'Clinician', nurse: 'Nursing', triage: 'Triage', lab_technician: 'Laboratory Technician',
  lab_reviewer: 'LIS Review', pharmacist: 'Pharmacy', super_admin: 'Administration', management: 'Management',
  billing: 'Billing', cashier: 'Cashier', registrar: 'Registration', viewer: 'Patient Lookup', restricted: 'Staff',
};

type DashboardMetric = { label: string; value: string | number };

type WorkspaceTrend = { label: string; days: { day: string; value: number }[] };

function ActivityTrend() {
  const [trend, setTrend] = useState<WorkspaceTrend | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    request<WorkspaceTrend>('/workspace/trends').then(value => { if (active) setTrend(value); })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, []);

  const peak = Math.max(1, ...(trend?.days.map(day => day.value) ?? []));
  return <figure className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <figcaption className="font-semibold">{trend?.label ?? 'Activity trend'}</figcaption>
    <p className="mt-1 text-sm text-slate-600">Last 7 days · Monrovia</p>
    {failed ? <p role="alert">Activity trend unavailable.</p> : !trend ? <p role="status">Loading trend...</p> :
      <ol className="mt-4 space-y-2">
        {trend.days.map(day => <li key={day.day} className="grid grid-cols-[4.5rem_1fr_2rem] items-center gap-3 text-sm">
          <time dateTime={day.day}>{day.day.slice(5)}</time>
          <div aria-hidden="true" className="h-3 rounded-full bg-slate-100"><div style={{ width: (day.value / peak * 100) + '%' }} className="h-full rounded-full bg-teal-700" /></div>
          <span className="text-right tabular-nums">{day.value}</span>
        </li>)}
      </ol>}
  </figure>;
}

function ManagementWorkspace() {
  const [metrics, setMetrics] = useState<DashboardMetric[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    request<DashboardMetric[]>('/workspace/management').then(value => { if (active) setMetrics(value); })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, []);
  return <section className="space-y-5">
    <header className="rounded-2xl bg-slate-900 p-6 text-white">
      <h2 className="text-2xl font-bold">Management</h2>
      <p className="mt-2 text-sm text-slate-300">Staging operational overview</p>
    </header>
    {failed ? <p role="alert">Management metrics unavailable.</p> : !metrics ? <p role="status">Loading metrics...</p> :
      <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map(metric => <div key={metric.label} className="rounded-xl border border-slate-200 bg-white p-5">
          <dt className="text-sm text-slate-600">{metric.label}</dt>
          <dd className="mt-2 text-3xl font-bold tabular-nums">{metric.value}</dd>
        </div>)}
      </dl>}
    <ActivityTrend />
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="font-semibold">Data sources</h3>
      <dl className="mt-3 divide-y divide-slate-200">
        {Object.entries({
          'Bed occupancy': 'Requires ward, bed and admission records.',
          'Inventory': 'Requires stock and movement records.',
          'Payer mix': 'Requires invoice payer and insurance claim records.',
          'Facility telemetry': 'Requires a connected monitoring feed.',
        }).map(([label, detail]) => <div key={label} className="grid gap-1 py-3 sm:grid-cols-2">
          <dt className="font-medium">{label}</dt><dd className="text-sm text-slate-600">{detail}</dd>
        </div>)}
      </dl>
    </section>
  </section>;
}

function WorkspaceOverview({ staff, onOpen }: { staff: Staff; onOpen: () => void }) {
  const [metrics, setMetrics] = useState<DashboardMetric[] | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    request<DashboardMetric[]>('/workspace/metrics').then(rows => {
      if (active) setMetrics(rows);
    }).catch(() => {
      if (active) setError(true);
    });
    return () => { active = false; };
  }, []);

  async function refresh() {
    setLoading(true);
    setError(false);
    try { setMetrics(await request<DashboardMetric[]>('/workspace/metrics')); }
    catch { setError(true); }
    finally { setLoading(false); }
  }

  return <section className="space-y-5" aria-labelledby="workspace-overview">
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
      <div>
        <p className="text-sm font-medium text-teal-300">Staging workspace</p>
        <h2 id="workspace-overview" className="mt-2 text-2xl font-bold sm:text-3xl">{roleTitles[staff.role]} overview</h2>
        <p className="mt-2 text-sm text-slate-300">{staff.username}</p>
      </div>
      <button type="button" onClick={onOpen} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-teal-100 px-4 font-semibold text-teal-950">
        Open workstation <ArrowUpRight size={16} aria-hidden="true" />
      </button>
    </header>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h3 className="font-semibold">Workload and activity</h3>
      <button type="button" disabled={loading} onClick={() => void refresh()} className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold">Refresh metrics</button>
    </div>
    {error && <p role="alert">Metrics are temporarily unavailable.</p>}
    {!metrics && !error && <p role="status">Loading metrics...</p>}
    {metrics?.length === 0 && <p>No staging activity to report.</p>}
    <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {metrics?.map(metric => <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <Activity size={18} className="mb-4 text-teal-700" aria-hidden="true" />
        <dt className="text-sm font-medium text-slate-600">{metric.label}</dt>
        <dd className="mt-1 text-3xl font-bold tabular-nums text-slate-950">{metric.value}</dd>
      </div>)}
    </dl>
    <ActivityTrend />
  </section>;
}

type StaffAccessPage = { staff: (Staff & { clinicianId: string | null })[]; next: string | null };

function StaffAccessReview() {
  const [page, setPage] = useState<StaffAccessPage | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function load(after = '') {
    setBusy(true);
    setMessage('');
    try {
      setPage(await request<StaffAccessPage>('/admin/staff?after=' + encodeURIComponent(after)));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Staff access review is unavailable.');
    } finally {
      setBusy(false);
    }
  }

  return <section className="space-y-4">
    <h2 className="text-xl font-semibold">Staff access review</h2>
    <button type="button" className={scheduleButton} disabled={busy} onClick={() => void load()}>Load staff accounts</button>
    <p role="status">{message}</p>
    {page && <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-100"><tr>
          {['Username', 'Account role', 'Department assignments', 'Clinician profile'].map(label => <th key={label} scope="col" className="p-3">{label}</th>)}
        </tr></thead>
        <tbody>{page.staff.map(account => <tr key={account.username} className="border-t border-slate-200">
          <th scope="row" className="p-3 font-medium">{account.username}</th>
          <td className="p-3">{account.role.replaceAll('_', ' ')}</td>
          <td className="p-3">{account.departments?.map(d => d.name + ' (' + d.role.replaceAll('_', ' ') + ')').join(', ') || 'None'}</td>
          <td className="p-3">{account.clinicianId ? clinicianNames[account.clinicianId] ?? account.clinicianId : 'None'}</td>
        </tr>)}</tbody>
      </table>
    </div>}
    {page?.next && <button type="button" className={scheduleButton} disabled={busy} onClick={() => void load(page.next ?? '')}>Next page</button>}
  </section>;
}

export function PatientRegistryPage() {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [section, setSection] = useState('overview');
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

  const sections = staff && (staff.role === 'management' ? [{ id: 'management', label: 'Management' }] : staff.role === 'billing' || staff.role === 'cashier' ? billingWorkstations : staff.role === 'super_admin' ? [{ id: 'management', label: 'Management' }, { id: 'workflow', label: 'Staff access review' }] : staff.role === 'pharmacist' ? pharmacyWorkstations : isDepartmentRole(staff.role) ? [
    { id: 'workflow', label: 'Work queue' }, { id: 'analytics', label: 'Workload analytics' },
  ] : staff.role === 'registrar' ? [
    { id: 'workflow', label: 'Registration and lookup' }, { id: 'appointments', label: 'Appointments and calendar' },
    { id: 'notifications', label: 'Appointment notifications' }, { id: 'virtual', label: 'Virtual visit scheduling' },
  ] : staff.role === 'clinician' ? [...clinicianWorkstations, { id: 'virtual', label: 'Virtual Care & Telehealth', available: true }] : staff.role === 'restricted' ? [] : [
    { id: 'workflow', label: staff.role === 'viewer' ? 'Patient lookup' : staff.role === 'triage' ? 'Triage queue' : 'Assigned encounters' },
  ]);

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900">
      <div className={staff ? "mx-auto max-w-7xl" : "mx-auto max-w-3xl"}>
        <a href="/" className="font-semibold text-teal-800 underline">J &amp; J Memorial homepage</a>
        <h1 className="mt-5 text-3xl font-bold">{staff ? roleTitles[staff.role] + ' workstation' : 'Staging staff access'}</h1>
        <p className="mt-2 text-slate-700">Use synthetic patient data only.</p>
        {staff && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <p>Signed in as <strong>{staff.username}</strong> ({staff.role})</p>
            {staff.departments?.some(department => department.role === staff.role)
              ? <p className="text-sm">{staff.departments.filter(department => department.role === staff.role).map(department => department.name).join(', ')}</p>
              : (staff.role === 'clinician' || staff.role === 'triage' || isDepartmentRole(staff.role)) && <p className="text-sm">No department assigned for this role.</p>}
          </div>
          <button disabled={busy} className="min-h-11 rounded-md border border-slate-400 px-4" onClick={() => void perform(async () => {
            await request('/logout', {});
            setStaff(null);
            setSection('overview');
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
          <div className="grid gap-5 xl:grid-cols-[15rem_minmax(0,1fr)]">
            <nav aria-label="Staff workspace" className="self-start rounded-2xl border border-slate-200 bg-white p-3 shadow-sm xl:sticky xl:top-5 xl:max-h-[calc(100vh-2.5rem)] xl:overflow-y-auto">
              <p className="mb-2 px-2 text-sm font-semibold">{staff.role === 'clinician' ? 'Clinician workstations' : staff.role === 'pharmacist' ? 'Pharmacy workstations' : staff.role === 'billing' || staff.role === 'cashier' ? 'Billing workstations' : 'Workspace'}</p>
              {staff.role !== 'viewer' && staff.role !== 'restricted' && staff.role !== 'management' && <button type="button" aria-current={section === 'overview' ? 'page' : undefined}
                className={'mb-2 flex min-h-11 w-full items-center gap-2 rounded-lg px-2 text-left text-sm font-semibold ' + (section === 'overview' ? 'bg-teal-900 text-white' : 'text-teal-900 hover:bg-teal-50')}
                onClick={() => setSection('overview')}><LayoutDashboard size={16} aria-hidden="true" /> Overview</button>}
              {sections?.map(item => <button key={item.id} type="button" aria-current={(section === item.id || staff.role === 'management' && item.id === 'management' || staff.role === 'pharmacist' && section === 'workflow' && item.id === 'pharmacy') ? 'page' : undefined}
                disabled={'available' in item && !item.available || ['clinician', 'billing', 'cashier'].includes(staff.role) && !('available' in item)}
                className={'mb-1 block min-h-11 disabled:cursor-not-allowed disabled:text-slate-500 w-full rounded-md px-2 text-left text-sm ' + ((section === item.id || staff.role === 'management' && item.id === 'management' || staff.role === 'pharmacist' && section === 'workflow' && item.id === 'pharmacy') ? 'bg-teal-100 font-semibold text-teal-950' : 'hover:bg-slate-100')}
                onClick={() => setSection(item.id)}>{item.label}</button>)}
              {sections?.length === 0 && <p className="px-2 text-sm">No workflows assigned.</p>}
            </nav>
            <div>
            {staff.role === 'management' ? <ManagementWorkspace /> : section === 'overview' && staff.role !== 'viewer' && staff.role !== 'restricted'
              ? <WorkspaceOverview key={staff.username} staff={staff} onOpen={() => setSection(staff.role === 'pharmacist' ? 'pharmacy' : 'workflow')} />
              : staff.role === 'cashier' || staff.role === 'billing' ? <CashierWorkspace role={staff.role} /> : staff.role === 'super_admin' ? (section === 'management' ? <ManagementWorkspace /> : <StaffAccessReview />) : isDepartmentRole(staff.role) ? <DepartmentWorkspace key={staff.role} role={staff.role} analytics={section === 'analytics'} />
            : staff.role === 'registrar' && section === 'appointments' ? <AppointmentQueue />
            : staff.role === 'registrar' && section === 'notifications' ? <AppointmentNotifications />
            : section === 'virtual' && (staff.role === 'registrar' || staff.role === 'clinician') ? <VirtualVisitWorkspace clinician={staff.role === 'clinician'} />
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
