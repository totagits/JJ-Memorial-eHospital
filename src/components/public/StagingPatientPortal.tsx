import { useEffect, useState, type FormEvent } from 'react';

type Profile = { mrn: string; firstName: string; lastName: string; appointments: { id: string; department: string; startsAt: string; status: string; change: { kind: string; status: string } | null }[] };
const visitTime = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Monrovia' });
const endpoint = '/api/registry/patient-portal';
const button = 'min-h-11 rounded-lg bg-teal-800 px-4 font-semibold text-white disabled:opacity-50';
const input = 'mt-1 block min-h-11 w-full rounded-md border border-slate-400 px-3';

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
    } catch { setMessage('Sign-out failed. Please try again.'); }
    finally { setBusy(false); }
  }

  return <section className="mx-auto max-w-3xl px-5 py-12">
    <h1 className="text-3xl font-bold">Staging patient portal</h1>
    <p className="mt-2 text-slate-700">Use synthetic patient data only.</p>
    <p role="status" className="my-4">{message || (busy ? 'Loading…' : '')}</p>
    {patient ? <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{patient.firstName} {patient.lastName}</h2>
          <p className="break-all">Medical record number {patient.mrn}</p>
        </div>
        <button type="button" disabled={busy} className={button} onClick={() => void signOut()}>Sign out</button>
      </div>
      <h3 className="font-semibold">Upcoming appointments</h3>
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
    </div> : <form className="max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-5" onSubmit={signIn}>
      <h2 className="text-xl font-semibold">Patient sign-in</h2>
      <label className="block">Username<input className={input} name="username" autoComplete="username" maxLength={64} required /></label>
      <label className="block">Access key<input className={input} name="accessKey" type="password" autoComplete="current-password" maxLength={64} required /></label>
      <button className={button} disabled={busy}>Sign in</button>
    </form>}
  </section>;
}
