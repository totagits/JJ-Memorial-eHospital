import React, { useState } from 'react';
import { dbStore } from '../../services/dbStore';
import { X, Calendar, Clock, User, Phone, CheckCircle2 } from 'lucide-react';

interface PublicAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedDoctor?: string;
  preselectedSpecialty?: string;
}

export const PublicAppointmentModal: React.FC<PublicAppointmentModalProps> = ({
  isOpen,
  onClose,
  preselectedDoctor = '',
  preselectedSpecialty = '',
}) => {
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredDate, setPreferredDate] = useState('2026-11-05');
  const [preferredTime, setPreferredTime] = useState('10:00');
  const [department, setDepartment] = useState(preselectedSpecialty || 'Internal Medicine');
  const [doctorName, setDoctorName] = useState(preselectedDoctor || 'Dr. Emmanuel Tamba, MD');
  const [reason, setReason] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !phone) return;

    dbStore.addActivity({
      type: 'Appointment',
      actor: patientName,
      description: `Requested appointment with ${doctorName} for ${preferredDate} at ${preferredTime}`,
    });

    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <button
          onClick={handleReset}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-extrabold text-hospital-navy">
              Appointment Request Confirmed!
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Thank you, <strong>{patientName}</strong>. Your consultation request with{' '}
              <strong>{doctorName}</strong> on <strong>{preferredDate}</strong> at{' '}
              <strong>{preferredTime}</strong> has been received by our scheduling desk.
            </p>
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800">
              An SMS confirmation & email reminder will be sent to <strong>{phone}</strong>.
            </div>
            <button
              onClick={handleReset}
              className="mt-4 px-6 py-2.5 rounded-xl bg-hospital-navy text-white font-bold text-xs uppercase tracking-wider hover:bg-hospital-navy-light"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[11px] font-bold uppercase tracking-wider border border-teal-200">
                <Calendar className="w-3.5 h-3.5" />
                <span>Online Appointment Booking</span>
              </div>
              <h2 className="text-xl font-extrabold text-hospital-navy mt-1">
                Schedule a Consultation
              </h2>
              <p className="text-xs text-slate-500">
                Choose your preferred doctor, date, and medical department.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Patient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Korto Kollie"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number (SMS Alert) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+231 77 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="patient@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Preferred Date</label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Preferred Time</label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="08:30">08:30 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:30">11:30 AM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:30">03:30 PM</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Internal Medicine">Internal Medicine</option>
                    <option value="Emergency & Triage">Emergency & Triage</option>
                    <option value="Surgery">General Surgery</option>
                    <option value="Pediatrics">Pediatrics & Neonatal</option>
                    <option value="Maternal & Child Health">Maternal & Child Health</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Doctor</label>
                  <select
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Dr. Emmanuel Tamba, MD">Dr. Emmanuel Tamba, MD (Internal Med)</option>
                    <option value="Dr. Fatumata Fofana, MD">Dr. Fatumata Fofana, MD (Emergency)</option>
                    <option value="Dr. Christian Nyenpan, FACS">Dr. Christian Nyenpan, FACS (Surgery)</option>
                    <option value="Dr. Moses Weah, MD">Dr. Moses Weah, MD (Pediatrics)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Visit / Symptoms</label>
                <textarea
                  rows={2}
                  placeholder="Briefly describe your symptoms or reason for visit..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
              >
                Confirm Appointment
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
