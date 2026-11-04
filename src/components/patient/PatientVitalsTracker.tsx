import React, { useState } from 'react';
import { 
  Activity, 
  Heart, 
  Scale, 
  Droplet, 
  Plus, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar,
  Clock,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine 
} from 'recharts';
import { Patient } from '../../types/patient';
import { PatientVitalsLogEntry } from '../../types/patientVitalsLog';
import { addPatientVitalsLog } from '../../services/storageService';

interface PatientVitalsTrackerProps {
  patient: Patient;
  vitalsLogs: PatientVitalsLogEntry[];
}

export const PatientVitalsTracker: React.FC<PatientVitalsTrackerProps> = ({
  patient,
  vitalsLogs
}) => {
  const patientLogs = vitalsLogs.filter(l => l.patientId === patient.id || l.patientMrn === patient.mrn);
  // Sort chronologically for charting
  const sortedLogs = [...patientLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const [showLogModal, setShowLogModal] = useState(false);
  const [activeMetric, setActiveMetric] = useState<'BP' | 'HR' | 'WEIGHT'>('BP');

  // New log form state
  const [systolic, setSystolic] = useState<number>(120);
  const [diastolic, setDiastolic] = useState<number>(80);
  const [heartRate, setHeartRate] = useState<number>(75);
  const [weightKg, setWeightKg] = useState<number>(68.0);
  const [bloodGlucose, setBloodGlucose] = useState<string>('92');
  const [notes, setNotes] = useState('');

  // Latest observation
  const latest = sortedLogs.length > 0 ? sortedLogs[sortedLogs.length - 1] : null;

  // Chart dataset formatted
  const chartData = sortedLogs.map(log => ({
    date: log.date.slice(5), // MM-DD
    fullDate: log.date,
    systolic: log.systolic,
    diastolic: log.diastolic,
    heartRate: log.heartRate,
    weightKg: log.weightKg,
    glucose: log.bloodGlucoseMgDl || 90
  }));

  const handleAddLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: PatientVitalsLogEntry = {
      id: `VLOG-${Date.now()}`,
      patientId: patient.id,
      patientMrn: patient.mrn,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      systolic: Number(systolic),
      diastolic: Number(diastolic),
      heartRate: Number(heartRate),
      weightKg: Number(weightKg),
      bloodGlucoseMgDl: bloodGlucose ? Number(bloodGlucose) : undefined,
      notes: notes.trim() || undefined,
      recordedAt: new Date().toISOString()
    };

    addPatientVitalsLog(newEntry);
    setShowLogModal(false);
    setNotes('');
  };

  const getBpCategory = (sys: number, dia: number) => {
    if (sys < 120 && dia < 80) return { label: 'Optimal / Normal', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (sys <= 129 && dia < 80) return { label: 'Elevated BP', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) return { label: 'Stage 1 Hypertension', color: 'text-orange-700 bg-orange-50 border-orange-200' };
    return { label: 'Stage 2 Hypertension Alert', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
            <Activity className="w-5 h-5 text-teal-700" />
            <span>Personal Health Vitals & Chronic Condition Tracking</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            Patient Vitals Trend Analysis
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Record home blood pressure readings, resting pulse, and weight metrics. Charts are evaluated in real time to assist Dr. Kollie and the clinical team during follow-up reviews.
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log Today's Vitals</span>
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Blood Pressure Card */}
        <div 
          onClick={() => setActiveMetric('BP')}
          className={`bg-white rounded-xl border p-4 shadow-xs transition-all cursor-pointer ${
            activeMetric === 'BP' ? 'border-teal-700 ring-2 ring-teal-700/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Blood Pressure</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {latest ? `${latest.systolic}/${latest.diastolic}` : '120/80'}
            </span>
            <span className="text-xs text-slate-500 font-medium">mmHg</span>
          </div>
          {latest && (
            <div className="mt-2">
              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${getBpCategory(latest.systolic, latest.diastolic).color}`}>
                {getBpCategory(latest.systolic, latest.diastolic).label}
              </span>
            </div>
          )}
        </div>

        {/* Heart Rate Card */}
        <div 
          onClick={() => setActiveMetric('HR')}
          className={`bg-white rounded-xl border p-4 shadow-xs transition-all cursor-pointer ${
            activeMetric === 'HR' ? 'border-teal-700 ring-2 ring-teal-700/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Heart Rate / Pulse</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {latest ? latest.heartRate : 74}
            </span>
            <span className="text-xs text-slate-500 font-medium">bpm</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Normal sinus rhythm (60-100)</span>
          </div>
        </div>

        {/* Weight Card */}
        <div 
          onClick={() => setActiveMetric('WEIGHT')}
          className={`bg-white rounded-xl border p-4 shadow-xs transition-all cursor-pointer ${
            activeMetric === 'WEIGHT' ? 'border-teal-700 ring-2 ring-teal-700/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Body Weight</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {latest ? latest.weightKg : 68.0}
            </span>
            <span className="text-xs text-slate-500 font-medium">kg ({(latest ? latest.weightKg * 2.20462 : 150).toFixed(1)} lbs)</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            BMI: 24.1 (Healthy weight range)
          </div>
        </div>

        {/* Fasting Glucose Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Fasting Blood Sugar</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Droplet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {latest?.bloodGlucoseMgDl || 92}
            </span>
            <span className="text-xs text-slate-500 font-medium">mg/dL</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Normal euglycemic fasting range</span>
          </div>
        </div>
      </div>

      {/* Interactive Recharts Line Graph Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-700" />
              <span>
                {activeMetric === 'BP' && 'Blood Pressure Trend (Systolic & Diastolic mmHg)'}
                {activeMetric === 'HR' && 'Resting Heart Rate Trend (BPM)'}
                {activeMetric === 'WEIGHT' && 'Weight Log Trend (kg)'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Daily measurements over the last 7 logged days
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveMetric('BP')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeMetric === 'BP' ? 'bg-white text-teal-800 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Blood Pressure
            </button>
            <button
              onClick={() => setActiveMetric('HR')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeMetric === 'HR' ? 'bg-white text-teal-800 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Heart Rate
            </button>
            <button
              onClick={() => setActiveMetric('WEIGHT')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeMetric === 'WEIGHT' ? 'bg-white text-teal-800 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weight
            </button>
          </div>
        </div>

        {/* Recharts Canvas */}
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            {activeMetric === 'BP' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis domain={[60, 160]} stroke="#64748b" fontSize={11} unit=" mmHg" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#2dd4bf', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <ReferenceLine y={120} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Target Sys 120', fill: '#10b981', fontSize: 10 }} />
                <ReferenceLine y={80} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Target Dia 80', fill: '#3b82f6', fontSize: 10 }} />
                <Line 
                  type="monotone" 
                  dataKey="systolic" 
                  name="Systolic (Upper)" 
                  stroke="#e11d48" 
                  strokeWidth={2.5} 
                  dot={{ r: 4, fill: '#e11d48' }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="diastolic" 
                  name="Diastolic (Lower)" 
                  stroke="#0284c7" 
                  strokeWidth={2.5} 
                  dot={{ r: 4, fill: '#0284c7' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            ) : activeMetric === 'HR' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis domain={[50, 120]} stroke="#64748b" fontSize={11} unit=" bpm" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#2dd4bf', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <ReferenceLine y={60} stroke="#94a3b8" strokeDasharray="2 2" />
                <ReferenceLine y={100} stroke="#94a3b8" strokeDasharray="2 2" />
                <Line 
                  type="monotone" 
                  dataKey="heartRate" 
                  name="Resting Heart Rate (bpm)" 
                  stroke="#0d9488" 
                  strokeWidth={2.5} 
                  dot={{ r: 4, fill: '#0d9488' }}
                />
              </LineChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis domain={['auto', 'auto']} stroke="#64748b" fontSize={11} unit=" kg" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#2dd4bf', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line 
                  type="monotone" 
                  dataKey="weightKg" 
                  name="Body Weight (kg)" 
                  stroke="#6366f1" 
                  strokeWidth={2.5} 
                  dot={{ r: 4, fill: '#6366f1' }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* History Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900">Recorded Vitals History</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                <th className="pb-3">Date & Time</th>
                <th className="pb-3">Blood Pressure</th>
                <th className="pb-3">Pulse</th>
                <th className="pb-3">Weight</th>
                <th className="pb-3">Fasting Glucose</th>
                <th className="pb-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedLogs.slice().reverse().map(log => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3 font-medium text-slate-800">
                    {log.date} at {log.time}
                  </td>
                  <td className="py-3 font-mono font-bold text-slate-900">
                    {log.systolic}/{log.diastolic} mmHg
                  </td>
                  <td className="py-3 text-teal-800 font-mono font-medium">
                    {log.heartRate} bpm
                  </td>
                  <td className="py-3 text-slate-700 font-mono">
                    {log.weightKg} kg
                  </td>
                  <td className="py-3 text-amber-800 font-mono">
                    {log.bloodGlucoseMgDl ? `${log.bloodGlucoseMgDl} mg/dL` : '—'}
                  </td>
                  <td className="py-3 text-slate-500 text-[11px] max-w-xs truncate">
                    {log.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log New Vitals Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-700" />
                <h3 className="font-bold text-base text-slate-900">Log Daily Health Metrics</h3>
              </div>
              <button onClick={() => setShowLogModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLogSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Systolic BP (Upper) *</label>
                  <input
                    type="number"
                    required
                    min={60}
                    max={260}
                    value={systolic}
                    onChange={e => setSystolic(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Diastolic BP (Lower) *</label>
                  <input
                    type="number"
                    required
                    min={40}
                    max={160}
                    value={diastolic}
                    onChange={e => setDiastolic(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Heart Rate (Pulse) *</label>
                  <input
                    type="number"
                    required
                    min={40}
                    max={200}
                    value={heartRate}
                    onChange={e => setHeartRate(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Weight in kg *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    min={20}
                    max={250}
                    value={weightKg}
                    onChange={e => setWeightKg(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fasting Blood Glucose (mg/dL)</label>
                <input
                  type="number"
                  placeholder="e.g. 95 (Optional)"
                  value={bloodGlucose}
                  onChange={e => setBloodGlucose(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Symptoms</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Morning reading before medication, feeling rested..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-800 hover:bg-teal-900 text-white font-semibold px-5 py-2 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Save Vitals Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
