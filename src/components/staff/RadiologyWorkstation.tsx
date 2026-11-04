import React, { useState, useRef } from 'react';
import { 
  Scan, 
  FileImage, 
  Upload, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Sliders, 
  Eye, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Ruler, 
  Maximize2, 
  Minimize2, 
  Layers, 
  Sparkles, 
  Send, 
  Lock, 
  Globe, 
  Clock, 
  User, 
  Activity,
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { getDatabaseState, updateDatabaseState, logAuditEvent } from '../../services/storageService';
import { RadiologyStudy, RadiologyImage } from '../../types/clinical';
import { UserAccount } from '../../types/auth';

interface RadiologyWorkstationProps {
  currentUser: UserAccount;
  initialSelectedStudyId?: string;
}

export const RadiologyWorkstation: React.FC<RadiologyWorkstationProps> = ({ 
  currentUser,
  initialSelectedStudyId 
}) => {
  const db = getDatabaseState();
  const [studies, setStudies] = useState<RadiologyStudy[]>(db.radiologyStudies || []);
  const [selectedStudyId, setSelectedStudyId] = useState<string>(
    initialSelectedStudyId || (db.radiologyStudies && db.radiologyStudies.length > 0 ? db.radiologyStudies[0].id : '')
  );
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [modalityFilter, setModalityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Medical Image Viewer State
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [isInverted, setIsInverted] = useState<boolean>(false);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [isRulerActive, setIsRulerActive] = useState<boolean>(false);
  const [measurementDistance, setMeasurementDistance] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isComparingViews, setIsComparingViews] = useState<boolean>(false);

  // File Upload State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadViewType, setUploadViewType] = useState<RadiologyImage['viewType']>('PA');
  const [uploadFilePreview, setUploadFilePreview] = useState<string | null>(null);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileSizeKb, setUploadFileSizeKb] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Study Order Modal
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [orderPatientId, setOrderPatientId] = useState(db.patients[0]?.id || '');
  const [orderModality, setOrderModality] = useState<RadiologyStudy['modality']>('X_RAY');
  const [orderStudyDesc, setOrderStudyDesc] = useState('');
  const [orderBodyPart, setOrderBodyPart] = useState('');
  const [orderIndication, setOrderIndication] = useState('');
  const [orderUrgency, setOrderUrgency] = useState<RadiologyStudy['urgency']>('ROUTINE');

  // Findings Edit State
  const [editFindings, setEditFindings] = useState('');
  const [editImpression, setEditImpression] = useState('');
  const [isSigningReport, setIsSigningReport] = useState(false);

  const selectedStudy = studies.find(s => s.id === selectedStudyId) || studies[0];

  // Sync findings when selected study changes
  React.useEffect(() => {
    if (selectedStudy) {
      setEditFindings(selectedStudy.findings || '');
      setEditImpression(selectedStudy.impression || '');
      setActiveImageIndex(0);
      resetViewerControls();
    }
  }, [selectedStudyId]);

  const resetViewerControls = () => {
    setZoomLevel(1);
    setRotationAngle(0);
    setIsInverted(false);
    setBrightness(100);
    setContrast(100);
    setMeasurementDistance(null);
  };

  // Filtered Studies
  const filteredStudies = studies.filter(study => {
    const matchesSearch = 
      study.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.patientMrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.accessionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.studyDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.bodyPart.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesModality = modalityFilter === 'ALL' || study.modality === modalityFilter;
    const matchesStatus = statusFilter === 'ALL' || study.status === statusFilter;

    return matchesSearch && matchesModality && matchesStatus;
  });

  // Handle File Input Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFileName(file.name);
    setUploadFileSizeKb(Math.round(file.size / 1024));

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle Image Attachment to Current Study
  const handleAttachImageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFilePreview || !selectedStudy) return;

    const newImage: RadiologyImage = {
      id: `IMG-${Date.now()}`,
      url: uploadFilePreview,
      fileName: uploadFileName || `Scan_${Date.now()}.png`,
      fileSizeKb: uploadFileSizeKb || 1200,
      viewType: uploadViewType,
      caption: uploadCaption || `${uploadViewType} view captured`,
      uploadedAt: new Date().toISOString(),
      uploadedBy: currentUser.fullName,
    };

    const updatedStudy: RadiologyStudy = {
      ...selectedStudy,
      status: selectedStudy.status === 'SCHEDULED' ? 'IMAGE_ACQUIRED' : selectedStudy.status,
      completedAt: selectedStudy.completedAt || new Date().toISOString(),
      technologistName: selectedStudy.technologistName || currentUser.fullName,
      images: [...selectedStudy.images, newImage],
    };

    const nextStudies = studies.map(s => s.id === updatedStudy.id ? updatedStudy : s);
    setStudies(nextStudies);
    updateDatabaseState({ radiologyStudies: nextStudies });

    logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'UPDATE',
      module: 'RADIOLOGY',
      patientId: selectedStudy.patientId,
      patientMrn: selectedStudy.patientMrn,
      details: `Attached medical imaging file ${newImage.fileName} (${newImage.viewType}) to study ${selectedStudy.accessionNumber}.`,
      ipAddress: 'Radiology PACS Console',
      status: 'SUCCESS',
    });

    setIsUploadModalOpen(false);
    setUploadFilePreview(null);
    setUploadCaption('');
    setActiveImageIndex(updatedStudy.images.length - 1);
  };

  // Handle Radiologist Report Sign-Off
  const handleSignReport = (releaseToPortal: boolean) => {
    if (!selectedStudy) return;

    const updatedStudy: RadiologyStudy = {
      ...selectedStudy,
      findings: editFindings,
      impression: editImpression,
      radiologistName: currentUser.fullName,
      status: 'RELEASED',
      releasedAt: new Date().toISOString(),
      releasedToPatientPortal: releaseToPortal,
    };

    const nextStudies = studies.map(s => s.id === updatedStudy.id ? updatedStudy : s);
    setStudies(nextStudies);
    updateDatabaseState({ radiologyStudies: nextStudies });

    logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'RELEASE_RESULT',
      module: 'RADIOLOGY',
      patientId: selectedStudy.patientId,
      patientMrn: selectedStudy.patientMrn,
      details: `Radiologist formal sign-off for study ${selectedStudy.accessionNumber}. Impression: ${editImpression}. Released to Portal: ${releaseToPortal}`,
      ipAddress: 'Diagnostic Radiology Reading Workstation',
      status: 'SUCCESS',
    });

    setIsSigningReport(false);
  };

  // Handle New Study Order Creation
  const handleCreateNewOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = db.patients.find(p => p.id === orderPatientId);
    if (!patient) return;

    const calculatedAge = patient.dateOfBirth 
      ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() 
      : 30;

    const newStudy: RadiologyStudy = {
      id: `RAD-${Date.now().toString().slice(-4)}`,
      accessionNumber: `RAD-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      patientId: patient.id,
      patientMrn: patient.mrn,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientAge: calculatedAge,
      patientGender: patient.gender === 'F' ? 'FEMALE' : patient.gender === 'M' ? 'MALE' : 'OTHER',
      modality: orderModality,
      studyDescription: orderStudyDesc || `${orderModality} Examination of ${orderBodyPart}`,
      bodyPart: orderBodyPart || 'Diagnostic Field',
      clinicalIndication: orderIndication || 'Clinical investigation',
      orderingPhysicianName: currentUser.fullName,
      status: 'SCHEDULED',
      urgency: orderUrgency,
      images: [],
      scheduledDate: new Date().toISOString().split('T')[0],
      releasedToPatientPortal: false,
    };

    const nextStudies = [newStudy, ...studies];
    setStudies(nextStudies);
    setSelectedStudyId(newStudy.id);
    updateDatabaseState({ radiologyStudies: nextStudies });

    logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'CREATE',
      module: 'RADIOLOGY',
      patientId: patient.id,
      patientMrn: patient.mrn,
      details: `Ordered radiology examination ${newStudy.accessionNumber} (${newStudy.modality}: ${newStudy.studyDescription}) for ${patient.firstName} ${patient.lastName}.`,
      ipAddress: 'Clinical Workstation EMR',
      status: 'SUCCESS',
    });

    setIsNewOrderModalOpen(false);
    setOrderStudyDesc('');
    setOrderBodyPart('');
    setOrderIndication('');
  };

  const currentImage = selectedStudy?.images?.[activeImageIndex];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-extrabold text-base tracking-tight flex items-center gap-2">
              <Scan className="w-5 h-5 text-teal-400" />
              Radiology & Diagnostic Imaging Workstation (PACS / DICOM)
            </span>
            <span className="text-[10px] bg-teal-950 text-teal-300 border border-teal-800 px-2 py-0.5 rounded font-mono">
              DIGITAL DIRECT EMR
            </span>
          </div>
          <p className="text-xs text-slate-400">
            J & J Memorial e-Hospital · Multi-Modality Imaging Archive, Radiologist Reporting & Diagnostic Viewer
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsNewOrderModalOpen(true)}
            className="bg-teal-700 hover:bg-teal-600 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Order Imaging Study</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Studies Queue (Left) & PACS Viewer / Reporting (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Worklist & Queue (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-700" />
                Radiology Worklist ({filteredStudies.length})
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search MRN, patient, study..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-1 focus:ring-teal-700"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {['ALL', 'X_RAY', 'ULTRASOUND', 'CT_SCAN', 'ECHOCARDIOGRAM'].map(m => (
                <button
                  key={m}
                  onClick={() => setModalityFilter(m)}
                  className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                    modalityFilter === m 
                      ? 'bg-teal-800 text-white font-semibold' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {m === 'ALL' ? 'All Modalities' : m.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Status Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg text-[11px] text-center font-medium">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'IMAGE_ACQUIRED', label: 'Scanned' },
                { id: 'RELEASED', label: 'Released' }
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setStatusFilter(s.id)}
                  className={`py-1 rounded cursor-pointer transition-colors ${
                    statusFilter === s.id ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Studies List */}
            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {filteredStudies.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No radiology studies matching filters.
                </div>
              ) : (
                filteredStudies.map(study => {
                  const isSelected = study.id === selectedStudyId;
                  const hasImages = study.images && study.images.length > 0;
                  return (
                    <div
                      key={study.id}
                      onClick={() => setSelectedStudyId(study.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-teal-50/60 border-teal-700 ring-1 ring-teal-700 shadow-xs' 
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1.5">
                        <span className="font-bold text-slate-900 truncate">
                          {study.patientName}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold font-mono uppercase ${
                          study.urgency === 'STAT_EMERGENCY'
                            ? 'bg-rose-100 text-rose-800 animate-pulse'
                            : study.urgency === 'URGENT'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {study.urgency.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="text-slate-600 font-medium text-[11px] truncate mb-2">
                        {study.studyDescription}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="text-slate-500 font-semibold">{study.patientMrn}</span>
                          <span>·</span>
                          <span className="text-teal-800 font-bold">{study.modality}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileImage className={`w-3.5 h-3.5 ${hasImages ? 'text-teal-700 font-bold' : 'text-slate-300'}`} />
                          <span className={hasImages ? 'text-teal-900 font-bold font-mono' : 'text-slate-400'}>
                            {study.images.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Diagnostic PACS Viewer & Reporting Console (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedStudy ? (
            <>
              {/* Study Header Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-base text-slate-900">
                        {selectedStudy.studyDescription}
                      </h4>
                      <span className="text-[10px] bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded font-semibold">
                        {selectedStudy.accessionNumber}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="font-semibold text-slate-800">{selectedStudy.patientName}</span>
                      <span>({selectedStudy.patientMrn})</span>
                      <span>·</span>
                      <span>Ordering MD: {selectedStudy.orderingPhysicianName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsUploadModalOpen(true)}
                      className="bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3 py-1.5 rounded-lg border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-teal-700" />
                      <span>Attach Imaging File</span>
                    </button>
                    {selectedStudy.releasedToPatientPortal ? (
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                        <Globe className="w-3 h-3 text-emerald-600" />
                        Portal Synced
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-1 rounded flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400" />
                        Internal Only
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Body Part</span>
                    <strong className="text-slate-800">{selectedStudy.bodyPart}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Clinical Indication</span>
                    <span className="text-slate-700 truncate block" title={selectedStudy.clinicalIndication}>
                      {selectedStudy.clinicalIndication}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Technologist</span>
                    <span className="text-slate-700">{selectedStudy.technologistName || 'Pending Tech'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Est. Radiation Dose</span>
                    <span className="text-slate-700 font-mono font-bold">
                      {selectedStudy.radiationDoseMgy ? `${selectedStudy.radiationDoseMgy} mGy` : 'Non-ionizing (0 mGy)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive PACS Image Viewer Canvas */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 text-white shadow-xl space-y-3">
                {/* Viewer Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 3))}
                      title="Zoom In"
                      className="p-1.5 hover:bg-slate-800 rounded transition-colors text-slate-300 hover:text-white cursor-pointer"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
                      title="Zoom Out"
                      className="p-1.5 hover:bg-slate-800 rounded transition-colors text-slate-300 hover:text-white cursor-pointer"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setRotationAngle(prev => (prev + 90) % 360)}
                      title="Rotate 90 Clockwise"
                      className="p-1.5 hover:bg-slate-800 rounded transition-colors text-slate-300 hover:text-white cursor-pointer"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsInverted(prev => !prev)}
                      title="Invert Grayscale / Negative"
                      className={`p-1.5 rounded transition-colors cursor-pointer ${
                        isInverted ? 'bg-teal-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Sliders className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setIsRulerActive(!isRulerActive);
                        if (!isRulerActive) {
                          setMeasurementDistance('48.5 mm (Fibular displacement)');
                        } else {
                          setMeasurementDistance(null);
                        }
                      }}
                      title="Digital Caliper / Measurement Ruler"
                      className={`p-1.5 rounded transition-colors cursor-pointer ${
                        isRulerActive ? 'bg-amber-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Ruler className="w-4 h-4" />
                    </button>
                    <button
                      onClick={resetViewerControls}
                      className="px-2 py-1 text-[10px] text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Brightness & Contrast Controls */}
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span>Brightness:</span>
                      <input
                        type="range"
                        min="50"
                        max="180"
                        value={brightness}
                        onChange={e => setBrightness(Number(e.target.value))}
                        className="w-16 accent-teal-400 cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>Contrast:</span>
                      <input
                        type="range"
                        min="50"
                        max="200"
                        value={contrast}
                        onChange={e => setContrast(Number(e.target.value))}
                        className="w-16 accent-teal-400 cursor-pointer"
                      />
                    </div>
                    {selectedStudy.images.length > 1 && (
                      <button
                        onClick={() => setIsComparingViews(!isComparingViews)}
                        className={`px-2 py-1 rounded text-[11px] font-semibold border transition-colors cursor-pointer ${
                          isComparingViews 
                            ? 'bg-teal-700 text-white border-teal-600' 
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {isComparingViews ? 'Single View' : 'Compare Views'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Viewport Canvas */}
                <div className="relative min-h-[380px] max-h-[460px] bg-black rounded-xl overflow-hidden flex items-center justify-center border border-slate-900 select-none">
                  {selectedStudy.images.length === 0 ? (
                    <div className="text-center p-8 space-y-3">
                      <Scan className="w-12 h-12 text-slate-700 mx-auto" />
                      <div>
                        <p className="text-sm font-semibold text-slate-300">No medical images attached yet</p>
                        <p className="text-xs text-slate-500">
                          Technologist: Attach DICOM / radiography scans to enable clinical viewing.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="bg-teal-700 hover:bg-teal-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        Upload Imaging Scan
                      </button>
                    </div>
                  ) : isComparingViews && selectedStudy.images.length >= 2 ? (
                    /* Side-by-Side Comparison Mode */
                    <div className="w-full h-full grid grid-cols-2 gap-2 p-2">
                      {selectedStudy.images.slice(0, 2).map((img, idx) => (
                        <div key={img.id} className="relative bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center border border-slate-800">
                          <img
                            src={img.url}
                            alt={img.caption}
                            style={{
                              transform: `rotate(${rotationAngle}deg) scale(${zoomLevel})`,
                              filter: `invert(${isInverted ? 1 : 0}) brightness(${brightness}%) contrast(${contrast}%)`,
                              transition: 'transform 0.15s ease-out'
                            }}
                            className="max-h-[320px] object-contain"
                          />
                          <div className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-mono text-teal-300 border border-slate-800">
                            View {idx + 1}: {img.viewType} ({img.caption})
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Single View Mode with Ruler & HUD */
                    <div className="relative w-full h-full flex items-center justify-center p-4">
                      {currentImage && (
                        <img
                          src={currentImage.url}
                          alt={currentImage.caption}
                          style={{
                            transform: `rotate(${rotationAngle}deg) scale(${zoomLevel})`,
                            filter: `invert(${isInverted ? 1 : 0}) brightness(${brightness}%) contrast(${contrast}%)`,
                            transition: 'transform 0.15s ease-out'
                          }}
                          className="max-h-[360px] object-contain drop-shadow-2xl"
                        />
                      )}

                      {/* DICOM PACS HUD Overlay */}
                      <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs p-2 rounded text-[10px] font-mono text-slate-300 border border-slate-800/80 space-y-0.5">
                        <div className="text-teal-400 font-bold">{selectedStudy.patientName}</div>
                        <div>MRN: {selectedStudy.patientMrn}</div>
                        <div>MODALITY: {selectedStudy.modality}</div>
                        <div>VIEW: {currentImage?.viewType}</div>
                      </div>

                      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-xs p-2 rounded text-[10px] font-mono text-right text-slate-300 border border-slate-800/80 space-y-0.5">
                        <div className="text-slate-100 font-bold">{selectedStudy.accessionNumber}</div>
                        <div>ZOOM: {Math.round(zoomLevel * 100)}%</div>
                        <div>ROT: {rotationAngle}°</div>
                        <div>INVERT: {isInverted ? 'YES' : 'NO'}</div>
                      </div>

                      {/* Caliper / Ruler Overlay */}
                      {isRulerActive && measurementDistance && (
                        <div className="absolute bottom-6 bg-amber-950/90 text-amber-200 border border-amber-600 px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 shadow-lg animate-pulse">
                          <Ruler className="w-4 h-4 text-amber-400" />
                          <span>Digital Caliper: {measurementDistance}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Series Thumbnail Strip */}
                {selectedStudy.images.length > 0 && (
                  <div className="flex items-center gap-3 overflow-x-auto pt-2 border-t border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">
                      Series Views ({selectedStudy.images.length}):
                    </span>
                    {selectedStudy.images.map((img, idx) => (
                      <button
                        key={img.id}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative rounded-lg overflow-hidden border shrink-0 transition-all cursor-pointer ${
                          activeImageIndex === idx 
                            ? 'border-teal-400 ring-2 ring-teal-400/50 shadow-md' 
                            : 'border-slate-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img.url} alt={img.caption} className="w-14 h-14 object-cover bg-black" />
                        <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[9px] font-mono text-center text-teal-300 py-0.5">
                          {img.viewType}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Radiologist Clinical Report & Verification Section */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-700" />
                    <h5 className="font-extrabold text-sm text-slate-900">
                      Radiology Report & Diagnostic Impression
                    </h5>
                  </div>
                  {selectedStudy.status === 'RELEASED' && (
                    <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Signed & Released by {selectedStudy.radiologistName || 'Radiologist'}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Detailed Radiographic Findings:
                    </label>
                    <textarea
                      rows={3}
                      value={editFindings}
                      onChange={e => setEditFindings(e.target.value)}
                      placeholder="Describe parenchymal fields, bone cortex alignment, organ contours, soft tissues..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-teal-700 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Diagnostic Impression (Final Conclusion):
                    </label>
                    <textarea
                      rows={2}
                      value={editImpression}
                      onChange={e => setEditImpression(e.target.value)}
                      placeholder="Summary conclusion for attending physician..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-teal-700"
                    />
                  </div>
                </div>

                {/* Sign-off Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500">
                    Signing Radiologist: <strong className="text-slate-800">{currentUser.fullName}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSignReport(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      Sign Report (Internal EMR Only)
                    </button>
                    <button
                      onClick={() => handleSignReport(true)}
                      className="bg-teal-700 hover:bg-teal-600 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Sign & Release to Patient Portal</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
              Select a radiology study from the queue to review or attach images.
            </div>
          )}
        </div>
      </div>

      {/* Modal 1: Attach Imaging File */}
      {isUploadModalOpen && selectedStudy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <FileImage className="w-4 h-4 text-teal-700" />
                Attach Medical Imaging Scan to {selectedStudy.patientMrn}
              </h4>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAttachImageSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Select Anatomical View:
                </label>
                <select
                  value={uploadViewType}
                  onChange={e => setUploadViewType(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                  <option value="PA">PA (Posteroanterior)</option>
                  <option value="AP">AP (Anteroposterior)</option>
                  <option value="LATERAL">Lateral</option>
                  <option value="AXIAL">Axial (CT/MRI slice)</option>
                  <option value="TRANSVERSE">Transverse (Ultrasound)</option>
                  <option value="SAGITTAL">Sagittal</option>
                  <option value="CORONAL">Coronal</option>
                  <option value="OBLIQUE">Oblique</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  View Caption / Annotation:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Standing upright chest PA view"
                  value={uploadCaption}
                  onChange={e => setUploadCaption(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              {/* File Dropzone */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Upload Image File (DICOM / JPEG / PNG / SVG):
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-teal-600 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 text-teal-700 mx-auto mb-2" />
                  <p className="text-slate-700 font-bold">Click to browse or drop imaging file</p>
                  <p className="text-[11px] text-slate-400 mt-1">Supports PACS exports, radiography scans, ultrasound captures</p>
                </div>
              </div>

              {/* Quick Sample Presets (For instant clinical testing) */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                  Or load standard hospital calibration scan:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadFilePreview(selectedStudy.images[0]?.url || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="%23050810"/><text x="20" y="150" fill="%23cbd5e1" font-family="monospace">CALIBRATED CLINICAL X-RAY</text></svg>');
                      setUploadFileName('Chest_AP_Calibration.dcm');
                      setUploadFileSizeKb(1280);
                      setUploadCaption('Standing AP View Calibration');
                    }}
                    className="bg-white hover:bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200 text-[11px] font-medium cursor-pointer"
                  >
                    Chest AP Radiograph
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadFilePreview('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="%23050810"/><circle cx="150" cy="150" r="100" fill="%231e293b" stroke="%2338bdf8" stroke-width="2"/><text x="40" y="150" fill="%2338bdf8" font-family="monospace">SONOGRAPHY CALIBRATION</text></svg>');
                      setUploadFileName('Sonogram_Pelvis.png');
                      setUploadFileSizeKb(980);
                      setUploadCaption('Transverse Sonography');
                    }}
                    className="bg-white hover:bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200 text-[11px] font-medium cursor-pointer"
                  >
                    Ultrasound Sonogram
                  </button>
                </div>
              </div>

              {/* Preview Thumbnail */}
              {uploadFilePreview && (
                <div className="flex items-center gap-3 p-2 bg-teal-50 rounded-lg border border-teal-200">
                  <img src={uploadFilePreview} alt="Preview" className="w-12 h-12 object-cover rounded bg-black" />
                  <div className="text-[11px]">
                    <strong className="text-teal-900 block truncate">{uploadFileName}</strong>
                    <span className="text-teal-700">{uploadFileSizeKb} KB · Ready to link</span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadFilePreview}
                  className="px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white font-semibold flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Attach to Patient Chart</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Order / Schedule Imaging Study */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-teal-700" />
                Schedule Diagnostic Imaging Study
              </h4>
              <button 
                onClick={() => setIsNewOrderModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewOrder} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Select Patient:
                </label>
                <select
                  value={orderPatientId}
                  onChange={e => setOrderPatientId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                  {db.patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} ({p.mrn}) · {p.gender}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Modality:
                  </label>
                  <select
                    value={orderModality}
                    onChange={e => setOrderModality(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                  >
                    <option value="X_RAY">X-Ray (Digital Radiography)</option>
                    <option value="ULTRASOUND">Ultrasound Sonography</option>
                    <option value="CT_SCAN">Computed Tomography (CT)</option>
                    <option value="MRI">Magnetic Resonance Imaging</option>
                    <option value="ECHOCARDIOGRAM">Echocardiogram</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Urgency Priority:
                  </label>
                  <select
                    value={orderUrgency}
                    onChange={e => setOrderUrgency(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                  >
                    <option value="ROUTINE">Routine (Outpatient)</option>
                    <option value="URGENT">Urgent (Within 4 hrs)</option>
                    <option value="STAT_EMERGENCY">STAT Emergency (Immediate)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Body Part / Anatomical Region:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chest, Pelvis, Right Knee, Brain"
                  value={orderBodyPart}
                  onChange={e => setOrderBodyPart(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Study Description:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chest PA and Lateral 2 Views"
                  value={orderStudyDesc}
                  onChange={e => setOrderStudyDesc(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Clinical Indication / Reason:
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Clinical history, signs and symptoms, diagnosis to rule in/out..."
                  value={orderIndication}
                  onChange={e => setOrderIndication(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-600 text-white font-semibold"
                >
                  Create & Schedule Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
