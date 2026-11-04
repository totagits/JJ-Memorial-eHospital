import React from 'react';
import { ShieldCheck, Building2, Handshake, CheckCircle } from 'lucide-react';

interface Partner {
  name: string;
  category: 'Insurance Provider' | 'Health Agency' | 'Academic Medical';
  description: string;
  coverageBadge: string;
}

const PARTNERS: Partner[] = [
  {
    name: 'NASSCORP Healthcare Plan',
    category: 'Insurance Provider',
    description: 'Direct cashless billing coverage for national social security scheme members across OPD, labs, pharmacy, and inpatient wards.',
    coverageBadge: 'Direct Billing Verified',
  },
  {
    name: 'Sunu Assurances Liberia',
    category: 'Insurance Provider',
    description: 'Premier corporate and private health insurance partner providing direct settlement for emergency, surgical, and specialist care.',
    coverageBadge: 'Direct Billing Verified',
  },
  {
    name: 'Activa International Insurance',
    category: 'Insurance Provider',
    description: 'Coverage for diplomatic, commercial enterprise, and family medical policies with rapid pre-authorization processing.',
    coverageBadge: 'Direct Billing Verified',
  },
  {
    name: 'Liberia Ministry of Health (MOH)',
    category: 'Health Agency',
    description: 'Accredited referral facility partner for emergency maternal care, national disease surveillance, and immunization programs.',
    coverageBadge: 'Official Accreditation',
  },
  {
    name: 'National Blood Safety Program (NBSP)',
    category: 'Health Agency',
    description: 'Certified partner for continuous cold-chain blood banking, viral pathogen screening, and emergency transfusion supply.',
    coverageBadge: 'Certified Cold-Chain',
  },
  {
    name: 'A.M. Dogliotti College of Medicine',
    category: 'Academic Medical',
    description: 'Clinical training and residency teaching affiliate supporting clinical research and medical education.',
    coverageBadge: 'Teaching Affiliate',
  },
];

export const Partnerships: React.FC = () => {
  return (
    <section className="py-20 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <Handshake className="w-3.5 h-3.5" />
            <span>Accepted Insurances & Affiliations</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-hospital-navy tracking-tight">
            Institutional Partnerships & Insurance Coverage
          </h2>
          <p className="text-slate-600 text-base">
            We partner with leading national and international health insurers, regulatory agencies, and academic centers to provide seamless, cashless care.
          </p>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PARTNERS.map((partner, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-teal-100/70 text-teal-700 flex items-center justify-center font-bold text-sm">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle className="w-3 h-3" />
                    {partner.coverageBadge}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-hospital-navy text-base">
                    {partner.name}
                  </h4>
                  <span className="text-xs font-semibold text-teal-600">
                    {partner.category}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {partner.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>Verified Provider Network</span>
                <span className="font-semibold text-slate-600">J & J Memorial</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
