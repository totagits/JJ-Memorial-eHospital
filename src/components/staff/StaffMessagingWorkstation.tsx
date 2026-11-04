import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  AlertTriangle, 
  Users, 
  Hash, 
  Lock, 
  Search, 
  Bell, 
  BellOff, 
  Paperclip, 
  CheckCheck, 
  Clock, 
  Stethoscope, 
  User, 
  Zap,
  ShieldCheck,
  Building2,
  Droplet,
  Baby,
  Microscope,
  Pill,
  ExternalLink
} from 'lucide-react';
import { UserAccount } from '../../types/auth';
import { StaffMessage, StaffChannel, StaffMessageUrgency } from '../../types/communication';
import { INITIAL_STAFF_CHANNELS } from '../../data/additionalSeedData';
import { getDatabaseState, sendStaffMessage, markStaffMessageRead, logAuditEvent } from '../../services/storageService';

interface StaffMessagingWorkstationProps {
  currentUser: UserAccount;
}

export const StaffMessagingWorkstation: React.FC<StaffMessagingWorkstationProps> = ({ currentUser }) => {
  const db = getDatabaseState();
  const messages = db.staffMessages || [];
  const channels = INITIAL_STAFF_CHANNELS;

  // Active channel or direct conversation
  const [activeChannelId, setActiveChannelId] = useState<string>('dept-emergency');
  const [activeTab, setActiveTab] = useState<'CHANNELS' | 'DIRECT'>('CHANNELS');
  const [searchFilter, setSearchFilter] = useState('');
  
  // Composer state
  const [inputText, setInputText] = useState('');
  const [messageUrgency, setMessageUrgency] = useState<StaffMessageUrgency>('ROUTINE');
  const [selectedPatientMrn, setSelectedPatientMrn] = useState<string>('');
  
  // Browser notifications permission status
  const [browserNotificationAllowed, setBrowserNotificationAllowed] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check browser notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setBrowserNotificationAllowed(Notification.permission === 'granted');
    }
  }, []);

  const requestBrowserNotification = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setBrowserNotificationAllowed(permission === 'granted');
        if (permission === 'granted') {
          new Notification('J & J Memorial Staff Comms', {
            body: 'Browser alerts activated for STAT emergency hospital broadcasts.',
            icon: '/favicon.ico'
          });
        }
      } catch (err) {
        console.warn('Notification permission error', err);
      }
    }
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannelId]);

  // Direct message threads available from staff accounts
  const otherStaff = db.users.filter(u => u.id !== currentUser.id);

  // Active conversation metadata
  const activeChannel = channels.find(c => c.id === activeChannelId);
  const activeDirectUser = otherStaff.find(u => `dm-${[currentUser.id, u.id].sort().join('-')}` === activeChannelId);

  // Filter messages for current thread
  const currentMessages = messages.filter(m => m.channelId === activeChannelId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    let targetPatientName = '';
    if (selectedPatientMrn) {
      const p = db.patients.find(pt => pt.mrn === selectedPatientMrn);
      if (p) targetPatientName = `${p.firstName} ${p.lastName}`;
    }

    const newMsg = sendStaffMessage({
      channelId: activeChannelId,
      channelType: activeTab === 'CHANNELS' ? 'DEPARTMENT' : 'DIRECT',
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderRole: currentUser.role,
      senderDepartment: currentUser.department,
      recipientId: activeDirectUser?.id,
      recipientName: activeDirectUser?.fullName,
      content: inputText.trim(),
      urgency: messageUrgency,
      patientMrnContext: selectedPatientMrn || undefined,
      patientNameContext: targetPatientName || undefined
    });

    // If STAT urgency, fire audit log
    if (messageUrgency === 'STAT') {
      logAuditEvent({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        action: 'CREATE',
        module: 'SECURITY',
        details: `STAT Clinical Emergency Broadcast dispatched by ${currentUser.fullName} in ${activeChannel?.name || 'Direct Channel'}: "${inputText.slice(0, 60)}..."`,
        ipAddress: '10.0.4.88',
        status: 'FLAGGED'
      });

      // Browser notification if supported
      if (browserNotificationAllowed && 'Notification' in window) {
        new Notification(`STAT ALERT: ${currentUser.fullName}`, {
          body: inputText.trim(),
        });
      }
    }

    setInputText('');
    setMessageUrgency('ROUTINE');
    setSelectedPatientMrn('');
  };

  const getChannelIcon = (iconName: string) => {
    switch (iconName) {
      case 'AlertTriangle': return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'Stethoscope': return <Stethoscope className="w-4 h-4 text-teal-400" />;
      case 'Baby': return <Baby className="w-4 h-4 text-pink-400" />;
      case 'Microscope': return <Microscope className="w-4 h-4 text-amber-400" />;
      case 'Droplet': return <Droplet className="w-4 h-4 text-red-400" />;
      case 'Pill': return <Pill className="w-4 h-4 text-indigo-400" />;
      default: return <Building2 className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[750px]">
      {/* Top Bar */}
      <div className="bg-slate-900 text-white p-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-800 flex items-center justify-center text-teal-200 shadow-xs">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm tracking-tight text-white">
                Intra-Departmental Secure Staff Messaging
              </h2>
              <span className="text-[10px] bg-teal-950 text-teal-300 border border-teal-800 px-2 py-0.5 rounded font-mono font-bold">
                ENCRYPTED EMR CHANNEL
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Real-time clinical coordination, STAT emergency broadcasts, and shift handover
            </p>
          </div>
        </div>

        {/* Browser Alert Trigger */}
        <div className="flex items-center gap-2">
          {browserNotificationAllowed ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded-lg font-medium">
              <Bell className="w-3.5 h-3.5" />
              <span>STAT Alerts Enabled</span>
            </span>
          ) : (
            <button
              onClick={requestBrowserNotification}
              className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-white bg-amber-950/80 border border-amber-700 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Enable Browser STAT Alerts</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Split Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Channels & Staff Directory (w-64 sm:w-72) */}
        <div className="w-64 sm:w-72 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
          {/* Channel / DM Tab Switcher */}
          <div className="p-3 border-b border-slate-200 flex gap-1">
            <button
              onClick={() => setActiveTab('CHANNELS')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'CHANNELS' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-500 hover:bg-slate-200'
              }`}
            >
              Department Hubs
            </button>
            <button
              onClick={() => setActiveTab('DIRECT')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'DIRECT' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-500 hover:bg-slate-200'
              }`}
            >
              Direct Staff (DMs)
            </button>
          </div>

          {/* Search Box */}
          <div className="p-2 border-b border-slate-200">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder={activeTab === 'CHANNELS' ? 'Filter departments...' : 'Search staff directory...'}
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Channels / Staff List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {activeTab === 'CHANNELS' ? (
              channels
                .filter(c => c.name.toLowerCase().includes(searchFilter.toLowerCase()) || c.department.toLowerCase().includes(searchFilter.toLowerCase()))
                .map(channel => {
                  const isActive = activeChannelId === channel.id;
                  const channelMsgs = messages.filter(m => m.channelId === channel.id);
                  const hasStat = channelMsgs.some(m => m.urgency === 'STAT');

                  return (
                    <button
                      key={channel.id}
                      onClick={() => setActiveChannelId(channel.id)}
                      className={`w-full text-left p-2 rounded-xl transition-all flex items-start gap-2.5 cursor-pointer ${
                        isActive ? 'bg-teal-800 text-white shadow-xs font-semibold' : 'text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-teal-900 text-teal-200' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {getChannelIcon(channel.iconName)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs truncate">{channel.name}</span>
                          {hasStat && (
                            <span className="bg-rose-500 text-white font-extrabold text-[9px] px-1.5 py-0.2 rounded-full animate-pulse">
                              STAT
                            </span>
                          )}
                        </div>
                        <p className={`text-[10px] truncate ${isActive ? 'text-teal-200' : 'text-slate-500'}`}>
                          {channel.department}
                        </p>
                      </div>
                    </button>
                  );
                })
            ) : (
              otherStaff
                .filter(u => u.fullName.toLowerCase().includes(searchFilter.toLowerCase()) || u.role.toLowerCase().includes(searchFilter.toLowerCase()))
                .map(staff => {
                  const threadId = `dm-${[currentUser.id, staff.id].sort().join('-')}`;
                  const isActive = activeChannelId === threadId;
                  const threadMsgs = messages.filter(m => m.channelId === threadId);

                  return (
                    <button
                      key={staff.id}
                      onClick={() => setActiveChannelId(threadId)}
                      className={`w-full text-left p-2 rounded-xl transition-all flex items-start gap-2.5 cursor-pointer ${
                        isActive ? 'bg-teal-800 text-white shadow-xs font-semibold' : 'text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isActive ? 'bg-teal-900 text-teal-200' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {staff.fullName[0]}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs truncate">{staff.fullName}</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        </div>
                        <p className={`text-[10px] truncate ${isActive ? 'text-teal-200' : 'text-slate-500'}`}>
                          {staff.role.replace('_', ' ')} · {staff.department.split('&')[0]}
                        </p>
                      </div>
                    </button>
                  );
                })
            )}
          </div>
        </div>

        {/* Right Main Area: Feed and Composer */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Channel Header */}
          <div className="p-3.5 border-b border-slate-200 bg-white flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900">
                  {activeTab === 'CHANNELS' ? activeChannel?.name : activeDirectUser?.fullName}
                </span>
                {activeChannel?.isStatBay && (
                  <span className="text-[10px] bg-rose-50 text-rose-800 border border-rose-300 font-bold px-2 py-0.5 rounded">
                    TRAUMA & RESUSCITATION
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-1">
                {activeTab === 'CHANNELS' ? activeChannel?.description : `${activeDirectUser?.role.replace('_', ' ')} · ${activeDirectUser?.phone}`}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">HIPAA & LMDC Compliant Log</span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {currentMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-8">
                <MessageSquare className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">No messages in this channel yet.</p>
                <p className="text-[11px] text-slate-400 max-w-xs mt-0.5">
                  Send a routine update, or trigger a STAT emergency alert to notify on-duty clinicians.
                </p>
              </div>
            ) : (
              currentMessages.map(msg => {
                const isMine = msg.senderId === currentUser.id;
                const isStat = msg.urgency === 'STAT';
                const isUrgent = msg.urgency === 'URGENT';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 px-1">
                      <span className="font-bold text-slate-700">{msg.senderName}</span>
                      <span>·</span>
                      <span>{msg.senderDepartment}</span>
                      <span>·</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isStat && (
                        <span className="bg-rose-600 text-white font-extrabold text-[9px] px-1.5 py-0.2 rounded animate-pulse">
                          STAT EMERGENCY
                        </span>
                      )}
                      {isUrgent && (
                        <span className="bg-amber-600 text-white font-extrabold text-[9px] px-1.5 py-0.2 rounded">
                          URGENT
                        </span>
                      )}
                    </div>

                    <div
                      className={`max-w-xl p-3 rounded-2xl text-xs space-y-2 shadow-xs ${
                        isStat
                          ? 'bg-rose-50 text-rose-950 border-2 border-rose-400'
                          : isMine
                          ? 'bg-teal-800 text-white rounded-br-none'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                      }`}
                    >
                      {/* Attached Patient Context Pill */}
                      {msg.patientMrnContext && (
                        <div className={`p-1.5 rounded-lg text-[10px] font-semibold flex items-center gap-1.5 ${
                          isMine ? 'bg-teal-900/80 text-teal-200' : 'bg-slate-100 text-slate-700'
                        }`}>
                          <User className="w-3 h-3 text-teal-400" />
                          <span>Patient Linked: <strong>{msg.patientMrnContext}</strong> {msg.patientNameContext ? `(${msg.patientNameContext})` : ''}</span>
                        </div>
                      )}

                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                      <div className="flex justify-end items-center gap-1 text-[9px] opacity-75">
                        <CheckCheck className="w-3 h-3" />
                        <span>Acknowledged</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Clinical Fast-Templates Row */}
          <div className="px-3 pt-2 bg-slate-100 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-[11px]">
            <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">Templates:</span>
            {[
              { label: 'Critical Panic Lab Value', text: 'CRITICAL LAB ALERT: Abnormal chemistry panic value requiring immediate physician review.', urgency: 'STAT' as const },
              { label: 'Bed Transfer Ready', text: 'Patient stabilized. Transferring from Male Medical Ward to Step-down unit.', urgency: 'ROUTINE' as const },
              { label: 'Stat Medication Request', text: 'Urgent pharmacy dispense requested for acute resuscitation in Bay 1.', urgency: 'URGENT' as const },
              { label: 'Shift Handover Note', text: 'Shift handover complete: all active inpatients vitals checked and stable.', urgency: 'ROUTINE' as const }
            ].map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputText(tmpl.text);
                  setMessageUrgency(tmpl.urgency);
                }}
                className="bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 px-2.5 py-1 rounded-md shrink-0 cursor-pointer transition-colors"
              >
                {tmpl.label}
              </button>
            ))}
          </div>

          {/* Composer Form */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Urgency Selector */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[11px] font-bold text-slate-500">Clinical Priority:</span>
                {(['ROUTINE', 'URGENT', 'STAT'] as const).map(prio => (
                  <button
                    key={prio}
                    type="button"
                    onClick={() => setMessageUrgency(prio)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                      messageUrgency === prio
                        ? prio === 'STAT'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : prio === 'URGENT'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-teal-800 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {prio}
                  </button>
                ))}
              </div>

              {/* Patient Link Dropdown */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[11px] font-medium text-slate-500">Link Patient:</span>
                <select
                  value={selectedPatientMrn}
                  onChange={e => setSelectedPatientMrn(e.target.value)}
                  className="text-xs border border-slate-300 rounded-md px-2 py-1 bg-slate-50 text-slate-800"
                >
                  <option value="">None (General Message)</option>
                  {db.patients.map(p => (
                    <option key={p.id} value={p.mrn}>
                      {p.mrn} - {p.firstName} {p.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Input & Send Button */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={
                  messageUrgency === 'STAT'
                    ? 'Type STAT Emergency Alert for immediate broadcast...'
                    : `Message ${activeTab === 'CHANNELS' ? activeChannel?.name : activeDirectUser?.fullName}...`
                }
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                className={`flex-1 text-xs border rounded-xl px-3.5 py-2.5 focus:outline-hidden ${
                  messageUrgency === 'STAT'
                    ? 'border-rose-400 bg-rose-50/50 text-rose-950 font-medium'
                    : 'border-slate-300 bg-white text-slate-900'
                }`}
              />

              <button
                type="submit"
                className={`text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  messageUrgency === 'STAT'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-teal-800 hover:bg-teal-900'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{messageUrgency === 'STAT' ? 'Dispatch STAT' : 'Send'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
