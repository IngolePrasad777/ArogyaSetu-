import { useQuery } from '@tanstack/react-query';
import { Search, UsersRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import EmptyState from '../../components/EmptyState.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { api } from '../../services/api.js';
import { formatDateTime, roleLabel, roleTone, statusTone } from '../../utils/adminWorkspace.js';

export default function Users() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const users = useQuery({ queryKey: ['admin-users'], queryFn: async () => (await api.get('/admin/users')).data });
  const filteredUsers = useMemo(() => (users.data || []).filter((user) => {
    const matchesSearch = `${user.email} ${user.role}`.toLowerCase().includes(search.toLowerCase());
    const matchesRole = role === 'ALL' || user.role === role;
    const matchesStatus = status === 'ALL' || (status === 'ENABLED' ? user.enabled : !user.enabled);
    return matchesSearch && matchesRole && matchesStatus;
  }), [users.data, search, role, status]);

  return (
    <div>
      <PageHeader title="User Management" eyebrow="Admin controls">
        Monitor registered patients, doctors, assistants, and administrators without exposing internal identifiers.
      </PageHeader>

      <section className="card mb-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
          <label>
            <span className="text-sm font-semibold text-slate-600">Search users</span>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-3 top-3.5 text-slate-400" size={18} />
              <input className="input pl-10" placeholder="Search by email or role" value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
          </label>
          <label>
            <span className="text-sm font-semibold text-slate-600">Role</span>
            <select className="input mt-2" value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="ALL">All roles</option>
              <option value="PATIENT">Patients</option>
              <option value="DOCTOR">Doctors</option>
              <option value="ADMIN">Admins</option>
            </select>
          </label>
          <label>
            <span className="text-sm font-semibold text-slate-600">Status</span>
            <select className="input mt-2" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="ALL">All status</option>
              <option value="ENABLED">Enabled</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </label>
        </div>
      </section>

      <section className="card overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <h2 className="section-title">Registered Accounts</h2>
          <span className="pill"><UsersRound size={15} /> {filteredUsers.length} shown</span>
        </div>
        {!filteredUsers.length && <div className="p-4"><EmptyState title="No users match these filters" /></div>}
        {!!filteredUsers.length && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Consent</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr className="hover:bg-slate-50" key={user.id}>
                    <td className="px-4 py-3 font-semibold text-slate-900">{user.email}</td>
                    <td className="px-4 py-3"><span className={`rounded-full border px-3 py-1 text-xs font-bold ${roleTone(user.role)}`}>{roleLabel(user.role)}</span></td>
                    <td className="px-4 py-3"><span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusTone(user.enabled)}`}>{user.enabled ? 'Enabled' : 'Disabled'}</span></td>
                    <td className="px-4 py-3 text-slate-600">{user.consentAccepted ? 'Accepted' : 'Missing'}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDateTime(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
