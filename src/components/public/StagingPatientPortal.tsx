import { useEffect, useState, type FormEvent } from 'react';

const encounterTypes = { OPD: 'OPD', EMERGENCY: 'Emergency', INPATIENT: 'Inpatient', FOLLOWUP: 'Follow-up' } as const;
type EncounterType = keyof typeof encounterTypes;
type Visit = { id: string; department: string; encounterType: EncounterType; encounterAt: string; summary: string; releasedAt: string };
type Profile = { visits?: Visit[]; mrn: string; firstName: string; lastName: string; appointments: { id: string; department: string; startsAt: string; status: string; change: { kind: string; status: string } | null }[]; labResults: { id: string; summary: string; releasedAt: string }[] };
const visitTime = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Monrovia' });
const endpoint = '/api/registry/patient-portal';
const button = 'min-h-11 rounded-lg bg-teal-800 px-4 font-semibold text-white disabled:opacity-50';
const input = 'mt-1 block min-h-11 w-full rounded-md border border-slate-400 px-3';

const workspaceSections = [
  ['health', 'My Health Dashboard'],
  ['history', 'Medical History & Visits'],
  ['appointments', 'Appointments'],
  ['lab', 'Diagnostic Reports'],
  ['prescriptions', 'Prescriptions'],
  ['billing', 'Invoices & Receipts'],
  ['telehealth', 'Virtual Care & Telehealth'],
  ['vitals', 'Vitals Tracker'],
] as const;
type WorkspaceSection = typeof workspaceSections[number][0];

async function profile(): Promise<Profile | null> {
  const response = await fetch(endpoint + '/me');
  if (response.status === 401) return null;
  if (!response.ok) throw new Error('The patient portal is temporarily unavailable.');
  return response.json();
}

export function StagingPatientPortal() {
  const [patient, setPatient] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState('');
  const [encounterType, setEncounterType] = useState('');
  const [section, setSection] = useState<WorkspaceSection>('health');

  useEffect(() => {
    let active = true;
    profile().then(value => { if (active) setPatient(value); })
      .catch(() => { if (active) setMessage('The patient portal is temporarily unavailable.'); })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, []);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const username = String(data.get('username')).trim().toLowerCase();
    const accessKey = String(data.get('accessKey')).trim();
    form.reset();
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(endpoint + '/session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, accessKey }),
      });
      if (response.status === 401) throw new Error('Check your patient username and access key.');
      if (!response.ok) throw new Error('The patient portal is temporarily unavailable.');
      setPatient(await profile());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Sign-in failed.');
    } finally { setBusy(false); }
  }

  async function requestChange(id: string, kind: 'cancel' | 'reschedule') {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(endpoint + '/appointments/' + id + '/change', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind }),
      });
      if (response.status === 409) throw new Error('This appointment already has a pending request or can no longer be changed.');
      if (response.status !== 201) throw new Error('The request could not be saved. Refresh and try again.');
      setPatient(await profile());
      setMessage('Request sent for staff review.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The request failed.');
    } finally { setBusy(false); }
  }

  async function signOut() {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(endpoint + '/logout', { method: 'POST' });
      if (!response.ok) throw new Error();
      setPatient(null);
      setSection('health');
      setEncounterType('');
    } catch { setMessage('Sign-out failed. Please try again.'); }
    finally { setBusy(false); }
  }

  return <section className="mx-auto max-w-3xl px-5 py-12">
    <h1 className="text-3xl font-bold">Staging patient portal</h1>
    <p className="mt-2 text-slate-700">Use synthetic patient data only.</p>
    <p role="status" className="my-4">{message || (busy ? 'Loadingâ€¦' : '')}</p>
    {patient ? <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{patient.firstName} {patient.lastName}</h2>
          <p className="break-all">Medical record number {patient.mrn}</p>
        </div>
        <button type="button" disabled={busy} className={button} onClick={() => void signOut()}>Sign out</button>
      </div>
      <nav aria-label="Patient workspace" className="flex flex-wrap gap-2 border-y border-slate-200 py-3">
        {workspaceSections.map(([id, label]) => {
          const count = id === 'appointments' ? patient.appointments.length : id === 'lab' ? patient.labResults?.length ?? 0 : id === 'history' ? patient.visits?.length ?? 0 : null;
          return <button key={id} type="button" aria-current={section === id ? 'page' : undefined}
            className={section === id ? button : 'min-h-11 rounded-lg px-3 text-teal-800 hover:bg-teal-50'}
            onClick={() => setSection(id)}>{label}{count === null ? '' : ` (${count})`}</button>;
        })}
      </nav>
      {section === 'health' && <section>
        <h3 className="font-semibold">My Health Dashboard</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className={button} onClick={() => setSection('appointments')}>View appointments</button>
          <button type="button" className={button} onClick={() => setSection('lab')}>View diagnostic reports</button>
        </div>
      </section>}
      {section === 'history' && <section className="space-y-3">
        <h3 className="font-semibold">Medical History &amp; Visits</h3>
        <label className="block max-w-xs">Encounter Type
          <select className={input} value={encounterType} onChange={event => setEncounterType(event.target.value)}>
            <option value="">All Visits</option>
            {Object.entries(encounterTypes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <ul className="divide-y divide-slate-200">
          {(patient.visits ?? []).filter(visit => !encounterType || visit.encounterType === encounterType).map(visit => <li key={visit.id} className="space-y-1 py-3">
            <p className="font-semibold">{visit.department} · {encounterTypes[visit.encounterType]}</p>
            <p className="text-sm text-slate-600">{visitTime.format(new Date(visit.encounterAt))} (Monrovia)</p>
            <p className="whitespace-pre-wrap break-words">{visit.summary}</p>
          </li>)}
        </ul>
        {!patient.visits?.some(visit => !encounterType || visit.encounterType === encounterType) && <p>No released visit summaries match this filter.</p>}
      </section>}
      {section !== 'health' && section !== 'history' && section !== 'appointments' && section !== 'lab' && <section>
        <h3 className="font-semibold">{workspaceSections.find(([id]) => id === section)?.[1]}</h3>
        <p className="mt-3 text-slate-700">This section is not yet available in the staging patient portal.</p>
      </section>}
      {section === 'appointments' && <section aria-labelledby="patient-appointments">
      <h3 id="patient-appointments" className="scroll-mt-24 font-semibold" tabIndex={-1}>Upcoming appointments</h3>
      {patient.appointments.length === 0 ? <p>No upcoming appointments.</p> : <ul className="divide-y divide-slate-200">
        {patient.appointments.map(item => <li key={item.id} className="space-y-2 py-3">
          <p className="font-medium">{item.department}</p><p>{visitTime.format(new Date(item.startsAt))} (Monrovia)</p>
          {item.status === 'cancelled' && <p className="font-medium">Cancelled</p>}
          {item.change && <p>{item.change.kind === 'cancel' ? 'Cancellation' : 'Reschedule'} request {item.change.status}.</p>}
          {item.status === 'scheduled' && item.change?.status !== 'pending' && <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy} className="min-h-11 rounded-md border border-slate-400 px-3" onClick={() => void requestChange(item.id, 'reschedule')}>Request reschedule</button>
            <button type="button" disabled={busy} className="min-h-11 rounded-md border border-slate-400 px-3" onClick={() => void requestChange(item.id, 'cancel')}>Request cancellation</button>
          </div>}
        </li>)}
      </ul>}
      </section>}
      {section === 'lab' && <section aria-labelledby="patient-lab-results" className="border-t border-slate-200 pt-4">
        <h3 id="patient-lab-results" className="scroll-mt-24 font-semibold" tabIndex={-1}>Released laboratory summaries</h3>
        {!patient.labResults?.length ? <p className="mt-2">No released laboratory summaries.</p> : <ul className="divide-y divide-slate-200">
          {patient.labResults.map(result => <li key={result.id} className="space-y-1 py-3">
            <p className="text-sm text-slate-600">Released {visitTime.format(new Date(result.releasedAt))} (Monrovia)</p>
            <p className="whitespace-pre-wrap break-words">{result.summary}</p>
          </li>)}
        </ul>}
      </section>}
    </div> : <form className="max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-5" onSubmit={signIn}>
      <h2 className="text-xl font-semibold">Patient sign-in</h2>
      <label className="block">Username<input className={input} name="username" autoComplete="username" maxLength={64} required /></label>
      <label className="block">Access key<input className={input} name="accessKey" type="password" autoComplete="current-password" maxLength={64} required /></label>
      <button className={button} disabled={busy}>Sign in</button>
    </form>}
  </section>;
}
