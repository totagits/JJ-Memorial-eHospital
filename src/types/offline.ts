/**
 * Offline & Downtime Continuity Types
 * Resilient buffer for power grid outages, local contingency registration, and reconciliation
 */

export interface DowntimeOfflineRecord {
  id: string;
  temporaryDowntimeId: string; // e.g. "DT-EMR-0104"
  capturedAt: string;
  patientName: string;
  gender: 'M' | 'F' | 'OTHER';
  approximateAge?: number;
  phoneContact?: string;
  chiefComplaint: string;
  emergencyCategory: 'TRIAGE_RED' | 'TRIAGE_YELLOW' | 'TRIAGE_GREEN';
  paperPacketNumber: string; // e.g. "PKT-ER-2026-08"
  medicationsAdministeredManually: string;
  cashCollectedReceiptManualNo?: string;
  reconciliationStatus: 'PENDING_RECONCILIATION' | 'RECONCILED' | 'CONFLICT_DETECTED';
  reconciledPermanentMrn?: string;
  reconciledBy?: string;
  notes?: string;
}

export interface DowntimeState {
  isDowntimeActive: boolean;
  downtimeDeclaredAt?: string;
  declaredBy?: string;
  reason?: string;
  activeGeneratorStatus?: 'ONLINE_500KVA' | 'OFFLINE' | 'UPS_BATTERY_ONLY';
  bufferedRecordsCount: number;
}
