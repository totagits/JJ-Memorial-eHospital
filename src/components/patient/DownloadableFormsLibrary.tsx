import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Search, 
  Eye, 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  Clock,
  X
} from 'lucide-react';
import { Patient } from '../../types/patient';

interface DownloadableFormsLibraryProps {
  patient: Patient;
}

interface HospitalFormDoc {
  id: string;
  code: string;
  title: string;
  category: 'REGISTRATION' | 'LEGAL_RECORDS' | 'MATERNAL' | 'CLINICAL_MONITORING' | 'FINANCIAL';
  description: string;
  pages: number;
  lastRevision: string;
  fieldsIncluded: string[];
}

const HOSPITAL_FORMS: HospitalFormDoc[] = [
  {
    id: 'FORM-001',
    code: 'MOH-JJM-ADM-01',
    title: 'Adult Outpatient Registration & Medical Intake Form',
    category: 'REGISTRATION',
    description: 'Official Ministry of Health patient demographic questionnaire, emergency contact designation, and chronic illness history checklist.',
    pages: 2,
    lastRevision: 'Rev. 2026-B',
    fieldsIncluded: ['Demographics & National ID', 'Next of Kin Contacts', 'Known Allergies', 'Past Surgeries']
  },
  {
    id: 'FORM-002',
    code: 'MOH-JJM-REC-04',
    title: 'Protected Health Information (PHI) Release Authorization',
    category: 'LEGAL_RECORDS',
    description: 'Formal medical records request authorization for transfers to international specialists or insurance compliance audits.',
    pages: 1,
    lastRevision: 'Rev. 2026-A',
    fieldsIncluded: ['Recipient Clinic Name', 'Specific Encounter Dates', 'Clinician Sign-off', 'Patient Signature']
  },
  {
    id: 'FORM-003',
    code: 'MOH-JJM-ANC-02',
    title: 'Ante-Natal Care & Maternal Health Passport Card',
    category: 'MATERNAL',
    description: 'Routine antenatal monitoring tracking sheet for expectant mothers, recording fundal height, fetal heart rate, and tetanus toxoid doses.',
    pages: 3,
    lastRevision: 'Rev. 2026-C',
    fieldsIncluded: ['Trimester Schedule', 'Ultrasound Biometry', 'Iron/Folate Supplements', 'Birth Preparedness Plan']
  },
  {
    id: 'FORM-004',
    code: 'MOH-JJM-CHR-05',
    title: 'Hypertension & Diabetes Home Glycemic Log Sheet',
    category: 'CLINICAL_MONITORING',
    description: 'Printable 30-day grid for home blood pressure and fasting blood glucose documentation to bring to quarterly clinical consultations.',
    pages: 1,
    lastRevision: 'Rev. 2026-A',
    fieldsIncluded: ['AM/PM Blood Pressure', 'Pre-meal Glucose', 'Medication Compliance Checkbox']
  },
  {
    id: 'FORM-005',
    code: 'MOH-JJM-FIN-03',
    title: 'Health Insurance Direct Billing & Co-Pay Verification Claim',
    category: 'FINANCIAL',
    description: 'Universal insurance reimbursement claim sheet for Activa, Accident & General, Intrasur, and private corporate health schemes.',
    pages: 2,
    lastRevision: 'Rev. 2026-B',
    fieldsIncluded: ['Policy Number', 'Itemized Diagnostic Fees', 'Attending Physician Diagnosis Code', 'Employer Guarantee']
  }
];

export const DownloadableFormsLibrary: React.FC<DownloadableFormsLibraryProps> = ({ patient }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [previewForm, setPreviewForm] = useState<HospitalFormDoc | null>(null);

  const filteredForms = HOSPITAL_FORMS.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          form.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          form.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || form.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePrint = (form: HospitalFormDoc) => {
    setPreviewForm(form);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
            <FileText className="w-5 h-5 text-teal-700" />
            <span>Hospital Document Library & PDF Templates</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            Downloadable Forms & Intake Templates
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Access standardized clinical intake questionnaires, records release authorizations, and home monitoring log sheets. Download or print directly pre-filled with your patient MRN ({patient.mrn}).
          </p>
        </div>
      </div>

      {/* Search and Category Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search forms by name or code..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
          {['ALL', 'REGISTRATION', 'LEGAL_RECORDS', 'MATERNAL', 'CLINICAL_MONITORING', 'FINANCIAL'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === cat ? 'bg-teal-800 text-white font-semibold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' && 'All Forms'}
              {cat === 'REGISTRATION' && 'Intake & Registration'}
              {cat === 'LEGAL_RECORDS' && 'Medical Records'}
              {cat === 'MATERNAL' && 'Maternal Health'}
              {cat === 'CLINICAL_MONITORING' && 'Vitals & Logs'}
              {cat === 'FINANCIAL' && 'Insurance Claims'}
            </button>
          ))}
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredForms.map(form => (
          <div
            key={form.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between hover:border-teal-300 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                  {form.code}
                </span>
                <span className="text-[10px] text-slate-400">{form.pages} Page(s)</span>
              </div>

              <h3 className="font-bold text-sm text-slate-900 leading-snug">{form.title}</h3>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                {form.description}
              </p>

              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sections Included:</span>
                <div className="flex flex-wrap gap-1">
                  {form.fieldsIncluded.map((field, idx) => (
                    <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setPreviewForm(form)}
                className="text-xs text-teal-800 hover:text-teal-900 font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Template</span>
              </button>

              <button
                onClick={() => handlePrint(form)}
                className="bg-teal-800 hover:bg-teal-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Form</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Form Preview & Printable Layout Modal */}
      {previewForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-800" />
                <h3 className="font-bold text-base text-slate-900">{previewForm.title}</h3>
              </div>
              <button onClick={() => setPreviewForm(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Paper Document */}
            <div className="p-6 bg-slate-50 border border-slate-300 rounded-xl space-y-6 font-sans text-xs text-slate-800">
              <div className="flex justify-between items-start pb-4 border-b-2 border-teal-900">
                <div>
                  <h4 className="text-base font-extrabold uppercase tracking-tight text-teal-950">J & J Memorial e-Hospital</h4>
                  <p className="text-[11px] text-slate-600">VOA East Community, Monrovia, Montserrado County, Liberia</p>
                  <p className="text-[10px] text-slate-500 font-mono">Form Code: {previewForm.code} · {previewForm.lastRevision}</p>
                </div>
                <div className="text-right text-[11px]">
                  <span className="font-bold block text-slate-900">MRN: {patient.mrn}</span>
                  <span className="text-slate-600">{patient.firstName} {patient.lastName}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-bold text-sm text-slate-900">{previewForm.title}</h5>
                <p className="text-slate-600 leading-relaxed">{previewForm.description}</p>
              </div>

              <div className="border border-slate-300 rounded-lg p-4 bg-white space-y-3">
                <h6 className="font-bold text-xs text-slate-800 border-b pb-1.5">Section A: Patient Master Identification</h6>
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>Full Legal Name: <strong className="text-slate-900">{patient.firstName} {patient.lastName}</strong></div>
                  <div>Date of Birth: <strong className="text-slate-900">{patient.dateOfBirth}</strong></div>
                  <div>Phone Contact: <strong className="text-slate-900">{patient.phone}</strong></div>
                  <div>Community: <strong className="text-slate-900">{patient.address.community}, {patient.address.city}</strong></div>
                </div>
              </div>

              <div className="border border-slate-300 rounded-lg p-4 bg-white space-y-3">
                <h6 className="font-bold text-xs text-slate-800 border-b pb-1.5">Section B: Clinical Form Content</h6>
                <div className="space-y-2 text-[11px] text-slate-600">
                  {previewForm.fieldsIncluded.map((f, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-dashed border-slate-200 py-1.5">
                      <span>{f}</span>
                      <span className="w-32 border-b border-slate-400 inline-block" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-[11px]">
                <div>
                  <div className="border-b border-slate-400 h-10" />
                  <span className="text-[10px] text-slate-500 block mt-1">Patient or Legal Guardian Signature</span>
                </div>
                <div>
                  <div className="border-b border-slate-400 h-10" />
                  <span className="text-[10px] text-slate-500 block mt-1">Attending Clinician / Admissions Officer Signature</span>
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
              <button
                onClick={() => setPreviewForm(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-lg text-xs"
              >
                Close Preview
              </button>
              <button
                onClick={() => handlePrint(previewForm)}
                className="bg-teal-800 hover:bg-teal-900 text-white font-semibold px-5 py-2 rounded-lg text-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
