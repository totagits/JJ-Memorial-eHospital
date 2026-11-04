import React from 'react';
import { 
  Newspaper, 
  Calendar, 
  ArrowRight, 
  Sparkles, 
  HeartHandshake, 
  Zap, 
  Activity,
  Award
} from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
  summary: string;
  author: string;
  readTime: string;
}

const HOSPITAL_NEWS: NewsItem[] = [
  {
    id: 'NEWS-001',
    title: 'Free Community Malaria Diagnostic Smear & Rapid Testing Initiative in VOA East',
    category: 'COMMUNITY HEALTH',
    date: 'November 2, 2026',
    summary: 'J & J Memorial launches a 2-week community fever screening drive in collaboration with the Montserrado County Health Team to reduce severe pediatric malarial anemia.',
    author: 'Dr. Evelyn Sirleaf-Gbotoe, MD',
    readTime: '3 min read'
  },
  {
    id: 'NEWS-002',
    title: 'Hospital Power Resilience Upgraded: 80kW Solar Hybrid Array Commissioned',
    category: 'INFRASTRUCTURE',
    date: 'October 28, 2026',
    summary: 'Ensuring zero downtime for operating theaters, the neonatal nursery, and the blood bank cold-chain storage with an integrated Cummins 500kVA and solar battery micro-grid.',
    author: 'Biomedical Engineering Unit',
    readTime: '4 min read'
  },
  {
    id: 'NEWS-003',
    title: 'New Siemens Digital Ultrasound & 12-Lead Diagnostic Cardiology Suites Operational',
    category: 'CLINICAL ADVANCEMENTS',
    date: 'October 20, 2026',
    summary: 'State-of-the-art diagnostic imaging is now available for antenatal biometry, echocardiography, and vascular evaluations at the main campus.',
    author: 'Dr. J. Saydee Kollie, MD (Medical Director)',
    readTime: '3 min read'
  }
];

export const HospitalNewsSection: React.FC = () => {
  return (
    <section className="py-16 bg-slate-50 border-t border-slate-200" id="news">
      <div className="max-w-7xl mx-auto px-4 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
              <Newspaper className="w-3.5 h-3.5 text-teal-700" />
              <span>Hospital Bulletins & Public Health Updates</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Latest News & Community Health Advisories
            </h2>
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOSPITAL_NEWS.map(item => (
            <article
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[10px] text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded tracking-wider uppercase">
                    {item.category}
                  </span>
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {item.date}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 leading-snug hover:text-teal-800 transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium text-slate-700">{item.author}</span>
                <span className="text-teal-800 font-semibold flex items-center gap-1">
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
