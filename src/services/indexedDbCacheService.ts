/**
 * IndexedDB Local Offline Caching & Synchronization Service
 * Enables full offline EMR access for clinical staff at VOA East Community facility
 * during internet interruptions and power outages.
 */

import { AppDatabaseState, getDatabaseState, saveState } from './storageService';

const DB_NAME = 'JJMemorial_EMR_OfflineCache';
const DB_VERSION = 1;

export interface OfflineCacheStats {
  isIndexedDbSupported: boolean;
  isOnline: boolean;
  lastCachedTimestamp: string | null;
  patientCount: number;
  encounterCount: number;
  vitalCount: number;
  inventoryCount: number;
  pendingSyncCount: number;
}

class IndexedDbCacheService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase | null> | null = null;

  constructor() {
    this.initPromise = this.initDB();
  }

  private async initDB(): Promise<IDBDatabase | null> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('IndexedDB not supported in this environment');
      return null;
    }

    return new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Key-Value store for entire state snapshot
        if (!db.objectStoreNames.contains('stateSnapshot')) {
          db.createObjectStore('stateSnapshot', { keyPath: 'id' });
        }

        // Entity stores for direct indexed querying offline
        if (!db.objectStoreNames.contains('patients')) {
          const patientStore = db.createObjectStore('patients', { keyPath: 'id' });
          patientStore.createIndex('mrn', 'mrn', { unique: true });
          patientStore.createIndex('phone', 'phone', { unique: false });
        }

        if (!db.objectStoreNames.contains('encounters')) {
          const encStore = db.createObjectStore('encounters', { keyPath: 'id' });
          encStore.createIndex('patientId', 'patientId', { unique: false });
        }

        if (!db.objectStoreNames.contains('vitals')) {
          const vitStore = db.createObjectStore('vitals', { keyPath: 'id' });
          vitStore.createIndex('patientId', 'patientId', { unique: false });
        }

        if (!db.objectStoreNames.contains('inventory')) {
          db.createObjectStore('inventory', { keyPath: 'id' });
        }

        // Offline write mutations queue
        if (!db.objectStoreNames.contains('offlineMutationsQueue')) {
          db.createObjectStore('offlineMutationsQueue', { keyPath: 'id', autoIncrement: true });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onerror = () => {
        console.error('Failed to open IndexedDB for offline EMR caching');
        resolve(null);
      };
    });
  }

  /**
   * Persist complete database state into IndexedDB
   */
  public async cacheStateToIndexedDB(state: AppDatabaseState): Promise<boolean> {
    const db = this.db || await this.initPromise;
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(['stateSnapshot', 'patients', 'encounters', 'vitals', 'inventory'], 'readwrite');
        
        // 1. Save state snapshot
        const snapshotStore = tx.objectStore('stateSnapshot');
        snapshotStore.put({
          id: 'CURRENT_SNAPSHOT',
          timestamp: new Date().toISOString(),
          state
        });

        // 2. Refresh entity stores for offline indexing
        const patientStore = tx.objectStore('patients');
        state.patients.forEach(p => patientStore.put(p));

        const encStore = tx.objectStore('encounters');
        state.encounters.forEach(e => encStore.put(e));

        const vitStore = tx.objectStore('vitals');
        state.vitals.forEach(v => vitStore.put(v));

        const invStore = tx.objectStore('inventory');
        state.inventory.forEach(i => invStore.put(i));

        tx.oncomplete = () => {
          resolve(true);
        };

        tx.onerror = () => {
          resolve(false);
        };
      } catch (err) {
        console.error('Error writing to IndexedDB offline cache:', err);
        resolve(false);
      }
    });
  }

  /**
   * Retrieve state from IndexedDB when network or memory fails
   */
  public async loadStateFromIndexedDB(): Promise<AppDatabaseState | null> {
    const db = this.db || await this.initPromise;
    if (!db) return null;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction('stateSnapshot', 'readonly');
        const store = tx.objectStore('stateSnapshot');
        const req = store.get('CURRENT_SNAPSHOT');

        req.onsuccess = () => {
          if (req.result && req.result.state) {
            resolve(req.result.state);
          } else {
            resolve(null);
          }
        };

        req.onerror = () => {
          resolve(null);
        };
      } catch {
        resolve(null);
      }
    });
  }

  /**
   * Get current cache stats for UI telemetry
   */
  public async getCacheStats(): Promise<OfflineCacheStats> {
    const state = getDatabaseState();
    return {
      isIndexedDbSupported: typeof window !== 'undefined' && !!window.indexedDB,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      lastCachedTimestamp: state.lastBackupDate || new Date().toISOString(),
      patientCount: state.patients.length,
      encounterCount: state.encounters.length,
      vitalCount: state.vitals.length,
      inventoryCount: state.inventory.length,
      pendingSyncCount: state.downtimeRecords.filter(r => r.reconciliationStatus === 'PENDING_RECONCILIATION').length,
    };
  }
}

export const indexedDbCache = new IndexedDbCacheService();
