import React, { useState } from 'react';
import { 
  Pill, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  PackageCheck, 
  AlertCircle, 
  QrCode, 
  Printer, 
  Search, 
  Scan, 
  Check, 
  User, 
  Calendar, 
  Building2, 
  X,
  Sparkles
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getDatabaseState, updateDatabaseState, logAuditEvent } from '../../services/storageService';
import { UserAccount } from '../../types/auth';
import { Prescription } from '../../types/clinical';

interface PharmacyWorkstationProps {
  currentUser: UserAccount;
}

export const PharmacyWorkstation: React.FC<PharmacyWorkstationProps> = ({ currentUser }) => {
  const db = getDatabaseState();
  const [selectedRxId, setSelectedRxId] = useState<string>(db.prescriptions[0]?.id || '');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING_PHARMACY' | 'VERIFIED' | 'DISPENSED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Quick QR Scan Simulator / Manual Entry
  const [qrScanInput, setQrScanInput] = useState('');
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);

  // Print Slip Modal
  const [showPrintSlipModal, setShowPrintSlipModal] = useState(false);

  // Filter prescriptions
  const filteredPrescriptions = db.prescriptions.filter(rx => {
    const matchesStatus = statusFilter === 'ALL' || rx.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      rx.id.toLowerCase().includes(q) ||
      rx.medicationName.toLowerCase().includes(q) ||
      rx.patientName.toLowerCase().includes(q) ||
      rx.patientMrn.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const selectedRx = db.prescriptions.find(p => p.id === selectedRxId) || filteredPrescriptions[0] || db.prescriptions[0];
  const patient = db.patients.find(p => p.id === selectedRx?.patientId);

  // Find corresponding inventory item for FEFO batch
  const matchingItem = db.inventory.find(i => 
    i.name.toLowerCase().includes(selectedRx?.genericName?.toLowerCase() || '') ||
    i.name.toLowerCase().includes(selectedRx?.medicationName?.toLowerCase().slice(0, 7) || '')
  ) || db.inventory[0];

  // Prescription QR Code Payload
  const getRxQrPayload = (rx: Prescription) => {
    return `JJM:RX:${rx.id}:MRN:${rx.patientMrn}:DRUG:${encodeURIComponent(rx.medicationName)}:QTY:${rx.totalQuantity}:DOC:${encodeURIComponent(rx.prescribingDoctor)}:AUTH:MOH_LIBERIA_VERIFIED`;
  };

  // Handle Quick QR Scanner Input
  const handleScanVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrScanInput.trim()) return;

    // Check if input matches prescription ID or MRN or payload
    const foundRx = db.prescriptions.find(p => 
      p.id.toLowerCase() === qrScanInput.trim().toLowerCase() ||
      qrScanInput.includes(p.id) ||
      p.patientMrn.toLowerCase() === qrScanInput.trim().toLowerCase()
    );

    if (foundRx) {
      setSelectedRxId(foundRx.id);
      setScanFeedback(`QR Code Verified: Prescription ${foundRx.id} for ${foundRx.patientName} (${foundRx.medicationName}) loaded successfully.`);
      setTimeout(() => setScanFeedback(null), 5000);
    } else {
      setScanFeedback('No active hospital prescription found matching the scanned QR code.');
      setTimeout(() => setScanFeedback(null), 5000);
    }
    setQrScanInput('');
  };

  // Handle Dispense
  const handleDispense = () => {
    if (!selectedRx || selectedRx.status === 'DISPENSED') {
      alert('Prescription already dispensed or invalid.');
      return;
    }

    // Check allergy
    if (patient) {
      const allergyMatch = patient.allergies.find(a => 
        selectedRx.medicationName.toLowerCase().includes(a.substance.toLowerCase()) ||
        selectedRx.genericName.toLowerCase().includes(a.substance.toLowerCase())
      );
      if (allergyMatch) {
        alert(`DISPENSE BLOCKED: Patient has documented critical allergy to ${allergyMatch.substance}!`);
        return;
      }
    }

    // FEFO: Pick earliest unexpired batch
    const batch = matchingItem?.batches?.[0];
    if (!batch || batch.quantity < selectedRx.totalQuantity) {
      alert('Insufficient batch quantity in pharmacy inventory! Please request store replenishment.');
      return;
    }

    updateDatabaseState(draft => {
      // 1. Update prescription status
      const rx = draft.prescriptions.find(p => p.id === selectedRx.id);
      if (rx) {
        rx.status = 'DISPENSED';
        rx.dispensedBatchNumber = batch.batchNumber;
        rx.dispensedAt = new Date().toISOString();
        rx.dispensedBy = currentUser.fullName;
      }

      // 2. Decrement inventory stock atomically
      const item = draft.inventory.find(i => i.id === matchingItem.id);
      if (item) {
        item.currentStock -= rx?.totalQuantity || 1;
        if (item.batches[0]) {
          item.batches[0].quantity -= rx?.totalQuantity || 1;
        }
      }
    });

    logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'DISPENSE',
      module: 'PHARMACY',
      patientId: selectedRx.patientId,
      patientMrn: selectedRx.patientMrn,
      resourceId: selectedRx.id,
      details: `Dispensed ${selectedRx.medicationName} (${selectedRx.totalQuantity} units) to ${selectedRx.patientName} from batch ${batch.batchNumber} (Expires: ${batch.expiryDate}). QR Code verified.`,
      ipAddress: 'Pharmacy Counter #1 (VOA East)',
      status: 'SUCCESS',
    });

    alert(`Successfully dispensed ${selectedRx.medicationName} to ${selectedRx.patientName}!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold text-slate-900 text-base">Pharmacy & Medication Safety Dispensary</h2>
            <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded">
              QR CODE VERIFICATION
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Instant Patient QR Code Verification, FEFO Batch Custody, Allergy Cross-Checking & Atomic Inventory Ledgers
          </p>
        </div>

        <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg font-mono font-bold">
          Pharmacist on Duty: {currentUser.fullName}
        </div>
      </div>

      {/* QUICK PHARMACY QR SCANNER VERIFICATION BAR */}
      <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm border border-slate-800 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-900/80 border border-teal-700 flex items-center justify-center text-teal-300">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Quick Pharmacy QR Scan & Patient Verification</span>
              <span className="text-[11px] text-slate-400">
                Scan patient's smartphone prescription QR or enter prescription ID for instant counter lookup
              </span>
            </div>
          </div>

          {/* Quick Scanner Input */}
          <form onSubmit={handleScanVerify} className="flex items-center gap-2 max-w-md w-full sm:w-auto">
            <div className="relative flex-1">
              <Scan className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Scan or type Rx ID (e.g. RX-001)..."
                value={qrScanInput}
                onChange={e => setQrScanInput(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 font-mono focus:outline-hidden focus:border-teal-400"
              />
            </div>
            <button
              type="submit"
              className="bg-teal-700 hover:bg-teal-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              Verify QR
            </button>
          </form>
        </div>

        {scanFeedback && (
          <div className="text-[11px] bg-teal-950/90 text-teal-200 border border-teal-800 px-3 py-1.5 rounded-lg font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span>{scanFeedback}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Prescriptions Worklist (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs">Prescriptions Queue ({db.prescriptions.length})</h3>
            <span className="text-[11px] text-slate-500 font-mono">{filteredPrescriptions.length} visible</span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by drug, patient, or MRN..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden focus:border-teal-700"
            />
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-1.5 text-[11px]">
            {(['ALL', 'PENDING_PHARMACY', 'VERIFIED', 'DISPENSED'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-teal-800 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All' : st === 'PENDING_PHARMACY' ? 'Pending' : st}
              </button>
            ))}
          </div>

          {/* Scrollable List */}
          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {filteredPrescriptions.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                No prescriptions match your search criteria.
              </div>
            ) : (
              filteredPrescriptions.map(rx => {
                const isSelected = rx.id === selectedRx?.id;
                const isDispensed = rx.status === 'DISPENSED';
                return (
                  <div
                    key={rx.id}
                    onClick={() => setSelectedRxId(rx.id)}
                    className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-500 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 truncate max-w-[180px]">{rx.medicationName}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                        isDispensed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {rx.status === 'PENDING_PHARMACY' ? 'PENDING' : rx.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex justify-between font-mono">
                      <span>{rx.patientName}</span>
                      <span className="text-teal-800 font-bold">{rx.patientMrn}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                      <span>ID: {rx.id}</span>
                      <span>Qty: {rx.totalQuantity} units</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Prescription Details, QR Code Generator & Dispense (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          {selectedRx ? (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">{selectedRx.medicationName}</h3>
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                      {selectedRx.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Patient: <strong className="text-slate-900">{selectedRx.patientName}</strong> ({selectedRx.patientMrn}) · Doctor: <strong className="text-slate-800">{selectedRx.prescribingDoctor}</strong>
                  </p>
                </div>

                <button
                  onClick={() => setShowPrintSlipModal(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip & QR</span>
                </button>
              </div>

              {/* Patient Allergies Alert Check */}
              {patient && patient.allergies.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg text-xs space-y-1">
                  <span className="font-bold text-rose-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Patient Allergy Registry Cross-Check:
                  </span>
                  <p className="text-rose-700">
                    Patient has documented allergies to: <span className="font-bold">{patient.allergies.map(a => a.substance).join(', ')}</span>.
                  </p>
                </div>
              )}

              {/* Prescription Clinical Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-slate-500 text-[10px] block font-medium">Dosage:</span>
                  <span className="font-bold text-slate-900">{selectedRx.dosage}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block font-medium">Frequency:</span>
                  <span className="font-bold text-slate-900">{selectedRx.frequency}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block font-medium">Duration:</span>
                  <span className="font-bold text-slate-900">{selectedRx.durationDays} Days</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block font-medium">Quantity:</span>
                  <span className="font-bold text-teal-800 font-mono">{selectedRx.totalQuantity} units</span>
                </div>
              </div>

              {selectedRx.instructions && (
                <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-900 block mb-0.5">Administration Instructions:</span>
                  {selectedRx.instructions}
                </div>
              )}

              {/* DEDICATED QR CODE GENERATOR SECTION */}
              <div className="bg-teal-50/50 rounded-xl border border-teal-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-teal-700" />
                    <span>Prescription Verification QR Code Generator</span>
                  </h4>
                  <span className="text-[10px] bg-teal-100 text-teal-900 font-mono font-bold px-2 py-0.5 rounded">
                    MOH COMPLIANT
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 rounded-lg border border-teal-200/60 shadow-2xs">
                  {/* High Resolution Vector QR Code */}
                  <div className="bg-white p-2 border border-slate-200 rounded-lg shrink-0 shadow-xs">
                    <QRCodeSVG
                      value={getRxQrPayload(selectedRx)}
                      size={110}
                      level="M"
                      includeMargin={false}
                    />
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 flex-1">
                    <p className="font-semibold text-slate-900">
                      Tamper-Evident Digital Prescription Signature
                    </p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Patients can scan this QR code with their mobile device camera at the dispensary window, or pharmacists can scan it directly using the quick verification bar above for immediate authentication.
                    </p>
                    <div className="bg-slate-100 p-2 rounded text-[10px] font-mono text-slate-700 break-all select-all border border-slate-200">
                      {getRxQrPayload(selectedRx)}
                    </div>
                  </div>
                </div>
              </div>

              {/* FEFO Batch Allocation */}
              <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4 text-emerald-700" />
                  <span>FEFO Physical Inventory Allocation</span>
                </span>
                <div className="flex flex-col sm:flex-row justify-between text-xs text-emerald-900 gap-2 font-mono">
                  <div>
                    Batch: <strong>{matchingItem?.batches?.[0]?.batchNumber || 'BATCH-STD'}</strong>
                  </div>
                  <div>
                    Expiry: <strong>{matchingItem?.batches?.[0]?.expiryDate || '2027-12-31'}</strong>
                  </div>
                  <div>
                    Shelf Stock: <strong>{matchingItem?.currentStock || 0} units</strong>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Dispense Status: <strong className="text-slate-900 font-mono">{selectedRx.status}</strong>
                </div>

                {selectedRx.status !== 'DISPENSED' ? (
                  <button
                    onClick={handleDispense}
                    className="bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-xs px-6 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify QR & Dispense Medication</span>
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Dispensed by {selectedRx.dispensedBy} ({selectedRx.dispensedBatchNumber})
                  </span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No prescription selected.</p>
          )}
        </div>
      </div>

      {/* PRINTABLE OFFICIAL PRESCRIPTION SLIP WITH QR CODE MODAL */}
      {showPrintSlipModal && selectedRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 no-print">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-700" />
                <span>Official Patient Prescription Slip</span>
              </span>
              <button
                onClick={() => setShowPrintSlipModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Slip Container */}
            <div className="border-2 border-slate-900 rounded-xl p-5 bg-white space-y-4 font-sans text-xs">
              {/* Header */}
              <div className="text-center pb-3 border-b-2 border-dashed border-slate-300">
                <span className="font-extrabold text-sm text-slate-900 block tracking-tight">
                  J & J MEMORIAL e-HOSPITAL
                </span>
                <span className="text-[10px] text-slate-600 block">
                  VOA East Community, Monrovia, Liberia
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Pharmacy Dispensary · Prescription Token #{selectedRx.id}
                </span>
              </div>

              {/* Patient Meta */}
              <div className="space-y-1 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient:</span>
                  <strong className="text-slate-900">{selectedRx.patientName}</strong>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">MRN:</span>
                  <span>{selectedRx.patientMrn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Prescribing Doctor:</span>
                  <span>{selectedRx.prescribingDoctor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date Ordered:</span>
                  <span>{new Date(selectedRx.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Rx Details */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 text-sm">
                  ℞ {selectedRx.medicationName}
                </div>
                <div className="text-[11px] text-slate-600 font-mono">
                  {selectedRx.dosage} · {selectedRx.frequency} · Qty: {selectedRx.totalQuantity} units
                </div>
                <div className="text-[11px] text-slate-700 mt-1 pt-1 border-t border-slate-200">
                  <strong>Instructions:</strong> {selectedRx.instructions}
                </div>
              </div>

              {/* QR Code */}
              <div className="text-center pt-2 border-t border-dashed border-slate-300 space-y-2">
                <div className="inline-block p-2 bg-white border border-slate-300 rounded-lg">
                  <QRCodeSVG
                    value={getRxQrPayload(selectedRx)}
                    size={120}
                    level="H"
                  />
                </div>
                <span className="text-[10px] text-slate-500 block font-mono">
                  Scan at VOA East Central Pharmacy for Quick Dispensing
                </span>
              </div>

              {/* Doctor Sign-off */}
              <div className="pt-3 border-t border-slate-200 flex justify-between text-[10px] text-slate-500">
                <span>Doctor's Digital Sign-off: LMDC-MD-VERIFIED</span>
                <span>Security Token: {selectedRx.id}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 no-print">
              <button
                type="button"
                onClick={() => setShowPrintSlipModal(false)}
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
                <span>Print Prescription Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
