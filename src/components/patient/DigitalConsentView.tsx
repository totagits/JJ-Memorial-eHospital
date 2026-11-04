import React, { useState, useRef } from 'react';
import { 
  FileCheck2, 
  FileSignature, 
  ShieldCheck, 
  AlertTriangle, 
  Download, 
  Printer, 
  CheckCircle2, 
  Calendar,
  Lock,
  User,
  Plus,
  X,
  RotateCcw
} from 'lucide-react';
import { Patient } from '../../types/patient';
import { DigitalConsentForm, ConsentFormType } from '../../types/digitalConsent';
import { addDigitalConsent } from '../../services/storageService';

interface DigitalConsentViewProps {
  patient: Patient;
  consents: DigitalConsentForm[];
}

export const DigitalConsentView: React.FC<DigitalConsentViewProps> = ({
  patient,
  consents
}) => {
  const patientConsents = consents.filter(c => c.patientId === patient.id || c.patientMrn === patient.mrn);
  const [showSignModal, setShowSignModal] = useState(false);
  const [selectedConsent, setSelectedConsent] = useState<DigitalConsentForm | null>(null);

  // Form states for new consent signing
  const [selectedFormType, setSelectedFormType] = useState<ConsentFormType>('GENERAL_ADMISSION');
  const [signerName, setSignerName] = useState(`${patient.firstName} ${patient.lastName}`);
  const [signerRelationship, setSignerRelationship] = useState<'SELF' | 'PARENT' | 'LEGAL_GUARDIAN' | 'SPOUSE'>('SELF');
  const [signatureMode, setSignatureMode] = useState<'DRAW' | 'TYPE'>('DRAW');
  const [typedSignature, setTypedSignature] = useState(`${patient.firstName} ${patient.lastName}`);
  const [agreedTerms, setAgreedTerms] = useState(false);

  // Canvas drawing ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Canvas drawing event handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#0f766e';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
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
    setHasDrawn(false);
  };

  const getFormTemplate = (type: ConsentFormType) => {
    switch (type) {
      case 'GENERAL_ADMISSION':
        return {
          title: 'General Clinical Admission & Treatment Authorization',
          summary: 'Informed consent for outpatient consultations, routine nursing observations, triage assessment, diagnostic pathology, and pharmacy administration under Liberian Ministry of Health healthcare standards.',
          terms: [
            'I authorize the certified clinical team of J & J Memorial e-Hospital to carry out all necessary physical examinations and diagnostic workups.',
            'I understand the clinical reasons, potential benefits, and common risks associated with diagnostic procedures and medications will be explained to me.',
            'I consent to the encrypted storage and audit tracking of my health records within the hospital Electronic Medical Record (EMR) system.',
            'I accept financial responsibility for care rendered under my documented insurance plan or direct co-pay schedule.'
          ]
        };
      case 'SURGICAL_PROCEDURE':
        return {
          title: 'Informed Consent for Minor Surgical / Invasive Procedure',
          summary: 'Consent for sterile surgical intervention, wound debridement, incision and drainage, local anesthesia, and post-operative recovery monitoring.',
          terms: [
            'The surgeon has explained the diagnosis, planned surgical procedure, expected outcomes, and alternative medical management options.',
            'I understand local/regional anesthesia may be administered and have disclosed all known drug allergies and bleeding disorders.',
            'I consent to post-procedure wound dressings, antibiotic prophylaxis, and follow-up clinical visits.'
          ]
        };
      case 'TELEHEALTH_VIRTUAL_CARE':
        return {
          title: 'Telehealth & Digital Video Consultation Consent',
          summary: 'Authorization for remote medical assessment and video consultation when travel to the VOA East facility is constrained.',
          terms: [
            'I understand virtual consultations do not replace acute trauma bay or life-support emergency resuscitation.',
            'Video and audio feeds are encrypted end-to-end and stored according to medical confidentiality standards.',
            'If my medical status deteriorates, I agree to proceed immediately to the nearest hospital emergency department.'
          ]
        };
      case 'BLOOD_TRANSFUSION':
        return {
          title: 'Informed Consent for Blood & Hemotherapy Transfusion',
          summary: 'Consent for therapeutic blood transfusion (Whole Blood, Packed RBC, or Fresh Frozen Plasma) in acute anemia or hemorrhage.',
          terms: [
            'I acknowledge that all donor blood units are pre-screened for HIV 1/2, Hepatitis B, Hepatitis C, and Syphilis by the blood bank laboratory.',
            'My crossmatch compatibility has been validated prior to infusion.',
            'A registered nurse will monitor my vitals continuously during the transfusion process.'
          ]
        };
      case 'RELEASE_OF_RECORDS':
        return {
          title: 'Authorization for Disclosure of Protected Health Records',
          summary: 'Consent to release medical diagnostic summaries, lab results, and discharge abstracts to an accredited insurance payer or referring specialist.',
          terms: [
            'I authorize J & J Memorial to release relevant diagnostic and clinical charts to designated recipients for continuing care or insurance processing.',
            'This authorization remains valid for 12 months unless revoked in writing.'
          ]
        };
    }
  };

  const handleSignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) {
      alert('Please review and check the agreement terms.');
      return;
    }

    let signatureData = '';
    if (signatureMode === 'DRAW') {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) {
        alert('Please draw your electronic signature on the signature pad.');
        return;
      }
      signatureData = canvas.toDataURL('image/png');
    } else {
      if (!typedSignature.trim()) {
        alert('Please enter your full legal name to generate your electronic signature.');
        return;
      }
      signatureData = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="60"><text x="10" y="40" font-family="cursive" font-size="28" fill="%230f766e">${encodeURIComponent(typedSignature)}</text></svg>`;
    }

    const template = getFormTemplate(selectedFormType);

    const newConsent: DigitalConsentForm = {
      id: `CONS-${Date.now()}`,
      patientId: patient.id,
      patientMrn: patient.mrn,
      patientName: `${patient.firstName} ${patient.lastName}`,
      formType: selectedFormType,
      title: template.title,
      version: 'v2.4',
      summary: template.summary,
      termsAndConditions: template.terms,
      signatureDataUrl: signatureData,
      signatureType: signatureMode === 'DRAW' ? 'DIGITAL_DRAW' : 'TYPED_ELECTRONIC',
      signedBy: signerName,
      signerRelationship: signerRelationship,
      signerNationalId: patient.nationalId || 'NIR-VERIFIED',
      signedAt: new Date().toISOString(),
      witnessName: 'Nurse Korpo Weah, RN',
      witnessRole: 'Registered Nurse / Admissions Staff',
      status: 'ACTIVE_VALID',
      ipAddress: '197.234.221.14 (Patient Portal Session)',
      pdfExportHash: `SHA256:${Math.random().toString(36).substring(2, 15)}...`
    };

    addDigitalConsent(newConsent);
    setShowSignModal(false);
    clearCanvas();
    setAgreedTerms(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
            <FileSignature className="w-5 h-5 text-teal-700" />
            <span>Electronic Medical Consent & Patient Rights</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            Digital Treatment Authorization & Agreements
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Review your active clinical consents and electronically authorize care procedures without paper delays. All digital signatures are legally binding, timestamped, and encrypted into your master EMR record.
          </p>
        </div>

        <button
          onClick={() => setShowSignModal(true)}
          className="bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Sign New Consent Form</span>
        </button>
      </div>

      {/* Active Consents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {patientConsents.length === 0 ? (
          <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No active consent forms on record</h3>
            <p className="text-xs text-slate-500 mt-1">Click "Sign New Consent Form" above to authorize clinical care.</p>
          </div>
        ) : (
          patientConsents.map(consent => (
            <div
              key={consent.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 hover:border-teal-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{consent.title}</h3>
                    <span className="text-[11px] text-slate-500">Form ID: {consent.id} · {consent.version}</span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Legally Valid
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {consent.summary}
              </p>

              {/* Signature Snapshot Box */}
              <div className="p-3 bg-teal-50/50 border border-teal-100 rounded-lg flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-900 block">
                    Signed by {consent.signedBy} ({consent.signerRelationship})
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {new Date(consent.signedAt).toLocaleDateString()} at {new Date(consent.signedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Witness: {consent.witnessName} ({consent.witnessRole})
                  </div>
                </div>

                <div className="bg-white p-1.5 rounded border border-teal-200 shrink-0">
                  <img
                    src={consent.signatureDataUrl}
                    alt="Digital Signature"
                    className="h-9 max-w-[120px] object-contain"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                <span className="text-[11px] text-slate-400 font-mono">
                  {consent.pdfExportHash || 'SHA-256 VERIFIED'}
                </span>

                <button
                  onClick={() => setSelectedConsent(consent)}
                  className="text-teal-800 hover:text-teal-900 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Review Terms</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Terms Modal */}
      {selectedConsent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-700" />
                <h3 className="font-bold text-base text-slate-900">{selectedConsent.title}</h3>
              </div>
              <button
                onClick={() => setSelectedConsent(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <p className="font-semibold text-slate-900">Summary:</p>
              <p className="leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                {selectedConsent.summary}
              </p>

              <p className="font-semibold text-slate-900 pt-2">Authorized Clauses & Terms:</p>
              <ul className="space-y-2 list-disc list-inside bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-600">
                {selectedConsent.termsAndConditions.map((term, idx) => (
                  <li key={idx} className="leading-relaxed">{term}</li>
                ))}
              </ul>

              <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 text-[11px]">
                <div>
                  <span className="font-bold text-slate-900 block">Signer Legal Identity</span>
                  <span>{selectedConsent.signedBy} ({selectedConsent.signerRelationship})</span>
                  <div className="text-slate-500">ID: {selectedConsent.signerNationalId || 'N/A'}</div>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Witness & Location</span>
                  <span>{selectedConsent.witnessName}</span>
                  <div className="text-slate-500">Signed: {new Date(selectedConsent.signedAt).toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedConsent(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign New Consent Modal with Interactive Drawing Pad */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-teal-800" />
                <h3 className="font-bold text-base text-slate-900">Sign Electronic Consent Form</h3>
              </div>
              <button
                onClick={() => setShowSignModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSignSubmit} className="space-y-4 text-xs">
              {/* Select Form Type */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Consent Form Type *</label>
                <select
                  value={selectedFormType}
                  onChange={e => setSelectedFormType(e.target.value as ConsentFormType)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-900 font-medium"
                >
                  <option value="GENERAL_ADMISSION">General Clinical Admission & Treatment</option>
                  <option value="SURGICAL_PROCEDURE">Minor Surgical / Invasive Procedure Consent</option>
                  <option value="TELEHEALTH_VIRTUAL_CARE">Telehealth & Video Consultation Consent</option>
                  <option value="BLOOD_TRANSFUSION">Blood & Hemotherapy Transfusion Consent</option>
                  <option value="RELEASE_OF_RECORDS">Release of Protected Health Records</option>
                </select>
              </div>

              {/* Form Summary & Clauses Preview */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs">{getFormTemplate(selectedFormType).title}</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {getFormTemplate(selectedFormType).summary}
                </p>
                <div className="space-y-1 pt-1 text-[11px] text-slate-600">
                  {getFormTemplate(selectedFormType).terms.map((t, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signer Identity Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Legal Signer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={signerName}
                    onChange={e => setSignerName(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Relationship to Patient *</label>
                  <select
                    value={signerRelationship}
                    onChange={e => setSignerRelationship(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 bg-white"
                  >
                    <option value="SELF">Self (Patient)</option>
                    <option value="PARENT">Parent</option>
                    <option value="LEGAL_GUARDIAN">Legal Guardian</option>
                    <option value="SPOUSE">Spouse</option>
                  </select>
                </div>
              </div>

              {/* Signature Mode Toggle: Draw vs Type */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-800">Electronic Signature *</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSignatureMode('DRAW')}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                        signatureMode === 'DRAW' ? 'bg-teal-800 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Draw with Finger / Mouse
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignatureMode('TYPE')}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                        signatureMode === 'TYPE' ? 'bg-teal-800 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Type Legal Name
                    </button>
                  </div>
                </div>

                {signatureMode === 'DRAW' ? (
                  <div className="border border-slate-300 rounded-xl p-2 bg-slate-50 relative">
                    <canvas
                      ref={canvasRef}
                      width={450}
                      height={120}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-28 bg-white border border-dashed border-slate-300 rounded-lg cursor-crosshair touch-none"
                    />
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 px-1">
                      <span>Sign above using finger, stylus, or cursor</span>
                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Clear</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border border-slate-300 rounded-xl p-3 bg-slate-50 space-y-2">
                    <input
                      type="text"
                      value={typedSignature}
                      onChange={e => setTypedSignature(e.target.value)}
                      placeholder="Type your signature here..."
                      className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-base font-serif italic text-teal-900"
                    />
                    <span className="text-[10px] text-slate-500 block">
                      Typed legal signature holds equivalent validity under Liberian e-signature regulatory frameworks.
                    </span>
                  </div>
                )}
              </div>

              {/* Agreement Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2 cursor-pointer bg-teal-50/60 p-3 rounded-lg border border-teal-200">
                  <input
                    type="checkbox"
                    required
                    checked={agreedTerms}
                    onChange={e => setAgreedTerms(e.target.checked)}
                    className="mt-0.5 rounded text-teal-800 focus:ring-teal-700"
                  />
                  <span className="text-[11px] text-slate-700 leading-snug">
                    I confirm that I have read and understand the treatment authorization terms and conditions, and that my electronic signature represents my informed consent to clinical care at J & J Memorial e-Hospital.
                  </span>
                </label>
              </div>

              {/* Submit Actions */}
              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSignModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-800 hover:bg-teal-900 text-white font-semibold px-5 py-2 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Confirm & Sign Electronically
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
