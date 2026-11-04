import React, { useState, useEffect } from 'react';
import { dbStore } from '../../services/dbStore';
import { notificationService } from '../../services/notifications';
import { InternalMessage, UserRole } from '../../types';
import { MessageSquare, Send, Bell, BellRing, AlertTriangle, ShieldCheck, User, CheckCircle2 } from 'lucide-react';

export const InternalMessaging: React.FC = () => {
  const [messages, setMessages] = useState<InternalMessage[]>([]);
  const [channel, setChannel] = useState<InternalMessage['channel']>('OPD Urgent');
  const [inputText, setInputText] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [senderName, setSenderName] = useState('Dr. Emmanuel Tamba, MD');
  const [senderRole, setSenderRole] = useState<UserRole>('doctor');
  const [hasPermission, setHasPermission] = useState<boolean>(() => notificationService.isGranted());

  useEffect(() => {
    const update = () => {
      setMessages(dbStore.getInternalMessages());
    };
    update();
    return dbStore.subscribe(update);
  }, []);

  const handleRequestPermission = async () => {
    const granted = await notificationService.requestPermission();
    setHasPermission(granted);
    if (granted) {
      notificationService.sendNotification(
        'Urgent Departmental Messaging Notifications Enabled',
        'You will now receive desktop notifications whenever an urgent clinical message is posted.',
        true
      );
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    await dbStore.sendInternalMessage({
      senderId: 'stf-current',
      senderName,
      senderRole,
      channel,
      content: inputText.trim(),
      isUrgent,
    });

    setInputText('');
    setIsUrgent(false);
  };

  const CHANNELS: InternalMessage['channel'][] = [
    'OPD Urgent',
    'General Clinical',
    'Pharmacy & Stock',
    'Lab & Diagnostics',
    'Admin & HR',
  ];

  const channelMessages = messages.filter((m) => m.channel === channel);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[650px]">
      {/* Top Bar with Browser Notification Toggle */}
      <div className="p-4 bg-hospital-navy text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base">
              Internal Clinical Secure Messaging
            </h3>
            <p className="text-[11px] text-slate-300">
              Departmental communications with instant desktop chime alerts for urgent notifications.
            </p>
          </div>
        </div>

        <div>
          {!hasPermission ? (
            <button
              onClick={handleRequestPermission}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Enable Browser Desktop Alerts</span>
            </button>
          ) : (
            <span className="inline-flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/70 px-2.5 py-1 rounded-lg border border-emerald-800">
              <BellRing className="w-3.5 h-3.5" />
              <span>Desktop Chimes Active</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Chat Split: Channels List on Left, Stream on Right */}
      <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
        {/* Channels Sidebar (Col 3) */}
        <div className="w-full sm:w-56 bg-slate-50 border-r border-slate-200 p-3 space-y-1.5 shrink-0">
          <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Clinical Channels
          </span>
          {CHANNELS.map((ch) => {
            const isSelected = ch === channel;
            const count = messages.filter((m) => m.channel === ch && m.isUrgent).length;
            return (
              <button
                key={ch}
                onClick={() => setChannel(ch)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-hospital-navy text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <span># {ch}</span>
                {count > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-rose-600 text-white animate-pulse">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Message Stream & Composer (Col 9) */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Channel Header */}
          <div className="p-3 px-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs">
            <span className="font-extrabold text-slate-900">
              #{channel} Channel
            </span>
            <span className="text-slate-400">
              Posting as: <strong>{senderName}</strong>
            </span>
          </div>

          {/* Messages List */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3.5 bg-slate-50/20">
            {channelMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3.5 rounded-2xl border text-xs sm:text-sm leading-relaxed space-y-1 ${
                  msg.isUrgent
                    ? 'bg-rose-50 border-rose-300 shadow-sm'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">
                      {msg.senderName}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                      {msg.senderRole}
                    </span>
                    {msg.isUrgent && (
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-extrabold bg-rose-600 text-white uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> URGENT STAT
                      </span>
                    )}
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">{msg.timestamp}</span>
                </div>

                <p className="text-slate-700">
                  {msg.content}
                </p>
              </div>
            ))}
          </div>

          {/* Composer Form */}
          <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-slate-200 bg-white space-y-2">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder={`Post message to #${channel}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center space-x-1.5 ${
                  inputText.trim()
                    ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 text-rose-600 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded"
                />
                <span>Tag as URGENT (Dispatches instant audio chime & desktop browser alert)</span>
              </label>

              <span className="text-[11px] text-slate-400">
                End-to-End Hospital Intranet Channel
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
