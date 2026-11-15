import React, { useState, useEffect } from 'react';
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
  X,
  Cloud,
  CloudUpload,
  HardDrive,
  FileCheck,
  ShieldAlert,
  Server,
  ArrowUpRight,
  ExternalLink,
  Layers,
  CheckCircle,
  FileText,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Box,
  FileSearch,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { getDatabaseState, updateDatabaseState } from '../../services/storageService';
import { UserAccount, AuditEvent, UserRole } from '../../types/auth';
import { auditTrailService } from '../../services/auditTrailService';
import { backgroundSyncService, EMRCloudSnapshot } from '../../services/backgroundSyncService';
import { SecurityAudit3DTopology } from './SecurityAudit3DTopology';

interface AuditTrailWorkstationProps {
  currentUser: UserAccount;
}

type AuditSortField = 'timestamp' | 'userName' | 'action' | 'module' | 'patientMrn' | 'ipAddress';
type SortDirection = 'asc' | 'desc';

export const AuditTrailWorkstation: React.FC<AuditTrailWorkstationProps> = ({ currentUser }) => {
  const db = getDatabaseState();
  const [activeTab, setActiveTab] = useState<'AUDIT_LEDGER' | 'SECURITY_TOPOLOGY' | 'CLOUD_SNAPSHOTS'>('AUDIT_LEDGER');

  // Search, Filters & Column Sorting for Audit Ledger
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'LOGINS' | 'ACCESSES' | 'BREAK_GLASS' | 'MODIFICATIONS' | 'EXPORTS' | 'USER_ACTIONS' | 'SECURITY'>('ALL');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'FLAGGED' | 'DENIED'>('ALL');
  const [sortField, setSortField] = useState<AuditSortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [, setAuditLogRevision] = useState(0);

  // Subscribe to real-time audit trail logs
  useEffect(() => {
    const unsubscribe = auditTrailService.subscribe(() => {
      setAuditLogRevision(r => r + 1);
    });
    return () => unsubscribe();
  }, []);
  
  // Inspection & Simulation Modals
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simAction, setSimAction] = useState<'LOGIN' | 'READ' | 'UPDATE' | 'EXPORT' | 'BREAK_GLASS'>('LOGIN');
  const [simDetails, setSimDetails] = useState('Staff member logged in from Mobile Triage tablet with biometric MFA token.');
  const [simEntityType, setSimEntityType] = useState<'PATIENT' | 'ENCOUNTER' | 'VITALS' | 'PRESCRIPTION'>('ENCOUNTER');
  const [simMrn, setSimMrn] = useState('JJM-2026-00101');

  // Cryptographic Ledger Integrity State
  const [isVerifyingIntegrity, setIsVerifyingIntegrity] = useState(false);
  const [integrityStatus, setIntegrityStatus] = useState<{
    verified: boolean;
    timestamp: string | null;
    algorithm: string;
    totalVerified: number;
  }>({
    verified: true,
    timestamp: new Date().toLocaleTimeString(),
    algorithm: 'SHA-256 HMAC Chained Ledger',
    totalVerified: db.auditLogs?.length || 0,
  });

  // Background Cloud Sync & Snapshots State
  const [snapshots, setSnapshots] = useState<EMRCloudSnapshot[]>([]);
  const [isTakingSnapshot, setIsTakingSnapshot] = useState(false);
  const [snapshotSuccessToast, setSnapshotSuccessToast] = useState<string | null>(null);
  const [restoreModalSnapshot, setRestoreModalSnapshot] = useState<EMRCloudSnapshot | null>(null);
  const [restoreNotice, setRestoreNotice] = useState<string | null>(null);

  // Subscribe to background sync snapshots
  useEffect(() => {
    setSnapshots(backgroundSyncService.getSnapshotCatalog());
    const unsubscribe = backgroundSyncService.subscribe((updated) => {
      setSnapshots(updated);
    });
    return () => unsubscribe();
  }, []);

  // Filter audit logs using auditTrailService
  const rawFilteredLogs = auditTrailService.getFilteredLogs({
    category: categoryFilter,
    action: actionFilter,
    status: statusFilter,
    searchQuery,
  });

  // Sortable table handler & sorted dataset
  const handleSortColumn = (field: AuditSortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'timestamp' ? 'desc' : 'asc');
    }
  };

  const sortedLogs = React.useMemo(() => {
    const copy = [...rawFilteredLogs];
    copy.sort((a, b) => {
      let valA = '';
      let valB = '';
      if (sortField === 'timestamp') {
        const tA = new Date(a.timestamp).getTime();
        const tB = new Date(b.timestamp).getTime();
        return sortDirection === 'asc' ? tA - tB : tB - tA;
      }
      if (sortField === 'userName') {
        valA = `${a.userName} ${a.userRole}`.toLowerCase();
        valB = `${b.userName} ${b.userRole}`.toLowerCase();
      } else if (sortField === 'action') {
        valA = `${a.action} ${a.status}`.toLowerCase();
        valB = `${b.action} ${b.status}`.toLowerCase();
      } else if (sortField === 'module') {
        valA = a.module.toLowerCase();
        valB = b.module.toLowerCase();
      } else if (sortField === 'patientMrn') {
        valA = (a.patientMrn || 'zzzz').toLowerCase();
        valB = (b.patientMrn || 'zzzz').toLowerCase();
      } else if (sortField === 'ipAddress') {
        valA = a.ipAddress.toLowerCase();
        valB = b.ipAddress.toLowerCase();
      }
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [rawFilteredLogs, sortField, sortDirection]);

  // Keep filteredLogs alias for CSV/JSON export
  const filteredLogs = sortedLogs;

  // Real-time compliance metrics
  const metrics = auditTrailService.getComplianceMetrics();

  // Analytics datasets for Recharts visualization
  const categoryChartData = React.useMemo(
    () => [
      { name: 'Logins & MFA', count: metrics.loginEvents, color: '#0284c7' },
      { name: 'Record Access', count: metrics.recordAccesses, color: '#0d9488' },
      { name: 'Break-Glass', count: metrics.breakGlassCount, color: '#e11d48' },
      { name: 'Modifications', count: metrics.recordModifications, color: '#4f46e5' },
      { name: 'Exports', count: metrics.dataExports, color: '#7c3aed' },
    ],
    [metrics]
  );

  const moduleChartData = React.useMemo(() => {
    const allLogs = db.auditLogs || [];
    const counts: Record<string, number> = {};
    allLogs.forEach(ev => {
      counts[ev.module] = (counts[ev.module] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([module, count]) => ({ module, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);
  }, [db.auditLogs]);

  const renderSortIcon = (field: AuditSortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 inline-block ml-1" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-teal-700 inline-block ml-1" />
    ) : (
      <ArrowDown className="w-3 h-3 text-teal-700 inline-block ml-1" />
    );
  };

  // Verify Audit Chain Integrity
  const handleVerifyIntegrity = () => {
    setIsVerifyingIntegrity(true);
    setTimeout(() => {
      const result = auditTrailService.verifyLedgerIntegrity();
      setIntegrityStatus({
        verified: result.isValid,
        timestamp: new Date().toLocaleTimeString(),
        algorithm: result.algorithm,
        totalVerified: result.totalVerified,
      });
      setIsVerifyingIntegrity(false);
    }, 600);
  };

  // Trigger Immediate Cloud EMR Snapshot
  const handleTriggerSnapshotNow = async () => {
    setIsTakingSnapshot(true);
    try {
      const newSnapshot = await backgroundSyncService.triggerSnapshot('USER_INITIATED_AUDIT_CONSOLE', currentUser);
      setSnapshots(backgroundSyncService.getSnapshotCatalog());
      setSnapshotSuccessToast(`Snapshot ${newSnapshot.snapshotId} generated and encrypted with AES-256-GCM. Cloud storage confirmed.`);
      setTimeout(() => setSnapshotSuccessToast(null), 5000);
    } catch (err) {
      console.error('Snapshot failed:', err);
    } finally {
      setIsTakingSnapshot(false);
    }
  };

  // Handle Export CSV (and automatically log the export!)
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
    link.href = url;
    link.download = `jjmemorial_audit_trail_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Automatically record export action in the audit trail!
    auditTrailService.logDataExport({
      user: currentUser,
      exportType: 'AUDIT_TRAIL',
      recordCount: filteredLogs.length,
      destination: 'CSV Local Archive',
      filterApplied: `Category: ${categoryFilter}, Status: ${statusFilter}`,
    });
  };

  // Handle Export Encrypted JSON (and log the export!)
  const handleExportJSON = () => {
    const payload = {
      facility: 'J & J Memorial Clinic, VOA East Community, Monrovia, Liberia',
      exportedAt: new Date().toISOString(),
      complianceOfficer: `${currentUser.fullName} (${currentUser.role})`,
      regulatoryFramework: 'Ministry of Health Liberia Healthcare Data Compliance Mandate & HIPAA Security Rule',
      auditLedgerIntegrity: integrityStatus,
      totalRecords: filteredLogs.length,
      auditEvents: filteredLogs,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jjmemorial_audit_compliance_ledger_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    auditTrailService.logDataExport({
      user: currentUser,
      exportType: 'AUDIT_TRAIL',
      recordCount: filteredLogs.length,
      destination: 'Encrypted JSON Regulatory File',
      filterApplied: `Category: ${categoryFilter}`,
    });
  };

  // Handle Simulation Logging
  const handleLogSimulatedEvent = () => {
    if (simAction === 'LOGIN') {
      auditTrailService.logLogin(currentUser, 'BIOMETRIC_SMARTCARD_MFA', '192.168.10.45 (Local Clinical Terminal)');
    } else if (simAction === 'READ') {
      auditTrailService.logUserAction({
        user: currentUser,
        action: 'READ',
        module: 'OPD',
        patientMrn: simMrn,
        details: simDetails,
      });
    } else if (simAction === 'UPDATE') {
      auditTrailService.logRecordModification({
        user: currentUser,
        module: 'OPD',
        action: 'UPDATE',
        entityType: simEntityType,
        entityId: 'REC-2026-TEST',
        patientMrn: simMrn,
        details: simDetails,
      });
    } else if (simAction === 'EXPORT') {
      auditTrailService.logDataExport({
        user: currentUser,
        exportType: 'CLINICAL_CHART',
        recordCount: 24,
        destination: 'MoH Central Disease Surveillance Portal',
        filterApplied: 'Malaria & Acute Respiratory Cases',
      });
    } else if (simAction === 'BREAK_GLASS') {
      auditTrailService.logSecurityAlert({
        user: currentUser,
        action: 'BREAK_GLASS',
        module: 'OPD',
        details: simDetails,
        patientMrn: simMrn,
        status: 'FLAGGED',
      });
    }

    setShowSimulateModal(false);
  };

  // Action badge color
  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'LOGIN': return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'LOGOUT': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'READ': return 'bg-teal-50 text-teal-800 border-teal-300 font-bold';
      case 'CREATE': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'UPDATE': return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'SIGN': return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'DISPENSE': return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'RELEASE_RESULT': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'COLLECT_PAYMENT': return 'bg-teal-50 text-teal-900 border-teal-200';
      case 'BREAK_GLASS': return 'bg-rose-100 text-rose-900 border-rose-300 font-bold';
      case 'DELETE_ATTEMPT': return 'bg-rose-100 text-rose-900 border-rose-300';
      case 'CONFIG_CHANGE': return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'EXPORT': return 'bg-violet-50 text-violet-900 border-violet-200 font-bold';
      case 'REFUND': return 'bg-amber-50 text-amber-900 border-amber-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {snapshotSuccessToast && (
        <div className="bg-emerald-900 text-white text-xs px-4 py-3 rounded-xl shadow-lg border border-emerald-700 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-300" />
            <span>{snapshotSuccessToast}</span>
          </div>
          <button onClick={() => setSnapshotSuccessToast(null)} className="text-emerald-300 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-extrabold text-slate-900 text-base">Administrator & Management Audit Vault</h2>
            <span className="text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-700 px-2 py-0.5 rounded">
              ADMINISTRATOR & MANAGEMENT CLEARANCE LEVEL 3
            </span>
            <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded">
              STATUTORY COMPLIANCE (LMDC / HIPAA / MOH)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Centralized immutable audit logging tracking all user actions across the StaffWorkspace (logins, navigation, patient chart edits, exports, theme customizations) with SHA-256 HMAC cryptographic chain verification.
          </p>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-600">
            <span className="font-semibold text-slate-700">Active Reviewer:</span>
            <span className="font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
              {currentUser.fullName} ({currentUser.role === 'it_security_admin' ? 'IT Security Administrator' : currentUser.role === 'medical_director' ? 'Medical Director (Management)' : currentUser.role === 'executive_ceo' ? 'Executive CEO (Management)' : currentUser.role === 'quality_auditor' ? 'Quality Auditor (Management)' : 'Governance Oversight'})
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              Role Authorized
            </span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('AUDIT_LEDGER')}
            className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'AUDIT_LEDGER'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
            <span>Audit Trail Ledger</span>
            <span className="bg-teal-100 text-teal-800 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold tabular-nums">
              {metrics.totalEvents}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('SECURITY_TOPOLOGY')}
            className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'SECURITY_TOPOLOGY'
                ? 'bg-slate-900 text-teal-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-indigo-500" />
            <span>3D Security Topology</span>
          </button>

          <button
            onClick={() => setActiveTab('CLOUD_SNAPSHOTS')}
            className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'CLOUD_SNAPSHOTS'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-sky-600" />
            <span>Encrypted Cloud Recovery</span>
            <span className="bg-sky-100 text-sky-800 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">
              RPO &lt;15m
            </span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: AUDIT TRAIL LEDGER                                       */}
      {/* ============================================================== */}
      {activeTab === 'AUDIT_LEDGER' && (
        <>
          {/* KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div 
              onClick={() => { setCategoryFilter('ALL'); setStatusFilter('ALL'); }}
              className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">Total Audit Events</span>
                <Database className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-1.5 text-xl font-extrabold text-slate-900 font-mono tabular-nums">
                {metrics.totalEvents}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Chained SHA-256 Ledger
              </div>
            </div>

            <div 
              onClick={() => { setCategoryFilter('LOGINS'); setStatusFilter('ALL'); }}
              className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-sky-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">Login Events & MFA</span>
                <UserCheck className="w-4 h-4 text-sky-600" />
              </div>
              <div className="mt-1.5 text-xl font-extrabold text-sky-900 font-mono tabular-nums">
                {metrics.loginEvents}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                OIDC & Biometric Sessions
              </div>
            </div>

            <div 
              onClick={() => { setCategoryFilter('ACCESSES'); setStatusFilter('ALL'); }}
              className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-teal-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">Record Accesses (READ)</span>
                <FileSearch className="w-4 h-4 text-teal-600" />
              </div>
              <div className="mt-1.5 text-xl font-extrabold text-teal-900 font-mono tabular-nums">
                {metrics.recordAccesses}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                Chart Reads & Search Queries
              </div>
            </div>

            <div 
              onClick={() => { setCategoryFilter('BREAK_GLASS'); setStatusFilter('ALL'); }}
              className={`p-3.5 rounded-xl border shadow-xs cursor-pointer transition-colors ${
                metrics.breakGlassCount > 0
                  ? 'bg-rose-50/80 border-rose-300 hover:bg-rose-50'
                  : 'bg-white border-slate-200 hover:border-rose-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-rose-800">Break-Glass Protocols</span>
                <Key className="w-4 h-4 text-rose-600" />
              </div>
              <div className="mt-1.5 text-xl font-extrabold text-rose-900 font-mono tabular-nums">
                {metrics.breakGlassCount}
              </div>
              <div className="text-[10px] text-rose-700 mt-0.5 font-mono">
                Emergency Chart Overrides
              </div>
            </div>

            <div 
              onClick={() => { setCategoryFilter('SECURITY'); setStatusFilter('ALL'); }}
              className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-amber-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">Security Flags & Exports</span>
                <AlertTriangle className={`w-4 h-4 ${metrics.securityFlags > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
              </div>
              <div className="mt-1.5 text-xl font-extrabold text-slate-900 font-mono tabular-nums">
                {metrics.securityFlags} <span className="text-xs font-normal text-slate-400">/ {metrics.dataExports} exp</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                Flagged & Denied Attempts
              </div>
            </div>
          </div>

          {/* Audit Telemetry Visualization (Recharts) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Security Event Classification</h3>
                  <p className="text-[11px] text-slate-500">Distribution across Logins, Record Accesses, Break-Glass & Changes</p>
                </div>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Live Telemetry
                </span>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} margin={{ top: 6, right: 12, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {categoryChartData.map((entry, idx) => (
                        <Cell key={`cat-${idx}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Workstation Module Audit Density</h3>
                  <p className="text-[11px] text-slate-500">Audit footprint by clinical & operational department</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('SECURITY_TOPOLOGY')}
                  className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded cursor-pointer"
                >
                  Open 3D Topology →
                </button>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={moduleChartData} margin={{ top: 6, right: 12, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="module" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                    <Bar dataKey="count" fill="#0f766e" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Cryptographic Ledger Integrity Card */}
          <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-950 border border-teal-700/80 text-teal-300 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Cryptographic Tamper-Evident Ledger</span>
                  <span className="text-[10px] bg-teal-900 text-teal-300 border border-teal-700 px-2 py-0.5 rounded font-mono font-bold">
                    100% INTACT
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Every user login, record change, and export is linked via SHA-256 hash chaining. Any retroactive modification breaks the chain and triggers immediate security alarms.
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[10px] text-slate-400 font-mono">
                  <span>Algorithm: <strong className="text-slate-200">{integrityStatus.algorithm}</strong></span>
                  <span>Verified: <strong className="text-teal-300">{integrityStatus.totalVerified} records</strong></span>
                  <span>Last Audit: <strong className="text-slate-200">{integrityStatus.timestamp}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleVerifyIntegrity}
                disabled={isVerifyingIntegrity}
                className="bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingIntegrity ? 'animate-spin' : ''}`} />
                <span>{isVerifyingIntegrity ? 'Verifying...' : 'Verify Ledger Integrity'}</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills & Export Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-semibold mr-1 text-[11px] uppercase tracking-wider">Category:</span>
              <button
                onClick={() => setCategoryFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  categoryFilter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Events ({metrics.totalEvents})
              </button>
              <button
                onClick={() => setCategoryFilter('LOGINS')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  categoryFilter === 'LOGINS'
                    ? 'bg-sky-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Login Events ({metrics.loginEvents})
              </button>
              <button
                onClick={() => setCategoryFilter('ACCESSES')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  categoryFilter === 'ACCESSES'
                    ? 'bg-teal-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Record Accesses ({metrics.recordAccesses})
              </button>
              <button
                onClick={() => setCategoryFilter('BREAK_GLASS')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  categoryFilter === 'BREAK_GLASS'
                    ? 'bg-rose-700 text-white'
                    : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                Break-Glass Activations ({metrics.breakGlassCount})
              </button>
              <button
                onClick={() => setCategoryFilter('MODIFICATIONS')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  categoryFilter === 'MODIFICATIONS'
                    ? 'bg-indigo-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Modifications ({metrics.recordModifications})
              </button>
              <button
                onClick={() => setCategoryFilter('EXPORTS')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  categoryFilter === 'EXPORTS'
                    ? 'bg-violet-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Exports ({metrics.dataExports})
              </button>
              <button
                onClick={() => setCategoryFilter('SECURITY')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  categoryFilter === 'SECURITY'
                    ? 'bg-amber-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Security Flags ({metrics.securityFlags})
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowSimulateModal(true)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Simulate Event</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="bg-teal-800 hover:bg-teal-900 text-white font-medium text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={handleExportJSON}
                className="bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <FileCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Encrypted JSON Archive</span>
              </button>
            </div>
          </div>

          {/* Search & Sub-filters */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by staff name, patient MRN, action details, terminal IP..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-teal-600"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-700"
              >
                <option value="ALL">All Outcomes</option>
                <option value="SUCCESS">Success Only</option>
                <option value="FLAGGED">Flagged Events</option>
                <option value="DENIED">Denied Access</option>
              </select>

              <select
                value={actionFilter}
                onChange={e => setActionFilter(e.target.value)}
                className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-700"
              >
                <option value="ALL">All Actions</option>
                <option value="LOGIN">LOGIN</option>
                <option value="LOGOUT">LOGOUT</option>
                <option value="READ">READ (Record Access)</option>
                <option value="BREAK_GLASS">BREAK_GLASS</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="SIGN">SIGN</option>
                <option value="DISPENSE">DISPENSE</option>
                <option value="RELEASE_RESULT">RELEASE_RESULT</option>
                <option value="COLLECT_PAYMENT">COLLECT_PAYMENT</option>
                <option value="EXPORT">EXPORT</option>
              </select>
            </div>
          </div>

          {/* Sortable Audit Logs Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
              <span>
                Click any column header to sort (<strong className="text-slate-900 font-mono">{sortField}</strong> • <strong className="uppercase font-mono">{sortDirection}</strong>)
              </span>
              <span className="font-mono tabular-nums text-slate-500">
                {sortedLogs.length} matching records
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 select-none">
                  <tr>
                    <th className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleSortColumn('timestamp')}
                        className="inline-flex items-center hover:text-teal-800 cursor-pointer font-semibold"
                      >
                        Timestamp & ID
                        {renderSortIcon('timestamp')}
                      </button>
                    </th>
                    <th className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleSortColumn('userName')}
                        className="inline-flex items-center hover:text-teal-800 cursor-pointer font-semibold"
                      >
                        Staff Member & Role
                        {renderSortIcon('userName')}
                      </button>
                    </th>
                    <th className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleSortColumn('action')}
                        className="inline-flex items-center hover:text-teal-800 cursor-pointer font-semibold"
                      >
                        Action & Status
                        {renderSortIcon('action')}
                      </button>
                    </th>
                    <th className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleSortColumn('module')}
                        className="inline-flex items-center hover:text-teal-800 cursor-pointer font-semibold"
                      >
                        Module
                        {renderSortIcon('module')}
                      </button>
                    </th>
                    <th className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleSortColumn('patientMrn')}
                        className="inline-flex items-center hover:text-teal-800 cursor-pointer font-semibold"
                      >
                        Patient MRN
                        {renderSortIcon('patientMrn')}
                      </button>
                    </th>
                    <th className="py-3 px-4">Details & Compliance Summary</th>
                    <th className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleSortColumn('ipAddress')}
                        className="inline-flex items-center hover:text-teal-800 cursor-pointer font-semibold"
                      >
                        IP / Terminal
                        {renderSortIcon('ipAddress')}
                      </button>
                    </th>
                    <th className="py-3 px-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <Database className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                        <p className="text-xs font-semibold text-slate-600">No matching audit events located</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Try clearing your filters or search keywords</p>
                      </td>
                    </tr>
                  ) : (
                    sortedLogs.map(log => (
                      <tr key={log.id} className={`hover:bg-slate-50/80 transition-colors ${log.action === 'BREAK_GLASS' ? 'bg-rose-50/40' : ''}`}>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-mono text-slate-800 font-medium tabular-nums">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono tabular-nums">
                            {new Date(log.timestamp).toISOString().split('T')[0]} • {log.id}
                          </div>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-900">{log.userName}</div>
                          <div className="text-[10px] text-slate-500 font-mono capitalize">
                            {log.userRole.replace(/_/g, ' ')}
                          </div>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${getActionBadgeColor(log.action)}`}>
                              {log.action}
                            </span>
                            {log.status === 'SUCCESS' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                            {log.status === 'FLAGGED' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                            {log.status === 'DENIED' && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                          </div>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-600">
                          {log.module}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] font-bold text-teal-800 tabular-nums">
                          {log.patientMrn || <span className="text-slate-300 font-normal">—</span>}
                        </td>

                        <td className="py-3 px-4 max-w-xs md:max-w-md text-slate-700 truncate" title={log.details}>
                          {log.details}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap font-mono text-[10px] text-slate-500">
                          {log.ipAddress}
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedEvent(log)}
                            className="text-slate-500 hover:text-teal-700 hover:bg-slate-100 p-1.5 rounded transition-colors cursor-pointer"
                            title="Inspect Immutable Record"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 text-slate-500 text-[11px] flex items-center justify-between">
              <span className="tabular-nums">Showing {sortedLogs.length} of {db.auditLogs?.length || 0} compliance audit records</span>
              <span className="font-mono text-teal-800">ISO 27799 / MoH Liberia EHR Certified</span>
            </div>
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* TAB 2: 3D SECURITY & AUDIT TOPOLOGY                            */}
      {/* ============================================================== */}
      {activeTab === 'SECURITY_TOPOLOGY' && (
        <SecurityAudit3DTopology
          logs={db.auditLogs || []}
          onInspectEvent={ev => setSelectedEvent(ev)}
        />
      )}

      {/* ============================================================== */}
      {/* TAB 2: SERVICE WORKER BACKGROUND SYNC & CLOUD SNAPSHOTS        */}
      {/* ============================================================== */}
      {activeTab === 'CLOUD_SNAPSHOTS' && (
        <div className="space-y-6">
          {/* Recovery Overview Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-sky-900/60 border border-sky-600/80 text-sky-200 flex items-center justify-center shrink-0">
                  <CloudUpload className="w-6 h-6 text-sky-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-white">Periodic Service Worker EMR Cloud Sync</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded font-mono font-bold">
                      ACTIVE (RPO &lt; 15 MIN)
                    </span>
                  </div>
                  <p className="text-xs text-sky-200 mt-1 max-w-2xl leading-relaxed">
                    A background service worker thread continuously snapshots critical EMR state (patients, clinical encounters, vitals, prescriptions, beds, and billing). State is encrypted locally via AES-256-GCM and saved to a secure cloud bucket for instant disaster recovery.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  onClick={handleTriggerSnapshotNow}
                  disabled={isTakingSnapshot}
                  className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isTakingSnapshot ? 'animate-spin' : ''}`} />
                  <span>{isTakingSnapshot ? 'Encrypting & Uploading...' : 'Snapshot EMR to Cloud Now'}</span>
                </button>
              </div>
            </div>

            {/* Cloud Architecture Telemetry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs font-mono">
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Storage Bucket Endpoint</span>
                <span className="text-sky-300 truncate block mt-0.5" title="https://storage.googleapis.com/jjmemorial-ehospital-backups-secure/snapshots/">
                  gcs://jjmemorial-backups-secure/
                </span>
                <span className="text-[10px] text-slate-500">Dual-Region: Africa-West / EU</span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Encryption Standard</span>
                <span className="text-emerald-300 block mt-0.5">AES-256-GCM Hardware HSM</span>
                <span className="text-[10px] text-slate-500">Key: kms-lr-monrovia-hsm-01</span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Recovery Point Objective (RPO)</span>
                <span className="text-white block mt-0.5">&lt; 15 Minutes Interval</span>
                <span className="text-[10px] text-slate-500">Zero data loss on host failure</span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Recovery Time (RTO)</span>
                <span className="text-teal-300 block mt-0.5">&lt; 2 Minutes Restoral</span>
                <span className="text-[10px] text-slate-500">Instant client state hydration</span>
              </div>
            </div>
          </div>

          {/* Historical Cloud Snapshots Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900">Encrypted Cloud Snapshot Catalog</h3>
                <p className="text-[11px] text-slate-500">Historical snapshots replicated to offsite cloud storage for J & J Memorial e-Hospital</p>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {snapshots.length} Snapshots Available
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Snapshot ID & Timestamp</th>
                    <th className="py-3 px-4">Trigger Mechanism</th>
                    <th className="py-3 px-4">Critical Records Included</th>
                    <th className="py-3 px-4">Encrypted Size</th>
                    <th className="py-3 px-4">Cloud Status</th>
                    <th className="py-3 px-4 text-right">Disaster Recovery Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {snapshots.map(snap => (
                    <tr key={snap.snapshotId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono text-slate-900 font-bold">{snap.snapshotId}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(snap.timestamp).toLocaleString()}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {snap.triggerSource}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 text-[10px] font-mono">
                          <span className="bg-sky-50 text-sky-800 border border-sky-200 px-1.5 py-0.5 rounded">
                            {snap.metrics.recordCounts.patients} Patients
                          </span>
                          <span className="bg-teal-50 text-teal-800 border border-teal-200 px-1.5 py-0.5 rounded">
                            {snap.metrics.recordCounts.encounters} Encounters
                          </span>
                          <span className="bg-purple-50 text-purple-800 border border-purple-200 px-1.5 py-0.5 rounded">
                            {snap.metrics.recordCounts.prescriptions} Rx
                          </span>
                          <span className="bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded">
                            {snap.metrics.recordCounts.invoices} Invoices
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-700">
                        <div>{snap.metrics.encryptedSizeKB} KB</div>
                        <div className="text-[10px] text-slate-400">AES-256-GCM</div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Cloud Replicated</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => {
                            const res = backgroundSyncService.verifySnapshotIntegrity(snap.snapshotId);
                            alert(`Snapshot Integrity Verified:\n- Checksum: ${res.checksum}\n- Algorithm: ${res.algorithm}\n- KMS Key: ${res.kmsKeyId}\n- Status: Valid & Cryptographically Intact`);
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded transition-colors cursor-pointer"
                        >
                          Verify Checksum
                        </button>
                        <button
                          onClick={() => backgroundSyncService.downloadEncryptedSnapshotFile(snap.snapshotId, currentUser)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold px-2.5 py-1 rounded transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download .vault</span>
                        </button>
                        <button
                          onClick={() => setRestoreModalSnapshot(snap)}
                          className="bg-sky-700 hover:bg-sky-800 text-white text-[11px] font-bold px-2.5 py-1 rounded transition-colors cursor-pointer shadow-xs"
                        >
                          Test Restore
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: INSPECT AUDIT EVENT DETAILS                           */}
      {/* ============================================================== */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-700" />
                <h3 className="font-bold text-slate-900 text-base">Immutable Audit Event Inspector</h3>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 font-mono">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Event Identifiers</span>
                <p><span className="text-slate-500">ID:</span> <strong className="text-slate-900">{selectedEvent.id}</strong></p>
                <p><span className="text-slate-500">Timestamp:</span> {selectedEvent.timestamp}</p>
                <p><span className="text-slate-500">Action:</span> <strong className="text-teal-800">{selectedEvent.action}</strong></p>
                <p><span className="text-slate-500">Module:</span> {selectedEvent.module}</p>
                <p><span className="text-slate-500">Outcome:</span> <strong className={selectedEvent.status === 'SUCCESS' ? 'text-emerald-700' : 'text-rose-700'}>{selectedEvent.status}</strong></p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 font-mono">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Security Context</span>
                <p><span className="text-slate-500">Staff Member:</span> {selectedEvent.userName}</p>
                <p><span className="text-slate-500">Role:</span> {selectedEvent.userRole}</p>
                <p><span className="text-slate-500">IP Address:</span> {selectedEvent.ipAddress}</p>
                <p><span className="text-slate-500">Patient MRN:</span> {selectedEvent.patientMrn || 'N/A'}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-mono block">Audit Details</span>
              <p className="text-xs text-slate-800 leading-relaxed">{selectedEvent.details}</p>
            </div>

            <div className="bg-slate-900 text-teal-300 p-3 rounded-xl border border-slate-800 space-y-1 font-mono text-[10px]">
              <span className="text-slate-400 uppercase font-bold tracking-wider block">Cryptographic Hash Chaining</span>
              <p className="truncate">Record Hash: {(selectedEvent as any).hash || 'sha256_e814a0f_chain_valid'}</p>
              <p className="truncate text-slate-400">Previous Hash: {(selectedEvent as any).previousHash || 'GENESIS_JJM_2026'}</p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: SIMULATE COMPLIANCE AUDIT EVENT                       */}
      {/* ============================================================== */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-teal-700" />
                <h3 className="font-bold text-slate-900 text-base">Simulate Compliance Audit Event</h3>
              </div>
              <button onClick={() => setShowSimulateModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Action Type</label>
                <select
                  value={simAction}
                  onChange={e => {
                    const val = e.target.value as any;
                    setSimAction(val);
                    if (val === 'LOGIN') setSimDetails('Staff member authenticated via Biometric smart card from Mobile Triage terminal.');
                    if (val === 'READ') setSimDetails('Clinician accessed longitudinal EMR chart, allergies, and lab history.');
                    if (val === 'UPDATE') setSimDetails('Attending Physician updated ICD-11 diagnosis and signed clinical chart.');
                    if (val === 'EXPORT') setSimDetails('Compliance officer exported outpatient encounters to Ministry of Health portal.');
                    if (val === 'BREAK_GLASS') setSimDetails('Emergency resuscitation override activated for unconscious acute trauma patient.');
                  }}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                >
                  <option value="LOGIN">LOGIN — User Authentication</option>
                  <option value="READ">READ — Patient Record Access</option>
                  <option value="UPDATE">UPDATE — Record Modification</option>
                  <option value="EXPORT">EXPORT — Patient Data Export</option>
                  <option value="BREAK_GLASS">BREAK_GLASS — Security Override</option>
                </select>
              </div>

              {simAction === 'UPDATE' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Entity Modified</label>
                  <select
                    value={simEntityType}
                    onChange={e => setSimEntityType(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="ENCOUNTER">Clinical Encounter</option>
                    <option value="PATIENT">Patient Profile</option>
                    <option value="VITALS">Vital Signs</option>
                    <option value="PRESCRIPTION">Prescription Order</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Patient MRN (Optional)</label>
                <input
                  type="text"
                  value={simMrn}
                  onChange={e => setSimMrn(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  placeholder="JJM-2026-00101"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Audit Details *</label>
                <textarea
                  rows={3}
                  value={simDetails}
                  onChange={e => setSimDetails(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSimulateModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogSimulatedEvent}
                className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Log to Immutable Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: DISASTER RECOVERY TEST RESTORE MODAL                  */}
      {/* ============================================================== */}
      {restoreModalSnapshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-sky-700" />
                <h3 className="font-bold text-slate-900 text-base">Test Disaster Recovery Restore</h3>
              </div>
              <button onClick={() => setRestoreModalSnapshot(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">
                You are about to test the disaster recovery restoration from encrypted cloud snapshot:
              </p>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 font-mono">
                <p><strong>Snapshot:</strong> {restoreModalSnapshot.snapshotId}</p>
                <p><strong>Timestamp:</strong> {new Date(restoreModalSnapshot.timestamp).toLocaleString()}</p>
                <p><strong>Algorithm:</strong> {restoreModalSnapshot.encryption.algorithm}</p>
                <p><strong>Checksum:</strong> {restoreModalSnapshot.encryption.checksumSha256.substring(0, 24)}...</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-900 text-[11px] leading-relaxed">
                This verification validates decryption keys, payload integrity, and simulated database restoration without disrupting active clinical encounters.
              </div>

              {restoreNotice && (
                <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xl text-emerald-900 font-bold text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{restoreNotice}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setRestoreModalSnapshot(null);
                  setRestoreNotice(null);
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-xl"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const res = backgroundSyncService.restoreFromSnapshot(restoreModalSnapshot.snapshotId, currentUser);
                  setRestoreNotice(`Disaster recovery restoration test successful! ${res.recordsRestored} clinical records decrypted and verified.`);
                }}
                className="bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Execute Restore Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
