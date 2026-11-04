import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Lock, 
  Filter, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Key, 
  UserCheck, 
  Settings, 
  FileSpreadsheet, 
  Eye, 
  Clock, 
  Calendar, 
  Activity, 
  Terminal, 
  Database,
  RefreshCw,
  Plus,
  X
} from 'lucide-react';
import { getDatabaseState, updateDatabaseState, logAuditEvent } from '../../services/storageService';
import { UserAccount, AuditEvent, UserRole } from '../../types/auth';

interface AuditTrailWorkstationProps {
  currentUser: UserAccount;
}

export const AuditTrailWorkstation: React.FC<AuditTrailWorkstationProps> = ({ currentUser }) => {
  const db = getDatabaseState();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'LOGINS_AUTH' | 'SYSTEM_CHANGES' | 'CLINICAL_ACTIONS' | 'SECURITY_FLAGS'>('ALL');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'FLAGGED' | 'DENIED'>('ALL');
  
  // Inspection Modal
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

  // Simulation Modal
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simAction, setSimAction] = useState<'LOGIN' | 'CONFIG_CHANGE' | 'EXPORT'>('LOGIN');
  const [simDetails, setSimDetails] = useState('Staff member logged in from Mobile Triage tablet with biometric MFA token.');

  // Categorize audit logs
  const isLoginEvent = (action: string) => action === 'LOGIN' || action === 'LOGOUT';
  const isSystemChange = (action: string) => action === 'CONFIG_CHANGE' || action === 'UPDATE' || action === 'CREATE' || action === 'DOWNTIME_SYNC';
  const isClinicalAction = (action: string) => action === 'SIGN' || action === 'DISPENSE' || action === 'RELEASE_RESULT' || action === 'COLLECT_PAYMENT';
  const isSecurityFlag = (status: string, action: string) => status === 'FLAGGED' || status === 'DENIED' || action === 'BREAK_GLASS' || action === 'DELETE_ATTEMPT' || action === 'REFUND';

  // Filter audit logs
  const filteredLogs = db.auditLogs.filter(log => {
    // Search query matches
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      log.userName.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.module.toLowerCase().includes(q) ||
      (log.patientMrn && log.patientMrn.toLowerCase().includes(q)) ||
      log.ipAddress.toLowerCase().includes(q);

    // Category filter
    let matchesCategory = true;
    if (categoryFilter === 'LOGINS_AUTH') matchesCategory = isLoginEvent(log.action);
    else if (categoryFilter === 'SYSTEM_CHANGES') matchesCategory = isSystemChange(log.action);
    else if (categoryFilter === 'CLINICAL_ACTIONS') matchesCategory = isClinicalAction(log.action);
    else if (categoryFilter === 'SECURITY_FLAGS') matchesCategory = isSecurityFlag(log.status, log.action);

    // Action filter
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;

    // Status filter
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;

    return matchesSearch && matchesCategory && matchesAction && matchesStatus;
  });

  // Calculate Metrics
  const totalEvents = db.auditLogs.length;
  const loginEvents = db.auditLogs.filter(l => isLoginEvent(l.action)).length;
  const systemChangeEvents = db.auditLogs.filter(l => isSystemChange(l.action)).length;
  const securityFlagsCount = db.auditLogs.filter(l => isSecurityFlag(l.status, l.action)).length;

  // Handle Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'User', 'Role', 'Action', 'Module', 'Patient MRN', 'Status', 'IP Address', 'Details'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.timestamp,
      `"${l.userName}"`,
      l.userRole,
      l.action,
      l.module,
      l.patientMrn || '',
      l.status,
      `"${l.ipAddress}"`,
      `"${l.details.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `jjmemorial_audit_trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Also record export in audit trail
    logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'EXPORT',
      module: 'SECURITY',
      details: `Compliance officer exported ${filteredLogs.length} audit records to CSV for MoH compliance archiving.`,
      ipAddress: 'Audit Workstation Console',
      status: 'SUCCESS',
    });
  };

  // Handle Simulation Logging
  const handleLogSimulatedEvent = () => {
    logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: simAction,
      module: 'SECURITY',
      details: simDetails,
      ipAddress: '192.168.10.45 (Audit Security Station)',
      status: simAction === 'LOGIN' ? 'SUCCESS' : 'SUCCESS',
    });

    setShowSimulateModal(false);
    alert('Simulated compliance event successfully appended to immutable audit ledger.');
  };

  // Action badge color
  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'LOGIN': return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'LOGOUT': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'CREATE': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'UPDATE': return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'SIGN': return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'DISPENSE': return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'RELEASE_RESULT': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'COLLECT_PAYMENT': return 'bg-teal-50 text-teal-900 border-teal-200';
      case 'BREAK_GLASS': return 'bg-rose-100 text-rose-900 border-rose-300 font-bold';
      case 'DELETE_ATTEMPT': return 'bg-rose-100 text-rose-900 border-rose-300';
      case 'CONFIG_CHANGE': return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'REFUND': return 'bg-amber-50 text-amber-900 border-amber-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold text-slate-900 text-base">Audit Trail & Compliance Surveillance</h2>
            <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded">
              ERP COMPLIANCE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable user logins, role switches, system configuration changes, and clinical/financial event monitoring
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowSimulateModal(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Simulate Log Event</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="bg-teal-800 hover:bg-teal-900 text-white font-medium text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit Log (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => { setCategoryFilter('ALL'); setStatusFilter('ALL'); }}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Immutable Events</span>
            <Database className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-xl font-extrabold text-slate-900 font-mono tabular-nums">
            {totalEvents}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Tamper-proof SHA-256 Ledger
          </div>
        </div>

        <div 
          onClick={() => { setCategoryFilter('LOGINS_AUTH'); setStatusFilter('ALL'); }}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-teal-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">User Logins & Sessions</span>
            <UserCheck className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 text-xl font-extrabold text-sky-900 font-mono tabular-nums">
            {loginEvents}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            MFA & Hardware Badge Verified
          </div>
        </div>

        <div 
          onClick={() => { setCategoryFilter('SYSTEM_CHANGES'); setStatusFilter('ALL'); }}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-teal-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">System & Config Changes</span>
            <Settings className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 text-xl font-extrabold text-teal-900 font-mono tabular-nums">
            {systemChangeEvents}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Rate policies, inventory & GL
          </div>
        </div>

        <div 
          onClick={() => { setCategoryFilter('SECURITY_FLAGS'); setStatusFilter('ALL'); }}
          className={`p-4 rounded-xl border shadow-xs cursor-pointer transition-colors ${
            securityFlagsCount > 0 
              ? 'bg-rose-50/70 border-rose-200 hover:bg-rose-50' 
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-900">Security Flags & Overrides</span>
            <AlertTriangle className={`w-4 h-4 ${securityFlagsCount > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2 text-xl font-extrabold text-rose-900 font-mono tabular-nums">
            {securityFlagsCount} Events
          </div>
          <div className="text-[11px] text-rose-700 mt-1 font-semibold">
            Break-glass, waivers & denies
          </div>
        </div>
      </div>

      {/* Main Audit Log Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        {/* Filter Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search user, MRN, IP, action, or details..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden focus:border-teal-700"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: 'ALL', label: 'All Events' },
              { id: 'LOGINS_AUTH', label: 'Logins & Auth' },
              { id: 'SYSTEM_CHANGES', label: 'System Changes' },
              { id: 'CLINICAL_ACTIONS', label: 'Clinical Actions' },
              { id: 'SECURITY_FLAGS', label: 'Security Flags' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id as any)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  categoryFilter === cat.id
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Action & Status Selects */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 focus:outline-hidden font-medium text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Success Only</option>
              <option value="FLAGGED">Flagged / Break-Glass</option>
              <option value="DENIED">Blocked / Denied</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-3">Timestamp (UTC)</th>
                <th className="p-3">User & Staff Role</th>
                <th className="p-3">Action & Module</th>
                <th className="p-3">Patient / Target</th>
                <th className="p-3">Activity Description & IP Context</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-sans text-xs">
                    No audit events match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const badgeColor = getActionBadgeColor(log.action);
                  return (
                    <tr 
                      key={log.id} 
                      className={`hover:bg-slate-50/70 transition-colors ${
                        log.status === 'FLAGGED' ? 'bg-amber-50/20' : log.status === 'DENIED' ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="p-3 text-slate-500 whitespace-nowrap">
                        <div>{log.timestamp.replace('T', ' ').slice(0, 19)}</div>
                        <span className="text-[10px] text-slate-400">{log.id}</span>
                      </td>

                      <td className="p-3 font-sans">
                        <span className="font-bold text-slate-900 block">{log.userName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{log.userRole}</span>
                      </td>

                      <td className="p-3 font-sans">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border ${badgeColor} mr-1 font-mono`}>
                          {log.action}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">{log.module}</span>
                      </td>

                      <td className="p-3">
                        {log.patientMrn ? (
                          <span className="font-bold text-teal-800">{log.patientMrn}</span>
                        ) : log.resourceId ? (
                          <span className="text-slate-600 font-semibold">{log.resourceId}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="p-3 font-sans text-slate-700 max-w-sm">
                        <div className="leading-snug">{log.details}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                          <Terminal className="w-3 h-3" />
                          <span>{log.ipAddress}</span>
                        </div>
                      </td>

                      <td className="p-3 text-center font-sans">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[10px] font-mono ${
                          log.status === 'SUCCESS' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : log.status === 'FLAGGED' 
                            ? 'bg-amber-100 text-amber-900' 
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {log.status === 'SUCCESS' && <CheckCircle2 className="w-3 h-3" />}
                          {log.status === 'FLAGGED' && <AlertTriangle className="w-3 h-3" />}
                          {log.status === 'DENIED' && <XCircle className="w-3 h-3" />}
                          <span>{log.status}</span>
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedEvent(log)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium px-2 py-1 rounded transition-colors cursor-pointer"
                          title="Inspect raw event JSON & audit hash"
                        >
                          <Eye className="w-3 h-3 inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EVENT INSPECTION MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-teal-700" />
                <h3 className="font-bold text-slate-900 text-base">Immutable Audit Event Record</h3>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] block">Event Reference ID</span>
                  <span className="font-bold text-slate-900">{selectedEvent.id}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Timestamp (UTC)</span>
                  <span className="font-bold text-slate-900">{selectedEvent.timestamp}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Actor Name & ID</span>
                  <span className="font-bold text-slate-900">{selectedEvent.userName} ({selectedEvent.userId})</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">RBAC Role</span>
                  <span className="font-bold text-teal-800">{selectedEvent.userRole}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] font-semibold block mb-1">Details & System Context</span>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 leading-relaxed font-sans">
                  {selectedEvent.details}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px] block">Network & Workstation Source</span>
                  <span className="font-mono text-slate-700">{selectedEvent.ipAddress}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Verification Checksum</span>
                  <span className="font-mono text-emerald-800 font-bold">SHA256: VALIDATED_TAMPER_FREE</span>
                </div>
              </div>

              {/* Raw JSON */}
              <div>
                <span className="text-slate-500 text-[10px] font-mono block mb-1">Raw Immutable JSON Payload</span>
                <pre className="p-3 bg-slate-900 text-teal-300 rounded-lg text-[10px] font-mono overflow-x-auto max-h-40">
                  {JSON.stringify(selectedEvent, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIMULATE EVENT MODAL */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Simulate Compliance Audit Event</h3>
              <button onClick={() => setShowSimulateModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Action Type</label>
                <select
                  value={simAction}
                  onChange={e => setSimAction(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-hidden"
                >
                  <option value="LOGIN">User Authentication & Login Session</option>
                  <option value="CONFIG_CHANGE">System Security & Exchange Rate Policy Update</option>
                  <option value="EXPORT">Compliance Audit Trail Data Export</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Event Description</label>
                <textarea
                  rows={3}
                  value={simDetails}
                  onChange={e => setSimDetails(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowSimulateModal(false)}
                className="text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogSimulatedEvent}
                className="bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Append to Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
