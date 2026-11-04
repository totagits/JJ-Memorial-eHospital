import React, { useState } from 'react';
import { Video, Calendar, Clock, User, Mic, MicOff, Camera, CameraOff, PhoneOff, MessageSquare, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';

interface TelehealthSlot {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'Confirmed' | 'In Progress' | 'Completed';
  meetingRoomUrl: string;
  sendEmailReminder: boolean;
}

const INITIAL_SESSIONS: TelehealthSlot[] = [
  {
    id: 'tel-1',
    doctorName: 'Dr. Emmanuel Tamba, MD',
    specialty: 'Internal Medicine Follow-up',
    date: '2026-11-06',
    time: '14:30',
    status: 'Confirmed',
    meetingRoomUrl: 'https://meet.jjmemorial.totag.network/room-tamba-7791',
    sendEmailReminder: true,
  },
];

export const TelehealthModule: React.FC = () => {
  const [sessions, setSessions] = useState<TelehealthSlot[]>(INITIAL_SESSIONS);
  const [activeCallSession, setActiveCallSession] = useState<TelehealthSlot | null>(null);

  // Booking states
  const [isBooking, setIsBooking] = useState(false);
  const [doctorName, setDoctorName] = useState('Dr. Emmanuel Tamba, MD');
  const [specialty, setSpecialty] = useState('Internal Medicine');
  const [date, setDate] = useState('2026-11-08');
  const [time, setTime] = useState('11:00');
  const [emailReminder, setEmailReminder] = useState(true);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Call simulation states
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const handleBookSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const newSession: TelehealthSlot = {
      id: `tel-${Date.now()}`,
      doctorName,
      specialty,
      date,
      time,
      status: 'Confirmed',
      meetingRoomUrl: `https://meet.jjmemorial.totag.network/room-${Math.random().toString(36).substr(2, 6)}`,
      sendEmailReminder: emailReminder,
    };

    setSessions([newSession, ...sessions]);
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setIsBooking(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <Video className="w-3.5 h-3.5" />
            <span>Virtual Care & Telemedicine</span>
          </div>
          <h2 className="text-2xl font-extrabold text-hospital-navy mt-1">
            Telehealth Consultations
          </h2>
          <p className="text-xs text-slate-500">
            Book future encrypted video appointments with clinical specialists, complete with calendar sync and email reminders.
          </p>
        </div>

        <button
          onClick={() => setIsBooking(!isBooking)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
        >
          <Calendar className="w-4 h-4" />
          <span>{isBooking ? 'Close Booking' : 'Book Video Slot'}</span>
        </button>
      </div>

      {/* Booking Form Overlay */}
      {isBooking && (
        <form onSubmit={handleBookSlot} className="p-6 bg-slate-50 rounded-2xl border border-teal-300 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-hospital-navy text-sm">
              Schedule Future Telehealth Appointment
            </h4>
            <span className="text-xs text-teal-700 font-semibold flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> Automated Email / SMS Reminders Enabled
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Doctor</label>
              <select
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="Dr. Emmanuel Tamba, MD">Dr. Emmanuel Tamba, MD (Internist)</option>
                <option value="Dr. Fatumata Fofana, MD">Dr. Fatumata Fofana, MD (Acute Care)</option>
                <option value="Dr. Moses Weah, MD">Dr. Moses Weah, MD (Pediatrics)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Clinical Specialty</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="Internal Medicine Follow-up">Internal Medicine Follow-up</option>
                <option value="Pediatric Virtual Wellness">Pediatric Virtual Wellness</option>
                <option value="Chronic Hypertension Review">Chronic Hypertension Review</option>
                <option value="Medication Reconciliation">Medication Reconciliation</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Consultation Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Available Slot</label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="09:00">09:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="14:30">02:30 PM</option>
                <option value="16:00">04:00 PM</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={emailReminder}
                onChange={(e) => setEmailReminder(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-slate-300"
              />
              <span>Send me calendar invite (.ics) & 24h prior email reminders</span>
            </label>

            <div className="flex items-center space-x-3">
              {bookingSuccess && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Slot Confirmed!
                </span>
              )}
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
              >
                Confirm Video Slot
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Live Video Room Call Simulation (When user enters room) */}
      {activeCallSession && (
        <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-white space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Encrypted WebRTC Telehealth Session Live
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Room: {activeCallSession.doctorName}
            </span>
          </div>

          {/* Video Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-64 sm:h-80">
            {/* Clinician Tile */}
            <div className="bg-slate-900 rounded-xl overflow-hidden relative flex items-center justify-center border border-slate-800">
              <img
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80"
                alt="Doctor Feed"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded text-xs font-bold text-white flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-400" />
                <span>{activeCallSession.doctorName} (Online)</span>
              </div>
            </div>

            {/* Patient Tile */}
            <div className="bg-slate-900 rounded-xl overflow-hidden relative flex items-center justify-center border border-slate-800">
              {isCameraOff ? (
                <div className="text-center text-slate-500 text-xs font-semibold">
                  <CameraOff className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  Your Camera is Off
                </div>
              ) : (
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80"
                  alt="Patient Feed"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded text-xs font-bold text-white flex items-center gap-1.5">
                <span>You (Patient)</span>
                {isMuted && <span className="text-rose-400 text-[10px]">[Muted]</span>}
              </div>
            </div>
          </div>

          {/* Call Controls Toolbar */}
          <div className="flex items-center justify-center space-x-4 pt-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-full transition ${
                isMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsCameraOff(!isCameraOff)}
              className={`p-3 rounded-full transition ${
                isCameraOff ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title={isCameraOff ? 'Start Camera' : 'Stop Camera'}
            >
              {isCameraOff ? <CameraOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setActiveCallSession(null)}
              className="px-5 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition shadow-lg"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Leave Video Room</span>
            </button>
          </div>
        </div>
      )}

      {/* Booked Sessions List */}
      <div className="space-y-3.5">
        <h4 className="font-bold text-hospital-navy text-sm">
          Upcoming Scheduled Virtual Consultations ({sessions.length})
        </h4>

        {sessions.map((sess) => (
          <div
            key={sess.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                <Video className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h5 className="font-bold text-slate-900 text-sm">
                    {sess.specialty}
                  </h5>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Confirmed Slot
                  </span>
                </div>

                <div className="text-xs text-slate-600 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-teal-600" />
                  <span>Clinician: <strong>{sess.doctorName}</strong></span>
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-3">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Calendar className="w-3.5 h-3.5" /> {sess.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {sess.time}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={() => setActiveCallSession(sess)}
                className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition flex items-center space-x-1.5 shadow-sm"
              >
                <Video className="w-4 h-4" />
                <span>Join Video Room</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
