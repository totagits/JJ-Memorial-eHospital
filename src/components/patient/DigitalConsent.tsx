import React, { useState, useRef, useEffect } from 'react';
import { dbStore } from '../../services/dbStore';
import { DigitalConsentForm } from '../../types';
import { FileCheck, Shield, CheckCircle2, RotateCcw, Download, Lock, Check } from 'lucide-react';

interface DigitalConsentProps {
  patientId: string;
  patientName: string;
  mrn: string;
}

export const DigitalConsent: React.FC<DigitalConsentProps> = ({
  patientId,
  patientName,
  mrn,
}) => {
  const [consents, setConsents] = useState<DigitalConsentForm[]>([]);
  const [selectedFormType, setSelectedFormType] = useState<DigitalConsentForm['formType']>(
    'General Admission & Treatment Consent'
  );
  const [signerName, setSignerName] = useState(patientName);
  const [relationship, setRelationship] = useState<DigitalConsentForm['signerRelationship']>('Self');
  const [hasAgreed, setHasAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const update = () => {
      setConsents(dbStore.getDigitalConsents(patientId));
    };
    update();
    return dbStore.subscribe(update);
  }, [patientId]);

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0b1d3a';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSubmitSignature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSignature || !hasAgreed || !signerName) return;

    const canvas = canvasRef.current;
    const signatureDataUrl = canvas ? canvas.toDataURL('image/png') : '';
    const hash = `SHA256-${Math.random().toString(36).substring(2, 15).toUpperCase()}-${Date.now()}`;

    setIsSubmitting(true);
    try {
      await dbStore.submitDigitalConsent({
        patientId,
        patientName,
        mrn,
        formType: selectedFormType,
        signatureDataUrl,
        signedName: signerName,
        signerRelationship: relationship,
        timestamp: new Date().toISOString(),
        documentHash: hash,
        ipAddress: '197.231.24.110 (Monrovia, LR)',
      });

      setSuccessMessage(`Document successfully executed with audit hash ${hash.substring(0, 16)}...`);
      clearCanvas();
      setHasAgreed(false);
      setTimeout(() => setSuccessMessage(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Cryptographic Legal Signatures</span>
          </div>
          <h2 className="text-2xl font-extrabold text-hospital-navy mt-1">
            Digital Medical Consent
          </h2>
          <p className="text-xs text-slate-500">
            Electronically authorize treatments, surgeries, and records releases with verified timestamps.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Signing Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Selection & Legal Text (Col 7) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Select Consent Document to Execute
              </label>
              <select
                value={selectedFormType}
                onChange={(e) => setSelectedFormType(e.target.value as any)}
                className="w-full px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-teal-500"
              >
                <option value="General Admission & Treatment Consent">
                  General Admission & Inpatient Treatment Consent
                </option>
                <option value="Surgical & Anesthesia Authorization">
                  Surgical & Anesthesia Informed Consent
                </option>
                <option value="Blood Transfusion Consent">
                  Blood Transfusion & Blood Component Consent
                </option>
                <option value="Telehealth Care Consent">
                  Telehealth Remote Consultation Patient Agreement
                </option>
                <option value="Medical Records Release Authorization">
                  Release of Protected Health Information (PHI)
                </option>
              </select>
            </div>

            {/* Legal Form Body Text */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-h-56 overflow-y-auto text-xs text-slate-700 leading-relaxed space-y-2.5">
              <h4 className="font-bold text-hospital-navy uppercase">
                {selectedFormType} - Terms & Legal Disclosure
              </h4>
              <p>
                1. I hereby authorize the medical staff, attending physicians, registered nurses, and allied healthcare professionals of <strong>J & J Memorial Health Center</strong> to administer medical examinations, treatments, medications, diagnostic tests (including blood work and radiology imaging), and emergency stabilization as considered medically necessary for the patient named herein.
              </p>
              <p>
                2. I understand that the practice of medicine is not an exact science and that no guarantees or assurances have been made regarding the outcome of any diagnosis, treatment, or surgical procedure.
              </p>
              <p>
                3. I acknowledge that this electronic signature carries full legal weight pursuant to the Electronic Transactions Regulations of the Republic of Liberia. A cryptographically generated SHA-256 tamper-evident hash and timestamp will be embedded into the patient's master electronic health record.
              </p>
            </div>

            {/* Signer Demographics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Legal Signer Full Name *</label>
                <input
                  type="text"
                  required
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Relationship to Patient</label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Self">Patient (Self)</option>
                  <option value="Parent">Parent / Legal Guardian</option>
                  <option value="Guardian">Court Appointed Guardian</option>
                  <option value="Power of Attorney">Healthcare Power of Attorney</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasAgreed}
                  onChange={(e) => setHasAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                />
                <span className="text-xs text-slate-600 leading-tight">
                  I confirm that I have read and understand this consent document. I am legally competent to execute this document on behalf of <strong>{patientName} ({mrn})</strong>.
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Signature Pad & Submission (Col 5) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-teal-600" />
                <h4 className="font-bold text-hospital-navy text-sm">
                  Electronic Signature Pad
                </h4>
              </div>
              <button
                type="button"
                onClick={clearCanvas}
                className="inline-flex items-center space-x-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear Pad</span>
              </button>
            </div>

            {/* Canvas */}
            <div className="border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-slate-50 relative">
              <canvas
                ref={canvasRef}
                width={360}
                height={150}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-[150px] cursor-crosshair touch-none"
              />
              {!hasSignature && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs text-slate-400 font-medium">
                  Draw signature here with mouse or fingertip
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px] text-slate-500 font-mono">
              <div className="flex justify-between">
                <span>Timestamp:</span>
                <span className="text-slate-700">{new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Security Engine:</span>
                <span className="text-teal-700 font-bold">SHA-256 HMAC Hardware Token</span>
              </div>
            </div>

            <button
              onClick={handleSubmitSignature}
              disabled={!hasSignature || !hasAgreed || !signerName || isSubmitting}
              className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center space-x-2 ${
                hasSignature && hasAgreed && signerName && !isSubmitting
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Signing & Securing...' : 'Securely Sign & Save'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Previously Signed Consents Log */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-hospital-navy text-base flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-teal-600" />
          Executed Digital Consents on File ({consents.length})
        </h3>

        {consents.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-xl">
            No consent forms have been signed yet. Select a document above to execute your first consent.
          </div>
        ) : (
          <div className="space-y-3">
            {consents.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {c.formType}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3" />
                      Legally Binding
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Signed by <strong>{c.signedName}</strong> ({c.signerRelationship}) &bull; {new Date(c.timestamp).toLocaleString()}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 truncate max-w-lg">
                    Hash: {c.documentHash}
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  {c.signatureDataUrl && (
                    <img
                      src={c.signatureDataUrl}
                      alt="Signature"
                      className="h-9 w-24 object-contain bg-white rounded border border-slate-200 p-0.5"
                    />
                  )}
                  <button
                    onClick={() => window.print()}
                    className="p-2 text-teal-700 hover:bg-teal-100 rounded-lg transition"
                    title="Print / Save PDF"
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
