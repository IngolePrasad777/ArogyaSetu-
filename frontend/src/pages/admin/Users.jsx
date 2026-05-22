import { useQuery } from '@tanstack/react-query';
import EmptyState from '../../components/EmptyState.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { api } from '../../services/api.js';

export default function Users() {
  const users = useQuery({ queryKey: ['admin-users'], queryFn: async () => (await api.get('/admin/users')).data });
  return (
    <div>
      <PageHeader title="User Management" eyebrow="Admin controls">
        Monitor registered patients, doctors, assistants, and administrators.
      </PageHeader>
      <div className="space-y-3">
      {!users.data?.length && <EmptyState title="No users found" />}
      {users.data?.map((u) => (
        <div className="card flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between" key={u.id}>
          <div>
            <p className="font-semibold text-slate-900">{u.email}</p>
            <p className="text-sm text-slate-500">{u.id}</p>
          </div>
          <div className="flex gap-2"><span className="pill">{u.role}</span><span className="pill">{u.enabled ? 'Enabled' : 'Disabled'}</span></div>
        </div>
      ))}
      </div>
    </div>
  );
}
