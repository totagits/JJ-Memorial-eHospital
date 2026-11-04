/**
 * Hospital ERP Operational Modules Types
 * Inventory & Store, Procurement, HR & Payroll, Biomedical Assets, and Quality & Incident Management
 */

export interface InventoryItem {
  id: string;
  itemCode: string; // e.g. "MED-AMOX-500" or "SUP-GLV-001"
  name: string;
  category: 'MEDICATION' | 'CONSUMABLE' | 'LAB_REAGENT' | 'SURGICAL' | 'OFFICE_SUPPLY';
  unitOfMeasure: 'TABLET' | 'VIAL' | 'BOX' | 'BOTTLE' | 'PACK';
  reorderLevel: number;
  currentStock: number;
  unitCostUSD: number;
  unitCostLRD: number;
  sellingPriceUSD: number;
  sellingPriceLRD: number;
  location: string; // e.g. "Central Pharmacy Rack A", "Stores Bin 4"
  batches: Array<{
    batchNumber: string;
    quantity: number;
    expiryDate: string; // YYYY-MM-DD
    isQuarantined?: boolean;
  }>;
}

export interface Supplier {
  id: string;
  code: string; // e.g. "SUP-001"
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  category: 'PHARMACEUTICALS' | 'BIOMEDICAL_EQUIPMENT' | 'GENERAL_STORES' | 'DIAGNOSTIC_REAGENTS';
  rating: number; // 1-5
  status: 'ACTIVE' | 'ON_HOLD' | 'INACTIVE';
}

export interface PurchaseOrder {
  id: string;
  poNumber: string; // e.g. "PO-2026-00088"
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  items: Array<{
    itemId: string;
    itemCode: string;
    itemName: string;
    quantityOrdered: number;
    quantityReceived: number;
    unitPriceUSD: number;
    totalUSD: number;
  }>;
  subtotalUSD: number;
  status: 'DRAFT' | 'APPROVED' | 'PARTIALLY_RECEIVED' | 'FULFILLED' | 'CANCELLED';
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
}

export interface GoodsReceiptNote {
  id: string;
  grnNumber: string; // e.g. "GRN-2026-00064"
  poNumber: string;
  supplierName: string;
  receiptDate: string;
  itemsReceived: Array<{
    itemId: string;
    itemName: string;
    batchNumber: string;
    expiryDate: string;
    quantity: number;
    unitPriceUSD: number;
    conditionGood: boolean;
  }>;
  threeWayMatched: boolean; // PO + Delivery Note + Invoice
  receivedBy: string;
}

export interface Employee {
  id: string;
  staffId: string; // e.g. "EMP-001"
  fullName: string;
  role: string;
  department: string;
  qualification: string;
  licenseNumber: string;
  licenseExpiry: string;
  isLicenseExpiringSoon: boolean;
  monthlySalaryUSD: number;
  monthlySalaryLRD: number;
  phone: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'PROBATION';
  shiftSchedule: 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'ON_CALL';
}

export interface PayrollRun {
  id: string;
  periodName: string; // e.g. "November 2026"
  runDate: string;
  totalGrossUSD: number;
  totalGrossLRD: number;
  totalTaxDeductionsUSD: number;
  totalNetPayUSD: number;
  employeeCount: number;
  status: 'DRAFT' | 'APPROVED' | 'POSTED_TO_GL';
  approvedBy?: string;
  postedJournalVoucher?: string;
}

export interface BiomedicalAsset {
  id: string;
  assetTag: string; // e.g. "BIO-VENT-002" or "GEN-CAT-500KVA"
  name: string;
  model: string;
  serialNumber: string;
  department: string;
  location: string;
  status: 'OPERATIONAL' | 'MAINTENANCE_REQUIRED' | 'UNDER_REPAIR' | 'DECOMMISSIONED';
  purchaseDate: string;
  lastCalibrationDate: string;
  nextCalibrationDate: string;
  custodian: string;
  maintenanceLog: Array<{
    date: string;
    type: 'PREVENTIVE' | 'CORRECTIVE' | 'CALIBRATION';
    technician: string;
    costUSD: number;
    notes: string;
  }>;
}

export interface QualitySafetyIncident {
  id: string;
  incidentNumber: string; // e.g. "INC-2026-00019"
  dateOfOccurrence: string;
  location: string;
  severity: 'NEAR_MISS' | 'MINOR' | 'MODERATE' | 'SENTINEL_EVENT';
  category: 'MEDICATION_SAFETY' | 'PATIENT_FALL' | 'DIAGNOSTIC_DELAY' | 'EQUIPMENT_MALFUNCTION' | 'INFECTION_CONTROL';
  description: string;
  reportedBy: string;
  confidential: boolean;
  status: 'LOGGED' | 'INVESTIGATING' | 'CAPA_ASSIGNED' | 'RESOLVED_AND_CLOSED';
  correctiveActionPlan?: string;
  closedAt?: string;
}

export interface StaffShift {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  department: 'OPD' | 'EMERGENCY' | 'INPATIENT' | 'MATERNITY' | 'LABORATORY' | 'PHARMACY' | 'RADIOLOGY' | 'SURGERY' | 'ADMINISTRATION';
  shiftDate: string; // YYYY-MM-DD
  shiftType: 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'ON_CALL_24H';
  startTime: string; // "07:00"
  endTime: string; // "15:00"
  wardOrRoom: string;
  status: 'CONFIRMED' | 'TENTATIVE' | 'SWAP_REQUESTED' | 'ABSENT_COVERED';
  notes?: string;
  assignedBy: string;
  hours: number;
}

