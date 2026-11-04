import { PatientNotification, StaffChannel, StaffMessage } from '../types/communication';
import { BloodUnit, BloodDonor, BloodTransfusionRequest } from '../types/bloodBank';
import { DigitalConsentForm } from '../types/digitalConsent';
import { PatientFeedback } from '../types/feedback';
import { PatientVitalsLogEntry } from '../types/patientVitalsLog';
import { SpecializedEquipmentResource, ResourceReservation } from '../types/resourceEquipment';
import { InsurancePolicyRecord } from '../types/insuranceVerification';

export const INITIAL_PATIENT_NOTIFICATIONS: PatientNotification[] = [
  {
    id: 'NOTIF-001',
    patientId: 'PAT-001',
    patientMrn: 'JJM-2026-00104',
    type: 'APPOINTMENT_REMINDER',
    title: 'Upcoming Clinic Appointment Tomorrow',
    message: 'Your follow-up consultation with Dr. Evelyn Sirleaf-Gbotoe is scheduled for tomorrow at 09:00 AM in Outpatient Room 2.',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    isRead: false,
    urgency: 'HIGH',
    targetTab: 'appointments',
    relatedEntityId: 'APT-001',
    actionLabel: 'View Appointment Details'
  },
  {
    id: 'NOTIF-002',
    patientId: 'PAT-001',
    patientMrn: 'JJM-2026-00104',
    type: 'LAB_RESULT_AVAILABLE',
    title: 'Laboratory Diagnostic Report Released',
    message: 'Blood Film for Malaria Parasites (Giemsa stain) has been signed by Chief Lab Scientist Anthony Barclay. Negative parasitemia clearance confirmed.',
    timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    isRead: false,
    urgency: 'NORMAL',
    targetTab: 'labs',
    relatedEntityId: 'LAB-2026-00389',
    actionLabel: 'Review Lab Results'
  },
  {
    id: 'NOTIF-003',
    patientId: 'PAT-001',
    patientMrn: 'JJM-2026-00104',
    type: 'PRESCRIPTION_UPDATE',
    title: 'Prescription Verified & Ready for Pickup',
    message: 'Coartem (Artemether 80mg / Lumefantrine 480mg) is verified and prepared by Pharmacist Sarah Tubman at Dispensary Counter 2.',
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    isRead: true,
    urgency: 'NORMAL',
    targetTab: 'prescriptions',
    relatedEntityId: 'RX-2026-00441',
    actionLabel: 'Check Prescription & Barcode'
  },
  {
    id: 'NOTIF-004',
    patientId: 'PAT-001',
    patientMrn: 'JJM-2026-00104',
    type: 'BILLING',
    title: 'Payment Receipt Issued (RCT-2026-00084)',
    message: 'Official receipt for $15.00 USD has been finalized. Insured via Activa International Health (85% coverage applied).',
    timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    isRead: true,
    urgency: 'NORMAL',
    targetTab: 'billing',
    relatedEntityId: 'INV-2026-00129',
    actionLabel: 'View Itemized Receipt'
  },
  {
    id: 'NOTIF-005',
    patientId: 'PAT-002',
    patientMrn: 'JJM-2026-00105',
    type: 'APPOINTMENT_REMINDER',
    title: 'Cardiology Follow-Up Scheduled',
    message: 'Dr. J. Saydee Kollie has scheduled your blood pressure and glycemic stability evaluation for tomorrow at 11:30 AM.',
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    isRead: false,
    urgency: 'HIGH',
    targetTab: 'appointments',
    relatedEntityId: 'APT-002',
    actionLabel: 'View Schedule'
  }
];

export const INITIAL_STAFF_CHANNELS: StaffChannel[] = [
  {
    id: 'dept-emergency',
    name: '#emergency-trauma',
    department: 'Emergency & Trauma Bay',
    description: 'STAT acute admissions, ambulance dispatch, trauma resuscitations, and red-acuity alerts',
    iconName: 'AlertTriangle',
    isStatBay: true
  },
  {
    id: 'dept-opd',
    name: '#opd-triage',
    department: 'Outpatient Clinic & Triage',
    description: 'Patient queue management, clinician consultation rooms, and routine vitals screening',
    iconName: 'Stethoscope'
  },
  {
    id: 'dept-maternity',
    name: '#maternity-nicu',
    department: 'Maternal, Labor & Child Health',
    description: 'Labor and delivery suites, fetal telemetry, post-natal recovery, and neonatal nursery',
    iconName: 'Baby'
  },
  {
    id: 'dept-lab',
    name: '#laboratory-pathology',
    department: 'Diagnostic Laboratory & LIS',
    description: 'Specimen intake, critical panic value reporting, culture sensitivities, and blood typing',
    iconName: 'Microscope'
  },
  {
    id: 'dept-blood-bank',
    name: '#blood-bank-unit',
    department: 'Blood Bank & Transfusion Medicine',
    description: 'Whole blood units, cold-chain monitoring, crossmatch requests, and emergency O-Neg inventory',
    iconName: 'Droplet'
  },
  {
    id: 'dept-pharmacy',
    name: '#pharmacy-dispensary',
    department: 'Central Pharmacy & Formulary',
    description: 'Medication dispense checks, stock balance notifications, and controlled drug verification',
    iconName: 'Pill'
  },
  {
    id: 'dept-admin',
    name: '#admin-operations',
    department: 'Hospital Administration & Finance',
    description: 'Facility announcements, power grid telemetry, payroll updates, and audit compliance',
    iconName: 'Building2'
  }
];

export const INITIAL_STAFF_MESSAGES: StaffMessage[] = [
  {
    id: 'SMSG-001',
    channelId: 'dept-emergency',
    channelType: 'DEPARTMENT',
    senderId: 'USR-002',
    senderName: 'Dr. Evelyn Sirleaf-Gbotoe, MD',
    senderRole: 'Attending Physician',
    senderDepartment: 'Emergency & Acute Care',
    content: 'Trauma alert: 34-year-old male motor vehicle accident coming from VOA junction with deep forearm laceration. ETA 8 minutes. Sister Comfort, please prep Bay 1 and have IV Ringers ready.',
    urgency: 'STAT',
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    readBy: ['USR-001', 'USR-003', 'USR-004']
  },
  {
    id: 'SMSG-002',
    channelId: 'dept-emergency',
    channelType: 'DEPARTMENT',
    senderId: 'USR-003',
    senderName: 'Sister Comfort Weah, RN',
    senderRole: 'Head Nurse',
    senderDepartment: 'Nursing & Inpatient Care',
    content: 'Bay 1 is fully prepped. Suture kit, sterile gauze, suction, and 2L Ringers Lactate standing by. Nurse Flomo is at the intake gate.',
    urgency: 'ROUTINE',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    readBy: ['USR-001', 'USR-002', 'USR-004']
  },
  {
    id: 'SMSG-003',
    channelId: 'dept-lab',
    channelType: 'DEPARTMENT',
    senderId: 'USR-005',
    senderName: 'Anthony Barclay, MSc, MLS',
    senderRole: 'Chief Lab Scientist',
    senderDepartment: 'Laboratory Medicine',
    content: 'PANIC LAB VALUE: Patient Joseph Kromah (JJM-2026-00105) serum potassium is 5.8 mEq/L (Critical High). Attending physician please review immediately.',
    urgency: 'STAT',
    patientMrnContext: 'JJM-2026-00105',
    patientNameContext: 'Joseph Kromah',
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    readBy: ['USR-001', 'USR-002']
  },
  {
    id: 'SMSG-004',
    channelId: 'dept-lab',
    channelType: 'DEPARTMENT',
    senderId: 'USR-001',
    senderName: 'Dr. J. Saydee Kollie, MD',
    senderRole: 'Medical Director',
    senderDepartment: 'Internal Medicine',
    content: 'Received Anthony. We have paused oral potassium-sparing diuretics and initiated IV dextrose-insulin protocol in Male Medical Ward Bed 2.',
    urgency: 'ROUTINE',
    patientMrnContext: 'JJM-2026-00105',
    patientNameContext: 'Joseph Kromah',
    timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    readBy: ['USR-005']
  },
  {
    id: 'SMSG-005',
    channelId: 'dept-blood-bank',
    channelType: 'DEPARTMENT',
    senderId: 'USR-005',
    senderName: 'Anthony Barclay, MSc, MLS',
    senderRole: 'Chief Lab Scientist',
    senderDepartment: 'Blood Bank',
    content: 'Supply Warning: O-Negative Whole Blood is down to 2 units. Scheduled a targeted community donor drive with the Montserrado Red Cross for Friday morning.',
    urgency: 'URGENT',
    timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    readBy: ['USR-001', 'USR-003']
  },
  {
    id: 'SMSG-006',
    channelId: 'dept-opd',
    channelType: 'DEPARTMENT',
    senderId: 'USR-004',
    senderName: 'Samuel Flomo, RN',
    senderRole: 'Triage Nurse',
    senderDepartment: 'Triage & Acute Assessment',
    content: 'Morning queue has 16 patients checked in. 4 presenting with high febrile symptoms. Blessing Kpadeh (JJM-2026-00104) is ready in Room 2.',
    urgency: 'ROUTINE',
    patientMrnContext: 'JJM-2026-00104',
    patientNameContext: 'Blessing Kpadeh',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    readBy: ['USR-002']
  },
  // Direct Messages (1-on-1) between Dr. Kollie and Sister Comfort Weah
  {
    id: 'SMSG-007',
    channelId: 'dm-USR-001-USR-003',
    channelType: 'DIRECT',
    senderId: 'USR-001',
    senderName: 'Dr. J. Saydee Kollie, MD',
    senderRole: 'Medical Director',
    senderDepartment: 'Internal Medicine',
    recipientId: 'USR-003',
    recipientName: 'Sister Comfort Weah, RN',
    content: 'Sister Comfort, please check the Male Medical Ward bed occupancy before the 2 PM clinical handover. We may need to transfer Bed 4 to step-down.',
    urgency: 'ROUTINE',
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    readBy: ['USR-003']
  },
  {
    id: 'SMSG-008',
    channelId: 'dm-USR-001-USR-003',
    channelType: 'DIRECT',
    senderId: 'USR-003',
    senderName: 'Sister Comfort Weah, RN',
    senderRole: 'Head Nurse',
    senderDepartment: 'Nursing',
    recipientId: 'USR-001',
    recipientName: 'Dr. J. Saydee Kollie, MD',
    content: 'Understood Dr. Kollie. Bed 4 patient has normal vital signs and tolerating oral diet well. Chart is ready for your discharge sign-off.',
    urgency: 'ROUTINE',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    readBy: ['USR-001']
  }
];

export const INITIAL_BLOOD_UNITS: BloodUnit[] = [
  {
    id: 'BLD-001',
    unitNumber: 'BLD-2026-00412',
    bloodGroup: 'O+',
    component: 'PACKED_RBC',
    volumeMl: 350,
    collectedDate: '2026-10-20',
    expiryDate: '2026-11-24',
    status: 'AVAILABLE',
    storageLocation: 'Blood Refrigerator 1 · Shelf A (4°C)',
    donorId: 'DNR-001',
    donorName: 'Varney Johnson',
    testedNegative: ['HIV 1/2 (EIA)', 'HBsAg (Hepatitis B)', 'HCV (Hepatitis C)', 'VDRL (Syphilis)']
  },
  {
    id: 'BLD-002',
    unitNumber: 'BLD-2026-00413',
    bloodGroup: 'O-',
    component: 'WHOLE_BLOOD',
    volumeMl: 450,
    collectedDate: '2026-10-25',
    expiryDate: '2026-11-29',
    status: 'AVAILABLE',
    storageLocation: 'Emergency Stat Reserve · Shelf E (4°C)',
    donorId: 'DNR-002',
    donorName: 'Patricia Cooper',
    testedNegative: ['HIV 1/2 (EIA)', 'HBsAg (Hepatitis B)', 'HCV (Hepatitis C)', 'VDRL (Syphilis)']
  },
  {
    id: 'BLD-003',
    unitNumber: 'BLD-2026-00414',
    bloodGroup: 'A+',
    component: 'PACKED_RBC',
    volumeMl: 320,
    collectedDate: '2026-10-18',
    expiryDate: '2026-11-22',
    status: 'AVAILABLE',
    storageLocation: 'Blood Refrigerator 1 · Shelf B (4°C)',
    donorId: 'DNR-003',
    donorName: 'Jeremiah Toe',
    testedNegative: ['HIV 1/2 (EIA)', 'HBsAg (Hepatitis B)', 'HCV (Hepatitis C)', 'VDRL (Syphilis)']
  },
  {
    id: 'BLD-004',
    unitNumber: 'BLD-2026-00415',
    bloodGroup: 'B+',
    component: 'FRESH_FROZEN_PLASMA',
    volumeMl: 250,
    collectedDate: '2026-10-10',
    expiryDate: '2027-04-10',
    status: 'AVAILABLE',
    storageLocation: 'Deep Plasma Freezer -30°C · Rack 1',
    donorId: 'DNR-004',
    donorName: 'Musu Sirleaf',
    testedNegative: ['HIV 1/2 (EIA)', 'HBsAg (Hepatitis B)', 'HCV (Hepatitis C)', 'VDRL (Syphilis)']
  },
  {
    id: 'BLD-005',
    unitNumber: 'BLD-2026-00416',
    bloodGroup: 'AB+',
    component: 'PACKED_RBC',
    volumeMl: 340,
    collectedDate: '2026-10-28',
    expiryDate: '2026-12-02',
    status: 'AVAILABLE',
    storageLocation: 'Blood Refrigerator 1 · Shelf C (4°C)',
    donorId: 'DNR-005',
    donorName: 'Gabriel Freeman',
    testedNegative: ['HIV 1/2 (EIA)', 'HBsAg (Hepatitis B)', 'HCV (Hepatitis C)', 'VDRL (Syphilis)']
  },
  {
    id: 'BLD-006',
    unitNumber: 'BLD-2026-00417',
    bloodGroup: 'O+',
    component: 'WHOLE_BLOOD',
    volumeMl: 450,
    collectedDate: '2026-10-22',
    expiryDate: '2026-11-26',
    status: 'RESERVED',
    storageLocation: 'Crossmatch Holding · Shelf D (4°C)',
    donorId: 'DNR-001',
    donorName: 'Varney Johnson',
    testedNegative: ['HIV 1/2 (EIA)', 'HBsAg (Hepatitis B)', 'HCV (Hepatitis C)', 'VDRL (Syphilis)'],
    reservedForPatientId: 'PAT-002',
    reservedForPatientMrn: 'JJM-2026-00105',
    reservedForPatientName: 'Joseph Kromah',
    crossmatchStatus: 'COMPATIBLE'
  }
];

export const INITIAL_BLOOD_DONORS: BloodDonor[] = [
  {
    id: 'DNR-001',
    fullName: 'Varney Johnson',
    age: 28,
    gender: 'M',
    phone: '+231-776-490-112',
    address: 'VOA East Community, Monrovia',
    bloodGroup: 'O+',
    lastDonationDate: '2026-10-20',
    eligibilityStatus: 'ELIGIBLE',
    totalDonations: 4,
    hemoglobinGdl: 14.8
  },
  {
    id: 'DNR-002',
    fullName: 'Patricia Cooper',
    age: 32,
    gender: 'F',
    phone: '+231-886-312-990',
    address: 'Sinkor Old Road, Monrovia',
    bloodGroup: 'O-',
    lastDonationDate: '2026-10-25',
    eligibilityStatus: 'ELIGIBLE',
    totalDonations: 6,
    hemoglobinGdl: 13.2
  },
  {
    id: 'DNR-003',
    fullName: 'Jeremiah Toe',
    age: 24,
    gender: 'M',
    phone: '+231-770-884-219',
    address: 'Paynesville ELWA Junction',
    bloodGroup: 'A+',
    lastDonationDate: '2026-10-18',
    eligibilityStatus: 'ELIGIBLE',
    totalDonations: 2,
    hemoglobinGdl: 15.1
  }
];

export const INITIAL_BLOOD_REQUESTS: BloodTransfusionRequest[] = [
  {
    id: 'BT-REQ-001',
    patientId: 'PAT-002',
    patientMrn: 'JJM-2026-00105',
    patientName: 'Joseph Kromah',
    clinicalIndication: 'Severe anemia secondary to chronic disease & GI bleeding risk (Hb 6.4 g/dL)',
    urgency: 'URGENT_2HR',
    unitsRequested: 1,
    bloodGroup: 'O+',
    component: 'WHOLE_BLOOD',
    orderingDoctor: 'Dr. J. Saydee Kollie',
    ward: 'Male Medical Ward Bed 02',
    status: 'CROSSMATCHED',
    requestedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
  }
];

export const INITIAL_DIGITAL_CONSENTS: DigitalConsentForm[] = [
  {
    id: 'CONS-001',
    patientId: 'PAT-001',
    patientMrn: 'JJM-2026-00104',
    patientName: 'Blessing Kpadeh',
    formType: 'GENERAL_ADMISSION',
    title: 'General Inpatient & Outpatient Admission Consent',
    version: 'v2.4',
    summary: 'Consent for routine medical examination, vital signs, diagnostic laboratory tests, and prescribed pharmaceutical administration under Liberian Ministry of Health guidelines.',
    termsAndConditions: [
      'I authorize the physicians, nurses, and certified healthcare staff of J & J Memorial e-Hospital to conduct all necessary clinical evaluations, examinations, and diagnostic investigations.',
      'I understand the nature of diagnostic procedures and standard medical treatments will be explained to me prior to execution.',
      'I consent to the secure storage of my electronic health records in the hospital EMR system in compliance with patient confidentiality protocols.',
      'I accept responsibility for hospital fees covered by my registered insurance or personal co-pay agreement.'
    ],
    signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50"><text x="10" y="35" font-family="cursive" font-size="24" fill="%230f766e">Blessing Kpadeh</text></svg>',
    signatureType: 'DIGITAL_DRAW',
    signedBy: 'Blessing Kpadeh',
    signerRelationship: 'SELF',
    signerNationalId: 'NIR-LR-8890214-B',
    signedAt: '2026-11-01T09:15:00Z',
    witnessName: 'Nurse Samuel Flomo, RN',
    witnessRole: 'Triage Nurse',
    status: 'ACTIVE_VALID',
    ipAddress: '197.234.221.14 (Patient Terminal)',
    pdfExportHash: 'SHA256:7f9a12c8b09d...'
  },
  {
    id: 'CONS-002',
    patientId: 'PAT-001',
    patientMrn: 'JJM-2026-00104',
    patientName: 'Blessing Kpadeh',
    formType: 'TELEHEALTH_VIRTUAL_CARE',
    title: 'Telehealth & Remote Digital Video Consultation Consent',
    version: 'v1.2',
    summary: 'Consent for secure video medical check-ins and remote physician advisories when unable to attend in-person.',
    termsAndConditions: [
      'I understand telehealth does not replace emergency trauma or life-support physical care.',
      'Audio-video streams are encrypted end-to-end and stored according to medical privacy standards.'
    ],
    signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50"><text x="10" y="35" font-family="cursive" font-size="24" fill="%230f766e">Blessing Kpadeh</text></svg>',
    signatureType: 'DIGITAL_DRAW',
    signedBy: 'Blessing Kpadeh',
    signerRelationship: 'SELF',
    signedAt: '2026-11-02T13:45:00Z',
    witnessName: 'Dr. Evelyn Sirleaf-Gbotoe, MD',
    witnessRole: 'Attending Physician',
    status: 'ACTIVE_VALID'
  }
];

export const INITIAL_PATIENT_FEEDBACKS: PatientFeedback[] = [
  {
    id: 'FDBK-001',
    patientId: 'PAT-001',
    patientName: 'Blessing Kpadeh',
    isAnonymous: false,
    rating: 5,
    serviceCategory: 'OUTPATIENT_OPD',
    careProviderName: 'Dr. Evelyn Sirleaf-Gbotoe',
    title: 'Exceptional Care & Rapid Recovery from Malaria',
    comment: 'The doctors and nurses at J & J Memorial took immediate care of me when I had severe chills. The blood test results came back in less than 45 minutes, and the pharmacy explained my medication dosage very clearly. The patient portal also made seeing my tests so easy!',
    suggestionsForImprovement: 'Keep more water dispensers in the outpatient waiting lobby.',
    submittedAt: '2026-11-02T16:20:00Z',
    isVerifiedPatient: true,
    isFeaturedOnHome: true,
    communityLocation: 'VOA East Community, Monrovia',
    clinicalResponse: {
      respondedBy: 'Dr. J. Saydee Kollie (Medical Director)',
      responseDate: '2026-11-02T18:00:00Z',
      message: 'Thank you Blessing! We are glad you have recovered and we have already added two additional purified water stations to the OPD lobby.'
    }
  },
  {
    id: 'FDBK-002',
    patientId: 'PAT-003',
    patientName: 'Cecelia Toe',
    isAnonymous: false,
    rating: 5,
    serviceCategory: 'MATERNITY',
    careProviderName: 'Sister Comfort Weah, RN',
    title: 'Safe Delivery and Wonderful Antenatal Nurses',
    comment: 'Delivering my baby boy at J & J Memorial was peaceful. The electricity was completely steady all night with their generator system, and the maternity nurses checked on us every hour with so much gentleness.',
    submittedAt: '2026-10-28T11:15:00Z',
    isVerifiedPatient: true,
    isFeaturedOnHome: true,
    communityLocation: 'Sinkor, Monrovia'
  },
  {
    id: 'FDBK-003',
    patientId: 'PAT-002',
    patientName: 'Joseph Kromah',
    isAnonymous: false,
    rating: 5,
    serviceCategory: 'INPATIENT_WARDS',
    careProviderName: 'Dr. J. Saydee Kollie',
    title: 'Dignified Inpatient Care for Severe Hypertension',
    comment: 'When my blood pressure shot up to crisis levels, the Male Medical Ward staff stabilized me immediately. Dr. Kollie visited my bed twice a day and adjusted my medications with tremendous patience.',
    submittedAt: '2026-10-31T14:40:00Z',
    isVerifiedPatient: true,
    isFeaturedOnHome: true,
    communityLocation: 'Congo Town, Monrovia'
  },
  {
    id: 'FDBK-004',
    patientId: 'PAT-004',
    patientName: 'Moses Tweh',
    isAnonymous: false,
    rating: 4,
    serviceCategory: 'LABORATORY',
    careProviderName: 'Anthony Barclay (Lab Scientist)',
    title: 'Accurate Blood Work & Clean Facility',
    comment: 'Very professional laboratory staff. Blood drawing was painless and the digital equipment is top tier. The facility is very clean and air conditioned.',
    suggestionsForImprovement: 'Add an SMS alert when lab results are uploaded.',
    submittedAt: '2026-10-26T09:30:00Z',
    isVerifiedPatient: true,
    isFeaturedOnHome: true,
    communityLocation: 'Paynesville, Montserrado'
  }
];

export const INITIAL_PATIENT_VITALS_LOGS: PatientVitalsLogEntry[] = [
  {
    id: 'VLOG-001',
    patientId: 'PAT-001',
    patientMrn: 'JJM-2026-00104',
    date: '2026-10-29',
    time: '08:00 AM',
    systolic: 122,
    diastolic: 80,
    heartRate: 78,
    weightKg: 68.5,
    bloodGlucoseMgDl: 94,
    notes: 'Morning measurement before breakfast. Feeling stable.',
    recordedAt: '2026-10-29T08:00:00Z'
  },
  {
    id: 'VLOG-002',
    patientId: 'PAT-001',
    patientMrn: 'JJM-2026-00104',
    date: '2026-10-30',
    time: '08:30 AM',
    systolic: 125,
    diastolic: 82,
    heartRate: 80,
    weightKg: 68.3,
    bloodGlucoseMgDl: 96,
    notes: 'Mild headache after work, resolved after rest.',
    recordedAt: '2026-10-30T08:30:00Z'
  },
  {
    id: 'VLOG-003',
    patientId: 'PAT-001',
    patientMrn: 'JJM-2026-00104',
    date: '2026-10-31',
    time: '08:15 AM',
    systolic: 120,
    diastolic: 78,
    heartRate: 75,
    weightKg: 68.0,
    bloodGlucoseMgDl: 92,
    notes: 'Resting day at home. Vitals very calm.',
    recordedAt: '2026-10-31T08:15:00Z'
  },
  {
    id: 'VLOG-004',
    patientId: 'PAT-001',
    patientMrn: 'JJM-2026-00104',
    date: '2026-11-01',
    time: '08:00 AM',
    systolic: 119,
    diastolic: 77,
    heartRate: 74,
    weightKg: 68.0,
    bloodGlucoseMgDl: 91,
    notes: 'Coartem malaria treatment completed.',
    recordedAt: '2026-11-01T08:00:00Z'
  },
  {
    id: 'VLOG-005',
    patientId: 'PAT-001',
    patientMrn: 'JJM-2026-00104',
    date: '2026-11-02',
    time: '08:00 AM',
    systolic: 118,
    diastolic: 76,
    heartRate: 72,
    weightKg: 68.1,
    bloodGlucoseMgDl: 90,
    notes: 'Energy fully recovered.',
    recordedAt: '2026-11-02T08:00:00Z'
  },
  {
    id: 'VLOG-006',
    patientId: 'PAT-001',
    patientMrn: 'JJM-2026-00104',
    date: '2026-11-03',
    time: '08:30 AM',
    systolic: 120,
    diastolic: 78,
    heartRate: 74,
    weightKg: 68.0,
    bloodGlucoseMgDl: 93,
    notes: 'Pre-clinic check. Blood pressure in target range.',
    recordedAt: '2026-11-03T08:30:00Z'
  }
];

export const INITIAL_SPECIALIZED_RESOURCES: SpecializedEquipmentResource[] = [
  {
    id: 'RES-001',
    code: 'EQ-US-01',
    name: 'Siemens Sonoline G40 Diagnostic Ultrasound',
    category: 'DIAGNOSTIC_IMAGING',
    location: 'Radiology Suite Room 2',
    status: 'OPERATIONAL',
    manufacturer: 'Siemens Healthineers',
    model: 'Sonoline G40 Multipurpose',
    serialNumber: 'SN-US-882109',
    lastServiceDate: '2026-09-15',
    nextCalibrationDate: '2027-03-15',
    hourlyCapacity: 3
  },
  {
    id: 'RES-002',
    code: 'EQ-XR-01',
    name: 'GE Definium Digital Radiography X-Ray Suite',
    category: 'DIAGNOSTIC_IMAGING',
    location: 'Main Imaging Wing Bay 1',
    status: 'OPERATIONAL',
    manufacturer: 'GE Healthcare',
    model: 'Definium AMX 700',
    serialNumber: 'SN-XR-99412',
    lastServiceDate: '2026-10-01',
    nextCalibrationDate: '2027-04-01',
    hourlyCapacity: 4
  },
  {
    id: 'RES-003',
    code: 'EQ-OT-01',
    name: 'Main Surgical Suite & Operating Theater 1',
    category: 'SURGICAL_SUITE',
    location: 'Surgical Block Level 2',
    status: 'OPERATIONAL',
    manufacturer: 'Dräger / Maquet',
    model: 'Alphamaquet 1150 OR Suite',
    serialNumber: 'SN-OR-01-M',
    lastServiceDate: '2026-10-12',
    nextCalibrationDate: '2027-01-12',
    hourlyCapacity: 1
  },
  {
    id: 'RES-004',
    code: 'EQ-ECG-01',
    name: 'Philips PageWriter TC70 12-Lead ECG Machine',
    category: 'MONITORING_DEVICE',
    location: 'Cardiology / Acute Triage',
    status: 'OPERATIONAL',
    manufacturer: 'Philips Medical',
    model: 'PageWriter TC70',
    serialNumber: 'SN-ECG-44102',
    lastServiceDate: '2026-10-05',
    nextCalibrationDate: '2027-04-05',
    hourlyCapacity: 6
  }
];

export const INITIAL_RESOURCE_RESERVATIONS: ResourceReservation[] = [
  {
    id: 'RRES-001',
    resourceId: 'RES-001',
    patientId: 'PAT-001',
    patientMrn: 'JJM-2026-00104',
    patientName: 'Blessing Kpadeh',
    procedureName: 'Pelvic & Abdominal Ultrasound Review',
    requestedBy: 'Dr. Evelyn Sirleaf-Gbotoe',
    date: '2026-11-04',
    startTime: '10:00',
    endTime: '10:45',
    status: 'SCHEDULED',
    notes: 'Post-treatment organ scan',
    createdAt: '2026-11-03T10:00:00Z'
  },
  {
    id: 'RRES-002',
    resourceId: 'RES-002',
    patientId: 'PAT-002',
    patientMrn: 'JJM-2026-00105',
    patientName: 'Joseph Kromah',
    procedureName: 'Digital Chest Radiograph (PA View)',
    requestedBy: 'Dr. J. Saydee Kollie',
    date: '2026-11-04',
    startTime: '11:00',
    endTime: '11:30',
    status: 'SCHEDULED',
    notes: 'Cardiomegaly check',
    createdAt: '2026-11-03T11:00:00Z'
  }
];

export const INITIAL_INSURANCE_POLICIES: InsurancePolicyRecord[] = [
  {
    id: 'INS-POL-001',
    patientId: 'PAT-001',
    patientMrn: 'JJM-2026-00104',
    patientName: 'Blessing Kpadeh',
    provider: 'ACTIVA_LIBERIA',
    providerName: 'Activa International Insurance Liberia',
    policyNumber: 'ACT-CORP-2026-9041',
    memberId: 'ACT-MEM-001842',
    groupNumber: 'GRP-TOTAL-ENERGIES-LR',
    coverageStatus: 'ACTIVE_ELIGIBLE',
    coveragePercentage: 85,
    copayAmountUSD: 5.00,
    annualDeductibleUSD: 100.00,
    deductibleRemainingUSD: 0.00,
    validFrom: '2026-01-01',
    validUntil: '2026-12-31',
    coveredServices: ['Outpatient Consultations', 'Diagnostic Lab Tests', 'Generic Pharmacy', 'Inpatient Medical Wards', 'Emergency Care'],
    excludedServices: ['Elective Cosmetic Surgery', 'Overseas Evacuation'],
    lastVerifiedAt: '2026-11-03T08:30:00Z',
    verifiedBy: 'Patricia Doe (Billing & Insurance Lead)',
    preAuthReference: 'PA-ACT-88419'
  },
  {
    id: 'INS-POL-002',
    patientId: 'PAT-002',
    patientMrn: 'JJM-2026-00105',
    patientName: 'Joseph Kromah',
    provider: 'ACCIDENT_AND_GENERAL',
    providerName: 'Accident & General Insurance Company (AGI)',
    policyNumber: 'AGI-HLTH-2026-1142',
    memberId: 'AGI-MEM-009941',
    coverageStatus: 'ACTIVE_ELIGIBLE',
    coveragePercentage: 90,
    copayAmountUSD: 10.00,
    annualDeductibleUSD: 150.00,
    deductibleRemainingUSD: 20.00,
    validFrom: '2026-01-01',
    validUntil: '2026-12-31',
    coveredServices: ['Cardiology Specialists', 'Inpatient ADT', 'Intensive Care', 'Prescriptions', 'Ultrasound & X-Ray'],
    excludedServices: ['Experimental Therapies'],
    lastVerifiedAt: '2026-11-02T15:00:00Z',
    verifiedBy: 'Patricia Doe (Billing & Insurance Lead)',
    preAuthReference: 'PA-AGI-77120'
  },
  {
    id: 'INS-POL-003',
    patientId: 'PAT-003',
    patientMrn: 'JJM-2026-00106',
    patientName: 'Cecelia Toe',
    provider: 'NATIONAL_CIVIL_SERVICE',
    providerName: 'Civil Service Agency (CSA) Health Scheme',
    policyNumber: 'CSA-MOH-2026-4401',
    memberId: 'CSA-EMP-883192',
    coverageStatus: 'ACTIVE_ELIGIBLE',
    coveragePercentage: 100,
    copayAmountUSD: 0.00,
    annualDeductibleUSD: 0.00,
    deductibleRemainingUSD: 0.00,
    validFrom: '2026-01-01',
    validUntil: '2026-12-31',
    coveredServices: ['Comprehensive Maternal & Child Health', 'Normal & C-Section Delivery', 'Neonatal Care', 'Routine Immunizations'],
    excludedServices: [],
    lastVerifiedAt: '2026-10-25T10:00:00Z',
    verifiedBy: 'Patricia Doe (Billing & Insurance Lead)',
    preAuthReference: 'CSA-PREAUTH-1092'
  }
];
