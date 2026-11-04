/**
 * Master Patient Index (MPI) & Identity Types
 * Strictly enforces unique immutable MRN, duplicate detection, and demographic governance
 */

export interface Patient {
  id: string;
  mrn: string; // e.g. "JJM-2026-00104" (immutable)
  legacyId?: string; // Cross-reference to old paper records
  nationalId?: string; // Liberian National Identification Registry (NIR) / Passport
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: 'M' | 'F' | 'OTHER';
  phone: string;
  altPhone?: string;
  email?: string;
  address: {
    community: string; // e.g. "Congo Town", "Sinkor", "Paynesville"
    city: string; // e.g. "Monrovia"
    county: string; // e.g. "Montserrado", "Margibi", "Nimba"
    country: string; // "Liberia"
  };
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies: Array<{
    substance: string; // e.g. "Penicillin", "Sulfa drugs", "Peanuts"
    reaction: string; // e.g. "Anaphylaxis", "Urticaria"
    severity: 'mild' | 'moderate' | 'severe' | 'life_threatening';
    recordedAt: string;
  }>;
  chronicConditions?: string[]; // e.g. "Hypertension", "Type 2 Diabetes", "Sickle Cell Trait"
  emergencyContact: {
    fullName: string;
    relationship: string;
    phone: string;
    address?: string;
  };
  insurance?: {
    providerName: string; // e.g. "Activa International", "Accident & General", "Self-Pay"
    policyNumber: string;
    memberId: string;
    coveragePercent: number; // 0-100
    validUntil: string;
  };
  downtimeOrigin?: boolean; // True if registered during electricity/network outage
  downtimeTemporaryId?: string; // e.g. "DT-EMR-0412"
  registeredAt: string;
  registeredBy: string; // User full name or ID
  photoUrl?: string;
}

export interface PatientQueueEntry {
  id: string;
  patientId: string;
  patientMrn: string;
  patientName: string;
  tokenNumber: string; // e.g. "Q-OPD-014" or "Q-TRIAGE-008"
  department: 'TRIAGE' | 'OPD_CONSULT' | 'LABORATORY' | 'PHARMACY' | 'BILLING' | 'EMERGENCY';
  priority: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  status: 'WAITING' | 'IN_SERVICE' | 'COMPLETED' | 'CANCELLED';
  assignedPractitionerId?: string;
  assignedPractitionerName?: string;
  checkInTime: string;
  estimatedWaitMinutes: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  department: string;
  clinicianId: string;
  clinicianName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // "09:30 AM"
  reason: string;
  type: 'OUTPATIENT_CONSULT' | 'SPECIALIST_REVIEW' | 'FOLLOW_UP' | 'ROUTINE_CHECKUP' | 'VACCINATION';
  status: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  bookedVia: 'PUBLIC_PORTAL' | 'FRONT_DESK' | 'PHONE';
  createdAt: string;
}
