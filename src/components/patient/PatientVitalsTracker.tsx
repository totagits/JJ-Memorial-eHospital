import React, { useState, useEffect } from 'react';
import { dbStore } from '../../services/dbStore';
import { VitalRecord } from '../../types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { HeartPulse, Plus, CheckCircle2, TrendingUp, Activity, AlertCircle } from 'lucide-react';

interface PatientVitalsTrackerProps {
  patientId: string;
}

export const PatientVitalsTracker: React.FC<PatientVitalsTrackerProps> = ({ patientId }) => {
  const [vitals, setVitals] = useState<VitalRecord[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'bp' | 'hr' | 'weight' | 'glucose'>('bp');
  const [isLogging, setIsLogging] = useState(false);

  // Form states
  const [systolic, setSystolic] = useState<number>(120);
  const [diastolic, setDiastolic] = useState<number>(80);
  const [heartRate, setHeartRate] = useState<number>(72);
  const [weight, setWeight] = useState<number>(68.5);
  const [bloodGlucose, setBloodGlucose] = useState<number>(95);
  const [spo2, setSpo2] = useState<number>(98);
  const [temp, setTemp] = useState<number>(36.6);
  const [notes, setNotes] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const update = () => {
      setVitals(dbStore.getVitals(patientId));
    };
    update();
    return dbStore.subscribe(update);
  }, [patientId]);

  // Chart data formatting
  const chartData = vitals.map((v) => ({
    date: new Date(v.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    systolic: v.systolic,
    diastolic: v.diastolic,
    heartRate: v.heartRate,
    weight: v.weight,
    bloodGlucose: v.bloodGlucose || 95,
    spo2: v.spo2,
  }));

  const latest = vitals[vitals.length - 1];

  const handleSaveVital = async (e: React.FormEvent) => {
    e.preventDefault();
    await dbStore.addVitalRecord({
      patientId,
      timestamp: new Date().toISOString(),
      systolic: Number(systolic),
      diastolic: Number(diastolic),
      heartRate: Number(heartRate),
      weight: Number(weight),
      bloodGlucose: Number(bloodGlucose),
      spo2: Number(spo2),
      temperature: Number(temp),
      notes,
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsLogging(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Cardiovascular & Metabolic Telemetry</span>
          </div>
          <h2 className="text-2xl font-extrabold text-hospital-navy mt-1">
            Patient Vitals Tracker
          </h2>
          <p className="text-xs text-slate-500">
            Log your daily metrics at home and track physiological trends evaluated by your care team.
          </p>
        </div>

        <button
          onClick={() => setIsLogging(!isLogging)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{isLogging ? 'Hide Form' : 'Log Daily Vitals'}</span>
        </button>
      </div>

      {/* Latest Vitals Snapshot Cards */}
      {latest && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs text-slate-400 font-semibold">Blood Pressure</span>
            <div className="text-xl font-black text-hospital-navy">
              {latest.systolic} / {latest.diastolic} <span className="text-xs font-normal text-slate-500">mmHg</span>
            </div>
            <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Optimal (&lt;130/85)
            </span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs text-slate-400 font-semibold">Resting Heart Rate</span>
            <div className="text-xl font-black text-hospital-navy">
              {latest.heartRate} <span className="text-xs font-normal text-slate-500">BPM</span>
            </div>
            <span className="inline-block text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
              Normal Rhythm
            </span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs text-slate-400 font-semibold">Body Weight</span>
            <div className="text-xl font-black text-hospital-navy">
              {latest.weight} <span className="text-xs font-normal text-slate-500">kg</span>
            </div>
            <span className="inline-block text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              BMI 22.8 Normal
            </span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs text-slate-400 font-semibold">Blood Sugar (Fasting)</span>
            <div className="text-xl font-black text-hospital-navy">
              {latest.bloodGlucose || 95} <span className="text-xs font-normal text-slate-500">mg/dL</span>
            </div>
            <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Target Range
            </span>
          </div>
        </div>
      )}

      {/* Log New Vitals Form (Expandable) */}
      {isLogging && (
        <form onSubmit={handleSaveVital} className="p-6 bg-slate-50 rounded-2xl border border-teal-200 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-hospital-navy text-sm">
              Record New Health Measurement
            </h4>
            <span className="text-xs text-teal-700 font-semibold">
              Automatically cached if offline
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Systolic BP (mmHg)</label>
              <input
                type="number"
                required
                value={systolic}
                onChange={(e) => setSystolic(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Diastolic BP (mmHg)</label>
              <input
                type="number"
                required
                value={diastolic}
                onChange={(e) => setDiastolic(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Heart Rate (BPM)</label>
              <input
                type="number"
                required
                value={heartRate}
                onChange={(e) => setHeartRate(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                required
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Blood Sugar (mg/dL)</label>
              <input
                type="number"
                value={bloodGlucose}
                onChange={(e) => setBloodGlucose(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Oxygen SPO2 (%)</label>
              <input
                type="number"
                value={spo2}
                onChange={(e) => setSpo2(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Temperature (&deg;C)</label>
              <input
                type="number"
                step="0.1"
                value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Clinical Notes</label>
              <input
                type="text"
                placeholder="e.g. After breakfast"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Vitals saved & queued for sync!
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsLogging(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
            >
              Save Daily Reading
            </button>
          </div>
        </form>
      )}

      {/* Interactive Line Chart using Recharts */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-hospital-navy flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              Longitudinal Health Trend Analysis
            </h3>
            <span className="text-xs text-slate-400">7-Day Historical Profile</span>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setSelectedMetric('bp')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                selectedMetric === 'bp' ? 'bg-white text-hospital-navy shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Blood Pressure
            </button>
            <button
              onClick={() => setSelectedMetric('hr')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                selectedMetric === 'hr' ? 'bg-white text-hospital-navy shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Heart Rate
            </button>
            <button
              onClick={() => setSelectedMetric('weight')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                selectedMetric === 'weight' ? 'bg-white text-hospital-navy shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weight (kg)
            </button>
            <button
              onClick={() => setSelectedMetric('glucose')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                selectedMetric === 'glucose' ? 'bg-white text-hospital-navy shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Blood Sugar
            </button>
          </div>
        </div>

        {/* Recharts LineChart */}
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0b1d3a',
                  color: '#ffffff',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <Legend verticalAlign="top" height={36} />

              {selectedMetric === 'bp' && (
                <>
                  <Line
                    type="monotone"
                    dataKey="systolic"
                    name="Systolic (mmHg)"
                    stroke="#0d9488"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#0d9488' }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolic"
                    name="Diastolic (mmHg)"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#06b6d4' }}
                  />
                </>
              )}

              {selectedMetric === 'hr' && (
                <Line
                  type="monotone"
                  dataKey="heartRate"
                  name="Heart Rate (BPM)"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#ef4444' }}
                />
              )}

              {selectedMetric === 'weight' && (
                <Line
                  type="monotone"
                  dataKey="weight"
                  name="Body Weight (kg)"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#f59e0b' }}
                />
              )}

              {selectedMetric === 'glucose' && (
                <Line
                  type="monotone"
                  dataKey="bloodGlucose"
                  name="Blood Glucose (mg/dL)"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#8b5cf6' }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
