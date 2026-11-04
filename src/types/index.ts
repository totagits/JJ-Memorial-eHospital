// Master Data Types for J & J Memorial e-Hospital

export type SupportedLanguage = 'en' | 'kol' | 'kpe' | 'bas';

export type UserRole = 
  | 'executive'
  | 'admin'
  | 'doctor'
  | 'nurse'
  | 'triage'
  | 'pharmacist'
  | 'lab_tech'
  | 'radiologist'
  | 'cashier'
  | 'hr_manager'
  | 'patient';

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number e.g. JJM-2026-0042
  name: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  address: string;
  county: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies: string[];
  insuranceProvider?: string;
  insuranceId?: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  registeredAt: string;
}

export interface VitalRecord {
  id: string;
  patientId: string;
  timestamp: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
  temperature: number; // Celsius
  spo2: number; // %
  weight: number; // kg
  bloodGlucose?: number; // mg/dL
  respiratoryRate?: number;
  notes?: string;
}

export interface TriageEntry {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  age: number;
  gender: string;
  arrivalTime: string;
  chiefComplaint: string;
  vitals: {
    temp: number;
    bp: string;
    heartRate: number;
    spo2: number;
    respRate: number;
    painScore: number; // 1-10
  };
  urgency: 'Red' | 'Yellow' | 'Green'; // Red = Emergency, Yellow = Urgent, Green = Routine
  status: 'Waiting' | 'In Consultation' | 'Treated' | 'Admitted';
  assignedDoctor?: string;
  triageNurse: string;
}

export interface BloodInventoryItem {
  id: string;
  unitNumber: string;
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  component: 'Whole Blood' | 'PRBC (Red Cells)' | 'Platelets' | 'Fresh Frozen Plasma (FFP)' | 'Cryoprecipitate';
  volumeMl: number;
  collectionDate: string;
  expiryDate: string;
  donorId: string;
  donorName: string;
  donorContact: string;
  storageLocation: string; // e.g. Cold Room 1 - Shelf B2
  status: 'Available' | 'Reserved' | 'Transfused' | 'Quarantined' | 'Expired';
}

export interface Medication {
  id: string;
  name: string;
  genericName: string;
  category: string;
  dosageForm: string; // Tablets, Injection, Syrup, etc.
  strength: string;
  batchNumber: string;
  stockQuantity: number;
  minThreshold: number;
  unitPriceUSD: number;
  expiryDate: string;
  manufacturer: string;
}

export interface Prescription {
  id: string;
  prescriptionCode: string; // For QR code scanning
  patientId: string;
  patientName: string;
  mrn: string;
  doctorName: string;
  datePrescribed: string;
  items: {
    medicationId: string;
    medicationName: string;
    dosage: string;
    frequency: string;
    durationDays: number;
    quantity: number;
    instructions: string;
  }[];
  status: 'Pending' | 'Dispensed' | 'Partially Dispensed' | 'Cancelled';
  dispensedBy?: string;
  dispensedAt?: string;
}

export interface DispenserLogEntry {
  id: string;
  prescriptionCode: string;
  patientName: string;
  mrn: string;
  medicationName: string;
  quantityDispensed: number;
  batchNumber: string;
  pharmacistName: string;
  timestamp: string;
}

export interface RadiologyScan {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  modality: 'X-Ray' | 'CT Scan' | 'MRI' | 'Ultrasound' | 'Mammogram';
  bodyPart: string;
  orderDate: string;
  orderedBy: string;
  status: 'Requested' | 'In Progress' | 'Completed' | 'Reported';
  imageUrl: string;
  findings?: string;
  impression?: string;
  radiologistName?: string;
  signoffDate?: string;
}

export interface LabTestOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  mrn: string;
  testName: string;
  category: 'Hematology' | 'Biochemistry' | 'Microbiology' | 'Serology' | 'Parasitology';
  orderDate: string;
  status: 'Pending' | 'Sample Collected' | 'Testing' | 'Completed';
  technicianName?: string;
  results?: {
    parameter: string;
    value: string;
    unit: string;
    referenceRange: string;
    isCritical: boolean;
  }[];
  technicianNotes?: string;
  completedAt?: string;
}

export interface InsurancePolicyCheck {
  id: string;
  insuranceId: string;
  provider: string;
  patientName: string;
  policyStatus: 'Active' | 'Pending Renewal' | 'Suspended' | 'Exhausted';
  validUntil: string;
  coveragePercentage: number; // e.g. 80%
  deductibleRemainingUSD: number;
  coPayUSD: number;
  coveredServices: string[];
  exclusions: string[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  category: 'Consultation' | 'Laboratory' | 'Pharmacy' | 'Radiology' | 'Bed Charge' | 'Procedure';
  quantity: number;
  unitPriceUSD: number;
  totalUSD: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  mrn: string;
  date: string;
  items: InvoiceItem[];
  subtotalUSD: number;
  taxUSD: number;
  discountUSD: number;
  totalUSD: number;
  paidAmountUSD: number;
  balanceUSD: number;
  status: 'Draft' | 'Unpaid' | 'Partially Paid' | 'Paid' | 'Refunded';
  paymentMethod?: 'Cash' | 'MTN Mobile Money' | 'Orange Money' | 'Credit Card' | 'Insurance';
  cashierName?: string;
  receiptHash: string;
}

export interface StaffScheduleShift {
  id: string;
  staffId: string;
  staffName: string;
  role: UserRole;
  department: string;
  date: string;
  shiftType: 'Morning (07:00 - 15:00)' | 'Afternoon (15:00 - 23:00)' | 'Night (23:00 - 07:00)' | 'On-Call (24h)';
  roomOrWard: string;
  status: 'Confirmed' | 'Tentative' | 'Swapped';
}

export interface ResourceBooking {
  id: string;
  resourceId: string;
  resourceName: string;
  resourceType: 'Operating Theater' | 'Ultrasound Machine' | 'CT Scanner' | 'MRI Machine' | 'Dialysis Unit' | 'Mobile X-Ray';
  bookedBy: string;
  patientName: string;
  patientMrn: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: 'Confirmed' | 'In Use' | 'Completed' | 'Cancelled';
}

export interface DigitalConsentForm {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  formType: 'General Admission & Treatment Consent' | 'Surgical & Anesthesia Authorization' | 'Blood Transfusion Consent' | 'Telehealth Care Consent' | 'Medical Records Release Authorization';
  signatureDataUrl: string;
  signedName: string;
  signerRelationship: 'Self' | 'Parent' | 'Guardian' | 'Power of Attorney';
  timestamp: string;
  documentHash: string;
  ipAddress: string;
}

export interface DownloadableDocument {
  id: string;
  title: string;
  category: 'Patient Intake' | 'Clinical Consent' | 'Records & Privacy' | 'Financial & Billing' | 'Telehealth';
  description: string;
  pages: number;
  updatedDate: string;
  fileSize: string;
  downloadUrl?: string;
}

export interface PatientTestimonial {
  id: string;
  patientName: string;
  rating: number; // 1-5
  comment: string;
  department: string;
  date: string;
  verified: boolean;
  isPublicConsent: boolean;
}

export interface HospitalNewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'Public Health' | 'Hospital Update' | 'Maternal Care' | 'Vaccination' | 'Emergency Preparedness';
  author: string;
  date: string;
  readTime: string;
  imageUrl?: string;
}

export interface ClinicFacility {
  id: string;
  name: string;
  county: string;
  address: string;
  coordinates: { lat: number; lng: number };
  phone: string;
  emergencyHotline: string;
  email: string;
  operatingHours: string;
  services: string[];
  isMainCampus: boolean;
}

export interface ActivityFeedItem {
  id: string;
  timestamp: string;
  type: 'Registration' | 'Appointment' | 'Triage' | 'Lab' | 'Pharmacy' | 'Billing' | 'Radiology';
  actor: string;
  description: string;
  patientMrn?: string;
  urgency?: 'normal' | 'urgent' | 'critical';
}

export interface DigitalSignageSlide {
  id: string;
  title: string;
  type: 'Queue Calling' | 'Health Tip' | 'Doctor on Duty' | 'Announcement' | 'Emergency Info';
  content: string;
  highlightText?: string;
  durationSeconds: number;
  active: boolean;
  order: number;
}

export interface InternalMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  channel: 'General Clinical' | 'OPD Urgent' | 'Pharmacy & Stock' | 'Lab & Diagnostics' | 'Admin & HR';
  content: string;
  timestamp: string;
  isUrgent: boolean;
}

export interface PatientChatMessage {
  id: string;
  patientId: string;
  sender: 'patient' | 'staff' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface PatientUploadedDoc {
  id: string;
  patientId: string;
  title: string;
  category: 'Vaccination Card' | 'Past Physician Note' | 'Outside Lab Report' | 'Insurance Card' | 'Other';
  fileName: string;
  fileSize: string;
  uploadDate: string;
  sharedWithClinicians: boolean;
}

export interface ApiPerformanceMetric {
  id: string;
  endpoint: string;
  method: string;
  latencyMs: number;
  status: number;
  timestamp: string;
  isError: boolean;
}
