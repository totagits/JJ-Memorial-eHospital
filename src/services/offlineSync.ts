// Background Sync Service for Offline-Resilient EMR Operations

export type SyncState = 'online' | 'offline' | 'syncing';

export interface QueuedSyncItem {
  id: string;
  entityType: 'vital' | 'triage' | 'prescription' | 'lab_result' | 'consent' | 'feedback' | 'invoice';
  action: 'create' | 'update';
  payload: any;
  timestamp: string;
  retryCount: number;
}

type SyncListener = (state: SyncState, queueCount: number) => void;

class OfflineSyncService {
  private state: SyncState = typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'online';
  private queue: QueuedSyncItem[] = [];
  private listeners: Set<SyncListener> = new Set();
  private syncTimer: any = null;

  constructor() {
    this.loadQueue();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
    }
  }

  private loadQueue() {
    try {
      const saved = localStorage.getItem('jj_offline_sync_queue');
      if (saved) {
        this.queue = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse offline sync queue:', e);
      this.queue = [];
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem('jj_offline_sync_queue', JSON.stringify(this.queue));
    } catch (e) {
      console.error('Failed to persist sync queue:', e);
    }
    this.notify();
  }

  private handleNetworkChange(isOnline: boolean) {
    if (isOnline) {
      if (this.queue.length > 0) {
        this.processQueue();
      } else {
        this.state = 'online';
        this.notify();
      }
    } else {
      this.state = 'offline';
      this.notify();
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.state, this.queue.length);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.state, this.queue.length));
  }

  public enqueue(entityType: QueuedSyncItem['entityType'], action: 'create' | 'update', payload: any): string {
    const item: QueuedSyncItem = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      entityType,
      action,
      payload,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };
    this.queue.push(item);
    this.saveQueue();

    // If online, trigger background process right away
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      this.processQueue();
    }
    return item.id;
  }

  public async processQueue(): Promise<void> {
    if (this.queue.length === 0) {
      this.state = typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'online';
      this.notify();
      return;
    }

    this.state = 'syncing';
    this.notify();

    // Simulate reliable batch synchronization to primary hospital database
    return new Promise((resolve) => {
      if (this.syncTimer) clearTimeout(this.syncTimer);
      this.syncTimer = setTimeout(() => {
        // Successfully synced records
        const syncedCount = this.queue.length;
        console.log(`[OfflineSyncService] Successfully synchronized ${syncedCount} cached EMR transactions.`);
        this.queue = [];
        this.saveQueue();
        this.state = typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'online';
        this.notify();
        resolve();
      }, 1400); // realistic network push duration showing the pulse
    });
  }

  public getQueue(): QueuedSyncItem[] {
    return [...this.queue];
  }

  public getState(): SyncState {
    return this.state;
  }

  public setSimulatedState(state: SyncState) {
    this.state = state;
    this.notify();
    if (state === 'online' && this.queue.length > 0) {
      this.processQueue();
    }
  }
}

export const offlineSyncService = new OfflineSyncService();
