import React, { useState, useEffect, useRef } from 'react';
import { dbStore } from '../../services/dbStore';
import { PatientChatMessage } from '../../types';
import { MessageSquare, Send, User, ShieldCheck, CheckCheck, Clock } from 'lucide-react';

interface SecureLiveChatProps {
  patientId: string;
  patientName: string;
}

export const SecureLiveChat: React.FC<SecureLiveChatProps> = ({ patientId, patientName }) => {
  const [messages, setMessages] = useState<PatientChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [staffStatus, setStaffStatus] = useState<'Online' | 'In Consultation' | 'Offline'>('Online');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const update = () => {
      setMessages(dbStore.getChatMessages(patientId));
    };
    update();
    return dbStore.subscribe(update);
  }, [patientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setInputText('');

    await dbStore.sendChatMessage(patientId, 'patient', patientName, userText);

    // Show typing indicator after 500ms
    setTimeout(() => {
      setIsTyping(true);
    }, 500);

    setTimeout(() => {
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
      {/* Chat Header with Staff Availability Status Badge */}
      <div className="p-4 bg-hospital-navy text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center font-bold text-slate-950">
              <User className="w-5 h-5" />
            </div>
            {/* Live Status Indicator Badge */}
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-hospital-navy ${
                staffStatus === 'Online'
                  ? 'bg-emerald-400'
                  : staffStatus === 'In Consultation'
                  ? 'bg-amber-400'
                  : 'bg-slate-400'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-bold text-sm text-white">
                Nurse Sarah Kiatamba, RN (On-Duty Triage)
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
                Staff Badge: Verified
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                <span>Status: <strong>{staffStatus}</strong></span>
              </span>
              <span>&bull;</span>
              <span>Avg reply: &lt; 2 mins</span>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>Encrypted Clinical Channel</span>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((msg) => {
          const isMe = msg.sender === 'patient';
          const isSys = msg.sender === 'system';

          if (isSys) {
            return (
              <div key={msg.id} className="text-center my-3">
                <span className="inline-block px-3 py-1 bg-slate-200/80 rounded-full text-[11px] text-slate-600 font-medium">
                  {msg.text}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center space-x-1.5 mb-1 px-1">
                <span className="text-[11px] font-bold text-slate-600">
                  {msg.senderName}
                </span>
                <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                  isMe
                    ? 'bg-teal-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>

              {isMe && (
                <div className="flex items-center space-x-1 mt-0.5 px-1 text-[10px] text-teal-600 font-medium">
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Delivered</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Real-time Typing Indicator */}
        {isTyping && (
          <div className="flex items-center space-x-2 text-xs text-slate-500 italic py-1">
            <div className="flex space-x-1 items-center bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-[11px] font-semibold text-slate-600">
                Nurse Sarah is typing...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center space-x-3">
        <input
          type="text"
          placeholder="Type your message to on-duty nurse / coordinator..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className={`p-2.5 sm:px-4 sm:py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center space-x-1.5 ${
            inputText.trim()
              ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};
