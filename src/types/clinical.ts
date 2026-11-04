/**
 * Clinical EMR / HIS Types
 * Longitudinal records, Vitals time series, Diagnoses, Orders, Labs, Pharmacy & Inpatient ADT
 */

export interface VitalSignObservation {
  id: string;
  patientId: string;
  encounterId: string;
  recordedAt: string;
  recordedBy: string; // Nurse name
  temperatureC: number;
  heartRateBpm: number;
  respiratoryRateBpm: number;
  systolicBpMmHg: number;
  diastolicBpMmHg: number;
  oxygenSaturationPercent: number; // SpO2
  weightKg?: number;
  heightCm?: number;
  bmi?: number;
  triageAcuity: 'RED_IMMEDIATE' | 'YELLOW_VERY_URGENT' | 'GREEN_STANDARD' | 'BLUE_NON_URGENT';
  painScaleScore?: number; // 0-10
  nursingNotes?: string;
  alerts: string[]; // e.g. ["Hypertensive Crisis Risk", "Febrile"]
}

export interface ClinicalEncounter {
  id: string;
  patientId: string;
  patientMrn: string;
  patientName: string;
  type: 'OPD' | 'EMERGENCY' | 'INPATIENT' | 'FOLLOWUP';
  status: 'IN_PROGRESS' | 'SIGNED_OFF' | 'ADMITTED' | 'DISCHARGED';
  attendingPhysicianId: string;
  attendingPhysicianName: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  physicalExamination: string;
  diagnoses: Array<{
    code: string; // e.g. "1F40" (ICD-11 Malaria) or "B54" (ICD-10)
    title: string;
    type: 'PRIMARY' | 'SECONDARY' | 'DIFFERENTIAL';
    system: 'ICD-11' | 'ICD-10';
  }>;
  treatmentPlan: string;
  signedAt?: string;
  signedBy?: string;
  addenda?: Array<{
    timestamp: string;
    author: string;
    note: string;
  }>;
  createdAt: string;
}

export interface LabOrder {
  id: string;
  accessionNumber: string; // e.g. "LAB-2026-00389"
  patientId: string;
  patientMrn: string;
  patientName: string;
  encounterId?: string;
  orderingPhysicianName: string;
  testName: string;
  category: 'HEMATOLOGY' | 'PARASITOLOGY' | 'BIOCHEMISTRY' | 'MICROBIOLOGY' | 'SEROLOGY' | 'URINALYSIS';
  sampleType: 'WHOLE_BLOOD' | 'SERUM' | 'PLASMA' | 'URINE' | 'STOOL' | 'SWAB';
  specimenCollected: boolean;
  specimenCollectedAt?: string;
  results?: {
    value: string;
    unit: string;
    referenceRange: string;
    isAbnormal: boolean;
    isCritical: boolean;
    comments?: string;
  };
  status: 'ORDERED' | 'SPECIMEN_RECEIVED' | 'PROCESSING' | 'PENDING_VALIDATION' | 'RELEASED' | 'CANCELLED';
  validatedBy?: string;
  releasedAt?: string;
  releasedToPatientPortal: boolean; // Governed release to prevent unreviewed patient distress
  orderedAt: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientMrn: string;
  patientName: string;
  encounterId?: string;
  prescribingDoctor: string;
  medicationName: string;
  genericName: string;
  dosage: string; // e.g. "500 mg"
  frequency: string; // e.g. "TDS (Three times daily)"
  durationDays: number;
  totalQuantity: number;
  instructions: string; // e.g. "Take after meals with plenty of water"
  status: 'PENDING_PHARMACY' | 'VERIFIED' | 'DISPENSED' | 'CANCELLED';
  dispensedBatchNumber?: string;
  dispensedAt?: string;
  dispensedBy?: string;
  createdAt: string;
}

export interface InpatientBed {
  id: string;
  bedNumber: string; // e.g. "MMW-B04"
  wardName: 'Male Medical Ward' | 'Female Medical Ward' | 'Pediatric Ward' | 'Maternity Ward' | 'Surgical Recovery Ward' | 'Intensive Care Unit';
  roomNumber: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'CLEANING_MAINTENANCE' | 'ISOLATION';
  currentPatientId?: string;
  currentPatientMrn?: string;
  currentPatientName?: string;
  admissionDate?: string;
  attendingDoctor?: string;
}

export interface AdmissionRecord {
  id: string;
  patientId: string;
  patientMrn: string;
  patientName: string;
  bedId: string;
  bedNumber: string;
  wardName: string;
  admittingDoctor: string;
  admissionReason: string;
  admissionDate: string;
  dischargeDate?: string;
  dischargeCondition?: 'RECOVERED' | 'IMPROVED' | 'TRANSFERRED' | 'DISCHARGED_AGAINST_MEDICAL_ADVICE';
  dischargeSummary?: string;
  status: 'ACTIVE' | 'DISCHARGED' | 'TRANSFERRED';
}

export interface RadiologyImage {
  id: string;
  url: string; // base64 or clinical imaging URI
  fileName: string;
  fileSizeKb: number;
  viewType: 'AP' | 'PA' | 'LATERAL' | 'OBLIQUE' | 'AXIAL' | 'SAGITTAL' | 'CORONAL' | 'TRANSVERSE';
  caption: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface RadiologyStudy {
  id: string;
  accessionNumber: string; // e.g. "RAD-2026-00104"
  patientId: string;
  patientMrn: string;
  patientName: string;
  patientAge?: number;
  patientGender?: 'MALE' | 'FEMALE' | 'OTHER';
  encounterId?: string;
  modality: 'X_RAY' | 'ULTRASOUND' | 'CT_SCAN' | 'MRI' | 'MAMMOGRAPHY' | 'ECHOCARDIOGRAM';
  studyDescription: string; // e.g. "Chest X-Ray 2 Views (PA & Lateral)"
  bodyPart: string; // e.g. "Thorax", "Pelvis & Hip", "Abdomen", "Left Leg"
  clinicalIndication: string; // e.g. "Persistent cough, hemoptysis, rule out pulmonary TB or lobar consolidation"
  orderingPhysicianName: string;
  status: 'SCHEDULED' | 'IMAGE_ACQUIRED' | 'INTERPRETED' | 'RELEASED' | 'CANCELLED';
  urgency: 'ROUTINE' | 'URGENT' | 'STAT_EMERGENCY';
  technologistName?: string;
  radiologistName?: string;
  findings?: string;
  impression?: string;
  radiationDoseMgy?: number;
  images: RadiologyImage[];
  scheduledDate: string;
  completedAt?: string;
  releasedAt?: string;
  releasedToPatientPortal: boolean;
}

