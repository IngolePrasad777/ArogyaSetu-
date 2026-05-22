import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { drainSyncQueue } from '../utils/offlineDb.js';

export function useOfflineSync() {
  const [synced, setSynced] = useState(0);
  useEffect(() => {
    const sync = async () => {
      if (navigator.onLine) setSynced(await drainSyncQueue(api));
    };
    window.addEventListener('online', sync);
    sync();
    return () => window.removeEventListener('online', sync);
  }, []);
  return { online: navigator.onLine, synced };
}
