import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../components/PageHeader.jsx';
import { api } from '../../services/api.js';

export default function AuditLogs() {
  const logs = useQuery({ queryKey: ['audit-logs'], queryFn: async () => (await api.get('/admin/audit-logs')).data });
  return (
    <div>
      <PageHeader title="Audit Logs" eyebrow="Sensitive activity">
        Review authentication, EHR, appointment, triage, and consultation events.
      </PageHeader>
      <div className="space-y-3">
      {logs.data?.map((log) => (
        <div className="card" key={log.auditId}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold text-slate-900">{log.action}</p>
            <span className="pill">{new Date(log.createdAt).toLocaleString()}</span>
          </div>
          <p className="mt-2 text-sm text-slate-500">{log.actorEmail} · {log.resourceType || 'System'}</p>
        </div>
      ))}
      </div>
    </div>
  );
}
