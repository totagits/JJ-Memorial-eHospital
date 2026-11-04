import React, { useState, useEffect } from 'react';
import { dbStore } from '../../services/dbStore';
import { TriageEntry, Patient } from '../../types';
import { AlertCircle, Plus, Clock, User, HeartPulse, CheckCircle2, ShieldAlert, ArrowUpRight } from 'lucide-react';

export const TriageQueue: React.FC = () => {
  const [queue, setQueue] = useState<TriageEntry[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [mrn, setMrn] = useState('');
  const [age, setAge] = useState<number>(32);
  const [gender, setGender] = useState('Female');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [temp, setTemp] = useState<number>(37.2);
  const [systolic, setSystolic] = useState<number>(125);
  const [diastolic, setDiastolic] = useState<number>(82);
  const [heartRate, setHeartRate] = useState<number>(80);
  const [spo2, setSpo2] = useState<number>(97);
  const [respRate, setRespRate] = useState<number>(18);
  const [painScore, setPainScore] = useState<number>(4);
  const [urgency, setUrgency] = useState<TriageEntry['urgency']>('Yellow');
  const [assignedDoctor, setAssignedDoctor] = useState('Dr. Emmanuel Tamba, MD');
  const [triageNurse, setTriageNurse] = useState('Nurse Sarah Kiatamba, RN');
  const [filterUrgency, setFilterUrgency] = useState<'All' | 'Red' | 'Yellow' | 'Green'>('All');

  useEffect(() => {
    const update = () => {
      setQueue(dbStore.getTriageQueue());
      setPatients(dbStore.getPatients());
    };
    update();
    return dbStore.subscribe(update);
  }, []);

  const handlePatientSelectChange = (patId: string) => {
    setSelectedPatientId(patId);
    const pat = patients.find((p) => p.id === patId);
    if (pat) {
      setPatientName(pat.name);
      setMrn(pat.mrn);
      setGender(pat.gender);
    }
  };

  const handleAddTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !chiefComplaint) return;

    await dbStore.addTriageEntry({
      patientId: selectedPatientId || `pat-${Date.now()}`,
      patientName,
      mrn: mrn || `JJM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      age: Number(age),
      gender,
      arrivalTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      chiefComplaint,
      vitals: {
        temp: Number(temp),
        bp: `${systolic}/${diastolic}`,
        heartRate: Number(heartRate),
        spo2: Number(spo2),
        respRate: Number(respRate),
        painScore: Number(painScore),
      },
      urgency,
      assignedDoctor,
      triageNurse,
    });

    setIsAdding(false);
    setChiefComplaint('');
  };

  // Sort: Red first, then Yellow, then Green
  const sortedQueue = [...queue].sort((a, b) => {
    const weight = { Red: 3, Yellow: 2, Green: 1 };
    return weight[b.urgency] - weight[a.urgency];
  });

  const filteredQueue = filterUrgency === 'All'
    ? sortedQueue
    : sortedQueue.filter((q) => q.urgency === filterUrgency);

  const redCount = queue.filter((q) => q.urgency === 'Red').length;
  const yellowCount = queue.filter((q) => q.urgency === 'Yellow').length;
  const greenCount = queue.filter((q) => q.urgency === 'Green').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Emergency & OPD Clinical Acuity</span>
          </div>
          <h2 className="text-2xl font-extrabold text-hospital-navy mt-1">
            Emergency Triage Queue
          </h2>
          <p className="text-xs text-slate-500">
            Nurses record initial patient vitals, calculate acuity scores, and prioritize admissions according to the South African / WHO Triage Scale.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Close Triage Form' : 'Input Patient Vitals & Acuity'}</span>
        </button>
      </div>

      {/* Summary Urgency Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setFilterUrgency('All')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            filterUrgency === 'All' ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white border-slate-200'
          }`}
        >
          <span className="text-xs font-bold uppercase tracking-wider opacity-70">Total Active Queue</span>
          <div className="text-2xl font-black mt-1">{queue.length} Patients</div>
        </div>

        <div
          onClick={() => setFilterUrgency('Red')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            filterUrgency === 'Red' ? 'bg-rose-600 text-white border-rose-600 shadow-md' : 'bg-white border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">Emergency (Red)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          </div>
          <div className="text-2xl font-black mt-1">{redCount} Resuscitation STAT</div>
        </div>

        <div
          onClick={() => setFilterUrgency('Yellow')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            filterUrgency === 'Yellow' ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md' : 'bg-white border-amber-200 text-amber-900'
          }`}
        >
          <span className="text-xs font-bold uppercase tracking-wider">Urgent (Yellow)</span>
          <div className="text-2xl font-black mt-1">{yellowCount} Within 30 Mins</div>
        </div>

        <div
          onClick={() => setFilterUrgency('Green')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            filterUrgency === 'Green' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white border-emerald-200 text-emerald-900'
          }`}
        >
          <span className="text-xs font-bold uppercase tracking-wider">Standard (Green)</span>
          <div className="text-2xl font-black mt-1">{greenCount} Routine Walk-in</div>
        </div>
      </div>

      {/* Triage Nurse Input Form */}
      {isAdding && (
        <form onSubmit={handleAddTriage} className="p-6 bg-white rounded-2xl border border-teal-300 shadow-lg space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h4 className="font-bold text-hospital-navy text-sm flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-teal-600" />
              Patient Vitals Intake & Acuity Assessment
            </h4>
            <span className="text-xs text-teal-700 font-semibold">Triage Station 1</span>
          </div>

          {/* Patient Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Select Existing Patient (or enter below)</label>
              <select
                value={selectedPatientId}
                onChange={(e) => handlePatientSelectChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="">-- Choose registered patient or enter walk-in --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.mrn}) &bull; {p.phone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Patient Name *</label>
              <input
                type="text"
                required
                placeholder="Patient Name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">MRN Number</label>
              <input
                type="text"
                placeholder="e.g. JJM-2026-0042"
                value={mrn}
                onChange={(e) => setMrn(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Vitals Input Row */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Temp (&deg;C) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg font-bold focus:ring-2 ${
                  temp >= 38.5 ? 'border-rose-400 bg-rose-50 text-rose-800' : 'border-slate-300'
                }`}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Systolic BP</label>
              <input
                type="number"
                required
                value={systolic}
                onChange={(e) => setSystolic(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Diastolic BP</label>
              <input
                type="number"
                required
                value={diastolic}
                onChange={(e) => setDiastolic(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Heart Rate (BPM)</label>
              <input
                type="number"
                required
                value={heartRate}
                onChange={(e) => setHeartRate(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">SPO2 (%) *</label>
              <input
                type="number"
                required
                value={spo2}
                onChange={(e) => setSpo2(Number(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg font-bold focus:ring-2 ${
                  spo2 < 93 ? 'border-rose-400 bg-rose-50 text-rose-800' : 'border-slate-300'
                }`}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pain Score (1-10)</label>
              <input
                type="number"
                min="0"
                max="10"
                value={painScore}
                onChange={(e) => setPainScore(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Chief Complaint & Urgency Level Assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs">
            <div className="sm:col-span-8">
              <label className="block font-semibold text-slate-700 mb-1">
                Chief Complaint / Presenting Clinical Signs *
              </label>
              <textarea
                required
                rows={2}
                placeholder="e.g. Severe chest pain radiating to left arm, acute respiratory distress, severe persistent diarrhea..."
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="sm:col-span-4 space-y-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Assigned Triage Urgency Level *
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setUrgency('Red')}
                  className={`py-2 px-1 text-center rounded-lg font-extrabold uppercase text-[11px] border transition ${
                    urgency === 'Red'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  RED (STAT)
                </button>
                <button
                  type="button"
                  onClick={() => setUrgency('Yellow')}
                  className={`py-2 px-1 text-center rounded-lg font-extrabold uppercase text-[11px] border transition ${
                    urgency === 'Yellow'
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  YELLOW
                </button>
                <button
                  type="button"
                  onClick={() => setUrgency('Green')}
                  className={`py-2 px-1 text-center rounded-lg font-extrabold uppercase text-[11px] border transition ${
                    urgency === 'Green'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  GREEN
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
            >
              Push Patient to OPD Triage Queue
            </button>
          </div>
        </form>
      )}

      {/* Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <h4 className="font-bold text-hospital-navy text-sm">
            Active Patients Waiting for Consultation ({filteredQueue.length})
          </h4>
          <span className="text-xs text-slate-400">Auto-sorted by clinical acuity</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredQueue.map((item) => (
            <div
              key={item.id}
              className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:bg-slate-50/80 ${
                item.urgency === 'Red' ? 'border-l-4 border-l-rose-500 bg-rose-50/20' : ''
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                    item.urgency === 'Red'
                      ? 'bg-rose-600 text-white animate-pulse'
                      : item.urgency === 'Yellow'
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {item.urgency}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h5 className="font-bold text-slate-900 text-sm">
                      {item.patientName}
                    </h5>
                    <span className="font-mono text-xs font-bold text-teal-800 bg-teal-100/70 px-1.5 py-0.2 rounded">
                      {item.mrn}
                    </span>
                    <span className="text-xs text-slate-500">
                      {item.age} yrs &bull; {item.gender}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" /> Arrived: {item.arrivalTime}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-medium">
                    {item.chiefComplaint}
                  </p>

                  {/* Vitals Telemetry Line */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-600 pt-1">
                    <span className={`px-1.5 py-0.5 rounded ${item.vitals.temp >= 38.5 ? 'bg-rose-100 text-rose-800 font-bold' : 'bg-slate-100'}`}>
                      Temp: {item.vitals.temp}&deg;C
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100">
                      BP: {item.vitals.bp} mmHg
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100">
                      HR: {item.vitals.heartRate} bpm
                    </span>
                    <span className={`px-1.5 py-0.5 rounded ${item.vitals.spo2 < 93 ? 'bg-rose-100 text-rose-800 font-bold' : 'bg-slate-100'}`}>
                      SPO2: {item.vitals.spo2}%
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100">
                      Pain: {item.vitals.painScore}/10
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span className="text-xs text-slate-500 hidden md:inline">
                  Assigned: <strong>{item.assignedDoctor?.split(' ')[1]}</strong>
                </span>
                <button
                  onClick={() => alert(`Calling ${item.patientName} (${item.mrn}) to Consulting Room 1.`)}
                  className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
                >
                  Call to Room
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
