import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Wifi } from 'lucide-react';
import EmptyState from '../../components/EmptyState.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { getSyncQueue } from '../../utils/offlineDb.js';

const placeholders = [
  { clientOperationId: 'symptoms-local', type: 'Symptoms pending sync', payload: 'Saved locally when offline', updatedAt: new Date().toISOString(), status: 'SYNCED' },
  { clientOperationId: 'reports-local', type: 'Reports pending', payload: 'No pending uploads', updatedAt: new Date().toISOString(), status: 'SYNCED' },
  { clientOperationId: 'appointments-local', type: 'Appointments pending', payload: 'No pending appointment drafts', updatedAt: new Date().toISOString(), status: 'SYNCED' }
];

export default function PatientOfflineQueue() {
  const queue = useQuery({ queryKey: ['offline-queue'], queryFn: getSyncQueue });
  const rows = queue.data?.length ? queue.data.map((item) => ({ ...item, status: navigator.onLine ? 'PENDING SYNC' : 'OFFLINE SAVED' })) : placeholders;

  return (
    <div>
      <PageHeader title="Offline Queue" eyebrow="IndexedDB sync">
        Review local symptoms, report uploads, and appointment requests waiting for sync.
      </PageHeader>
      <section className="card">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="section-title">Pending Operations</h2>
          <span className="pill"><Wifi size={15} /> {navigator.onLine ? 'Online' : 'Offline'}</span>
        </div>
        {!rows.length && <EmptyState title="No offline items" />}
        <div className="grid gap-3">
          {rows.map((item) => (
            <article className="rounded-md border border-slate-200 bg-slate-50 p-4" key={item.clientOperationId}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold text-slate-950">{item.type}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.payload}</p>
                </div>
                <span className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">{item.status}</span>
              </div>
            </article>
          ))}
        </div>
        <button className="btn-secondary mt-4" type="button"><RefreshCw size={18} /> Sync now</button>
      </section>
    </div>
  );
}
