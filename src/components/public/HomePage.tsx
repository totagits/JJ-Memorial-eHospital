import React, { useEffect, useRef, useState } from 'react';
import { 
  HeartPulse, 
  Stethoscope, 
  ShieldCheck, 
  Clock, 
  Microscope, 
  Pill, 
  Users, 
  Award, 
  Zap, 
  Pause,
  Play,
  Calendar, 
  ArrowRight,
  Baby,
  Crosshair,
  Building2,
  FileText
} from 'lucide-react';
import { PatientTestimonials } from './PatientTestimonials';
import { FacilityLocator } from './FacilityLocator';
import { HospitalNewsSection } from './HospitalNewsSection';
import { FaqSection } from './FaqSection';
import { PartnershipsSection } from './PartnershipsSection';

interface HomePageProps {
  onNavigate: (tab: string) => void;
  onOpenAppointmentModal: () => void;
  onSwitchToStaff: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenAppointmentModal,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [videoUnavailable, setVideoUnavailable] = useState(false);

  useEffect(() => {
    const desktopMotion = window.matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)');
    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;
    const constrainedConnection = connection?.saveData || ['slow-2g', '2g', '3g'].includes(connection?.effectiveType ?? '');
    const video = videoRef.current;
    if (desktopMotion.matches && !constrainedConnection) {
      void video?.play().catch(() => undefined);
    }
    const pauseWhenMotionDisabled = () => {
      if (!desktopMotion.matches) video?.pause();
    };
    desktopMotion.addEventListener('change', pauseWhenMotionDisabled);
    return () => desktopMotion.removeEventListener('change', pauseWhenMotionDisabled);
  }, []);

  const toggleVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().catch(() => setVideoUnavailable(true));
    } else {
      video.pause();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="grid overflow-hidden bg-slate-950 text-white lg:min-h-[36rem] lg:grid-cols-[1fr_1fr]" aria-labelledby="home-hero-title">
        <div className="flex items-center bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950">
          <div className="w-full px-5 py-12 sm:px-10 lg:py-16 lg:pl-[max(2.5rem,calc((100vw-84rem)/2))] lg:pr-8 xl:pr-12">
            <p className="mb-5 text-sm font-semibold text-teal-300">
              Full-Service e-Hospital &amp; Advanced Clinical Center · Monrovia
            </p>
            <h1 id="home-hero-title" className="text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl xl:text-6xl">
              Connected Care,<br />
              <span className="text-teal-300">Intelligent Operations.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg">
              J &amp; J Memorial combines certified medical specialists with modern digital health records, diagnostic
              precision, 24/7 power resilience, and seamless patient care from outpatient consultation to recovery.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button type="button" onClick={onOpenAppointmentModal}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold hover:bg-teal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                <Calendar aria-hidden="true" size={17} /> Book Doctor Appointment
              </button>
              <button type="button" onClick={() => onNavigate('portal')}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-500 px-4 py-3 text-sm font-semibold hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                <FileText aria-hidden="true" size={17} /> Patient Portal Login
              </button>
              <button type="button" onClick={() => onNavigate('doctors')}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                Find a Doctor <ArrowRight aria-hidden="true" size={17} />
              </button>
            </div>
          </div>
        </div>
        <div className="relative aspect-video overflow-hidden bg-slate-800 lg:aspect-auto">
            <video
              ref={videoRef}
              src="/media/jjmemorial-facility.mp4"
              poster="/media/jjmemorial-exterior.webp"
              className="absolute inset-0 h-full w-full object-cover"
              preload="none"
              muted
              loop
              playsInline
              aria-label="J & J Memorial facility preview"
              onPlaying={() => {
                setPlaying(true);
                setHasPlayed(true);
              }}
              onPause={() => setPlaying(false)}
              onError={() => setVideoUnavailable(true)}
            />
            {videoUnavailable ? (
              <span className="absolute bottom-3 right-3 rounded-lg bg-slate-950/90 px-3 py-2 text-sm">
                Video unavailable
              </span>
            ) : (
              <button
                type="button"
                onClick={toggleVideo}
                className="absolute bottom-3 right-3 inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-950/90 px-4 text-sm font-semibold text-white ring-1 ring-white/30 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {playing ? <Pause aria-hidden="true" size={17} /> : <Play aria-hidden="true" size={17} />}
                {playing ? 'Pause video' : hasPlayed ? 'Resume video' : 'Watch video'}
              </button>
            )}
        </div>
      </section>

      {/* Clinical Specialties & Departments */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-800 block mb-2">
            Integrated Medical Specialties
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Comprehensive Clinical Care for All Generations
          </h2>
          <p className="text-slate-600 text-sm mt-3 leading-relaxed">
            Every clinical specialty is supervised by licensed physicians and nurses, supported by digitized clinical decision pathways and electronic medical records.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-teal-300 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Internal Medicine & OPD</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Diagnosis and longitudinal management of hypertension, diabetes mellitus, cardiovascular conditions, infectious diseases, and routine health maintenance.
            </p>
            <div className="text-xs text-teal-800 font-semibold flex items-center gap-1 cursor-pointer" onClick={() => onNavigate('services')}>
              <span>View Clinic Protocols</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-teal-300 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center mb-4">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">24/7 Emergency & Acute Triage</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Immediate stabilization, trauma resuscitation, severe malaria management, acute asthma therapy, and standardized South African/WHO triage acuity grading.
            </p>
            <div className="text-xs text-rose-700 font-semibold flex items-center gap-1 cursor-pointer" onClick={() => onNavigate('services')}>
              <span>Emergency Guidelines</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-teal-300 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-4">
              <Baby className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Maternal, Neonatal & Pediatrics</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Prenatal screening, safe maternity deliveries, postnatal monitoring, child wellness, EPI immunizations, and sickle cell disease supportive management.
            </p>
            <div className="text-xs text-purple-700 font-semibold flex items-center gap-1 cursor-pointer" onClick={() => onNavigate('services')}>
              <span>Maternal Health Services</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-teal-300 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center mb-4">
              <Microscope className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Diagnostic Laboratory (LIS)</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Fully automated 5-part hematology, blood smear parasitology, clinical chemistry, renal/liver panels, and urgent cross-matching with strict specimen chain-of-custody.
            </p>
            <div className="text-xs text-cyan-800 font-semibold flex items-center gap-1 cursor-pointer" onClick={() => onNavigate('services')}>
              <span>Diagnostic Test Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 5 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-teal-300 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <Pill className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Pharmacy & Therapeutics</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Licensed pharmacists verify dosage and allergy safety before dispensing. First-Expired-First-Out (FEFO) batch tracking guarantees genuine, unexpired medications.
            </p>
            <div className="text-xs text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer" onClick={() => onNavigate('services')}>
              <span>Formulary & Safety Policy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 6 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-teal-300 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Inpatient Wards & Recovery</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Dedicated Male, Female, and Pediatric wards, surgical recovery suites, high-dependency care, daily physician rounds, and electronic medication administration.
            </p>
            <div className="text-xs text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer" onClick={() => onNavigate('services')}>
              <span>Inpatient Amenities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* Why J & J Memorial: Clinical & Operational Distinction */}
      <section className="bg-slate-100 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 block mb-2">
              The Enterprise Difference
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Built on Unyielding Infrastructure, Clinical Governance, and Integrity
            </h2>
            <p className="text-slate-600 text-sm mt-3 leading-relaxed">
              In a region where power outages and lost paper records can impede healthcare delivery, J & J Memorial e-Hospital operates on robust engineering standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-2">24/7 Power Assurance</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dual Cummins 500kVA prime diesel generators paired with 80kW hybrid solar and UPS battery banks to keep life-support and laboratories powered continuously.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-2">Immutable Digital Records</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Unique permanent MRN identifiers, complete audit trails, and zero chart loss. Your diagnostic reports and medication histories stay intact over time.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-2">Dual Currency Transparency</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clear billing in USD and LRD with itemized official receipts, verified QR codes, and automated double-entry accounting reconciliation.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-2">Clinician-Supervised Release</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Laboratory results are reviewed by licensed laboratory scientists and attending doctors before publication to the Patient Portal, preventing unnecessary distress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Patient Action Call-out */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-2xl p-8 md:p-12 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to Consult with an Attending Physician?
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Book your appointment online, bypass front desk queues, and access your doctor-approved clinical summaries and lab reports securely through your patient portal.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={onOpenAppointmentModal}
              className="bg-white hover:bg-slate-100 text-teal-950 font-bold text-sm px-6 py-3 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Book Appointment Now
            </button>
            <button
              onClick={() => onNavigate('portal')}
              className="bg-teal-800/80 hover:bg-teal-800 text-white font-medium text-sm px-5 py-3 rounded-lg border border-teal-600/50 transition-colors cursor-pointer"
            >
              Access Patient Portal
            </button>
          </div>
        </div>
      </section>

      {/* Verified Patient Testimonials Showcase */}
      <PatientTestimonials />

      {/* Facility Locator & Branch Locations */}
      <FacilityLocator />

      {/* Hospital News & Community Bulletins */}
      <HospitalNewsSection />

      {/* Frequently Asked Questions */}
      <FaqSection />

      {/* Health Insurance & Institutional Partnerships */}
      <PartnershipsSection />
    </div>
  );
};
