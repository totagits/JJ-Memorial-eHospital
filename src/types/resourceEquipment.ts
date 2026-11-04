/**
 * Specialized Medical Resource & Equipment Management Types
 * Prevents scheduling conflicts for high-demand diagnostic imaging,
 * surgical theaters, and specialized monitoring devices.
 */

export type ResourceCategory = 'DIAGNOSTIC_IMAGING' | 'SURGICAL_SUITE' | 'MONITORING_DEVICE' | 'PROCEDURE_ROOM';
export type ResourceOperationalStatus = 'OPERATIONAL' | 'IN_USE' | 'MAINTENANCE' | 'CALIBRATION_REQUIRED';

export interface ResourceReservation {
  id: string;
  resourceId: string;
  patientId: string;
  patientMrn: string;
  patientName: string;
  procedureName: string; // e.g. "Abdominal Ultrasound", "Emergency Appendectomy", "Stress ECG"
  requestedBy: string; // Clinician name
  date: string; // YYYY-MM-DD
  startTime: string; // "10:00"
  endTime: string; // "11:00"
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
}

export interface SpecializedEquipmentResource {
  id: string;
  code: string; // e.g. "EQ-US-01"
  name: string; // e.g. "Siemens Sonoline Ultrasound G40"
  category: ResourceCategory;
  location: string; // e.g. "Diagnostic Wing Room 3"
  status: ResourceOperationalStatus;
  manufacturer: string;
  model: string;
  serialNumber: string;
  lastServiceDate: string;
  nextCalibrationDate: string;
  hourlyCapacity: number;
}
