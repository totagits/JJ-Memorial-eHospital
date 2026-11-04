/**
 * Patient Feedback, Reviews & Public Testimonials Types
 * Enables verified patient reviews, star ratings, and improvement suggestions
 * that feed directly into the hospital's public testimonials showcase.
 */

export interface PatientFeedback {
  id: string;
  patientId: string;
  patientName: string; // e.g. "Blessing K."
  isAnonymous: boolean;
  rating: number; // 1 - 5 stars
  serviceCategory: 'OUTPATIENT_OPD' | 'EMERGENCY_TRIAGE' | 'MATERNITY' | 'LABORATORY' | 'PHARMACY' | 'INPATIENT_WARDS' | 'TELEHEALTH';
  careProviderName?: string; // e.g. "Dr. Evelyn Sirleaf-Gbotoe"
  title: string;
  comment: string;
  suggestionsForImprovement?: string;
  submittedAt: string; // ISO string
  isVerifiedPatient: boolean;
  isFeaturedOnHome: boolean;
  communityLocation?: string; // e.g. "Congo Town, Monrovia"
  clinicalResponse?: {
    respondedBy: string;
    responseDate: string;
    message: string;
  };
}
