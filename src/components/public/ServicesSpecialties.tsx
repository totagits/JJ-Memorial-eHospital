import React from 'react';
import {
  Stethoscope,
  HeartPulse,
  Baby,
  FlaskConical,
  Pill,
  Building2,
  ArrowRight,
} from 'lucide-react';

interface Specialty {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  link: string;
}

const SPECIALTIES: Specialty[] = [
  {
    icon: <Stethoscope className="w-6 h-6" />,
    iconBg: 'text-teal-600 bg-teal-50',
    title: 'Internal Medicine & OPD',
    description:
      'Diagnosis and longitudinal management of hypertension, diabetes mellitus, cardiovascular conditions, infectious diseases, and routine health maintenance.',
    link: 'View Clinic Protocols',
  },
  {
    icon: <HeartPulse className="w-6 h-6" />,
    iconBg: 'text-rose-600 bg-rose-50',
    title: '24/7 Emergency & Acute Triage',
    description:
      'Immediate stabilization, trauma resuscitation, severe malaria management, acute asthma therapy, and standardized South African/WHO triage acuity grading.',
    link: 'Emergency Guidelines',
  },
  {
    icon: <Baby className="w-6 h-6" />,
    iconBg: 'text-purple-600 bg-purple-50',
    title: 'Maternal, Neonatal & Pediatrics',
    description:
      'Prenatal screening, safe maternity deliveries, postnatal monitoring, child wellness, EPI immunizations, and sickle cell disease supportive management.',
    link: 'Maternal Health Services',
  },
  {
    icon: <FlaskConical className="w-6 h-6" />,
    iconBg: 'text-teal-600 bg-teal-50',
    title: 'Diagnostic Laboratory (LIS)',
    description:
      'Fully automated 5-part hematology, blood smear parasitology, clinical chemistry, renal/liver panels, and urgent cross-matching with strict specimen chain-of-custody.',
    link: 'Diagnostic Test Directory',
  },
  {
    icon: <Pill className="w-6 h-6" />,
    iconBg: 'text-green-600 bg-green-50',
    title: 'Pharmacy & Therapeutics',
    description:
      'Licensed pharmacists verify dosage and allergy safety before dispensing. First-Expired-First-Out (FEFO) batch tracking guarantees genuine, unexpired medications.',
    link: 'Formulary & Safety Policy',
  },
  {
    icon: <Building2 className="w-6 h-6" />,
    iconBg: 'text-indigo-600 bg-indigo-50',
    title: 'Inpatient Wards & Recovery',
    description:
      'Dedicated Male, Female, and Pediatric wards, surgical recovery suites, high-dependency care, daily physician rounds, and electronic medication administration.',
    link: 'Inpatient Amenities',
  },
];

export const ServicesSpecialties: React.FC = () => {
  return (
    <section className="bg-white py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Eyebrow */}
        <p className="text-xs font-bold tracking-widest uppercase text-teal-600 text-center mb-3">
          Integrated Medical Specialties
        </p>

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 text-center leading-tight mb-4">
          Comprehensive Clinical Care for All Generations
        </h2>

        {/* Subtitle */}
        <p className="text-slate-500 text-base text-center max-w-2xl mx-auto mb-12 leading-relaxed">
          Every clinical specialty is supervised by licensed physicians and nurses, supported by
          digitized clinical decision pathways and electronic medical records.
        </p>

        {/* 3×2 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SPECIALTIES.map((s) => (
            <div
              key={s.title}
              className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow flex flex-col gap-4"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.iconBg}`}>
                {s.icon}
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-bold text-slate-900 text-base">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.description}</p>
              </div>
              <button className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-500 font-semibold text-sm transition">
                {s.link} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
