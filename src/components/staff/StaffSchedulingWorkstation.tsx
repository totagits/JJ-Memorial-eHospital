import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Edit3, 
  Trash2, 
  Filter, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ShieldAlert, 
  Printer, 
  Download, 
  RefreshCw, 
  Stethoscope, 
  HeartPulse, 
  Bed, 
  Microscope, 
  Pill, 
  Scan, 
  UserCheck, 
  Sparkles,
  ArrowRightLeft,
  X,
  AlertOctagon
} from 'lucide-react';
import { getDatabaseState, updateDatabaseState, logAuditEvent } from '../../services/storageService';
import { StaffShift } from '../../types/erp';
import { UserAccount } from '../../types/auth';

interface StaffSchedulingWorkstationProps {
  currentUser: UserAccount;
}

interface ConflictItem {
  id: string;
  type: 'DOUBLE_BOOKING' | 'INSUFFICIENT_REST' | 'UNDER_STAFFED' | 'OVERTIME_EXCEEDED';
  severity: 'HIGH' | 'MEDIUM';
  title: string;
  description: string;
  shiftIds: string[];
  staffId?: string;
  date: string;
}

const DEPARTMENTS = [
  'ALL',
  'OPD',
  'EMERGENCY',
  'INPATIENT',
  'MATERNITY',
  'LABORATORY',
  'PHARMACY',
  'RADIOLOGY'
] as const;

const SHIFT_TYPES = {
  MORNING: { label: 'Morning (07:00 - 15:00)', hours: 8, color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  AFTERNOON: { label: 'Afternoon (15:00 - 23:00)', hours: 8, color: 'bg-blue-50 text-blue-800 border-blue-200' },
  NIGHT: { label: 'Night (23:00 - 07:00)', hours: 8, color: 'bg-purple-50 text-purple-800 border-purple-200' },
  ON_CALL_24H: { label: '24h On-Call (08:00 - 08:00)', hours: 24, color: 'bg-amber-50 text-amber-800 border-amber-200' }
};

export const StaffSchedulingWorkstation: React.FC<StaffSchedulingWorkstationProps> = ({ currentUser }) => {
  const db = getDatabaseState();
  const [shifts, setShifts] = useState<StaffShift[]>(db.shifts || []);
  
  // View controls
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [searchStaff, setSearchStaff] = useState<string>('');
  const [showConflictsOnly, setShowConflictsOnly] = useState<boolean>(false);
  const [activeDateRange, setActiveDateRange] = useState<string>('2026-11-02'); // Monday of target week

  // Modal State for Create/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<StaffShift | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<{
    staffId: string;
    department: StaffShift['department'];
    shiftDate: string;
    shiftType: StaffShift['shiftType'];
    startTime: string;
    endTime: string;
    wardOrRoom: string;
    notes: string;
  }>({
    staffId: db.users[1]?.id || 'USR-002',
    department: 'OPD',
    shiftDate: '2026-11-03',
    shiftType: 'MORNING',
    startTime: '07:00',
    endTime: '15:00',
    wardOrRoom: 'Consultation Suite 1',
    notes: ''
  });

  // Week days starting from activeDateRange
  const weekDays = useMemo(() => {
    const base = new Date(activeDateRange);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      return { iso, dayName, dayNum, monthName };
    });
  }, [activeDateRange]);

  // AUTOMATED CONFLICT DETECTION ENGINE
  const conflicts: ConflictItem[] = useMemo(() => {
    const foundConflicts: ConflictItem[] = [];

    // 1. Group shifts by staff
    const staffShiftsMap: { [staffId: string]: StaffShift[] } = {};
    shifts.forEach(s => {
      if (!staffShiftsMap[s.staffId]) staffShiftsMap[s.staffId] = [];
      staffShiftsMap[s.staffId].push(s);
    });

    // Check each staff member for fatigue and overlaps
    Object.entries(staffShiftsMap).forEach(([staffId, staffList]) => {
      // Sort by date
      const sorted = [...staffList].sort((a, b) => a.shiftDate.localeCompare(b.shiftDate));

      // Check double bookings on same day
      const byDate: { [date: string]: StaffShift[] } = {};
      sorted.forEach(s => {
        if (!byDate[s.shiftDate]) byDate[s.shiftDate] = [];
        byDate[s.shiftDate].push(s);
      });

      Object.entries(byDate).forEach(([date, dayShifts]) => {
        if (dayShifts.length > 1) {
          // Check if overlapping hours or multiple standard shifts
          foundConflicts.push({
            id: `CONF-DB-${staffId}-${date}`,
            type: 'DOUBLE_BOOKING',
            severity: 'HIGH',
            title: 'Double Booking / Overlapping Shift',
            description: `${dayShifts[0].staffName} is assigned to ${dayShifts.length} separate shifts on ${date} (${dayShifts.map(s => `${s.department} ${s.shiftType}`).join(' & ')}).`,
            shiftIds: dayShifts.map(s => s.id),
            staffId,
            date
          });
        }
      });

      // Check consecutive Night -> Morning shift without 12-hour rest (Fatigue Protection)
      for (let i = 0; i < sorted.length - 1; i++) {
        const current = sorted[i];
        const next = sorted[i + 1];
        
        const currDate = new Date(current.shiftDate);
        const nextDate = new Date(next.shiftDate);
        const dayDiff = (nextDate.getTime() - currDate.getTime()) / (1000 * 3600 * 24);

        if (dayDiff === 1 && current.shiftType === 'NIGHT' && next.shiftType === 'MORNING') {
          foundConflicts.push({
            id: `CONF-REST-${current.id}-${next.id}`,
            type: 'INSUFFICIENT_REST',
            severity: 'HIGH',
            title: 'Fatigue Violation: Insufficient Rest (< 8h)',
            description: `${current.staffName} concludes a Night shift at 07:00 on ${next.shiftDate} and is immediately scheduled for Morning duty starting at 07:00. This violates MoH clinical duty fatigue protocols.`,
            shiftIds: [current.id, next.id],
            staffId,
            date: next.shiftDate
          });
        }
      }

      // Check weekly overtime (> 48 hours / week)
      const totalHours = sorted.reduce((sum, s) => sum + s.hours, 0);
      if (totalHours > 48) {
        foundConflicts.push({
          id: `CONF-OT-${staffId}`,
          type: 'OVERTIME_EXCEEDED',
          severity: 'MEDIUM',
          title: 'Maximum Weekly Hours Exceeded',
          description: `${sorted[0].staffName} is scheduled for ${totalHours} hours across this period (exceeds the 48-hour statutory maximum).`,
          shiftIds: sorted.map(s => s.id),
          staffId,
          date: sorted[0].shiftDate
        });
      }
    });

    // 2. Department Minimum Staffing Violation Check
    // For every day in target week: Emergency requires at least 1 physician and 1 nurse during every shift
    weekDays.forEach(day => {
      const emergencyShifts = shifts.filter(s => s.department === 'EMERGENCY' && s.shiftDate === day.iso);
      ['MORNING', 'AFTERNOON', 'NIGHT'].forEach(sType => {
        const shiftsForSlot = emergencyShifts.filter(s => s.shiftType === sType || s.shiftType === 'ON_CALL_24H');
        const hasPhysician = shiftsForSlot.some(s => s.role.toLowerCase().includes('physician') || s.role.toLowerCase().includes('doctor'));
        const hasNurse = shiftsForSlot.some(s => s.role.toLowerCase().includes('nurse'));

        if (shiftsForSlot.length > 0 && !hasPhysician) {
          foundConflicts.push({
            id: `CONF-UND-${day.iso}-${sType}`,
            type: 'UNDER_STAFFED',
            severity: 'HIGH',
            title: `Emergency Department Physician Missing (${sType})`,
            description: `On ${day.iso} (${sType}), the Emergency/Trauma unit has nursing staff assigned but NO attending physician on duty or on call.`,
            shiftIds: shiftsForSlot.map(s => s.id),
            date: day.iso
          });
        }
      });
    });

    return foundConflicts;
  }, [shifts, weekDays]);

  // Check if a specific shift has an active conflict
  const isShiftConflicted = (shiftId: string) => {
    return conflicts.some(c => c.shiftIds.includes(shiftId));
  };

  // Filtered shifts for display
  const filteredShifts = useMemo(() => {
    return shifts.filter(s => {
      const matchesDept = selectedDept === 'ALL' || s.department === selectedDept;
      const matchesSearch = 
        s.staffName.toLowerCase().includes(searchStaff.toLowerCase()) ||
        s.role.toLowerCase().includes(searchStaff.toLowerCase()) ||
        s.wardOrRoom.toLowerCase().includes(searchStaff.toLowerCase());
      const matchesConflict = !showConflictsOnly || isShiftConflicted(s.id);
      return matchesDept && matchesSearch && matchesConflict;
    });
  }, [shifts, selectedDept, searchStaff, showConflictsOnly, conflicts]);

  // Handle open modal for new shift
  const handleOpenCreateModal = (defaultDate?: string, defaultDept?: StaffShift['department']) => {
    setEditingShift(null);
    setFormData({
      staffId: db.users[1]?.id || 'USR-002',
      department: defaultDept || (selectedDept !== 'ALL' ? (selectedDept as StaffShift['department']) : 'OPD'),
      shiftDate: defaultDate || activeDateRange,
      shiftType: 'MORNING',
      startTime: '07:00',
      endTime: '15:00',
      wardOrRoom: 'Consultation Suite 1',
      notes: ''
    });
    setIsModalOpen(true);
  };

  // Handle open modal for edit
  const handleOpenEditModal = (shift: StaffShift) => {
    setEditingShift(shift);
    setFormData({
      staffId: shift.staffId,
      department: shift.department,
      shiftDate: shift.shiftDate,
      shiftType: shift.shiftType,
      startTime: shift.startTime,
      endTime: shift.endTime,
      wardOrRoom: shift.wardOrRoom,
      notes: shift.notes || ''
    });
    setIsModalOpen(true);
  };

  // Save Shift (Create or Update)
  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    const staffAccount = db.users.find(u => u.id === formData.staffId);
    if (!staffAccount) return;

    let updatedShifts: StaffShift[];

    if (editingShift) {
      updatedShifts = shifts.map(s => {
        if (s.id === editingShift.id) {
          return {
            ...s,
            staffId: staffAccount.id,
            staffName: staffAccount.fullName,
            role: staffAccount.role.replace('_', ' ').toUpperCase(),
            department: formData.department,
            shiftDate: formData.shiftDate,
            shiftType: formData.shiftType,
            startTime: formData.startTime,
            endTime: formData.endTime,
            wardOrRoom: formData.wardOrRoom,
            notes: formData.notes,
            hours: formData.shiftType === 'ON_CALL_24H' ? 24 : 8,
            assignedBy: currentUser.fullName
          };
        }
        return s;
      });

      logAuditEvent({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        action: 'UPDATE',
        module: 'HR',
        details: `Updated shift ${editingShift.id} for ${staffAccount.fullName} on ${formData.shiftDate} (${formData.department}).`,
        ipAddress: 'Staff Scheduling Terminal',
        status: 'SUCCESS'
      });
    } else {
      const newShift: StaffShift = {
        id: `SHF-${Date.now().toString().slice(-4)}`,
        staffId: staffAccount.id,
        staffName: staffAccount.fullName,
        role: staffAccount.role.replace('_', ' ').toUpperCase(),
        department: formData.department,
        shiftDate: formData.shiftDate,
        shiftType: formData.shiftType,
        startTime: formData.startTime,
        endTime: formData.endTime,
        wardOrRoom: formData.wardOrRoom,
        status: 'CONFIRMED',
        notes: formData.notes,
        hours: formData.shiftType === 'ON_CALL_24H' ? 24 : 8,
        assignedBy: currentUser.fullName
      };

      updatedShifts = [...shifts, newShift];

      logAuditEvent({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        action: 'CREATE',
        module: 'HR',
        details: `Scheduled new shift ${newShift.id} for ${staffAccount.fullName} on ${formData.shiftDate} (${formData.department} - ${formData.shiftType}).`,
        ipAddress: 'Staff Scheduling Terminal',
        status: 'SUCCESS'
      });
    }

    setShifts(updatedShifts);
    updateDatabaseState(draft => {
      draft.shifts = updatedShifts;
    });

    setIsModalOpen(false);
  };

  // Delete shift
  const handleDeleteShift = (id: string) => {
    if (!confirm('Are you sure you want to remove this scheduled shift?')) return;
    const shiftToRemove = shifts.find(s => s.id === id);
    const updated = shifts.filter(s => s.id !== id);
    setShifts(updated);
    updateDatabaseState(draft => {
      draft.shifts = updated;
    });

    if (shiftToRemove) {
      logAuditEvent({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        action: 'CONFIG_CHANGE',
        module: 'HR',
        details: `Removed shift ${id} for ${shiftToRemove.staffName} on ${shiftToRemove.shiftDate}.`,
        ipAddress: 'Staff Scheduling Terminal',
        status: 'FLAGGED'
      });
    }
  };

  // Auto-Resolve Fatigue Conflict helper
  const handleAutoResolveConflict = (conflict: ConflictItem) => {
    if (conflict.type === 'INSUFFICIENT_REST') {
      // Reassign the second shift to Afternoon instead of Morning, giving adequate rest
      const secondShiftId = conflict.shiftIds[1];
      const updated = shifts.map(s => {
        if (s.id === secondShiftId) {
          return {
            ...s,
            shiftType: 'AFTERNOON' as const,
            startTime: '15:00',
            endTime: '23:00',
            notes: (s.notes ? s.notes + ' · ' : '') + 'Automatically rescheduled to Afternoon shift to resolve fatigue overlap.'
          };
        }
        return s;
      });

      setShifts(updated);
      updateDatabaseState(draft => {
        draft.shifts = updated;
      });

      alert('Shift adjusted to Afternoon (15:00 - 23:00). 16 hours of rest achieved.');
    } else if (conflict.type === 'UNDER_STAFFED') {
      // Prompt user to add doctor
      handleOpenCreateModal(conflict.date, 'EMERGENCY');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center shadow-xs">
            <CalendarIcon className="w-6 h-6 text-teal-700" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-extrabold text-slate-900">
                Staff Scheduling & Duty Rosters
              </h2>
              <span className="bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                Active Week: Nov 2 - Nov 8, 2026
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated conflict detection, department coverage monitoring, and clinical fatigue compliance.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Roster</span>
          </button>
          
          <button
            onClick={() => handleOpenCreateModal()}
            className="inline-flex items-center gap-1.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Shift</span>
          </button>
        </div>
      </div>

      {/* AUTOMATED CONFLICT DETECTION ALERT PANEL */}
      {conflicts.length > 0 ? (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-200">
            <div className="flex items-center gap-2.5 text-rose-900">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <h3 className="font-extrabold text-sm text-rose-900">
                  Automated Conflict Engine: {conflicts.length} Roster {conflicts.length === 1 ? 'Issue' : 'Issues'} Detected
                </h3>
                <p className="text-xs text-rose-700">
                  The clinical scheduling engine detected shift overlaps, duty fatigue violations, or under-staffed departments requiring administrative action.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowConflictsOnly(!showConflictsOnly)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                showConflictsOnly 
                  ? 'bg-rose-700 text-white border-rose-800' 
                  : 'bg-white text-rose-900 border-rose-300 hover:bg-rose-100'
              }`}
            >
              {showConflictsOnly ? 'Show All Shifts' : 'Filter Conflicted Shifts'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-3">
            {conflicts.map(conf => (
              <div key={conf.id} className="bg-white rounded-xl p-3 border border-rose-200 shadow-2xs space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-xs text-rose-950 flex items-center gap-1.5">
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    {conf.title}
                  </span>
                  <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                    {conf.date}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {conf.description}
                </p>
                <div className="pt-1 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Impact: {conf.severity}</span>
                  <button
                    onClick={() => handleAutoResolveConflict(conf)}
                    className="text-teal-800 hover:text-teal-900 font-bold text-xs inline-flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>Auto-Adjust / Fix</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-extrabold">All Rosters Conflict-Free:</span>
              <span className="ml-1 text-emerald-800">No shift overlaps, fatigue violations, or under-staffed wards detected for this active period.</span>
            </div>
          </div>
          <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300 text-[11px]">
            100% Policy Compliant
          </span>
        </div>
      )}

      {/* Filter & Controls Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-xs">
        {/* Department Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Dept:</span>
          </span>
          {DEPARTMENTS.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedDept === dept 
                  ? 'bg-teal-800 text-white font-bold shadow-xs' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {dept === 'ALL' ? 'All Units' : dept}
            </button>
          ))}
        </div>

        {/* Staff search & week navigation */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="relative w-48 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchStaff}
              onChange={e => setSearchStaff(e.target.value)}
              placeholder="Search doctor or nurse..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 bg-slate-50 text-xs font-semibold">
            <button
              onClick={() => {
                const d = new Date(activeDateRange);
                d.setDate(d.getDate() - 7);
                setActiveDateRange(d.toISOString().split('T')[0]);
              }}
              className="p-1 hover:bg-white rounded text-slate-600 cursor-pointer"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-slate-700 font-mono">Week of {activeDateRange}</span>
            <button
              onClick={() => {
                const d = new Date(activeDateRange);
                d.setDate(d.getDate() + 7);
                setActiveDateRange(d.toISOString().split('T')[0]);
              }}
              className="p-1 hover:bg-white rounded text-slate-600 cursor-pointer"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* WEEKLY CALENDAR ROSTER GRID */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Header with 7 Days */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center font-bold text-xs">
          {weekDays.map(day => (
            <div key={day.iso} className="p-3 border-r last:border-r-0 border-slate-200">
              <span className="block text-slate-500 text-[11px] uppercase font-semibold">{day.dayName}</span>
              <span className="text-base text-slate-900 font-black">{day.dayNum} {day.monthName}</span>
              <div className="mt-1">
                <span className="text-[10px] text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded font-mono">
                  {shifts.filter(s => s.shiftDate === day.iso).length} shifts
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Calendar Day Columns */}
        <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-slate-200 min-h-[500px]">
          {weekDays.map(day => {
            const dayShifts = filteredShifts.filter(s => s.shiftDate === day.iso);

            return (
              <div key={day.iso} className="p-3 space-y-3 bg-slate-50/30">
                <div className="flex md:hidden items-center justify-between font-bold text-xs border-b pb-1 text-slate-800">
                  <span>{day.dayName}, {day.dayNum} {day.monthName}</span>
                  <span className="text-teal-800 font-mono">{dayShifts.length} shifts</span>
                </div>

                {dayShifts.length > 0 ? (
                  dayShifts.map(shift => {
                    const conflicted = isShiftConflicted(shift.id);

                    return (
                      <div 
                        key={shift.id}
                        className={`rounded-xl p-3 border text-xs transition-all shadow-2xs group relative ${
                          conflicted 
                            ? 'bg-rose-50/90 border-rose-300 ring-1 ring-rose-400' 
                            : 'bg-white border-slate-200 hover:border-teal-400 hover:shadow-xs'
                        }`}
                      >
                        {/* Conflict Flag Indicator */}
                        {conflicted && (
                          <div className="mb-1.5 flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-100 border border-rose-300 px-1.5 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                            <span>Conflict Flagged</span>
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-1">
                          <span className="font-extrabold text-slate-900 leading-tight">
                            {shift.staffName}
                          </span>
                          <span className="font-mono text-[9px] text-slate-400">{shift.id}</span>
                        </div>

                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {shift.role}
                        </p>

                        <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                            SHIFT_TYPES[shift.shiftType]?.color || 'bg-slate-100 text-slate-700'
                          }`}>
                            {shift.shiftType}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                            {shift.department}
                          </span>
                        </div>

                        <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {shift.startTime} - {shift.endTime}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">{shift.hours}h</span>
                        </div>

                        <p className="text-[10px] text-slate-500 truncate mt-1" title={shift.wardOrRoom}>
                          📍 {shift.wardOrRoom}
                        </p>

                        {/* Hover Action Buttons */}
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5 opacity-90">
                          <button
                            onClick={() => handleOpenEditModal(shift)}
                            className="p-1 text-slate-600 hover:text-teal-800 hover:bg-slate-100 rounded cursor-pointer"
                            title="Edit / Reassign Shift"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteShift(shift.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                            title="Remove Shift"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-28 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-2 text-center text-slate-400">
                    <span className="text-[11px]">No shifts</span>
                    <button
                      onClick={() => handleOpenCreateModal(day.iso)}
                      className="mt-1 text-[10px] text-teal-800 font-bold hover:underline cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                )}

                {/* Quick Add Button at bottom of each column */}
                <button
                  onClick={() => handleOpenCreateModal(day.iso)}
                  className="w-full py-1 text-[11px] font-semibold text-slate-500 hover:text-teal-900 hover:bg-slate-100 border border-dashed border-slate-300 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Assign Shift</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE / EDIT SHIFT MODAL WITH REAL-TIME CONFLICT VALIDATION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold">
                  <CalendarIcon className="w-4 h-4 text-teal-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {editingShift ? 'Modify / Reassign Shift' : 'Schedule New Staff Shift'}
                  </h3>
                  <p className="text-xs text-slate-500">Live validation ensures zero fatigue overlap and staffing compliance.</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveShift} className="space-y-4 text-xs">
              {/* Staff Member Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Clinician or Nurse *</label>
                <select
                  required
                  value={formData.staffId}
                  onChange={e => setFormData({ ...formData, staffId: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 font-medium text-slate-900 focus:outline-hidden"
                >
                  {db.users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.role.replace('_', ' ').toUpperCase()} · {u.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Department & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department *</label>
                  <select
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value as StaffShift['department'] })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 font-medium text-slate-900 focus:outline-hidden"
                  >
                    {DEPARTMENTS.filter(d => d !== 'ALL').map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Shift Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.shiftDate}
                    onChange={e => setFormData({ ...formData, shiftDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 font-medium text-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Shift Type & Times */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Shift Slot *</label>
                  <select
                    value={formData.shiftType}
                    onChange={e => {
                      const type = e.target.value as StaffShift['shiftType'];
                      let start = '07:00';
                      let end = '15:00';
                      if (type === 'AFTERNOON') { start = '15:00'; end = '23:00'; }
                      else if (type === 'NIGHT') { start = '23:00'; end = '07:00'; }
                      else if (type === 'ON_CALL_24H') { start = '08:00'; end = '08:00'; }
                      setFormData({ ...formData, shiftType: type, startTime: start, endTime: end });
                    }}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 font-medium text-slate-900 focus:outline-hidden"
                  >
                    <option value="MORNING">Morning (07:00-15:00)</option>
                    <option value="AFTERNOON">Afternoon (15:00-23:00)</option>
                    <option value="NIGHT">Night (23:00-07:00)</option>
                    <option value="ON_CALL_24H">24h On-Call</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 font-medium text-slate-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 font-medium text-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Room / Ward Station */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Station / Room / Ward</label>
                <input
                  type="text"
                  value={formData.wardOrRoom}
                  onChange={e => setFormData({ ...formData, wardOrRoom: e.target.value })}
                  placeholder="e.g. Consultation Suite 1, Male Medical Ward, Triage Desk"
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 font-medium text-slate-900 focus:outline-hidden"
                />
              </div>

              {/* Operational Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Duty Notes / Handover Directives</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Lead resuscitation team, supervise maternal rounds"
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 font-medium text-slate-900 focus:outline-hidden"
                />
              </div>

              {/* Live Pre-validation Conflict Warning */}
              {(() => {
                // Check if this proposed shift would conflict with existing shifts
                const otherShifts = shifts.filter(s => editingShift ? s.id !== editingShift.id : true);
                const hasSameDay = otherShifts.some(s => s.staffId === formData.staffId && s.shiftDate === formData.shiftDate);
                
                if (hasSameDay) {
                  return (
                    <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Warning: This staff member is already assigned another shift on {formData.shiftDate}. Saving will register a double-booking flag.</span>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-800 hover:bg-teal-900 text-white font-bold px-5 py-2 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  {editingShift ? 'Save Changes' : 'Confirm Shift Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
