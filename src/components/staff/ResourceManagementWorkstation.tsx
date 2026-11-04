import React, { useState } from 'react';
import { 
  Wrench, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Search, 
  User, 
  ShieldCheck, 
  Cpu,
  Layers,
  Activity,
  X
} from 'lucide-react';
import { UserAccount } from '../../types/auth';
import { SpecializedEquipmentResource, ResourceReservation } from '../../types/resourceEquipment';
import { getDatabaseState, addResourceReservation, updateResourceReservation, logAuditEvent } from '../../services/storageService';

interface ResourceManagementWorkstationProps {
  currentUser: UserAccount;
}

export const ResourceManagementWorkstation: React.FC<ResourceManagementWorkstationProps> = ({ currentUser }) => {
  const db = getDatabaseState();
  const resources = db.specializedResources || [];
  const reservations = db.resourceReservations || [];

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<string>(resources[0]?.id || '');

  // Booking Form State
  const [patientMrn, setPatientMrn] = useState(db.patients[0]?.mrn || 'JJM-2026-00104');
  const [procedureName, setProcedureName] = useState('Abdominal & Pelvic Ultrasound Review');
  const [bookingDate, setBookingDate] = useState('2026-11-04');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('14:45');
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const filteredResources = resources.filter(res => {
    if (selectedCategory === 'ALL') return true;
    return res.category === selectedCategory;
  });

  // Check for scheduling conflicts
  const checkConflicts = (resourceId: string, date: string, start: string, end: string) => {
    const existing = reservations.filter(r => 
      r.resourceId === resourceId && 
      r.date === date && 
      r.status !== 'CANCELLED'
    );

    for (const res of existing) {
      if ((start >= res.startTime && start < res.endTime) || (end > res.startTime && end <= res.endTime)) {
        return `Conflict Detected! ${res.patientName} (${res.procedureName}) already booked from ${res.startTime} to ${res.endTime}.`;
      }
    }
    return null;
  };

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    const conflict = checkConflicts(selectedResourceId, bookingDate, startTime, endTime);
    if (conflict) {
      setConflictWarning(conflict);
      return;
    }

    const patient = db.patients.find(p => p.mrn === patientMrn) || db.patients[0];
    const resource = resources.find(r => r.id === selectedResourceId);

    const newRes: ResourceReservation = {
      id: `RRES-${Date.now()}`,
      resourceId: selectedResourceId,
      patientId: patient.id,
      patientMrn: patient.mrn,
      patientName: `${patient.firstName} ${patient.lastName}`,
      procedureName,
      requestedBy: currentUser.fullName,
      date: bookingDate,
      startTime,
      endTime,
      status: 'SCHEDULED',
      createdAt: new Date().toISOString()
    };

    addResourceReservation(newRes);
    logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'CREATE',
      module: 'OPD',
      details: `Specialized Resource ${resource?.name} reserved for ${patient.firstName} ${patient.lastName} on ${bookingDate} (${startTime}-${endTime}) by ${currentUser.fullName}`,
      ipAddress: '10.0.4.33',
      status: 'SUCCESS'
    });

    setShowBookModal(false);
    setConflictWarning(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
            <Cpu className="w-5 h-5 text-teal-700" />
            <span>Biomedical Equipment & Specialized Procedure Suites</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            Specialized Equipment & Procedure Scheduling
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Prevent double-booking of high-demand medical devices (Siemens Ultrasound, GE Digital X-Ray, Surgical Theaters, 12-Lead ECG). Automated conflict detection prevents procedure overlaps.
          </p>
        </div>

        <button
          onClick={() => {
            setConflictWarning(null);
            setShowBookModal(true);
          }}
          className="bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Book Equipment Slot</span>
        </button>
      </div>

      {/* Equipment Operational Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {resources.map(res => {
          const resReservations = reservations.filter(r => r.resourceId === res.id && r.status === 'SCHEDULED');
          return (
            <div
              key={res.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                  {res.code}
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                  {res.status}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-xs text-slate-900 leading-snug">{res.name}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{res.location}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Upcoming Slots:</span>
                <span className="font-bold text-teal-800">{resReservations.length} Booked</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scheduled Resource Reservations List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-teal-700" />
          <span>Active Resource Reservations & Time Slots</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                <th className="pb-3">Equipment / Room</th>
                <th className="pb-3">Patient</th>
                <th className="pb-3">Procedure</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Time Window</th>
                <th className="pb-3">Requested By</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reservations.map(res => {
                const eq = resources.find(r => r.id === res.resourceId);
                return (
                  <tr key={res.id} className="hover:bg-slate-50">
                    <td className="py-3 font-semibold text-slate-900">
                      {eq?.name || 'Equipment'}
                    </td>
                    <td className="py-3">
                      <div className="font-bold text-slate-900">{res.patientName}</div>
                      <div className="font-mono text-[10px] text-teal-700">{res.patientMrn}</div>
                    </td>
                    <td className="py-3 text-slate-700 font-medium">
                      {res.procedureName}
                    </td>
                    <td className="py-3 font-mono text-slate-600">
                      {res.date}
                    </td>
                    <td className="py-3 font-mono font-bold text-teal-800">
                      {res.startTime} - {res.endTime}
                    </td>
                    <td className="py-3 text-slate-500 text-[11px]">
                      {res.requestedBy}
                    </td>
                    <td className="py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        res.status === 'SCHEDULED' ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {res.status}
                      </span>
                    </td>
                    <td className="py-3">
                      {res.status === 'SCHEDULED' && (
                        <button
                          onClick={() => updateResourceReservation(res.id, { status: 'COMPLETED' })}
                          className="text-[11px] text-teal-700 hover:text-teal-900 font-semibold cursor-pointer"
                        >
                          Mark Done
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Equipment Modal with Conflict Warning */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Reserve Specialized Equipment</h3>
              <button onClick={() => setShowBookModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {conflictWarning && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-snug">{conflictWarning}</div>
              </div>
            )}

            <form onSubmit={handleCreateReservation} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Equipment / Suite *</label>
                <select
                  value={selectedResourceId}
                  onChange={e => {
                    setSelectedResourceId(e.target.value);
                    setConflictWarning(null);
                  }}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                >
                  {resources.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Patient *</label>
                <select
                  value={patientMrn}
                  onChange={e => setPatientMrn(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                >
                  {db.patients.map(p => (
                    <option key={p.id} value={p.mrn}>
                      {p.mrn} - {p.firstName} {p.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Procedure Name *</label>
                <input
                  type="text"
                  required
                  value={procedureName}
                  onChange={e => setProcedureName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={e => {
                      setBookingDate(e.target.value);
                      setConflictWarning(null);
                    }}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start *</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={e => {
                      setStartTime(e.target.value);
                      setConflictWarning(null);
                    }}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End *</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={e => {
                      setEndTime(e.target.value);
                      setConflictWarning(null);
                    }}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-800 hover:bg-teal-900 text-white font-semibold px-5 py-2 rounded-lg"
                >
                  Verify & Confirm Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
