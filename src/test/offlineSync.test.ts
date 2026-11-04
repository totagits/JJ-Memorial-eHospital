import { describe, it, expect } from 'vitest';
import { offlineSyncService } from '../services/offlineSync';

describe('Background Offline Sync Service', () => {
  it('enqueues transactions during offline or poor connectivity', () => {
    const syncId = offlineSyncService.enqueue('vital', 'create', {
      systolic: 120,
      diastolic: 80,
      heartRate: 72,
    });
    expect(syncId).toContain('sync-');
    expect(offlineSyncService.getQueue().length).toBeGreaterThanOrEqual(1);
  });

  it('updates state machine from offline to syncing and pushes to server', async () => {
    offlineSyncService.setSimulatedState('offline');
    expect(offlineSyncService.getState()).toBe('offline');

    // Add item while offline
    offlineSyncService.enqueue('triage', 'create', { patientName: 'Test Patient', urgency: 'Red' });

    // Transition to online should trigger processQueue
    offlineSyncService.setSimulatedState('online');
    expect(offlineSyncService.getState()).toBe('syncing');

    // Wait for batch processing
    await offlineSyncService.processQueue();
    expect(offlineSyncService.getQueue().length).toBe(0);
  });
});
