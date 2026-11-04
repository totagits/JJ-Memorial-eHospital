import React, { useState, useEffect } from 'react';
import { dbStore } from '../../services/dbStore';
import { Medication, Prescription, DispenserLogEntry } from '../../types';
import { PrescriptionQRScanner } from './PrescriptionQRScanner';
import { Pill, QrCode, AlertTriangle, CheckCircle2, Clock, Search, ShieldCheck, Package } from 'lucide-react';

export const PharmacyDashboard: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [dispenserLog, setDispenserLog] = useState<DispenserLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'queue' | 'inventory' | 'log'>('queue');
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [searchMed, setSearchMed] = useState('');

  useEffect(() => {
    const update = () => {
      setPrescriptions(dbStore.getPrescriptions());
      setMedications(dbStore.getMedications());
      setDispenserLog(dbStore.getDispenserLog());
    };
    update();
    return dbStore.subscribe(update);
  }, []);

  const handleDispense = async (code: string) => {
    await dbStore.dispensePrescription(code, 'Pharm. Varney Sheriff, RPh');
  };

  const pendingPrescriptions = prescriptions.filter((p) => p.status === 'Pending');

  const filteredMeds = medications.filter(
    (m) =>
      m.name.toLowerCase().includes(searchMed.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchMed.toLowerCase()) ||
      m.category.toLowerCase().includes(searchMed.toLowerCase())
  );

  const lowStockMeds = medications.filter((m) => m.stockQuantity <= m.minThreshold);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <Pill className="w-3.5 h-3.5" />
            <span>Medication Safety & Dispensary Ledger</span>
          </div>
          <h2 className="text-2xl font-extrabold text-hospital-navy mt-1">
            Pharmacy & Dispensary Workspace
          </h2>
          <p className="text-xs text-slate-500">
            Verify physician prescriptions, track atomic medication stock decrement, scan barcodes, and audit dispenser logs.
          </p>
        </div>

        {/* Action Button: QR Scanner Trigger (#35) */}
        <button
          onClick={() => setIsQRScannerOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-hospital-navy hover:bg-hospital-navy-light text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
        >
          <QrCode className="w-4 h-4 text-teal-400" />
          <span>Scan Patient QR Prescription</span>
        </button>
      </div>

      {/* Low Stock Warning Banner if any */}
      {lowStockMeds.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <strong className="font-bold">Automated Reorder Trigger:</strong> {lowStockMeds.length} essential medications are currently below safety buffer thresholds (
              {lowStockMeds.map((m) => `${m.name} [${m.stockQuantity} left]`).join(', ')}).
            </div>
          </div>
          <button
            onClick={() => setActiveTab('inventory')}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] whitespace-nowrap"
          >
            Review Stock
          </button>
        </div>
      )}

      {/* Tabs Selector */}
      <div className="flex space-x-2 border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('queue')}
          className={`pb-3 px-4 transition border-b-2 flex items-center space-x-2 ${
            activeTab === 'queue'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Pending Prescriptions ({pendingPrescriptions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 px-4 transition border-b-2 flex items-center space-x-2 ${
            activeTab === 'inventory'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Medication Inventory Levels ({medications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('log')}
          className={`pb-3 px-4 transition border-b-2 flex items-center space-x-2 ${
            activeTab === 'log'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Dispenser Audit Log ({dispenserLog.length})</span>
        </button>
      </div>

      {/* TAB 1: Pending Prescriptions Queue */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {pendingPrescriptions.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
              No pending prescriptions in queue. All physician orders are filled.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingPrescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {rx.prescriptionCode}
                      </span>
                      <h4 className="font-extrabold text-hospital-navy text-base mt-1">
                        {rx.patientName}
                      </h4>
                      <p className="text-xs text-slate-500">
                        MRN: {rx.mrn} &bull; Prescribed by: <strong>{rx.doctorName}</strong>
                      </p>
                    </div>

                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      Pending Fill
                    </span>
                  </div>

                  {/* Items to dispense */}
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Medication Items:
                    </span>
                    {rx.items.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>{item.medicationName}</span>
                          <span className="text-teal-700 font-mono">Qty: {item.quantity}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Dosage: {item.dosage} ({item.frequency} for {item.durationDays} days)
                        </div>
                        <div className="text-[11px] text-slate-600 italic">
                          &ldquo;{item.instructions}&rdquo;
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Order Date: {rx.datePrescribed}
                    </span>

                    <button
                      onClick={() => handleDispense(rx.prescriptionCode)}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
                    >
                      Verify & Dispense Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Inventory Stock Levels */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search medication name or category..."
                value={searchMed}
                onChange={(e) => setSearchMed(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <span className="text-xs text-slate-500">
              Showing {filteredMeds.length} formulary items
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Medication Name & Strength</th>
                  <th className="py-3 px-4">Generic Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Batch Number</th>
                  <th className="py-3 px-4">Stock on Hand</th>
                  <th className="py-3 px-4">Threshold</th>
                  <th className="py-3 px-4">Unit Price (USD)</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMeds.map((med) => {
                  const isLow = med.stockQuantity <= med.minThreshold;
                  return (
                    <tr key={med.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {med.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {med.genericName}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                          {med.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {med.batchNumber}
                      </td>
                      <td className="py-3 px-4 font-mono font-black text-sm">
                        <span className={isLow ? 'text-rose-600' : 'text-slate-900'}>
                          {med.stockQuantity}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {med.minThreshold}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        ${med.unitPriceUSD.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {med.expiryDate}
                      </td>
                      <td className="py-3 px-4">
                        {isLow ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Reorder Trigger
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Adequate
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Dispenser Audit Log */}
      {activeTab === 'log' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <h4 className="font-bold text-hospital-navy text-sm">
            Dispensary Fulfillment Ledger ({dispenserLog.length})
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Prescription Code</th>
                  <th className="py-3 px-4">Patient Name & MRN</th>
                  <th className="py-3 px-4">Medication Filled</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Batch Number</th>
                  <th className="py-3 px-4">Pharmacist</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dispenserLog.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-teal-800">
                      {log.prescriptionCode}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {log.patientName} <span className="text-slate-400 font-mono text-[11px]">({log.mrn})</span>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium">
                      {log.medicationName}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {log.quantityDispensed}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {log.batchNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {log.pharmacistName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QR Scanner Modal (#35) */}
      <PrescriptionQRScanner
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScannedCode={(code) => handleDispense(code)}
      />
    </div>
  );
};
