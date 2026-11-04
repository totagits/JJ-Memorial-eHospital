import { describe, it, expect } from 'vitest';
import { apiPerformanceService } from '../services/apiPerformance';

describe('API Performance Monitoring Wrapper', () => {
  it('measures request latency and logs metric entry', async () => {
    const data = await apiPerformanceService.monitor('/api/v1/test', 'GET', async () => {
      await new Promise((r) => setTimeout(r, 20));
      return { ok: true };
    });

    expect(data.ok).toBe(true);
    const summary = apiPerformanceService.getSummary();
    expect(summary.totalCalls).toBeGreaterThan(0);
    expect(summary.avgLatency).toBeGreaterThan(0);
  });
});
