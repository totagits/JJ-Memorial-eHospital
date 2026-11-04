import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  FileText, 
  CreditCard, 
  Clock, 
  UserCheck 
} from 'lucide-react';

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'FAQ-1',
    category: 'Registration & MRN',
    question: 'How do I register and receive my unique Master Patient Index (MRN)?',
    answer: 'You can register online through our Patient Portal or in person at our Front Desk in VOA East. You will receive an immutable Master Record Number (e.g., JJM-2026-00104) verified against your Liberian National Identification Registry (NIR) card or passport. This MRN permanently connects all your lab results, prescriptions, and physician notes across all hospital visits.'
  },
  {
    id: 'FAQ-2',
    category: 'Health Insurance & Payment',
    question: 'Which health insurance policies and corporate health schemes are accepted?',
    answer: 'We maintain direct electronic billing agreements with Activa International Insurance Liberia, Accident & General Insurance (AGI), Intrasur, Medicare International, and the Civil Service Agency (CSA) Health Scheme. Patients with registered coverage enjoy direct billing with only nominal co-pays due at visit time. We also accept cash payments in both USD and Liberian Dollars (LRD) at standard official exchange rates.'
  },
  {
    id: 'FAQ-3',
    category: 'Patient Rights & Confidentiality',
    question: 'How are my electronic medical records and test results protected?',
    answer: 'Your health records are safeguarded under strict medical confidentiality protocols conforming to Liberian Ministry of Health (MOH) data governance. Clinician access is restricted by Role-Based Access Control (RBAC), and every chart view is tracked in an immutable security audit log. Emergency break-glass access requires documented clinical justification.'
  },
  {
    id: 'FAQ-4',
    category: 'Emergency & Outpatient Hours',
    question: 'When is the Emergency & Trauma Department open, and do I need an appointment?',
    answer: 'Our Emergency & Acute Triage Bay is open 24 hours a day, 365 days a year. No appointment is needed for acute fever, trauma, breathing distress, or obstetric emergencies. Outpatient specialty clinics run Monday through Saturday from 08:00 AM to 05:00 PM.'
  },
  {
    id: 'FAQ-5',
    category: 'Laboratory & Radiology',
    question: 'How quickly are diagnostic laboratory test results released to the patient portal?',
    answer: 'Routine malaria smears, full blood counts (CBC), and rapid diagnostic tests (RDTs) are typically verified and released within 45 to 60 minutes. Digital chest X-rays and ultrasound reports are signed off by our radiologist and uploaded to your Patient Portal account the same day.'
  }
];

export const FaqSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('FAQ-1');

  const toggleFaq = (id: string) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  return (
    <section className="py-16 bg-white border-t border-slate-200" id="faq">
      <div className="max-w-4xl mx-auto px-4 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
            <HelpCircle className="w-3.5 h-3.5 text-teal-700" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Common Inquiries & Patient Guidelines
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Everything you need to know about registering, accessing your EMR portal, visiting patients, and health insurance coverage.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {FAQ_ITEMS.map(item => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className={`border rounded-2xl transition-all overflow-hidden ${
                  isOpen ? 'border-teal-700 bg-teal-50/20 shadow-xs' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(item.id)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block">
                      {item.category}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900">
                      {item.question}
                    </h3>
                  </div>

                  <div className={`p-2 rounded-full shrink-0 ${isOpen ? 'bg-teal-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100/80">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
