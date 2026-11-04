/**
 * Blood Bank & Transfusion Medicine Types
 * Manages donor blood units, component separation, cold-chain refrigeration,
 * viral marker screening, and patient crossmatch reservations.
 */

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type BloodComponent = 'WHOLE_BLOOD' | 'PACKED_RBC' | 'PLATELETS' | 'FRESH_FROZEN_PLASMA';
export type BloodUnitStatus = 'AVAILABLE' | 'RESERVED' | 'TRANSFUSED' | 'EXPIRED' | 'QUARANTINED';

export interface BloodUnit {
  id: string;
  unitNumber: string; // e.g. "BLD-2026-00412"
  bloodGroup: BloodGroup;
  component: BloodComponent;
  volumeMl: number;
  collectedDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  status: BloodUnitStatus;
  storageLocation: string; // e.g. "Refrigerator Unit 1, Shelf B (4°C)"
  donorId: string;
  donorName: string;
  testedNegative: string[]; // ["HIV 1/2", "HBsAg (Hep B)", "HCV (Hep C)", "VDRL (Syphilis)"]
  reservedForPatientId?: string;
  reservedForPatientMrn?: string;
  reservedForPatientName?: string;
  crossmatchStatus?: 'COMPATIBLE' | 'PENDING' | 'NOT_TESTED';
}

export interface BloodDonor {
  id: string;
  fullName: string;
  age: number;
  gender: 'M' | 'F';
  phone: string;
  address: string;
  bloodGroup: BloodGroup;
  lastDonationDate: string;
  eligibilityStatus: 'ELIGIBLE' | 'TEMPORARY_DEFERRAL' | 'PERMANENT_DEFERRAL';
  deferralReason?: string;
  totalDonations: number;
  hemoglobinGdl: number; // e.g. 13.5 g/dL
}

export interface BloodTransfusionRequest {
  id: string;
  patientId: string;
  patientMrn: string;
  patientName: string;
  clinicalIndication: string; // e.g. "Post-partum hemorrhage", "Severe malarial anemia Hb 5.2 g/dL"
  urgency: 'STAT_EMERGENCY' | 'URGENT_2HR' | 'ROUTINE_ELECTIVE';
  unitsRequested: number;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  orderingDoctor: string;
  ward: string;
  status: 'PENDING' | 'CROSSMATCHED' | 'DISPATCHED' | 'COMPLETED' | 'CANCELLED';
  requestedAt: string;
}
