import {
  INITIAL_FACILITY_CONFIG,
  INITIAL_STAFF_ACCOUNTS,
  INITIAL_PATIENTS,
  INITIAL_QUEUE,
  INITIAL_VITALS,
  INITIAL_ENCOUNTERS,
  INITIAL_LAB_ORDERS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_INPATIENT_BEDS,
  INITIAL_CHARGE_ITEMS,
  INITIAL_INVOICES,
  INITIAL_RECEIPTS,
  INITIAL_JOURNALS,
  INITIAL_INVENTORY,
  INITIAL_SUPPLIERS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_EMPLOYEES,
  INITIAL_BIOMEDICAL_ASSETS,
  INITIAL_INCIDENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_DOWNTIME_STATE,
  INITIAL_DOWNTIME_RECORDS,
  INITIAL_RADIOLOGY_STUDIES,
  INITIAL_SHIFTS,
  LRD_PER_USD
} from '../data/seedData';

import { UserAccount, AuditEvent, BreakGlassSession } from '../types/auth';
import { Patient, PatientQueueEntry, Appointment } from '../types/patient';
import { VitalSignObservation, ClinicalEncounter, LabOrder, Prescription, InpatientBed, AdmissionRecord, RadiologyStudy } from '../types/clinical';
import { ChargeItem, Invoice, PaymentReceipt, GeneralLedgerJournal, CreditRefundAdjustment } from '../types/finance';
import { InventoryItem, Supplier, PurchaseOrder, GoodsReceiptNote, Employee, PayrollRun, BiomedicalAsset, QualitySafetyIncident, StaffShift } from '../types/erp';
import { DowntimeOfflineRecord, DowntimeState } from '../types/offline';
import { TelehealthSession } from '../types/telehealth';
import { PatientNotification, StaffMessage } from '../types/communication';
import { BloodUnit, BloodDonor, BloodTransfusionRequest } from '../types/bloodBank';
import { DigitalConsentForm } from '../types/digitalConsent';
import { PatientFeedback } from '../types/feedback';
import { PatientVitalsLogEntry } from '../types/patientVitalsLog';
import { SpecializedEquipmentResource, ResourceReservation } from '../types/resourceEquipment';
import { InsurancePolicyRecord } from '../types/insuranceVerification';
import {
  INITIAL_PATIENT_NOTIFICATIONS,
  INITIAL_STAFF_MESSAGES,
  INITIAL_BLOOD_UNITS,
  INITIAL_BLOOD_DONORS,
  INITIAL_BLOOD_REQUESTS,
  INITIAL_DIGITAL_CONSENTS,
  INITIAL_PATIENT_FEEDBACKS,
  INITIAL_PATIENT_VITALS_LOGS,
  INITIAL_SPECIALIZED_RESOURCES,
  INITIAL_RESOURCE_RESERVATIONS,
  INITIAL_INSURANCE_POLICIES
} from '../data/additionalSeedData';
import { indexedDbCache } from './indexedDbCacheService';

const STORAGE_KEY = 'jjmemorial_ehospital_db_v1';

export interface AppDatabaseState {
  facilityConfig: typeof INITIAL_FACILITY_CONFIG;
  users: UserAccount[];
  patients: Patient[];
  telehealthSessions: TelehealthSession[];
  queue: PatientQueueEntry[];
  appointments: Appointment[];
  vitals: VitalSignObservation[];
  encounters: ClinicalEncounter[];
  labOrders: LabOrder[];
  radiologyStudies: RadiologyStudy[];
  prescriptions: Prescription[];
  beds: InpatientBed[];
  admissions: AdmissionRecord[];
  charges: ChargeItem[];
  invoices: Invoice[];
  receipts: PaymentReceipt[];
  creditNotes: CreditRefundAdjustment[];
  journals: GeneralLedgerJournal[];
  inventory: InventoryItem[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  goodsReceipts: GoodsReceiptNote[];
  employees: Employee[];
  payrollRuns: PayrollRun[];
  assets: BiomedicalAsset[];
  incidents: QualitySafetyIncident[];
  auditLogs: AuditEvent[];
  breakGlassSessions: BreakGlassSession[];
  shifts: StaffShift[];
  patientNotifications: PatientNotification[];
  staffMessages: StaffMessage[];
  bloodUnits: BloodUnit[];
  bloodDonors: BloodDonor[];
  bloodRequests: BloodTransfusionRequest[];
  digitalConsents: DigitalConsentForm[];
  patientFeedbacks: PatientFeedback[];
  patientVitalsLogs: PatientVitalsLogEntry[];
  specializedResources: SpecializedEquipmentResource[];
  resourceReservations: ResourceReservation[];
  insurancePolicies: InsurancePolicyRecord[];
  downtimeState: DowntimeState;
  downtimeRecords: DowntimeOfflineRecord[];
  lastBackupDate: string;
  lastBackgroundSyncAt?: string;
  isBackgroundSyncing?: boolean;
}

function loadInitialState(): AppDatabaseState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure required collections exist if upgraded
      if (parsed.patients && parsed.users) {
        if (!parsed.telehealthSessions) {
          parsed.telehealthSessions = [];
        }
        if (!parsed.radiologyStudies) {
          parsed.radiologyStudies = INITIAL_RADIOLOGY_STUDIES;
        }
        if (!parsed.shifts) {
          parsed.shifts = INITIAL_SHIFTS;
        }
        if (!parsed.patientNotifications) {
          parsed.patientNotifications = INITIAL_PATIENT_NOTIFICATIONS;
        }
        if (!parsed.staffMessages) {
          parsed.staffMessages = INITIAL_STAFF_MESSAGES;
        }
        if (!parsed.bloodUnits) {
          parsed.bloodUnits = INITIAL_BLOOD_UNITS;
        }
        if (!parsed.bloodDonors) {
          parsed.bloodDonors = INITIAL_BLOOD_DONORS;
        }
        if (!parsed.bloodRequests) {
          parsed.bloodRequests = INITIAL_BLOOD_REQUESTS;
        }
        if (!parsed.digitalConsents) {
          parsed.digitalConsents = INITIAL_DIGITAL_CONSENTS;
        }
        if (!parsed.patientFeedbacks) {
          parsed.patientFeedbacks = INITIAL_PATIENT_FEEDBACKS;
        }
        if (!parsed.patientVitalsLogs) {
          parsed.patientVitalsLogs = INITIAL_PATIENT_VITALS_LOGS;
        }
        if (!parsed.specializedResources) {
          parsed.specializedResources = INITIAL_SPECIALIZED_RESOURCES;
        }
        if (!parsed.resourceReservations) {
          parsed.resourceReservations = INITIAL_RESOURCE_RESERVATIONS;
        }
        if (!parsed.insurancePolicies) {
          parsed.insurancePolicies = INITIAL_INSURANCE_POLICIES;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse persistent storage, restoring initial seed data', e);
  }

  const initial: AppDatabaseState = {
    facilityConfig: INITIAL_FACILITY_CONFIG,
    users: INITIAL_STAFF_ACCOUNTS,
    patients: INITIAL_PATIENTS,
    queue: INITIAL_QUEUE,
    appointments: [
      {
        id: 'APT-001',
        patientId: 'PAT-001',
        patientName: 'Blessing Kpadeh',
        patientPhone: '+231-886-902-145',
        department: 'Internal Medicine',
        clinicianId: 'USR-002',
        clinicianName: 'Dr. Evelyn Sirleaf-Gbotoe',
        date: '2026-11-03',
        timeSlot: '09:00 AM',
        reason: 'Acute fever, rigors, and headache follow-up',
        type: 'OUTPATIENT_CONSULT',
        status: 'CHECKED_IN',
        bookedVia: 'PUBLIC_PORTAL',
        createdAt: '2026-11-02T14:00:00Z',
      },
      {
        id: 'APT-002',
        patientId: 'PAT-002',
        patientName: 'Joseph Kromah',
        patientPhone: '+231-777-502-881',
        department: 'Cardiology & Diabetes',
        clinicianId: 'USR-001',
        clinicianName: 'Dr. J. Saydee Kollie',
        date: '2026-11-03',
        timeSlot: '11:30 AM',
        reason: 'Hypertension and fasting blood glucose review',
        type: 'SPECIALIST_REVIEW',
        status: 'CONFIRMED',
        bookedVia: 'FRONT_DESK',
        createdAt: '2026-11-01T10:00:00Z',
      }
    ],
    vitals: INITIAL_VITALS,
    encounters: INITIAL_ENCOUNTERS,
    labOrders: INITIAL_LAB_ORDERS,
    radiologyStudies: INITIAL_RADIOLOGY_STUDIES,
    prescriptions: INITIAL_PRESCRIPTIONS,
    beds: INITIAL_INPATIENT_BEDS,
    admissions: [
      {
        id: 'ADM-001',
        patientId: 'PAT-002',
        patientMrn: 'JJM-2026-00105',
        patientName: 'Joseph Kromah',
        bedId: 'BED-002',
        bedNumber: 'MMW-B02',
        wardName: 'Male Medical Ward',
        admittingDoctor: 'Dr. J. Saydee Kollie',
        admissionReason: 'Severe uncontrolled hypertension (BP 168/102) with diabetic dysregulation',
        admissionDate: '2026-11-02T16:00:00Z',
        status: 'ACTIVE',
      }
    ],
    charges: INITIAL_CHARGE_ITEMS,
    invoices: INITIAL_INVOICES,
    receipts: INITIAL_RECEIPTS,
    creditNotes: [],
    journals: INITIAL_JOURNALS,
    inventory: INITIAL_INVENTORY,
    suppliers: INITIAL_SUPPLIERS,
    purchaseOrders: INITIAL_PURCHASE_ORDERS,
    goodsReceipts: [
      {
        id: 'GRN-001',
        grnNumber: 'GRN-2026-00064',
        poNumber: 'PO-2026-00088',
        supplierName: 'Lucky Pharmacy & Medical Supplies Liberia',
        receiptDate: '2026-10-30',
        itemsReceived: [
          {
            itemId: 'INV-ITEM-001',
            itemName: 'Coartem (Artemether 80mg / Lumefantrine 480mg)',
            batchNumber: 'BATCH-COA-2026A',
            expiryDate: '2028-02-28',
            quantity: 100,
            unitPriceUSD: 4.50,
            conditionGood: true,
          }
        ],
        threeWayMatched: true,
        receivedBy: 'James Mulbah (Stores Lead)',
      }
    ],
    employees: INITIAL_EMPLOYEES,
    payrollRuns: [
      {
        id: 'PAY-001',
        periodName: 'October 2026',
        runDate: '2026-10-28',
        totalGrossUSD: 6500.00,
        totalGrossLRD: 1267500.00,
        totalTaxDeductionsUSD: 780.00,
        totalNetPayUSD: 5720.00,
        employeeCount: 4,
        status: 'POSTED_TO_GL',
        approvedBy: 'Dr. J. Saydee Kollie',
        postedJournalVoucher: 'JV-2026-00185',
      }
    ],
    assets: INITIAL_BIOMEDICAL_ASSETS,
    incidents: INITIAL_INCIDENTS,
    auditLogs: INITIAL_AUDIT_LOGS,
    breakGlassSessions: [],
    downtimeState: INITIAL_DOWNTIME_STATE,
    downtimeRecords: INITIAL_DOWNTIME_RECORDS,
    telehealthSessions: [
      {
        id: 'TEL-2026-0041',
        patientId: 'PAT-001',
        patientName: 'Blessing Kpadeh',
        patientMrn: 'JJM-2026-00104',
        clinicianId: 'USR-002',
        clinicianName: 'Dr. Evelyn Sirleaf-Gbotoe, MD',
        clinicianRole: 'Attending Physician (OPD & Acute Care)',
        department: 'Internal Medicine & Outpatient Care',
        mode: 'VIDEO',
        status: 'COMPLETED',
        startedAt: '2026-11-02T14:30:00Z',
        endedAt: '2026-11-02T14:48:00Z',
        durationSeconds: 1080,
        chiefComplaint: 'Post-malaria treatment follow-up, mild residual fatigue, no fever recurrence.',
        doctorNotes: 'Patient completed 3-day Coartem course. Temperature normal (36.8°C reported). Appetite improved. Advised continuation of hydration and balanced nutrition.',
        recommendations: 'No further anti-malarial needed. Check back if chills or headache recur.',
        messages: [
          {
            id: 'MSG-001',
            sender: 'PATIENT',
            senderName: 'Blessing Kpadeh',
            text: 'Good afternoon Dr. Sirleaf. I finished my medication yesterday as prescribed.',
            timestamp: '2026-11-02T14:31:00Z'
          },
          {
            id: 'MSG-002',
            sender: 'CLINICIAN',
            senderName: 'Dr. Evelyn Sirleaf-Gbotoe',
            text: 'Good afternoon Blessing. How are you feeling today? Any fever spikes or body aches remaining?',
            timestamp: '2026-11-02T14:32:00Z'
          },
          {
            id: 'MSG-003',
            sender: 'PATIENT',
            senderName: 'Blessing Kpadeh',
            text: 'Fever is completely gone! Just a little tiredness in the afternoons.',
            timestamp: '2026-11-02T14:33:30Z'
          },
          {
            id: 'MSG-004',
            sender: 'CLINICIAN',
            senderName: 'Dr. Evelyn Sirleaf-Gbotoe',
            text: 'That is expected post-malaria recovery. Keep resting, drink plenty of clean water and fresh fruit juices. Your lab tests from Monday confirmed rapid parasitemia clearance.',
            timestamp: '2026-11-02T14:35:00Z'
          }
        ]
      }
    ],
    shifts: INITIAL_SHIFTS,
    patientNotifications: INITIAL_PATIENT_NOTIFICATIONS,
    staffMessages: INITIAL_STAFF_MESSAGES,
    bloodUnits: INITIAL_BLOOD_UNITS,
    bloodDonors: INITIAL_BLOOD_DONORS,
    bloodRequests: INITIAL_BLOOD_REQUESTS,
    digitalConsents: INITIAL_DIGITAL_CONSENTS,
    patientFeedbacks: INITIAL_PATIENT_FEEDBACKS,
    patientVitalsLogs: INITIAL_PATIENT_VITALS_LOGS,
    specializedResources: INITIAL_SPECIALIZED_RESOURCES,
    resourceReservations: INITIAL_RESOURCE_RESERVATIONS,
    insurancePolicies: INITIAL_INSURANCE_POLICIES,
    lastBackupDate: new Date().toISOString(),
  };

  saveState(initial);
  return initial;
}

export function saveState(state: AppDatabaseState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // Asynchronously update IndexedDB cache for offline resiliency
    indexedDbCache.cacheStateToIndexedDB(state).catch(err => {
      console.warn('IndexedDB sync error:', err);
    });
  } catch (e) {
    console.error('Failed to save to local storage', e);
  }
}

// Singleton state reference with listeners
let currentState: AppDatabaseState = loadInitialState();
const listeners = new Set<(state: AppDatabaseState) => void>();

export function getDatabaseState(): AppDatabaseState {
  return currentState;
}

export function updateDatabaseState(updater: ((draft: AppDatabaseState) => void) | Partial<AppDatabaseState>): AppDatabaseState {
  const draft = JSON.parse(JSON.stringify(currentState)) as AppDatabaseState;
  if (typeof updater === 'function') {
    updater(draft);
  } else {
    Object.assign(draft, updater);
  }
  currentState = draft;
  saveState(currentState);
  listeners.forEach(fn => fn(currentState));
  return currentState;
}

export function subscribeDatabase(listener: (state: AppDatabaseState) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Reset database to pristine synthetic state
export function resetDatabaseToSeed(): AppDatabaseState {
  localStorage.removeItem(STORAGE_KEY);
  currentState = loadInitialState();
  listeners.forEach(fn => fn(currentState));
  return currentState;
}

// Generate Next MRN safely (immutable, e.g. "JJM-2026-00109")
export function generateNextMRN(): string {
  const currentCount = currentState.patients.length;
  const num = 101 + currentCount;
  const year = new Date().getFullYear();
  return `JJM-${year}-${String(num).padStart(5, '0')}`;
}

// Duplicate Patient Detection Engine
export function findPotentialDuplicates(candidate: {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  nationalId?: string;
}): Patient[] {
  const normPhone = candidate.phone.replace(/[^0-9]/g, '');
  const normFirst = candidate.firstName.trim().toLowerCase();
  const normLast = candidate.lastName.trim().toLowerCase();

  return currentState.patients.filter(p => {
    // 1. Exact National ID match
    if (candidate.nationalId && p.nationalId && candidate.nationalId.trim() === p.nationalId.trim()) {
      return true;
    }
    // 2. Exact phone match
    const pPhone = p.phone.replace(/[^0-9]/g, '');
    if (normPhone && pPhone && (normPhone.endsWith(pPhone) || pPhone.endsWith(normPhone))) {
      return true;
    }
    // 3. Name & Date of Birth match
    if (
      p.firstName.trim().toLowerCase() === normFirst &&
      p.lastName.trim().toLowerCase() === normLast &&
      p.dateOfBirth === candidate.dateOfBirth
    ) {
      return true;
    }
    return false;
  });
}

// Append immutable audit log entry
export function logAuditEvent(entry: Omit<AuditEvent, 'id' | 'timestamp'>): void {
  updateDatabaseState(draft => {
    const newLog: AuditEvent = {
      ...entry,
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    draft.auditLogs.unshift(newLog);
    // Keep max 1000 logs in memory buffer
    if (draft.auditLogs.length > 1000) {
      draft.auditLogs = draft.auditLogs.slice(0, 1000);
    }
  });
}

// Patient Notifications Management
export function addPatientNotification(entry: Omit<PatientNotification, 'id' | 'timestamp'>): PatientNotification {
  const newNotif: PatientNotification = {
    ...entry,
    id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
  };
  updateDatabaseState(draft => {
    if (!draft.patientNotifications) draft.patientNotifications = [];
    draft.patientNotifications.unshift(newNotif);
  });
  return newNotif;
}

export function markPatientNotificationAsRead(id: string): void {
  updateDatabaseState(draft => {
    if (!draft.patientNotifications) return;
    const item = draft.patientNotifications.find(n => n.id === id);
    if (item) {
      item.isRead = true;
    }
  });
}

export function markAllPatientNotificationsAsRead(patientId: string): void {
  updateDatabaseState(draft => {
    if (!draft.patientNotifications) return;
    draft.patientNotifications.forEach(n => {
      if (n.patientId === patientId) {
        n.isRead = true;
      }
    });
  });
}

// Staff Internal Messaging
export function sendStaffMessage(entry: Omit<StaffMessage, 'id' | 'timestamp' | 'readBy'>): StaffMessage {
  const newMsg: StaffMessage = {
    ...entry,
    id: `SMSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    readBy: [entry.senderId],
  };
  updateDatabaseState(draft => {
    if (!draft.staffMessages) draft.staffMessages = [];
    draft.staffMessages.push(newMsg);
  });
  return newMsg;
}

export function markStaffMessageRead(messageId: string, userId: string): void {
  updateDatabaseState(draft => {
    if (!draft.staffMessages) return;
    const msg = draft.staffMessages.find(m => m.id === messageId);
    if (msg && !msg.readBy.includes(userId)) {
      msg.readBy.push(userId);
    }
  });
}

// Blood Bank Management
export function addBloodUnit(unit: BloodUnit): void {
  updateDatabaseState(draft => {
    if (!draft.bloodUnits) draft.bloodUnits = [];
    draft.bloodUnits.unshift(unit);
  });
}

export function updateBloodUnit(unitId: string, updates: Partial<BloodUnit>): void {
  updateDatabaseState(draft => {
    if (!draft.bloodUnits) return;
    const index = draft.bloodUnits.findIndex(u => u.id === unitId);
    if (index !== -1) {
      draft.bloodUnits[index] = { ...draft.bloodUnits[index], ...updates };
    }
  });
}

export function addBloodDonor(donor: BloodDonor): void {
  updateDatabaseState(draft => {
    if (!draft.bloodDonors) draft.bloodDonors = [];
    draft.bloodDonors.unshift(donor);
  });
}

export function createBloodTransfusionRequest(req: Omit<BloodTransfusionRequest, 'id' | 'requestedAt'>): BloodTransfusionRequest {
  const newReq: BloodTransfusionRequest = {
    ...req,
    id: `BT-REQ-${Date.now()}`,
    requestedAt: new Date().toISOString()
  };
  updateDatabaseState(draft => {
    if (!draft.bloodRequests) draft.bloodRequests = [];
    draft.bloodRequests.unshift(newReq);
  });
  return newReq;
}

export function updateBloodTransfusionRequest(id: string, updates: Partial<BloodTransfusionRequest>): void {
  updateDatabaseState(draft => {
    if (!draft.bloodRequests) return;
    const index = draft.bloodRequests.findIndex(r => r.id === id);
    if (index !== -1) {
      draft.bloodRequests[index] = { ...draft.bloodRequests[index], ...updates };
    }
  });
}

// Digital Consent Forms
export function addDigitalConsent(consent: DigitalConsentForm): void {
  updateDatabaseState(draft => {
    if (!draft.digitalConsents) draft.digitalConsents = [];
    draft.digitalConsents.unshift(consent);
  });
}

// Patient Feedback & Reviews
export function addPatientFeedback(feedback: PatientFeedback): void {
  updateDatabaseState(draft => {
    if (!draft.patientFeedbacks) draft.patientFeedbacks = [];
    draft.patientFeedbacks.unshift(feedback);
  });
}

// Patient Home Vitals Tracker
export function addPatientVitalsLog(log: PatientVitalsLogEntry): void {
  updateDatabaseState(draft => {
    if (!draft.patientVitalsLogs) draft.patientVitalsLogs = [];
    draft.patientVitalsLogs.push(log);
  });
}

// Specialized Equipment & Resource Reservations
export function addResourceReservation(res: ResourceReservation): void {
  updateDatabaseState(draft => {
    if (!draft.resourceReservations) draft.resourceReservations = [];
    draft.resourceReservations.unshift(res);
  });
}

export function updateResourceReservation(id: string, updates: Partial<ResourceReservation>): void {
  updateDatabaseState(draft => {
    if (!draft.resourceReservations) return;
    const idx = draft.resourceReservations.findIndex(r => r.id === id);
    if (idx !== -1) {
      draft.resourceReservations[idx] = { ...draft.resourceReservations[idx], ...updates };
    }
  });
}

// Insurance Policy Records
export function verifyInsurancePolicy(policyId: string, verifiedBy: string): void {
  updateDatabaseState(draft => {
    if (!draft.insurancePolicies) return;
    const pol = draft.insurancePolicies.find(p => p.id === policyId);
    if (pol) {
      pol.coverageStatus = 'ACTIVE_ELIGIBLE';
      pol.lastVerifiedAt = new Date().toISOString();
      pol.verifiedBy = verifiedBy;
    }
  });
}

// Background EMR Sync Service
export function triggerBackgroundSync(): Promise<{ pushedCount: number; timestamp: string }> {
  return new Promise(resolve => {
    updateDatabaseState(draft => {
      draft.isBackgroundSyncing = true;
    });

    setTimeout(() => {
      let count = 0;
      updateDatabaseState(draft => {
        draft.isBackgroundSyncing = false;
        draft.lastBackgroundSyncAt = new Date().toISOString();
        if (draft.downtimeRecords) {
          count = draft.downtimeRecords.filter(r => r.reconciliationStatus === 'PENDING_RECONCILIATION').length;
          draft.downtimeRecords.forEach(r => {
            if (r.reconciliationStatus === 'PENDING_RECONCILIATION') {
              r.reconciliationStatus = 'RECONCILED';
              r.reconciledBy = 'Background Auto-Sync Worker';
            }
          });
        }
      });
      resolve({ pushedCount: count, timestamp: new Date().toISOString() });
    }, 1200);
  });
}

