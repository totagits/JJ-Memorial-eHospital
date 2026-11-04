import React, { useState, useEffect } from 'react';
import { dbStore } from '../../services/dbStore';
import { StaffScheduleShift, UserRole } from '../../types';
import { Calendar, Plus, Clock, User, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export const StaffScheduling: React.FC = () => {
  const [schedules, setSchedules] = useState<StaffScheduleShift[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [staffName, setStaffName] = useState('Dr. Emmanuel Tamba, MD');
  const [staffId, setStaffId] = useState('stf-1');
  const [role, setRole] = useState<UserRole>('doctor');
  const [department, setDepartment] = useState('Internal Medicine');
  const [date, setDate] = useState('2026-11-04');
  const [shiftType, setShiftType] = useState<StaffScheduleShift['shiftType']>('Morning (07:00 - 15:00)');
  const [roomOrWard, setRoomOrWard] = useState('Consulting Room 1');
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      setSchedules(dbStore.getStaffSchedules());
    };
    update();
    return dbStore.subscribe(update);
  }, []);

  const STAFF_MEMBERS = [
    { id: 'stf-1', name: 'Dr. Emmanuel Tamba, MD', role: 'doctor', dept: 'Internal Medicine' },
    { id: 'stf-2', name: 'Dr. Fatumata Fofana, MD', role: 'doctor', dept: 'Emergency & Acute Care' },
    { id: 'stf-3', name: 'Nurse Sarah Kiatamba, RN', role: 'triage', dept: 'OPD Triage Station' },
    { id: 'stf-4', name: 'Pharm. Varney Sheriff, RPh', role: 'pharmacist', dept: 'Central Pharmacy' },
    { id: 'stf-5', name: 'Dr. Moses Weah, MD', role: 'doctor', dept: 'Pediatrics' },
    { id: 'stf-6', name: 'Sando Coleman', role: 'lab_tech', dept: 'Diagnostic Laboratory' },
  ];

  const handleStaffChange = (id: string) => {
    setStaffId(id);
    const found = STAFF_MEMBERS.find((s) => s.id === id);
    if (found) {
      setStaffName(found.name);
      setRole(found.role as any);
      setDepartment(found.dept);
    }
  };

  const handleAddShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);

    const result = await dbStore.addStaffShift({
      staffId,
      staffName,
      role,
      department,
      date,
      shiftType,
      roomOrWard,
      status: 'Confirmed',
    });

    if (result.success) {
      setSuccessMessage(result.message);
      setIsAdding(false);
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
            <Calendar className="w-3.5 h-3.5" />
            <span>Workforce Management & Duty Rosters</span>
          </div>
          <h2 className="text-2xl font-extrabold text-hospital-navy mt-1">
            Clinical Staff Duty Scheduling
          </h2>
          <p className="text-xs text-slate-500">
            Create, manage, and modify doctor and nurse shifts with automated conflict detection preventing double-booking and overtime violations.
          </p>
        </div>

        <button
          onClick={() => {
            setIsAdding(!isAdding);
            setConflictError(null);
          }}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Close Shift Assignment' : 'Assign Shift to Staff'}</span>
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

      {/* Add Shift Drawer Form with Automated Conflict Detection */}
      {isAdding && (
        <form onSubmit={handleAddShift} className="p-6 bg-white rounded-2xl border border-teal-300 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h4 className="font-bold text-hospital-navy text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-600" />
              Schedule Duty Roster Slot
            </h4>
            <span className="text-xs text-teal-700 font-semibold flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Overlapping Shift Collision Detector Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Staff Member *</label>
              <select
                value={staffId}
                onChange={(e) => handleStaffChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-medium"
              >
                {STAFF_MEMBERS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.dept})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Shift Time Window *</label>
              <select
                value={shiftType}
                onChange={(e) => setShiftType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-medium"
              >
                <option value="Morning (07:00 - 15:00)">Morning (07:00 - 15:00)</option>
                <option value="Afternoon (15:00 - 23:00)">Afternoon (15:00 - 23:00)</option>
                <option value="Night (23:00 - 07:00)">Night (23:00 - 07:00)</option>
                <option value="On-Call (24h)">On-Call Emergency (24h)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Station / Ward</label>
              <input
                type="text"
                required
                value={roomOrWard}
                onChange={(e) => setRoomOrWard(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
            >
              Verify & Confirm Shift
            </button>
          </div>
        </form>
      )}

      {/* Shifts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <h4 className="font-bold text-hospital-navy text-sm">
          Active Staff Shift Roster ({schedules.length})
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Staff Name</th>
                <th className="py-3 px-4">Clinical Department</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Shift Type</th>
                <th className="py-3 px-4">Assigned Location</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schedules.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {s.staffName}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {s.department}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-teal-800">
                    {s.date}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {s.shiftType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {s.roomOrWard}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
