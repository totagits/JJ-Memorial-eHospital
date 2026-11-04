import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Pill, 
  Stethoscope, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Video,
  FileText
} from 'lucide-react';
import { Patient, Appointment } from '../../types/patient';
import { Prescription } from '../../types/clinical';

interface CareCalendarViewProps {
  patient: Patient;
  appointments: Appointment[];
  prescriptions: Prescription[];
  onOpenAppointmentModal: () => void;
}

export const CareCalendarView: React.FC<CareCalendarViewProps> = ({
  patient,
  appointments,
  prescriptions,
  onOpenAppointmentModal
}) => {
  // Current calendar month view state (November 2026 based on mock context)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 1)); // November 2026
  const [selectedDay, setSelectedDay] = useState<number>(3); // Nov 3rd

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 10 is November

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Compute days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayWeekday = new Date(year, month, 1).getDay(); // 0 is Sunday

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Find events for each day of month
  const getDayEvents = (dayNumber: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
    const dayAppointments = appointments.filter(a => a.date === dateStr);
    // Active prescriptions apply daily
    const activeMeds = prescriptions.filter(p => p.status === 'VERIFIED' || p.status === 'DISPENSED');

    return {
      appointments: dayAppointments,
      medications: activeMeds
    };
  };

  const selectedDateEvents = getDayEvents(selectedDay);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
            <CalendarIcon className="w-5 h-5 text-teal-700" />
            <span>Care & Medication Schedule Overview</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            Month-At-A-Glance Care Calendar
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Consolidated timeline of your physician visits, outpatient clinic follow-ups, and daily prescription administration schedules.
          </p>
        </div>

        <button
          onClick={onOpenAppointmentModal}
          className="bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          + Schedule New Consultation
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendar Grid (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-base text-slate-900">{monthName}</h3>
            <div className="flex items-center gap-1.5">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setCurrentDate(new Date(2026, 10, 1));
                  setSelectedDay(3);
                }}
                className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 py-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Empty offset days */}
            {Array.from({ length: firstDayWeekday }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 sm:h-24 bg-slate-50/50 rounded-xl" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const { appointments: dayApts, medications: dayMeds } = getDayEvents(day);
              const isSelected = selectedDay === day;
              const isToday = day === 3 && month === 10 && year === 2026;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`h-20 sm:h-24 p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'border-teal-700 bg-teal-50/40 ring-2 ring-teal-700/20 shadow-xs'
                      : isToday
                      ? 'border-teal-400 bg-white'
                      : 'border-slate-100 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-teal-800 text-white flex items-center justify-center font-mono text-[10px]'
                          : isSelected
                          ? 'text-teal-900 font-extrabold'
                          : 'text-slate-700'
                      }`}
                    >
                      {day}
                    </span>
                    {dayApts.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    )}
                  </div>

                  {/* Day Pills Preview */}
                  <div className="space-y-1 overflow-hidden">
                    {dayApts.length > 0 && (
                      <div className="bg-teal-700 text-white text-[9px] px-1.5 py-0.5 rounded font-medium truncate flex items-center gap-1">
                        <Stethoscope className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{dayApts[0].timeSlot}</span>
                      </div>
                    )}
                    {dayMeds.length > 0 && (
                      <div className="bg-indigo-50 text-indigo-800 border border-indigo-200 text-[9px] px-1.5 py-0.5 rounded font-medium truncate hidden sm:flex items-center gap-1">
                        <Pill className="w-2.5 h-2.5 text-indigo-600 shrink-0" />
                        <span className="truncate">{dayMeds.length} Meds</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block">Day Agenda</span>
              <h3 className="font-extrabold text-sm text-slate-900">
                November {selectedDay}, {year}
              </h3>
            </div>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
              {selectedDay === 3 ? 'Today' : 'Scheduled'}
            </span>
          </div>

          {/* Appointments on this day */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
              <span>Doctor Appointments ({selectedDateEvents.appointments.length})</span>
            </h4>

            {selectedDateEvents.appointments.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                No doctor consultations scheduled for this date.
              </p>
            ) : (
              selectedDateEvents.appointments.map(apt => (
                <div key={apt.id} className="p-3 bg-teal-50/60 border border-teal-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-teal-900">{apt.clinicianName}</span>
                    <span className="font-mono text-[10px] bg-white border border-teal-300 text-teal-800 px-1.5 py-0.5 rounded font-bold">
                      {apt.timeSlot}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">{apt.department} · {apt.reason}</div>
                  <div className="text-[10px] text-slate-500">Status: <strong className="text-teal-800">{apt.status}</strong></div>
                </div>
              ))
            )}
          </div>

          {/* Daily Prescriptions & Dosages */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-indigo-700" />
              <span>Medication Regimen ({selectedDateEvents.medications.length})</span>
            </h4>

            {selectedDateEvents.medications.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                No active prescriptions found.
              </p>
            ) : (
              selectedDateEvents.medications.map(rx => (
                <div key={rx.id} className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-950">{rx.medicationName}</span>
                    <span className="text-[10px] bg-white border border-indigo-300 text-indigo-800 px-1.5 py-0.5 rounded font-semibold">
                      {rx.dosage}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">{rx.frequency} · {rx.instructions}</div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-1 border-t border-indigo-100">
                    <Clock className="w-3 h-3 text-indigo-600" />
                    <span>Take with water after food</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
