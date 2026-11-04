/**
 * Patient Notifications & Intra-Departmental Staff Secure Messaging
 * Supports real-time clinical alerts, appointment reminders, lab releases,
 * prescription updates, and encrypted intra-hospital communication.
 */

export type PatientNotificationType =
  | 'APPOINTMENT_REMINDER'
  | 'LAB_RESULT_AVAILABLE'
  | 'PRESCRIPTION_UPDATE'
  | 'BILLING'
  | 'CLINICAL_ADVISORY'
  | 'GENERAL';

export type NotificationUrgency = 'NORMAL' | 'HIGH' | 'CRITICAL';

export interface PatientNotification {
  id: string;
  patientId: string;
  patientMrn: string;
  type: PatientNotificationType;
  title: string;
  message: string;
  timestamp: string; // ISO string
  isRead: boolean;
  urgency: NotificationUrgency;
  targetTab: 'appointments' | 'labs' | 'prescriptions' | 'billing' | 'history' | 'telehealth';
  relatedEntityId?: string; // e.g. APT-001, LAB-001, RX-001, INV-001
  actionLabel?: string; // e.g. "View Appointment", "Review Lab Results", "Check Prescription"
}

export type StaffMessageUrgency = 'ROUTINE' | 'URGENT' | 'STAT'; // STAT is clinical emergency intervention

export type StaffChannelType = 'DEPARTMENT' | 'DIRECT';

export interface StaffChannel {
  id: string;
  name: string; // e.g. "#opd-triage", "#emergency-trauma"
  department: string;
  description: string;
  iconName: string;
  isStatBay?: boolean;
}

export interface StaffMessage {
  id: string;
  channelId: string; // Department channel id or direct message thread id
  channelType: StaffChannelType;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderDepartment: string;
  recipientId?: string; // User ID if 1-on-1 direct message
  recipientName?: string;
  content: string;
  urgency: StaffMessageUrgency;
  patientMrnContext?: string; // e.g. "JJM-2026-00104"
  patientNameContext?: string; // e.g. "Blessing Kpadeh"
  timestamp: string; // ISO string
  readBy: string[]; // User IDs who have acknowledged/read the message
  isPinned?: boolean;
}
