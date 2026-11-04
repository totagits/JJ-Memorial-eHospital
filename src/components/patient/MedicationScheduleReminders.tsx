import React, { useState } from 'react';
import { notificationService } from '../../services/notifications';
import { Pill, Bell, BellRing, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

interface MedicationDose {
  id: string;
  name: string;
  dosage: string;
  timeSlot: 'Morning (08:00)' | 'Afternoon (13:00)' | 'Night (20:00)';
  instructions: string;
  isTakenToday: boolean;
  prescribedBy: string;
}

const INITIAL_DOSES: MedicationDose[] = [
  {
    id: 'dose-1',
    name: 'Artemether / Lumefantrine (Coartem) 20/120mg',
    dosage: '4 Tablets',
    timeSlot: 'Morning (08:00)',
    instructions: 'Take with fatty meal or milk for proper absorption.',
    isTakenToday: true,
    prescribedBy: 'Dr. Emmanuel Tamba, MD',
  },
  {
    id: 'dose-2',
    name: 'Artemether / Lumefantrine (Coartem) 20/120mg',
    dosage: '4 Tablets',
    timeSlot: 'Night (20:00)',
    instructions: 'Complete full 3-day course without stopping.',
    isTakenToday: false,
    prescribedBy: 'Dr. Emmanuel Tamba, MD',
  },
  {
    id: 'dose-3',
    name: 'Paracetamol 500mg',
    dosage: '2 Tablets',
    timeSlot: 'Afternoon (13:00)',
    instructions: 'Take if fever > 38C or body aches persist.',
    isTakenToday: false,
    prescribedBy: 'Dr. Emmanuel Tamba, MD',
  },
];

export const MedicationScheduleReminders: React.FC = () => {
  const [doses, setDoses] = useState<MedicationDose[]>(INITIAL_DOSES);
  const [hasPermission, setHasPermission] = useState<boolean>(() => notificationService.isGranted());
  const [testNotificationSent, setTestNotificationSent] = useState(false);

  const handleRequestPermission = async () => {
    const granted = await notificationService.requestPermission();
    setHasPermission(granted);
    if (granted) {
      notificationService.sendNotification(
        'J & J Memorial Medication Reminders Enabled',
        'You will now receive automated browser chime reminders at 08:00, 13:00, and 20:00 for your doses.'
      );
    }
  };

  const handleTriggerTestReminder = () => {
    notificationService.sendNotification(
      'MEDICATION REMINDER: Coartem (4 tabs)',
      'Time for your scheduled evening dose (20:00). Please take with food or milk.',
      true
    );
    setTestNotificationSent(true);
    setTimeout(() => setTestNotificationSent(false), 4000);
  };

  const toggleTaken = (id: string) => {
    setDoses((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isTakenToday: !d.isTakenToday } : d))
    );
  };

  const completedCount = doses.filter((d) => d.isTakenToday).length;
  const adherencePercent = Math.round((completedCount / doses.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <Pill className="w-3.5 h-3.5" />
            <span>Automated Pharmacotherapy Reminders</span>
          </div>
          <h2 className="text-2xl font-extrabold text-hospital-navy mt-1">
            Medication Schedule & Push Reminders
          </h2>
          <p className="text-xs text-slate-500">
            Never miss a dose. Track active prescriptions and receive browser chime notifications at scheduled intake times.
          </p>
        </div>

        {/* Notification toggle buttons */}
        <div className="flex items-center space-x-2">
          {!hasPermission ? (
            <button
              onClick={handleRequestPermission}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
            >
              <Bell className="w-4 h-4" />
              <span>Enable Browser Push Alerts</span>
            </button>
          ) : (
            <button
              onClick={handleTriggerTestReminder}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-hospital-navy hover:bg-hospital-navy-light text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
            >
              <BellRing className="w-4 h-4 text-amber-300" />
              <span>Test Push Chime Now</span>
            </button>
          )}
        </div>
      </div>

      {testNotificationSent && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Browser push notification & audio alert dispatched successfully!</span>
        </div>
      )}

      {/* Daily Adherence Progress */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Today's Adherence Rate
          </span>
          <div className="text-2xl font-extrabold text-hospital-navy flex items-center gap-2">
            <span>{adherencePercent}%</span>
            <span className="text-xs font-medium text-slate-500">
              ({completedCount} of {doses.length} doses taken)
            </span>
          </div>
        </div>

        <div className="w-full sm:w-64 bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
          <div
            className="bg-teal-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${adherencePercent}%` }}
          />
        </div>
      </div>

      {/* Medication Dose Cards */}
      <div className="space-y-3.5">
        <h4 className="font-bold text-hospital-navy text-sm">
          Active Prescription Intake Routine (Today)
        </h4>

        {doses.map((dose) => (
          <div
            key={dose.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              dose.isTakenToday
                ? 'bg-slate-50/70 border-slate-200 opacity-80'
                : 'bg-white border-teal-300 shadow-sm ring-1 ring-teal-200'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                  dose.isTakenToday ? 'bg-slate-200 text-slate-500' : 'bg-teal-100 text-teal-700'
                }`}
              >
                <Pill className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h5 className="font-bold text-slate-900 text-sm">
                    {dose.name}
                  </h5>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                    {dose.dosage}
                  </span>
                </div>

                <p className="text-xs text-slate-600 flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Scheduled Time: <strong>{dose.timeSlot}</strong></span>
                </p>

                <p className="text-xs text-slate-500 italic">
                  &ldquo;{dose.instructions}&rdquo;
                </p>

                <span className="text-[10px] text-slate-400 block">
                  Prescribed by: {dose.prescribedBy}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={() => toggleTaken(dose.id)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center space-x-1.5 ${
                  dose.isTakenToday
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                    : 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{dose.isTakenToday ? 'Marked as Taken' : 'Mark as Taken'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
