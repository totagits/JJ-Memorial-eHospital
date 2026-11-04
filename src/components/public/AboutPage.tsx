import React from 'react';
import { ShieldCheck, Award, Users, HeartPulse, Building2, Zap, CheckCircle2, FileText } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
            About J & J Memorial
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Connected Care, Intelligent Operations
          </h1>
          <p className="text-slate-600 text-base leading-relaxed">
            Established to advance healthcare delivery across Monrovia and Montserrado County through clinically governed medicine, modern digital health records, and unwavering infrastructure reliability.
          </p>
        </div>

        {/* Mission & Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Our Clinical Mission</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              To deliver compassionate, evidence-based, and patient-centered clinical care to every individual regardless of background. We ensure every diagnosis is validated, every prescription is reviewed for drug safety, and every patient encounter is treated with dignity.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-800 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Our Operational Vision</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              To set the benchmark for digital healthcare infrastructure in West Africa. By uniting electronic health records (EMR), hospital enterprise resource planning (ERP), and 24/7 electrical micro-grid resilience, we eliminate administrative bottlenecks and zero chart loss.
            </p>
          </div>
        </div>

        {/* Clinical Governance & Safety Framework */}
        <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10 shadow-lg space-y-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-teal-400" />
            <div>
              <h3 className="text-xl font-bold text-white">Clinical Safety & Governance Charter</h3>
              <p className="text-xs text-slate-400">Strict adherence to Liberian MOH Guidelines & International Best Practices</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-xs">
            <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700/60 space-y-2">
              <span className="font-bold text-teal-300 text-sm block">1. Licensed Medical Staff</span>
              <p className="text-slate-300 leading-relaxed">
                All attending physicians, nurses, laboratory scientists, and pharmacists hold active licenses registered with the LMDC, LBNM, LMBA, and LPB.
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700/60 space-y-2">
              <span className="font-bold text-teal-300 text-sm block">2. Supervised Results Release</span>
              <p className="text-slate-300 leading-relaxed">
                No diagnostic test result or pathology report is published to the patient portal without supervisory clinical sign-off, protecting patient peace of mind.
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700/60 space-y-2">
              <span className="font-bold text-teal-300 text-sm block">3. Resilient Continuity Plan</span>
              <p className="text-slate-300 leading-relaxed">
                In the event of utility disruptions, our 500kVA Cummins generator and paper downtime packet system guarantee zero interruption to acute patient care.
              </p>
            </div>
          </div>
        </div>

        {/* J & J Memorial Facility & Community Health Gallery */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800">Community & Clinical Infrastructure</span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">J & J Memorial Health Center in Action</h3>
              <p className="text-xs text-slate-500">VOA East Community, Robertsfield Highway, Montserrado County, Liberia</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-teal-900 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
                Member, Christian Health Association of Liberia (CHAL)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
              <div className="h-44 bg-gradient-to-br from-teal-900 to-slate-800 relative flex items-center justify-center p-4 text-white text-center">
                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-widest text-teal-300 font-bold">VOA East Facility</span>
                  <h4 className="font-extrabold text-base">Outpatient & Acute Triage</h4>
                  <p className="text-[11px] text-slate-300">Daily general medicine, pediatrics & triage consultations</p>
                </div>
              </div>
              <div className="p-4 space-y-1">
                <span className="text-xs font-bold text-slate-900 block">Consultation & Triage Bays</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Welcoming clinical spaces equipped with digital vital sign monitors, pediatric measuring stations, and private exam rooms.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
              <div className="h-44 bg-gradient-to-br from-indigo-950 to-slate-900 relative flex items-center justify-center p-4 text-white text-center">
                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-widest text-indigo-300 font-bold">Maternal Health</span>
                  <h4 className="font-extrabold text-base">Maternity & Child Health</h4>
                  <p className="text-[11px] text-slate-300">Antenatal care, safe deliveries, and neonatal surveillance</p>
                </div>
              </div>
              <div className="p-4 space-y-1">
                <span className="text-xs font-bold text-slate-900 block">Maternity Ward & Delivery Suite</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dedicated maternal wing providing compassionate labor monitoring, post-natal recovery, and routine childhood immunization.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
              <div className="h-44 bg-gradient-to-br from-cyan-950 to-slate-900 relative flex items-center justify-center p-4 text-white text-center">
                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-widest text-cyan-300 font-bold">Diagnostic Suite</span>
                  <h4 className="font-extrabold text-base">Ultrasound & PACS Imaging</h4>
                  <p className="text-[11px] text-slate-300">High-resolution obstetric & abdominal sonography</p>
                </div>
              </div>
              <div className="p-4 space-y-1">
                <span className="text-xs font-bold text-slate-900 block">Radiology & Sonography Station</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Diagnostic imaging room with digital archive, radiologist reads, and clinician-released patient portal reports.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
              <div className="h-44 bg-gradient-to-br from-emerald-950 to-slate-900 relative flex items-center justify-center p-4 text-white text-center">
                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-300 font-bold">Clinical Pathology</span>
                  <h4 className="font-extrabold text-base">Diagnostic Laboratory</h4>
                  <p className="text-[11px] text-slate-300">Parasitology, Hematology, Urinalysis & Chemistry</p>
                </div>
              </div>
              <div className="p-4 space-y-1">
                <span className="text-xs font-bold text-slate-900 block">Quality-Controlled Lab Benches</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Microscopes, automated cell counters, and temperature-logged cold storage for reagents and specimens.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
              <div className="h-44 bg-gradient-to-br from-amber-950 to-slate-900 relative flex items-center justify-center p-4 text-white text-center">
                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-widest text-amber-300 font-bold">Pharmaceutical Care</span>
                  <h4 className="font-extrabold text-base">Pharmacy Dispensary</h4>
                  <p className="text-[11px] text-slate-300">FEFO inventory management & patient counseling</p>
                </div>
              </div>
              <div className="p-4 space-y-1">
                <span className="text-xs font-bold text-slate-900 block">Pharmacy & Drug Safety</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Verified medicines, QR code prescription verification, and dosage counseling by registered Liberian pharmacists.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
              <div className="h-44 bg-gradient-to-br from-rose-950 to-slate-900 relative flex items-center justify-center p-4 text-white text-center">
                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-widest text-rose-300 font-bold">Community Health</span>
                  <h4 className="font-extrabold text-base">Outreach & Immunizations</h4>
                  <p className="text-[11px] text-slate-300">Field health campaigns in Montserrado County</p>
                </div>
              </div>
              <div className="p-4 space-y-1">
                <span className="text-xs font-bold text-slate-900 block">Community Outreach Program</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Active health education, maternal-child wellness clinics, and malaria prevention drives across VOA and surrounding communities.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technology Partnership */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h4 className="text-base font-bold text-slate-900">Technology Architecture & Engineering Partner</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              J & J Memorial e-Hospital platform is engineered in partnership with <span className="font-semibold text-slate-900">TOTAG IT Services / TOTAG GROUP OF COMPANIES LTD</span>. All systems are deployed with role-based access control, PostgreSQL transaction ledgers, and secure staging environments.
            </p>
          </div>
          <div className="text-xs text-teal-800 bg-teal-50 border border-teal-200 font-mono font-bold px-4 py-2.5 rounded-lg shrink-0">
            TOTAG Cloud · Coolify KVM-2
          </div>
        </div>
      </div>
    </div>
  );
};
