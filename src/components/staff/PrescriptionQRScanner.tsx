import React, { useState, useRef, useEffect } from 'react';
import { dbStore } from '../../services/dbStore';
import { QrCode, Camera, CameraOff, CheckCircle2, AlertCircle, X, ShieldCheck, Search } from 'lucide-react';

interface PrescriptionQRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScannedCode?: (code: string) => void;
}

export const PrescriptionQRScanner: React.FC<PrescriptionQRScannerProps> = ({
  isOpen,
  onClose,
  onScannedCode,
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [dispenseSuccess, setDispenseSuccess] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setScannedResult(null);
      setDispenseSuccess(false);
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      } else {
        setCameraError('Camera API not accessible in this browser context. Please use manual code input.');
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('Camera access unavailable. You can enter or select the prescription code below.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleSimulateScan = (code: string) => {
    setScannedResult(code);
    onScannedCode?.(code);
  };

  const handleDispenseScanned = async () => {
    if (!scannedResult) return;
    await dbStore.dispensePrescription(scannedResult, 'Pharm. Varney Sheriff, RPh');
    setDispenseSuccess(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  const foundPrescription = scannedResult
    ? dbStore.getPrescriptions().find((p) => p.prescriptionCode === scannedResult)
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <QrCode className="w-3.5 h-3.5" />
            <span>Prescription Authentication & Barcode Decryption</span>
          </div>
          <h3 className="text-xl font-extrabold text-hospital-navy mt-1">
            Scan Prescription QR Code
          </h3>
          <p className="text-xs text-slate-500">
            Hold the patient's paper prescription or digital phone slip up to the camera to instantly verify order authenticity.
          </p>
        </div>

        {/* Camera Viewfinder */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 h-64 border-2 border-dashed border-teal-400 flex items-center justify-center">
          {cameraActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-6 space-y-2 text-slate-400">
              <CameraOff className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-xs">{cameraError || 'Camera inactive'}</p>
            </div>
          )}

          {/* Scanner Reticle Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-48 h-48 border-2 border-teal-400 rounded-2xl relative shadow-[0_0_15px_rgba(20,184,166,0.5)]">
              <span className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-teal-400" />
              <span className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-teal-400" />
              <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-teal-400" />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-teal-400" />
              <div className="w-full h-0.5 bg-teal-400/80 animate-pulse mt-24" />
            </div>
          </div>
        </div>

        {/* Quick Simulated Prescription Presets for Instant Test */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Simulate Instant Optical Scan:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSimulateScan('RX-JJM-9821')}
              className="px-2.5 py-1 text-xs font-mono font-bold bg-white border border-slate-300 rounded hover:bg-teal-50 hover:border-teal-300 text-teal-800"
            >
              Scan RX-JJM-9821 (Korto Kollie)
            </button>
            <button
              onClick={() => handleSimulateScan('RX-JJM-9750')}
              className="px-2.5 py-1 text-xs font-mono font-bold bg-white border border-slate-300 rounded hover:bg-teal-50 hover:border-teal-300 text-teal-800"
            >
              Scan RX-JJM-9750 (James Fahnbulleh)
            </button>
          </div>
        </div>

        {/* Scanned Result Card */}
        {foundPrescription && (
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-teal-600" />
                <h4 className="font-extrabold text-hospital-navy text-sm">
                  Verified Order: {foundPrescription.prescriptionCode}
                </h4>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                foundPrescription.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {foundPrescription.status}
              </span>
            </div>

            <div className="text-xs text-slate-700 space-y-1">
              <div>Patient: <strong>{foundPrescription.patientName} ({foundPrescription.mrn})</strong></div>
              <div>Prescribing Physician: <strong>{foundPrescription.doctorName}</strong></div>
              <div>Medications to Dispense:</div>
              <ul className="list-disc pl-5 space-y-0.5 text-slate-600">
                {foundPrescription.items.map((i, idx) => (
                  <li key={idx}>
                    <strong>{i.medicationName}</strong> - Qty: {i.quantity} ({i.instructions})
                  </li>
                ))}
              </ul>
            </div>

            {dispenseSuccess ? (
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl text-center text-xs font-bold animate-bounce">
                Order Dispensed & Stock Successfully Deducted!
              </div>
            ) : foundPrescription.status === 'Pending' ? (
              <button
                onClick={handleDispenseScanned}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
              >
                Dispense Medications & Deduct Inventory
              </button>
            ) : (
              <div className="text-center text-xs text-slate-500 italic">
                Prescription has already been filled.
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
};
