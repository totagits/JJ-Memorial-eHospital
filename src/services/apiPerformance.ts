import { ApiPerformanceMetric } from '../types';

type PerformanceListener = (metrics: ApiPerformanceMetric[]) => void;

class ApiPerformanceService {
  private metrics: ApiPerformanceMetric[] = [
    {
      id: 'perf-1',
      endpoint: '/api/v1/patients/search',
      method: 'GET',
      latencyMs: 42,
      status: 200,
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toLocaleTimeString(),
      isError: false,
    },
    {
      id: 'perf-2',
      endpoint: '/api/v1/triage/queue',
      method: 'GET',
      latencyMs: 65,
      status: 200,
      timestamp: new Date(Date.now() - 1000 * 60 * 8).toLocaleTimeString(),
      isError: false,
    },
    {
      id: 'perf-3',
      endpoint: '/api/v1/pharmacy/inventory',
      method: 'GET',
      latencyMs: 110,
      status: 200,
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toLocaleTimeString(),
      isError: false,
    },
    {
      id: 'perf-4',
      endpoint: '/api/v1/blood-bank/units',
      method: 'GET',
      latencyMs: 78,
      status: 200,
      timestamp: new Date(Date.now() - 1000 * 60 * 2).toLocaleTimeString(),
      isError: false,
    },
  ];

  private listeners: Set<PerformanceListener> = new Set();

  public subscribe(listener: PerformanceListener): () => void {
    this.listeners.add(listener);
    listener([...this.metrics]);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn([...this.metrics]));
  }

  public async monitor<T>(
    endpoint: string,
    method: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    let status = 200;
    let isError = false;

    try {
      const result = await requestFn();
      return result;
    } catch (err) {
      status = 500;
      isError = true;
      throw err;
    } finally {
      const duration = Math.round(performance.now() - start);
      const metric: ApiPerformanceMetric = {
        id: `perf-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        endpoint,
        method,
        latencyMs: Math.max(duration, 15),
        status,
        timestamp: new Date().toLocaleTimeString(),
        isError,
      };

      this.metrics.unshift(metric);
      if (this.metrics.length > 50) {
        this.metrics.pop();
      }
      this.notify();
    }
  }

  public getSummary() {
    if (this.metrics.length === 0) {
      return { avgLatency: 0, p95Latency: 0, errorRate: 0, totalCalls: 0, slowCalls: 0 };
    }
    const latencies = this.metrics.map((m) => m.latencyMs).sort((a, b) => a - b);
    const avgLatency = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
    const p95Index = Math.floor(latencies.length * 0.95);
    const p95Latency = latencies[p95Index] || latencies[latencies.length - 1];
    const errors = this.metrics.filter((m) => m.isError).length;
    const errorRate = Number(((errors / this.metrics.length) * 100).toFixed(1));
    const slowCalls = this.metrics.filter((m) => m.latencyMs > 250).length;

    return {
      avgLatency,
      p95Latency,
      errorRate,
      totalCalls: this.metrics.length,
      slowCalls,
    };
  }

  public clear() {
    this.metrics = [];
    this.notify();
  }
}

export const apiPerformanceService = new ApiPerformanceService();
