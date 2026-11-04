/**
 * Digital Consent & Treatment Authorization Types
 * Allows patients to legally and electronically sign admission, surgical,
 * telehealth, blood transfusion, and clinical data release forms.
 */

export type ConsentFormType =
  | 'GENERAL_ADMISSION'
  | 'SURGICAL_PROCEDURE'
  | 'TELEHEALTH_VIRTUAL_CARE'
  | 'BLOOD_TRANSFUSION'
  | 'RELEASE_OF_RECORDS';

export interface DigitalConsentForm {
  id: string;
  patientId: string;
  patientMrn: string;
  patientName: string;
  formType: ConsentFormType;
  title: string;
  version: string;
  summary: string;
  termsAndConditions: string[];
  signatureDataUrl: string; // Base64 signature image or vector data
  signatureType: 'DIGITAL_DRAW' | 'TYPED_ELECTRONIC';
  signedBy: string;
  signerRelationship: 'SELF' | 'PARENT' | 'LEGAL_GUARDIAN' | 'SPOUSE' | 'NEXT_OF_KIN';
  signerNationalId?: string;
  signedAt: string; // ISO string
  witnessName: string;
  witnessRole: string; // e.g. "Admissions Officer", "Staff Nurse"
  status: 'ACTIVE_VALID' | 'REVOKED';
  ipAddress?: string;
  pdfExportHash?: string;
}
