import { openDB } from 'idb';

const dbPromise = openDB('arogyasetu-offline', 1, {
  upgrade(db) {
    db.createObjectStore('symptoms', { keyPath: 'id', autoIncrement: true });
    db.createObjectStore('appointmentDrafts', { keyPath: 'id', autoIncrement: true });
    db.createObjectStore('reportsMetadata', { keyPath: 'id', autoIncrement: true });
    db.createObjectStore('syncQueue', { keyPath: 'clientOperationId' });
  }
});

export async function queueOfflineRequest(config) {
  const db = await dbPromise;
  await db.put('syncQueue', {
    clientOperationId: crypto.randomUUID(),
    type: `${config.method?.toUpperCase()} ${config.url}`,
    payload: JSON.stringify(config.data || {}),
    updatedAt: new Date().toISOString()
  });
}

export async function drainSyncQueue(api) {
  const db = await dbPromise;
  const all = await db.getAll('syncQueue');
  for (const item of all) {
    const response = await api.post('/offline/sync', item);
    if (response.data.status !== 'CONFLICT') {
      await db.delete('syncQueue', item.clientOperationId);
    }
  }
  return all.length;
}
