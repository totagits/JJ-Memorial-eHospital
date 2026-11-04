/**
 * Real-Time Health Insurance & Payer Verification Types
 * Facilitates front-desk and billing verification of national and private policies
 * (Activa, Accident & General, Intrasur, Medicare International, etc.)
 */

export type InsuranceProviderId =
  | 'ACTIVA_LIBERIA'
  | 'ACCIDENT_AND_GENERAL'
  | 'INTRASUR_LIBERIA'
  | 'MEDICARE_INTERNATIONAL'
  | 'NATIONAL_CIVIL_SERVICE'
  | 'SELF_PAY';

export interface InsurancePolicyRecord {
  id: string;
  patientId: string;
  patientMrn: string;
  patientName: string;
  provider: InsuranceProviderId;
  providerName: string;
  policyNumber: string;
  memberId: string;
  groupNumber?: string;
  coverageStatus: 'ACTIVE_ELIGIBLE' | 'EXPIRED' | 'PENDING_PREAUTH' | 'SUSPENDED';
  coveragePercentage: number; // e.g. 85%
  copayAmountUSD: number; // e.g. 5.00
  annualDeductibleUSD: number; // e.g. 100.00
  deductibleRemainingUSD: number; // e.g. 25.00
  validFrom: string;
  validUntil: string;
  coveredServices: string[]; // e.g. ["Outpatient Consults", "Generic Pharmacy", "Standard Lab", "Emergency Care"]
  excludedServices: string[]; // e.g. ["Cosmetic Dermatology", "International Evacuation"]
  lastVerifiedAt: string;
  verifiedBy: string;
  preAuthReference?: string;
}
