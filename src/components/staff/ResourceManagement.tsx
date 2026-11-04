import React, { useState, useEffect } from 'react';
import { dbStore } from '../../services/dbStore';
import { ResourceBooking } from '../../types';
import { Layers, Plus, Calendar, Clock, AlertTriangle, CheckCircle2, User, Wrench, ShieldAlert } from 'lucide-react';

export const ResourceManagement: React.FC = () => {
  const [bookings, setBookings] = useState<ResourceBooking[]>([]);
  const [isBooking, setIsBooking] = useState(false);

  // Form states
  const [resourceName, setResourceName] = useState('GE Logiq E10 Ultrasound Machine');
  const [resourceType, setResourceType] = useState<ResourceBooking['resourceType']>('Ultrasound Machine');
  const [bookedBy, setBookedBy] = useState('Dr. Emmanuel Tamba, MD');
  const [patientName, setPatientName] = useState('Korto Kollie');
  const [patientMrn, setPatientMrn] = useState('JJM-2026-0042');
  const [startTime, setStartTime] = useState('2026-11-04T13:00:00');
  const [endTime, setEndTime] = useState('2026-11-04T14:30:00');
  const [purpose, setPurpose] = useState('Deep venous thrombosis ultrasound assessment');
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      setBookings(dbStore.getResourceBookings());
    };
    update();
    return dbStore.subscribe(update);
  }, []);

  const EQUIPMENT_LIST = [
    { id: 'eq-1', name: 'GE Logiq E10 Ultrasound Machine', type: 'Ultrasound Machine', status: 'Available' },
    { id: 'eq-2', name: 'Siemens Somatom 64-Slice CT Scanner', type: 'CT Scanner', status: 'In Use' },
    { id: 'eq-3', name: 'Operating Theater 1 (Major Surgery Suite)', type: 'Operating Theater', status: 'Available' },
    { id: 'eq-4', name: 'Fresenius 5008S Dialysis Unit Bay 4', type: 'Dialysis Unit', status: 'Available' },
    { id: 'eq-5', name: 'Philips Zenition Mobile C-Arm X-Ray', type: 'Mobile X-Ray', status: 'Maintenance' },
  ];

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);

    const selectedEq = EQUIPMENT_LIST.find((eq) => eq.name === resourceName) || EQUIPMENT_LIST[0];

    const result = await dbStore.bookResource({
      resourceId: selectedEq.id,
      resourceName,
      resourceType: selectedEq.type as any,
      bookedBy,
      patientName,
      patientMrn,
      startTime,
      endTime,
      purpose,
    });

    if (result.success) {
      setSuccessMessage(result.message);
      setIsBooking(false);
      setTimeout(() => setSuccessMessage(null), 4000);
    } else {
      setConflictError(result.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Biomedical Asset & Operating Theater Allocation</span>
          </div>
          <h2 className="text-2xl font-extrabold text-hospital-navy mt-1">
            Specialized Medical Resource Management
          </h2>
          <p className="text-xs text-slate-500">
            Schedule high-demand clinical equipment (Ultrasound, CT, MRI, Operating Theaters) with automated collision and overlap prevention.
          </p>
        </div>

        <button
          onClick={() => {
            setIsBooking(!isBooking);
            setConflictError(null);
          }}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{isBooking ? 'Close Booking Drawer' : 'Book Medical Resource'}</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {conflictError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{conflictError}</span>
        </div>
      )}

      {/* Equipment Fleet Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {EQUIPMENT_LIST.map((eq) => (
          <div key={eq.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
              {eq.type}
            </span>
            <div className="font-bold text-slate-900 text-xs truncate" title={eq.name}>
              {eq.name}
            </div>
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
              eq.status === 'Available'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : eq.status === 'In Use'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {eq.status}
            </span>
          </div>
        ))}
      </div>

      {/* Booking Drawer Form with Collision Prevention */}
      {isBooking && (
        <form onSubmit={handleCreateBooking} className="p-6 bg-white rounded-2xl border border-teal-300 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h4 className="font-bold text-hospital-navy text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-600" />
              Schedule Specialized Equipment Reservation
            </h4>
            <span className="text-xs text-teal-700 font-semibold flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Automated Conflict Engine Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Equipment / Facility Resource *</label>
              <select
                value={resourceName}
                onChange={(e) => setResourceName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-medium"
              >
                {EQUIPMENT_LIST.map((eq) => (
                  <option key={eq.id} value={eq.name}>
                    {eq.name} ({eq.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Booked By (Clinician / Surgeon) *</label>
              <input
                type="text"
                required
                value={bookedBy}
                onChange={(e) => setBookedBy(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Patient Name & MRN *</label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reservation Start Time *</label>
              <input
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reservation End Time *</label>
              <input
                type="datetime-local"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Clinical Procedure Purpose *</label>
              <input
                type="text"
                required
                placeholder="e.g. Diagnostic scan, Hernia repair"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsBooking(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
            >
              Verify & Confirm Equipment Slot
            </button>
          </div>
        </form>
      )}

      {/* Booked Schedule List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <h4 className="font-bold text-hospital-navy text-sm">
          Active Equipment Bookings Schedule ({bookings.length})
        </h4>

        <div className="space-y-3">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 text-sm">
                    {b.resourceName}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                    {b.resourceType}
                  </span>
                </div>

                <div className="text-xs text-slate-600">
                  Patient: <strong>{b.patientName}</strong> &bull; Booked by: <strong>{b.bookedBy}</strong>
                </div>

                <div className="text-xs text-slate-500 font-mono flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(b.startTime).toLocaleString()} - {new Date(b.endTime).toLocaleTimeString()}
                  </span>
                  <span>&bull;</span>
                  <span className="text-slate-700 font-sans">{b.purpose}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {b.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
