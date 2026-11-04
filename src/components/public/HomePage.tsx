import React from 'react';
import { 
  HeartPulse, 
  Stethoscope, 
  ShieldCheck, 
  Clock, 
  Microscope, 
  Pill, 
  Users, 
  Activity, 
  Award, 
  Zap, 
  PhoneCall, 
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
  onSwitchToStaff
}) => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white overflow-hidden py-16 md:py-24">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-300 bg-teal-950/80 border border-teal-700/50 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>Full-Service e-Hospital & Advanced Clinical Center · Monrovia</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Connected Care, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-200 to-emerald-300">
                Intelligent Operations.
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
              J & J Memorial combines certified medical specialists with modern digital health records, diagnostic precision, 24/7 power resilience, and seamless patient care from outpatient consultation to recovery.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onOpenAppointmentModal}
                className="inline-flex items-center gap-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-md transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Doctor Appointment</span>
              </button>

              <button
                onClick={() => onNavigate('portal')}
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-semibold text-sm px-5 py-3 rounded-lg transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-teal-400" />
                <span>Patient Portal Login</span>
              </button>

              <button
                onClick={() => onNavigate('doctors')}
                className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white text-sm font-medium px-3 py-2 cursor-pointer"
              >
                <span>Find a Doctor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Emergency Ribbon */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2 text-rose-300 font-medium">
                <PhoneCall className="w-4 h-4 text-rose-400" />
                <span>24/7 Acute Triage: +231 (0) 770-JJ-MEM</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Uninterrupted Power: 500kVA Cummins + Solar Grid</span>
              </div>
            </div>
          </div>

          {/* Quick Hospital Snapshot Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700/80 p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-white text-base">Hospital Operational Status</h3>
                  <p className="text-xs text-slate-400">Live Clinical & Facility Monitoring</p>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-1 rounded-full font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  All Services Active
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Outpatient Clinics</span>
                  <span className="text-lg font-bold text-white">Open</span>
                  <span className="text-[11px] text-teal-300 block mt-0.5">Average wait &lt; 15 mins</span>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Emergency Department</span>
                  <span className="text-lg font-bold text-emerald-400">24/7 Active</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Triage nurses on station</span>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Diagnostic Laboratory</span>
                  <span className="text-lg font-bold text-white">Full Panels</span>
                  <span className="text-[11px] text-teal-300 block mt-0.5">Automated 5-part hematology</span>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Pharmacy Dispensary</span>
                  <span className="text-lg font-bold text-white">FEFO Stocked</span>
                  <span className="text-[11px] text-teal-300 block mt-0.5">Quality verified drugs</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onOpenAppointmentModal}
                  className="w-full text-center bg-teal-700 hover:bg-teal-600 text-white font-medium text-xs py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  Request Consultation Slot
                </button>
              </div>
            </div>
          </div>
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
