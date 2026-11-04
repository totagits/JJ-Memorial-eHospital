import React, { useState, useEffect } from 'react';
import { dbStore } from '../../services/dbStore';
import { LabTestOrder } from '../../types';
import { FlaskConical, CheckCircle2, AlertTriangle, User, Search, Clock, Plus, ShieldCheck } from 'lucide-react';

export const LaboratoryResultsModule: React.FC = () => {
  const [labOrders, setLabOrders] = useState<LabTestOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<LabTestOrder | null>(null);

  // Result entry form states
  const [parameters, setParameters] = useState<
    { parameter: string; value: string; unit: string; referenceRange: string; isCritical: boolean }[]
  >([
    { parameter: 'Hemoglobin (Hb)', value: '', unit: 'g/dL', referenceRange: '12.0 - 15.5', isCritical: false },
    { parameter: 'White Blood Cells (WBC)', value: '', unit: 'x10^3/uL', referenceRange: '4.5 - 11.0', isCritical: false },
    { parameter: 'Platelets', value: '', unit: 'x10^3/uL', referenceRange: '150 - 450', isCritical: false },
  ]);
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [technicianName, setTechnicianName] = useState('Sando Coleman, Lab Tech');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      const orders = dbStore.getLabOrders();
      setLabOrders(orders);
      if (!selectedOrder && orders.length > 0) {
        setSelectedOrder(orders[0]);
      }
    };
    update();
    return dbStore.subscribe(update);
  }, []);

  const handleSelectOrder = (order: LabTestOrder) => {
    setSelectedOrder(order);
    if (order.results && order.results.length > 0) {
      setParameters(order.results);
      setTechnicianNotes(order.technicianNotes || '');
    } else {
      // Default parameters based on test type
      if (order.testName.includes('Malaria')) {
        setParameters([
          { parameter: 'mRDT Pf/Pv', value: 'POSITIVE', unit: 'qualitative', referenceRange: 'Negative', isCritical: true },
          { parameter: 'MPS Parasite Density', value: '12,500', unit: 'parasites/uL', referenceRange: '0', isCritical: true },
        ]);
      } else {
        setParameters([
          { parameter: 'Analyte', value: '', unit: 'mg/dL', referenceRange: 'Normal', isCritical: false },
        ]);
      }
      setTechnicianNotes('');
    }
  };

  const handleParameterChange = (index: number, field: string, val: any) => {
    const next = [...parameters];
    (next[index] as any)[field] = val;
    setParameters(next);
  };

  const handleAddParam = () => {
    setParameters([
      ...parameters,
      { parameter: '', value: '', unit: '', referenceRange: '', isCritical: false },
    ]);
  };

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsSubmitting(true);
    await dbStore.submitLabResult(
      selectedOrder.id,
      parameters,
      technicianName,
      technicianNotes
    );

    setIsSubmitting(false);
    setSuccessMessage(`Successfully released results for ${selectedOrder.testName} (${selectedOrder.patientName}). Portal notification triggered!`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Clinical Pathology & Diagnostic LIS</span>
          </div>
          <h2 className="text-2xl font-extrabold text-hospital-navy mt-1">
            Laboratory Results & Investigation Worklist
          </h2>
          <p className="text-xs text-slate-500">
            Technicians input numerical test data, flag critical pathological values, and release reports to attending clinicians and patient portals.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Grid: Order queue on left, Result Entry on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Order Queue (Col 5) */}
        <div className="lg:col-span-5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Diagnostic Orders Queue ({labOrders.length})
          </h4>

          <div className="space-y-3">
            {labOrders.map((order) => {
              const isSelected = selectedOrder?.id === order.id;
              const hasCritical = order.results?.some((r) => r.isCritical);

              return (
                <div
                  key={order.id}
                  onClick={() => handleSelectOrder(order)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-teal-50/70 border-teal-500 ring-1 ring-teal-500 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-teal-800 bg-teal-100/60 px-1.5 py-0.2 rounded">
                      {order.orderNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      order.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : order.status === 'Testing'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  <h5 className="font-bold text-slate-900 text-sm">
                    {order.testName}
                  </h5>

                  <div className="mt-2 text-xs text-slate-600 flex items-center justify-between">
                    <span>{order.patientName} ({order.mrn})</span>
                    {hasCritical && (
                      <span className="text-rose-600 font-extrabold flex items-center gap-1 text-[10px] bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                        <AlertTriangle className="w-3 h-3" /> Critical
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Result Entry Workspace (Col 7) */}
        <div className="lg:col-span-7">
          {selectedOrder ? (
            <form onSubmit={handleSubmitResult} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {selectedOrder.category}
                  </span>
                  <h3 className="text-xl font-extrabold text-hospital-navy mt-1">
                    {selectedOrder.testName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Patient: <strong>{selectedOrder.patientName}</strong> ({selectedOrder.mrn}) &bull; Order Date: {selectedOrder.orderDate}
                  </p>
                </div>

                <div className="text-xs text-slate-500 font-mono">
                  Order: {selectedOrder.orderNumber}
                </div>
              </div>

              {/* Parameters Input Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Test Analyte Results & Ranges
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddParam}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-teal-600 hover:text-teal-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Analyte</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {parameters.map((param, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs items-center">
                      <div className="sm:col-span-4">
                        <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Analyte Parameter</label>
                        <input
                          type="text"
                          required
                          value={param.parameter}
                          onChange={(e) => handleParameterChange(idx, 'parameter', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-semibold text-slate-800"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Result Value</label>
                        <input
                          type="text"
                          required
                          value={param.value}
                          onChange={(e) => handleParameterChange(idx, 'value', e.target.value)}
                          className={`w-full px-2.5 py-1.5 bg-white border rounded font-mono font-bold ${
                            param.isCritical ? 'border-rose-400 text-rose-700 bg-rose-50' : 'border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Unit</label>
                        <input
                          type="text"
                          value={param.unit}
                          onChange={(e) => handleParameterChange(idx, 'unit', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-600"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Ref Range</label>
                        <input
                          type="text"
                          value={param.referenceRange}
                          onChange={(e) => handleParameterChange(idx, 'referenceRange', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-500 font-mono text-[11px]"
                        />
                      </div>

                      <div className="sm:col-span-12 flex items-center justify-between pt-1 border-t border-slate-200/50">
                        <label className="flex items-center space-x-2 cursor-pointer text-slate-600 text-[11px]">
                          <input
                            type="checkbox"
                            checked={param.isCritical}
                            onChange={(e) => handleParameterChange(idx, 'isCritical', e.target.checked)}
                            className="w-3.5 h-3.5 text-rose-600 rounded"
                          />
                          <span className={param.isCritical ? 'text-rose-600 font-bold' : ''}>
                            Flag as Critical Out-of-Range Alert
                          </span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technician Notes */}
              <div className="space-y-1 text-xs">
                <label className="block font-semibold text-slate-700">Technician Remarks & Interpretation</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Parasite count verified on 100x oil immersion. Quality control passed..."
                  value={technicianNotes}
                  onChange={(e) => setTechnicianNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Testing Technician</label>
                  <input
                    type="text"
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center space-x-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Releasing & Notifying...' : 'Validate & Release Results to Portal'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="h-64 flex items-center justify-center border border-dashed rounded-2xl text-slate-400 text-xs">
              Select an investigation order from the left worklist to enter results.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
