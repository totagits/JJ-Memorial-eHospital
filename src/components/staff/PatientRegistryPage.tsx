import React, { useEffect, useState } from 'react';

type Staff = { username: string; role: 'registrar' | 'viewer' | 'restricted' };
type Patient = { mrn: string; firstName: string; lastName: string; birthDate: string };

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
      404: 'No patient was found with that medical record number.',
    };
    throw new Error(messages[response.status] ?? 'The registry is temporarily unavailable.');
  }
  return response.status === 204 ? undefined as T : response.json();
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
