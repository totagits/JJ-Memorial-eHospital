import React from 'react';
import { ShieldCheck, HeartHandshake, CheckCircle2, Building2 } from 'lucide-react';

interface PartnerInfo {
  name: string;
  type: 'INSURANCE' | 'GOVERNMENT' | 'HEALTH_SYSTEM';
  description: string;
  coverageNote: string;
  code: string;
}

const PARTNERS: PartnerInfo[] = [
  {
    name: 'Activa International Insurance Liberia',
    type: 'INSURANCE',
    description: 'Premier pan-African health insurer providing direct cashless hospitalization and outpatient coverage at J & J Memorial.',
    coverageNote: 'Direct Electronic Verification · Comprehensive Coverage',
    code: 'ACT-LR'
  },
  {
    name: 'Accident & General Insurance Company (AGI)',
    type: 'INSURANCE',
    description: 'Trusted nationwide health and commercial insurance provider covering cardiology, surgery, and maternal health packages.',
    coverageNote: 'Corporate & Individual Plans Accepted',
    code: 'AGI-CORP'
  },
  {
    name: 'Intrasur Liberia Health Plan',
    type: 'INSURANCE',
    description: 'Specialized health maintenance organization covering outpatient consultations, generic pharmaceuticals, and laboratory tests.',
    coverageNote: 'Instant Co-Pay Processing',
    code: 'INTRA-HMO'
  },
  {
    name: 'Civil Service Agency (CSA) Health Scheme',
    type: 'GOVERNMENT',
    description: 'Official Government of Liberia public servant healthcare network supporting maternal, child health, and emergency care.',
    coverageNote: '100% Maternal & Immunization Coverage',
    code: 'GOL-CSA'
  },
  {
    name: 'Liberian Red Cross Society',
    type: 'HEALTH_SYSTEM',
    description: 'Collaborative blood banking partner coordinating emergency whole blood voluntary donor drives across Montserrado.',
    coverageNote: 'Safe Blood Banking & Disaster Preparedness',
    code: 'LRCS-BLOOD'
  },
  {
    name: 'Liberian Ministry of Health (MOH)',
    type: 'GOVERNMENT',
    description: 'Accrediting health authority standardizing clinical protocols, HMIS/DHIS2 reporting, and malaria eradication frameworks.',
    coverageNote: 'National Clinical Governance Framework',
    code: 'MOH-ACCRED'
  }
];

export const PartnershipsSection: React.FC = () => {
  return (
    <section className="py-14 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
            <HeartHandshake className="w-3.5 h-3.5 text-teal-700" />
            <span>Accepted Insurance & Institutional Partners</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Accredited Insurance Networks & Healthcare Partners
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            We partner with leading national and regional healthcare payers to ensure seamless, cashless, and dignified treatment for all patients.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PARTNERS.map(partner => (
            <div
              key={partner.code}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3 hover:border-teal-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                  {partner.code}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  {partner.type}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                  {partner.name}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {partner.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{partner.coverageNote}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
