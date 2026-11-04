import React, { useState } from 'react';
import { useTranslation } from '../../services/i18n';
import { HelpCircle, ChevronDown, ChevronUp, Search, ShieldCheck, Phone } from 'lucide-react';

interface FaqItem {
  id: string;
  category: 'Registration & Portal' | 'Patient Rights & Privacy' | 'Insurance & Billing' | 'Emergency & Visiting';
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'Registration & Portal',
    question: 'How do I register as a new patient and receive a Medical Record Number (MRN)?',
    answer: 'You can register online through our Patient Portal, book an initial consultation on this website, or register in person at any of our facility front desks. Once registered, you will be issued a permanent, immutable Medical Record Number (MRN) e.g., JJM-2026-XXXX, linking your visits, laboratory results, and prescription history across all branches.',
  },
  {
    id: 'faq-2',
    category: 'Registration & Portal',
    question: 'Can I access my diagnostic imaging scans and lab results from home?',
    answer: 'Yes! Our secure Patient Portal allows verified patients to view clinician-released lab reports (CBC, chemistry, malaria panels) and diagnostic radiology summaries directly on their smartphone or computer. You can also securely download printable copies for second opinions.',
  },
  {
    id: 'faq-3',
    category: 'Patient Rights & Privacy',
    question: 'What are my rights regarding medical consent and electronic signatures?',
    answer: 'Every patient has the fundamental right to informed consent before any clinical procedure, blood transfusion, or inpatient admission. Our digital consent module allows you or your authorized legal guardian to review consent documents in plain language, electronically sign with verified cryptographic timestamps, and retain an immutable copy in your personal record.',
  },
  {
    id: 'faq-4',
    category: 'Patient Rights & Privacy',
    question: 'How does J & J Memorial protect my confidential health information (PHI)?',
    answer: 'We enforce strict role-based access controls (RBAC) and data isolation. Non-clinical staff cannot view sensitive clinical notes or diagnostic results. All clinical entries maintain an indelible audit log recording who accessed or updated your file, ensuring compliance with Liberian health privacy guidelines and international healthcare security best practices.',
  },
  {
    id: 'faq-5',
    category: 'Insurance & Billing',
    question: 'Which health insurance plans are accepted for cashless treatment?',
    answer: 'We provide direct cashless billing for NASSCORP Healthcare Plan, Sunu Assurances Liberia, Activa International, and major international health insurance plans. Staff at our billing desk verify eligibility in real-time. For self-pay patients, we accept cash, MTN Mobile Money, Orange Money, and major credit cards with branded itemized official receipts.',
  },
  {
    id: 'faq-6',
    category: 'Insurance & Billing',
    question: 'Will emergency care be delayed if I do not have insurance or upfront payment?',
    answer: 'NO. J & J Memorial strictly adheres to the principle that emergency life-saving care is never withheld or delayed for financial reasons. Triage Red emergency patients receive immediate resuscitation and stabilization prior to any administrative or billing review.',
  },
  {
    id: 'faq-7',
    category: 'Emergency & Visiting',
    question: 'What are the hospital visiting hours for inpatient wards?',
    answer: 'Standard inpatient ward visiting hours are Monday through Sunday: 11:30 AM to 1:30 PM, and 4:30 PM to 7:00 PM. In the Intensive Care Unit (ICU) and Neonatal Care Unit, visiting is restricted to immediate family members with scheduled 15-minute intervals to preserve infection control.',
  },
  {
    id: 'faq-8',
    category: 'Emergency & Visiting',
    question: 'How do I request emergency ambulance dispatch in Monrovia?',
    answer: 'Call our 24/7 Emergency Dispatch Center directly at +231 88 091 1911. Our dispatch team coordinates equipped life-support ambulances covering Monrovia, Sinkor, Paynesville, and Bushrod Island.',
  },
];

export const FAQ: React.FC = () => {
  const { t } = useTranslation();
  const [openIds, setOpenIds] = useState<string[]>([FAQ_ITEMS[0].id]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'Registration & Portal', 'Patient Rights & Privacy', 'Insurance & Billing', 'Emergency & Visiting'];

  const toggleOpen = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <section className="py-20 bg-white border-t border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Answers & Patient Guidance</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-hospital-navy tracking-tight">
            {t('faq')}
          </h2>
          <p className="text-slate-600 text-base">
            Everything you need to know about registering, utilizing your health insurance, consenting to care, and accessing medical records.
          </p>

          {/* Search Input */}
          <div className="max-w-md mx-auto pt-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search frequently asked questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-hospital-navy text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {filteredFaqs.map((faq) => {
            const isOpen = openIds.includes(faq.id);
            return (
              <div
                key={faq.id}
                className="border border-slate-200 rounded-xl overflow-hidden transition-all bg-white"
              >
                <button
                  onClick={() => toggleOpen(faq.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                    <span className="text-sm sm:text-base font-bold text-hospital-navy">
                      {faq.question}
                    </span>
                  </div>
                  <div className="text-slate-400 shrink-0">
                    {isOpen ? <ChevronUp className="w-5 h-5 text-teal-600" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    <p className="mt-2">{faq.answer}</p>
                    <div className="mt-3 flex items-center gap-2 text-[11px] text-teal-700 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Category: {faq.category}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Have Questions Box */}
        <div className="mt-12 p-6 rounded-2xl bg-teal-50 border border-teal-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-bold text-hospital-navy text-sm">
              Still have a specific question about your treatment or bill?
            </h4>
            <p className="text-xs text-slate-600">
              Our clinical front desk officers and patient liaisons are ready to assist you.
            </p>
          </div>
          <a
            href="tel:+231779001122"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition whitespace-nowrap shadow-sm"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Contact Hospital Desk</span>
          </a>
        </div>
      </div>
    </section>
  );
};
