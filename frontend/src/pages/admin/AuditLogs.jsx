import { useQuery } from '@tanstack/react-query';
import { FileText, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import EmptyState from '../../components/EmptyState.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { api } from '../../services/api.js';
import { actionTone, formatDateTime } from '../../utils/adminWorkspace.js';

export default function AuditLogs() {
  const [search, setSearch] = useState('');
  const [resource, setResource] = useState('ALL');
  const logs = useQuery({ queryKey: ['audit-logs'], queryFn: async () => (await api.get('/admin/audit-logs')).data });
  const resources = useMemo(() => ['ALL', ...new Set((logs.data || []).map((log) => log.resourceType || 'System'))], [logs.data]);
  const filteredLogs = useMemo(() => (logs.data || []).filter((log) => {
    const text = `${log.action} ${log.actorEmail} ${log.resourceType}`.toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesResource = resource === 'ALL' || (log.resourceType || 'System') === resource;
    return matchesSearch && matchesResource;
  }), [logs.data, search, resource]);

  return (
    <div>
      <PageHeader title="Audit Logs" eyebrow="Sensitive activity">
        Review authentication, EHR, appointment, triage, consultation, and admin events.
      </PageHeader>

      <section className="card mb-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
          <label>
            <span className="text-sm font-semibold text-slate-600">Search logs</span>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-3 top-3.5 text-slate-400" size={18} />
              <input className="input pl-10" placeholder="Search action, actor, or resource" value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
          </label>
          <label>
            <span className="text-sm font-semibold text-slate-600">Resource</span>
            <select className="input mt-2" value={resource} onChange={(event) => setResource(event.target.value)}>
              {resources.map((item) => <option value={item} key={item}>{item === 'ALL' ? 'All resources' : item}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="space-y-3">
        {!filteredLogs.length && <EmptyState title="No audit events match these filters" />}
        {filteredLogs.map((log) => (
          <article className="card" key={log.auditId}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <span className={`w-fit rounded-full border px-3 py-1 text-xs font-bold ${actionTone(log.action)}`}>{log.action}</span>
                <p className="mt-3 font-semibold text-slate-900">{log.actorEmail || 'System actor'}</p>
              </div>
              <span className="pill"><FileText size={15} /> {formatDateTime(log.createdAt)}</span>
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <div><dt className="font-semibold text-slate-500">Resource</dt><dd className="text-slate-900">{log.resourceType || 'System'}</dd></div>
              <div><dt className="font-semibold text-slate-500">Resource Ref</dt><dd className="text-slate-900">{log.resourceId ? 'Recorded' : '-'}</dd></div>
              <div><dt className="font-semibold text-slate-500">Event Time</dt><dd className="text-slate-900">{formatDateTime(log.createdAt)}</dd></div>
            </dl>
          </article>
        ))}
      </section>
    </div>
  );
}
