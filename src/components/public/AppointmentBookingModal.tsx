import React, { useState } from 'react';
import { X, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialClinicianId?: string;
  initialDepartment?: string;
}

export const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  isOpen,
  onClose,
  initialClinicianId,
  initialDepartment,
}) => {
  const [requestId] = useState(() => crypto.randomUUID());

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    department: ['Pediatrics & Child Wellness', 'Maternal & Prenatal Health', 'Cardiology & Chronic Care', 'General Surgery Consult'].includes(initialDepartment ?? '') ? initialDepartment! : 'Internal Medicine & OPD',
    clinicianId: ['USR-001', 'USR-002'].includes(initialClinicianId ?? '') ? initialClinicianId! : '',
    date: '',
    timeSlot: '10:00 AM',
    reason: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const fields = Object.fromEntries(Object.entries(formData).map(([key, value]) => [key, value.trim()]));
      const response = await fetch('/api/registry/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, id: requestId }),
      });
      if (response.status !== 202) {
        throw new Error(response.status === 400
          ? 'Check your contact details, department, and preferred date before trying again.'
          : 'The request could not be saved. Please try again.');
      }
      const result = await response.json();
      setReceipt(result.id);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'The request could not be saved.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div role="dialog" aria-modal="true" aria-labelledby="appointment-heading" className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 id="appointment-heading" className="font-bold text-base">Request a clinical consultation</h3>
            <p className="text-xs text-slate-400">J & J Memorial Outpatient Appointment Scheduling</p>
          </div>
          <button
            type="button" aria-label="Close appointment form" disabled={isSubmitting} onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {receipt ? (
          <div className="p-8 text-center space-y-4" role="status">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Appointment request received</h4>
            <p className="text-sm text-slate-600">The requested time is pending scheduling review.</p>
            <p className="break-all text-sm">Reference <strong className="font-mono text-teal-800">{receipt}</strong></p>

            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={onClose}
                className="bg-teal-800 hover:bg-teal-900 text-white font-medium text-xs px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-sm text-slate-700">Staging form. Enter synthetic details only.</p>
            {errorMessage && (
              <div role="alert" className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="appointment-firstName">First Name *</label>
                <input
                  type="text"
                  required
                  id="appointment-firstName" value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="e.g. Blessing"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="appointment-lastName">Last Name *</label>
                <input
                  type="text"
                  required
                  id="appointment-lastName" value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="e.g. Kpadeh"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="appointment-phone">Phone Number (Liberia) *</label>
                <input
                  type="tel"
                  required
                  id="appointment-phone" value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+231-770-xxx-xxx"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="appointment-email">Email (Optional)</label>
                <input
                  type="email"
                  id="appointment-email" value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="patient@example.com"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="appointment-department">Department</label>
                <select
                  id="appointment-department" value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden bg-white"
                >
                  <option value="Internal Medicine & OPD">Internal Medicine & OPD</option>
                  <option value="Pediatrics & Child Wellness">Pediatrics & Child Wellness</option>
                  <option value="Maternal & Prenatal Health">Maternal & Prenatal Health</option>
                  <option value="Cardiology & Chronic Care">Cardiology & Chronic Care</option>
                  <option value="General Surgery Consult">General Surgery Consult</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="appointment-clinicianId">Preferred Clinician</label>
                <select
                  id="appointment-clinicianId" value={formData.clinicianId}
                  onChange={e => setFormData({ ...formData, clinicianId: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden bg-white"
                >
                  <option value="">No preference</option>
                  <option value="USR-002">Dr. Evelyn Sirleaf-Gbotoe, MD (OPD/Emergency)</option>
                  <option value="USR-001">Dr. J. Saydee Kollie, MD, FWACP (Medical Director)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="appointment-date">Appointment Date</label>
                <input
                  type="date" required min={new Date().toISOString().slice(0, 10)}
                  id="appointment-date" value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="appointment-timeSlot">Time Slot</label>
                <select
                  id="appointment-timeSlot" value={formData.timeSlot}
                  onChange={e => setFormData({ ...formData, timeSlot: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden bg-white"
                >
                  <option value="09:00 AM">09:00 AM - 09:30 AM</option>
                  <option value="10:00 AM">10:00 AM - 10:30 AM</option>
                  <option value="11:30 AM">11:30 AM - 12:00 PM</option>
                  <option value="02:00 PM">02:00 PM - 02:30 PM</option>
                  <option value="03:30 PM">03:30 PM - 04:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="appointment-reason">Reason for Visit / Chief Symptoms *</label>
              <textarea
                required
                rows={3} maxLength={500}
                id="appointment-reason" value={formData.reason}
                onChange={e => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Enter a short synthetic reason for the visit."
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="text-xs text-slate-600 hover:text-slate-900 px-4 py-2 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white font-medium text-xs px-5 py-2.5 rounded-lg transition-colors cursor-pointer flex items-center gap-2"
              >
                {isSubmitting ? (
                  <span>Saving request…</span>
                ) : (
                  <>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Submit appointment request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
