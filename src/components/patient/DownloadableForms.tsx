import React, { useState } from 'react';
import { dbStore } from '../../services/dbStore';
import { DownloadableDocument } from '../../types';
import { FileText, Download, Printer, Eye, X, Shield, Search } from 'lucide-react';

export const DownloadableForms: React.FC = () => {
  const docs = dbStore.getDownloadableDocs();
  const [selectedDoc, setSelectedDoc] = useState<DownloadableDocument | null>(null);
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  const categories = ['All', 'Patient Intake', 'Clinical Consent', 'Records & Privacy', 'Financial & Billing', 'Telehealth'];

  const filteredDocs = docs.filter((d) => {
    const matchesCat = selectedCat === 'All' || d.category === selectedCat;
    const matchesSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" />
            <span>Document Repository & PDF Templates</span>
          </div>
          <h2 className="text-2xl font-extrabold text-hospital-navy mt-1">
            Downloadable Forms & Intake Library
          </h2>
          <p className="text-xs text-slate-500">
            Access printable hospital documentation, intake packets, and records release forms formatted for official submission.
          </p>
        </div>

        {/* Search */}
        <div className="w-full sm:w-64 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search hospital forms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              selectedCat === cat
                ? 'bg-hospital-navy text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  {doc.fileSize} &bull; {doc.pages} Pages
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600">
                  {doc.category}
                </span>
                <h4 className="font-bold text-hospital-navy text-sm mt-0.5 leading-snug">
                  {doc.title}
                </h4>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {doc.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Rev: {doc.updatedDate}
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedDoc(doc)}
                  className="p-2 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition"
                  title="Preview Form"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setSelectedDoc(doc);
                    setTimeout(() => window.print(), 300);
                  }}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Document Printable Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedDoc(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition no-print"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Document Header (Print Formatted) */}
            <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
              <div className="text-lg font-black tracking-tight text-hospital-navy uppercase">
                J & J MEMORIAL HEALTH CENTER
              </div>
              <p className="text-xs text-slate-600">
                Oldest Congo Town, Tubman Blvd, Monrovia, Republic of Liberia &bull; Tel: +231 77 900 1122
              </p>
              <div className="inline-block mt-2 px-3 py-1 rounded bg-slate-100 font-bold text-xs uppercase tracking-wider text-slate-800">
                {selectedDoc.title}
              </div>
            </div>

            {/* Template Body */}
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed font-sans">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-bold text-slate-500">Patient Full Name:</span>
                    <div className="border-b border-dotted border-slate-400 h-6"></div>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500">Date of Birth (DOB):</span>
                    <div className="border-b border-dotted border-slate-400 h-6"></div>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500">Medical Record No. (MRN):</span>
                    <div className="border-b border-dotted border-slate-400 h-6"></div>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500">National ID / Passport:</span>
                    <div className="border-b border-dotted border-slate-400 h-6"></div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-slate-900 uppercase">Section 1: Clinical Description & Authorization</h5>
                <p>
                  {selectedDoc.description}
                </p>
                <p>
                  By signing below, the undersigned patient or designated legal representative hereby submits this form for processing at J & J Memorial Health Center under applicable Ministry of Health privacy and health records policies.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200">
                <div className="space-y-1">
                  <div className="border-b border-slate-400 h-10"></div>
                  <span className="text-[11px] text-slate-500 font-bold">Patient / Guardian Signature</span>
                </div>
                <div className="space-y-1">
                  <div className="border-b border-slate-400 h-10"></div>
                  <span className="text-[11px] text-slate-500 font-bold">Date & Witness Signature</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between no-print">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-teal-600" />
                Official Document Template
              </span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-2 shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save as PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
