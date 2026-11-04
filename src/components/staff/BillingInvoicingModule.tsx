import React, { useState, useEffect } from 'react';
import { dbStore } from '../../services/dbStore';
import { Invoice } from '../../types';
import { Receipt, Printer, CheckCircle2, ShieldCheck, CreditCard, DollarSign, QrCode } from 'lucide-react';

export const BillingInvoicingModule: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    const update = () => {
      const invs = dbStore.getInvoices();
      setInvoices(invs);
      if (!selectedInvoice && invs.length > 0) {
        setSelectedInvoice(invs[0]);
      }
    };
    update();
    return dbStore.subscribe(update);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const active = selectedInvoice || invoices[0];

  return (
    <div className="space-y-6">
      {/* On-Screen Header (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 no-print">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <Receipt className="w-3.5 h-3.5" />
            <span>Revenue Cycle & Cashier Management</span>
          </div>
          <h2 className="text-2xl font-extrabold text-hospital-navy mt-1">
            Billing & Official Receipt Generation
          </h2>
          <p className="text-xs text-slate-500">
            Generate itemized patient invoices and professional branded receipts formatted for high-contrast thermal and laser printing.
          </p>
        </div>

        {active && (
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Receipt</span>
          </button>
        )}
      </div>

      {/* On-Screen Invoices List & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 no-print">
        {/* Invoices List (Col 4) */}
        <div className="lg:col-span-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Issued Invoices ({invoices.length})
          </h4>

          <div className="space-y-3">
            {invoices.map((inv) => {
              const isSelected = active?.id === inv.id;
              return (
                <div
                  key={inv.id}
                  onClick={() => setSelectedInvoice(inv)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-teal-50/80 border-teal-500 ring-1 ring-teal-500 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-slate-800">
                      {inv.invoiceNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      inv.status === 'Paid'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {inv.status}
                    </span>
                  </div>

                  <h5 className="font-bold text-slate-900 text-sm">
                    {inv.patientName}
                  </h5>

                  <div className="mt-2 text-xs text-slate-600 flex items-center justify-between">
                    <span>MRN: {inv.mrn}</span>
                    <span className="font-mono font-bold text-hospital-navy text-sm">
                      ${inv.totalUSD.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* On-Screen Interactive Preview (Col 8) */}
        <div className="lg:col-span-8">
          {active ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <span className="text-xs font-mono text-slate-400">Invoice Ref</span>
                  <h3 className="text-xl font-black text-hospital-navy">
                    {active.invoiceNumber}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400">Total Billed</span>
                  <div className="text-2xl font-black text-teal-600">
                    ${active.totalUSD.toFixed(2)} USD
                  </div>
                </div>
              </div>

              {/* Patient Info Header */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 font-semibold block">Patient Name</span>
                  <strong className="text-slate-800">{active.patientName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Medical Record No.</span>
                  <strong className="font-mono text-slate-800">{active.mrn}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Billing Date</span>
                  <strong className="text-slate-800">{active.date}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Payment Method</span>
                  <strong className="text-teal-700">{active.paymentMethod || 'Cash'}</strong>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Itemized Hospital Services & Medications
                </h5>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Service Description</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Unit Price</th>
                        <th className="py-2.5 px-3 text-right">Amount (USD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {active.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">
                            {item.description}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                            {item.category}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono">
                            {item.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                            ${item.unitPriceUSD.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            ${item.totalUSD.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals & Cashier Signature */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-4 border-t border-slate-200">
                <div className="space-y-1 text-xs text-slate-500">
                  <div>Authorized Cashier: <strong>{active.cashierName || 'Lead Cashier Desk'}</strong></div>
                  <div className="font-mono text-[10px] text-slate-400">Receipt Hash: {active.receiptHash}</div>
                </div>

                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono">${active.subtotalUSD.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Discount:</span>
                    <span className="font-mono">-${active.discountUSD.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-hospital-navy pt-2 border-t border-slate-200">
                    <span>Total Amount:</span>
                    <span className="font-mono text-teal-600">${active.totalUSD.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Amount Paid:</span>
                    <span className="font-mono">${active.paidAmountUSD.toFixed(2)}</span>
                  </div>
                  {active.balanceUSD > 0 && (
                    <div className="flex justify-between text-rose-600 font-bold">
                      <span>Remaining Balance:</span>
                      <span className="font-mono">${active.balanceUSD.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center border border-dashed rounded-2xl text-slate-400 text-xs">
              Select an invoice from the list.
            </div>
          )}
        </div>
      </div>

      {/* SPECIALIZED CSS PRINT RECEIPT (#22) */}
      {/* This section will automatically take over the page when window.print() is executed */}
      {active && (
        <div className="receipt-print-container hidden print:block font-sans">
          {/* Header */}
          <div className="border-b-2 border-black pb-4 text-center space-y-1">
            <h1 className="text-2xl font-black uppercase tracking-tight">
              J & J MEMORIAL HEALTH CENTER
            </h1>
            <p className="text-xs">
              Oldest Congo Town, Tubman Blvd, Monrovia, Republic of Liberia
            </p>
            <p className="text-xs font-mono">
              Tel: +231 77 900 1122 / +231 88 091 1911 &bull; info@jjmemorial.totag.network
            </p>
            <div className="mt-2 text-sm font-extrabold uppercase tracking-wider inline-block px-4 py-1 border border-black">
              OFFICIAL CASHIER PAYMENT RECEIPT
            </div>
          </div>

          {/* Receipt Info & Patient Details */}
          <div className="grid grid-cols-2 gap-4 py-4 text-xs border-b border-black">
            <div>
              <p><strong>Receipt Number:</strong> {active.invoiceNumber}</p>
              <p><strong>Date & Time:</strong> {active.date} 14:40 GMT</p>
              <p><strong>Payment Channel:</strong> {active.paymentMethod || 'Cash'}</p>
            </div>
            <div>
              <p><strong>Patient Name:</strong> {active.patientName}</p>
              <p><strong>Medical Record No:</strong> {active.mrn}</p>
              <p><strong>Cashier Station:</strong> {active.cashierName || 'Beatrice Flomo, Cashier'}</p>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="w-full receipt-table text-left text-xs my-4">
            <thead>
              <tr className="border-b-2 border-black font-bold uppercase">
                <th className="py-2">Item / Clinical Service</th>
                <th className="py-2">Department</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Rate</th>
                <th className="py-2 text-right">Total (USD)</th>
              </tr>
            </thead>
            <tbody>
              {active.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-300">
                  <td className="py-2">{item.description}</td>
                  <td className="py-2">{item.category}</td>
                  <td className="py-2 text-center">{item.quantity}</td>
                  <td className="py-2 text-right">${item.unitPriceUSD.toFixed(2)}</td>
                  <td className="py-2 text-right font-bold">${item.totalUSD.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Financial Summary */}
          <div className="flex justify-end my-4">
            <div className="w-64 text-xs space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${active.subtotalUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Waiver / Discount:</span>
                <span>-${active.discountUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-black pt-1">
                <span>TOTAL AMOUNT:</span>
                <span>${active.totalUSD.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>AMOUNT TENDERED:</span>
                <span>${active.paidAmountUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>BALANCE REMAINING:</span>
                <span>${active.balanceUSD.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Verification Hash & Signatures */}
          <div className="pt-8 border-t border-black grid grid-cols-2 gap-8 text-xs">
            <div>
              <p className="font-mono text-[10px]">
                Cryptographic Receipt Seal: <br />
                {active.receiptHash}
              </p>
              <p className="text-[10px] mt-2 italic">
                Valid for official reimbursement and tax claims. Keep this receipt for your records.
              </p>
            </div>
            <div className="text-right space-y-8">
              <div className="border-b border-dotted border-black w-48 ml-auto"></div>
              <p className="font-bold text-xs uppercase">Authorized Hospital Cashier Stamp & Signature</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
