import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Pill, User, CheckCircle } from 'lucide-react';

interface CalendarEvent {
  id: string;
  day: number;
  time: string;
  type: 'appointment' | 'medication' | 'lab';
  title: string;
  subtitle: string;
  doctorOrDetails: string;
}

const EVENTS: CalendarEvent[] = [
  {
    id: 'ev-1',
    day: 3,
    time: '14:00',
    type: 'lab',
    title: 'Complete Blood Count (CBC) Draw',
    subtitle: 'Diagnostic Lab',
    doctorOrDetails: 'Sando Coleman, Lab Tech',
  },
  {
    id: 'ev-2',
    day: 4,
    time: '08:00',
    type: 'medication',
    title: 'Coartem (4 tabs)',
    subtitle: 'Morning Dose with Food',
    doctorOrDetails: 'Artemether / Lumefantrine 20/120mg',
  },
  {
    id: 'ev-3',
    day: 4,
    time: '20:00',
    type: 'medication',
    title: 'Coartem (4 tabs)',
    subtitle: 'Night Dose',
    doctorOrDetails: 'Artemether / Lumefantrine 20/120mg',
  },
  {
    id: 'ev-4',
    day: 5,
    time: '09:30',
    type: 'appointment',
    title: 'Internal Medicine Follow-up',
    subtitle: 'Consulting Room 1',
    doctorOrDetails: 'Dr. Emmanuel Tamba, MD',
  },
  {
    id: 'ev-5',
    day: 7,
    time: '11:00',
    type: 'appointment',
    title: 'Pelvic Ultrasound Review',
    subtitle: 'Radiology Bay 2',
    doctorOrDetails: 'Dr. Sekou Massaquoi, MD',
  },
  {
    id: 'ev-6',
    day: 12,
    time: '10:00',
    type: 'appointment',
    title: 'Cardiovascular Blood Pressure Check',
    subtitle: 'Sinkor Branch Clinic',
    doctorOrDetails: 'Nurse Sarah Kiatamba, RN',
  },
];

export const PatientCalendarView: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState('November 2026');
  const [selectedDay, setSelectedDay] = useState<number>(4);

  // 30 days in November 2026. November 1, 2026 is a Sunday (0 offset).
  const daysInMonth = 30;
  const startDayOffset = 0; // Sunday

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyPrefix = Array.from({ length: startDayOffset }, (_, i) => i);

  const selectedDayEvents = EVENTS.filter((e) => e.day === selectedDay);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-lg font-bold text-hospital-navy flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-teal-600" />
            <span>Care Calendar & Schedule Overview</span>
          </h3>
          <p className="text-xs text-slate-500">
            Month-at-a-glance view aggregating upcoming consultations, medication routines, and lab draws.
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center space-x-2">
          <span className="font-extrabold text-sm text-hospital-navy px-3 py-1 bg-slate-100 rounded-lg">
            {currentMonth}
          </span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentMonth('October 2026')}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentMonth('November 2026')}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-2">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 py-1 uppercase tracking-wider">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Month Cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {emptyPrefix.map((_, idx) => (
            <div key={`empty-${idx}`} className="h-20 sm:h-24 bg-slate-50/50 rounded-xl" />
          ))}

          {days.map((day) => {
            const isToday = day === 3;
            const isSelected = day === selectedDay;
            const dayEvents = EVENTS.filter((e) => e.day === day);

            return (
              <div
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`h-20 sm:h-24 p-1.5 sm:p-2 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-teal-500 bg-teal-50/40 ring-2 ring-teal-500'
                    : isToday
                    ? 'border-amber-400 bg-amber-50/30'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday
                        ? 'bg-amber-400 text-slate-950 font-extrabold'
                        : isSelected
                        ? 'bg-teal-600 text-white'
                        : 'text-slate-700'
                    }`}
                  >
                    {day}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 hidden sm:block" />
                  )}
                </div>

                {/* Event previews inside cell */}
                <div className="space-y-1 overflow-hidden">
                  {dayEvents.slice(0, 2).map((ev) => (
                    <div
                      key={ev.id}
                      className={`text-[9px] sm:text-[10px] font-semibold truncate px-1.5 py-0.5 rounded ${
                        ev.type === 'appointment'
                          ? 'bg-teal-100 text-teal-800'
                          : ev.type === 'medication'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {ev.time} {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="text-[9px] text-slate-400 font-bold block">
                      +{dayEvents.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Agenda Box */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-hospital-navy uppercase tracking-wider">
            Schedule for November {selectedDay}, 2026 ({selectedDayEvents.length} scheduled items)
          </span>
          <span className="text-[11px] text-slate-400">Click any date above to inspect</span>
        </div>

        {selectedDayEvents.length === 0 ? (
          <p className="text-xs text-slate-500 py-2 italic">
            No consultations or medication events scheduled for this day.
          </p>
        ) : (
          <div className="space-y-2">
            {selectedDayEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                      ev.type === 'appointment'
                        ? 'bg-teal-100 text-teal-700'
                        : ev.type === 'medication'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {ev.type === 'appointment' && <User className="w-4 h-4" />}
                    {ev.type === 'medication' && <Pill className="w-4 h-4" />}
                    {ev.type === 'lab' && <Clock className="w-4 h-4" />}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">
                      {ev.title}
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      {ev.subtitle} &bull; <strong>{ev.doctorOrDetails}</strong>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono text-xs font-bold text-hospital-navy">
                    {ev.time}
                  </span>
                  <span className="block text-[10px] text-teal-600 font-semibold uppercase">
                    {ev.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
