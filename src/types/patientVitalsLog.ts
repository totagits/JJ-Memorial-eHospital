/**
 * Patient Self-Logged Vitals Types
 * Enables patients to monitor and chart chronic conditions (hypertension, diabetes, weight)
 * from home, visualized using Recharts trend lines.
 */

export interface PatientVitalsLogEntry {
  id: string;
  patientId: string;
  patientMrn: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "08:15 AM"
  systolic: number; // mmHg
  diastolic: number; // mmHg
  heartRate: number; // bpm
  weightKg: number; // kg
  bloodGlucoseMgDl?: number; // mg/dL (optional fasting/random)
  symptoms?: string; // e.g. "Mild dizziness in morning"
  notes?: string;
  recordedAt: string;
}
