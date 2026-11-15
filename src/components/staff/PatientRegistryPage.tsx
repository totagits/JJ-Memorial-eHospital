import React, { useEffect, useState } from 'react';

type Staff = { username: string; role: 'registrar' | 'viewer' | 'restricted' };
type Patient = { mrn: string; firstName: string; lastName: string; birthDate: string };

type AppointmentRequest = {
  id: string; firstName: string; lastName: string; phone: string; email: string | null;
  department: string; clinicianId: string | null; date: string; timeSlot: string; reason: string;
  patientMrn: string | null; status: 'pending' | 'contacted';
};

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
      409: 'This request is already closed. Refresh the queue.',
    };
    throw new Error(messages[response.status] ?? 'The registry is temporarily unavailable.');
  }
  return response.status === 204 ? undefined as T : response.json();
}

function AppointmentQueue() {
  const [items, setItems] = useState<AppointmentRequest[] | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function update(action?: () => Promise<void>) {
    setBusy(true);
    setMessage('');
    try {
      if (action) await action();
      setItems(await request<AppointmentRequest[]>('/appointments'));
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
          {items ? 'Refresh queue' : 'Load queue'}
        </button>
      </div>
      <p role="status" className="mt-2">{message}</p>
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
          </li>
        ))}
      </ul>}
    </section>
  );
}

export function PatientRegistryPage() {
  const [staff, setStaff] = useState<Staff | null>(null);
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

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <a href="/" className="font-semibold text-teal-800 underline">J &amp; J Memorial homepage</a>
        <h1 className="mt-5 text-3xl font-bold">Staging patient registry</h1>
        <p className="mt-2 text-slate-700">Use synthetic patient data only.</p>
        {staff && <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p>Signed in as <strong>{staff.username}</strong> ({staff.role})</p>
          <button disabled={busy} className="min-h-11 rounded-md border border-slate-400 px-4" onClick={() => void perform(async () => {
            await request('/logout', {});
            setStaff(null);
            setPatient(null);
          })}>Sign out</button>
        </div>}
        <p role="status" className="my-4 text-slate-800">{status}</p>
        {!staff ? (
          <form className="max-w-md space-y-4 rounded-lg border border-slate-200 bg-white p-5" onSubmit={submit(async data => {
            setStaff(await request<Staff>('/session', {
              username: String(data.get('username')).trim().toLowerCase(),
              accessKey: String(data.get('accessKey')).trim(),
            }));
          })}>
            <h2 className="text-xl font-semibold">Staff sign-in</h2>
            <label className="block">Username<input className={input} name="username" autoComplete="username" required /></label>
            <label className="block">Access key<input className={input} name="accessKey" type="password" autoComplete="current-password" required /></label>
            <button className={button} disabled={busy}>Sign in</button>
          </form>
        ) : staff.role === 'restricted' ? <p>Your staff role has no patient registry access.</p> : (
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
            {staff.role === 'registrar' && <AppointmentQueue />}
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
    </main>
  );
}
