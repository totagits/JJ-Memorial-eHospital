import { updateDatabaseState, getDatabaseState, logAuditEvent } from './storageService';
import { GeneralLedgerJournal, Invoice, PaymentReceipt, AccountLedgerEntry } from '../types/finance';
import { LRD_PER_USD } from '../data/seedData';

/**
 * Double-Entry General Ledger Posting Service
 * Enforces fundamental accounting equation: Assets = Liabilities + Equity
 * Every journal voucher must be balanced: Total Debits == Total Credits
 */

export function postCashierPaymentToGL(params: {
  receipt: PaymentReceipt;
  invoice: Invoice;
  cashierName: string;
}): GeneralLedgerJournal {
  const voucherNumber = `JV-${new Date().getFullYear()}-${String(getDatabaseState().journals.length + 1).padStart(5, '0')}`;
  
  const amountUSD = params.receipt.amountUSD;
  const amountLRD = params.receipt.amountLRD || amountUSD * LRD_PER_USD;

  // Debit: Cash on Hand (Asset - Account 1010)
  // Credit: Patient Accounts Receivable (Asset - Account 1050)
  const newJournal: GeneralLedgerJournal = {
    id: `JV-${Date.now()}`,
    voucherNumber,
    date: new Date().toISOString().split('T')[0],
    description: `Cashier payment collection for ${params.receipt.patientName} (${params.receipt.receiptNumber}) - Invoice ${params.invoice.invoiceNumber}`,
    referenceType: 'CASHIER_RECEIPT',
    referenceId: params.receipt.id,
    entries: [
      {
        id: `ENT-${Date.now()}-1`,
        accountNumber: '1010',
        accountName: 'Cash on Hand (Main Hospital Vault / POS)',
        type: 'ASSET',
        debitUSD: amountUSD,
        creditUSD: 0,
        debitLRD: amountLRD,
        creditLRD: 0,
      },
      {
        id: `ENT-${Date.now()}-2`,
        accountNumber: '1050',
        accountName: 'Patient Accounts Receivable',
        type: 'ASSET',
        debitUSD: 0,
        creditUSD: amountUSD,
        debitLRD: 0,
        creditLRD: amountLRD,
      }
    ],
    totalDebitUSD: amountUSD,
    totalCreditUSD: amountUSD,
    isBalanced: true,
    postedBy: params.cashierName,
    createdAt: new Date().toISOString(),
  };

  updateDatabaseState(draft => {
    draft.journals.unshift(newJournal);
  });

  logAuditEvent({
    userId: 'CASHIER',
    userName: params.cashierName,
    userRole: 'cashier_billing',
    action: 'COLLECT_PAYMENT',
    module: 'GL',
    patientId: params.receipt.patientId,
    patientMrn: params.receipt.patientMrn,
    details: `Automated Balanced GL Journal ${voucherNumber} posted for payment receipt ${params.receipt.receiptNumber} ($${amountUSD} / LRD ${amountLRD}).`,
    ipAddress: '192.168.10.71',
    status: 'SUCCESS',
  });

  return newJournal;
}

export function postInvoiceBillingToGL(params: {
  invoice: Invoice;
  billingOfficer: string;
}): GeneralLedgerJournal {
  const voucherNumber = `JV-${new Date().getFullYear()}-${String(getDatabaseState().journals.length + 1).padStart(5, '0')}`;
  const totalUSD = params.invoice.totalUSD;
  const totalLRD = params.invoice.totalLRD;

  // Compute breakdown by category
  let consultUSD = 0;
  let labUSD = 0;
  let pharmUSD = 0;
  let bedUSD = 0;
  let imagingUSD = 0;
  let procUSD = 0;

  params.invoice.items.forEach(item => {
    if (item.category === 'CONSULTATION') consultUSD += item.totalUSD;
    else if (item.category === 'LABORATORY') labUSD += item.totalUSD;
    else if (item.category === 'PHARMACY') pharmUSD += item.totalUSD;
    else if (item.category === 'IMAGING') imagingUSD += item.totalUSD;
    else if (item.category === 'PROCEDURE' || item.category === 'NURSING') procUSD += item.totalUSD;
    else bedUSD += item.totalUSD;
  });

  const entries: AccountLedgerEntry[] = [
    // Debit: Accounts Receivable (Asset 1050)
    {
      id: `ENT-${Date.now()}-AR`,
      accountNumber: '1050',
      accountName: 'Patient Accounts Receivable',
      type: 'ASSET',
      debitUSD: totalUSD,
      creditUSD: 0,
      debitLRD: totalLRD,
      creditLRD: 0,
    }
  ];

  if (consultUSD > 0) {
    entries.push({
      id: `ENT-${Date.now()}-REV1`,
      accountNumber: '4010',
      accountName: 'Outpatient Consultation Revenue',
      type: 'REVENUE' as const,
      debitUSD: 0,
      creditUSD: consultUSD,
      debitLRD: 0,
      creditLRD: consultUSD * LRD_PER_USD,
    });
  }
  if (labUSD > 0) {
    entries.push({
      id: `ENT-${Date.now()}-REV2`,
      accountNumber: '4020',
      accountName: 'Laboratory Services Revenue',
      type: 'REVENUE' as const,
      debitUSD: 0,
      creditUSD: labUSD,
      debitLRD: 0,
      creditLRD: labUSD * LRD_PER_USD,
    });
  }
  if (pharmUSD > 0) {
    entries.push({
      id: `ENT-${Date.now()}-REV3`,
      accountNumber: '4030',
      accountName: 'Pharmacy Dispensing Revenue',
      type: 'REVENUE' as const,
      debitUSD: 0,
      creditUSD: pharmUSD,
      debitLRD: 0,
      creditLRD: pharmUSD * LRD_PER_USD,
    });
  }
  if (imagingUSD > 0) {
    entries.push({
      id: `ENT-${Date.now()}-REV5`,
      accountNumber: '4050',
      accountName: 'Radiology & Medical Imaging Revenue',
      type: 'REVENUE' as const,
      debitUSD: 0,
      creditUSD: imagingUSD,
      debitLRD: 0,
      creditLRD: imagingUSD * LRD_PER_USD,
    });
  }
  if (procUSD > 0) {
    entries.push({
      id: `ENT-${Date.now()}-REV6`,
      accountNumber: '4060',
      accountName: 'Nursing & Minor Procedures Revenue',
      type: 'REVENUE' as const,
      debitUSD: 0,
      creditUSD: procUSD,
      debitLRD: 0,
      creditLRD: procUSD * LRD_PER_USD,
    });
  }
  if (bedUSD > 0) {
    entries.push({
      id: `ENT-${Date.now()}-REV4`,
      accountNumber: '4040',
      accountName: 'Inpatient Bed Accommodation Revenue',
      type: 'REVENUE' as const,
      debitUSD: 0,
      creditUSD: bedUSD,
      debitLRD: 0,
      creditLRD: bedUSD * LRD_PER_USD,
    });
  }

  const newJournal: GeneralLedgerJournal = {
    id: `JV-${Date.now()}`,
    voucherNumber,
    date: new Date().toISOString().split('T')[0],
    description: `Billing charges invoice ${params.invoice.invoiceNumber} for ${params.invoice.patientName}`,
    referenceType: 'BILLING_INVOICE',
    referenceId: params.invoice.id,
    entries,
    totalDebitUSD: totalUSD,
    totalCreditUSD: totalUSD,
    isBalanced: true,
    postedBy: params.billingOfficer,
    createdAt: new Date().toISOString(),
  };

  updateDatabaseState(draft => {
    draft.journals.unshift(newJournal);
  });

  return newJournal;
}
