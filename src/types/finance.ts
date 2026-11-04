/**
 * Hospital ERP Finance & Revenue Cycle Types
 * Double-entry general ledger, charge master, cashiering, receipts, and dual-currency (USD/LRD)
 */

export interface ChargeItem {
  id: string;
  code: string; // e.g. "SRV-CONS-OPD"
  description: string;
  category: 'CONSULTATION' | 'LABORATORY' | 'PHARMACY' | 'IMAGING' | 'NURSING' | 'BED_ACCOMMODATION' | 'PROCEDURE';
  priceUSD: number;
  priceLRD: number; // Linked by configurable exchange rate
  department: string;
  isActive: boolean;
}

export interface InvoiceLineItem {
  id: string;
  chargeItemId: string;
  description: string;
  category: string;
  quantity: number;
  unitPriceUSD: number;
  unitPriceLRD: number;
  totalUSD: number;
  totalLRD: number;
  sourceEncounterId?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-2026-00452"
  patientId: string;
  patientMrn: string;
  patientName: string;
  date: string;
  items: InvoiceLineItem[];
  subtotalUSD: number;
  subtotalLRD: number;
  discountUSD: number;
  discountLRD: number;
  totalUSD: number;
  totalLRD: number;
  status: 'DRAFT' | 'POSTED' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';
  settlementCurrency: 'USD' | 'LRD';
  amountPaidUSD: number;
  amountPaidLRD: number;
  balanceUSD: number;
  balanceLRD: number;
  insuranceShareUSD?: number;
  patientShareUSD?: number;
  createdAt: string;
  createdBy: string;
}

export interface PaymentReceipt {
  id: string;
  receiptNumber: string; // e.g. "RCPT-2026-00812"
  invoiceId: string;
  invoiceNumber: string;
  patientId: string;
  patientMrn: string;
  patientName: string;
  amountUSD: number;
  amountLRD: number;
  currencyPaid: 'USD' | 'LRD' | 'SPLIT';
  paymentMethod: 'CASH' | 'MTN_MOMO' | 'ORANGE_MONEY' | 'BANK_TRANSFER' | 'CARD';
  paymentReference?: string;
  cashierName: string;
  timestamp: string;
  verificationQrPayload: string;
  notes?: string;
}

export interface CreditRefundAdjustment {
  id: string;
  creditNoteNumber: string; // e.g. "CRN-2026-00041"
  originalInvoiceId: string;
  originalInvoiceNumber: string;
  patientMrn: string;
  patientName: string;
  amountUSD: number;
  amountLRD: number;
  reason: string;
  requestedBy: string;
  approvedBy?: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  approvedAt?: string;
}

export interface AccountLedgerEntry {
  id: string;
  accountNumber: string; // e.g. "1010"
  accountName: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  debitUSD: number;
  creditUSD: number;
  debitLRD: number;
  creditLRD: number;
}

export interface GeneralLedgerJournal {
  id: string;
  voucherNumber: string; // e.g. "JV-2026-00192"
  date: string;
  description: string;
  referenceType: 'BILLING_INVOICE' | 'CASHIER_RECEIPT' | 'PHARMACY_COGS' | 'SUPPLIER_GRN' | 'PAYROLL_DISBURSEMENT' | 'REFUND_REVERSAL';
  referenceId: string;
  entries: AccountLedgerEntry[];
  totalDebitUSD: number;
  totalCreditUSD: number;
  isBalanced: boolean;
  postedBy: string;
  createdAt: string;
}
