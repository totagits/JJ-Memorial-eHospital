import React, { useState, useEffect } from 'react';
import { dbStore } from '../../services/dbStore';
import { RadiologyScan, Patient } from '../../types';
import {
  Scan,
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Sun,
  Contrast,
  Sliders,
  CheckCircle2,
  Maximize2,
  FileText,
  User,
  Plus
} from 'lucide-react';

export const RadiologyModule: React.FC = () => {
  const [scans, setScans] = useState<RadiologyScan[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedScan, setSelectedScan] = useState<RadiologyScan | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Viewer controls
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isInverted, setIsInverted] = useState(false);
  const [rotation, setRotation] = useState(0);

  // Upload Form states
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [modality, setModality] = useState<RadiologyScan['modality']>('X-Ray');
  const [bodyPart, setBodyPart] = useState('Chest PA Upright');
  const [orderedBy, setOrderedBy] = useState('Dr. Emmanuel Tamba, MD');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80');

  useEffect(() => {
    const update = () => {
      const allScans = dbStore.getRadiologyScans();
      setScans(allScans);
      setPatients(dbStore.getPatients());
      if (!selectedScan && allScans.length > 0) {
        setSelectedScan(allScans[0]);
      }
    };
    update();
    return dbStore.subscribe(update);
  }, []);

  const handleResetViewer = () => {
    setZoom(1);
    setBrightness(100);
    setContrast(100);
    setIsInverted(false);
    setRotation(0);
  };

  const handleUploadScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === selectedPatientId) || patients[0];
    if (!pat) return;

    await dbStore.uploadRadiologyScan({
      patientId: pat.id,
      patientName: pat.name,
      mrn: pat.mrn,
      modality,
      bodyPart,
      orderDate: new Date().toISOString().split('T')[0],
      orderedBy,
      status: 'Requested',
      imageUrl,
    });

    setIsUploading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <Scan className="w-3.5 h-3.5" />
            <span>Digital Diagnostic Imaging & PACS Viewer</span>
          </div>
          <h2 className="text-2xl font-extrabold text-hospital-navy mt-1">
            Radiology & Medical Scan Review
          </h2>
          <p className="text-xs text-slate-500">
            Upload X-rays, CTs, and ultrasounds directly to patient records and review high-resolution scans with interactive clinical image controls.
          </p>
        </div>

        <button
          onClick={() => setIsUploading(!isUploading)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
        >
          <Upload className="w-4 h-4" />
          <span>{isUploading ? 'Close Upload Form' : 'Attach Medical Imaging Scan'}</span>
        </button>
      </div>

      {/* Upload Form Modal / Drawer */}
      {isUploading && (
        <form onSubmit={handleUploadScan} className="p-6 bg-white rounded-2xl border border-teal-300 shadow-lg space-y-4">
          <h4 className="font-bold text-hospital-navy text-sm flex items-center gap-2">
            <Upload className="w-4 h-4 text-teal-600" />
            Attach New Diagnostic Imaging Study
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Patient *</label>
              <select
                required
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="">-- Choose Patient --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.mrn})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Imaging Modality *</label>
              <select
                value={modality}
                onChange={(e) => setModality(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="X-Ray">Digital Radiography (X-Ray)</option>
                <option value="CT Scan">Computed Tomography (CT Scan)</option>
                <option value="Ultrasound">Diagnostic Ultrasound</option>
                <option value="MRI">Magnetic Resonance Imaging (MRI)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Anatomical Region / Body Part</label>
              <input
                type="text"
                required
                placeholder="e.g. Chest PA, Pelvis, Right Knee"
                value={bodyPart}
                onChange={(e) => setBodyPart(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Referring Physician</label>
              <input
                type="text"
                value={orderedBy}
                onChange={(e) => setOrderedBy(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block font-semibold text-slate-700 mb-1">PACS Image Storage URL (or select sample)</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-[11px]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsUploading(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
            >
              Save Scan to Patient Record
            </button>
          </div>
        </form>
      )}

      {/* Main Radiology Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Scans Worklist (Col 4) */}
        <div className="lg:col-span-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Imaging Studies Queue ({scans.length})
          </h4>

          <div className="space-y-3">
            {scans.map((scan) => {
              const isSelected = selectedScan?.id === scan.id;
              return (
                <div
                  key={scan.id}
                  onClick={() => {
                    setSelectedScan(scan);
                    handleResetViewer();
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-teal-50/80 border-teal-500 ring-1 ring-teal-500 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-hospital-navy uppercase text-[10px] bg-slate-100 px-2 py-0.5 rounded">
                      {scan.modality}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      scan.status === 'Reported' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {scan.status}
                    </span>
                  </div>

                  <h5 className="font-bold text-slate-900 text-sm">
                    {scan.bodyPart}
                  </h5>

                  <p className="text-xs text-slate-500 mt-0.5">
                    {scan.patientName} ({scan.mrn})
                  </p>
                  <div className="mt-2 text-[11px] text-slate-400">
                    Ordered: {scan.orderDate} by {scan.orderedBy}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Integrated Medical Image Viewer (Col 8) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedScan ? (
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
              {/* Viewer Top Toolbar */}
              <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-white text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-teal-400">{selectedScan.modality}:</span>
                  <span className="font-medium text-slate-200">{selectedScan.bodyPart}</span>
                  <span className="text-slate-500 font-mono text-[11px]">({selectedScan.patientName})</span>
                </div>

                {/* Toolbar Buttons: Zoom, Invert, Rotate, Reset */}
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsInverted(!isInverted)}
                    className={`p-1.5 rounded transition ${
                      isInverted ? 'bg-teal-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                    title="Invert Bone/Tissue Contrast"
                  >
                    <Contrast className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                    title="Rotate 90deg"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleResetViewer}
                    className="px-2.5 py-1 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Viewport Canvas Screen */}
              <div className="relative h-96 sm:h-[460px] bg-black overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing">
                {/* Image under clinical filter transformation */}
                <img
                  src={selectedScan.imageUrl}
                  alt={selectedScan.bodyPart}
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    filter: `brightness(${brightness}%) contrast(${contrast}%) ${isInverted ? 'invert(1)' : ''}`,
                    transition: 'transform 0.1s ease-out',
                  }}
                  className="max-h-full max-w-full object-contain pointer-events-none select-none"
                />

                {/* Patient DICOM Header Overlay */}
                <div className="absolute top-3 left-3 bg-slate-950/70 backdrop-blur px-2.5 py-1.5 rounded text-[10px] font-mono text-slate-300 space-y-0.5 pointer-events-none">
                  <div>PATIENT: {selectedScan.patientName}</div>
                  <div>MRN: {selectedScan.mrn}</div>
                  <div>ACQ: {selectedScan.orderDate}</div>
                </div>

                <div className="absolute bottom-3 right-3 bg-slate-950/70 backdrop-blur px-2.5 py-1.5 rounded text-[10px] font-mono text-teal-400 pointer-events-none">
                  ZOOM: {Math.round(zoom * 100)}% &bull; INVERT: {isInverted ? 'ON' : 'OFF'}
                </div>
              </div>

              {/* Radiologist Report & Findings Section */}
              <div className="p-6 bg-slate-900 border-t border-slate-800 text-xs text-slate-300 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    Radiologist Clinical Findings & Sign-off
                  </h5>
                  <span className="text-slate-400 font-mono text-[11px]">
                    Verified by: {selectedScan.radiologistName || 'Pending Consultant Verification'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs leading-relaxed">
                  <div>
                    <strong className="text-slate-200">Findings: </strong>
                    <span>{selectedScan.findings || 'Image acquired. Pending detailed radiologist read.'}</span>
                  </div>
                  <div>
                    <strong className="text-teal-300">Impression: </strong>
                    <span className="text-slate-200">{selectedScan.impression || 'Awaiting consultant sign-off.'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center border border-dashed rounded-2xl text-slate-400 text-xs">
              Select an imaging scan from the left queue to open the Medical Viewer.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
