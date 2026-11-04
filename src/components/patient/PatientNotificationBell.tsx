import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Calendar, 
  Microscope, 
  Pill, 
  Receipt, 
  Check, 
  CheckCheck, 
  Clock, 
  AlertCircle,
  ExternalLink,
  X
} from 'lucide-react';
import { PatientNotification } from '../../types/communication';
import { markPatientNotificationAsRead, markAllPatientNotificationsAsRead } from '../../services/storageService';

interface PatientNotificationBellProps {
  notifications: PatientNotification[];
  patientId: string;
  onNavigateToTab: (tab: 'appointments' | 'labs' | 'prescriptions' | 'billing' | 'history' | 'telehealth') => void;
}

export const PatientNotificationBell: React.FC<PatientNotificationBellProps> = ({
  notifications,
  patientId,
  onNavigateToTab
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'APPOINTMENTS' | 'LABS' | 'PRESCRIPTIONS'>('ALL');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const patientNotifs = notifications.filter(n => n.patientId === patientId);
  const unreadCount = patientNotifs.filter(n => !n.isRead).length;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredNotifs = patientNotifs.filter(n => {
    if (filter === 'UNREAD') return !n.isRead;
    if (filter === 'APPOINTMENTS') return n.type === 'APPOINTMENT_REMINDER';
    if (filter === 'LABS') return n.type === 'LAB_RESULT_AVAILABLE';
    if (filter === 'PRESCRIPTIONS') return n.type === 'PRESCRIPTION_UPDATE';
    return true;
  });

  const getNotificationIcon = (type: PatientNotification['type']) => {
    switch (type) {
      case 'APPOINTMENT_REMINDER':
        return <Calendar className="w-4 h-4 text-teal-700" />;
      case 'LAB_RESULT_AVAILABLE':
        return <Microscope className="w-4 h-4 text-amber-700" />;
      case 'PRESCRIPTION_UPDATE':
        return <Pill className="w-4 h-4 text-indigo-700" />;
      case 'BILLING':
        return <Receipt className="w-4 h-4 text-blue-700" />;
      default:
        return <AlertCircle className="w-4 h-4 text-teal-700" />;
    }
  };

  const getIconBg = (type: PatientNotification['type']) => {
    switch (type) {
      case 'APPOINTMENT_REMINDER':
        return 'bg-teal-50 border-teal-200';
      case 'LAB_RESULT_AVAILABLE':
        return 'bg-amber-50 border-amber-200';
      case 'PRESCRIPTION_UPDATE':
        return 'bg-indigo-50 border-indigo-200';
      case 'BILLING':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const handleNotificationClick = (notif: PatientNotification) => {
    if (!notif.isRead) {
      markPatientNotificationAsRead(notif.id);
    }
    onNavigateToTab(notif.targetTab);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200 bg-white"
        title="Patient Notifications & Alerts"
        aria-label="Patient Notifications"
      >
        <Bell className="w-5 h-5 text-slate-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-teal-400" />
              <span className="font-bold text-xs">Patient Alerts & Reminders</span>
              {unreadCount > 0 && (
                <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] px-1.5 py-0.2 rounded font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllPatientNotificationsAsRead(patientId)}
                  className="text-[11px] text-teal-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 text-[11px] overflow-x-auto">
            {(['ALL', 'UNREAD', 'APPOINTMENTS', 'LABS', 'PRESCRIPTIONS'] as const).map(tabKey => (
              <button
                key={tabKey}
                onClick={() => setFilter(tabKey)}
                className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  filter === tabKey
                    ? 'bg-teal-800 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tabKey === 'ALL' && `All (${patientNotifs.length})`}
                {tabKey === 'UNREAD' && `Unread (${unreadCount})`}
                {tabKey === 'APPOINTMENTS' && 'Appointments'}
                {tabKey === 'LABS' && 'Labs'}
                {tabKey === 'PRESCRIPTIONS' && 'Pharmacy'}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {filteredNotifs.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium">No notifications in this view.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">You are up to date on all clinical events.</p>
              </div>
            ) : (
              filteredNotifs.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3 transition-colors cursor-pointer flex gap-3 hover:bg-slate-50 relative ${
                    !notif.isRead ? 'bg-teal-50/40' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border ${getIconBg(notif.type)}`}>
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h4 className={`text-xs leading-snug line-clamp-1 ${!notif.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {notif.title}
                      </h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0 mt-1" />
                      )}
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(notif.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>

                      {notif.actionLabel && (
                        <span className="text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-0.5">
                          {notif.actionLabel}
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
            <span className="text-[10px] text-slate-500">
              J & J Memorial Connected Health Alerts · Real-time Clinical Sign-off
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
