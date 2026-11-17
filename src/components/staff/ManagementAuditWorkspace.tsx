import React, { useEffect, useMemo, useState } from 'react';
import { Activity, AlertCircle, ArrowDown, ArrowUp, BarChart3, BedDouble, Bell, BriefcaseBusiness, CalendarDays, CheckCircle2, Cloud, CreditCard, Database, Download, Droplet, FileCheck2, HeartPulse, KeyRound, LayoutDashboard, LockKeyhole, MessageSquare, Microscope, Network, Pill, RefreshCw, ScanLine, Search, ShieldCheck, Stethoscope, Truck, Users, Wallet, Wrench, Cpu, BookOpen, LogOut } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type AuditEvent = { id: string; occurredAt: string; actor: string; currentRole: string | null; action: string; outcome: string; category: string; module: string; source: string; patientReference: string | null };
type AuditData = { total: number; logins: number; accesses: number; registrations: number; exports: number; denied: number; modules: {name: string; value: number}[]; events: AuditEvent[] };
type Checkpoint = {status: 'verified' | 'failed' | 'mismatch' | 'overdue' | 'not_configured'; checkedAt?: string; headId?: string};
const date = new Intl.DateTimeFormat('en-GB', {dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Monrovia'});
const time = new Intl.DateTimeFormat('en-GB', {hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Africa/Monrovia'});
const card = 'rounded-2xl border border-slate-200 bg-white shadow-sm';
const primary = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-teal-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-900 disabled:cursor-wait disabled:opacity-60';
const secondary = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60';
const categories = [ ['all','All events'], ['login','Login attempts'], ['access','Record accesses'], ['registration','Registrations'], ['export','Exports'], ['denied','Denied attempts'] ] as const;
const actionName = (action: string) => ({staff_login: 'Staff sign-in', security_ledger_export: 'Security ledger export', audit_events_export: 'Audit metadata export', registered: 'Patient registered', viewed: 'Patient record viewed'})[action] ?? action.replaceAll('_',' ');

async function api<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch('/api/registry' + path, body === undefined ? {credentials:'same-origin'} : {method:'POST', credentials:'same-origin', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)});
  if (!response.ok) throw new Error('Request failed (' + response.status + ').');
  return response.json();
}

const navigation = [
  ['Internal Staff Comms', MessageSquare], ['Executive Intelligence (BI)', BarChart3], ['Command Center & HMIS', Activity],
  ['Clinical Charts (OPD EMR)', Stethoscope], ['Triage & Nursing Vitals', HeartPulse], ['Inpatient Wards & Beds (ADT)', BedDouble],
  ['Diagnostic Laboratory (LIS)', Microscope], ['Blood Bank & Transfusion', Droplet], ['Radiology & Imaging (PACS)', ScanLine],
  ['Equipment & Resources', Cpu], ['Pharmacy & Drug Dispense', Pill], ['Insurance Verification', CreditCard],
  ['Billing & Invoicing', Wallet], ['General Ledger & Accounts', BookOpen], ['Inventory & Procurement', Truck],
  ['HR, Staff & Payroll', BriefcaseBusiness], ['Staff Scheduling & Rosters', CalendarDays], ['Biomedical & Facilities', Wrench],
  ['Quality & Safety Incidents', AlertCircle],
] as const;

export default function ManagementAuditWorkspace({username, section, onSection, onSignOut, signingOut, overview,notice}: {
  username: string; section: string; onSection: (section:string)=>void; onSignOut: ()=>void; signingOut:boolean; overview:React.ReactNode;notice:string;
}) {
  const [total, setTotal] = useState<number | null>(null);
  const audit = section === 'audit';
  const name = username.split('.').map(word => word.charAt(0).toUpperCase()+word.slice(1)).join(' ');
  return <main className="min-h-screen bg-[#f4f5ff] font-sans text-slate-900">
    <div className="flex min-h-10 flex-wrap items-center justify-between gap-2 border-t-2 border-violet-600 bg-slate-950 px-5 py-2 text-xs text-indigo-100">
      <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-indigo-400"/><strong className="tracking-wide text-white">AUDIT &amp; COMPLIANCE</strong><span className="hidden sm:inline">Recorded server events {total === null ? '—' : total.toLocaleString()}</span><span className="rounded border border-indigo-700 px-2 py-0.5 text-indigo-200">STAGING · SYNTHETIC DATA</span></div>
      <div className="flex items-center gap-3"><a href="/" className="hover:underline">J &amp; J Memorial homepage</a><button onClick={()=>onSection('audit')} className="rounded bg-violet-600 px-3 py-1 font-semibold text-white hover:bg-violet-500">Open Audit Vault</button></div>
    </div>
    <div className="mx-auto grid max-w-[1800px] items-start gap-5 p-4 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-7 lg:p-6">
      <aside className="space-y-4 lg:sticky lg:top-5">
        <nav aria-label="Management workstations" className="rounded-2xl border-2 border-indigo-300 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between border-b border-indigo-200 pb-3 text-xs font-bold"><span>WORKSTATIONS</span><span className="rounded border border-indigo-200 bg-indigo-50 px-2 py-0.5 font-mono text-indigo-700">19</span></div>
          <details className="lg:hidden"><summary className="cursor-pointer py-2 text-sm font-semibold text-indigo-800">Browse workstation modules</summary><ModuleLinks /></details>
          <div className="hidden lg:block"><ModuleLinks /></div>
          <button onClick={()=>onSection('overview')} aria-current={!audit?'page':undefined} className={'mt-3 flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm '+(!audit?'bg-indigo-50 font-semibold text-indigo-900':'text-slate-600 hover:bg-slate-50')}><LayoutDashboard size={18}/>Management overview</button>
          <div className="mt-4 border-t border-indigo-200 pt-3"><div className="mb-2 flex items-center justify-between text-[11px] font-bold text-indigo-800"><span className="flex items-center gap-2"><ShieldCheck size={15}/>AUDIT &amp; COMPLIANCE</span><span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[9px]">MANAGEMENT</span></div>
            <button onClick={()=>onSection('audit')} aria-current={audit?'page':undefined} className={'flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left text-sm font-semibold '+(audit?'bg-violet-600 text-white shadow-sm':'bg-violet-50 text-violet-800 hover:bg-violet-100')}><ShieldCheck size={18}/><span className="flex-1">Audit Trail &amp; Compliance</span><span className={'rounded px-1.5 py-0.5 font-mono text-xs '+(audit?'bg-violet-950':'bg-white')}>{total === null?'—':total.toLocaleString()}</span></button>
          </div>
        </nav>
        <div className={card+' hidden p-4 text-xs lg:block'}><div className="mb-3 flex items-center gap-2 border-b border-indigo-100 pb-3 font-bold"><Database size={16} className="text-violet-600"/>Audit data sources</div><dl className="space-y-3"><div className="flex justify-between"><dt>Staff security events</dt><dd className="text-teal-700">Server recorded</dd></div><div className="flex justify-between"><dt>Registry audit</dt><dd className="text-teal-700">Server recorded</dd></div><div className="flex justify-between"><dt>R2 checkpoint checks</dt><dd className="font-mono">Every 15 min</dd></div></dl><p className="mt-4 border-t border-slate-100 pt-3 leading-5 text-slate-500">Unavailable modules are shown for structure. They do not grant access or contain demo records.</p></div>
        <div className="hidden rounded-2xl border border-slate-800 bg-slate-900 p-4 text-xs text-slate-300 lg:block"><h3 className="mb-3 font-bold text-white">Service availability</h3><dl className="space-y-3"><div className="flex justify-between"><dt>Facility telemetry</dt><dd>Not connected</dd></div><div className="flex justify-between"><dt>Offline audit cache</dt><dd>Not enabled</dd></div></dl></div>
      </aside>
      <div className="min-w-0 space-y-6">
        <header className={card+' flex flex-wrap items-center justify-between gap-5 px-6 py-6 lg:px-7'}>
          <div className="flex items-center gap-4"><div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-teal-900 text-teal-300"><ShieldCheck size={29}/></div><div><div className="flex flex-wrap items-center gap-3"><h1 className="text-xl font-extrabold tracking-tight">{name}</h1><span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">Management Workstation &amp; Analytics</span></div><p className="mt-2 text-sm text-slate-500">{username} <span className="px-1">·</span> Role: <span className="font-mono font-semibold text-slate-700">management</span></p></div></div>
          <div className="flex flex-wrap items-center gap-3"><span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-800"><LockKeyhole size={15}/>Read-only operational access</span><button disabled={signingOut} onClick={onSignOut} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Sign out"><LogOut size={18}/></button></div>
        </header>
        {notice&&<p role="status" className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-900">{notice}</p>}
        {audit ? <AuditVault username={username} name={name} onTotal={setTotal}/> : overview}
      </div>
    </div>
  </main>;
}

function ModuleLinks() {
  return <div className="space-y-0.5">{navigation.map(([label,Icon])=><button key={label} disabled title="Not available in the live Management role" className="flex min-h-10 w-full cursor-not-allowed items-center gap-3 rounded-lg px-2 py-2 text-left text-[13px] text-slate-500"><Icon size={19} className="shrink-0 text-violet-600"/>{label}</button>)}</div>;
}

function AuditVault({username,name,onTotal}:{username:string;name:string;onTotal:(total:number)=>void}) {
  const [data,setData]=useState<AuditData|null>(null);
  const [checkpoint,setCheckpoint]=useState<Checkpoint|null>(null);
  const [checkpointError,setCheckpointError]=useState(false);
  const [loadError,setLoadError]=useState(false);
  const [category,setCategory]=useState('all');
  const [query,setQuery]=useState('');
  const [outcome,setOutcome]=useState('all');
  const [action,setAction]=useState('all');
  const [sort,setSort]=useState<{field:keyof AuditEvent;ascending:boolean}>({field:'occurredAt',ascending:false});
  const [page,setPage]=useState(0);
  const [busy,setBusy]=useState(false);
  const [verification,setVerification]=useState<{entries:number;failures:number;at:string}|null>(null);
  const [message,setMessage]=useState('');
  useEffect(()=>{
    let active=true;
    api<AuditData>('/workspace/audit-events').then(value=>{if(active){setData(value);onTotal(value.total);}}).catch(()=>{if(active)setLoadError(true);});
    const refresh=()=>api<Checkpoint>('/workspace/security-ledger/checkpoint').then(value=>{if(active){setCheckpoint(value);setCheckpointError(false);}}).catch(()=>{if(active)setCheckpointError(true);});
    void refresh();const timer=window.setInterval(()=>void refresh(),60000);
    return()=>{active=false;window.clearInterval(timer);};
  },[onTotal]);
  const filtered=useMemo(()=>{
    const text=query.trim().toLowerCase();
    return (data?.events??[]).filter(event=>(category==='all'||(category==='denied'?event.outcome==='denied':event.category===category))&&(outcome==='all'||event.outcome===outcome)&&(action==='all'||event.action===action)&&(!text||[event.actor,event.id,event.action,actionName(event.action),event.module,event.patientReference??''].some(value=>value.toLowerCase().includes(text)))).sort((a,b)=>String(a[sort.field]??'').localeCompare(String(b[sort.field]??''))*(sort.ascending?1:-1));
  },[data,category,query,outcome,action,sort]);
  useEffect(()=>setPage(0),[category,query,outcome,action]);
  const pageCount=Math.max(1,Math.ceil(filtered.length/12));
  const currentPage=Math.min(page,pageCount-1);
  const displayed=filtered.slice(currentPage*12,currentPage*12+12);
  async function verify(){
    setBusy(true);setMessage('');
    try{const result=await api<{entries:number;failures:number}>('/workspace/security-ledger/verify',{});setVerification({...result,at:new Date().toISOString()});setMessage(result.failures?'Verification found inconsistent security-ledger entries.':'Security-ledger verification completed.');
      try{setCheckpoint(await api<Checkpoint>('/workspace/security-ledger/checkpoint'));setCheckpointError(false);}catch{setCheckpointError(true);}
    }catch{setMessage('Verification unavailable. Please retry.');}finally{setBusy(false);}
  }
  async function exportEvents(format:'csv'|'json'){
    setBusy(true);setMessage('');
    try{
      const result=await api<{events:AuditEvent[];generatedAt:string;scope:string}>('/workspace/audit-events/export',{format});
      const columns: (keyof AuditEvent)[]=['id','occurredAt','actor','currentRole','action','outcome','module','patientReference','source'];
      const csv=(value:unknown)=>{let text=String(value??'');if(/^[=+\-@\t\r]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"';};
      const contents=format==='json'?JSON.stringify(result,null,2):[columns.join(','),...result.events.map(event=>columns.map(column=>csv(event[column])).join(','))].join('\r\n');
      const url=URL.createObjectURL(new Blob([contents],{type:format==='csv'?'text/csv;charset=utf-8':'application/json'}));
      const link=document.createElement('a');link.href=url;link.download='jj-memorial-staging-audit.'+format;link.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
      setMessage('Export generated: '+result.events.length+' events. This export is recorded in the security ledger.');
      const refreshed=await api<AuditData>('/workspace/audit-events');setData(refreshed);onTotal(refreshed.total);
    }catch{setMessage('Export unavailable. Exports are limited to 10,000 events; please contact an administrator if the limit is reached.');}finally{setBusy(false);}
  }
  const classification=data?[{name:'Login attempts',value:data.logins,color:'#3b82c4'},{name:'Record access',value:data.accesses,color:'#2f8f83'},{name:'Registrations',value:data.registrations,color:'#d18b28'},{name:'Exports',value:data.exports,color:'#7c3aed'}]:[];
  const stats=[{label:'Total Audit Events',value:data?.total,Icon:Database,color:'text-slate-900',detail:'Security + operational audit'}, {label:'Staff Login Attempts',value:data?.logins,Icon:Users,color:'text-sky-800',detail:'Access-key sign-ins; includes denied'}, {label:'Record Accesses (READ)',value:data?.accesses,Icon:FileCheck2,color:'text-teal-800',detail:'Recorded registry chart lookups'}, {label:'Emergency Access',value:undefined,Icon:KeyRound,color:'text-rose-700',detail:'Workflow not implemented'}, {label:'Denied Attempts & Exports',value:data?.denied,Icon:AlertCircle,color:'text-slate-900',detail:data?data.exports+' recorded exports':'Recorded security events'}];
  const checkpointGood=!checkpointError&&checkpoint?.status==='verified';
  const integrityGood=verification&&verification.failures===0;
  const categoryCount=(id:string)=>!data?'—':id==='all'?data.total:id==='denied'?data.denied:id==='login'?data.logins:id==='access'?data.accesses:id==='registration'?data.registrations:data.exports;
  return <section className="space-y-6" aria-label="Management audit vault">
    <div className={card+' grid items-center gap-5 p-6 xl:grid-cols-[minmax(0,1fr)_19rem]'}>
      <div><h2 className="text-xl font-extrabold tracking-tight">Administrator &amp; Management Audit Vault</h2><div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold"><span className="rounded border border-violet-600 bg-violet-900 px-2 py-1 text-white">MANAGEMENT · AUTHENTICATED ACCESS</span><span className="rounded border border-teal-200 bg-teal-50 px-2 py-1 text-teal-800">SERVER-RECORDED STAGING EVENTS</span></div><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">Review recorded sign-ins, patient-registry activity and audit exports. Security events are hash chained; operational registry events are shown as a separate source.</p><p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">Active reviewer:<strong className="rounded border border-indigo-200 bg-indigo-50 px-2 py-1 text-indigo-800">{name} ({username})</strong><span className="flex items-center gap-1 text-teal-700"><CheckCircle2 size={15}/>Role authorized</span></p></div>
      <div className="rounded-2xl border border-slate-200 bg-slate-100 p-2 text-sm font-semibold"><a href="#audit-events" className="flex min-h-10 items-center gap-2 rounded-xl bg-white px-3 text-teal-900 shadow-sm"><ShieldCheck size={17}/>Audit Trail Ledger<span className="ml-auto rounded bg-teal-100 px-2 font-mono text-xs">{data?.total??'—'}</span></a><div className="flex min-h-10 items-center gap-2 px-3 text-slate-400" title="No security topology backend configured"><Network size={17}/>Security topology<span className="ml-auto text-[10px]">Unavailable</span></div><a href="#ledger-integrity" className="flex min-h-10 items-center gap-2 rounded-lg px-3 text-slate-600 hover:bg-white"><Cloud size={17}/>R2 checkpoint verification</a></div>
    </div>
    {loadError&&<p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">Audit data could not be loaded. Refresh the page to retry.</p>}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{stats.map((stat,index)=><div key={stat.label} className={card+' min-h-32 p-4'}><div className="flex items-start justify-between gap-2"><h3 className={'text-xs font-medium '+(index===3?'text-rose-700':'text-slate-500')}>{stat.label}</h3><stat.Icon size={18} className={index===3?'text-rose-500':'text-slate-400'}/></div><p className={'mt-3 font-mono text-2xl font-bold '+stat.color}>{index===3?<span className="text-base">Unavailable</span>:stat.value===undefined?'—':stat.value.toLocaleString()}</p><p className="mt-2 text-[11px] leading-5 text-slate-500">{stat.detail}</p></div>)}</div>
    <div className="grid gap-5 xl:grid-cols-2">
      <ChartCard title="Security Event Classification" subtitle="Recorded event categories across the available sources" loaded={!!data} empty={data?.total===0}><BarChart data={classification} margin={{top:12,right:8,bottom:8,left:0}}><CartesianGrid strokeDasharray="3 4" vertical={false} stroke="#e2e8f0"/><XAxis dataKey="name" tick={{fontSize:10,fill:'#64748b'}} axisLine={false} tickLine={false} interval={0}/><YAxis allowDecimals={false} tick={{fontSize:11,fill:'#64748b'}} axisLine={false} tickLine={false} width={34}/><Tooltip cursor={{fill:'#f1f5f9'}}/><Bar dataKey="value" name="Events" radius={[7,7,0,0]} maxBarSize={72}>{classification.map(item=><Cell key={item.name} fill={item.color}/>)}</Bar></BarChart></ChartCard>
      <ChartCard title="Workstation Module Audit Density" subtitle="Currently instrumented sources; no inferred department activity" loaded={!!data} empty={data?.total===0}><BarChart data={data?.modules??[]} margin={{top:12,right:8,bottom:8,left:0}}><CartesianGrid strokeDasharray="3 4" vertical={false} stroke="#e2e8f0"/><XAxis dataKey="name" tick={{fontSize:11,fill:'#64748b'}} axisLine={false} tickLine={false}/><YAxis allowDecimals={false} tick={{fontSize:11,fill:'#64748b'}} axisLine={false} tickLine={false} width={34}/><Tooltip cursor={{fill:'#f1f5f9'}}/><Bar dataKey="value" name="Events" fill="#307d75" radius={[7,7,0,0]} maxBarSize={90}/></BarChart></ChartCard>
    </div>
    <div id="ledger-integrity" className="scroll-mt-5 rounded-2xl bg-slate-900 p-5 text-white shadow-sm lg:p-6">
      <div className="flex flex-wrap items-start justify-between gap-5"><div className="flex min-w-0 flex-1 gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-teal-600 bg-teal-950 text-teal-300"><ShieldCheck size={25}/></div><div><div className="flex flex-wrap items-center gap-3"><h3 className="font-bold">Cryptographic Tamper-Evident Ledger</h3><span className={'rounded border px-2 py-1 text-[10px] font-semibold '+(integrityGood?'border-teal-600 bg-teal-900 text-teal-200':'border-slate-600 bg-slate-800 text-slate-300')}>{verification?(verification.failures?'INCONSISTENCIES FOUND':'HASH CHAIN VERIFIED'):'VERIFICATION NOT RUN'}</span></div><p className="mt-2 max-w-3xl text-xs leading-6 text-slate-300">Server security events use SHA-256 hash chaining. Independent R2 checkpoints compare retained history. Registry audit records are not part of this hash chain.</p><p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[10px] text-slate-400"><span>Algorithm: <b className="text-slate-200">SHA-256</b></span><span>Verified security entries: <b className="text-teal-300">{verification?.entries??'—'}</b></span><span>Last manual check: {verification?time.format(new Date(verification.at))+' Monrovia':'Not run'}</span></p></div></div><button disabled={busy} onClick={()=>void verify()} className={primary}><RefreshCw size={16} className={busy?'animate-spin':''}/>Verify Ledger Integrity</button></div>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-700 pt-4 text-xs"><span className={'flex items-center gap-2 font-semibold '+(checkpointGood?'text-teal-300':'text-amber-300')}><Cloud size={16}/>Independent R2 checkpoint: {checkpointError?'Unavailable':!checkpoint?'Loading':({verified:'Verified',failed:'Check failed',mismatch:'Mismatch detected',overdue:'Overdue',not_configured:'Not configured'})[checkpoint.status]}</span>{checkpoint?.checkedAt&&<span className="text-slate-300">Last external check: {date.format(new Date(checkpoint.checkedAt))} · Entry {checkpoint.headId??'—'}</span>}<span className="text-slate-400">Scheduled every 15 minutes</span></div>
      <p className="mt-2 text-[10px] leading-5 text-slate-400">R2 objects are separate from database backups. This is not immutable storage; administrators with access to both systems can alter both.</p>
    </div>
    <div id="audit-events" className={card+' scroll-mt-5 flex flex-wrap items-center justify-between gap-4 p-4'}><div className="flex flex-wrap items-center gap-2"><span className="mr-1 text-[11px] font-medium text-slate-400">CATEGORY:</span>{categories.map(([id,label])=><button key={id} onClick={()=>setCategory(id)} aria-pressed={category===id} className={'min-h-9 rounded-lg px-3 py-2 text-xs font-medium '+(category===id?'bg-slate-900 text-white':id==='denied'?'border border-rose-200 bg-rose-50 text-rose-700':'bg-slate-100 text-slate-600 hover:bg-slate-200')}>{label} ({categoryCount(id)})</button>)}</div><div className="flex flex-wrap gap-2"><button disabled={busy||!data} className={primary} onClick={()=>void exportEvents('csv')}><Download size={15}/>Export CSV</button><button disabled={busy||!data} className={secondary} onClick={()=>void exportEvents('json')}><Download size={15}/>Export JSON</button></div></div>
    <div className={card+' flex flex-wrap items-center gap-3 p-4'}><label className="relative min-w-52 flex-1"><Search size={17} className="pointer-events-none absolute left-3 top-3 text-slate-400"/><span className="sr-only">Search audit events</span><input type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search by account, event ID, module or masked patient reference…" className="min-h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-xs outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"/></label><label><span className="sr-only">Outcome filter</span><select value={outcome} onChange={event=>setOutcome(event.target.value)} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-xs"><option value="all">All outcomes</option><option value="success">Success</option><option value="denied">Denied</option><option value="generated">Generated</option></select></label><label><span className="sr-only">Action filter</span><select value={action} onChange={event=>setAction(event.target.value)} className="min-h-11 max-w-48 rounded-lg border border-slate-300 bg-white px-3 text-xs"><option value="all">All actions</option>{Array.from(new Set(data?.events.map(event=>event.action)??[])).sort().map(value=><option key={value} value={value}>{actionName(value)}</option>)}</select></label></div>
    {message&&<p role="status" className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-900">{message}</p>}
    <div className={card+' overflow-hidden'}><div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/70 px-5 py-4 text-[11px] text-slate-500"><span>Sortable columns · Times in Monrovia</span><span>{filtered.length.toLocaleString()} matching events in {data?.events.length.toLocaleString()??'—'} loaded{data&&data.total>data.events.length?' · latest 1,000 of '+data.total.toLocaleString()+' total':''}</span></div><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-xs"><thead className="bg-slate-50 text-slate-600"><tr>{[['occurredAt','Timestamp & ID'],['actor','Staff member & current role'],['action','Event & outcome'],['module','Module']].map(([field,label])=><th key={field} className="px-4 py-4 font-semibold" aria-sort={sort.field===field?(sort.ascending?'ascending':'descending'):undefined}><button className="flex items-center gap-1 text-left" onClick={()=>setSort(current=>({field:field as keyof AuditEvent,ascending:current.field===field?!current.ascending:true}))}>{label}{sort.field===field?(sort.ascending?<ArrowUp size={13}/>:<ArrowDown size={13}/>):null}</button></th>)}<th className="px-4 py-4 font-semibold">Patient reference</th><th className="px-4 py-4 font-semibold">Details &amp; source</th></tr></thead><tbody>{displayed.map(event=><tr key={event.id} className="border-t border-slate-100 hover:bg-violet-50/40"><td className="px-4 py-4"><time className="font-mono font-medium" dateTime={event.occurredAt}>{time.format(new Date(event.occurredAt))}</time><p className="mt-1 text-[10px] text-slate-400">{date.format(new Date(event.occurredAt)).split(',')[0]} · {event.id}</p></td><td className="px-4 py-4"><p className="font-semibold text-slate-800">{event.actor}</p><p className="mt-1 font-mono text-[10px] text-slate-400">{event.currentRole??(event.actor.startsWith('patient:')?'Patient portal':event.actor==='unauthenticated'?'Unauthenticated':'Role not retained')}</p></td><td className="px-4 py-4"><p className="font-medium">{actionName(event.action)}</p><span className={'mt-1 inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] '+(event.outcome==='denied'?'border-rose-200 bg-rose-50 text-rose-700':'border-teal-200 bg-teal-50 text-teal-800')}>{event.outcome==='denied'?<AlertCircle size={11}/>:<CheckCircle2 size={11}/>} {event.outcome}</span></td><td className="px-4 py-4 font-mono text-[10px] text-slate-500">{event.module}</td><td className="px-4 py-4 font-mono text-[10px] text-slate-500">{event.patientReference??'—'}</td><td className="px-4 py-4"><p>{event.source}</p><p className="mt-1 text-[10px] text-slate-400">{event.source==='Security ledger'?'Hash-chained security event':'Separate registry audit record'}</p></td></tr>)}</tbody></table></div>{!data&&!loadError&&<p role="status" className="p-8 text-center text-sm text-slate-500">Loading recorded audit events…</p>}{data&&filtered.length===0&&<p className="p-8 text-center text-sm text-slate-500">No recorded events match these filters.</p>}<div className="flex items-center justify-between gap-3 border-t border-slate-200 px-5 py-3 text-xs text-slate-500"><span>Page {currentPage+1} of {pageCount} · 12 events per page</span><div className="flex gap-2"><button className={secondary} disabled={currentPage===0} onClick={()=>setPage(currentPage-1)}>Previous</button><button className={secondary} disabled={currentPage+1>=pageCount} onClick={()=>setPage(currentPage+1)}>Next</button></div></div></div>
    <p className="px-1 text-[11px] leading-5 text-slate-500">Coverage: staff login attempts, audit exports, registry registrations and registry record views since instrumentation began. MFA, emergency overrides and other module actions are not implemented here. Patient references are masked. Exports include up to 10,000 recorded events, independent of the current on-screen filters.</p>
  </section>;
}

function ChartCard({title,subtitle,loaded,empty,children}:{title:string;subtitle:string;loaded:boolean;empty:boolean;children:React.ReactElement}) {
  return <figure className={card+' min-w-0 overflow-hidden p-5'}><figcaption className="text-sm font-bold">{title}</figcaption><p className="mb-4 mt-1 text-xs leading-5 text-slate-500">{subtitle}</p><div className="h-60 min-w-0">{!loaded?<div className="grid h-full place-items-center text-sm text-slate-400">Chart data unavailable until loaded</div>:empty?<div className="grid h-full place-items-center text-sm text-slate-400">No recorded events yet</div>:<ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>}</div></figure>;
}
