/**
 * Telehealth & Virtual Consultation Types
 * Supports real-time WebRTC-ready video consultations, clinical messaging, and post-visit summaries
 */

export interface TelehealthMessage {
  id: string;
  sender: 'PATIENT' | 'CLINICIAN';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface TelehealthSession {
  id: string; // e.g. "TEL-2026-0041"
  patientId: string;
  patientName: string;
  patientMrn: string;
  clinicianId: string;
  clinicianName: string;
  clinicianRole: string;
  department: string;
  mode: 'VIDEO' | 'CHAT';
  status: 'WAITING_FOR_DOCTOR' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledTime?: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  chiefComplaint: string;
  doctorNotes?: string;
  recommendations?: string;
  messages: TelehealthMessage[];
}
