import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Microscope, 
  DollarSign, 
  Stethoscope, 
  Bed, 
  Pill, 
  ShieldAlert, 
  ArrowRight, 
  Check, 
  Filter, 
  Zap, 
  Clock,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { UserAccount } from '../../types/auth';
import { 
  notificationService, 
  NotificationItem, 
  NotificationCategory, 
  NotificationPriority 
} from '../../services/notificationService';
import { RBACService, PrimaryRole } from '../../services/rbacService';

interface NotificationDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onNavigateModule: (moduleId: string, label?: string) => void;
}

export const NotificationDrawerModal: React.FC<NotificationDrawerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onNavigateModule,
}) => {
  const [activeFilter, setActiveFilter] = useState<'ROLE_ONLY' | 'ALL' | 'STAT_HIGH' | 'UNREAD'>('ROLE_ONLY');
  const [simulationToast, setSimulationToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const primaryRole: PrimaryRole = RBACService.getPrimaryRole(currentUser);
  const allNotifications = notificationService.getNotificationsForUser(currentUser);
  const unreadCount = notificationService.getUnreadCount(currentUser);

  // Filter based on active tab
  let displayList: NotificationItem[] = [];
  if (activeFilter === 'ROLE_ONLY') {
    displayList = allNotifications.filter(
      n => n.targetRoles !== 'ALL' && n.targetRoles.includes(primaryRole)
    );
  } else if (activeFilter === 'STAT_HIGH') {
    displayList = allNotifications.filter(n => n.priority === 'STAT' || n.priority === 'HIGH');
  } else if (activeFilter === 'UNREAD') {
    displayList = allNotifications.filter(n => !n.readBy.includes(currentUser.id));
  } else {
    displayList = allNotifications;
  }

  const handleAlertAction = (alert: NotificationItem) => {
    notificationService.markAsRead(alert.id, currentUser.id);
    onNavigateModule(alert.targetModule, alert.title);
    onClose();
  };

  const handleMarkAllRead = () => {
    notificationService.markAllAsRead(currentUser);
  };

  const handleSimulate = (type: 'LAB_RESULT' | 'BILLING_UNPAID' | 'STAT_EMERGENCY') => {
    const created = notificationService.simulateIncomingAlert(type);
    setSimulationToast(`Triggered real-time alert: "${created.title}"`);
    setTimeout(() => setSimulationToast(null), 4000);
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'LAB_RESULT': return Microscope;
      case 'BILLING_UNPAID': return DollarSign;
      case 'STAT_EMERGENCY': return Zap;
      case 'TRIAGE_SURGE': return Stethoscope;
      case 'BED_CAPACITY': return Bed;
      case 'STOCKOUT_RISK': return Pill;
      case 'SECURITY_ALERT': return ShieldAlert;
      default: return AlertTriangle;
    }
  };

  const getCategoryColor = (category: NotificationCategory) => {
    switch (category) {
      case 'LAB_RESULT': return 'text-cyan-700 bg-cyan-50 border-cyan-200';
      case 'BILLING_UNPAID': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'STAT_EMERGENCY': return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'BED_CAPACITY': return 'text-sky-700 bg-sky-50 border-sky-200';
      case 'STOCKOUT_RISK': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'SECURITY_ALERT': return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const getPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case 'STAT':
        return <span className="bg-rose-600 text-white font-mono font-extrabold px-1.5 py-0.2 rounded text-[9px] animate-pulse">STAT</span>;
      case 'HIGH':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 font-mono font-bold px-1.5 py-0.2 rounded text-[9px]">HIGH</span>;
      case 'MEDIUM':
        return <span className="bg-blue-100 text-blue-800 border border-blue-200 font-mono font-medium px-1.5 py-0.2 rounded text-[9px]">MED</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 font-mono px-1.5 py-0.2 rounded text-[9px]">INFO</span>;
    }
  };

  const formatRelativeTime = (isoString: string) => {
    const elapsed = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(elapsed / (60 * 1000));
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col border-l border-slate-200 animate-slide-left">
        {/* Drawer Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-800 flex items-center justify-center font-bold text-teal-200">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm tracking-tight">Clinical & Operational Alerts</h3>
                {unreadCount > 0 && (
                  <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Tailored for <strong className="text-teal-300">{primaryRole}</strong> scope ({currentUser.fullName})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                title="Mark all notifications as read"
              >
                Mark Read
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveFilter('ROLE_ONLY')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeFilter === 'ROLE_ONLY'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {primaryRole} Alerts
            </button>
            <button
              onClick={() => setActiveFilter('STAT_HIGH')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeFilter === 'STAT_HIGH'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              STAT / High
            </button>
            <button
              onClick={() => setActiveFilter('UNREAD')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeFilter === 'UNREAD'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeFilter === 'ALL'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({allNotifications.length})
            </button>
          </div>
        </div>

        {/* Live Simulation Banner */}
        <div className="bg-slate-50 p-3 border-b border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-teal-700" />
            <span>Simulate Incoming Trigger:</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleSimulate('LAB_RESULT')}
              className="bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer"
            >
              + Lab Result
            </button>
            <button
              onClick={() => handleSimulate('BILLING_UNPAID')}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer"
            >
              + Unpaid Bill
            </button>
            <button
              onClick={() => handleSimulate('STAT_EMERGENCY')}
              className="bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer"
            >
              + STAT Trauma
            </button>
          </div>
        </div>

        {simulationToast && (
          <div className="bg-teal-900 text-teal-100 text-xs px-4 py-2 flex items-center justify-between">
            <span>{simulationToast}</span>
            <button onClick={() => setSimulationToast(null)} className="text-teal-300 hover:text-white">✕</button>
          </div>
        )}

        {/* Notifications Scrollable List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {displayList.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">No active alerts matching this filter</p>
              <p className="text-[11px]">All clinical requisitions and accounts are in nominal state.</p>
            </div>
          ) : (
            displayList.map(alert => {
              const Icon = getCategoryIcon(alert.category);
              const isRead = alert.readBy.includes(currentUser.id);
              const colorClass = getCategoryColor(alert.category);

              return (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isRead 
                      ? 'bg-white border-slate-200 opacity-80' 
                      : 'bg-white border-teal-300/80 shadow-xs ring-1 ring-teal-200/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg border ${colorClass}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border ${colorClass}`}>
                        {alert.category.replace('_', ' ')}
                      </span>
                      {getPriorityBadge(alert.priority)}
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatRelativeTime(alert.createdAt)}</span>
                      {!isRead && (
                        <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0 ml-1" title="Unread" />
                      )}
                    </div>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 mt-2">{alert.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{alert.message}</p>

                  {/* Metadata pills */}
                  {alert.metadata && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                      {alert.metadata.patientName && (
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium text-slate-700">
                          Pt: {alert.metadata.patientName}
                        </span>
                      )}
                      {alert.metadata.patientMrn && (
                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                          {alert.metadata.patientMrn}
                        </span>
                      )}
                      {alert.metadata.invoiceId && (
                        <span className="font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">
                          {alert.metadata.invoiceId} ({alert.metadata.amount})
                        </span>
                      )}
                      {alert.metadata.orderId && (
                        <span className="font-mono bg-cyan-50 text-cyan-800 border border-cyan-200 px-1.5 py-0.5 rounded font-bold">
                          {alert.metadata.orderId}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action CTA */}
                  <div className="mt-3 flex items-center justify-between pt-1">
                    <button
                      onClick={() => notificationService.markAsRead(alert.id, currentUser.id)}
                      className="text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>{isRead ? 'Acknowledged' : 'Mark as Read'}</span>
                    </button>

                    <button
                      onClick={() => handleAlertAction(alert)}
                      className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>{alert.actionLabel}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
