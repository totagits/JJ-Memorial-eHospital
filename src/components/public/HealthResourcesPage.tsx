import React from 'react';
import { BookOpen, AlertCircle, Heart, Shield, Activity, HelpCircle } from 'lucide-react';

export const HealthResourcesPage: React.FC = () => {
  const articles = [
    {
      title: 'Recognizing Severe Malaria Symptoms & Seeking Prompt Care',
      category: 'Infectious Diseases',
      readTime: '4 min read',
      summary: 'In Liberia, early testing with Pf-HRP2 rapid diagnostics and prompt artemisinin-based combination therapy (ACT) prevents life-threatening cerebral malaria and severe anemia.',
      keyPoints: [
        'High fever with chills and severe headache requires same-day laboratory testing.',
        'Never delay medical evaluation for self-prescribed incomplete medication courses.',
        'Pregnant mothers and young children require immediate clinical evaluation within 12 hours.'
      ]
    },
    {
      title: 'Managing High Blood Pressure: Dietary & Medication Adherence',
      category: 'Cardiovascular Health',
      readTime: '5 min read',
      summary: 'Hypertension is often asymptomatic until complications arise. Learn how consistent blood pressure monitoring, reduced sodium intake, and regular checkups protect against stroke and renal failure.',
      keyPoints: [
        'Take prescribed antihypertensive drugs at the same hour every day.',
        'Reduce dietary bouillon cubes, salted dried fish, and processed seasonings.',
        'Check your blood pressure at the J & J Memorial outpatient triage station monthly.'
      ]
    },
    {
      title: 'Antenatal Nutrition and Iron Supplementation in Pregnancy',
      category: 'Maternal & Child Health',
      readTime: '6 min read',
      summary: 'Proper maternal nutrition directly supports healthy fetal brain development and safe maternal hemoglobin levels during labor and delivery.',
      keyPoints: [
        'Take daily folic acid and iron supplements as provided by your antenatal nurse.',
        'Sleep under insecticide-treated bed nets (ITNs) every night.',
        'Attend at least 8 recommended antenatal contact visits throughout gestation.'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
            Health Education & Community Wellness
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Evidence-Based Health Resources
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            Clinical education articles reviewed by our medical board to empower patients, families, and caregivers across Montserrado County.
          </p>
        </div>

        {/* Disclaimer Notice */}
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-bold">Medical Disclaimer:</span> The educational content provided here is for general health literacy and public awareness only. It does not replace individualized clinical evaluation, diagnosis, or treatment by a licensed physician. If you are experiencing an acute medical emergency, contact our 24/7 hotline at <span className="font-bold">+231 (0) 770-JJ-MEM</span> or proceed immediately to the nearest emergency room.
          </p>
        </div>

        {/* Articles List */}
        <div className="space-y-6">
          {articles.map((art, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="font-semibold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200/60">
                  {art.category}
                </span>
                <span>·</span>
                <span>{art.readTime}</span>
                <span>·</span>
                <span>Reviewed by J & J Clinical Board</span>
              </div>

              <h3 className="text-lg font-bold text-slate-900">{art.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{art.summary}</p>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 text-xs space-y-2">
                <span className="font-bold text-slate-800 block">Key Clinical Takeaways:</span>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  {art.keyPoints.map((pt, pIdx) => (
                    <li key={pIdx}>{pt}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
