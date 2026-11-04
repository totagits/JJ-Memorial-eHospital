import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  MessageSquare, 
  PhoneOff, 
  Mic, 
  MicOff, 
  VideoOff, 
  Send, 
  Clock, 
  User, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Paperclip, 
  Maximize2, 
  Minimize2,
  Stethoscope,
  Activity,
  FileText,
  Printer,
  ChevronRight,
  Sparkles,
  Wifi
} from 'lucide-react';
import { getDatabaseState, updateDatabaseState, logAuditEvent } from '../../services/storageService';
import { Patient } from '../../types/patient';
import { TelehealthSession, TelehealthMessage } from '../../types/telehealth';

interface TelehealthViewProps {
  currentPatient: Patient;
}

export const TelehealthView: React.FC<TelehealthViewProps> = ({ currentPatient }) => {
  const db = getDatabaseState();
  const [activeSession, setActiveSession] = useState<TelehealthSession | null>(null);
  const [showNewConsultModal, setShowNewConsultModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'video' | 'chat'>('video');

  // Video call controls
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showInCallChat, setShowInCallChat] = useState(true);

  // In-call / chat message input
  const [inputMessage, setInputMessage] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // New consultation form state
  const [consultMode, setConsultMode] = useState<'VIDEO' | 'CHAT'>('VIDEO');
  const [selectedClinicianId, setSelectedClinicianId] = useState('USR-002');
  const [department, setDepartment] = useState('General Medicine & Acute Care');
  const [chiefComplaint, setChiefComplaint] = useState('');

  // Active call duration timer
  useEffect(() => {
    let timer: any = null;
    if (activeSession && activeSession.status === 'IN_PROGRESS') {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [activeSession?.status]);

  // Scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, showInCallChat]);

  // Format seconds to MM:SS
  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const patientSessions = (db.telehealthSessions || []).filter(
    s => s.patientId === currentPatient.id || s.patientMrn === currentPatient.mrn
  );

  const availableClinicians = [
    {
      id: 'USR-002',
      name: 'Dr. Evelyn Sirleaf-Gbotoe, MD',
      role: 'Attending Physician (OPD Lead)',
      dept: 'Internal Medicine & Acute Care',
      license: 'LMDC-MD-2410',
      status: 'AVAILABLE_NOW',
    },
    {
      id: 'USR-001',
      name: 'Dr. J. Saydee Kollie, MD, FWACP',
      role: 'Medical Director & Chief Internist',
      dept: 'Cardiology & Chronic Disease',
      license: 'LMDC-MD-1892',
      status: 'AVAILABLE_NOW',
    },
    {
      id: 'USR-004',
      name: 'Samuel Flomo, RN',
      role: 'Acute Triage Nurse',
      dept: 'Urgent Care & Triage Intake',
      license: 'LBNM-RN-5891',
      status: 'AVAILABLE_NOW',
    }
  ];

  const handleStartConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chiefComplaint.trim()) {
      alert('Please state your primary symptom or reason for this virtual consultation.');
      return;
    }

    const clinician = availableClinicians.find(c => c.id === selectedClinicianId) || availableClinicians[0];
    const sessionId = `TEL-2026-${String(patientSessions.length + 42).padStart(4, '0')}`;

    const newSession: TelehealthSession = {
      id: sessionId,
      patientId: currentPatient.id,
      patientName: `${currentPatient.firstName} ${currentPatient.lastName}`,
      patientMrn: currentPatient.mrn,
      clinicianId: clinician.id,
      clinicianName: clinician.name,
      clinicianRole: clinician.role,
      department,
      mode: consultMode,
      status: 'IN_PROGRESS',
      startedAt: new Date().toISOString(),
      durationSeconds: 0,
      chiefComplaint: chiefComplaint.trim(),
      messages: [
        {
          id: `MSG-${Date.now()}-1`,
          sender: 'CLINICIAN',
          senderName: clinician.name,
          text: `Hello ${currentPatient.firstName}, I am ${clinician.name}. I have reviewed your clinical summary and chief symptoms: "${chiefComplaint.trim()}". How can I assist you right now?`,
          timestamp: new Date().toISOString(),
        }
      ]
    };

    updateDatabaseState(draft => {
      if (!draft.telehealthSessions) draft.telehealthSessions = [];
      draft.telehealthSessions.unshift(newSession);
    });

    logAuditEvent({
      userId: currentPatient.id,
      userName: `${currentPatient.firstName} ${currentPatient.lastName}`,
      userRole: 'patient',
      action: 'CREATE',
      module: 'OPD',
      patientId: currentPatient.id,
      patientMrn: currentPatient.mrn,
      resourceId: sessionId,
      details: `Initiated ${consultMode} Telehealth Consultation (${sessionId}) with ${clinician.name}.`,
      ipAddress: 'Patient Telehealth Portal WebRTC Client',
      status: 'SUCCESS',
    });

    setActiveSession(newSession);
    setActiveTab(consultMode === 'VIDEO' ? 'video' : 'chat');
    setShowNewConsultModal(false);
    setChiefComplaint('');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeSession) return;

    const patientMsg: TelehealthMessage = {
      id: `MSG-${Date.now()}-P`,
      sender: 'PATIENT',
      senderName: `${currentPatient.firstName} ${currentPatient.lastName}`,
      text: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    const currentText = inputMessage.trim();
    setInputMessage('');

    // Update in database state
    updateDatabaseState(draft => {
      const sess = draft.telehealthSessions.find(s => s.id === activeSession.id);
      if (sess) {
        sess.messages.push(patientMsg);
      }
    });

    // Update local state
    setActiveSession(prev => prev ? {
      ...prev,
      messages: [...prev.messages, patientMsg]
    } : null);

    // Simulate realistic clinical reply from doctor after brief delay
    setTimeout(() => {
      let replyText = `I understand. I am noting down your symptoms regarding "${currentText}". Let's evaluate your vital parameters. Are you currently experiencing any fever, shortness of breath, or dizziness?`;
      
      if (currentText.toLowerCase().includes('fever') || currentText.toLowerCase().includes('hot')) {
        replyText = `Understood. Given the endemicity of malaria in Monrovia, if temperature exceeds 38°C with rigors, please visit our outpatient clinic at VOA East Community for an immediate Malaria RDT & full blood count. You may take Paracetamol 1g every 8 hours for pain relief in the interim.`;
      } else if (currentText.toLowerCase().includes('headache') || currentText.toLowerCase().includes('pressure')) {
        replyText = `Thank you for sharing. Have you checked your blood pressure today? Please maintain adequate hydration, avoid salty foods, and take your prescribed antihypertensives as scheduled.`;
      } else if (currentText.toLowerCase().includes('prescription') || currentText.toLowerCase().includes('medication')) {
        replyText = `I have verified your medication history in the J & J Memorial EMR. Your prescription renewal has been flagged for electronic confirmation at our 24/7 central pharmacy.`;
      }

      const docMsg: TelehealthMessage = {
        id: `MSG-${Date.now()}-D`,
        sender: 'CLINICIAN',
        senderName: activeSession.clinicianName,
        text: replyText,
        timestamp: new Date().toISOString(),
      };

      updateDatabaseState(draft => {
        const sess = draft.telehealthSessions.find(s => s.id === activeSession.id);
        if (sess) {
          sess.messages.push(docMsg);
        }
      });

      setActiveSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, docMsg]
      } : null);
    }, 1200);
  };

  const handleEndConsultation = () => {
    if (!activeSession) return;
    if (!confirm('Are you sure you want to conclude this virtual clinical consultation? A summary note will be saved to your patient chart.')) return;

    const endedAt = new Date().toISOString();
    const docNotes = `Telehealth encounter successfully completed. Patient counseled on chief complaint: "${activeSession.chiefComplaint}". Patient reported stable condition during video assessment. Prescriptions reconciled.`;
    const recommendations = `Maintain oral hydration and rest. Report immediately to VOA East Community Emergency Room if symptoms worsen.`;

    updateDatabaseState(draft => {
      const sess = draft.telehealthSessions.find(s => s.id === activeSession.id);
      if (sess) {
        sess.status = 'COMPLETED';
        sess.endedAt = endedAt;
        sess.durationSeconds = callDuration || 600;
        sess.doctorNotes = docNotes;
        sess.recommendations = recommendations;
      }
    });

    logAuditEvent({
      userId: currentPatient.id,
      userName: `${currentPatient.firstName} ${currentPatient.lastName}`,
      userRole: 'patient',
      action: 'UPDATE',
      module: 'OPD',
      patientId: currentPatient.id,
      patientMrn: currentPatient.mrn,
      resourceId: activeSession.id,
      details: `Concluded Telehealth Consultation (${activeSession.id}) after ${formatDuration(callDuration)}. Care notes appended to chart.`,
      ipAddress: 'Patient WebRTC Client',
      status: 'SUCCESS',
    });

    setActiveSession(prev => prev ? {
      ...prev,
      status: 'COMPLETED',
      endedAt,
      durationSeconds: callDuration,
      doctorNotes: docNotes,
      recommendations
    } : null);
  };

  return (
    <div className="space-y-6">
      {/* Telehealth Top Overview Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-teal-800/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-tight">J & J Virtual Care & Telehealth Portal</span>
            <span className="text-[10px] bg-teal-950 text-teal-300 border border-teal-800 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              CLINICIANS ON-DUTY
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            Initiate encrypted high-definition video consultations or secure clinical messaging with our attending physicians at VOA East Community from the comfort of your home.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {!activeSession ? (
            <button
              onClick={() => setShowNewConsultModal(true)}
              className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>Start Virtual Consultation</span>
            </button>
          ) : (
            <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Active Session: {activeSession.id}
            </span>
          )}
        </div>
      </div>

      {/* Active Consultation Interface */}
      {activeSession && activeSession.status === 'IN_PROGRESS' ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl space-y-0">
          {/* Virtual Call Header Bar */}
          <div className="bg-slate-900 text-white px-6 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-800 text-white flex items-center justify-center font-bold text-sm">
                <Stethoscope className="w-4 h-4 text-teal-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{activeSession.clinicianName}</span>
                  <span className="font-mono text-[10px] text-teal-300 bg-teal-950 px-1.5 py-0.5 rounded border border-teal-800">
                    Session {activeSession.id}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{activeSession.clinicianRole} · {activeSession.department}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>{formatDuration(callDuration)}</span>
              </div>

              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
                <button
                  onClick={() => setActiveTab('video')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'video' ? 'bg-teal-700 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Video Call
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'chat' ? 'bg-teal-700 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Clinical Chat ({activeSession.messages.length})
                </button>
              </div>

              <button
                onClick={handleEndConsultation}
                className="bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>End Call</span>
              </button>
            </div>
          </div>

          {/* Main Virtual Room Viewport */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
            {/* Video Viewport (8 cols) or full if chat hidden */}
            <div className={`${showInCallChat ? 'lg:col-span-8' : 'lg:col-span-12'} bg-slate-950 relative flex flex-col justify-between p-4 min-h-[460px]`}>
              {/* Doctor Video Tile (Simulated WebRTC Video Stream) */}
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-950 opacity-90" />
                
                {/* Doctor Visual Avatar Tile */}
                <div className="relative text-center space-y-4 p-6 z-10 max-w-sm">
                  <div className="relative inline-block">
                    <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-teal-800 to-slate-800 border-4 border-teal-500/80 flex items-center justify-center mx-auto shadow-2xl">
                      <Stethoscope className="w-16 h-16 sm:w-20 sm:h-20 text-teal-200" />
                    </div>
                    <span className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
                      <Wifi className="w-3 h-3 text-white" />
                    </span>
                  </div>

                  <div>
                    <h3 className="text-white font-bold text-lg">{activeSession.clinicianName}</h3>
                    <p className="text-xs text-teal-300 font-medium">Attending Physician · VOA East Community Clinic</p>
                    <p className="text-[11px] text-slate-400 mt-1">Live Audio / Video Stream Connected (1080p WebRTC Encrypted)</p>
                  </div>

                  {/* Audio Frequency Simulation */}
                  <div className="flex items-center justify-center gap-1.5 pt-1">
                    <span className="w-1 h-3 bg-teal-400 rounded-full animate-pulse" />
                    <span className="w-1 h-6 bg-teal-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1 h-4 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                    <span className="w-1 h-7 bg-teal-200 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                    <span className="w-1 h-3 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              </div>

              {/* Top Video Overlay Tags */}
              <div className="relative z-20 flex items-center justify-between text-xs text-white">
                <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-slate-200">End-to-End Encrypted Telehealth Session</span>
                </div>
                <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-700/80 font-mono text-[11px] text-teal-300">
                  HD 1080p · 60fps
                </div>
              </div>

              {/* Bottom Patient PiP Tile & Video Toolbar */}
              <div className="relative z-20 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
                {/* Local Patient Camera Preview PiP */}
                <div className="w-36 h-24 sm:w-44 sm:h-28 bg-slate-900 rounded-xl border-2 border-teal-500/70 shadow-lg overflow-hidden relative flex items-center justify-center">
                  {!isVideoDisabled ? (
                    <div className="text-center p-2">
                      <div className="w-8 h-8 rounded-full bg-teal-800 text-white flex items-center justify-center mx-auto mb-1 font-bold text-xs">
                        {currentPatient.firstName[0]}
                      </div>
                      <span className="text-[10px] text-slate-200 font-medium block">You ({currentPatient.firstName})</span>
                      <span className="text-[9px] text-emerald-400 block font-mono">Camera Active</span>
                    </div>
                  ) : (
                    <div className="text-center p-2 text-slate-400 text-[10px]">
                      <VideoOff className="w-5 h-5 mx-auto mb-1 text-slate-500" />
                      <span>Camera Paused</span>
                    </div>
                  )}
                  {isMicMuted && (
                    <span className="absolute top-1.5 right-1.5 p-1 bg-rose-900/90 rounded text-rose-300">
                      <MicOff className="w-3 h-3" />
                    </span>
                  )}
                </div>

                {/* In-Call Media Buttons */}
                <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-700 shadow-xl">
                  <button
                    onClick={() => setIsMicMuted(!isMicMuted)}
                    className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isMicMuted ? 'bg-rose-900 text-rose-200' : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                    title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                  >
                    {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-teal-400" />}
                  </button>

                  <button
                    onClick={() => setIsVideoDisabled(!isVideoDisabled)}
                    className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isVideoDisabled ? 'bg-rose-900 text-rose-200' : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                    title={isVideoDisabled ? 'Turn Camera On' : 'Turn Camera Off'}
                  >
                    {isVideoDisabled ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4 text-teal-400" />}
                  </button>

                  <button
                    onClick={() => setShowInCallChat(!showInCallChat)}
                    className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors cursor-pointer relative"
                    title="Toggle In-Call Chat Drawer"
                  >
                    <MessageSquare className="w-4 h-4 text-teal-400" />
                    {activeSession.messages.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-teal-500 text-[9px] font-bold text-slate-950 flex items-center justify-center">
                        {activeSession.messages.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={handleEndConsultation}
                    className="bg-rose-700 hover:bg-rose-600 text-white px-4 py-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span className="hidden sm:inline">Leave Room</span>
                  </button>
                </div>
              </div>
            </div>

            {/* In-Call Chat Drawer (4 cols) */}
            {showInCallChat && (
              <div className="lg:col-span-4 border-l border-slate-200 flex flex-col justify-between bg-slate-50 min-h-[460px]">
                {/* Chat Drawer Header */}
                <div className="p-3.5 border-b border-slate-200 bg-white flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Live Clinical Consultation Thread</h4>
                    <p className="text-[10px] text-slate-500">Documented in encounter timeline</p>
                  </div>
                  <span className="text-[10px] text-teal-800 font-mono font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Active
                  </span>
                </div>

                {/* Messages Feed */}
                <div className="p-4 flex-1 overflow-y-auto space-y-3 max-h-[360px]">
                  {activeSession.messages.map(msg => {
                    const isMe = msg.sender === 'PATIENT';
                    return (
                      <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <span className="text-[10px] text-slate-400 mb-0.5">
                          {msg.senderName} · {msg.timestamp.split('T')[1].slice(0, 5)}
                        </span>
                        <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                          isMe
                            ? 'bg-teal-800 text-white rounded-br-xs'
                            : 'bg-white text-slate-900 border border-slate-200 shadow-xs rounded-bl-xs'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatBottomRef} />
                </div>

                {/* Quick Symptoms Kicker */}
                <div className="px-3 py-2 bg-slate-100 border-t border-slate-200 flex gap-1.5 overflow-x-auto text-[11px]">
                  {['Fever spikes', 'Severe headache', 'Nausea/vomiting', 'Prescription check'].map((symptom, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setInputMessage(symptom)}
                      className="bg-white hover:bg-slate-200 text-slate-700 px-2 py-1 rounded text-[10px] border border-slate-200 shrink-0 cursor-pointer transition-colors"
                    >
                      +{symptom}
                    </button>
                  ))}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    placeholder="Type symptom or response to doctor..."
                    className="flex-1 text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    className="bg-teal-800 hover:bg-teal-900 text-white p-2.5 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Transmit Message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      ) : activeSession && activeSession.status === 'COMPLETED' ? (
        /* Completed Consultation Summary Card */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Virtual Consultation Completed</h3>
                <p className="text-xs text-slate-500">Official encounter note compiled and appended to your permanent chart</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Telehealth Note</span>
              </button>
              <button
                onClick={() => setActiveSession(null)}
                className="bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 text-sm block">Telehealth Session Specifications</span>
              <div className="space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Consultation Token:</span>
                  <span className="font-mono font-bold text-teal-800">{activeSession.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Attending Clinician:</span>
                  <span className="font-semibold text-slate-900">{activeSession.clinicianName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Call Duration:</span>
                  <span className="font-mono">{formatDuration(activeSession.durationSeconds)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Chief Symptoms:</span>
                  <span className="text-slate-900">{activeSession.chiefComplaint}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 text-sm block">Physician Clinical Assessment & Orders</span>
              <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                {activeSession.doctorNotes}
              </p>
              <p className="text-teal-900 font-semibold bg-teal-50 p-2 rounded border border-teal-200">
                Next Steps: {activeSession.recommendations}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Historical Telehealth Sessions List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Telehealth Consultation History</h3>
            <p className="text-xs text-slate-500">Archived virtual care sessions, doctor notes, and chat transcripts</p>
          </div>
          <span className="text-xs text-slate-500 font-medium">{patientSessions.length} sessions recorded</span>
        </div>

        {patientSessions.length > 0 ? (
          <div className="space-y-3">
            {patientSessions.map(session => (
              <div
                key={session.id}
                className="border border-slate-200 rounded-xl p-4 bg-white hover:border-teal-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 text-sm">{session.department}</span>
                    <span className="font-mono text-xs text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {session.id}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      {session.mode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Clinician: <span className="font-semibold text-slate-800">{session.clinicianName}</span> ({session.clinicianRole})
                  </p>
                  <p className="text-xs text-slate-500">
                    Chief Complaint: <span className="text-slate-700">{session.chiefComplaint}</span>
                  </p>
                  {session.doctorNotes && (
                    <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-200/60 mt-1">
                      Doctor Note: {session.doctorNotes}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0 space-y-2">
                  <div className="text-xs font-semibold text-slate-900">
                    {session.startedAt.split('T')[0]}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    Duration: {formatDuration(session.durationSeconds)}
                  </div>
                  <button
                    onClick={() => setActiveSession(session)}
                    className="text-xs text-teal-800 font-semibold hover:underline block ml-auto cursor-pointer"
                  >
                    View Conversation & Notes →
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-xs text-slate-500 space-y-2">
            <Video className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p>No previous telehealth consultations found for this account.</p>
            <p className="text-slate-400">Click &quot;Start Virtual Consultation&quot; above to connect with an on-duty clinician.</p>
          </div>
        )}
      </div>

      {/* New Consultation Initiation Modal */}
      {showNewConsultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-teal-400" />
                <div>
                  <h3 className="font-bold text-sm">Initiate Virtual Telehealth Consultation</h3>
                  <p className="text-[11px] text-slate-400">J & J Memorial Ambulatory Virtual Care Network</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewConsultModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStartConsultation} className="p-6 space-y-4">
              {/* Consultation Mode Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Consultation Channel Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setConsultMode('VIDEO')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      consultMode === 'VIDEO'
                        ? 'border-teal-600 bg-teal-50/70 text-teal-950 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Video className="w-5 h-5 text-teal-700 mb-1" />
                    <span className="font-bold text-xs block">Video Consultation</span>
                    <span className="text-[10px] text-slate-500">Live camera & two-way audio room</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsultMode('CHAT')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      consultMode === 'CHAT'
                        ? 'border-teal-600 bg-teal-50/70 text-teal-950 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <MessageSquare className="w-5 h-5 text-teal-700 mb-1" />
                    <span className="font-bold text-xs block">Secure Clinical Chat</span>
                    <span className="text-[10px] text-slate-500">Text-based triage & symptoms review</span>
                  </button>
                </div>
              </div>

              {/* On-Duty Provider Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Available On-Duty Clinician</label>
                <select
                  value={selectedClinicianId}
                  onChange={e => setSelectedClinicianId(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:border-teal-600 focus:outline-hidden"
                >
                  {availableClinicians.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} — {doc.role} ({doc.dept})
                    </option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Department / Focus</label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:border-teal-600 focus:outline-hidden"
                >
                  <option value="General Medicine & Acute Care">General Medicine & Acute Care</option>
                  <option value="Infectious Diseases & Malaria Evaluation">Infectious Diseases & Malaria Evaluation</option>
                  <option value="Pediatrics & Child Wellness">Pediatrics & Child Wellness</option>
                  <option value="Maternal, Antenatal & Postnatal Advice">Maternal, Antenatal & Postnatal Advice</option>
                  <option value="Prescription Refill & Medication Counseling">Prescription Refill & Medication Counseling</option>
                </select>
              </div>

              {/* Chief Complaint */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Symptoms / Reason for Virtual Visit *
                </label>
                <textarea
                  required
                  rows={3}
                  value={chiefComplaint}
                  onChange={e => setChiefComplaint(e.target.value)}
                  placeholder="e.g. Mild residual fatigue after malaria medication, no fever recurrence..."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewConsultModal(false)}
                  className="text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Connect to Consultation Room</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
