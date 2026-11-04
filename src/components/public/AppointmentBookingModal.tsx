import React, { useState } from 'react';
import { X, Calendar, Clock, User, Phone, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { getDatabaseState, updateDatabaseState, logAuditEvent } from '../../services/storageService';
import { Appointment } from '../../types/patient';

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (appointment: Appointment) => void;
}

export const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const db = getDatabaseState();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    department: 'Internal Medicine & OPD',
    clinicianId: 'USR-002',
    date: '2026-11-04',
    timeSlot: '10:00 AM',
    reason: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.phone.trim()) {
      setErrorMessage('Please provide your full name and valid phone number.');
      return;
    }

    if (!formData.reason.trim()) {
      setErrorMessage('Please describe the reason for your visit so the clinical team can prepare.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const clinician = db.users.find(u => u.id === formData.clinicianId) || db.users[1];
      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;

      // Check if patient already exists by phone
      const existingPatient = db.patients.find(p => p.phone.replace(/[^0-9]/g, '').endsWith(formData.phone.replace(/[^0-9]/g, '')));
      const patientId = existingPatient ? existingPatient.id : `PAT-REG-${Date.now().toString().slice(-4)}`;

      const newAppointment: Appointment = {
        id: `APT-${Date.now().toString().slice(-5)}`,
        patientId,
        patientName: fullName,
        patientPhone: formData.phone,
        patientEmail: formData.email,
        department: formData.department,
        clinicianId: clinician.id,
        clinicianName: clinician.fullName,
        date: formData.date,
        timeSlot: formData.timeSlot,
        reason: formData.reason,
        type: 'OUTPATIENT_CONSULT',
        status: 'CONFIRMED',
        bookedVia: 'PUBLIC_PORTAL',
        createdAt: new Date().toISOString(),
      };

      updateDatabaseState(draft => {
        draft.appointments.unshift(newAppointment);
      });

      logAuditEvent({
        userId: 'PUBLIC_PATIENT',
        userName: fullName,
        userRole: 'patient',
        action: 'CREATE',
        module: 'OPD',
        patientId,
        details: `Public online appointment booked for ${formData.date} at ${formData.timeSlot} with ${clinician.fullName}.`,
        ipAddress: 'Patient Web Portal Client',
        status: 'SUCCESS',
      });

      setIsSubmitting(false);
      setConfirmedAppointment(newAppointment);
      onSuccess(newAppointment);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base">Book Clinical Consultation</h3>
            <p className="text-xs text-slate-400">J & J Memorial Outpatient Appointment Scheduling</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedAppointment ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Appointment Confirmed!</h4>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Your appointment token is <span className="font-mono font-bold text-teal-800">{confirmedAppointment.id}</span>.
              A confirmation SMS has been prepared for <span className="font-semibold">{confirmedAppointment.patientPhone}</span>.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-500">Patient:</span>
                <span className="font-semibold text-slate-900">{confirmedAppointment.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Physician:</span>
                <span className="font-semibold text-slate-900">{confirmedAppointment.clinicianName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Slot:</span>
                <span className="font-semibold text-teal-800">{confirmedAppointment.date} at {confirmedAppointment.timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="font-semibold text-slate-900">{confirmedAppointment.department}</span>
              </div>
            </div>

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
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="e.g. Blessing"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="e.g. Kpadeh"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (Liberia) *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+231-770-xxx-xxx"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="patient@example.com"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={formData.department}
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Clinician</label>
                <select
                  value={formData.clinicianId}
                  onChange={e => setFormData({ ...formData, clinicianId: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden bg-white"
                >
                  <option value="USR-002">Dr. Evelyn Sirleaf-Gbotoe, MD (OPD/Emergency)</option>
                  <option value="USR-001">Dr. J. Saydee Kollie, MD, FWACP (Medical Director)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Appointment Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Time Slot</label>
                <select
                  value={formData.timeSlot}
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Visit / Chief Symptoms *</label>
              <textarea
                required
                rows={3}
                value={formData.reason}
                onChange={e => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Briefly state symptoms, duration, and any existing medical conditions..."
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
              <button
                type="button"
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
                  <span>Checking Availability...</span>
                ) : (
                  <>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Confirm Booking</span>
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
