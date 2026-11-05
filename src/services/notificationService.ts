/**
 * J & J Memorial e-Hospital — Centralized Notification Service
 * Dispatches real-time, role-specific clinical and administrative alerts:
 *  - Clinicians: Lab results ready, STAT emergency triage, critical panic alerts
 *  - Billing: Unpaid bills, discharge settlements, unbilled encounter alerts
 *  - Laboratory (LIS): Specimen inflow, Blood Bank cold chain, panic verification
 *  - Nursing: Inpatient bed capacity surge, medication due alerts
 *  - Pharmacy: Stockout alerts, antibiotic stewardship
 *  - Administrators: Audit trail security alerts, break-glass overrides
 */

import { UserAccount } from '../types/auth';
import { PrimaryRole, RBACService } from './rbacService';

export type NotificationCategory = 
  | 'LAB_RESULT'
  | 'BILLING_UNPAID'
  | 'STAT_EMERGENCY'
  | 'TRIAGE_SURGE'
  | 'BED_CAPACITY'
  | 'STOCKOUT_RISK'
  | 'SECURITY_ALERT';

export type NotificationPriority = 'STAT' | 'HIGH' | 'MEDIUM' | 'INFO';

export interface NotificationItem {
  id: string;
  targetRoles: PrimaryRole[] | 'ALL';
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  targetModule: string; // The workstation to navigate to upon click
  metadata?: {
    patientId?: string;
    patientName?: string;
    patientMrn?: string;
    invoiceId?: string;
    orderId?: string;
    amount?: string;
    department?: string;
  };
  actionLabel: string;
  createdAt: string;
  readBy: string[]; // List of user IDs who have marked this alert as read
}

const STORAGE_KEY = 'jjm_hospital_notifications_catalog';

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  // 1. For CLINICIANS (Doctors) — Diagnostic results & emergency alerts
  {
    id: 'NOTIF-001',
    targetRoles: ['Clinician'],
    category: 'LAB_RESULT',
    priority: 'HIGH',
    title: 'Lab Results Ready: Malaria Microscopy & CBC',
    message: 'Parasitology released for Blessing Kpadeh (MRN: JJM-2026-00101). High positivity (+++ P. falciparum rings observed, Hb 9.2 g/dL). Action recommended: Initiate Artemether-Lumefantrine.',
    targetModule: 'opd',
    metadata: {
      patientId: 'PAT-001',
      patientName: 'Blessing Kpadeh',
      patientMrn: 'JJM-2026-00101',
      orderId: 'LAB-2026-00389',
    },
    actionLabel: 'Open Patient Chart',
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    readBy: [],
  },
  {
    id: 'NOTIF-002',
    targetRoles: ['Clinician', 'LIS'],
    category: 'LAB_RESULT',
    priority: 'STAT',
    title: 'Critical Panic Lab Alert: Severe Thrombocytopenia',
    message: 'Samuel Nimely (MRN: JJM-2026-00104) Platelet count verified at 28,000/µL (critical threshold < 50,000/µL). Immediate attending review and blood bank crossmatch required.',
    targetModule: 'lab',
    metadata: {
      patientId: 'PAT-004',
      patientName: 'Samuel Nimely',
      patientMrn: 'JJM-2026-00104',
      orderId: 'LAB-2026-00392',
    },
    actionLabel: 'Review Critical Result',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    readBy: [],
  },
  {
    id: 'NOTIF-003',
    targetRoles: ['Clinician', 'Nurse'],
    category: 'STAT_EMERGENCY',
    priority: 'STAT',
    title: 'Inbound Trauma Resuscitation: Red Acuity',
    message: 'Ambulance dispatch from VOA Junction: 34-year-old motor vehicle trauma with compound forearm fracture and hemorrhagic hypotension. ETA 4 minutes.',
    targetModule: 'triage',
    metadata: {
      department: 'Emergency & Trauma Bay 1',
    },
    actionLabel: 'Prep Resus Bay',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    readBy: [],
  },

  // 2. For BILLING & FINANCE — Unpaid accounts & cashier alerts
  {
    id: 'NOTIF-004',
    targetRoles: ['Billing'],
    category: 'BILLING_UNPAID',
    priority: 'HIGH',
    title: 'Unpaid Inpatient Bill: Outstanding Discharge Settlement',
    message: 'Joseph Kromah (MRN: JJM-2026-00102) was discharged from Male Medical Ward with an outstanding balance of $385.00 USD (INV-2026-002). Payment pending cashier processing.',
    targetModule: 'billing',
    metadata: {
      patientName: 'Joseph Kromah',
      patientMrn: 'JJM-2026-00102',
      invoiceId: 'INV-2026-002',
      amount: '$385.00 USD',
    },
    actionLabel: 'Collect Payment',
    createdAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    readBy: [],
  },
  {
    id: 'NOTIF-005',
    targetRoles: ['Billing'],
    category: 'BILLING_UNPAID',
    priority: 'MEDIUM',
    title: 'Unbilled Encounter Warning: Consultation Completed',
    message: 'Dr. Evelyn completed an acute consultation for Korto Brown (MRN: JJM-2026-00103) with 3 unbilled prescription items awaiting cashier invoice generation.',
    targetModule: 'billing',
    metadata: {
      patientName: 'Korto Brown',
      patientMrn: 'JJM-2026-00103',
      amount: '$45.00 USD',
    },
    actionLabel: 'Generate Invoice',
    createdAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    readBy: [],
  },
  {
    id: 'NOTIF-006',
    targetRoles: ['Billing'],
    category: 'BILLING_UNPAID',
    priority: 'INFO',
    title: 'Mobile Money Float Reconciliation Due',
    message: 'Orange Money & Lonestar MTN daily POS merchant drawer reached 185,000 LRD ($948.71 USD equivalent). Settlement reconciliation recommended before 5:00 PM.',
    targetModule: 'gl',
    actionLabel: 'Reconcile Drawer',
    createdAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    readBy: [],
  },

  // 3. For LABORATORY (LIS) — Specimen arrivals & Blood Bank
  {
    id: 'NOTIF-007',
    targetRoles: ['LIS'],
    category: 'STAT_EMERGENCY',
    priority: 'STAT',
    title: 'ED Whole Blood Specimen Inflow: STAT Crossmatch',
    message: 'Trauma Bay 1 dispatched 2x EDTA whole blood tubes for urgent compatibility testing (O-Negative recipient). Turnaround target: 15 minutes.',
    targetModule: 'lab',
    metadata: {
      orderId: 'LAB-2026-00395',
      department: 'Emergency Medicine',
    },
    actionLabel: 'Accession Specimen',
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    readBy: [],
  },
  {
    id: 'NOTIF-008',
    targetRoles: ['LIS'],
    category: 'BED_CAPACITY',
    priority: 'HIGH',
    title: 'Blood Bank Cold Chain Warning: O-Negative Low Reserve',
    message: 'Current unreserved O-Negative Packed Red Blood Cells (PRBC) down to 3 units (safety minimum: 5 units). Transfusion requests prioritized for trauma cases.',
    targetModule: 'blood_bank',
    actionLabel: 'Manage Blood Bank',
    createdAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
    readBy: [],
  },

  // 4. For NURSING CARE — Ward occupancy & triage queue
  {
    id: 'NOTIF-009',
    targetRoles: ['Nurse'],
    category: 'BED_CAPACITY',
    priority: 'HIGH',
    title: 'Female Medical Ward Reaching 90% Bed Capacity',
    message: '9 of 10 female inpatient beds occupied. Only 1 acute bed remaining. Please coordinate with Attending Physician for discharge readiness review.',
    targetModule: 'inpatient',
    metadata: {
      department: 'Female Medical Ward',
    },
    actionLabel: 'Review Inpatient Beds',
    createdAt: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    readBy: [],
  },

  // 5. For PHARMACY — Formulary stockout velocity
  {
    id: 'NOTIF-010',
    targetRoles: ['Pharmacy'],
    category: 'STOCKOUT_RISK',
    priority: 'HIGH',
    title: 'Formulary Stockout Warning: Artemether-Lumefantrine',
    message: 'Current inventory for Artemether-Lumefantrine 20/120mg is 140 tablets (48-hour runout risk at current outpatient dispense velocity). Re-order requisition generated.',
    targetModule: 'pharmacy',
    actionLabel: 'Review Drug Stock',
    createdAt: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
    readBy: [],
  },

  // 6. For ADMINISTRATORS & GOVERNANCE — Audit flags & compliance
  {
    id: 'NOTIF-011',
    targetRoles: ['Admin'],
    category: 'SECURITY_ALERT',
    priority: 'HIGH',
    title: 'Audit Trail Security Flag: Break-Glass Override Logged',
    message: 'Dr. Evelyn Sirleaf engaged emergency Break-Glass chart override on patient chart JJM-2026-00101. Justification: "Acute trauma victim resuscitation". Clearance Level 3 review required.',
    targetModule: 'audit_trail',
    metadata: {
      patientMrn: 'JJM-2026-00101',
    },
    actionLabel: 'Inspect Audit Ledger',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    readBy: [],
  },
];

class NotificationService {
  private notifications: NotificationItem[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.notifications = JSON.parse(stored);
      } else {
        this.notifications = [...INITIAL_NOTIFICATIONS];
        this.save();
      }
    } catch {
      this.notifications = [...INITIAL_NOTIFICATIONS];
    }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notifications));
    } catch {
      // Ignore in private storage
    }
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(fn => fn());
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(fn => fn !== callback);
    };
  }

  /**
   * Retrieves role-specific notifications for the active user
   */
  public getNotificationsForUser(user: UserAccount): NotificationItem[] {
    const primaryRole = RBACService.getPrimaryRole(user);
    return this.notifications.filter(item => {
      if (item.targetRoles === 'ALL') return true;
      return item.targetRoles.includes(primaryRole);
    });
  }

  /**
   * Counts unread notifications specifically tailored to user's role
   */
  public getUnreadCount(user: UserAccount): number {
    const roleItems = this.getNotificationsForUser(user);
    return roleItems.filter(item => !item.readBy.includes(user.id)).length;
  }

  /**
   * Checks if there are any unread STAT (emergency) alerts for this role
   */
  public hasUnreadStatAlert(user: UserAccount): boolean {
    const roleItems = this.getNotificationsForUser(user);
    return roleItems.some(item => item.priority === 'STAT' && !item.readBy.includes(user.id));
  }

  /**
   * Mark an alert as read by the user
   */
  public markAsRead(notificationId: string, userId: string): void {
    this.notifications = this.notifications.map(item => {
      if (item.id === notificationId && !item.readBy.includes(userId)) {
        return { ...item, readBy: [...item.readBy, userId] };
      }
      return item;
    });
    this.save();
  }

  /**
   * Mark all role alerts as read for the user
   */
  public markAllAsRead(user: UserAccount): void {
    this.notifications = this.notifications.map(item => {
      const primaryRole = RBACService.getPrimaryRole(user);
      const isTarget = item.targetRoles === 'ALL' || item.targetRoles.includes(primaryRole);
      if (isTarget && !item.readBy.includes(user.id)) {
        return { ...item, readBy: [...item.readBy, user.id] };
      }
      return item;
    });
    this.save();
  }

  /**
   * Dispatch a new notification dynamically
   */
  public dispatch(item: Omit<NotificationItem, 'id' | 'createdAt' | 'readBy'>): NotificationItem {
    const newItem: NotificationItem = {
      ...item,
      id: `NOTIF-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      readBy: [],
    };
    this.notifications.unshift(newItem);
    this.save();
    return newItem;
  }

  /**
   * Simulate a realistic incoming alert for live testing & evaluation
   */
  public simulateIncomingAlert(type: 'LAB_RESULT' | 'BILLING_UNPAID' | 'STAT_EMERGENCY'): NotificationItem {
    if (type === 'LAB_RESULT') {
      return this.dispatch({
        targetRoles: ['Clinician'],
        category: 'LAB_RESULT',
        priority: 'HIGH',
        title: 'New Lab Result Ready: Blood Chemistry Chem-7',
        message: 'Korto Brown (MRN: JJM-2026-00103) Serum Creatinine 1.4 mg/dL, Blood Urea Nitrogen 24 mg/dL. Ready for attending clinician sign-off.',
        targetModule: 'opd',
        metadata: {
          patientName: 'Korto Brown',
          patientMrn: 'JJM-2026-00103',
          orderId: 'LAB-2026-00398',
        },
        actionLabel: 'Review Chem-7 Results',
      });
    } else if (type === 'BILLING_UNPAID') {
      return this.dispatch({
        targetRoles: ['Billing'],
        category: 'BILLING_UNPAID',
        priority: 'HIGH',
        title: 'New Unpaid Invoice: Emergency Registration Fee',
        message: 'Acute trauma intake registered in Trauma Bay 1. Invoice INV-2026-048 ($65.00 USD) generated and pending payment settlement.',
        targetModule: 'billing',
        metadata: {
          invoiceId: 'INV-2026-048',
          amount: '$65.00 USD',
        },
        actionLabel: 'Settle Cashier Fee',
      });
    } else {
      return this.dispatch({
        targetRoles: ['Clinician', 'Nurse', 'LIS'],
        category: 'STAT_EMERGENCY',
        priority: 'STAT',
        title: 'STAT Red Acuity: Acute Pediatric Febrile Convulsion',
        message: '3-year-old brought to Triage with temperature 39.8°C and status epilepticus. Emergency Pediatric Bay prepped.',
        targetModule: 'triage',
        actionLabel: 'Respond to Triage',
      });
    }
  }

  /**
   * Reset notification catalog to default
   */
  public resetToDefault(): void {
    this.notifications = [...INITIAL_NOTIFICATIONS];
    this.save();
  }
}

export const notificationService = new NotificationService();
