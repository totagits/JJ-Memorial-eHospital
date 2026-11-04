import {
  Patient,
  VitalRecord,
  TriageEntry,
  BloodInventoryItem,
  Medication,
  Prescription,
  DispenserLogEntry,
  RadiologyScan,
  LabTestOrder,
  InsurancePolicyCheck,
  Invoice,
  StaffScheduleShift,
  ResourceBooking,
  DigitalConsentForm,
  DownloadableDocument,
  PatientTestimonial,
  HospitalNewsItem,
  ClinicFacility,
  ActivityFeedItem,
  DigitalSignageSlide,
  InternalMessage,
  PatientChatMessage,
  PatientUploadedDoc
} from '../types';
import { offlineSyncService } from './offlineSync';
import { apiPerformanceService } from './apiPerformance';
import { notificationService } from './notifications';

// Initial authentic synthetic dataset for J & J Memorial Health Center, Monrovia, Liberia
const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    mrn: 'JJM-2026-0042',
    name: 'Korto Kollie',
    dob: '1989-06-14',
    gender: 'Female',
    phone: '+231 77 012 3456',
    email: 'korto.kollie@gmail.com',
    address: 'Oldest Congo Town, Tubman Boulevard',
    county: 'Montserrado',
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Sulfa Drugs'],
    insuranceProvider: 'NASSCORP Healthcare Plan',
    insuranceId: 'NASS-88921-LIB',
    emergencyContact: {
      name: 'Flomo Kollie',
      relationship: 'Spouse',
      phone: '+231 88 654 3210',
    },
    registeredAt: '2026-01-15T09:30:00Z',
  },
  {
    id: 'pat-2',
    mrn: 'JJM-2026-0089',
    name: 'James Varney Fahnbulleh',
    dob: '1975-11-23',
    gender: 'Male',
    phone: '+231 88 099 8877',
    email: 'j.fahnbulleh@gmail.com',
    address: 'Sinkor 15th Street, Beachside',
    county: 'Montserrado',
    bloodGroup: 'B+',
    allergies: ['Aspirin'],
    insuranceProvider: 'Sunu Assurances Liberia',
    insuranceId: 'SUNU-9021-CL',
    emergencyContact: {
      name: 'Comfort Fahnbulleh',
      relationship: 'Sister',
      phone: '+231 77 554 4332',
    },
    registeredAt: '2026-02-10T14:15:00Z',
  },
  {
    id: 'pat-3',
    mrn: 'JJM-2026-0115',
    name: 'Musu Sirleaf',
    dob: '1996-03-30',
    gender: 'Female',
    phone: '+231 77 811 2233',
    email: 'musu.sirleaf@hotmail.com',
    address: 'Duport Road, Paynesville',
    county: 'Montserrado',
    bloodGroup: 'A-',
    allergies: [],
    insuranceProvider: 'Activa International Insurance',
    insuranceId: 'ACT-4421-MC',
    emergencyContact: {
      name: 'Abu Sirleaf',
      relationship: 'Brother',
      phone: '+231 88 123 9988',
    },
    registeredAt: '2026-02-28T11:00:00Z',
  },
  {
    id: 'pat-4',
    mrn: 'JJM-2026-0164',
    name: 'Emmanuel Tarpeh',
    dob: '2001-08-19',
    gender: 'Male',
    phone: '+231 77 334 5566',
    email: 'emmanuel.tarpeh@yahoo.com',
    address: 'Broad Street, Central Monrovia',
    county: 'Montserrado',
    bloodGroup: 'AB+',
    allergies: ['Ciprofloxacin'],
    insuranceProvider: 'Self-Pay / Cash',
    insuranceId: 'NONE',
    emergencyContact: {
      name: 'Marie Tarpeh',
      relationship: 'Mother',
      phone: '+231 88 776 5544',
    },
    registeredAt: '2026-03-05T08:45:00Z',
  },
];

const INITIAL_VITALS: VitalRecord[] = [
  {
    id: 'vit-1',
    patientId: 'pat-1',
    timestamp: '2026-10-28T08:30:00Z',
    systolic: 122,
    diastolic: 78,
    heartRate: 72,
    temperature: 36.6,
    spo2: 98,
    weight: 68.5,
    bloodGlucose: 95,
    respiratoryRate: 16,
    notes: 'Morning routine check. Normal baseline.',
  },
  {
    id: 'vit-2',
    patientId: 'pat-1',
    timestamp: '2026-10-29T08:45:00Z',
    systolic: 125,
    diastolic: 80,
    heartRate: 75,
    temperature: 36.7,
    spo2: 99,
    weight: 68.7,
    bloodGlucose: 102,
    respiratoryRate: 16,
    notes: 'Fasting glucose checked.',
  },
  {
    id: 'vit-3',
    patientId: 'pat-1',
    timestamp: '2026-10-30T09:00:00Z',
    systolic: 128,
    diastolic: 82,
    heartRate: 78,
    temperature: 36.9,
    spo2: 97,
    weight: 68.9,
    bloodGlucose: 110,
    respiratoryRate: 18,
    notes: 'Slight headache reported.',
  },
  {
    id: 'vit-4',
    patientId: 'pat-1',
    timestamp: '2026-10-31T08:15:00Z',
    systolic: 120,
    diastolic: 76,
    heartRate: 70,
    temperature: 36.5,
    spo2: 99,
    weight: 68.4,
    bloodGlucose: 92,
    respiratoryRate: 15,
    notes: 'Resting vitals optimal.',
  },
  {
    id: 'vit-5',
    patientId: 'pat-1',
    timestamp: '2026-11-01T08:30:00Z',
    systolic: 124,
    diastolic: 79,
    heartRate: 74,
    temperature: 36.7,
    spo2: 98,
    weight: 68.5,
    bloodGlucose: 98,
    respiratoryRate: 16,
    notes: 'Post workout check.',
  },
  {
    id: 'vit-6',
    patientId: 'pat-1',
    timestamp: '2026-11-02T08:20:00Z',
    systolic: 126,
    diastolic: 81,
    heartRate: 76,
    temperature: 36.8,
    spo2: 98,
    weight: 68.6,
    bloodGlucose: 105,
    respiratoryRate: 17,
    notes: 'Normal trend.',
  },
  {
    id: 'vit-7',
    patientId: 'pat-1',
    timestamp: '2026-11-03T08:30:00Z',
    systolic: 121,
    diastolic: 77,
    heartRate: 71,
    temperature: 36.6,
    spo2: 99,
    weight: 68.3,
    bloodGlucose: 94,
    respiratoryRate: 16,
    notes: 'Latest morning check.',
  },
];

const INITIAL_TRIAGE: TriageEntry[] = [
  {
    id: 'tri-1',
    patientId: 'pat-4',
    patientName: 'Emmanuel Tarpeh',
    mrn: 'JJM-2026-0164',
    age: 25,
    gender: 'Male',
    arrivalTime: '18:40',
    chiefComplaint: 'Acute chest pain radiating to left shoulder, shortness of breath, diaphoresis.',
    vitals: {
      temp: 37.8,
      bp: '165/105',
      heartRate: 118,
      spo2: 91,
      respRate: 26,
      painScore: 9,
    },
    urgency: 'Red',
    status: 'Waiting',
    assignedDoctor: 'Dr. Emmanuel Tamba, MD',
    triageNurse: 'Nurse Sarah Kiatamba, RN',
  },
  {
    id: 'tri-2',
    patientId: 'pat-2',
    patientName: 'James Varney Fahnbulleh',
    mrn: 'JJM-2026-0089',
    age: 51,
    gender: 'Male',
    arrivalTime: '19:05',
    chiefComplaint: 'High fever, rigors, body aches, suspected malaria recurrence.',
    vitals: {
      temp: 39.2,
      bp: '135/88',
      heartRate: 98,
      spo2: 96,
      respRate: 20,
      painScore: 6,
    },
    urgency: 'Yellow',
    status: 'Waiting',
    assignedDoctor: 'Dr. Fatumata Fofana, MD',
    triageNurse: 'Nurse Sarah Kiatamba, RN',
  },
  {
    id: 'tri-3',
    patientId: 'pat-3',
    patientName: 'Musu Sirleaf',
    mrn: 'JJM-2026-0115',
    age: 30,
    gender: 'Female',
    arrivalTime: '19:15',
    chiefComplaint: 'Follow-up consultation for mild seasonal allergy and skin rash.',
    vitals: {
      temp: 36.7,
      bp: '118/74',
      heartRate: 72,
      spo2: 99,
      respRate: 16,
      painScore: 2,
    },
    urgency: 'Green',
    status: 'Waiting',
    assignedDoctor: 'Dr. Moses Weah, MD',
    triageNurse: 'Nurse David Toe, LPN',
  },
];

const INITIAL_BLOOD_BANK: BloodInventoryItem[] = [
  {
    id: 'bb-1',
    unitNumber: 'BLD-2026-0091',
    bloodType: 'O+',
    component: 'Whole Blood',
    volumeMl: 450,
    collectionDate: '2026-10-20',
    expiryDate: '2026-11-24',
    donorId: 'DON-1021',
    donorName: 'Melvin Gbarbea',
    donorContact: '+231 77 123 4567',
    storageLocation: 'Cold Chamber A1 - Tray 1',
    status: 'Available',
  },
  {
    id: 'bb-2',
    unitNumber: 'BLD-2026-0092',
    bloodType: 'O+',
    component: 'PRBC (Red Cells)',
    volumeMl: 300,
    collectionDate: '2026-10-18',
    expiryDate: '2026-11-22',
    donorId: 'DON-1024',
    donorName: 'Kebbeh Freeman',
    donorContact: '+231 88 234 5678',
    storageLocation: 'Cold Chamber A1 - Tray 2',
    status: 'Available',
  },
  {
    id: 'bb-3',
    unitNumber: 'BLD-2026-0084',
    bloodType: 'O-',
    component: 'PRBC (Red Cells)',
    volumeMl: 300,
    collectionDate: '2026-10-12',
    expiryDate: '2026-11-06', // Expiring soon alert!
    donorId: 'DON-1011',
    donorName: 'Alhaji Kamara',
    donorContact: '+231 77 345 6789',
    storageLocation: 'Cold Chamber A2 - Tray 1',
    status: 'Available',
  },
  {
    id: 'bb-4',
    unitNumber: 'BLD-2026-0077',
    bloodType: 'A+',
    component: 'Whole Blood',
    volumeMl: 450,
    collectionDate: '2026-10-25',
    expiryDate: '2026-11-29',
    donorId: 'DON-1045',
    donorName: 'Clarice Cooper',
    donorContact: '+231 88 456 7890',
    storageLocation: 'Cold Chamber B1 - Tray 3',
    status: 'Available',
  },
  {
    id: 'bb-5',
    unitNumber: 'BLD-2026-0072',
    bloodType: 'B+',
    component: 'Fresh Frozen Plasma (FFP)',
    volumeMl: 250,
    collectionDate: '2026-09-15',
    expiryDate: '2027-09-15',
    donorId: 'DON-0988',
    donorName: 'Jefferson Wesseh',
    donorContact: '+231 77 567 8901',
    storageLocation: 'Deep Freezer F1 (-30C)',
    status: 'Available',
  },
  {
    id: 'bb-6',
    unitNumber: 'BLD-2026-0065',
    bloodType: 'AB-',
    component: 'Platelets',
    volumeMl: 200,
    collectionDate: '2026-11-01',
    expiryDate: '2026-11-06',
    donorId: 'DON-1050',
    donorName: 'Patricia Dolo',
    donorContact: '+231 88 678 9012',
    storageLocation: 'Platelet Agitator Room 2',
    status: 'Available',
  },
];

const INITIAL_MEDICATIONS: Medication[] = [
  {
    id: 'med-1',
    name: 'Artemether / Lumefantrine (Coartem)',
    genericName: 'Artemether + Lumefantrine',
    category: 'Antimalarial',
    dosageForm: 'Tablets',
    strength: '20mg / 120mg',
    batchNumber: 'BAT-2026-CO4',
    stockQuantity: 142,
    minThreshold: 50,
    unitPriceUSD: 4.5,
    expiryDate: '2027-08-31',
    manufacturer: 'Novartis Pharma',
  },
  {
    id: 'med-2',
    name: 'Amoxicillin + Clavulanate (Augmentin)',
    genericName: 'Amoxicillin / Clavulanic Acid',
    category: 'Antibiotic',
    dosageForm: 'Film-coated Tablets',
    strength: '625mg',
    batchNumber: 'BAT-2026-AUG8',
    stockQuantity: 28, // Low stock alert!
    minThreshold: 40,
    unitPriceUSD: 8.0,
    expiryDate: '2027-03-31',
    manufacturer: 'GSK Healthcare',
  },
  {
    id: 'med-3',
    name: 'Amlodipine Besylate',
    genericName: 'Amlodipine',
    category: 'Antihypertensive',
    dosageForm: 'Tablets',
    strength: '10mg',
    batchNumber: 'BAT-2026-AML2',
    stockQuantity: 310,
    minThreshold: 60,
    unitPriceUSD: 2.5,
    expiryDate: '2028-01-30',
    manufacturer: 'Pfizer Inc.',
  },
  {
    id: 'med-4',
    name: 'Metformin Hydrochloride',
    genericName: 'Metformin',
    category: 'Antidiabetic',
    dosageForm: 'Extended Release Tablets',
    strength: '500mg',
    batchNumber: 'BAT-2026-MET9',
    stockQuantity: 185,
    minThreshold: 50,
    unitPriceUSD: 3.0,
    expiryDate: '2027-11-30',
    manufacturer: 'Merck Healthcare',
  },
  {
    id: 'med-5',
    name: 'Ceftriaxone Sodium Injection',
    genericName: 'Ceftriaxone',
    category: 'Antibiotic Injection',
    dosageForm: 'Vial for IV/IM',
    strength: '1g',
    batchNumber: 'BAT-2026-CEF1',
    stockQuantity: 16, // Critical low stock alert!
    minThreshold: 30,
    unitPriceUSD: 6.5,
    expiryDate: '2027-05-15',
    manufacturer: 'Roche Diagnostics',
  },
  {
    id: 'med-6',
    name: 'Paracetamol / Acetaminophen',
    genericName: 'Paracetamol',
    category: 'Analgesic & Antipyretic',
    dosageForm: 'Tablets',
    strength: '500mg',
    batchNumber: 'BAT-2026-PCM7',
    stockQuantity: 840,
    minThreshold: 150,
    unitPriceUSD: 1.0,
    expiryDate: '2028-06-30',
    manufacturer: 'Emzor Pharmaceuticals',
  },
];

const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'rx-1',
    prescriptionCode: 'RX-JJM-9821',
    patientId: 'pat-1',
    patientName: 'Korto Kollie',
    mrn: 'JJM-2026-0042',
    doctorName: 'Dr. Emmanuel Tamba, MD',
    datePrescribed: '2026-11-03',
    items: [
      {
        medicationId: 'med-1',
        medicationName: 'Artemether / Lumefantrine (Coartem) 20/120mg',
        dosage: '4 tablets stat, then 4 at 8h, then 4 BID',
        frequency: 'Twice daily',
        durationDays: 3,
        quantity: 24,
        instructions: 'Take immediately with a fatty meal or milk for proper absorption.',
      },
      {
        medicationId: 'med-6',
        medicationName: 'Paracetamol 500mg',
        dosage: '2 tablets',
        frequency: 'Every 8 hours as needed for fever',
        durationDays: 4,
        quantity: 20,
        instructions: 'Do not exceed 8 tablets in 24 hours.',
      },
    ],
    status: 'Pending',
  },
  {
    id: 'rx-2',
    prescriptionCode: 'RX-JJM-9750',
    patientId: 'pat-2',
    patientName: 'James Varney Fahnbulleh',
    mrn: 'JJM-2026-0089',
    doctorName: 'Dr. Fatumata Fofana, MD',
    datePrescribed: '2026-11-02',
    items: [
      {
        medicationId: 'med-3',
        medicationName: 'Amlodipine Besylate 10mg',
        dosage: '1 tablet',
        frequency: 'Once daily in the morning',
        durationDays: 30,
        quantity: 30,
        instructions: 'Monitor blood pressure weekly.',
      },
    ],
    status: 'Dispensed',
    dispensedBy: 'Pharm. Varney Sheriff, RPh',
    dispensedAt: '2026-11-02T15:40:00Z',
  },
];

const INITIAL_DISPENSER_LOG: DispenserLogEntry[] = [
  {
    id: 'disp-1',
    prescriptionCode: 'RX-JJM-9750',
    patientName: 'James Varney Fahnbulleh',
    mrn: 'JJM-2026-0089',
    medicationName: 'Amlodipine Besylate 10mg',
    quantityDispensed: 30,
    batchNumber: 'BAT-2026-AML2',
    pharmacistName: 'Pharm. Varney Sheriff, RPh',
    timestamp: '2026-11-02 15:40',
  },
  {
    id: 'disp-2',
    prescriptionCode: 'RX-JJM-9712',
    patientName: 'Musu Sirleaf',
    mrn: 'JJM-2026-0115',
    medicationName: 'Amoxicillin + Clavulanate 625mg',
    quantityDispensed: 14,
    batchNumber: 'BAT-2026-AUG8',
    pharmacistName: 'Pharm. Cynthia Gray, RPh',
    timestamp: '2026-11-01 11:25',
  },
];

const INITIAL_RADIOLOGY: RadiologyScan[] = [
  {
    id: 'rad-1',
    patientId: 'pat-1',
    patientName: 'Korto Kollie',
    mrn: 'JJM-2026-0042',
    modality: 'X-Ray',
    bodyPart: 'Chest PA View',
    orderDate: '2026-11-02',
    orderedBy: 'Dr. Emmanuel Tamba, MD',
    status: 'Reported',
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
    findings: 'Lungs are clear bilaterally with no active focal consolidation, pleural effusion or pneumothorax. Cardiothoracic ratio is normal (<0.50). Visualized bony thorax intact.',
    impression: 'Normal upright chest radiograph. No acute cardiopulmonary pathology.',
    radiologistName: 'Dr. Sekou Massaquoi, MD (Radiology)',
    signoffDate: '2026-11-02 16:30',
  },
  {
    id: 'rad-2',
    patientId: 'pat-2',
    patientName: 'James Varney Fahnbulleh',
    mrn: 'JJM-2026-0089',
    modality: 'CT Scan',
    bodyPart: 'Abdomen & Pelvis (with IV contrast)',
    orderDate: '2026-11-03',
    orderedBy: 'Dr. Fatumata Fofana, MD',
    status: 'In Progress',
    imageUrl: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=1200&q=80',
    findings: 'Scan acquired in portal venous phase. Liver, gallbladder, spleen, and pancreas within normal limits.',
    impression: 'Pending final senior consultant verification.',
    radiologistName: 'Dr. Sekou Massaquoi, MD',
  },
  {
    id: 'rad-3',
    patientId: 'pat-4',
    patientName: 'Emmanuel Tarpeh',
    mrn: 'JJM-2026-0164',
    modality: 'Ultrasound',
    bodyPart: 'Echocardiogram 2D / Doppler',
    orderDate: '2026-11-03',
    orderedBy: 'Dr. Emmanuel Tamba, MD',
    status: 'Requested',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
  },
];

const INITIAL_LAB_ORDERS: LabTestOrder[] = [
  {
    id: 'lab-1',
    orderNumber: 'LAB-2026-5510',
    patientId: 'pat-1',
    patientName: 'Korto Kollie',
    mrn: 'JJM-2026-0042',
    testName: 'Complete Blood Count (CBC) with Differential',
    category: 'Hematology',
    orderDate: '2026-11-03',
    status: 'Completed',
    technicianName: 'Sando Coleman, Lab Tech',
    results: [
      { parameter: 'Hemoglobin (Hb)', value: '13.2', unit: 'g/dL', referenceRange: '12.0 - 15.5', isCritical: false },
      { parameter: 'White Blood Cells (WBC)', value: '6.8', unit: 'x10^3/uL', referenceRange: '4.5 - 11.0', isCritical: false },
      { parameter: 'Platelets', value: '240', unit: 'x10^3/uL', referenceRange: '150 - 450', isCritical: false },
      { parameter: 'Hematocrit (Hct)', value: '39.8', unit: '%', referenceRange: '36.0 - 46.0', isCritical: false },
    ],
    technicianNotes: 'Parameters within normal physiological baseline.',
    completedAt: '2026-11-03 14:10',
  },
  {
    id: 'lab-2',
    orderNumber: 'LAB-2026-5524',
    patientId: 'pat-2',
    patientName: 'James Varney Fahnbulleh',
    mrn: 'JJM-2026-0089',
    testName: 'Malaria Rapid Test (mRDT) & Blood Film for MPS',
    category: 'Parasitology',
    orderDate: '2026-11-03',
    status: 'Completed',
    technicianName: 'Sando Coleman, Lab Tech',
    results: [
      { parameter: 'Plasmodium falciparum (Pf) Ag', value: 'POSITIVE (+++)', unit: 'qualitative', referenceRange: 'Negative', isCritical: true },
      { parameter: 'Parasite Density (MPS)', value: '14,200', unit: 'parasites/uL', referenceRange: '0', isCritical: true },
    ],
    technicianNotes: 'HIGH PARASITEMIA DETECTED. Immediate IV/oral antimalarial protocol triggered to attending physician.',
    completedAt: '2026-11-03 18:50',
  },
  {
    id: 'lab-3',
    orderNumber: 'LAB-2026-5531',
    patientId: 'pat-4',
    patientName: 'Emmanuel Tarpeh',
    mrn: 'JJM-2026-0164',
    testName: 'Cardiac Biomarkers (Troponin I & CK-MB)',
    category: 'Biochemistry',
    orderDate: '2026-11-03',
    status: 'Testing',
    technicianName: 'Sando Coleman, Lab Tech',
    results: [
      { parameter: 'Troponin I High-Sensitivity', value: '0.84', unit: 'ng/mL', referenceRange: '< 0.04', isCritical: true },
    ],
    technicianNotes: 'CRITICAL VALUE ALERT: Elevated cardiac troponin consistent with acute coronary syndrome.',
    completedAt: '2026-11-03 19:20',
  },
];

const INITIAL_INSURANCE_RECORDS: InsurancePolicyCheck[] = [
  {
    id: 'ins-1',
    insuranceId: 'NASS-88921-LIB',
    provider: 'National Social Security & Welfare (NASSCORP)',
    patientName: 'Korto Kollie',
    policyStatus: 'Active',
    validUntil: '2027-12-31',
    coveragePercentage: 85,
    deductibleRemainingUSD: 45.0,
    coPayUSD: 10.0,
    coveredServices: ['General OPD', 'Inpatient Ward', 'Emergency Services', 'Essential Medicines', 'Clinical Lab Tests'],
    exclusions: ['Elective Cosmetic Surgery', 'Experimental Off-label Biologics'],
  },
  {
    id: 'ins-2',
    insuranceId: 'SUNU-9021-CL',
    provider: 'Sunu Assurances Liberia Ltd.',
    patientName: 'James Varney Fahnbulleh',
    policyStatus: 'Active',
    validUntil: '2027-06-30',
    coveragePercentage: 90,
    deductibleRemainingUSD: 0.0,
    coPayUSD: 5.0,
    coveredServices: ['Comprehensive OPD/IPD', 'Specialist Consultations', 'Radiology (CT/MRI)', 'Surgery', 'Prescription Drugs'],
    exclusions: ['Adult Orthodontics'],
  },
  {
    id: 'ins-3',
    insuranceId: 'ACT-4421-MC',
    provider: 'Activa International Insurance Liberia',
    patientName: 'Musu Sirleaf',
    policyStatus: 'Active',
    validUntil: '2027-04-15',
    coveragePercentage: 80,
    deductibleRemainingUSD: 80.0,
    coPayUSD: 15.0,
    coveredServices: ['OPD Consultations', 'Maternal & Child Health', 'Routine Labs', 'Emergency Care'],
    exclusions: ['International Medical Evacuation'],
  },
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-00412',
    patientId: 'pat-1',
    patientName: 'Korto Kollie',
    mrn: 'JJM-2026-0042',
    date: '2026-11-03',
    items: [
      { id: 'item-1', description: 'Consultation - Internal Medicine', category: 'Consultation', quantity: 1, unitPriceUSD: 25.0, totalUSD: 25.0 },
      { id: 'item-2', description: 'Complete Blood Count (CBC)', category: 'Laboratory', quantity: 1, unitPriceUSD: 18.0, totalUSD: 18.0 },
      { id: 'item-3', description: 'Chest X-Ray Digital Examination', category: 'Radiology', quantity: 1, unitPriceUSD: 35.0, totalUSD: 35.0 },
      { id: 'item-4', description: 'Coartem Antimalarial Therapy (24 tabs)', category: 'Pharmacy', quantity: 1, unitPriceUSD: 6.0, totalUSD: 6.0 },
    ],
    subtotalUSD: 84.0,
    taxUSD: 0.0,
    discountUSD: 10.0,
    totalUSD: 74.0,
    paidAmountUSD: 74.0,
    balanceUSD: 0.0,
    status: 'Paid',
    paymentMethod: 'MTN Mobile Money',
    cashierName: 'Beatrice Flomo, Lead Cashier',
    receiptHash: 'SHA256-JJM-RECEIPT-7790-2026',
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-00413',
    patientId: 'pat-2',
    patientName: 'James Varney Fahnbulleh',
    mrn: 'JJM-2026-0089',
    date: '2026-11-03',
    items: [
      { id: 'item-5', description: 'Emergency Room Triage & Assessment', category: 'Consultation', quantity: 1, unitPriceUSD: 30.0, totalUSD: 30.0 },
      { id: 'item-6', description: 'Malaria RDT + Microscopy Confirmation', category: 'Laboratory', quantity: 1, unitPriceUSD: 12.0, totalUSD: 12.0 },
      { id: 'item-7', description: 'CT Scan Abdomen with Contrast', category: 'Radiology', quantity: 1, unitPriceUSD: 160.0, totalUSD: 160.0 },
    ],
    subtotalUSD: 202.0,
    taxUSD: 0.0,
    discountUSD: 0.0,
    totalUSD: 202.0,
    paidAmountUSD: 100.0,
    balanceUSD: 102.0,
    status: 'Partially Paid',
    paymentMethod: 'Cash',
    cashierName: 'Beatrice Flomo, Lead Cashier',
    receiptHash: 'SHA256-JJM-RECEIPT-7791-2026',
  },
];

const INITIAL_SCHEDULES: StaffScheduleShift[] = [
  {
    id: 'shift-1',
    staffId: 'stf-1',
    staffName: 'Dr. Emmanuel Tamba, MD',
    role: 'doctor',
    department: 'Internal Medicine / OPD',
    date: '2026-11-04',
    shiftType: 'Morning (07:00 - 15:00)',
    roomOrWard: 'Consulting Room 1',
    status: 'Confirmed',
  },
  {
    id: 'shift-2',
    staffId: 'stf-2',
    staffName: 'Dr. Fatumata Fofana, MD',
    role: 'doctor',
    department: 'Emergency & Acute Care',
    date: '2026-11-04',
    shiftType: 'Afternoon (15:00 - 23:00)',
    roomOrWard: 'Emergency Bay A',
    status: 'Confirmed',
  },
  {
    id: 'shift-3',
    staffId: 'stf-3',
    staffName: 'Nurse Sarah Kiatamba, RN',
    role: 'triage',
    department: 'OPD Triage Station',
    date: '2026-11-04',
    shiftType: 'Morning (07:00 - 15:00)',
    roomOrWard: 'Triage Desk 1',
    status: 'Confirmed',
  },
  {
    id: 'shift-4',
    staffId: 'stf-4',
    staffName: 'Pharm. Varney Sheriff, RPh',
    role: 'pharmacist',
    department: 'Central Pharmacy',
    date: '2026-11-04',
    shiftType: 'Morning (07:00 - 15:00)',
    roomOrWard: 'Dispensary Counter 1',
    status: 'Confirmed',
  },
  {
    id: 'shift-5',
    staffId: 'stf-5',
    staffName: 'Dr. Moses Weah, MD',
    role: 'doctor',
    department: 'Pediatrics',
    date: '2026-11-04',
    shiftType: 'Night (23:00 - 07:00)',
    roomOrWard: 'Pediatric Ward B',
    status: 'Confirmed',
  },
];

const INITIAL_RESOURCES: ResourceBooking[] = [
  {
    id: 'res-1',
    resourceId: 'eq-1',
    resourceName: 'GE Logiq E10 Ultrasound Machine',
    resourceType: 'Ultrasound Machine',
    bookedBy: 'Dr. Emmanuel Tamba, MD',
    patientName: 'Korto Kollie',
    patientMrn: 'JJM-2026-0042',
    startTime: '2026-11-04T09:30:00',
    endTime: '2026-11-04T10:30:00',
    purpose: 'Routine pelvic ultrasound evaluation',
    status: 'Confirmed',
  },
  {
    id: 'res-2',
    resourceId: 'eq-2',
    resourceName: 'Siemens Somatom 64-Slice CT Scanner',
    resourceType: 'CT Scanner',
    bookedBy: 'Dr. Fatumata Fofana, MD',
    patientName: 'James Varney Fahnbulleh',
    patientMrn: 'JJM-2026-0089',
    startTime: '2026-11-04T11:00:00',
    endTime: '2026-11-04T12:00:00',
    purpose: 'Follow-up high-resolution abdominal scanning',
    status: 'Confirmed',
  },
  {
    id: 'res-3',
    resourceId: 'eq-3',
    resourceName: 'Operating Theater 1 (Major Surgery Suite)',
    resourceType: 'Operating Theater',
    bookedBy: 'Dr. Christian Nyenpan, FACS',
    patientName: 'Emmanuel Tarpeh',
    patientMrn: 'JJM-2026-0164',
    startTime: '2026-11-04T14:00:00',
    endTime: '2026-11-04T17:00:00',
    purpose: 'Exploratory laparoscopy and repair',
    status: 'Confirmed',
  },
];

const INITIAL_TESTIMONIALS: PatientTestimonial[] = [
  {
    id: 't-1',
    patientName: 'Helena G. Reeves',
    rating: 5,
    comment: 'The doctors and nurses at J & J Memorial took care of my mother when she had high fever and malaria. The facility is spotless, the lab results were fast, and everyone treated us with dignity.',
    department: 'Internal Medicine & OPD',
    date: 'October 29, 2026',
    verified: true,
    isPublicConsent: true,
  },
  {
    id: 't-2',
    patientName: 'Rev. Joseph M. Freeman',
    rating: 5,
    comment: 'I booked my consultation online through the portal. When I arrived, the triage nurse checked my pressure right away. No long line, no confusion. Truly modern healthcare in Monrovia!',
    department: 'Cardiology & Triage',
    date: 'October 24, 2026',
    verified: true,
    isPublicConsent: true,
  },
  {
    id: 't-3',
    patientName: 'Gbessay Sirleaf',
    rating: 5,
    comment: 'Having our baby at J & J Memorial was the best decision. The maternal care team and pediatricians were available day and night. The digital portal made viewing her vaccine records so easy.',
    department: 'Maternal & Child Health',
    date: 'October 15, 2026',
    verified: true,
    isPublicConsent: true,
  },
  {
    id: 't-4',
    patientName: 'Archibald M. Doe',
    rating: 4,
    comment: 'The pharmacy service is very organized. They scanned my digital prescription code and explained every dosage clearly. Blood bank had stock ready when my brother needed a transfusion.',
    department: 'Pharmacy & Blood Bank',
    date: 'October 08, 2026',
    verified: true,
    isPublicConsent: true,
  },
];

const INITIAL_DOWNLOADABLE_DOCS: DownloadableDocument[] = [
  {
    id: 'doc-1',
    title: 'New Patient Intake & Medical History Questionnaire',
    category: 'Patient Intake',
    description: 'Comprehensive demographic, allergy, family health history, and emergency contact registration form for first-time visitors.',
    pages: 3,
    updatedDate: 'October 2026',
    fileSize: '340 KB',
  },
  {
    id: 'doc-2',
    title: 'Authorization for Release of Medical Records & Imaging',
    category: 'Records & Privacy',
    description: 'Official HIPAA and Liberia MOH compliant release form to transfer health summaries, diagnostic scans, and lab reports.',
    pages: 2,
    updatedDate: 'September 2026',
    fileSize: '210 KB',
  },
  {
    id: 'doc-3',
    title: 'General Inpatient Admission & Surgical Consent',
    category: 'Clinical Consent',
    description: 'Informed legal authorization for surgical procedures, anesthesia, blood transfusion, and inpatient nursing care.',
    pages: 4,
    updatedDate: 'October 2026',
    fileSize: '450 KB',
  },
  {
    id: 'doc-4',
    title: 'Telehealth Video Consultation Patient Consent & Terms',
    category: 'Telehealth',
    description: 'Patient consent acknowledging electronic video consult limitations, privacy policies, and emergency care guidance.',
    pages: 2,
    updatedDate: 'October 2026',
    fileSize: '190 KB',
  },
  {
    id: 'doc-5',
    title: 'Hospital Financial Assistance & Payment Plan Application',
    category: 'Financial & Billing',
    description: 'Application for sliding-scale fee assistance, installment payment plans, or employer billing authorizations.',
    pages: 2,
    updatedDate: 'August 2026',
    fileSize: '280 KB',
  },
];

const INITIAL_NEWS: HospitalNewsItem[] = [
  {
    id: 'news-1',
    title: 'J & J Memorial Expands 24/7 Digital Blood Bank & Transfusion Services',
    summary: 'Our modern temperature-monitored cold storage and voluntary donor registry now ensures rapid matching for emergency maternal and surgical cases across Monrovia.',
    content: 'J & J Memorial Health Center has completed the commissioning of its advanced digital blood banking suite in partnership with the National Blood Safety Program. Featuring automated cold-chain monitoring, component separation for PRBC, platelets, and fresh frozen plasma, the facility aims to eliminate preventable maternal and surgical delays.',
    category: 'Hospital Update',
    author: 'Medical Director Office',
    date: 'November 01, 2026',
    readTime: '3 min read',
  },
  {
    id: 'news-2',
    title: 'Community Health Alert: Malaria Prevention and Early Fever Testing',
    summary: 'Clinical advice from our infectious disease team on recognizing falciparum symptoms early and utilizing our rapid diagnostic testing at all outreach branches.',
    content: 'With recent seasonal rainfall, our OPD has noted an uptick in febrile presentations. We remind all community members that malaria is curable when treated early. Our 24/7 emergency triage offers rapid testing and WHO-recommended artemisinin combination therapy with zero waiting time for severe cases.',
    category: 'Public Health',
    author: 'Dr. Emmanuel Tamba, MD',
    date: 'October 26, 2026',
    readTime: '4 min read',
  },
  {
    id: 'news-3',
    title: 'Free Maternal Health & Well-Baby Immunization Saturday Clinic',
    summary: 'Join our certified midwives and pediatric nurses for monthly developmental checkups, vitamin supplementation, and routine EPI immunizations.',
    content: 'Every first Saturday of the month, J & J Memorial opens its doors for free developmental screenings, prenatal counseling, and routine childhood immunizations according to the Ministry of Health schedule. Mothers are encouraged to bring their child health record cards.',
    category: 'Maternal Care',
    author: 'Nurse Sarah Kiatamba, RN',
    date: 'October 18, 2026',
    readTime: '2 min read',
  },
];

const INITIAL_FACILITIES: ClinicFacility[] = [
  {
    id: 'fac-1',
    name: 'J & J Memorial Main Medical Center (Congo Town)',
    county: 'Montserrado County',
    address: 'Tubman Boulevard, Oldest Congo Town, Monrovia',
    coordinates: { lat: 6.2731, lng: -10.7428 },
    phone: '+231 77 900 1122',
    emergencyHotline: '+231 88 091 1911 (24/7 Dispatch)',
    email: 'info@jjmemorial.totag.network',
    operatingHours: '24 Hours / 7 Days a Week (Full Services)',
    services: ['24/7 Emergency & Triage', 'Inpatient Wards & ICU', 'Digital Radiology (CT/X-Ray)', 'Full Lab & Blood Bank', 'Pharmacy', 'Surgical Suites'],
    isMainCampus: true,
  },
  {
    id: 'fac-2',
    name: 'J & J Memorial Sinkor Specialty Clinic',
    county: 'Montserrado County',
    address: '15th Street & Russell Avenue, Sinkor, Monrovia',
    coordinates: { lat: 6.2912, lng: -10.7781 },
    phone: '+231 77 900 3344',
    emergencyHotline: '+231 88 091 1912',
    email: 'sinkor@jjmemorial.totag.network',
    operatingHours: 'Mon - Sat: 07:30 AM - 08:00 PM',
    services: ['Outpatient Consultations', 'Cardiology & Ultrasound', 'Specialist Clinics', 'Laboratory Collection', 'Express Dispensary'],
    isMainCampus: false,
  },
  {
    id: 'fac-3',
    name: 'J & J Memorial Paynesville Family Care Center',
    county: 'Montserrado County',
    address: 'Duport Road Junction, Paynesville',
    coordinates: { lat: 6.2589, lng: -10.7095 },
    phone: '+231 77 900 5566',
    emergencyHotline: '+231 88 091 1913',
    email: 'paynesville@jjmemorial.totag.network',
    operatingHours: '24 Hours / 7 Days (Maternal & Urgent Care)',
    services: ['Maternal & Child Health', 'Pediatrics', '24/7 Urgent Care', 'Vaccination Center', 'Essential Pharmacy'],
    isMainCampus: false,
  },
  {
    id: 'fac-4',
    name: 'J & J Memorial Kakata Regional Clinic',
    county: 'Margibi County',
    address: 'Kakatar Main Highway, near C.H. Rennie Hospital Road',
    coordinates: { lat: 6.5312, lng: -10.3541 },
    phone: '+231 77 900 7788',
    emergencyHotline: '+231 88 091 1914',
    email: 'kakata@jjmemorial.totag.network',
    operatingHours: 'Mon - Sun: 08:00 AM - 06:00 PM',
    services: ['General Consultations', 'Malaria Diagnostics', 'Minor Procedures', 'Health Outreach', 'Pharmacy'],
    isMainCampus: false,
  },
];

const INITIAL_SIGNAGE_SLIDES: DigitalSignageSlide[] = [
  {
    id: 'sig-1',
    title: 'Active OPD Patient Calling Screen',
    type: 'Queue Calling',
    content: 'Now Calling Token #A-104 (Room 1) | Token #B-088 (Room 3) | Token #C-012 (Triage)',
    highlightText: 'Please proceed with your patient slip to the designated consulting room.',
    durationSeconds: 15,
    active: true,
    order: 1,
  },
  {
    id: 'sig-2',
    title: 'Hospital Health Tip: Hydration & Heat Safety',
    type: 'Health Tip',
    content: 'Drink clean, boiled or filtered water throughout the day. Dehydration increases risk of kidney stones and elevated blood pressure.',
    highlightText: 'Free clean drinking water dispensers are located in each waiting bay.',
    durationSeconds: 12,
    active: true,
    order: 2,
  },
  {
    id: 'sig-3',
    title: 'Doctors On Duty Today',
    type: 'Doctor on Duty',
    content: 'Dr. Emmanuel Tamba (Internal Med) | Dr. Fatumata Fofana (Emergency) | Dr. Moses Weah (Pediatrics)',
    highlightText: 'For urgent medical concerns, please alert the triage nurse immediately.',
    durationSeconds: 12,
    active: true,
    order: 3,
  },
  {
    id: 'sig-4',
    title: 'Digital Patient Portal Self-Service',
    type: 'Announcement',
    content: 'Access your lab results, doctor notes, and prescription history directly on your phone at jjmemorial.totag.network.',
    highlightText: 'Speak to the front desk staff for free account registration assistance.',
    durationSeconds: 10,
    active: true,
    order: 4,
  },
];

const INITIAL_ACTIVITY_FEED: ActivityFeedItem[] = [
  {
    id: 'act-1',
    timestamp: 'Just now',
    type: 'Triage',
    actor: 'Nurse Sarah Kiatamba, RN',
    description: 'Triaged Emmanuel Tarpeh with urgency RED (Severe Chest Pain, SPO2 91%)',
    patientMrn: 'JJM-2026-0164',
    urgency: 'critical',
  },
  {
    id: 'act-2',
    timestamp: '4 mins ago',
    type: 'Lab',
    actor: 'Sando Coleman, Lab Tech',
    description: 'Released Complete Blood Count (CBC) results for Korto Kollie',
    patientMrn: 'JJM-2026-0042',
    urgency: 'normal',
  },
  {
    id: 'act-3',
    timestamp: '12 mins ago',
    type: 'Pharmacy',
    actor: 'Pharm. Varney Sheriff, RPh',
    description: 'Dispensed 30 tablets of Amlodipine Besylate via QR Code Scan',
    patientMrn: 'JJM-2026-0089',
    urgency: 'normal',
  },
  {
    id: 'act-4',
    timestamp: '25 mins ago',
    type: 'Registration',
    actor: 'Front Desk Officer Marie',
    description: 'Registered new patient Musu Sirleaf with MRN JJM-2026-0115',
    patientMrn: 'JJM-2026-0115',
    urgency: 'normal',
  },
  {
    id: 'act-5',
    timestamp: '38 mins ago',
    type: 'Billing',
    actor: 'Beatrice Flomo, Cashier',
    description: 'Processed payment receipt $74.00 via MTN Mobile Money for Korto Kollie',
    patientMrn: 'JJM-2026-0042',
    urgency: 'normal',
  },
];

const INITIAL_INTERNAL_MESSAGES: InternalMessage[] = [
  {
    id: 'msg-1',
    senderId: 'stf-3',
    senderName: 'Nurse Sarah Kiatamba, RN',
    senderRole: 'nurse',
    channel: 'OPD Urgent',
    content: 'Emergency triage update: 25yo male with severe acute chest pain in Bay 1. Troponin requested STAT. Dr. Tamba notified.',
    timestamp: '19:22',
    isUrgent: true,
  },
  {
    id: 'msg-2',
    senderId: 'stf-1',
    senderName: 'Dr. Emmanuel Tamba, MD',
    senderRole: 'doctor',
    channel: 'OPD Urgent',
    content: 'Acknowledged. Administering aspirin and preparing for bedside echocardiogram. Please confirm lab sample received.',
    timestamp: '19:24',
    isUrgent: true,
  },
  {
    id: 'msg-3',
    senderId: 'stf-4',
    senderName: 'Pharm. Varney Sheriff, RPh',
    senderRole: 'pharmacist',
    channel: 'Pharmacy & Stock',
    content: 'Notice to nursing staff: Ceftriaxone sodium 1g vials currently below safety stock (16 units remaining). Reorder batch arriving tomorrow 10am.',
    timestamp: '17:15',
    isUrgent: false,
  },
  {
    id: 'msg-4',
    senderId: 'stf-admin',
    senderName: 'Dr. Nyenpan (Chief of Staff)',
    senderRole: 'executive',
    channel: 'General Clinical',
    content: 'Monthly clinical audit and mortality/morbidity review scheduled for Thursday at 08:00 in Conference Room B.',
    timestamp: '14:00',
    isUrgent: false,
  },
];

// Reactive Store Class
class HospitalDataStore {
  private patients: Patient[] = INITIAL_PATIENTS;
  private vitals: VitalRecord[] = INITIAL_VITALS;
  private triageQueue: TriageEntry[] = INITIAL_TRIAGE;
  private bloodBank: BloodInventoryItem[] = INITIAL_BLOOD_BANK;
  private medications: Medication[] = INITIAL_MEDICATIONS;
  private prescriptions: Prescription[] = INITIAL_PRESCRIPTIONS;
  private dispenserLog: DispenserLogEntry[] = INITIAL_DISPENSER_LOG;
  private radiologyScans: RadiologyScan[] = INITIAL_RADIOLOGY;
  private labOrders: LabTestOrder[] = INITIAL_LAB_ORDERS;
  private insuranceRecords: InsurancePolicyCheck[] = INITIAL_INSURANCE_RECORDS;
  private invoices: Invoice[] = INITIAL_INVOICES;
  private staffSchedules: StaffScheduleShift[] = INITIAL_SCHEDULES;
  private resourceBookings: ResourceBooking[] = INITIAL_RESOURCES;
  private testimonials: PatientTestimonial[] = INITIAL_TESTIMONIALS;
  private downloadableDocs: DownloadableDocument[] = INITIAL_DOWNLOADABLE_DOCS;
  private newsItems: HospitalNewsItem[] = INITIAL_NEWS;
  private facilities: ClinicFacility[] = INITIAL_FACILITIES;
  private signageSlides: DigitalSignageSlide[] = INITIAL_SIGNAGE_SLIDES;
  private activityFeed: ActivityFeedItem[] = INITIAL_ACTIVITY_FEED;
  private internalMessages: InternalMessage[] = INITIAL_INTERNAL_MESSAGES;
  private digitalConsents: DigitalConsentForm[] = [];
  private uploadedDocs: PatientUploadedDoc[] = [
    {
      id: 'up-1',
      patientId: 'pat-1',
      title: 'Liberian Ministry of Health Yellow Fever Vaccination Card',
      category: 'Vaccination Card',
      fileName: 'yellow_fever_certificate_korto.pdf',
      fileSize: '1.2 MB',
      uploadDate: '2026-09-12',
      sharedWithClinicians: true,
    },
    {
      id: 'up-2',
      patientId: 'pat-1',
      title: 'Previous Electrocardiogram (ECG) Report - JFK Medical Center',
      category: 'Outside Lab Report',
      fileName: 'ecg_record_2025.pdf',
      fileSize: '840 KB',
      uploadDate: '2026-08-20',
      sharedWithClinicians: true,
    },
  ];
  private chatMessages: PatientChatMessage[] = [
    {
      id: 'chat-1',
      patientId: 'pat-1',
      sender: 'system',
      senderName: 'J & J Memorial Care Assistant',
      text: 'Welcome to J & J Memorial Secure Live Chat. A registered nurse or care coordinator is on duty to assist you.',
      timestamp: '19:00',
    },
    {
      id: 'chat-2',
      patientId: 'pat-1',
      sender: 'patient',
      senderName: 'Korto Kollie',
      text: 'Good evening. I wanted to verify if my lab test results from this afternoon are ready to view in my portal?',
      timestamp: '19:02',
    },
    {
      id: 'chat-3',
      patientId: 'pat-1',
      sender: 'staff',
      senderName: 'Nurse Sarah Kiatamba, RN',
      text: 'Hello Korto! Yes, Dr. Tamba just signed off on your Complete Blood Count. Everything looks normal! You can review the details directly in your Medical History tab.',
      timestamp: '19:05',
    },
  ];

  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem('jj_hospital_db_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.patients) this.patients = parsed.patients;
        if (parsed.vitals) this.vitals = parsed.vitals;
        if (parsed.triageQueue) this.triageQueue = parsed.triageQueue;
        if (parsed.bloodBank) this.bloodBank = parsed.bloodBank;
        if (parsed.medications) this.medications = parsed.medications;
        if (parsed.prescriptions) this.prescriptions = parsed.prescriptions;
        if (parsed.dispenserLog) this.dispenserLog = parsed.dispenserLog;
        if (parsed.radiologyScans) this.radiologyScans = parsed.radiologyScans;
        if (parsed.labOrders) this.labOrders = parsed.labOrders;
        if (parsed.invoices) this.invoices = parsed.invoices;
        if (parsed.staffSchedules) this.staffSchedules = parsed.staffSchedules;
        if (parsed.resourceBookings) this.resourceBookings = parsed.resourceBookings;
        if (parsed.testimonials) this.testimonials = parsed.testimonials;
        if (parsed.digitalConsents) this.digitalConsents = parsed.digitalConsents;
        if (parsed.uploadedDocs) this.uploadedDocs = parsed.uploadedDocs;
        if (parsed.internalMessages) this.internalMessages = parsed.internalMessages;
        if (parsed.chatMessages) this.chatMessages = parsed.chatMessages;
      }
    } catch (e) {
      console.warn('Using fresh database state:', e);
    }
  }

  private persist() {
    try {
      localStorage.setItem(
        'jj_hospital_db_state',
        JSON.stringify({
          patients: this.patients,
          vitals: this.vitals,
          triageQueue: this.triageQueue,
          bloodBank: this.bloodBank,
          medications: this.medications,
          prescriptions: this.prescriptions,
          dispenserLog: this.dispenserLog,
          radiologyScans: this.radiologyScans,
          labOrders: this.labOrders,
          invoices: this.invoices,
          staffSchedules: this.staffSchedules,
          resourceBookings: this.resourceBookings,
          testimonials: this.testimonials,
          digitalConsents: this.digitalConsents,
          uploadedDocs: this.uploadedDocs,
          internalMessages: this.internalMessages,
          chatMessages: this.chatMessages,
        })
      );
    } catch (e) {
      console.error('Failed to persist hospital store:', e);
    }
    this.listeners.forEach((fn) => fn());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // --- Getters ---
  public getPatients() { return [...this.patients]; }
  public getVitals(patientId?: string) {
    if (!patientId) return [...this.vitals];
    return this.vitals.filter((v) => v.patientId === patientId);
  }
  public getTriageQueue() { return [...this.triageQueue]; }
  public getBloodBank() { return [...this.bloodBank]; }
  public getMedications() { return [...this.medications]; }
  public getPrescriptions() { return [...this.prescriptions]; }
  public getDispenserLog() { return [...this.dispenserLog]; }
  public getRadiologyScans() { return [...this.radiologyScans]; }
  public getLabOrders() { return [...this.labOrders]; }
  public getInsuranceRecords() { return [...this.insuranceRecords]; }
  public getInvoices() { return [...this.invoices]; }
  public getStaffSchedules() { return [...this.staffSchedules]; }
  public getResourceBookings() { return [...this.resourceBookings]; }
  public getTestimonials() { return [...this.testimonials]; }
  public getDownloadableDocs() { return [...this.downloadableDocs]; }
  public getNewsItems() { return [...this.newsItems]; }
  public getFacilities() { return [...this.facilities]; }
  public getSignageSlides() { return [...this.signageSlides]; }
  public getActivityFeed() { return [...this.activityFeed]; }
  public getInternalMessages() { return [...this.internalMessages]; }
  public getDigitalConsents(patientId?: string) {
    if (!patientId) return [...this.digitalConsents];
    return this.digitalConsents.filter((c) => c.patientId === patientId);
  }
  public getUploadedDocs(patientId?: string) {
    if (!patientId) return [...this.uploadedDocs];
    return this.uploadedDocs.filter((d) => d.patientId === patientId);
  }
  public getChatMessages(patientId: string) {
    return this.chatMessages.filter((m) => m.patientId === patientId);
  }

  // --- Actions ---

  // Vitals Logging
  public async addVitalRecord(vital: Omit<VitalRecord, 'id'>): Promise<VitalRecord> {
    return apiPerformanceService.monitor('/api/v1/patient/vitals', 'POST', async () => {
      const newRecord: VitalRecord = {
        ...vital,
        id: `vit-${Date.now()}`,
      };
      this.vitals.push(newRecord);
      this.persist();

      // Offline sync queue
      offlineSyncService.enqueue('vital', 'create', newRecord);

      this.addActivity({
        type: 'Triage',
        actor: 'Patient / Nurse',
        description: `Logged vitals BP ${newRecord.systolic}/${newRecord.diastolic}, Pulse ${newRecord.heartRate} bpm`,
      });

      return newRecord;
    });
  }

  // Triage Input
  public async addTriageEntry(entry: Omit<TriageEntry, 'id' | 'status'>): Promise<TriageEntry> {
    return apiPerformanceService.monitor('/api/v1/triage/queue', 'POST', async () => {
      const newEntry: TriageEntry = {
        ...entry,
        id: `tri-${Date.now()}`,
        status: 'Waiting',
      };
      this.triageQueue.unshift(newEntry);
      this.persist();

      offlineSyncService.enqueue('triage', 'create', newEntry);

      this.addActivity({
        type: 'Triage',
        actor: newEntry.triageNurse,
        description: `Triaged ${newEntry.patientName} (${newEntry.mrn}) as [${newEntry.urgency}] priority`,
        patientMrn: newEntry.mrn,
        urgency: newEntry.urgency === 'Red' ? 'critical' : newEntry.urgency === 'Yellow' ? 'urgent' : 'normal',
      });

      if (newEntry.urgency === 'Red') {
        notificationService.sendNotification(
          'EMERGENCY RED TRIAGE ALERT',
          `${newEntry.patientName} (${newEntry.mrn}) arrived with: ${newEntry.chiefComplaint}`,
          true
        );
      }

      return newEntry;
    });
  }

  // Blood Bank Unit Management
  public async addBloodUnit(unit: Omit<BloodInventoryItem, 'id'>): Promise<BloodInventoryItem> {
    return apiPerformanceService.monitor('/api/v1/blood-bank/units', 'POST', async () => {
      const newUnit: BloodInventoryItem = {
        ...unit,
        id: `bb-${Date.now()}`,
      };
      this.bloodBank.unshift(newUnit);
      this.persist();
      return newUnit;
    });
  }

  public async updateBloodUnitStatus(id: string, status: BloodInventoryItem['status']) {
    return apiPerformanceService.monitor(`/api/v1/blood-bank/units/${id}`, 'PATCH', async () => {
      this.bloodBank = this.bloodBank.map((u) => (u.id === id ? { ...u, status } : u));
      this.persist();
    });
  }

  // Pharmacy & Prescriptions
  public async dispensePrescription(prescriptionCode: string, pharmacistName: string): Promise<boolean> {
    return apiPerformanceService.monitor('/api/v1/pharmacy/dispense', 'POST', async () => {
      const prescription = this.prescriptions.find((p) => p.prescriptionCode === prescriptionCode);
      if (!prescription) return false;

      prescription.status = 'Dispensed';
      prescription.dispensedBy = pharmacistName;
      prescription.dispensedAt = new Date().toISOString();

      // Log in dispenser log & decrement stock
      prescription.items.forEach((item) => {
        const med = this.medications.find((m) => m.id === item.medicationId);
        if (med) {
          med.stockQuantity = Math.max(0, med.stockQuantity - item.quantity);
        }

        this.dispenserLog.unshift({
          id: `disp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          prescriptionCode,
          patientName: prescription.patientName,
          mrn: prescription.mrn,
          medicationName: item.medicationName,
          quantityDispensed: item.quantity,
          batchNumber: med ? med.batchNumber : 'UNKNOWN-BATCH',
          pharmacistName,
          timestamp: new Date().toLocaleString(),
        });
      });

      this.persist();
      offlineSyncService.enqueue('prescription', 'update', { prescriptionCode, status: 'Dispensed' });

      this.addActivity({
        type: 'Pharmacy',
        actor: pharmacistName,
        description: `Dispensed verified prescription ${prescriptionCode} for ${prescription.patientName}`,
        patientMrn: prescription.mrn,
      });

      return true;
    });
  }

  // Lab Results Entry
  public async submitLabResult(
    orderId: string,
    results: LabTestOrder['results'],
    technicianName: string,
    technicianNotes: string
  ): Promise<boolean> {
    return apiPerformanceService.monitor(`/api/v1/lab/orders/${orderId}/result`, 'POST', async () => {
      const order = this.labOrders.find((o) => o.id === orderId);
      if (!order) return false;

      order.status = 'Completed';
      order.results = results;
      order.technicianName = technicianName;
      order.technicianNotes = technicianNotes;
      order.completedAt = new Date().toLocaleString();

      this.persist();
      offlineSyncService.enqueue('lab_result', 'update', order);

      const hasCritical = results?.some((r) => r.isCritical);
      this.addActivity({
        type: 'Lab',
        actor: technicianName,
        description: `Uploaded and released ${order.testName} for ${order.patientName}${hasCritical ? ' [CRITICAL VALUE]' : ''}`,
        patientMrn: order.mrn,
        urgency: hasCritical ? 'critical' : 'normal',
      });

      notificationService.sendNotification(
        hasCritical ? 'CRITICAL LAB ALERT' : 'Laboratory Results Released',
        `${order.testName} for ${order.patientName} (${order.mrn}) has been updated.`,
        hasCritical
      );

      return true;
    });
  }

  // Radiology Upload
  public async uploadRadiologyScan(scan: Omit<RadiologyScan, 'id'>): Promise<RadiologyScan> {
    return apiPerformanceService.monitor('/api/v1/radiology/scans', 'POST', async () => {
      const newScan: RadiologyScan = {
        ...scan,
        id: `rad-${Date.now()}`,
      };
      this.radiologyScans.unshift(newScan);
      this.persist();

      this.addActivity({
        type: 'Radiology',
        actor: scan.orderedBy,
        description: `Attached ${scan.modality} imaging scan for ${scan.patientName} (${scan.bodyPart})`,
        patientMrn: scan.mrn,
      });

      return newScan;
    });
  }

  // Digital Consent Signing
  public async submitDigitalConsent(consent: Omit<DigitalConsentForm, 'id'>): Promise<DigitalConsentForm> {
    return apiPerformanceService.monitor('/api/v1/patient/consents', 'POST', async () => {
      const newConsent: DigitalConsentForm = {
        ...consent,
        id: `con-${Date.now()}`,
      };
      this.digitalConsents.unshift(newConsent);
      this.persist();

      offlineSyncService.enqueue('consent', 'create', newConsent);

      this.addActivity({
        type: 'Registration',
        actor: consent.signedName,
        description: `Electronically signed [${consent.formType}] (Hash: ${consent.documentHash.substring(0, 10)}...)`,
        patientMrn: consent.mrn,
      });

      return newConsent;
    });
  }

  // Patient Feedback & Review
  public async submitFeedback(feedback: {
    patientName: string;
    rating: number;
    comment: string;
    department: string;
    isPublicConsent: boolean;
  }): Promise<PatientTestimonial> {
    return apiPerformanceService.monitor('/api/v1/patient/feedback', 'POST', async () => {
      const newTestimonial: PatientTestimonial = {
        id: `t-${Date.now()}`,
        patientName: feedback.patientName,
        rating: feedback.rating,
        comment: feedback.comment,
        department: feedback.department,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        verified: true,
        isPublicConsent: feedback.isPublicConsent,
      };

      if (feedback.isPublicConsent) {
        this.testimonials.unshift(newTestimonial);
      }
      this.persist();

      offlineSyncService.enqueue('feedback', 'create', newTestimonial);

      return newTestimonial;
    });
  }

  // Resource Booking with Conflict Detection
  public async bookResource(booking: Omit<ResourceBooking, 'id' | 'status'>): Promise<{ success: boolean; message: string }> {
    return apiPerformanceService.monitor('/api/v1/resources/book', 'POST', async () => {
      // Conflict check
      const hasConflict = this.resourceBookings.some((b) => {
        if (b.resourceId !== booking.resourceId) return false;
        if (b.status === 'Cancelled') return false;
        const bStart = new Date(b.startTime).getTime();
        const bEnd = new Date(b.endTime).getTime();
        const reqStart = new Date(booking.startTime).getTime();
        const reqEnd = new Date(booking.endTime).getTime();
        return Math.max(bStart, reqStart) < Math.min(bEnd, reqEnd);
      });

      if (hasConflict) {
        return {
          success: false,
          message: `Scheduling Conflict: ${booking.resourceName} is already booked during this time window. Please select an alternate slot.`,
        };
      }

      const newBooking: ResourceBooking = {
        ...booking,
        id: `res-${Date.now()}`,
        status: 'Confirmed',
      };
      this.resourceBookings.unshift(newBooking);
      this.persist();

      return {
        success: true,
        message: `Successfully booked ${booking.resourceName} for ${booking.patientName}.`,
      };
    });
  }

  // Staff Scheduling with Shift Conflict Detection
  public async addStaffShift(shift: Omit<StaffScheduleShift, 'id'>): Promise<{ success: boolean; message: string }> {
    return apiPerformanceService.monitor('/api/v1/staff/schedules', 'POST', async () => {
      const conflict = this.staffSchedules.some(
        (s) => s.staffId === shift.staffId && s.date === shift.date && s.shiftType === shift.shiftType
      );

      if (conflict) {
        return {
          success: false,
          message: `Automated Conflict Alert: ${shift.staffName} is already scheduled for ${shift.shiftType} on ${shift.date}.`,
        };
      }

      const newShift: StaffScheduleShift = {
        ...shift,
        id: `shift-${Date.now()}`,
      };
      this.staffSchedules.unshift(newShift);
      this.persist();

      return {
        success: true,
        message: `Shift assigned to ${shift.staffName} for ${shift.shiftType}.`,
      };
    });
  }

  // Internal Messaging
  public async sendInternalMessage(msg: Omit<InternalMessage, 'id' | 'timestamp'>): Promise<InternalMessage> {
    const newMsg: InternalMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    this.internalMessages.push(newMsg);
    this.persist();

    notificationService.sendNotification(
      newMsg.isUrgent ? `URGENT [${newMsg.channel}]` : `New Message from ${newMsg.senderName}`,
      newMsg.content,
      newMsg.isUrgent
    );

    return newMsg;
  }

  // Live Chat
  public async sendChatMessage(patientId: string, sender: 'patient' | 'staff', senderName: string, text: string) {
    const msg: PatientChatMessage = {
      id: `chat-${Date.now()}`,
      patientId,
      sender,
      senderName,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    this.chatMessages.push(msg);
    this.persist();

    // Auto-reply simulated staff response if patient wrote
    if (sender === 'patient') {
      setTimeout(() => {
        this.chatMessages.push({
          id: `chat-${Date.now() + 1}`,
          patientId,
          sender: 'staff',
          senderName: 'Nurse Sarah Kiatamba, RN',
          text: `Thank you for your message, ${senderName}. An on-duty clinician has reviewed your note and will assist you shortly.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        this.persist();
      }, 1500);
    }
  }

  // Document Upload
  public async uploadPatientDoc(doc: Omit<PatientUploadedDoc, 'id' | 'uploadDate'>): Promise<PatientUploadedDoc> {
    const newDoc: PatientUploadedDoc = {
      ...doc,
      id: `up-${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0],
    };
    this.uploadedDocs.unshift(newDoc);
    this.persist();
    return newDoc;
  }

  // Activity Feed
  public addActivity(item: Omit<ActivityFeedItem, 'id' | 'timestamp'>) {
    this.activityFeed.unshift({
      ...item,
      id: `act-${Date.now()}`,
      timestamp: 'Just now',
    });
    if (this.activityFeed.length > 30) {
      this.activityFeed.pop();
    }
    this.persist();
  }
}

export const dbStore = new HospitalDataStore();
