import React, { useState, useEffect } from 'react';
import { dbStore } from '../../services/dbStore';
import { PatientUploadedDoc } from '../../types';
import { UploadCloud, File, ShieldCheck, Trash2, Eye, Download, CheckCircle2, Lock } from 'lucide-react';

interface MedicalDocumentUploaderProps {
  patientId: string;
}

export const MedicalDocumentUploader: React.FC<MedicalDocumentUploaderProps> = ({ patientId }) => {
  const [docs, setDocs] = useState<PatientUploadedDoc[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PatientUploadedDoc['category']>('Vaccination Card');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [shareWithClinicians, setShareWithClinicians] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    const update = () => {
      setDocs(dbStore.getUploadedDocs(patientId));
    };
    update();
    return dbStore.subscribe(update);
  }, [patientId]);

  const handleSimulateFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const sizeKb = Math.round(file.size / 1024);
      setFileSize(sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !fileName) return;

    setIsUploading(true);
    await new Promise((resolve) => setTimeout(resolve, 800)); // simulate secure upload

    await dbStore.uploadPatientDoc({
      patientId,
      title,
      category,
      fileName,
      fileSize: fileSize || '1.1 MB',
      sharedWithClinicians: shareWithClinicians,
    });

    setIsUploading(false);
    setUploadSuccess(true);
    setTitle('');
    setFileName('');
    setFileSize('');

    setTimeout(() => setUploadSuccess(false), 4000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Encrypted Health Document Vault</span>
          </div>
          <h2 className="text-2xl font-extrabold text-hospital-navy mt-1">
            Personal Health Records Uploader
          </h2>
          <p className="text-xs text-slate-500">
            Securely upload past vaccination records, previous hospital discharges, and diagnostic scans into your digital file storage.
          </p>
        </div>
      </div>

      {uploadSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Document encrypted and stored securely in your patient profile!</span>
        </div>
      )}

      {/* Upload Box Form */}
      <form onSubmit={handleUpload} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <h4 className="font-bold text-hospital-navy text-sm">
          Upload New Medical Record
        </h4>

        {/* Drag and Drop Box */}
        <div className="border-2 border-dashed border-teal-300 rounded-2xl p-6 text-center bg-teal-50/30 hover:bg-teal-50/60 transition cursor-pointer relative">
          <input
            type="file"
            onChange={handleSimulateFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
          <UploadCloud className="w-10 h-10 text-teal-600 mx-auto mb-2" />
          <div className="font-bold text-slate-800 text-sm">
            {fileName ? fileName : 'Click to browse or drop document here'}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Supports PDF, JPG, PNG, and DICOM medical files (Up to 25MB)
          </p>
          {fileSize && (
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded bg-teal-100 text-teal-800 text-xs font-bold font-mono">
              Selected: {fileName} ({fileSize})
            </span>
          )}
        </div>

        {/* Metadata Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Document Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Yellow Fever Certificate, Outside ECG"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="Vaccination Card">Vaccination Card (EPI / Yellow Card)</option>
              <option value="Past Physician Note">Past Physician Note / Discharge Summary</option>
              <option value="Outside Lab Report">Outside Lab Test / Blood Chemistry</option>
              <option value="Insurance Card">Health Insurance Membership Card</option>
              <option value="Other">Other Personal Health Document</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={shareWithClinicians}
              onChange={(e) => setShareWithClinicians(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded border-slate-300"
            />
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              Allow attending J & J Memorial doctors to review this file during consultations
            </span>
          </label>

          <button
            type="submit"
            disabled={!title || !fileName || isUploading}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center space-x-2 ${
              title && fileName && !isUploading
                ? 'bg-teal-600 hover:bg-teal-700 text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Encrypting & Storing...' : 'Upload & Encrypt'}</span>
          </button>
        </div>
      </form>

      {/* Uploaded Documents List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h4 className="font-bold text-hospital-navy text-sm">
          My Stored Health Documents ({docs.length})
        </h4>

        {docs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-xl">
            No medical documents uploaded yet. Use the upload area above to attach your first record.
          </div>
        ) : (
          <div className="space-y-3">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                    <File className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h5 className="font-bold text-slate-900 text-sm">
                        {doc.title}
                      </h5>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                        {doc.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 font-mono">
                      {doc.fileName} &bull; {doc.fileSize} &bull; Uploaded {doc.uploadDate}
                    </p>

                    {doc.sharedWithClinicians ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Accessible to attending physicians
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                        <Lock className="w-3 h-3 text-slate-400" />
                        Private file (Patient only)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => window.print()}
                    className="p-2 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition"
                    title="Download File"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
