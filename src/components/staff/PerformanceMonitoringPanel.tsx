import React, { useState, useEffect } from 'react';
import { apiPerformanceService } from '../../services/apiPerformance';
import { ApiPerformanceMetric } from '../../types';
import { Gauge, Clock, AlertTriangle, CheckCircle2, ShieldCheck, Activity, RefreshCw } from 'lucide-react';

export const PerformanceMonitoringPanel: React.FC = () => {
  const [metrics, setMetrics] = useState<ApiPerformanceMetric[]>([]);

  useEffect(() => {
    return apiPerformanceService.subscribe((list) => {
      setMetrics(list);
    });
  }, []);

  const summary = apiPerformanceService.getSummary();

  const handleTriggerSimulatedApi = async () => {
    await apiPerformanceService.monitor('/api/v1/billing/reconcile-gl', 'POST', async () => {
      // Simulate slight network lag
      const delay = Math.floor(180 + Math.random() * 200);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return { success: true };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <Gauge className="w-3.5 h-3.5" />
            <span>APM Infrastructure & Latency Telemetry</span>
          </div>
          <h2 className="text-2xl font-extrabold text-hospital-navy mt-1">
            API Performance & Latency Monitor
          </h2>
          <p className="text-xs text-slate-500">
            Real-time interceptor logging query latencies, p95 bottlenecks, and error rates to guarantee clinical workstation responsiveness.
          </p>
        </div>

        <button
          onClick={handleTriggerSimulatedApi}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-hospital-navy hover:bg-hospital-navy-light text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
          <span>Test API Latency Benchmark</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400">Average Latency</span>
          <div className="text-2xl font-black text-hospital-navy">
            {summary.avgLatency} <span className="text-xs font-normal text-slate-500">ms</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-600">Sub-150ms Optimal</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400">95th Percentile (p95)</span>
          <div className="text-2xl font-black text-teal-700">
            {summary.p95Latency} <span className="text-xs font-normal text-slate-500">ms</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500">Tail latency baseline</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400">API Error Rate</span>
          <div className="text-2xl font-black text-emerald-600">
            {summary.errorRate}%
          </div>
          <span className="text-[11px] font-bold text-emerald-600">99.9% Uptime SLA</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400">Slow Queries (&gt;250ms)</span>
          <div className="text-2xl font-black text-amber-600">
            {summary.slowCalls}
          </div>
          <span className="text-[11px] font-medium text-slate-500">Bottlenecks identified</span>
        </div>
      </div>

      {/* Monitored Request Stream Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-hospital-navy text-sm">
            Monitored Endpoint Calls ({metrics.length})
          </h4>
          <span className="text-xs text-slate-400 font-mono">Live Interceptor Ring Buffer</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">API Endpoint</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Round-Trip Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {metrics.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-2.5 px-4 text-slate-500">
                    {m.timestamp}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      m.method === 'GET'
                        ? 'bg-blue-100 text-blue-800'
                        : m.method === 'POST'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {m.method}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-bold text-slate-800 font-mono">
                    {m.endpoint}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      m.status === 200 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {m.status} OK
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <span className={`font-bold ${
                      m.latencyMs < 100
                        ? 'text-emerald-600'
                        : m.latencyMs < 250
                        ? 'text-amber-600'
                        : 'text-rose-600'
                    }`}>
                      {m.latencyMs} ms
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
