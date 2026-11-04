import React from 'react';

interface CTABannerProps {
  onBookAppointment: () => void;
  onGoPatientPortal: () => void;
}

export const CTABanner: React.FC<CTABannerProps> = ({
  onBookAppointment,
  onGoPatientPortal,
}) => {
  return (
    <section
      className="py-16 px-4 sm:px-6 lg:px-8"
      style={{ background: 'linear-gradient(135deg, #0f4c3f 0%, #1e3a4a 100%)' }}
    >
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
        {/* Left text */}
        <div className="lg:max-w-xl space-y-4 text-center lg:text-left">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
            Ready to Consult with an Attending Physician?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Book your{' '}
            <span className="text-teal-300 font-semibold">appointment</span> online, bypass
            front desk queues, and access your doctor-approved clinical{' '}
            <span className="text-teal-300 font-semibold">summaries</span> and{' '}
            <span className="text-teal-300 font-semibold">lab reports</span> securely through your{' '}
            <span className="text-teal-300 font-semibold">patient portal</span>.
          </p>
        </div>

        {/* Right buttons */}
        <div className="flex flex-col sm:flex-row gap-4 shrink-0">
          <button
            onClick={onBookAppointment}
            className="px-7 py-3.5 rounded-xl border-2 border-white text-white font-bold text-sm hover:bg-white hover:text-teal-900 transition"
          >
            Book Appointment Now
          </button>
          <button
            onClick={onGoPatientPortal}
            className="px-7 py-3.5 rounded-xl border-2 border-teal-300 text-teal-200 font-bold text-sm hover:bg-teal-300/20 transition"
          >
            Access Patient Portal
          </button>
        </div>
      </div>
    </section>
  );
};
