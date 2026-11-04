import React, { useState } from 'react';
import { 
  DollarSign, 
  Receipt, 
  Printer, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRightLeft, 
  CreditCard, 
  Search, 
  Plus, 
  Filter, 
  FileText, 
  Calendar, 
  Clock, 
  User, 
  Sparkles, 
  Building2, 
  Phone, 
  QrCode, 
  X,
  Stethoscope,
  Microscope,
  Scan,
  Pill,
  Bed,
  Scissors
} from 'lucide-react';
import { getDatabaseState, updateDatabaseState, logAuditEvent } from '../../services/storageService';
import { postCashierPaymentToGL, postInvoiceBillingToGL } from '../../services/financialLedgerService';
import { UserAccount } from '../../types/auth';
import { Invoice, PaymentReceipt, InvoiceLineItem, ChargeItem } from '../../types/finance';
import { LRD_PER_USD } from '../../data/seedData';

interface BillingCashierWorkstationProps {
  currentUser: UserAccount;
}

export const BillingCashierWorkstation: React.FC<BillingCashierWorkstationProps> = ({ currentUser }) => {
  const db = getDatabaseState();
  const [activeTab, setActiveTab] = useState<'invoices' | 'new_invoice' | 'receipts'>('invoices');

  // Filters & Selection
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'POSTED' | 'PARTIALLY_PAID' | 'PAID' | 'DRAFT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(db.invoices[0]?.id || '');

  // Payment Settlement Form State
  const [paymentAmountUSD, setPaymentAmountUSD] = useState<string>('');
  const [paymentCurrency, setPaymentCurrency] = useState<'USD' | 'LRD'>('USD');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'MTN_MOMO' | 'ORANGE_MONEY' | 'BANK_TRANSFER' | 'CARD'>('CASH');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Active Receipt Modal
  const [activeReceiptForModal, setActiveReceiptForModal] = useState<PaymentReceipt | null>(null);

  // New Invoice Generator State
  const [newInvPatientId, setNewInvPatientId] = useState<string>(db.patients[0]?.id || '');
  const [newInvItems, setNewInvItems] = useState<Array<{
    chargeItemId: string;
    quantity: number;
  }>>([
    { chargeItemId: db.charges[0]?.id || 'SRV-001', quantity: 1 }
  ]);
  const [newInvInsuranceCoverage, setNewInvInsuranceCoverage] = useState<number>(0); // e.g. 85%

  // Credit Note / Refund state
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('Indigent patient clinical relief waiver approved by Medical Director');

  // Filtered Invoices
  const filteredInvoices = db.invoices.filter(inv => {
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.patientMrn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const selectedInvoice = db.invoices.find(i => i.id === selectedInvoiceId) || filteredInvoices[0] || db.invoices[0];

  // Financial KPI totals
  const totalBilledUSD = db.invoices.reduce((sum, inv) => sum + inv.totalUSD, 0);
  const totalCollectedUSD = db.receipts.reduce((sum, rcpt) => sum + rcpt.amountUSD, 0);
  const totalOutstandingUSD = db.invoices.reduce((sum, inv) => sum + (inv.balanceUSD || 0), 0);
  const collectionRatio = totalBilledUSD > 0 ? ((totalCollectedUSD / totalBilledUSD) * 100).toFixed(1) : '100';

  // Helper for Service Category Icon & Color
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'CONSULTATION':
        return { label: 'Consultation', icon: Stethoscope, color: 'text-sky-800 bg-sky-50 border-sky-200' };
      case 'LABORATORY':
        return { label: 'Lab Test', icon: Microscope, color: 'text-purple-800 bg-purple-50 border-purple-200' };
      case 'IMAGING':
        return { label: 'Radiology Scan', icon: Scan, color: 'text-indigo-800 bg-indigo-50 border-indigo-200' };
      case 'PHARMACY':
        return { label: 'Pharmacy Med', icon: Pill, color: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
      case 'BED_ACCOMMODATION':
        return { label: 'Inpatient Bed', icon: Bed, color: 'text-amber-800 bg-amber-50 border-amber-200' };
      case 'PROCEDURE':
      case 'NURSING':
        return { label: 'Clinical Procedure', icon: Scissors, color: 'text-teal-800 bg-teal-50 border-teal-200' };
      default:
        return { label: category, icon: FileText, color: 'text-slate-800 bg-slate-50 border-slate-200' };
    }
  };

  // Handle Cashier Payment Process
  const handleProcessPayment = () => {
    if (!selectedInvoice) return;

    const remainingBal = selectedInvoice.balanceUSD > 0 ? selectedInvoice.balanceUSD : selectedInvoice.totalUSD;
    const enteredUSD = paymentAmountUSD ? parseFloat(paymentAmountUSD) : remainingBal;
    
    if (enteredUSD <= 0 || isNaN(enteredUSD)) {
      alert('Please enter a valid payment amount.');
      return;
    }

    const payUSD = Math.min(enteredUSD, remainingBal);
    const payLRD = payUSD * LRD_PER_USD;
    const newBalUSD = remainingBal - payUSD;
    const newBalLRD = newBalUSD * LRD_PER_USD;

    const receiptNumber = `RCPT-${new Date().getFullYear()}-${String(db.receipts.length + 814).padStart(5, '0')}`;

    const newReceipt: PaymentReceipt = {
      id: `RCPT-${Date.now()}`,
      receiptNumber,
      invoiceId: selectedInvoice.id,
      invoiceNumber: selectedInvoice.invoiceNumber,
      patientId: selectedInvoice.patientId,
      patientMrn: selectedInvoice.patientMrn,
      patientName: selectedInvoice.patientName,
      amountUSD: payUSD,
      amountLRD: payLRD,
      currencyPaid: paymentCurrency,
      paymentMethod,
      paymentReference: paymentReference || undefined,
      cashierName: currentUser.fullName,
      timestamp: new Date().toISOString(),
      verificationQrPayload: `JJM:RCPT:${receiptNumber}:USD${payUSD.toFixed(2)}:${selectedInvoice.patientMrn}:MOH_OFFICIAL_VERIFIED`,
      notes: paymentNotes || `Collected at VOA East Hospital Cashier Desk via ${paymentMethod} (${paymentCurrency}).`,
    };

    updateDatabaseState(draft => {
      draft.receipts.unshift(newReceipt);
      const inv = draft.invoices.find(i => i.id === selectedInvoice.id);
      if (inv) {
        inv.amountPaidUSD = (inv.amountPaidUSD || 0) + payUSD;
        inv.amountPaidLRD = (inv.amountPaidLRD || 0) + payLRD;
        inv.balanceUSD = newBalUSD;
        inv.balanceLRD = newBalLRD;
        inv.status = newBalUSD <= 0.01 ? 'PAID' : 'PARTIALLY_PAID';
      }
    });

    // Auto-post balanced journal to double-entry General Ledger
    postCashierPaymentToGL({
      receipt: newReceipt,
      invoice: selectedInvoice,
      cashierName: currentUser.fullName,
    });

    logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'COLLECT_PAYMENT',
      module: 'BILLING',
      patientId: selectedInvoice.patientId,
      patientMrn: selectedInvoice.patientMrn,
      resourceId: receiptNumber,
      details: `Collected ${paymentCurrency} payment for invoice ${selectedInvoice.invoiceNumber} ($${payUSD} / LRD ${payLRD.toLocaleString()}) via ${paymentMethod}. Receipt ${receiptNumber} generated.`,
      ipAddress: 'Billing & Cashier Terminal 01',
      status: 'SUCCESS',
    });

    setActiveReceiptForModal(newReceipt);
    setPaymentAmountUSD('');
    setPaymentReference('');
    setPaymentNotes('');
  };

  // Handle New Invoice Creation
  const handleCreateNewInvoice = (isDraft: boolean) => {
    const patient = db.patients.find(p => p.id === newInvPatientId) || db.patients[0];
    if (!patient) return;

    if (newInvItems.length === 0) {
      alert('Please add at least one medical service to the invoice.');
      return;
    }

    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(db.invoices.length + 457).padStart(5, '0')}`;
    
    const lineItems: InvoiceLineItem[] = newInvItems.map((item, idx) => {
      const charge = db.charges.find(c => c.id === item.chargeItemId) || db.charges[0];
      const qty = item.quantity || 1;
      const totalUSD = charge.priceUSD * qty;
      const totalLRD = charge.priceLRD * qty;
      return {
        id: `LNE-${Date.now()}-${idx}`,
        chargeItemId: charge.id,
        description: charge.description,
        category: charge.category,
        quantity: qty,
        unitPriceUSD: charge.priceUSD,
        unitPriceLRD: charge.priceLRD,
        totalUSD,
        totalLRD,
      };
    });

    const subtotalUSD = lineItems.reduce((acc, it) => acc + it.totalUSD, 0);
    const subtotalLRD = subtotalUSD * LRD_PER_USD;

    let insuranceShareUSD = 0;
    let patientShareUSD = subtotalUSD;

    if (newInvInsuranceCoverage > 0) {
      insuranceShareUSD = (subtotalUSD * newInvInsuranceCoverage) / 100;
      patientShareUSD = subtotalUSD - insuranceShareUSD;
    }

    const newInvoice: Invoice = {
      id: `INV-${Date.now()}`,
      invoiceNumber,
      patientId: patient.id,
      patientMrn: patient.mrn,
      patientName: `${patient.firstName} ${patient.lastName}`,
      date: new Date().toISOString().split('T')[0],
      items: lineItems,
      subtotalUSD,
      subtotalLRD,
      discountUSD: 0,
      discountLRD: 0,
      totalUSD: subtotalUSD,
      totalLRD: subtotalLRD,
      status: isDraft ? 'DRAFT' : 'POSTED',
      settlementCurrency: 'USD',
      amountPaidUSD: 0,
      amountPaidLRD: 0,
      balanceUSD: subtotalUSD,
      balanceLRD: subtotalLRD,
      insuranceShareUSD: insuranceShareUSD > 0 ? insuranceShareUSD : undefined,
      patientShareUSD: insuranceShareUSD > 0 ? patientShareUSD : undefined,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.fullName,
    };

    updateDatabaseState(draft => {
      draft.invoices.unshift(newInvoice);
    });

    if (!isDraft) {
      postInvoiceBillingToGL({
        invoice: newInvoice,
        billingOfficer: currentUser.fullName,
      });
    }

    logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'CREATE',
      module: 'BILLING',
      patientId: patient.id,
      patientMrn: patient.mrn,
      resourceId: invoiceNumber,
      details: `Created invoice ${invoiceNumber} for ${patient.firstName} ${patient.lastName} ($${subtotalUSD.toFixed(2)}) linking ${lineItems.length} services. Status: ${newInvoice.status}.`,
      ipAddress: 'Billing & Cashier Terminal 01',
      status: 'SUCCESS',
    });

    setSelectedInvoiceId(newInvoice.id);
    setActiveTab('invoices');
  };

  // Handle Refund / Credit Note Request
  const handleRequestRefund = () => {
    if (!selectedInvoice) return;
    const creditNoteNo = `CRN-${new Date().getFullYear()}-${String(db.creditNotes.length + 43).padStart(5, '0')}`;

    updateDatabaseState(draft => {
      draft.creditNotes.unshift({
        id: `CRN-${Date.now()}`,
        creditNoteNumber: creditNoteNo,
        originalInvoiceId: selectedInvoice.id,
        originalInvoiceNumber: selectedInvoice.invoiceNumber,
        patientMrn: selectedInvoice.patientMrn,
        patientName: selectedInvoice.patientName,
        amountUSD: selectedInvoice.balanceUSD > 0 ? selectedInvoice.balanceUSD : selectedInvoice.totalUSD,
        amountLRD: (selectedInvoice.balanceUSD > 0 ? selectedInvoice.balanceUSD : selectedInvoice.totalUSD) * LRD_PER_USD,
        reason: refundReason,
        requestedBy: currentUser.fullName,
        status: 'PENDING_APPROVAL',
        createdAt: new Date().toISOString(),
      });
    });

    logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'REFUND',
      module: 'BILLING',
      patientId: selectedInvoice.patientId,
      patientMrn: selectedInvoice.patientMrn,
      resourceId: creditNoteNo,
      details: `Credit Note / Waiver ${creditNoteNo} submitted for Invoice ${selectedInvoice.invoiceNumber}. Pending Finance & Medical Director approval.`,
      ipAddress: 'Billing & Cashier Terminal 01',
      status: 'FLAGGED',
    });

    setShowRefundModal(false);
    alert(`Credit Note / Waiver Request ${creditNoteNo} logged for supervisor approval.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold text-slate-900 text-base">Billing & Invoicing Workstation</h2>
            <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded">
              ERP FINANCE DESK
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Patient Payments, Official Receipts, Service-Linked Billing & Dual-Currency Settlement (USD & LRD)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg font-mono">
            Official Rate: <strong className="text-slate-900">1 USD = {LRD_PER_USD.toFixed(2)} LRD</strong>
          </div>
          <button
            onClick={() => setActiveTab('new_invoice')}
            className="bg-teal-800 hover:bg-teal-900 text-white font-medium text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate Patient Invoice</span>
          </button>
        </div>
      </div>

      {/* Financial Metric KPI Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Billed (All Invoices)</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-xl font-extrabold text-slate-900 font-mono tabular-nums">
            ${totalBilledUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            LRD {(totalBilledUSD * LRD_PER_USD).toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Collected Cash & MoMo</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-xl font-extrabold text-emerald-800 font-mono tabular-nums">
            ${totalCollectedUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            LRD {(totalCollectedUSD * LRD_PER_USD).toLocaleString()} · {collectionRatio}% rate
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Outstanding Receivables</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-xl font-extrabold text-amber-700 font-mono tabular-nums">
            ${totalOutstandingUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            LRD {(totalOutstandingUSD * LRD_PER_USD).toLocaleString()} pending
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Official Receipts Issued</span>
            <Receipt className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 text-xl font-extrabold text-slate-900 font-mono tabular-nums">
            {db.receipts.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Verified with QR Audit Codes
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'invoices'
              ? 'text-teal-800 border-b-2 border-teal-800 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Patient Invoices & Settlements ({db.invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('new_invoice')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'new_invoice'
              ? 'text-teal-800 border-b-2 border-teal-800 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          + Link Services & New Invoice
        </button>
        <button
          onClick={() => setActiveTab('receipts')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'receipts'
              ? 'text-teal-800 border-b-2 border-teal-800 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Payment Receipts Archive ({db.receipts.length})
        </button>
      </div>

      {/* TAB 1: INVOICES & CASHIER DESK */}
      {activeTab === 'invoices' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Invoices List with Search & Status Filters (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs">Patient Invoices Registry</h3>
              <span className="text-[11px] text-slate-500 font-mono">{filteredInvoices.length} found</span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by invoice #, patient, or MRN..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden focus:border-teal-700"
              />
            </div>

            {/* Status Filter Badges */}
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {(['ALL', 'POSTED', 'PARTIALLY_PAID', 'PAID', 'DRAFT'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    statusFilter === st
                      ? 'bg-teal-800 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Invoices Scroll List */}
            <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
              {filteredInvoices.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  No invoices matching filter criteria.
                </div>
              ) : (
                filteredInvoices.map(inv => {
                  const isSelected = inv.id === selectedInvoice?.id;
                  const isPaid = inv.status === 'PAID';
                  const isPartial = inv.status === 'PARTIALLY_PAID';
                  return (
                    <div
                      key={inv.id}
                      onClick={() => setSelectedInvoiceId(inv.id)}
                      className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-teal-50/70 border-teal-500 shadow-xs'
                          : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-teal-900">{inv.invoiceNumber}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                          isPaid 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : isPartial 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 text-xs">{inv.patientName}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{inv.patientMrn} · {inv.date}</div>
                      
                      <div className="text-[11px] text-slate-600 mt-2 pt-2 border-t border-slate-200/60 flex justify-between font-mono">
                        <span>Total: <strong>${inv.totalUSD.toFixed(2)}</strong></span>
                        <span className={inv.balanceUSD > 0 ? 'text-amber-800 font-bold' : 'text-emerald-700'}>
                          Bal: ${inv.balanceUSD.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Invoice Details, Linked Medical Services & Cashier POS (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
            {selectedInvoice ? (
              <div className="space-y-5">
                {/* Header Information */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{selectedInvoice.invoiceNumber}</h3>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded font-mono ${
                        selectedInvoice.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedInvoice.status === 'PARTIALLY_PAID'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {selectedInvoice.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Patient: <strong className="text-slate-900">{selectedInvoice.patientName}</strong> ({selectedInvoice.patientMrn})
                    </p>
                  </div>

                  <div className="text-right text-xs text-slate-500">
                    <div>Issued: <strong className="font-mono text-slate-700">{selectedInvoice.date}</strong></div>
                    <div className="text-[11px]">Billed by: {selectedInvoice.createdBy}</div>
                  </div>
                </div>

                {/* Linked Medical Services Table */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-800">Linked Medical Services & Items ({selectedInvoice.items.length})</h4>
                    <span className="text-[11px] text-slate-400 font-mono">MoH Standard Charge Master</span>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                        <tr>
                          <th className="p-2.5">Medical Service / Drug</th>
                          <th className="p-2.5">Service Category</th>
                          <th className="p-2.5 text-center">Qty</th>
                          <th className="p-2.5 text-right font-mono">Unit Price</th>
                          <th className="p-2.5 text-right font-mono">Total (USD)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedInvoice.items.map(item => {
                          const badge = getCategoryBadge(item.category);
                          const Icon = badge.icon;
                          return (
                            <tr key={item.id} className="hover:bg-slate-50/50">
                              <td className="p-2.5 font-medium text-slate-800">
                                <div>{item.description}</div>
                                {item.sourceEncounterId && (
                                  <span className="text-[10px] text-slate-400 font-mono">Encounter: {item.sourceEncounterId}</span>
                                )}
                              </td>
                              <td className="p-2.5">
                                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border ${badge.color}`}>
                                  <Icon className="w-3 h-3" />
                                  <span>{badge.label}</span>
                                </span>
                              </td>
                              <td className="p-2.5 text-center text-slate-700 font-mono">{item.quantity}</td>
                              <td className="p-2.5 text-right text-slate-600 font-mono">${item.unitPriceUSD.toFixed(2)}</td>
                              <td className="p-2.5 text-right font-bold text-slate-900 font-mono">${item.totalUSD.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Subtotals & Dual-Currency Summary */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Invoice Financial Summary</span>
                    <div className="text-slate-700 mt-1 space-y-1">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="font-mono font-semibold">${selectedInvoice.subtotalUSD.toFixed(2)}</span>
                      </div>
                      {selectedInvoice.insuranceShareUSD ? (
                        <div className="flex justify-between text-teal-800">
                          <span>Insurance Covered Share:</span>
                          <span className="font-mono font-semibold">-${selectedInvoice.insuranceShareUSD.toFixed(2)}</span>
                        </div>
                      ) : null}
                      <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                        <span>Total Payable:</span>
                        <span className="font-mono">${selectedInvoice.totalUSD.toFixed(2)}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 text-right font-mono">
                        LRD {selectedInvoice.totalLRD.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
                    <div>
                      <span className="text-slate-500 text-[11px]">Settlement Status</span>
                      <div className="flex justify-between items-baseline mt-1">
                        <span className="text-slate-700">Amount Paid:</span>
                        <span className="font-mono font-bold text-emerald-700">${selectedInvoice.amountPaidUSD.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-slate-700">Balance Due:</span>
                        <span className="font-mono font-extrabold text-amber-800 text-sm">${selectedInvoice.balanceUSD.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-2 pt-2 border-t border-slate-100 flex justify-between">
                      <span>Liberian Dollar Balance:</span>
                      <strong>LRD {selectedInvoice.balanceLRD.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                {/* Cashier Payment Collection Controls */}
                {selectedInvoice.balanceUSD > 0.01 ? (
                  <div className="bg-teal-50/40 p-4 rounded-xl border border-teal-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-teal-700" />
                        <span>Accept Payment & Generate Official Receipt</span>
                      </h4>
                      <span className="text-[10px] text-teal-700 font-mono font-bold">Auto-posts to General Ledger</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Amount to Pay (USD $)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder={`Full ($${selectedInvoice.balanceUSD.toFixed(2)})`}
                          value={paymentAmountUSD}
                          onChange={e => setPaymentAmountUSD(e.target.value)}
                          className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white font-mono focus:outline-hidden focus:border-teal-700"
                        />
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          Leave blank for full balance
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Settlement Currency
                        </label>
                        <select
                          value={paymentCurrency}
                          onChange={e => setPaymentCurrency(e.target.value as any)}
                          className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white focus:outline-hidden focus:border-teal-700"
                        >
                          <option value="USD">United States Dollar (USD $)</option>
                          <option value="LRD">Liberian Dollar (LRD $ · rate 195)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Payment Channel
                        </label>
                        <select
                          value={paymentMethod}
                          onChange={e => setPaymentMethod(e.target.value as any)}
                          className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white focus:outline-hidden focus:border-teal-700"
                        >
                          <option value="CASH">Physical Cash (Hospital Vault)</option>
                          <option value="MTN_MOMO">Lonestar MTN Mobile Money</option>
                          <option value="ORANGE_MONEY">Orange Money Liberia</option>
                          <option value="BANK_TRANSFER">Bank Wire / Ecobank Liberia</option>
                          <option value="CARD">Visa / Mastercard POS Terminal</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          placeholder="Transaction Reference / MoMo Confirmation Code..."
                          value={paymentReference}
                          onChange={e => setPaymentReference(e.target.value)}
                          className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white focus:outline-hidden focus:border-teal-700"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Cashier Desk Notes (Optional)..."
                          value={paymentNotes}
                          onChange={e => setPaymentNotes(e.target.value)}
                          className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white focus:outline-hidden focus:border-teal-700"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-teal-200/80">
                      <button
                        type="button"
                        onClick={() => setShowRefundModal(true)}
                        className="text-xs text-rose-700 hover:text-rose-900 font-semibold cursor-pointer"
                      >
                        Request Fee Waiver / Credit Note
                      </button>

                      <button
                        type="button"
                        onClick={handleProcessPayment}
                        className="bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-xs px-5 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
                      >
                        <DollarSign className="w-4 h-4" />
                        <span>Accept & Issue Official Receipt</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-900 text-xs font-semibold">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>This invoice is fully settled. No outstanding balance.</span>
                    </div>
                    <button
                      onClick={() => {
                        const rcpt = db.receipts.find(r => r.invoiceId === selectedInvoice.id);
                        if (rcpt) setActiveReceiptForModal(rcpt);
                        else alert('Receipt generated upon collection.');
                      }}
                      className="text-xs bg-emerald-800 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-900 transition-colors cursor-pointer"
                    >
                      View Receipt
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 text-xs text-slate-400">
                Select an invoice from the registry on the left.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CREATE INVOICE & LINK MEDICAL SERVICES */}
      {activeTab === 'new_invoice' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6 max-w-4xl mx-auto">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-extrabold text-slate-900 text-base">Generate New Patient Invoice</h3>
            <p className="text-xs text-slate-500">
              Bundle consultations, lab tests, radiology imaging, medications, or bed stay into a formal billing invoice
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Patient *</label>
              <select
                value={newInvPatientId}
                onChange={e => setNewInvPatientId(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-hidden focus:border-teal-700"
              >
                {db.patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} ({p.mrn}) · {p.gender} · {p.phone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Insurance Coverage % (Optional Co-Pay Split)
              </label>
              <select
                value={newInvInsuranceCoverage}
                onChange={e => setNewInvInsuranceCoverage(parseInt(e.target.value) || 0)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-hidden focus:border-teal-700"
              >
                <option value="0">Self-Pay / Cash Patient (0% Insurance)</option>
                <option value="85">Activa International Corporate (85% Covered / 15% Co-pay)</option>
                <option value="80">Liberia National Social Security (80% Covered)</option>
                <option value="100">MoH Maternal & Child Exemption (100% Subsidized)</option>
              </select>
            </div>
          </div>

          {/* Line Items Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800">Billable Medical Services & Fees</h4>
              <button
                type="button"
                onClick={() => setNewInvItems([...newInvItems, { chargeItemId: db.charges[0]?.id || 'SRV-001', quantity: 1 }])}
                className="text-xs text-teal-800 hover:text-teal-900 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Medical Service</span>
              </button>
            </div>

            <div className="space-y-2">
              {newInvItems.map((item, idx) => {
                const charge = db.charges.find(c => c.id === item.chargeItemId) || db.charges[0];
                return (
                  <div key={idx} className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex-1 w-full sm:w-auto">
                      <label className="block text-[10px] text-slate-500 font-medium mb-1">Service from Charge Master</label>
                      <select
                        value={item.chargeItemId}
                        onChange={e => {
                          const updated = [...newInvItems];
                          updated[idx].chargeItemId = e.target.value;
                          setNewInvItems(updated);
                        }}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white focus:outline-hidden"
                      >
                        {db.charges.map(c => (
                          <option key={c.id} value={c.id}>
                            [{c.category}] {c.description} — ${c.priceUSD.toFixed(2)} (LRD {c.priceLRD.toLocaleString()})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full sm:w-24">
                      <label className="block text-[10px] text-slate-500 font-medium mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => {
                          const updated = [...newInvItems];
                          updated[idx].quantity = parseInt(e.target.value) || 1;
                          setNewInvItems(updated);
                        }}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white text-center font-mono focus:outline-hidden"
                      />
                    </div>

                    <div className="w-full sm:w-32 text-right">
                      <span className="block text-[10px] text-slate-500 font-medium mb-1">Line Total</span>
                      <div className="text-xs font-mono font-bold text-slate-900 pt-1">
                        ${(charge.priceUSD * (item.quantity || 1)).toFixed(2)}
                      </div>
                    </div>

                    {newInvItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setNewInvItems(newInvItems.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Computed Totals Preview */}
          {(() => {
            const subtotal = newInvItems.reduce((acc, it) => {
              const ch = db.charges.find(c => c.id === it.chargeItemId) || db.charges[0];
              return acc + (ch.priceUSD * (it.quantity || 1));
            }, 0);
            const insPart = (subtotal * newInvInsuranceCoverage) / 100;
            const patientPart = subtotal - insPart;

            return (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div>
                  <span className="text-slate-500">Gross Subtotal: </span>
                  <strong className="text-slate-900 font-mono">${subtotal.toFixed(2)}</strong>
                  {newInvInsuranceCoverage > 0 && (
                    <span className="text-teal-800 ml-2">
                      (Insurance: ${insPart.toFixed(2)} · Patient: ${patientPart.toFixed(2)})
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-base font-extrabold text-slate-900 font-mono">
                    Total USD: ${subtotal.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    LRD {(subtotal * LRD_PER_USD).toLocaleString()} (Exchange Rate: 195)
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('invoices')}
              className="text-xs text-slate-600 hover:text-slate-900 px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleCreateNewInvoice(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleCreateNewInvoice(false)}
              className="bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold px-5 py-2 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Post Invoice & Settle
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: PAYMENT RECEIPTS ARCHIVE */}
      {activeTab === 'receipts' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Official Payment Receipts Log</h3>
              <p className="text-xs text-slate-500">
                Audited proof of revenue collection with cryptographic verification signatures
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">{db.receipts.length} Issued Receipts</span>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="p-3">Receipt #</th>
                  <th className="p-3">Invoice Ref</th>
                  <th className="p-3">Patient (MRN)</th>
                  <th className="p-3">Payment Channel</th>
                  <th className="p-3 text-right font-mono">Amount (USD)</th>
                  <th className="p-3 text-right font-mono">Amount (LRD)</th>
                  <th className="p-3">Cashier</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {db.receipts.map(rcpt => (
                  <tr key={rcpt.id} className="hover:bg-slate-50/60">
                    <td className="p-3 font-mono font-bold text-teal-900">{rcpt.receiptNumber}</td>
                    <td className="p-3 font-mono text-slate-600">{rcpt.invoiceNumber}</td>
                    <td className="p-3">
                      <div className="font-medium text-slate-900">{rcpt.patientName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{rcpt.patientMrn}</div>
                    </td>
                    <td className="p-3">
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono text-[10px]">
                        {rcpt.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-800">
                      ${rcpt.amountUSD.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-600">
                      {rcpt.amountLRD.toLocaleString()}
                    </td>
                    <td className="p-3 text-slate-600">
                      <div>{rcpt.cashierName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {new Date(rcpt.timestamp).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setActiveReceiptForModal(rcpt)}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-medium px-2.5 py-1 rounded-md inline-flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PROFESSIONAL PRINTABLE OFFICIAL RECEIPT MODAL */}
      {activeReceiptForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 no-print">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>MoH Verified Patient Payment Receipt</span>
              </span>
              <button
                onClick={() => setActiveReceiptForModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PRINTABLE SLIP CONTAINER */}
            <div className="border-2 border-slate-900 rounded-xl p-5 bg-white space-y-4 shadow-xs font-sans">
              {/* Hospital Official Letterhead */}
              <div className="text-center pb-3 border-b-2 border-dashed border-slate-300">
                <span className="font-extrabold text-sm text-slate-900 block tracking-tight">
                  J & J MEMORIAL e-HOSPITAL
                </span>
                <span className="text-[10px] text-slate-600 block">
                  VOA East Community, Monrovia, Montserrado County, Liberia
                </span>
                <span className="text-[10px] text-slate-500 block">
                  MoH License: MOH-2026-HOSP-004 · Taxpayer Identification: 104-JJM-LR
                </span>
                <div className="mt-2 inline-block bg-teal-50 border border-teal-300 px-3 py-0.5 rounded text-xs font-mono font-bold text-teal-900">
                  RECEIPT #{activeReceiptForModal.receiptNumber}
                </div>
              </div>

              {/* Receipt Metadata */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient Name:</span>
                  <span className="font-bold text-slate-900">{activeReceiptForModal.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient MRN:</span>
                  <span className="font-mono font-semibold text-slate-800">{activeReceiptForModal.patientMrn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice Reference:</span>
                  <span className="font-mono text-slate-800">{activeReceiptForModal.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Time:</span>
                  <span className="font-mono text-slate-700">
                    {new Date(activeReceiptForModal.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Channel:</span>
                  <span className="font-bold text-slate-900">
                    {activeReceiptForModal.paymentMethod} ({activeReceiptForModal.currencyPaid})
                  </span>
                </div>
                {activeReceiptForModal.paymentReference && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Txn Ref:</span>
                    <span className="font-mono text-teal-800">{activeReceiptForModal.paymentReference}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Attending Cashier:</span>
                  <span className="text-slate-800 font-medium">{activeReceiptForModal.cashierName}</span>
                </div>
              </div>

              {/* Amount Breakdown */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-900">Amount Paid (USD):</span>
                  <span className="text-base font-extrabold text-emerald-800 font-mono">
                    ${activeReceiptForModal.amountUSD.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 text-[11px] pt-1 border-t border-slate-200">
                  <span>Equivalent in Liberian Dollars (LRD):</span>
                  <span className="font-mono font-bold">
                    LRD {activeReceiptForModal.amountLRD.toLocaleString()}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono text-right">
                  Settled at Central Cashier Desk · GL Synchronized
                </div>
              </div>

              {/* Verification QR Signature */}
              <div className="pt-3 border-t-2 border-dashed border-slate-300 text-center space-y-2">
                <div className="font-mono text-[10px] bg-slate-100 p-2 rounded text-slate-700 break-all select-all border border-slate-200">
                  {activeReceiptForModal.verificationQrPayload}
                </div>
                <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500">
                  <QrCode className="w-3.5 h-3.5 text-teal-800" />
                  <span>Scan QR Code at VOA East Gate/Discharge Desk to verify authenticity</span>
                </div>
              </div>

              {/* Sign-off Stamps */}
              <div className="pt-4 grid grid-cols-2 gap-4 text-center text-[10px] text-slate-500">
                <div className="border-t border-slate-300 pt-1">
                  <span>Authorized Cashier Signature</span>
                </div>
                <div className="border-t border-slate-300 pt-1">
                  <span>Official Hospital Stamp</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 no-print">
              <button
                type="button"
                onClick={() => setActiveReceiptForModal(null)}
                className="text-xs text-slate-600 hover:text-slate-900 px-3 py-2 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-5 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credit Note / Waiver Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base">Request Fee Waiver / Credit Note</h3>
            <p className="text-xs text-slate-600">
              Credit notes adjust posted invoices for clinical indigent exemptions, duplicate charge reversals, or donor subsidies.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Invoice Target</label>
                <input
                  type="text"
                  disabled
                  value={`${selectedInvoice?.invoiceNumber} (${selectedInvoice?.patientName})`}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-100 font-mono text-slate-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Waiver / Credit Justification *</label>
                <textarea
                  rows={3}
                  value={refundReason}
                  onChange={e => setRefundReason(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-hidden focus:border-teal-700 text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowRefundModal(false)}
                className="text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequestRefund}
                className="bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold px-5 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Submit for Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
