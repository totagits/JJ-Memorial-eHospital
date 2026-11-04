import React from 'react';
import { Zap, FileText, BadgeCheck, ShieldCheck } from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: <Zap className="w-6 h-6" />,
    iconColor: 'text-teal-600 bg-teal-50',
    title: '24/7 Power Assurance',
    description:
      'Dual Cummins 500kVA prime diesel generators paired with 80kW hybrid solar and UPS battery banks to keep life-support and laboratories powered continuously.',
  },
  {
    icon: <FileText className="w-6 h-6" />,
    iconColor: 'text-blue-600 bg-blue-50',
    title: 'Immutable Digital Records',
    description:
      'Unique permanent MRN identifiers, complete audit trails, and zero chart loss. Your diagnostic reports and medication histories stay intact over time.',
  },
  {
    icon: <BadgeCheck className="w-6 h-6" />,
    iconColor: 'text-green-600 bg-green-50',
    title: 'Dual Currency Transparency',
    description:
      'Clear billing in USD and LRD with itemized official receipts, verified QR codes, and automated double-entry accounting reconciliation.',
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    iconColor: 'text-purple-600 bg-purple-50',
    title: 'Clinician-Supervised Release',
    description:
      'Laboratory results are reviewed by licensed laboratory scientists and attending doctors before publication to the Patient Portal, preventing unnecessary distress.',
  },
];

export const EnterpriseDifference: React.FC = () => {
  return (
    <section className="bg-slate-50 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Eyebrow */}
        <p className="text-xs font-bold tracking-widest uppercase text-teal-600 text-center mb-3">
          The Enterprise Difference
        </p>

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 text-center leading-tight mb-4 max-w-3xl mx-auto">
          Built on Unyielding Infrastructure, Clinical Governance, and Integrity
        </h2>

        {/* Body */}
        <p className="text-slate-500 text-base text-center max-w-2xl mx-auto mb-12 leading-relaxed">
          In a region where power outages and lost paper records can impede healthcare delivery,
          J &amp; J Memorial e-Hospital operates on robust engineering standards.
        </p>

        {/* 4-column feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${f.iconColor}`}
              >
                {f.icon}
              </div>
              <h3 className="font-bold text-slate-900 text-sm leading-snug">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
